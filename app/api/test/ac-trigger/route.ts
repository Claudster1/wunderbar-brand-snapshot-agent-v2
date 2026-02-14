// ⚠️ TEST ROUTE — disabled for production.
// This route was used during development to test ActiveCampaign integration.
// Re-enable locally by uncommenting the original handler below.

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "test-ac-trigger", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  return NextResponse.json(
    { error: "This test endpoint is disabled in production." },
    { status: 403 }
  );
}
