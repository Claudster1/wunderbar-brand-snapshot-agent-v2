// lib/analytics.ts
// Analytics tracking utilities

export type AnalyticsEvent =
  | "SNAPSHOT_STARTED"
  | "SNAPSHOT_COMPLETED"
  | "RESULTS_VIEWED"
  | "UPGRADE_CLICKED"
  | "UPGRADE_ABANDONED";

export function trackEvent(event: AnalyticsEvent, meta?: Record<string, any>) {
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, meta }),
  });
}
