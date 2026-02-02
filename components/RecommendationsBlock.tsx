// components/RecommendationsBlock.tsx
// Recommendations cards with Wundy icons and fade-up animations

"use client";

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
  const displayRecommendations = recommendations || [];

  return (
    <div className="mb-12 space-y-8">
      {/* Summary */}
      {summary && (
        <div className="animate-fade-in-up animation-delay-600 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-brand-navy mb-3">
            Summary
          </h2>
          <p className="text-slate-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Opportunities Summary */}
      {opportunitiesSummary && (
        <div className="animate-fade-in-up animation-delay-700 bg-slate-50 rounded-xl p-6 border-l-4 border-brand-blue">
          <h2 className="text-xl font-semibold text-brand-navy mb-3">
            Opportunities
          </h2>
          <p className="text-slate-700 leading-relaxed">
            {opportunitiesSummary}
          </p>
        </div>
      )}

      {/* Recommendations Cards — up to 6 for more value */}
      {displayRecommendations.length > 0 && (
        <div className="animate-fade-in-up animation-delay-800">
          <h2 className="text-2xl font-semibold text-brand-navy mb-2">
            Recommended Next Steps
          </h2>
          <p className="text-brand-midnight mb-6">
            These recommendations are tailored to your snapshot and are designed to build credibility and improve your brand alignment.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {displayRecommendations.slice(0, 6).map((rec, index) => (
              <div
                key={index}
                className="bg-blue-50 rounded-lg p-5 border border-blue-200 relative overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Wundy Icon in Corner */}
                <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="16" cy="16" r="15" fill="#07B0F2" />
                    <circle cx="12" cy="13" r="1.5" fill="white" />
                    <circle cx="20" cy="13" r="1.5" fill="white" />
                    <path
                      d="M 10 19 Q 16 22 22 19"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="text-brand-navy font-medium leading-relaxed relative z-10">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

