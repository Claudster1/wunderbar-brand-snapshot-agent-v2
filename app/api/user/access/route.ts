// app/api/user/access/route.ts
// API route to get user product access.
// SECURITY: Rate-limited and email-validated to prevent enumeration.

import { NextResponse } from "next/server";
import { getUserProductAccess } from "@/lib/getUserProductAccess";
import { apiGuard } from "@/lib/security/apiGuard";
import { AUTH_RATE_LIMIT } from "@/lib/security/rateLimit";

export async function GET(req: Request) {
  // ─── Security: Rate limit ───
  const guard = apiGuard(req, { routeId: "user-access", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Missing or invalid email parameter" },
        { status: 400 }
      );
    }

    // Normalize to prevent case-based enumeration
    const normalized = email.trim().toLowerCase();
    const access = await getUserProductAccess(normalized);

    return NextResponse.json({ access });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[User Access API] Error:", msg);
    return NextResponse.json(
      { error: "Failed to get user access" },
      { status: 500 }
    );
  }
}
