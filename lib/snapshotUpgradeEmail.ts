export function snapshotUpgradeEmail({
  brandName,
  pillar,
}: {
  brandName: string;
  pillar: string;
}) {
  return {
    subject: `${brandName} — your ${pillar} insight deserves depth`,
    body: `
Your WunderBrand Snapshot™ revealed that ${pillar} is the key opportunity for ${brandName}.

Snapshot+™ expands this into:
• Clear root-cause analysis
• Prioritized next moves
• Strategic clarity across channels

Your full results are ready when you are.
    `.trim(),
  };
}
