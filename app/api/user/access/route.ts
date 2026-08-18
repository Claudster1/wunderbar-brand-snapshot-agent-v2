// app/api/user/access/route.ts
// API route to get user product access.
// SECURITY: Rate-limited and verified-session gated to prevent enumeration.

import { NextResponse } from "next/server";
import { getUserProductAccess } from "@/lib/getUserProductAccess";
import { apiGuard } from "@/lib/security/apiGuard";
import { AUTH_RATE_LIMIT } from "@/lib/security/rateLimit";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  // ─── Security: Rate limit ───
  const guard = await apiGuard(req, { routeId: "user-access", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const claimedEmail = searchParams.get("email");

    const { requireVerifiedEmail } = await import("@/lib/reportAccess");
    const auth = requireVerifiedEmail(req, claimedEmail);
    if ("error" in auth) return auth.error;

    const access = await getUserProductAccess(auth.email);

    return NextResponse.json({ access });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.error("[User Access API] Error", { error: msg });
    return NextResponse.json(
      { error: "Failed to get user access" },
      { status: 500 }
    );
  }
}
