// GET /api/access/claim?token=...
// Redeem a post-purchase email access link: verified session + fresh chat tier token.

import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  VERIFIED_SESSION_COOKIE,
} from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import { verifyPurchaseAccessToken } from "@/lib/security/purchaseAccessLink";
import { createTierToken } from "@/lib/security/tierToken";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = await apiGuard(req, { routeId: "access-claim", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const token = req.nextUrl.searchParams.get("token");
  const verified = verifyPurchaseAccessToken(token);
  if (!verified.valid) {
    logger.warn("[Access Claim] Invalid purchase access token", { reason: verified.reason });
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://app.wunderbrand.ai";
    return NextResponse.redirect(
      new URL(`/dashboard?access=expired&reason=${encodeURIComponent(verified.reason)}`, base),
      303,
    );
  }

  const tierToken = createTierToken(verified.tier, verified.email);
  const params = new URLSearchParams({
    tier: verified.tier,
    token: tierToken,
  });
  if (verified.firstName) params.set("name", verified.firstName);

  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://app.wunderbrand.ai";
  const dest = new URL(`/?${params.toString()}`, base);

  const response = NextResponse.redirect(dest, 303);
  const sessionTok = createSessionToken(verified.email);
  if (sessionTok) {
    response.cookies.set(VERIFIED_SESSION_COOKIE, sessionTok, sessionCookieOptions());
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
