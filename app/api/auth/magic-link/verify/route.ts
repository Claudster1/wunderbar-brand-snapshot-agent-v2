// GET /api/auth/magic-link/verify?token=...
// Validates a magic-link token, issues the verified-email session cookie, and
// redirects to the (same-site) post-login destination.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { verifyMagicLinkToken } from "@/lib/auth/magicLink";
import {
  createSessionToken,
  sessionCookieOptions,
  VERIFIED_SESSION_COOKIE,
} from "@/lib/auth/session";
import { publicSnapshotAppUrl } from "@/lib/publicSnapshotAppUrl";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const result = verifyMagicLinkToken(token);

  if (!result.valid || !result.email) {
    logger.warn("[Magic Link Verify] Invalid token", { reason: result.reason });
    return NextResponse.redirect(publicSnapshotAppUrl("/access?error=link_invalid"));
  }

  const sessionToken = createSessionToken(result.email);
  if (!sessionToken) {
    logger.error("[Magic Link Verify] Cannot issue session — secret not configured");
    return NextResponse.redirect(publicSnapshotAppUrl("/access?error=session_unavailable"));
  }

  const destination = publicSnapshotAppUrl(result.redirect || "/dashboard");
  const res = NextResponse.redirect(destination);
  res.cookies.set(VERIFIED_SESSION_COOKIE, sessionToken, sessionCookieOptions());
  return res;
}
