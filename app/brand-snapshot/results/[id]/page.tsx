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
import { redirect } from "next/navigation";
import { safeFetchJson } from "@/lib/resilience/safeFetch";
import { getArchetypeIcon, getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";
import { ShareButton } from "@/components/share/ShareButton";
import { BlueprintPlusHeader } from "@/components/reports/BlueprintPlusHeader";
import { SectionOverviewTiles } from "@/components/reports/SectionOverviewTiles";
import { wunderBrandScoreFromPillars } from "@/lib/wunderBrandScoreDisplay";

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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ section?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const report = await getReport(id);
  const baseUrl = await resolveRuntimeBaseUrl();
  const sectionLabels: Record<string, string> = {
    overview: "Overview",
    foundation: "Foundation",
    score: "Score",
    strategy: "Strategy",
    activation: "Activation",
    "next-steps": "Next Steps",
  };
  const section = typeof resolvedSearchParams?.section === "string" ? resolvedSearchParams.section : "overview";
  const sectionLabel = sectionLabels[section] || sectionLabels.foundation;

  if (!report) {
    return {
      title: "WunderBrand Snapshot™ Not Found | Wunderbar Digital",
    };
  }

  const score = wunderBrandScoreFromPillars(report);
  const scoreLabel =
    score >= 80
      ? "Excellent"
      : score >= 60
      ? "Strong"
      : score >= 40
      ? "Developing"
      : "Needs Focus";

  return {
    title: `WunderBrand Snapshot™ Results • ${sectionLabel} - ${scoreLabel} (${score}/100) | Wunderbar Digital`,
    description: `Your WunderBrand Score™ is ${score}/100. View your complete WunderBrand Snapshot™ with pillar insights and recommendations.`,
    robots: { index: false, follow: false },
    openGraph: {
      title: `WunderBrand Snapshot™ • ${sectionLabel} - ${scoreLabel} (${score}/100)`,
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ section?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const validSections = new Set(["overview", "foundation", "score", "strategy", "activation", "next-steps"]);
  const requestedSection =
    typeof resolvedSearchParams?.section === "string" ? resolvedSearchParams.section : undefined;
  if (!requestedSection || !validSections.has(requestedSection)) {
    redirect(`/brand-snapshot/results/${encodeURIComponent(id)}?section=overview`);
  }
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
    pillar_scores,
    insights,
    recommendations: rawRecommendations,
    summary,
    opportunities_summary,
    upgrade_cta,
  } = report;

  const displayBrandScore = wunderBrandScoreFromPillars(report);

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
  const strongestPillar =
    pillarEntries.length > 0
      ? pillarEntries.reduce((a, b) => (a[1] >= b[1] ? a : b))[0]
      : "messaging";
  const pillarDisplay: Record<PillarKey, string> = {
    positioning: "Positioning",
    messaging: "Messaging",
    visibility: "Visibility",
    credibility: "Credibility",
    conversion: "Conversion",
  };
  const decisionAction =
    recommendationsList.length > 0
      ? recommendationsList[0]
      : `Prioritize ${pillarDisplay[primaryPillar]} updates in your highest-traffic touchpoints this week.`;
  const activeSection = requestedSection;
  const sectionHref = (section: string) =>
    `/brand-snapshot/results/${encodeURIComponent(report.report_id)}?section=${section}`;
  const navItems = [
    { id: "overview", label: "Overview", href: sectionHref("overview") },
    { id: "foundation", label: "Foundation", href: sectionHref("foundation") },
    { id: "score", label: "Score", href: sectionHref("score") },
    { id: "strategy", label: "Strategy", href: sectionHref("strategy") },
    { id: "activation", label: "Activation", href: sectionHref("activation") },
    { id: "next-steps", label: "Next Steps", href: sectionHref("next-steps") },
  ];
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
          utmMedium="snapshot_results"
          navItems={navItems}
          activeSectionId={activeSection}
        />

        {activeSection === "overview" && (
          <SectionOverviewTiles
            productName="WunderBrand Snapshot™ results report"
            tiles={[
              {
                id: "foundation",
                label: "Foundation",
                description: "Decision snapshot with your current state, risk, and immediate move.",
                href: sectionHref("foundation"),
              },
              {
                id: "score",
                label: "Score",
                description: "View your WunderBrand score and core performance signal.",
                href: sectionHref("score"),
              },
              {
                id: "strategy",
                label: "Strategy",
                description: "Dive into pillar performance, archetype context, and strategic interpretation.",
                href: sectionHref("strategy"),
              },
              {
                id: "activation",
                label: "Activation",
                description: "Get priority actions, signal diagnostics, and implementation guidance.",
                href: sectionHref("activation"),
              },
              {
                id: "next-steps",
                label: "Next Steps",
                description: "Download, share, and review your recommended upgrade path.",
                href: sectionHref("next-steps"),
              },
            ]}
          />
        )}

        {activeSection === "foundation" && (
          <section id="foundation" className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
              Executive Summary
            </p>
            <h2 className="bs-h3 mb-3">Decision Snapshot</h2>
            <div className="space-y-2 max-w-3xl">
              <p className="bs-body-sm text-brand-midnight">
                <strong>Current state:</strong> Your brand is at {displayBrandScore}/100.
              </p>
              <p className="bs-body-sm text-brand-midnight">
                <strong>Biggest risk:</strong> {pillarDisplay[primaryPillar]} is your weakest pillar and
                is most likely limiting conversion consistency.
              </p>
              <p className="bs-body-sm text-brand-midnight">
                <strong>Biggest leverage:</strong>{" "}
                {pillarDisplay[strongestPillar as PillarKey] || "Messaging"} is a relative strength you can
                scale while you close weaker gaps.
              </p>
              <p className="bs-body-sm text-brand-midnight">
                <strong>Next action (this week):</strong> {decisionAction}
              </p>
              {typeof opportunities_summary === "string" && opportunities_summary.trim().length > 0 && (
                <p className="bs-small text-brand-muted pt-1">{opportunities_summary}</p>
              )}
              {typeof summary === "string" && summary.trim().length > 0 && (
                <p className="bs-small text-brand-muted">{summary}</p>
              )}
            </div>
          </section>
        )}

        {activeSection === "score" && (
          <section id="score" className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
            <h2 className="bs-h3 mb-4">Your WunderBrand Score™</h2>
            <div className="flex justify-center">
              <ScoreGauge value={displayBrandScore} showLegend />
            </div>
          </section>
        )}

        {activeSection === "strategy" && (
          <>
            <div id="strategy">
              <PillarBreakdown
                pillars={pillar_scores || {}}
                insights={insights || {}}
                businessName={company_name || "Your brand"}
                stage={(report.snapshot_stage || report.stage || "scaling") as "early" | "scaling" | "growing"}
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
                  Snapshot-level guidance: use this archetype as your tone filter for headlines, proof language, and call-to-action framing.
                </p>
              </section>
            )}
          </>
        )}

        {activeSection === "activation" && (
          <>
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

            <div id="activation" className="space-y-12 md:space-y-14">
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
                brandAlignmentScore={displayBrandScore}
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
          </>
        )}

        {activeSection === "next-steps" && (
          <>
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

            <SnapshotUpgradePanel
              upgradeCTA={upgrade_cta}
              weakestPillar={weakestPillar}
            />
          </>
        )}

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

