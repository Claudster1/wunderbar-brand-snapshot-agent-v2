/** Shared copy for Snapshot email-gate CTAs on the results page. */

/** Sticky bar + section title — one clear ask, product named once. */
export function resultsCompleteSnapshotHeadline(productName: string): string {
  return `Unlock the rest of your ${productName}`;
}

export function resultsCompleteSnapshotCtaLabel(): string {
  return "Unlock my results";
}

/** Short status above the headline — no product-name repeat. */
export function resultsEmailGateIncludedEyebrow(): string {
  return "Your score is ready";
}

export const RESULTS_EMAIL_GATE_UNLOCK_ITEMS = [
  "Brand Pillar Analysis — scores, strengths, and gaps",
  "Your brand archetype and what it means",
  "Ranked priority actions for your brand",
] as const;
