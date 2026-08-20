/** Shared copy for Snapshot email-gate CTAs on the results page. */

/** Sticky bar + section title — one clear ask, product named once. */
export function resultsCompleteSnapshotHeadline(productName: string): string {
  return `Unlock your ${productName}`;
}

export function resultsCompleteSnapshotCtaLabel(): string {
  return "Unlock";
}

/** Short status above the headline — access, not “continue.” */
export function resultsEmailGateIncludedEyebrow(): string {
  return "Access your diagnostic";
}

export const RESULTS_EMAIL_GATE_UNLOCK_ITEMS = [
  "Pillar-by-pillar scores and insights",
  "Your brand archetype and what it means",
  "Ranked priority actions for your brand",
] as const;

/** Footer under the unlock form — what happens after they enter email. */
export function resultsEmailGateUnlockLegal(): string {
  return "We’ll unlock your full report on this page and email you a unique link to reopen it anytime. Use Export on the page to download a PDF.";
}

/** Soft tips ask — only right after unlock; email already captured. */
export function resultsEmailGatePreferenceEyebrow(): string {
  return "Stay in the loop";
}

export function resultsEmailGatePreferenceHeadline(): string {
  return "Stay current on the latest brand strategy & AI";
}

export function resultsEmailGatePreferenceLead(): string {
  return "Your diagnostic is unlocked. Choose what you’d like to stay current on — branding, marketing, and AI for business.";
}

export function resultsEmailGatePreferenceSaveLabel(): string {
  return "Save my choice";
}

export function resultsEmailGatePreferenceSkipLabel(): string {
  return "Not now";
}
