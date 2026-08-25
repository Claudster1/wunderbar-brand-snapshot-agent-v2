/** Shared copy for Snapshot email-gate CTAs on the results page. */

/**
 * Sticky bar + section title — users already see score/overview above the gate;
 * this unlocks the remaining breakdown (pillars, archetype, actions).
 */
export function resultsCompleteSnapshotHeadline(productName: string): string {
  return `Unlock the rest of your ${productName}`;
}

export function resultsCompleteSnapshotCtaLabel(): string {
  return "Unlock";
}

/** Short status above the headline — unlock remaining breakdown, not a cold start. */
export function resultsEmailGateIncludedEyebrow(): string {
  return "SEE YOUR COMPLETE DIAGNOSTIC";
}

export const RESULTS_EMAIL_GATE_UNLOCK_ITEMS = [
  "Pillar-by-pillar scores and insights",
  "Your brand archetype and what it means",
  "Ranked priority actions for your brand",
] as const;

/** Footer under the unlock form — what happens after they enter email. */
export function resultsEmailGateUnlockLegal(): string {
  return "You've seen your score overview. Enter your email to unlock the full breakdown on this page and enable Export. We'll also email you a unique link to reopen it anytime.";
}

/** Toast when header Export is clicked before email unlock. */
export function resultsEmailGateExportToast(): string {
  return "Enter your email below to download";
}

/** Soft tips ask — only right after unlock; email already captured. */
export function resultsEmailGatePreferenceEyebrow(): string {
  return "STAY IN THE LOOP";
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
