// GET /api/refresh-eligibility?email=xxx
// Returns refresh eligibility for the user: whether they can refresh,
// if it's free or paid, remaining count, brand lock info, and expiration.

import { NextRequest, NextResponse } from "next/server";
import { checkRefreshEligibility } from "@/lib/refreshEntitlements";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "refresh-eligibility", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const email = req.nextUrl.searchParams.get("email");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const eligibility = await checkRefreshEligibility(email.toLowerCase());
    return NextResponse.json(eligibility, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (err) {
    console.error("[Refresh Eligibility]", err);
    return NextResponse.json({ error: "Unable to check eligibility." }, { status: 500 });
  }
}
