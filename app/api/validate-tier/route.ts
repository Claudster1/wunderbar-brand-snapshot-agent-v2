// app/api/validate-tier/route.ts
// Validates a tier-access token. Called by the chat page to confirm paid tier access.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";

export async function GET(req: Request) {
  const guard = apiGuard(req, { routeId: "validate-tier", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;
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
    logger.error("[Validate Tier] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ valid: false, reason: "server_error" });
  }
}
