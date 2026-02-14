// app/results/page.tsx
// Next.js page: accepts searchParams (e.g. reportId). With no reportId, prompts to complete a snapshot or redirect.

import Link from "next/link";

export const dynamic = "force-dynamic";
import { ResultsHeroSection } from "@/src/components/results/ResultsHeroSection";
import { PillarCardGrid } from "@/src/components/results/PillarCardGrid";
import { ResultsUpgradeCTA } from "@/components/results/ResultsUpgradeCTA";
import { SuiteCTA } from "@/src/components/results/SuiteCTA";
import { ContextCoverageMeter } from "@/src/components/results/ContextCoverageMeter";
import { ChatCompletion } from "@/src/components/results/ChatCompletion";
import { ResultsPageViewTracker } from "@/components/results/ResultsPageViewTracker";
import { ImplementationIntro } from "@/components/SnapshotPlus/ImplementationIntro";
import { getPrimaryPillar } from "@/lib/upgrade/primaryPillar";
import { PillarKey } from "@/src/types/pillars";
import type { UserRoleContext } from "@/src/types/snapshot";

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
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const raw = searchParams != null ? await searchParams : undefined;
  const resolved = raw ?? {};
  const reportId = (typeof resolved.reportId === "string" ? resolved.reportId : resolved.reportId?.[0])
    ?? (typeof resolved.id === "string" ? resolved.id : resolved.id?.[0]);

  // No reportId: redirect to brand-snapshot results entry or show prompt
  if (!reportId || reportId === "preview-mock") {
    return (
      <main className="min-h-screen bg-brand-bg font-brand flex flex-col items-center justify-center px-4 py-16">
        <div className="bs-container-narrow max-w-[700px] mx-auto text-center">
          <h1 className="bs-h1 mb-3">Your results</h1>
          <p className="bs-body mb-6 text-brand-midnight">
            Complete a WunderBrand Snapshot™ to see your results here, or open your report from the link we sent you.
          </p>
          <Link href="/brand-snapshot" className="btn-primary">
            Start WunderBrand Snapshot™
          </Link>
        </div>
      </main>
    );
  }

  // Fetch report and render full results (server component)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/snapshot/get?id=${encodeURIComponent(reportId)}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <main className="min-h-screen bg-brand-bg font-brand flex flex-col items-center justify-center px-4 py-16">
        <div className="bs-container-narrow max-w-[700px] mx-auto text-center">
          <h1 className="bs-h1 mb-3">Report not found</h1>
          <p className="bs-body mb-6 text-brand-midnight">This report may have been removed or the link is incorrect.</p>
          <Link href="/brand-snapshot" className="text-brand-blue font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded">Start a new WunderBrand Snapshot™</Link>
        </div>
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
    <main className="min-h-screen bg-brand-bg font-brand">
      <div className="bs-container-wide bs-section px-4 sm:px-6 md:px-8 space-y-12 md:space-y-14">
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

      {/* Hero: two-column — gauge + rating (left) | recommendation card (right) */}
      <ResultsHeroSection
        score={data.brandAlignmentScore}
        primaryPillar={primaryPillarStr}
        hasSnapshotPlus={user.hasSnapshotPlus}
        userRoleContext={data.userRoleContext as UserRoleContext | undefined}
      />

      {/* Score breakdown: grid of pillar cards */}
      <PillarCardGrid
        pillarScores={data.pillarScores}
        pillarInsights={data.pillarInsights}
      />

      {/* Context Coverage Meter */}
      {data.contextCoverage !== undefined && (
        <ContextCoverageMeter coveragePercent={data.contextCoverage} />
      )}

      <ResultsUpgradeCTA
        primaryPillar={primaryPillarStr}
        stage={data.stage}
        hasPurchasedPlus={user.hasSnapshotPlus}
        email={data.userEmail}
      />

      <ImplementationIntro />

      {/* Optional secondary CTA */}
      <SuiteCTA />
      </div>
    </main>
  );
}
