const AC_WEBHOOK_URL = process.env.ACTIVECAMPAIGN_WEBHOOK_URL!;

export async function fireACEvent(event: {
  email?: string;
  eventName: string;
  tags?: string[];
  fields?: Record<string, string | number>;
}) {
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
}
