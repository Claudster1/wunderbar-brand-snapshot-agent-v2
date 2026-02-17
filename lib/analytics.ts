// lib/analytics.ts
// First-party analytics tracking with attribution enrichment.
// Every event is written to Supabase (analytics_events) AND forwarded to ActiveCampaign.

import { getAttribution, getAnonymousId } from "@/lib/attribution";

export type AnalyticsEvent =
  | "SNAPSHOT_STARTED"
  | "SNAPSHOT_COMPLETED"
  | "RESULTS_VIEWED"
  | "UPGRADE_CLICKED"
  | "UPGRADE_ABANDONED"
  | "UPGRADE_NUDGE_CLICKED"
  | "PDF_DOWNLOADED"
  | "BLUEPRINT_STARTED"
  | "BLUEPRINT_COMPLETED";

/**
 * Track a product event with automatic attribution enrichment.
 * Attribution (referrer, UTM, AI source) is pulled from localStorage
 * and sent alongside the event metadata.
 */
export function trackEvent(event: AnalyticsEvent, meta?: Record<string, any>) {
  if (typeof window === "undefined") return;

  const attribution = getAttribution();
  const enrichedMeta: Record<string, any> = {
    ...meta,
    anonymousId: getAnonymousId(),
    pagePath: window.location.pathname,
    // Merge attribution data so every event has source context
    ...(attribution
      ? {
          referrer: attribution.referrer,
          referrerDomain: attribution.referrerDomain,
          isAiReferral: attribution.isAiReferral,
          aiSource: attribution.aiSource,
          utmSource: attribution.utmSource,
          utmMedium: attribution.utmMedium,
          utmCampaign: attribution.utmCampaign,
          utmContent: attribution.utmContent,
          utmTerm: attribution.utmTerm,
        }
      : {}),
  };

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, meta: enrichedMeta }),
  }).catch(() => {
    // Non-blocking — don't break the app if analytics fails
  });
}
