// app/brand-snapshot/results/[id]/page.tsx
// Public-facing WunderBrand Snapshot™ results page with full design

export const dynamic = "force-dynamic";

import { WundyHero } from "@/components/WundyHero";
import { ScoreMeter } from "@/components/ScoreMeter";
import { PillarBreakdown } from "@/components/PillarBreakdown";
import { SnapshotUpgradePanel } from "@/components/SnapshotUpgradePanel";
import { LockedResultsPreview } from "@/app/results/components/LockedResultsPreview";
import { MarketingSpendEfficiencySignal } from "@/app/results/components/MarketingSpendEfficiencySignal";
import { RevenueImpactStatement } from "@/app/results/components/RevenueImpactStatement";
import { HumanAssistCTA } from "@/app/results/components/HumanAssistCTA";
import type { PillarKey } from "@/src/types/pillars";
import type { Metadata } from "next";
import Link from "next/link";
import { safeFetchJson } from "@/lib/resilience/safeFetch";

type BudgetBand = "under_500" | "500_2000" | "2000_5000" | "5000_plus";

function asBudgetBand(value: unknown): BudgetBand | null {
  if (typeof value !== "string") return null;
  return (["under_500", "500_2000", "2000_5000", "5000_plus"] as const).includes(
    value as BudgetBand
  )
    ? (value as BudgetBand)
    : null;
}

async function getReport(id: string): Promise<any | null> {
  // Use NEXT_PUBLIC_BASE_URL if set, otherwise try Vercel's automatic URL, then fallback to localhost
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";
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
          url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/og/${id}`,
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

  return (
    <main className="min-h-screen bg-brand-bg font-brand">
      <div className="bs-container-wide bs-section px-4 sm:px-6 md:px-8 space-y-12 md:space-y-14">
        {/* Hero Section */}
        <WundyHero userName={user_name} companyName={company_name} />

        {/* Personalized intro */}
        {company_name && (
          <p className="text-center bs-body-sm text-brand-muted max-w-xl mx-auto">
            {company_name}&apos;s WunderBrand Snapshot™ is tailored to your answers.
            Your score and recommendations below are specific to your brand.
          </p>
        )}

        {/* Score Meter */}
        <ScoreMeter score={brand_alignment_score || 0} />

        {/* Pillar Breakdown */}
        <PillarBreakdown
          pillars={pillar_scores || {}}
          insights={insights || {}}
          businessName={company_name || "Your brand"}
          stage={(report.snapshot_stage || report.stage || "scaling") as "early" | "scaling" | "growing"}
        />

        {/* Upgrade Panel — credibility + value of upgrading */}
        <SnapshotUpgradePanel
          upgradeCTA={upgrade_cta}
          weakestPillar={weakestPillar}
        />

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

        <LockedResultsPreview
          primaryPillar={primaryPillar}
          pillarScores={normalizedScores}
          businessType={businessType}
          businessName={company_name}
          reportId={report.report_id}
          email={report.user_email}
        />

        {/* Download report + email note */}
        <section className="bs-card rounded-xl p-6 sm:p-8">
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
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && navigator.share) {
                  navigator.share({
                    title: "My WunderBrand Snapshot™ Results",
                    text: `Check out my WunderBrand Score™: ${brand_alignment_score}/100`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
              className="btn-secondary w-full sm:w-auto"
            >
              Share results
            </button>
          </div>
        </section>

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

