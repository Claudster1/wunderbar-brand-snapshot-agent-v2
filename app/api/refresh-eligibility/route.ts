// GET /api/refresh-eligibility?email=xxx
// Returns refresh eligibility for the user: whether they can refresh,
// if it's free or paid, remaining count, brand lock info, and expiration.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { checkRefreshEligibility } from "@/lib/refreshEntitlements";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "refresh-eligibility", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const claimedEmail = req.nextUrl.searchParams.get("email");

  const { requireVerifiedEmail } = await import("@/lib/reportAccess");
  const auth = requireVerifiedEmail(req, claimedEmail);
  if ("error" in auth) return auth.error;

  try {
    const eligibility = await checkRefreshEligibility(auth.email);
    return NextResponse.json(eligibility, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (err) {
    logger.error("[Refresh Eligibility]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Unable to check eligibility." }, { status: 500 });
  }
}
