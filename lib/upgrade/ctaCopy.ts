type CopyContext = {
  primaryPillar: string;
  tiePillars?: [string, string];
};

export function getUpgradeNudgeCopy({ primaryPillar, tiePillars }: CopyContext) {
  if (tiePillars) {
    return {
      headline: "Two areas stand out as your biggest opportunities",
      body: `Your Brand Snapshot™ shows equal impact across ${tiePillars.join(
        " and "
      )}. Snapshot+™ explores both — revealing which move creates momentum fastest.`,
      detail:
        "Snapshot+™ reveals the patterns behind this score — and outlines exactly how to strengthen it with clear priorities and next steps.",
      note: "Priority is determined by impact, not surface-level scores.",
      ctaLabel: "Unlock Snapshot+™",
    };
  }

  return {
    headline: `Your biggest opportunity right now: ${primaryPillar}`,
    body: `Want to go deeper on ${primaryPillar}?`,
    detail:
      "Snapshot+™ reveals the patterns behind this score — and outlines exactly how to strengthen it with clear priorities and next steps.",
    note: "Priority is determined by impact, not surface-level scores.",
    ctaLabel: "Unlock Snapshot+™",
  };
}
