// app/brand-snapshot/results/[id]/page.tsx
// Public-facing WunderBrand Snapshot™ results page with full design

export const dynamic = "force-dynamic";

import { ScoreGauge } from "@/src/components/ScoreGauge";
import { PillarBreakdown } from "@/components/PillarBreakdown";
import { SnapshotUpgradePanel } from "@/components/SnapshotUpgradePanel";
import { LockedResultsPreview } from "@/app/results/components/LockedResultsPreview";
import { MarketingSpendEfficiencySignal } from "@/app/results/components/MarketingSpendEfficiencySignal";
import { RevenueImpactStatement } from "@/app/results/components/RevenueImpactStatement";
import { HumanAssistCTA } from "@/app/results/components/HumanAssistCTA";
import type { PillarKey } from "@/src/types/pillars";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { safeFetchJson } from "@/lib/resilience/safeFetch";
import { getArchetypeIcon, getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";
import { ShareButton } from "@/components/share/ShareButton";
import { BlueprintPlusHeader } from "@/components/reports/BlueprintPlusHeader";

type BudgetBand = "under_500" | "500_2000" | "2000_5000" | "5000_plus";

function asBudgetBand(value: unknown): BudgetBand | null {
  if (typeof value !== "string") return null;
  return (["under_500", "500_2000", "2000_5000", "5000_plus"] as const).includes(
    value as BudgetBand
  )
    ? (value as BudgetBand)
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

async function getReport(id: string): Promise<any | null> {
  // Prefer explicit env URL, otherwise derive from the current request host (works for :3010 preview).
  const baseUrl = await resolveRuntimeBaseUrl();
  const response = await safeFetchJson<any>(
    `${baseUrl}/api/snapshot/get?id=${encodeURIComponent(id)}`,
    { cache: "no-store", retries: 2, timeoutMs: 7000 },
  );
  if (!response.ok || !response.data) {
    return null;
  }

  return response.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = await getReport(id);
  const baseUrl = await resolveRuntimeBaseUrl();

  if (!report) {
    return {
      title: "WunderBrand Snapshot™ Not Found | Wunderbar Digital",
    };
  }

  const score = report.brand_alignment_score || 0;
  const scoreLabel =
    score >= 80
      ? "Excellent"
      : score >= 60
      ? "Strong"
      : score >= 40
      ? "Developing"
      : "Needs Focus";

  return {
    title: `WunderBrand Snapshot™ Results - ${scoreLabel} (${score}/100) | Wunderbar Digital`,
    description: `Your WunderBrand Score™ is ${score}/100. View your complete WunderBrand Snapshot™ with pillar insights and recommendations.`,
    robots: { index: false, follow: false },
    openGraph: {
      title: `WunderBrand Snapshot™ - ${scoreLabel} (${score}/100)`,
      description: `Your WunderBrand Score™ is ${score}/100. View your complete WunderBrand Snapshot™.`,
      images: [
        {
          url: `${baseUrl}/api/og/${id}`,
          width: 1200,
          height: 630,
          alt: "WunderBrand Snapshot™ Results",
        },
      ],
    },
  };
}

export default async function SnapshotResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report || report.error) {
    return (
      <div className="min-h-screen bg-brand-bg font-brand flex items-center justify-center px-6">
        <div className="bs-container-narrow max-w-xl mx-auto text-center">
          <h1 className="bs-h1 mb-3">
            Report Not Found
          </h1>
          <p className="bs-body text-brand-muted mb-6">
            Please check your link or run a new WunderBrand Snapshot™.
          </p>
          <Link href="/" className="btn-primary">
            Start New Snapshot
          </Link>
        </div>
      </div>
    );
  }

  const {
    user_name,
    company_name,
    user_email,
    brand_alignment_score,
    pillar_scores,
    insights,
    recommendations: rawRecommendations,
    summary,
    opportunities_summary,
    upgrade_cta,
  } = report;

  // Normalize recommendations: array or pillar-keyed object → string[]
  const recommendationsList = Array.isArray(rawRecommendations)
    ? rawRecommendations
    : rawRecommendations && typeof rawRecommendations === "object"
      ? (Object.values(rawRecommendations).filter(
          (r): r is string => typeof r === "string"
        ) as string[])
      : [];

  // Weakest pillar for personalization (lowest score)
  const pillarEntries = pillar_scores
    ? (Object.entries(pillar_scores) as [string, number][])
    : [];
  const weakestPillar =
    pillarEntries.length > 0
      ? pillarEntries.reduce((a, b) => (a[1] <= b[1] ? a : b))[0]
      : null;

  const normalizedScores: Record<PillarKey, number> = {
    positioning: Number(pillar_scores?.positioning ?? 0),
    messaging: Number(pillar_scores?.messaging ?? 0),
    visibility: Number(pillar_scores?.visibility ?? 0),
    credibility: Number(pillar_scores?.credibility ?? 0),
    conversion: Number(pillar_scores?.conversion ?? 0),
  };
  const primaryPillar = (weakestPillar ?? "positioning") as PillarKey;
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
        <BlueprintPlusHeader
          productName="WunderBrand Snapshot™"
          reportId={report.report_id}
          userEmail={report.user_email}
          pdfHref={`/api/snapshot/pdf?id=${encodeURIComponent(report.report_id)}`}
          utmMedium="snapshot_results"
        />

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

        <section id="score-overview" className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
          <h2 className="bs-h3 mb-4">Your WunderBrand Score™</h2>
          <div className="flex justify-center">
            <ScoreGauge value={brand_alignment_score || 0} showLegend />
          </div>
        </section>

        {/* Pillar Breakdown */}
        <div id="pillar-analysis">
          <PillarBreakdown
            pillars={pillar_scores || {}}
            insights={insights || {}}
            businessName={company_name || "Your brand"}
            stage={(report.snapshot_stage || report.stage || "scaling") as "early" | "scaling" | "growing"}
          />
        </div>

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
              Snapshot-level guidance: use this archetype as your tone filter for headlines, proof language, and call-to-action framing.
            </p>
          </section>
        )}

        <div id="signals" className="space-y-12 md:space-y-14">
          <MarketingSpendEfficiencySignal
            businessType={businessType}
            monthlyMarketingBudget={monthlyMarketingBudget}
            primaryPillar={primaryPillar}
            reportId={report.report_id}
            email={report.user_email}
          />

          <RevenueImpactStatement
            primaryPillar={primaryPillar}
            monthlyRevenueRange={monthlyRevenueRange}
            annualRevenueRange={annualRevenueRange}
            averageTransactionValue={averageTransactionValue}
            conversionRateEstimate={conversionRateEstimate}
            reportId={report.report_id}
            email={report.user_email}
          />

          <HumanAssistCTA
            source="legacy_results_page"
            reportId={report.report_id}
            email={report.user_email}
            businessName={company_name}
            businessType={businessType}
            primaryPillar={primaryPillar}
            brandAlignmentScore={brand_alignment_score}
          />
        </div>

        <LockedResultsPreview
          primaryPillar={primaryPillar}
          pillarScores={normalizedScores}
          businessType={businessType}
          businessName={company_name}
          reportId={report.report_id}
          email={report.user_email}
          likelyArchetype={likelyArchetype}
          archetypeMeaning={archetypeMeaning}
          archetypeIcon={archetypeIcon}
        />

        {/* Download report + email note */}
        <section id="next-steps" className="bs-card rounded-xl p-6 sm:p-8">
          <h2 className="bs-h2 mb-3">
            Your report, anytime
          </h2>
          <p className="bs-body-sm text-brand-muted mb-6">
            Download your WunderBrand Snapshot™ below.{" "}
            {user_email ? (
              <>
                We&apos;ve also sent a copy to{" "}
                <span className="font-bold text-brand-navy">{user_email}</span>{" "}
                so you can reference it later or share it with your team.
              </>
            ) : (
              "Save the link to this page or download the PDF to keep your results."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`/api/snapshot/pdf?id=${report.report_id}`}
              className="btn-primary w-full sm:w-auto"
            >
              Download PDF Snapshot →
            </a>
            <div className="w-full sm:w-auto">
              <ShareButton
                reportId={report.report_id}
                tier="snapshot"
                label="My WunderBrand Snapshot™ Results"
                variant="text"
              />
            </div>
          </div>
        </section>

        {/* Upgrade Panel — moved lower so value is shown first */}
        <SnapshotUpgradePanel
          upgradeCTA={upgrade_cta}
          weakestPillar={weakestPillar}
        />

        {/* Footer */}
        <div className="text-center bs-small text-brand-muted pt-8 border-t border-brand-border">
          <p>
            Generated by{" "}
            <a
              href="https://wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=snapshot_results&utm_campaign=brand_navigation&utm_content=footer_credit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded"
            >
              Wunderbar Digital
            </a>{" "}
            • WunderBrand Snapshot™
          </p>
        </div>
      </div>
    </main>
  );
}

