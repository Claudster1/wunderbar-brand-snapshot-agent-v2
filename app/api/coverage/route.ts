import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "coverage", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const { email, coverage, missing } = await req.json();

  const tag = coverage < 80 ? "snapshot:coverage-gap" : null;

  if (!tag) return NextResponse.json({ skipped: true });

  const webhookUrl = process.env.ACTIVE_CAMPAIGN_WEBHOOK;
  if (!webhookUrl) {
    logger.error("[Coverage] ACTIVE_CAMPAIGN_WEBHOOK not set");
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      tag,
      missing_context: missing.join(", "),
    }),
  });

  return NextResponse.json({ sent: true });
  } catch (err: unknown) {
    logger.error("[Coverage API] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Coverage request failed." },
      { status: 500 }
    );
  }
}
