// components/SnapshotPillars.tsx
// Component to display pillar scores and insights

"use client";

interface SnapshotPillarsProps {
  scores: {
    positioning?: number;
    messaging?: number;
    visibility?: number;
    credibility?: number;
    conversion?: number;
  };
  insights?: {
    positioning?: string;
    messaging?: string;
    visibility?: string;
    credibility?: string;
    conversion?: string;
  };
}

export function SnapshotPillars({ scores, insights }: SnapshotPillarsProps) {
  const pillars = [
    { key: "positioning", label: "Positioning" },
    { key: "messaging", label: "Messaging" },
    { key: "visibility", label: "Visibility" },
    { key: "credibility", label: "Credibility" },
    { key: "conversion", label: "Conversion" },
  ];

  const getPillarTagClass = (score: number): string => {
    if (score >= 18) return "bg-green-100 text-green-800 border-green-500";
    if (score >= 15) return "bg-yellow-100 text-yellow-800 border-yellow-500";
    if (score >= 11) return "bg-amber-100 text-amber-800 border-amber-400";
    if (score >= 8) return "bg-green-100 text-green-800 border-green-500";
    return "bg-red-100 text-red-800 border-red-500";
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-brand-navy mb-6">
        How Your Score Breaks Down
      </h2>
      <div className="space-y-6">
        {pillars.map((pillar) => {
          const score = scores[pillar.key as keyof typeof scores] || 0;
          const insight =
            insights?.[pillar.key as keyof typeof insights] || "No insight available.";
          const percent = (score / 20) * 100;

          return (
            <div
              key={pillar.key}
              className="bg-slate-50 rounded-lg p-5 border-l-4 border-brand-blue"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy capitalize">
                    {pillar.label}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${getPillarTagClass(
                      score
                    )}`}
                  >
                    {score}/20
                  </span>
                </div>
              </div>
              {/* Meter */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              {/* Insight */}
              <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

