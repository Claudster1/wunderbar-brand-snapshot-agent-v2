// GET /api/assets/logo?email=xxx&tier=blueprint|blueprint-plus
// Returns a signed URL for the user's primary logo image, if one was uploaded/marked.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { isBlueprintLogoTier } from "@/lib/brandLogo";
import { getPrimaryBrandLogo } from "@/lib/brandLogoServer";
import { isHttpsImageUrl } from "@/lib/assets/brandAssetPaths";

export const dynamic = "force-dynamic";

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function GET(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = await apiGuard(req, { routeId: "assets-logo", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const claimedEmail = req.nextUrl.searchParams.get("email");
  const tier = req.nextUrl.searchParams.get("tier");

  if (!isBlueprintLogoTier(tier)) {
    return jsonNoStore(
      { error: "Logo embedding is available for Blueprint™ and Blueprint+™ only.", logo: null },
      400
    );
  }

  const { requireVerifiedEmail } = await import("@/lib/reportAccess");
  const auth = requireVerifiedEmail(req, claimedEmail);
  if ("error" in auth) return auth.error;

  try {
    // Short TTL for UI embeds; PDF generation uses a longer TTL via getPrimaryBrandLogo directly.
    const logo = await getPrimaryBrandLogo(auth.email, tier, 900);
    if (!logo || !isHttpsImageUrl(logo.signedUrl)) {
      return jsonNoStore({ logo: null });
    }
    return jsonNoStore({
      logo: {
        id: logo.id,
        fileName: logo.fileName,
        fileType: logo.fileType,
        url: logo.signedUrl,
      },
    });
  } catch (err) {
    logger.error("[Asset Logo]", { error: err instanceof Error ? err.message : String(err) });
    return jsonNoStore({ error: "Failed to resolve logo.", logo: null }, 500);
  }
}
