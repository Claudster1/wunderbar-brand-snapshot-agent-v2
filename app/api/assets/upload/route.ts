// POST /api/assets/upload
// Handles marketing asset uploads for Blueprint/Blueprint+ diagnostics.
// Stores files in Supabase Storage (brand-assets bucket) and tracks metadata.
// SECURITY: Requires verified email session; storage paths are sanitized.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseServer } from "@/lib/supabase";
import { randomUUID } from "crypto";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";
import { isValidEmail, isValidUUID } from "@/lib/security/inputValidation";
import {
  isBlueprintLogoTier,
} from "@/lib/brandLogo";
import { clearOtherPrimaryLogos } from "@/lib/brandLogoServer";
import {
  buildBrandAssetStoragePath,
  categorizeUploadedAsset,
} from "@/lib/assets/brandAssetPaths";
import { ASSET_TIER_LIMITS } from "@/lib/assets/assetTierLimits";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  const guard = await apiGuard(req, {
    routeId: "assets-upload",
    rateLimit: GENERAL_RATE_LIMIT,
    maxBodySize: 25_000_000,
  });
  if (!guard.passed) return guard.errorResponse;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const claimedEmail = formData.get("email") as string | null;
    const tier = formData.get("tier") as string | null;
    const sessionIdRaw = formData.get("sessionId") as string | null;

    if (!file || !tier) {
      return NextResponse.json(
        { error: "Missing required fields: file, tier" },
        { status: 400 }
      );
    }

    const { requireVerifiedEmail } = await import("@/lib/reportAccess");
    const auth = requireVerifiedEmail(req, claimedEmail);
    if ("error" in auth) return auth.error;

    if (!isValidEmail(auth.email)) {
      return NextResponse.json({ error: "Invalid session email." }, { status: 400 });
    }

    if (!isBlueprintLogoTier(tier) || !(tier in ASSET_TIER_LIMITS)) {
      return NextResponse.json(
        { error: "Asset uploads are available for Blueprint™ and Blueprint+™ only." },
        { status: 403 }
      );
    }

    const tierConfig = ASSET_TIER_LIMITS[tier];

    if (!file.type || !tierConfig.allowedTypes.includes(file.type)) {
      const allowed =
        tier === "blueprint" ? "images and PDFs" : "images, PDFs, PPTX, and DOCX files";
      return NextResponse.json(
        {
          error: `File type not allowed. ${
            tier === "blueprint" ? "Blueprint™" : "Blueprint+™"
          } accepts ${allowed}.`,
        },
        { status: 400 }
      );
    }

    if (!file.size || file.size <= 0) {
      return NextResponse.json({ error: "Empty files are not allowed." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20 MB." },
        { status: 400 }
      );
    }

    // sessionId is optional; only accept UUIDs (blocks path injection). Non-UUID preview ids → "direct".
    let sessionId: string | null = null;
    if (typeof sessionIdRaw === "string" && sessionIdRaw.trim()) {
      const trimmed = sessionIdRaw.trim();
      if (isValidUUID(trimmed)) {
        sessionId = trimmed;
      }
    }

    const sb = supabaseServer();
    const email = auth.email;

    const { count } = (await sb
      .from("brand_asset_uploads")
      .select("id", { count: "exact", head: true })
      .eq("user_email", email)
      .eq("tier", tier)) as { count: number | null };

    if ((count ?? 0) >= tierConfig.maxFiles) {
      return NextResponse.json(
        {
          error: `Upload limit reached. ${
            tier === "blueprint" ? "Blueprint™" : "Blueprint+™"
          } allows up to ${tierConfig.maxFiles} assets.`,
        },
        { status: 400 }
      );
    }

    const fileId = randomUUID();
    const storagePath = buildBrandAssetStoragePath({
      email,
      sessionId,
      fileId,
      mimeType: file.type,
      fileName: file.name,
    });

    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      return NextResponse.json({ error: "Empty files are not allowed." }, { status: 400 });
    }

    const { error: uploadError } = await sb.storage.from("brand-assets").upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      logger.error("[Asset Upload] Storage error", {
        error: uploadError instanceof Error ? uploadError.message : String(uploadError),
      });
      return NextResponse.json(
        { error: "Failed to upload file. Please try again." },
        { status: 500 }
      );
    }

    const category = categorizeUploadedAsset(file.name, file.type);
    const safeFileName = file.name.replace(/[<>\u0000]/g, "").slice(0, 255) || "upload";

    const { data: record, error: dbError } = await (sb.from("brand_asset_uploads") as any)
      .insert({
        user_email: email,
        session_id: sessionId,
        tier,
        file_name: safeFileName,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        asset_category: category,
      })
      .select("id, file_name, file_type, file_size, asset_category, created_at")
      .single();

    if (dbError) {
      logger.error("[Asset Upload] DB error", {
        error: dbError instanceof Error ? dbError.message : String(dbError),
      });
      await sb.storage.from("brand-assets").remove([storagePath]);
      return NextResponse.json({ error: "Failed to save upload record." }, { status: 500 });
    }

    if (category === "logo" && record?.id) {
      try {
        await clearOtherPrimaryLogos(email, tier, record.id);
      } catch (clearErr) {
        logger.error("[Asset Upload] Failed to clear prior primary logos", {
          error: clearErr instanceof Error ? clearErr.message : String(clearErr),
        });
      }
    }

    return NextResponse.json({
      success: true,
      asset: record,
      remaining: tierConfig.maxFiles - ((count ?? 0) + 1),
    });
  } catch (err) {
    logger.error("[Asset Upload] Unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
