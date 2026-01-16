// src/lib/contextCoverage.ts

export function calculateCoverage(inputs: Record<string, any>) {
  const required = [
    "website",
    "socials",
    "competitorNames",
    "marketingChannels",
    "brandConsistency",
  ];

  const completed = required.filter(k => inputs[k] && inputs[k].length !== 0);

  return Math.round((completed.length / required.length) * 100);
}

export function getCoverageGaps(coverageScore: number) {
  if (coverageScore >= 85) return null;

  return {
    showUpgrade: true,
    message:
      "We could go deeper with more context to unlock stronger strategic guidance.",
  };
}

export function getUpgradeTag(coverageScore: number) {
  if (coverageScore < 70) return "SNAPSHOT_CONTEXT_LOW";
  if (coverageScore < 85) return "SNAPSHOT_CONTEXT_MEDIUM";
  return null;
}

export function getCoverageLabel(score: number) {
  if (score >= 80) return "High confidence context";
  if (score >= 50) return "Good foundation with gaps";
  return "Limited context — insights directional";
}
