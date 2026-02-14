// components/RecommendationsBlock.tsx
// Recommendations cards for WunderBrand Snapshot™ (free tier). Capped so the report stays actionable; Snapshot+™ unlocks more.

"use client";

import Link from "next/link";

/** Free tier: show up to 4 recommendations. More would dilute focus; Snapshot+™ offers fuller lists. */
const MAX_RECOMMENDATIONS_FREE_TIER = 4;

interface RecommendationsBlockProps {
  recommendations?: string[];
  summary?: string;
  opportunitiesSummary?: string;
}

export function RecommendationsBlock({
  recommendations,
  summary,
  opportunitiesSummary,
}: RecommendationsBlockProps) {
  const all = recommendations || [];
  const displayRecommendations = all.slice(0, MAX_RECOMMENDATIONS_FREE_TIER);
  const hasMore = all.length > MAX_RECOMMENDATIONS_FREE_TIER;

  return (
    <div className="space-y-8">
      {summary && (
        <div className="animate-fade-in-up animation-delay-600 bs-card rounded-xl p-6 sm:p-7">
          <h2 className="bs-h2 mb-3">
            Summary
          </h2>
          <p className="bs-body-sm text-brand-navy">{summary}</p>
        </div>
      )}

      {opportunitiesSummary && (
        <div className="animate-fade-in-up animation-delay-700 bs-card rounded-xl p-6 sm:p-7">
          <h2 className="bs-h2 mb-3">
            Opportunities
          </h2>
          <p className="bs-body-sm text-brand-navy">
            {opportunitiesSummary}
          </p>
        </div>
      )}

      {displayRecommendations.length > 0 && (
        <div className="animate-fade-in-up animation-delay-800">
          <h2 className="bs-h2 mb-2">
            Recommended next steps
          </h2>
          <p className="bs-body-sm text-brand-muted mb-6 max-w-xl">
            Tailored to your snapshot to build credibility and improve brand alignment.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {displayRecommendations.map((rec, index) => (
              <div
                key={index}
                className="bs-card rounded-xl p-6"
              >
                <p className="bs-body-sm font-bold leading-[1.6] text-brand-navy">
                  {rec}
                </p>
              </div>
            ))}
          </div>
          {hasMore && (
            <p className="bs-small text-brand-muted mt-4">
              You have {all.length - MAX_RECOMMENDATIONS_FREE_TIER} more recommendation{all.length - MAX_RECOMMENDATIONS_FREE_TIER === 1 ? "" : "s"} in your snapshot.{" "}
              <Link href="/snapshot-plus" className="text-brand-blue font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded">
                Snapshot+™
              </Link>
              {" "}unlocks the full list plus prioritized next steps.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

