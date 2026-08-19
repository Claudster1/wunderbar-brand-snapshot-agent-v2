/** Shared copy for Snapshot email-gate CTAs on the results page. */
export function resultsCompleteSnapshotHeadline(productName: string): string {
  return `Get your complete ${productName}`;
}

export function resultsCompleteSnapshotCtaLabel(): string {
  return "Unlock free on this page";
}

export function resultsEmailGateIncludedEyebrow(productName: string): string {
  return `Included with your personalized ${productName}`;
}

export const RESULTS_EMAIL_GATE_UNLOCK_ITEMS = [
  "Brand Pillar Analysis — scores, strengths, and gaps",
  "Your brand archetype and what it means",
  "Ranked priority actions for your brand",
  "Context coverage and next-step guidance",
] as const;
