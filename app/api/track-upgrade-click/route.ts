import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "track-upgrade-click", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const body = await req.json();
  const webhookUrl =
    process.env.ACTIVE_CAMPAIGN_WEBHOOK ?? process.env.ACTIVECAMPAIGN_WEBHOOK_URL ?? "";
  if (!webhookUrl) {
    return NextResponse.json({ ok: true, skipped: "missing_webhook" });
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: typeof body?.event === "string" ? body.event : "upgrade_click",
        pillar: typeof body?.pillar === "string" ? body.pillar : "",
      }),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Upstream webhook failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
