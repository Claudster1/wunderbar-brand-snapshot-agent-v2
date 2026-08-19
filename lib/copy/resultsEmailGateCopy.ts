/** Shared copy for Snapshot email-gate CTAs on the results page. */
export function resultsCompleteSnapshotHeadline(productName: string): string {
  return `Get your complete ${productName}`;
}

export function resultsCompleteSnapshotCtaLabel(productName: string): string {
  return `Get your complete ${productName}`;
}

export function resultsEmailGateIncludedEyebrow(productName: string): string {
  return `Included with your personalized ${productName}`;
}

/** Quiet status under the unlock checklist — no competing CTA; the form above is the action. */
export function resultsEmailGateUnlockHint(): string {
  return "Enter your email in the form above to open these free on this page.";
}
