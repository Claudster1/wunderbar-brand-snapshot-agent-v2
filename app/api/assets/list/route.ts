// GET /api/assets/list?email=xxx&tier=yyy
// Returns uploaded assets for a user + tier, plus remaining upload slots.
// Image rows include a short-lived preview_url (never exposes storage_path).

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseServer } from "@/lib/supabase";
import { mapSignedPreviewUrls } from "@/lib/assets/brandAssetPaths";
import { ASSET_TIER_LIMITS } from "@/lib/assets/assetTierLimits";

export const dynamic = "force-dynamic";

const PREVIEW_TTL_SECONDS = 600;

type AssetRow = {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  asset_category: string;
  created_at: string;
  storage_path: string;
};

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = await apiGuard(req, { routeId: "assets-list", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const claimedEmail = req.nextUrl.searchParams.get("email");
  const tier = req.nextUrl.searchParams.get("tier");

  if (!tier || !(tier in ASSET_TIER_LIMITS)) {
    return jsonNoStore({ error: "Missing email or valid tier" }, 400);
  }

  const { requireVerifiedEmail } = await import("@/lib/reportAccess");
  const auth = requireVerifiedEmail(req, claimedEmail);
  if ("error" in auth) return auth.error;

  const maxFiles = ASSET_TIER_LIMITS[tier as keyof typeof ASSET_TIER_LIMITS].maxFiles;
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("brand_asset_uploads")
    .select("id, file_name, file_type, file_size, asset_category, created_at, storage_path")
    .eq("user_email", auth.email)
    .eq("tier", tier)
    .order("created_at", { ascending: true })
    .limit(maxFiles);

  if (error) {
    logger.error("[Asset List]", { error: error instanceof Error ? error.message : String(error) });
    return jsonNoStore({ error: "Failed to fetch assets." }, 500);
  }

  const rows = (data || []) as AssetRow[];
  const imagePaths = [
    ...new Set(
      rows
        .filter(
          (r) =>
            r.file_type.startsWith("image/") &&
            r.storage_path &&
            !r.storage_path.includes("..")
        )
        .map((r) => r.storage_path)
    ),
  ];

  let previewByPath = new Map<string, string>();
  if (imagePaths.length > 0) {
    try {
      const { data: signed, error: signErr } = await sb.storage
        .from("brand-assets")
        .createSignedUrls(imagePaths, PREVIEW_TTL_SECONDS);
      if (signErr) {
        logger.warn("[Asset List] Preview signing error", {
          error: signErr instanceof Error ? signErr.message : String(signErr),
        });
      } else {
        previewByPath = mapSignedPreviewUrls(imagePaths, signed);
      }
    } catch (signCatch) {
      logger.warn("[Asset List] Preview signing skipped", {
        error: signCatch instanceof Error ? signCatch.message : String(signCatch),
      });
    }
  }

  const assets = rows.map(({ storage_path, ...rest }) => ({
    ...rest,
    preview_url: rest.file_type.startsWith("image/")
      ? previewByPath.get(storage_path) ?? null
      : null,
  }));

  return jsonNoStore({
    assets,
    maxFiles,
    remaining: Math.max(0, maxFiles - assets.length),
  });
}
