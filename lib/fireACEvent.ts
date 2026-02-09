// SECURITY: Use server-side env var only. Never expose webhook URLs to the client.
const AC_WEBHOOK_URL = process.env.ACTIVECAMPAIGN_WEBHOOK_URL ?? process.env.NEXT_PUBLIC_ACTIVECAMPAIGN_WEBHOOK_URL ?? "";

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
