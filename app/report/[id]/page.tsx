// app/report/[id]/page.tsx
// Dynamic Brand Snapshot report page with full Wunderbar branding

import { WundyHero } from "@/components/WundyHero";
import { ScoreMeter } from "@/components/ScoreMeter";
import { PillarBreakdown } from "@/components/PillarBreakdown";
import { RecommendationsBlock } from "@/components/RecommendationsBlock";
import { SnapshotUpgradePanel } from "@/components/SnapshotUpgradePanel";
import { ColorPaletteSection } from "@/components/ColorPaletteSection";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

async function getReport(id: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(`${baseUrl}/api/snapshot/get?id=${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("[Report Page] Error fetching report:", error);
    return null;
  }
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

export default async function ReportPage({
  params,
}: {
  params: { id: string };
}) {
  const report = await getReport(params.id);

  if (!report || report.error) {
    return notFound();
  }

  const {
    user_name,
    company_name,
    brand_alignment_score,
    pillar_scores,
    pillar_insights,
    insights,
    recommendations,
    summary,
    opportunities_summary,
    upgrade_cta,
    color_palette,
    persona,
    archetype,
  } = report;

  // Use pillar_insights if available, otherwise fall back to insights
  const displayInsights = pillar_insights || insights || {};
  
  // Get snapshot_upsell from report if available
  const snapshotUpsell = (report as any).snapshot_upsell || upgrade_cta;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto py-12 px-6">
        {/* Hero Section */}
        <div className="fadein">
          <WundyHero userName={user_name} companyName={company_name} />
        </div>

        {/* Score Meter */}
        <div className="fadein" style={{ animationDelay: '100ms' }}>
          <ScoreMeter score={brand_alignment_score || 0} />
        </div>

        {/* Pillar Breakdown */}
        <div className="fadein" style={{ animationDelay: '200ms' }}>
          <PillarBreakdown
            pillars={pillar_scores || {}}
            insights={displayInsights}
          />
        </div>

        {/* Recommendations Block */}
        <div className="fadein" style={{ animationDelay: '300ms' }}>
          <RecommendationsBlock
            recommendations={recommendations}
            summary={summary}
            opportunitiesSummary={opportunities_summary}
          />
        </div>

        {/* Color Palette Section (Snapshot+ only) */}
        {color_palette && Array.isArray(color_palette) && color_palette.length > 0 && (
          <ColorPaletteSection
            palette={color_palette.map((c: any) => ({
              label: c.name,
              swatch: c.hex,
              role: c.role,
              meaning: c.meaning
            }))}
          />
        )}

        {/* Upgrade Panel */}
        <div className="fadein" style={{ animationDelay: '400ms' }}>
          <SnapshotUpgradePanel 
            upgradeCTA={snapshotUpsell}
            snapshotPlusCheckoutUrl={process.env.NEXT_PUBLIC_SNAPSHOT_PLUS_URL || "#"}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a
            href={`/api/pdf/${params.id}`}
            className="inline-block bg-brand-blue text-white px-8 py-3 rounded-lg shadow-lg hover:bg-brand-blueHover transition font-semibold w-full sm:w-auto text-center"
          >
            Download PDF Snapshot →
          </a>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.share({
                  title: "My Brand Snapshot™ Results",
                  text: `Check out my Brand Alignment Score™: ${brand_alignment_score}/100`,
                  url: window.location.href,
                });
              }
            }}
            className="inline-block bg-white text-brand-blue border-2 border-brand-blue px-8 py-3 rounded-lg hover:bg-blue-50 transition font-semibold w-full sm:w-auto text-center"
          >
            Share Results
          </button>
        </div>

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

