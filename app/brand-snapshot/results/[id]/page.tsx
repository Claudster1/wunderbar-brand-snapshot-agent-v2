// app/brand-snapshot/results/[id]/page.tsx
// Public-facing Brand Snapshot results page

import { SnapshotScore } from "@/components/SnapshotScore";
import { SnapshotPillars } from "@/components/SnapshotPillars";
import { SnapshotSummary } from "@/components/SnapshotSummary";

async function getReport(id: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/snapshot/get?id=${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function SnapshotResultPage({
  params,
}: {
  params: { id: string };
}) {
  const report = await getReport(params.id);

  if (!report || report.error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-semibold text-brand-navy mb-3">
            Report Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            Please check your link or run a new Brand Snapshot™.
          </p>
          <a
            href="/"
            className="inline-block bg-brand-blue text-white px-6 py-3 rounded-md hover:bg-brand-blueHover transition"
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
    brand_alignment_score,
    pillar_scores,
    insights,
    recommendations,
  } = report;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto py-14 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-brand-navy mb-2">
            Your Brand Snapshot™ Results
          </h1>
          <p className="text-slate-700">
            {user_name && `Hi ${user_name}, `}
            here's your personalized Brand Snapshot™
            {company_name && ` for ${company_name}`}.
          </p>
        </div>

        {/* Score */}
        <SnapshotScore score={brand_alignment_score || 0} />

        {/* Pillars */}
        <SnapshotPillars
          scores={pillar_scores || {}}
          insights={insights || {}}
        />

        {/* Summary */}
        <SnapshotSummary
          recommendations={recommendations}
          summary={report.summary}
          opportunitiesSummary={report.opportunities_summary}
          upgradeCTA={report.upgrade_cta}
        />

        {/* Download PDF CTA */}
        <div className="mt-10 text-center">
          <a
            href={`/api/snapshot/pdf?id=${report.report_id}`}
            className="inline-block bg-brand-blue text-white px-8 py-3 rounded-md shadow-lg hover:bg-brand-blueHover transition font-semibold"
          >
            Download Your PDF Snapshot →
          </a>
        </div>
      </div>
    </main>
  );
}

