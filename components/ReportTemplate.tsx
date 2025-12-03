// components/ReportTemplate.tsx

"use client";

import React from "react";
import Link from "next/link";

export function ReportTemplate({ data }: { data: any }) {
  const {
    userName,
    brandAlignmentScore,
    pillarScores,
    pillarInsights,
    recommendations,
    websiteNotes,
  } = data;

  const score = brandAlignmentScore ?? 0;

  const getTag = (value: number) => {
    if (value >= 4.5) return "bs-pillar-tag-strong";
    if (value >= 3.7) return "bs-pillar-tag-steady";
    if (value >= 2.8) return "bs-pillar-tag-mixed";
    if (value >= 2.0) return "bs-pillar-tag-solid";
    return "bs-pillar-tag-focus";
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      {/* HEADER */}
      <section>
        <h1 className="text-3xl font-semibold text-brand-navy">
          Your Brand Snapshot™ Report
        </h1>
        <p className="mt-2 text-gray-600">
          Hi {userName}, here's your personalized Brand Alignment Score™ and the insights that matter most for your brand right now.
        </p>

        <div className="flex flex-wrap gap-4 mt-6">
          <Link
            href={`/api/report/pdf?id=${data.reportId}`}
            className="px-5 py-3 bg-brand-blue text-white rounded-md shadow hover:bg-brand-blueHover"
          >
            Download PDF
          </Link>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-brand-aqua text-brand-navy font-medium rounded-md"
          >
            Share on LinkedIn
          </a>

          <Link
            href="/blueprint"
            className="px-5 py-3 bg-brand-navy text-white rounded-md"
          >
            Start Your Blueprint™ →
          </Link>
        </div>
      </section>

      {/* SCORE BLOCK */}
      <section className="mt-12 p-6 border border-brand-border rounded-xl shadow-sm bg-white">
        <h2 className="text-xl font-semibold text-brand-navy mb-4">
          Brand Alignment Score™
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT: Score Meter */}
          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-brand-navy">{score}</span>
              <span className="text-gray-600 text-sm">out of 100</span>
            </div>

            {/* Meter */}
            <div className="mt-4">
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 via-yellow-300 to-green-500"
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1 text-gray-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 text-gray-600 text-sm">
              <p><strong>80–100:</strong> Excellent alignment</p>
              <p><strong>60–79:</strong> Solid foundation</p>
              <p><strong>0–59:</strong> Needs focused attention</p>
            </div>
          </div>

          {/* RIGHT: Pillars */}
          <div className="flex-1">
            <h3 className="text-md font-semibold text-brand-navy mb-2">
              Pillar Breakdown
            </h3>

            <div className="flex flex-col gap-4">
              {Object.entries(pillarScores || {}).map(([key, value]: any) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-brand-navy">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <span className={`bs-pillar-tag ${getTag(value)}`}>
                      {value.toFixed(1)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-400 via-yellow-300 to-green-500"
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INSIGHTS */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-brand-navy">Insights</h2>

        <div className="mt-4 space-y-6">
          {Object.entries(pillarInsights || {}).map(([key, insight]: any) => (
            <div key={key} className="p-4 bg-gray-50 border border-brand-border rounded-lg">
              <h3 className="text-md font-semibold text-brand-navy capitalize">
                {key}
              </h3>
              <p className="mt-1 text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-brand-navy">Top Recommendations</h2>

        <ul className="mt-4 space-y-3 list-disc pl-6 text-gray-700">
          {(recommendations || []).map((rec: string, index: number) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </section>

      {/* WEBSITE NOTES */}
      {websiteNotes && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-brand-navy">Website Notes</h2>
          <p className="mt-3 text-gray-700">{websiteNotes}</p>
        </section>
      )}
    </div>
  );
}

