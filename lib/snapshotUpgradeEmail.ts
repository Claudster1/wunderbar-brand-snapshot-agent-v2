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

That result comes from Wunderbar Digital's proprietary scoring and diagnostic methodology — and Snapshot+™ takes it further with implementation-level guidance:
• Clear root-cause analysis tied to your strongest and weakest pillars
• Prioritized next moves by strategic leverage
• Structured outputs across Foundation, Strategy, Activation, Workbook, and Downloads
• 8 AI prompts calibrated to your brand context

Your full results are ready when you are.
    `.trim(),
  };
}
