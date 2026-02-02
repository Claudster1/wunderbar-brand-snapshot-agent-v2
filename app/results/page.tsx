// app/results/page.tsx
// Next.js page: accepts searchParams (e.g. reportId). With no reportId, prompts to complete a snapshot or redirect.

import Link from "next/link";
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
import { PillarKey } from "@/src/types/pillars";

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

interface ResultsPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const resolved = searchParams ?? {};
  const reportId = (typeof resolved.reportId === "string" ? resolved.reportId : resolved.reportId?.[0])
    ?? (typeof resolved.id === "string" ? resolved.id : resolved.id?.[0]);

  // No reportId: redirect to brand-snapshot results entry or show prompt
  if (!reportId || reportId === "preview-mock") {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-brand-navy mb-3">Your results</h1>
        <p className="text-brand-midnight mb-6">
          Complete a Brand Snapshot™ to see your results here, or open your report from the link we sent you.
        </p>
        <Link
          href="/brand-snapshot"
          className="inline-block bg-brand-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-blueHover transition"
        >
          Start Brand Snapshot™
        </Link>
      </main>
    );
  }

  // Fetch report and render full results (server component)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/snapshot/get?id=${encodeURIComponent(reportId)}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-brand-navy mb-3">Report not found</h1>
        <p className="text-brand-midnight mb-6">This report may have been removed or the link is incorrect.</p>
        <Link href="/brand-snapshot" className="text-brand-blue font-medium hover:underline">Start a new Brand Snapshot™</Link>
      </main>
    );
  }

  const report = await res.json();
  const pillarScores = (report.pillar_scores || report.pillarScores || {}) as Record<PillarKey, number>;
  const pillarInsightsRaw = report.pillar_insights || report.insights || {};
  const pillarInsights: Record<PillarKey, string> = {} as Record<PillarKey, string>;
  for (const key of ["positioning", "messaging", "visibility", "credibility", "conversion"] as PillarKey[]) {
    const v = pillarInsightsRaw[key];
    pillarInsights[key] = typeof v === "string" ? v : (v && typeof v === "object" && "strength" in v)
      ? [v.strength, v.opportunity, v.action].filter(Boolean).join(" ")
      : "No insight available.";
  }

  const data: BrandSnapshotResult = {
    businessName: report.company_name || report.company || "Your brand",
    brandAlignmentScore: report.brand_alignment_score ?? 0,
    pillarScores,
    pillarInsights,
    stage: (report.snapshot_stage || report.stage || "early") as "early" | "scaling" | "growing",
    contextCoverage: report.context_coverage ?? undefined,
    userRoleContext: report.user_role_context,
    userEmail: report.user_email ?? report.email,
    reportId: report.report_id || reportId,
    user: report.user ? { hasSnapshotPlus: !!report.user.hasSnapshotPlus } : undefined,
  };

  const primaryResult = getPrimaryPillar(data.pillarScores);
  const primaryPillar =
    primaryResult.type === "tie"
      ? primaryResult.pillars?.[0] ?? primaryResult.pillar
      : primaryResult.pillar;
  const primaryPillarStr = (primaryPillar ?? "positioning") as PillarKey;
  const stage = data.stage; // inferred by engine
  const user = data.user ?? { hasSnapshotPlus: false };

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      {/* Track page view */}
      <ResultsPageViewTracker
        brandAlignmentScore={data.brandAlignmentScore}
        primaryPillar={primaryPillarStr}
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
        primaryPillar={primaryPillarStr}
        stage={stage}
        businessName={data.businessName}
      />

      {/* Context Coverage Meter */}
      {data.contextCoverage !== undefined && (
        <ContextCoverageMeter coveragePercent={data.contextCoverage} />
      )}

      <UpgradeNudge
        primaryPillar={primaryPillarStr}
        hasSnapshotPlus={user.hasSnapshotPlus}
      />

      <ResultsUpgradeCTA
        primaryPillar={primaryPillarStr}
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
