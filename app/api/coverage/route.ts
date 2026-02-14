import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "coverage", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const { email, coverage, missing } = await req.json();

  const tag = coverage < 80 ? "snapshot:coverage-gap" : null;

  if (!tag) return NextResponse.json({ skipped: true });

  await fetch(process.env.ACTIVE_CAMPAIGN_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      tag,
      missing_context: missing.join(", "),
    }),
  });

  return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error("[Coverage API] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Coverage request failed" },
      { status: 500 }
    );
  }
}
