// lib/activeCampaignTracking.ts

export function trackEvent(
  eventName: string,
  eventData: Record<string, any>
) {
  if (typeof window === "undefined") return;

  if (!(window as any).vgo) return; // ActiveCampaign script guard

  try {
    (window as any).vgo("setTrackByDefault", true);
    (window as any).vgo("event", eventName, eventData);
  } catch (err) {
    console.warn("AC tracking failed:", err);
  }
}
