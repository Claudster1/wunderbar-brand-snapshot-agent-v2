// POST /api/assets/analyze
// Analyzes uploaded marketing assets using AI vision/text extraction.
// Requires verified session (owner). Report generation calls analyzeBrandAssets directly.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { analyzeBrandAssets } from "@/lib/assets/analyzeBrandAssets";
import { isBlueprintLogoTier } from "@/lib/brandLogo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AI_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = await apiGuard(req, { routeId: "assets-analyze", rateLimit: AI_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = (await req.json()) as {
      email?: string;
      tier?: string;
      brandContext?: Record<string, unknown>;
    };

    const claimedEmail = typeof body.email === "string" ? body.email : null;
    const tier = typeof body.tier === "string" ? body.tier : null;

    if (!isBlueprintLogoTier(tier)) {
      return NextResponse.json(
        { error: "Asset analysis is available for Blueprint™ and Blueprint+™ only." },
        { status: 403 }
      );
    }

    const { requireVerifiedEmail } = await import("@/lib/reportAccess");
    const auth = requireVerifiedEmail(req, claimedEmail);
    if ("error" in auth) return auth.error;

    const result = await analyzeBrandAssets({
      email: auth.email,
      tier,
      brandContext: body.brandContext as any,
    });

    return NextResponse.json(result);
  } catch (err) {
    logger.error("[Asset Analyze]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}
