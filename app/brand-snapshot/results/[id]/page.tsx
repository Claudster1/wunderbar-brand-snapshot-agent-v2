// app/brand-snapshot/results/[id]/page.tsx
// Public-facing Brand Snapshot results page with full design

import { WundyHero } from "@/components/WundyHero";
import { ScoreMeter } from "@/components/ScoreMeter";
import { PillarBreakdown } from "@/components/PillarBreakdown";
import { RecommendationsBlock } from "@/components/RecommendationsBlock";
import { SnapshotUpgradePanel } from "@/components/SnapshotUpgradePanel";
import type { Metadata } from "next";

async function getReport(id: string) {
  // Use NEXT_PUBLIC_BASE_URL if set, otherwise try Vercel's automatic URL, then fallback to localhost
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/snapshot/get?id=${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const report = await getReport(params.id);

  if (!report) {
    return {
      title: "Brand Snapshot™ Not Found | Wunderbar Digital",
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
    title: `Brand Snapshot™ Results - ${scoreLabel} (${score}/100) | Wunderbar Digital`,
    description: `Your Brand Alignment Score™ is ${score}/100. View your complete Brand Snapshot™ with pillar insights and recommendations.`,
    openGraph: {
      title: `Brand Snapshot™ - ${scoreLabel} (${score}/100)`,
      description: `Your Brand Alignment Score™ is ${score}/100. View your complete Brand Snapshot™.`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/og/${params.id}`,
          width: 1200,
          height: 630,
          alt: "Brand Snapshot™ Results",
        },
      ],
    },
  };
}

export default async function SnapshotResultPage({
  params,
}: {
  params: { id: string };
}) {
  const report = await getReport(params.id);

  if (!report || report.error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-semibold text-brand-navy mb-3">
            Report Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            Please check your link or run a new Brand Snapshot™.
          </p>
          <a
            href="/"
            className="inline-block bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-brand-blueHover transition shadow-md font-semibold"
          >
            Start New Snapshot
          </a>
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto py-12 px-6">
        {/* Hero Section */}
        <WundyHero userName={user_name} companyName={company_name} />

        {/* Personalized intro */}
        {company_name && (
          <p className="text-center text-brand-midnight text-lg mb-2 max-w-2xl mx-auto">
            {company_name}&apos;s Brand Snapshot™ is tailored to your answers.
            Your score and recommendations below are specific to your brand.
          </p>
        )}

        {/* Score Meter */}
        <ScoreMeter score={brand_alignment_score || 0} />

        {/* Pillar Breakdown */}
        <PillarBreakdown
          pillars={pillar_scores || {}}
          insights={insights || {}}
        />

        {/* Recommendations Block — personalized next steps */}
        <RecommendationsBlock
          recommendations={recommendationsList}
          summary={summary}
          opportunitiesSummary={opportunities_summary}
        />

        {/* Upgrade Panel — credibility + value of upgrading */}
        <SnapshotUpgradePanel
          upgradeCTA={upgrade_cta}
          weakestPillar={weakestPillar}
        />

        {/* Download report + email note */}
        <section className="mb-12 rounded-xl border border-brand-border bg-white shadow-sm p-8">
          <h2 className="text-xl font-semibold text-brand-navy mb-2">
            Your report, anytime
          </h2>
          <p className="text-brand-midnight mb-4">
            Download your Brand Snapshot™ below.{" "}
            {user_email ? (
              <>
                We&apos;ve also sent a copy to{" "}
                <span className="font-medium text-brand-navy">{user_email}</span>{" "}
                so you can reference it later or share it with your team.
              </>
            ) : (
              "Save the link to this page or download the PDF to keep your results."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`/api/snapshot/pdf?id=${report.report_id}`}
              className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-8 py-3 rounded-lg shadow-lg hover:bg-brand-blueHover transition font-semibold w-full sm:w-auto"
            >
              Download PDF Snapshot →
            </a>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && navigator.share) {
                  navigator.share({
                    title: "My Brand Snapshot™ Results",
                    text: `Check out my Brand Alignment Score™: ${brand_alignment_score}/100`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-blue border-2 border-brand-blue px-8 py-3 rounded-lg hover:bg-blue-50 transition font-semibold w-full sm:w-auto"
            >
              Share results
            </button>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-8 border-t border-slate-200">
          <p>
            Generated by{" "}
            <a
              href="https://wunderbardigital.com"
              className="text-brand-blue hover:underline"
            >
              Wunderbar Digital
            </a>{" "}
            • Brand Snapshot™
          </p>
        </div>
      </div>
    </main>
  );
}

