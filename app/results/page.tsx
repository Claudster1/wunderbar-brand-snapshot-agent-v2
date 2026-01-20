// app/results/page.tsx

import { PillarResults } from "@/src/components/results/PillarResults";
import { BrandScoreGauge } from "@/src/components/results/BrandScoreGauge";
import { ResultsUpgradeCTA } from "@/components/results/ResultsUpgradeCTA";
import { UpgradeNudge } from "@/components/results/UpgradeNudge";
import { SuiteCTA } from "@/src/components/results/SuiteCTA";
import { ContextCoverageMeter } from "@/src/components/results/ContextCoverageMeter";
import { ChatCompletion } from "@/src/components/results/ChatCompletion";
import { ResultsPageViewTracker } from "@/components/results/ResultsPageViewTracker";
import { calculatePrimaryPillar } from "@/src/lib/scoring/primaryPillar";
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
  user?: {
    hasSnapshotPlus: boolean;
  };
}

export default function ResultsPage({ data }: { data: BrandSnapshotResult }) {
  const primaryPillar = calculatePrimaryPillar(data.pillarScores);
  const stage = data.stage; // inferred by engine
  const user = data.user ?? { hasSnapshotPlus: false };

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      {/* Track page view */}
      <ResultsPageViewTracker
        brandAlignmentScore={data.brandAlignmentScore}
        primaryPillar={primaryPillar}
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

      {/* UPGRADE CTA (mirrors History logic) */}
      <ResultsUpgradeCTA
        snapshot={{
          brand_alignment_score: data.brandAlignmentScore,
          primary_pillar: primaryPillar,
          context_coverage: data.contextCoverage || 0,
        }}
        userEmail={data.userEmail}
      />

      {/* Optional secondary CTA */}
      <SuiteCTA />
    </main>
  );
}
