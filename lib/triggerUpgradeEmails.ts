import { uncoveredPillars } from "@/lib/context/contextCoverage";

export async function triggerUpgradeEmails({
  email,
  coverage,
  primaryPillar,
}: {
  email: string;
  coverage: any;
  primaryPillar?: string;
}) {
  const gaps = uncoveredPillars(coverage);

  if (gaps.length === 0) return;

  await fetch(process.env.ACTIVE_CAMPAIGN_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      tags: ["snapshot:coverage-gap"],
      event: "snapshot_context_gap",
      primary_pillar: primaryPillar,
      missing_pillars: gaps,
    }),
  });
}
