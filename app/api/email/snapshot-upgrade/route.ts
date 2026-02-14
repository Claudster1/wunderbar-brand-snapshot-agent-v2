import { snapshotUpgradeEmail } from "@/lib/email/upgradeTemplates";

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "email-snapshot-upgrade", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const { email, brandName, pillar } = await req.json();

  const emailPayload = snapshotUpgradeEmail({ brandName, pillar });

  await fetch(process.env.ACTIVE_CAMPAIGN_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      subject: emailPayload.subject,
      body: emailPayload.body,
      tag: `PrimaryPillar:${pillar}`,
    }),
  });

  return new Response("OK");
}
