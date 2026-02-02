// app/preview/results/page.tsx
// Dev preview: see results UI with mock data (no DB or completed snapshot required).

import { PillarResults } from "@/src/components/results/PillarResults";
import { BrandScoreGauge } from "@/src/components/results/BrandScoreGauge";
import { ResultsUpgradeCTA } from "@/components/results/ResultsUpgradeCTA";
import { UpgradeNudge } from "@/components/results/UpgradeNudge";
import { SuiteCTA } from "@/src/components/results/SuiteCTA";
import { ContextCoverageMeter } from "@/src/components/results/ContextCoverageMeter";
import { ChatCompletion } from "@/src/components/results/ChatCompletion";
import { ImplementationIntro } from "@/components/SnapshotPlus/ImplementationIntro";
import { getPrimaryPillar } from "@/lib/upgrade/primaryPillar";
import type { PillarKey } from "@/src/types/pillars";

const MOCK_PILLAR_SCORES: Record<PillarKey, number> = {
  positioning: 16,
  messaging: 15,
  visibility: 14,
  credibility: 13,
  conversion: 14,
};

const MOCK_PILLAR_INSIGHTS: Record<PillarKey, string> = {
  positioning:
    "You have a solid foundation for positioning. The next step is ensuring this positioning consistently shows up across every touchpoint.",
  messaging:
    "Your messaging is clear and mostly consistent. The opportunity is to make it even more compelling by focusing on outcomes and benefits.",
  visibility:
    "You're building visibility. The next step is to make your content more strategic—ensuring every piece supports your positioning and messaging.",
  credibility:
    "You're building credibility. The opportunity is to make this credibility more visible—ensure testimonials and case studies are easy to find.",
  conversion:
    "You have a solid conversion setup. The opportunity is to make your conversion process even smoother with lead magnets or nurture sequences.",
};

export default function PreviewResultsPage() {
  const data = {
    businessName: "Acme Co",
    brandAlignmentScore: 72,
    pillarScores: MOCK_PILLAR_SCORES,
    pillarInsights: MOCK_PILLAR_INSIGHTS,
    stage: "scaling" as const,
    contextCoverage: 75,
    userRoleContext: "running and growing the business day-to-day",
    userEmail: undefined as string | undefined,
    reportId: "preview-mock",
    user: { hasSnapshotPlus: false },
  };

  const primaryResult = getPrimaryPillar(data.pillarScores);
  const primaryPillar =
    (primaryResult.type === "tie" && primaryResult.pillars?.length
      ? primaryResult.pillars[0]
      : primaryResult.pillar) ?? "positioning";
  const stage = data.stage;
  const user = data.user;

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
        <strong>Preview mode</strong> — Mock data. Real results: complete a Brand Snapshot or open{" "}
        <code className="bg-amber-100 px-1 rounded">/report/[report_id]</code> with a real ID.
      </div>

      <ChatCompletion userRoleContext={data.userRoleContext ?? undefined} />

      <BrandScoreGauge score={data.brandAlignmentScore} />

      <PillarResults
        pillarScores={data.pillarScores}
        pillarInsights={data.pillarInsights}
        primaryPillar={primaryPillar}
        stage={stage}
        businessName={data.businessName}
      />

      <ContextCoverageMeter coveragePercent={data.contextCoverage ?? 0} />

      <UpgradeNudge
        primaryPillar={primaryPillar}
        hasSnapshotPlus={user.hasSnapshotPlus}
      />

      <ResultsUpgradeCTA
        primaryPillar={primaryPillar}
        stage={data.stage}
        hasPurchasedPlus={user.hasSnapshotPlus}
        email={data.userEmail ?? undefined}
      />

      <ImplementationIntro />

      <SuiteCTA />
    </main>
  );
}
