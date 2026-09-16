// POST /api/assets/set-primary-logo
// Marks an uploaded image as the primary brand logo for style-guide embedding.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseServer } from "@/lib/supabase";
import {
  isBlueprintLogoTier,
  isImageMimeType,
} from "@/lib/brandLogo";
import { clearOtherPrimaryLogos } from "@/lib/brandLogoServer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = await apiGuard(req, { routeId: "assets-set-primary-logo", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = (await req.json()) as {
      email?: string;
      tier?: string;
      assetId?: string;
    };

    const claimedEmail = typeof body.email === "string" ? body.email : null;
    const tier = typeof body.tier === "string" ? body.tier : null;
    const assetId = typeof body.assetId === "string" ? body.assetId.trim() : "";

    if (!isBlueprintLogoTier(tier) || !assetId) {
      return NextResponse.json(
        { error: "Missing valid tier or assetId. Logo marking is Blueprint™ / Blueprint+™ only." },
        { status: 400 }
      );
    }

    const { isValidUUID } = await import("@/lib/security/inputValidation");
    if (!isValidUUID(assetId)) {
      return NextResponse.json({ error: "Invalid assetId." }, { status: 400 });
    }

    const { requireVerifiedEmail } = await import("@/lib/reportAccess");
    const auth = requireVerifiedEmail(req, claimedEmail);
    if ("error" in auth) return auth.error;

    const sb = supabaseServer();
    const { data: asset, error } = await sb
      .from("brand_asset_uploads")
      .select("id, file_name, file_type, asset_category, user_email, tier")
      .eq("id", assetId)
      .eq("user_email", auth.email)
      .eq("tier", tier)
      .single();

    if (error || !asset) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    const row = asset as {
      id: string;
      file_name: string;
      file_type: string;
      asset_category: string;
    };

    if (!isImageMimeType(row.file_type)) {
      return NextResponse.json(
        { error: "Only image files can be set as the primary logo." },
        { status: 400 }
      );
    }

    await clearOtherPrimaryLogos(auth.email, tier, row.id);

    const { data: updated, error: updateError } = await (sb.from("brand_asset_uploads") as any)
      .update({ asset_category: "logo" })
      .eq("id", row.id)
      .eq("user_email", auth.email)
      .select("id, file_name, file_type, file_size, asset_category, created_at")
      .single();

    if (updateError) {
      logger.error("[Set Primary Logo] Update failed", {
        error: updateError instanceof Error ? updateError.message : String(updateError),
      });
      return NextResponse.json({ error: "Failed to set primary logo." }, { status: 500 });
    }

    return NextResponse.json({ success: true, asset: updated });
  } catch (err) {
    logger.error("[Set Primary Logo] Unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
