import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // ─── Security: Rate limit (email-sending endpoint) ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "coverage-email", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { email, coverage, missing } = await req.json();

    const tag = coverage < 80 ? "snapshot:coverage-gap" : null;

    if (!tag) return NextResponse.json({ skipped: true });

    const { isValidEmail } = await import("@/lib/security/inputValidation");
    if (email != null && String(email).trim() !== "" && !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const webhookUrl = process.env.ACTIVE_CAMPAIGN_WEBHOOK;
    if (!webhookUrl) {
      console.error("[Coverage Email] ACTIVE_CAMPAIGN_WEBHOOK not set");
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
    console.error("[Coverage Email] Error:", err);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
