// SECURITY: Use server-side env var only. Never expose webhook URLs to the client.
// Align with other routes (snapshot, stripe, ac/event) so automations fire when any AC webhook URL is set.
const AC_WEBHOOK_URL =
  process.env.ACTIVECAMPAIGN_WEBHOOK_URL ||
  process.env.ACTIVE_CAMPAIGN_WEBHOOK ||
  "";

/** @returns true if a webhook request was sent and returned 2xx; false if misconfigured, failed, or errored. */
export async function fireACEvent(event: {
  email?: string;
  eventName: string;
  tags?: string[];
  fields?: Record<string, string | number>;
}): Promise<boolean> {
  if (!AC_WEBHOOK_URL) return false;
  try {
    const res = await fetch(AC_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: event.eventName,
        email: event.email,
        tags: event.tags,
        fields: event.fields,
      }),
    });
    return res.ok;
  } catch (_) {
    return false;
  }
}

const AC_EVENT_TRACKING_URL = "https://trackcmp.net/event";

/**
 * Records a Site Event for Event Tracking–based automation triggers ("Event is recorded").
 *
 * ActiveCampaign does **not** treat generic inbound webhook JSON as the same thing as Event
 * Tracking. Automations that start on `snapshot_completed` need this call (after the contact
 * exists and fields/tags are synced via the Contacts API).
 *
 * Env (Settings → Website → Site Tracking → Event Tracking):
 *   ACTIVE_CAMPAIGN_EVENT_TRACKING_KEY — "Event Key"
 *   ACTIVE_CAMPAIGN_EVENT_TRACKING_ACTID — "actid" (account id shown on that screen)
 *
 * API: https://developers.activecampaign.com/reference/track-event
 * Body must be `application/x-www-form-urlencoded` (not JSON).
 *
 * @returns true if AC returned success: 1; false if env missing, bad response, or network error.
 */
export async function trackActiveCampaignSiteEvent(event: {
  email: string;
  /** Max 32 characters per AC. */
  eventName: string;
  /** Optional string stored on the event (e.g. report URL for automation conditions). */
  eventData?: string;
}): Promise<boolean> {
  const key = process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_KEY;
  const actid = process.env.ACTIVE_CAMPAIGN_EVENT_TRACKING_ACTID;
  if (!key || !actid || !event.email?.trim() || !event.eventName?.trim()) return false;

  const visit = JSON.stringify({ email: event.email.trim().toLowerCase() });
  const params = new URLSearchParams({
    key,
    actid,
    event: event.eventName.trim().slice(0, 32),
    visit,
  });
  if (event.eventData != null && String(event.eventData).length > 0) {
    params.set("eventdata", String(event.eventData));
  }

  try {
    const res = await fetch(AC_EVENT_TRACKING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: number; message?: string };
    return res.ok && data.success === 1;
  } catch (_) {
    return false;
  }
}
