// app/results/page.tsx

import { PillarResults } from "@/src/components/results/PillarResults";
import { BrandScoreGauge } from "@/src/components/results/BrandScoreGauge";
import { ResultsUpgradeCTA } from "@/components/results/ResultsUpgradeCTA";
import { UpgradeNudge } from "@/components/results/UpgradeNudge";
import { SuiteCTA } from "@/src/components/results/SuiteCTA";
import { ContextCoverageMeter } from "@/src/components/results/ContextCoverageMeter";
import { ChatCompletion } from "@/src/components/results/ChatCompletion";
import { ResultsPageViewTracker } from "@/components/results/ResultsPageViewTracker";
import { ImplementationIntro } from "@/components/SnapshotPlus/ImplementationIntro";
import { getPrimaryPillar } from "@/lib/upgrade/primaryPillar";
import { PillarKey } from "@/types/pillars";

interface BrandSnapshotResult {
  businessName: string;
  brandAlignmentScore: number; // 0-100
  pillarScores: Record<PillarKey, number>;
  pillarInsights: Record<PillarKey, string>;
  stage: "early" | "scaling" | "growing";
  contextCoverage?: number; // 0-100, optional
  userRoleContext?: string; // optional user role context
  userEmail?: string; // optional user email for access check
  reportId: string;
  user?: {
    hasSnapshotPlus: boolean;
  };
}

export default function ResultsPage({ data }: { data: BrandSnapshotResult }) {
  const primaryResult = getPrimaryPillar(data.pillarScores);
  const primaryPillar =
    primaryResult.type === "tie"
      ? primaryResult.pillars[0]
      : primaryResult.pillar;
  const stage = data.stage; // inferred by engine
  const user = data.user ?? { hasSnapshotPlus: false };

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      {/* Track page view */}
      <ResultsPageViewTracker
        brandAlignmentScore={data.brandAlignmentScore}
        primaryPillar={primaryPillar}
        reportId={data.reportId}
        brandName={data.businessName}
        stage={data.stage}
        contextCoverage={data.contextCoverage}
        email={data.userEmail}
      />

      {/* Chat (completed) */}
      <ChatCompletion userRoleContext={data.userRoleContext} />

      {/* Brand Alignment Score™ (large gauge) */}
      <BrandScoreGauge score={data.brandAlignmentScore} />

      {/* Primary Pillar (auto-expanded) + Secondary Pillars (collapsed) */}
      <PillarResults
        pillarScores={data.pillarScores}
        pillarInsights={data.pillarInsights}
        primaryPillar={primaryPillar}
        stage={stage}
        businessName={data.businessName}
      />

      {/* Context Coverage Meter */}
      {data.contextCoverage !== undefined && (
        <ContextCoverageMeter coveragePercent={data.contextCoverage} />
      )}

      <UpgradeNudge
        primaryPillar={primaryPillar}
        hasSnapshotPlus={user.hasSnapshotPlus}
      />

      <ResultsUpgradeCTA
        primaryPillar={primaryPillar}
        stage={data.stage}
        hasPurchasedPlus={user.hasSnapshotPlus}
        email={data.userEmail}
      />

      <ImplementationIntro />

      {/* Optional secondary CTA */}
      <SuiteCTA />
    </main>
  );
}
