// ⚠️ TEST ROUTE — disabled for production.
// This route was used during development to test ActiveCampaign integration.
// Re-enable locally by uncommenting the original handler below.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This test endpoint is disabled in production." },
    { status: 403 }
  );
}
