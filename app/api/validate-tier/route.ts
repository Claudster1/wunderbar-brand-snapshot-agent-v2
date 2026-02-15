// app/api/validate-tier/route.ts
// Validates a tier-access token. Called by the chat page to confirm paid tier access.

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const tier = searchParams.get("tier");

  if (!token || !tier) {
    return NextResponse.json({ valid: false, reason: "missing_params" });
  }

  // Only validate for paid tiers
  if (tier === "snapshot") {
    return NextResponse.json({ valid: true });
  }

  try {
    const { validateTierToken } = await import("@/lib/security/tierToken");
    const result = validateTierToken(token);

    if (!result.valid) {
      return NextResponse.json({ valid: false, reason: result.reason });
    }

    // Token tier must match requested tier
    if (result.tier !== tier) {
      return NextResponse.json({ valid: false, reason: "tier_mismatch" });
    }

    return NextResponse.json({ valid: true, email: result.email });
  } catch (err) {
    console.error("[Validate Tier] Error:", err);
    return NextResponse.json({ valid: false, reason: "server_error" });
  }
}
