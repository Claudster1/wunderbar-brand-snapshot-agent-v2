// components/SnapshotSummary.tsx
// Component to display recommendations and summary

"use client";

interface SnapshotSummaryProps {
  recommendations?: string[];
  summary?: string;
  opportunitiesSummary?: string;
  upgradeCTA?: string;
}

export function SnapshotSummary({
  recommendations,
  summary,
  opportunitiesSummary,
  upgradeCTA,
}: SnapshotSummaryProps) {
  return (
    <div className="mt-10 space-y-8">
      {/* Summary */}
      {summary && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-brand-navy mb-3">
            Summary
          </h2>
          <p className="text-slate-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Opportunities Summary */}
      {opportunitiesSummary && (
        <div className="bg-slate-50 rounded-lg p-6 border-l-4 border-brand-blue">
          <h2 className="text-lg font-semibold text-brand-navy mb-3">
            Opportunities
          </h2>
          <p className="text-slate-700 leading-relaxed">{opportunitiesSummary}</p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-brand-navy mb-4">
            Recommended Next Steps
          </h2>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start">
                <span className="text-brand-blue mr-2">•</span>
                <span className="text-slate-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upgrade CTA */}
      {upgradeCTA && (
        <div className="bg-gradient-to-r from-brand-blue to-brand-navy rounded-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-3">Upgrade to Snapshot+</h2>
          <p className="text-blue-50 leading-relaxed mb-4">{upgradeCTA}</p>
          <a
            href="#"
            className="inline-block bg-white text-brand-blue px-6 py-2 rounded-md font-semibold hover:bg-blue-50 transition"
          >
            Learn More →
          </a>
        </div>
      )}
    </div>
  );
}

