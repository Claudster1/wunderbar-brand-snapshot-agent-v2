import { snapshotUpgradeEmail } from "@/lib/email/upgradeTemplates";

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "email-snapshot-upgrade", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { email, brandName, pillar } = await req.json();
    const webhookUrl = process.env.ACTIVE_CAMPAIGN_WEBHOOK || process.env.ACTIVECAMPAIGN_WEBHOOK_URL;
    if (!webhookUrl) {
      return new Response("OK");
    }

    const emailPayload = snapshotUpgradeEmail({ brandName, pillar });
    await fetch(webhookUrl, {
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
  } catch {
    return new Response("OK");
  }
}
