import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "track-upgrade", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const body = await req.json();

  await fetch(process.env.AC_EVENT_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: body.event,
      test_id: body.testId,
      variant: body.variant,
      pillar: body.pillar,
    }),
  });

  return NextResponse.json({ ok: true });
}
