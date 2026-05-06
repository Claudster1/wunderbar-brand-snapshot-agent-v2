// SECURITY: Use server-side env var only. Never expose webhook URLs to the client.
// Align with other routes (snapshot, stripe, ac/event) so automations fire when any AC webhook URL is set.
const AC_WEBHOOK_URL =
  process.env.ACTIVECAMPAIGN_WEBHOOK_URL ||
  process.env.ACTIVE_CAMPAIGN_WEBHOOK ||
  "";

export async function fireACEvent(event: {
  email?: string;
  eventName: string;
  tags?: string[];
  fields?: Record<string, string | number>;
}) {
  if (!AC_WEBHOOK_URL) return;
  try {
    await fetch(AC_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: event.eventName,
        email: event.email,
        tags: event.tags,
        fields: event.fields,
      }),
    });
  } catch (_) {
    // No-op when webhook is unavailable (e.g. client without env, network error)
  }
}
