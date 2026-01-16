// lib/analytics.ts
// Analytics tracking utilities

/**
 * Track an analytics event
 * Dispatches a custom event that can be listened to by analytics handlers
 */
export function track(event: string, payload: Record<string, any>) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("analytics", {
      detail: { event, payload }
    })
  );
}
