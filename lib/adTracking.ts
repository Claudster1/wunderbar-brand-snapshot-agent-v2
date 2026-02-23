/**
 * lib/adTracking.ts
 *
 * Centralized ad platform conversion tracking.
 * Fires events to Meta Pixel, Google Ads, and LinkedIn Insight Tag.
 * All calls are no-ops if the respective pixel isn't loaded or if
 * the user hasn't consented to marketing cookies.
 */

import { hasConsent } from "./cookieConsent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    lintrk?: (action: string, data: Record<string, unknown>) => void;
  }
}

function isMarketingConsented(): boolean {
  return hasConsent("marketing");
}

// ─── Meta Pixel ──────────────────────────────────────────────

function fbq(...args: unknown[]) {
  if (isMarketingConsented() && typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

// ─── Google Ads ──────────────────────────────────────────────

function gtagEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// ─── LinkedIn ────────────────────────────────────────────────

function lintrk(conversionId: number) {
  if (isMarketingConsented() && typeof window !== "undefined" && window.lintrk) {
    window.lintrk("track", { conversion_id: conversionId });
  }
}

// ─── Conversion Events ──────────────────────────────────────

/**
 * User completed the free Brand Snapshot (lead generation).
 */
export function trackSnapshotComplete(params: {
  brandName?: string;
  score?: number;
  email?: string;
}) {
  fbq("track", "Lead", {
    content_name: "WunderBrand Snapshot",
    content_category: "brand_diagnostic",
    value: 0,
    currency: "USD",
  });

  gtagEvent("generate_lead", {
    event_category: "conversion",
    event_label: "snapshot_complete",
    value: 0,
    currency: "USD",
  });

  const linkedInLeadId = process.env.NEXT_PUBLIC_LINKEDIN_LEAD_CONVERSION_ID;
  if (linkedInLeadId) lintrk(Number(linkedInLeadId));
}

/**
 * User viewed their results page (content engagement).
 */
export function trackResultsView(params: {
  reportId: string;
  score: number;
  primaryPillar: string;
}) {
  fbq("track", "ViewContent", {
    content_name: "WunderBrand Results",
    content_ids: [params.reportId],
    content_type: "brand_report",
    value: params.score,
  });

  gtagEvent("view_item", {
    items: [{
      item_id: params.reportId,
      item_name: "WunderBrand Snapshot Results",
      item_category: params.primaryPillar,
    }],
  });
}

/**
 * User clicked an upgrade CTA (intent signal).
 */
export function trackUpgradeClick(params: {
  fromTier: string;
  toTier: string;
  value: number;
}) {
  fbq("track", "InitiateCheckout", {
    content_name: `Upgrade to ${params.toTier}`,
    content_category: "upgrade",
    value: params.value,
    currency: "USD",
  });

  gtagEvent("begin_checkout", {
    currency: "USD",
    value: params.value,
    items: [{
      item_name: params.toTier,
      item_category: "wunderbrand_upgrade",
      price: params.value,
    }],
  });
}

/**
 * Purchase completed (fires on checkout success page).
 */
export function trackPurchase(params: {
  product: string;
  value: number;
  currency?: string;
  transactionId?: string;
}) {
  const currency = params.currency || "USD";

  fbq("track", "Purchase", {
    content_name: params.product,
    content_type: "product",
    value: params.value,
    currency,
  });

  gtagEvent("purchase", {
    transaction_id: params.transactionId || `wb_${Date.now()}`,
    value: params.value,
    currency,
    items: [{
      item_name: params.product,
      item_category: "wunderbrand_suite",
      price: params.value,
      quantity: 1,
    }],
  });

  const linkedInPurchaseId = process.env.NEXT_PUBLIC_LINKEDIN_PURCHASE_CONVERSION_ID;
  if (linkedInPurchaseId) lintrk(Number(linkedInPurchaseId));
}

/**
 * User started the brand snapshot chat (micro-conversion).
 */
export function trackSnapshotStart() {
  fbq("track", "StartTrial", {
    content_name: "WunderBrand Snapshot",
    value: 0,
    currency: "USD",
  });

  gtagEvent("begin_checkout", {
    currency: "USD",
    value: 0,
    items: [{
      item_name: "WunderBrand Snapshot (Free)",
      item_category: "brand_diagnostic",
    }],
  });
}
