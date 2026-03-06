// app/results/page.tsx
// Next.js page: accepts searchParams (e.g. reportId). With no reportId, prompts to complete a snapshot or redirect.

import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
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
import { LockedResultsPreview } from "@/app/results/components/LockedResultsPreview";
import { MarketingSpendEfficiencySignal } from "@/app/results/components/MarketingSpendEfficiencySignal";
import { RevenueImpactStatement } from "@/app/results/components/RevenueImpactStatement";
import { HumanAssistCTA } from "@/app/results/components/HumanAssistCTA";
import { safeFetchJson } from "@/lib/resilience/safeFetch";
import { getArchetypeIcon, getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";
import { BlueprintPlusHeader } from "@/components/reports/BlueprintPlusHeader";

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

type BudgetBand = "under_500" | "500_2000" | "2000_5000" | "5000_plus";

function asBudgetBand(value: unknown): BudgetBand | null {
  return value === "under_500" ||
    value === "500_2000" ||
    value === "2000_5000" ||
    value === "5000_plus"
    ? value
    : null;
}

function extractLikelyArchetype(report: Record<string, unknown>, answers: Record<string, unknown>): string | null {
  const candidates: unknown[] = [
    report.likely_archetype,
    report.brand_archetype,
    report.archetype,
    report.primary_archetype,
    answers.likelyArchetype,
    answers.brandArchetype,
    answers.archetype,
    answers.primaryArchetype,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return null;
}

async function resolveBaseUrlFromHeaders() {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  if (!host) return null;
  const proto = hdrs.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function resolveRuntimeBaseUrl() {
  const requestBaseUrl = await resolveBaseUrlFromHeaders();
  if (process.env.NODE_ENV !== "production") {
    return requestBaseUrl || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    requestBaseUrl ||
    "http://localhost:3000"
  );
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
  const baseUrl = await resolveRuntimeBaseUrl();
  const reportResponse = await safeFetchJson<any>(
    `${baseUrl}/api/snapshot/get?id=${encodeURIComponent(reportId)}`,
    { cache: "no-store", retries: 2, timeoutMs: 7000 },
  );
  if (!reportResponse.ok || !reportResponse.data) {
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

  const report = reportResponse.data as any;
  const pillarScores = (report.pillar_scores || report.pillarScores || {}) as Record<PillarKey, number>;
  const pillarInsightsRaw = report.pillar_insights || report.insights || {};
  const rawRecommendations = report.recommendations;
  const recommendationsList = Array.isArray(rawRecommendations)
    ? rawRecommendations
    : rawRecommendations && typeof rawRecommendations === "object"
      ? (Object.values(rawRecommendations).filter(
          (r): r is string => typeof r === "string"
        ) as string[])
      : [];
  const pillarInsights: Record<PillarKey, string> = {} as Record<PillarKey, string>;
  for (const key of ["positioning", "messaging", "visibility", "credibility", "conversion"] as PillarKey[]) {
    const v = pillarInsightsRaw[key];
    pillarInsights[key] = typeof v === "string" ? v : (v && typeof v === "object" && "strength" in v)
      ? [v.strength, v.opportunity].filter(Boolean).join(" ")
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
  const reportAnswers = (report.full_report?.answers ?? report.answers ?? {}) as Record<string, unknown>;
  const businessType =
    typeof reportAnswers.businessType === "string" ? reportAnswers.businessType : null;
  const monthlyMarketingBudget = asBudgetBand(reportAnswers.monthlyMarketingBudget);
  const monthlyRevenueRange =
    typeof reportAnswers.monthlyRevenueRange === "string"
      ? reportAnswers.monthlyRevenueRange
      : null;
  const annualRevenueRange =
    typeof reportAnswers.revenueRange === "string" ? reportAnswers.revenueRange : null;
  const averageTransactionValue =
    typeof reportAnswers.averageTransactionValue === "string"
      ? reportAnswers.averageTransactionValue
      : null;
  const conversionRateEstimate =
    typeof reportAnswers.conversionRateEstimate === "string"
      ? reportAnswers.conversionRateEstimate
      : null;
  const likelyArchetype = extractLikelyArchetype(report as Record<string, unknown>, reportAnswers);
  const archetypeMeaning = getArchetypeMeaning(likelyArchetype);
  const archetypeIcon = getArchetypeIcon(likelyArchetype);

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

      <BlueprintPlusHeader
        productName="WunderBrand Snapshot™"
        reportId={data.reportId}
        userEmail={data.userEmail}
        pdfHref={`/api/pdf?id=${encodeURIComponent(data.reportId)}&type=snapshot`}
        utmMedium="snapshot_results"
      />

      {/* Intro */}
      <ChatCompletion userRoleContext={data.userRoleContext} />

      <section id="summary" className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
          Executive Summary
        </p>
        <h2 className="bs-h3 mb-2">Your high-level brand results overview</h2>
        <p className="bs-body-sm text-brand-muted max-w-3xl">
          This summary gives you the top-line view of your WunderBrand Score™, pillar performance,
          and immediate priority focus so you can understand where your brand stands before diving
          into details.
        </p>
      </section>

      {recommendationsList.length > 0 && (
        <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
            Priority Actions
          </p>
          <h2 className="bs-h3 mb-2">What to focus on next</h2>
          <div className="space-y-2">
            {recommendationsList.slice(0, 5).map((item, idx) => (
              <p key={`${idx}-${item.slice(0, 30)}`} className="bs-body-sm text-brand-midnight">
                {idx + 1}. {item}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Hero: two-column — gauge + rating (left) | recommendation card (right) */}
      <div id="score-overview">
        <ResultsHeroSection
          score={data.brandAlignmentScore}
          primaryPillar={primaryPillarStr}
          hasSnapshotPlus={user.hasSnapshotPlus}
          userRoleContext={data.userRoleContext as UserRoleContext | undefined}
        />
      </div>

      {/* Score breakdown: grid of pillar cards */}
      <div id="pillar-analysis">
        <PillarCardGrid
          pillarScores={data.pillarScores}
          pillarInsights={data.pillarInsights}
        />
      </div>

      {likelyArchetype && (
        <section id="archetype" className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
            Your Brand Archetype
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-blue/10 border border-brand-blue/20">
            <p className="bs-body-sm text-brand-navy font-bold">
              {archetypeIcon ? `${archetypeIcon} ` : ""}
              {likelyArchetype}
            </p>
          </div>
          {archetypeMeaning && (
            <p className="bs-small text-brand-muted mt-1">{archetypeMeaning}</p>
          )}
          <p className="bs-small text-brand-muted mt-3">
            {user.hasSnapshotPlus
              ? "Blueprint+ style guidance: use this archetype as your default tone filter across website copy, offer framing, and CTA language."
              : "Snapshot view: use this archetype as your north star for headline tone, proof style, and call-to-action language."}
          </p>
        </section>
      )}

      <div id="signals" className="space-y-12 md:space-y-14">
        <MarketingSpendEfficiencySignal
          businessType={businessType}
          monthlyMarketingBudget={monthlyMarketingBudget}
          primaryPillar={primaryPillarStr}
          reportId={data.reportId}
          email={data.userEmail}
        />

        <RevenueImpactStatement
          primaryPillar={primaryPillarStr}
          monthlyRevenueRange={monthlyRevenueRange}
          annualRevenueRange={annualRevenueRange}
          averageTransactionValue={averageTransactionValue}
          conversionRateEstimate={conversionRateEstimate}
          reportId={data.reportId}
          email={data.userEmail}
        />

        <HumanAssistCTA
          source="results_page"
          reportId={data.reportId}
          email={data.userEmail}
          businessName={data.businessName}
          businessType={businessType}
          primaryPillar={primaryPillarStr}
          brandAlignmentScore={data.brandAlignmentScore}
        />
      </div>

      {!user.hasSnapshotPlus && (
        <LockedResultsPreview
          primaryPillar={primaryPillarStr}
          pillarScores={data.pillarScores}
          businessType={businessType}
          businessName={data.businessName}
          reportId={data.reportId}
          email={data.userEmail}
          likelyArchetype={likelyArchetype}
          archetypeMeaning={archetypeMeaning}
          archetypeIcon={archetypeIcon}
        />
      )}

      {/* Context Coverage Meter */}
      {data.contextCoverage !== undefined && (
        <ContextCoverageMeter coveragePercent={data.contextCoverage} />
      )}

      <div id="implementation">
        <ImplementationIntro />
      </div>

      {/* Optional secondary CTA */}
      <SuiteCTA />

      <div id="next-steps">
        <ResultsUpgradeCTA
          primaryPillar={primaryPillarStr}
          stage={data.stage}
          hasPurchasedPlus={user.hasSnapshotPlus}
          email={data.userEmail}
        />
      </div>
      </div>
    </main>
  );
}
