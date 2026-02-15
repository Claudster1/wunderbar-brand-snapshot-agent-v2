import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "analytics", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();
    const tags: string[] = [];

  if (body.event === "RESULTS_VIEWED") {
    tags.push("snapshot:viewed-results");
    if (body.meta?.returnVisit) {
      tags.push("snapshot:return-visit");
    }
  }

  if (body.event === "UPGRADE_CLICKED") {
    tags.push("snapshot:clicked-upgrade");
  }

  if (body.event === "SNAPSHOT_COMPLETED") {
    tags.push("snapshot:completed");
  }

  const webhookUrl = process.env.ACTIVE_CAMPAIGN_WEBHOOK;
  if (!webhookUrl) {
    console.error("[Analytics] ACTIVE_CAMPAIGN_WEBHOOK not set");
    return NextResponse.json({ ok: true }); // Non-blocking: don't fail for analytics
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: body.event,
      ...body.meta,
      tags,
    }),
  });

  return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[Analytics API] Error:", err);
    return NextResponse.json(
      { error: "Analytics request failed." },
      { status: 500 }
    );
  }
}
