// app/preview/results/page.tsx
// Dev preview: see results UI with mock data (no DB or completed snapshot required).

import { ResultsHeroSection } from "@/src/components/results/ResultsHeroSection";
import { PillarCardGrid } from "@/src/components/results/PillarCardGrid";
import { ResultsUpgradeCTA } from "@/components/results/ResultsUpgradeCTA";
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
    ((primaryResult.type === "tie" && primaryResult.pillars?.length
      ? primaryResult.pillars[0]
      : primaryResult.pillar) ?? "positioning") as PillarKey;
  const stage = data.stage;
  const user = data.user;

  return (
    <main className="min-h-screen bg-brand-bg font-brand">
      <div className="bs-container-wide bs-section px-4 sm:px-6 md:px-8 space-y-12 md:space-y-14">
        <div className="bs-card rounded-xl bg-[#fff9e6] border-2 border-[#f5e6b3] px-5 py-4 bs-body-sm text-[#8b6914]">
          <strong>Preview mode</strong> — Mock data. Real results: complete a Brand Snapshot or open{" "}
          <code className="bg-white/60 px-1.5 py-0.5 rounded">/report/[report_id]</code> with a real ID.
        </div>

        <ChatCompletion userRoleContext={data.userRoleContext ?? undefined} />

        <ResultsHeroSection
          score={data.brandAlignmentScore}
          primaryPillar={primaryPillar}
          hasSnapshotPlus={user.hasSnapshotPlus}
          userRoleContext={undefined}
        />

        <PillarCardGrid
          pillarScores={data.pillarScores}
          pillarInsights={data.pillarInsights}
        />

        <ContextCoverageMeter coveragePercent={data.contextCoverage ?? 0} />

      <ResultsUpgradeCTA
        primaryPillar={primaryPillar}
        stage={data.stage}
        hasPurchasedPlus={user.hasSnapshotPlus}
        email={data.userEmail ?? undefined}
      />

      <ImplementationIntro />

        <SuiteCTA />
      </div>
    </main>
  );
}
