// components/PillarBreakdown.tsx
// Five pillar breakdown with insights and staggered animations

"use client";

interface PillarInsight {
  score?: number;
  severity?: string;
  tier?: string;
  strength?: string;
  opportunity?: string;
  action?: string;
}

interface PillarBreakdownProps {
  pillars: {
    positioning?: number;
    messaging?: number;
    visibility?: number;
    credibility?: number;
    conversion?: number;
  };
  insights: {
    positioning?: string | PillarInsight;
    messaging?: string | PillarInsight;
    visibility?: string | PillarInsight;
    credibility?: string | PillarInsight;
    conversion?: string | PillarInsight;
  };
}

export function PillarBreakdown({
  pillars,
  insights,
}: PillarBreakdownProps) {
  const pillarList = [
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

  const getPillarMeterColor = (score: number): string => {
    if (score >= 18) return "from-green-500 to-emerald-600";
    if (score >= 15) return "from-brand-blue to-brand-aqua";
    if (score >= 11) return "from-yellow-400 to-amber-500";
    if (score >= 8) return "from-green-400 to-emerald-500";
    return "from-red-400 to-rose-500";
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-brand-navy mb-6">
        How Your Score Breaks Down
      </h2>
      <div className="space-y-6">
        {pillarList.map((pillar, index) => {
          const score = pillars[pillar.key as keyof typeof pillars] || 0;
          const insightData = insights[pillar.key as keyof typeof insights];
          
          // Handle both old format (string) and new format (object with strength, opportunity, action)
          const isNewFormat = insightData && typeof insightData === 'object' && 'strength' in insightData;
          
          const strength = isNewFormat ? (insightData as PillarInsight).strength : null;
          const opportunity = isNewFormat ? (insightData as PillarInsight).opportunity : null;
          const action = isNewFormat ? (insightData as PillarInsight).action : null;
          const fallbackInsight = typeof insightData === 'string' ? insightData : "No insight available.";
          
          const percent = (score / 20) * 100;

          return (
            <div
              key={pillar.key}
              className={`fadein bg-white rounded-xl p-6 shadow-md border-l-4 border-brand-blue`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Pillar Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-brand-navy capitalize">
                    {pillar.label}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPillarTagClass(
                      score
                    )}`}
                  >
                    {score}/20
                  </span>
                </div>
              </div>

              {/* Mini Meter */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full bg-gradient-to-r ${getPillarMeterColor(
                    score
                  )} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Dynamic Insights */}
              {isNewFormat && strength && opportunity && action ? (
                <div className="space-y-3">
                  {strength && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1">Strength</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{strength}</p>
                    </div>
                  )}
                  {opportunity && (
                    <div>
                      <p className="text-xs font-semibold text-brand-blue mb-1">Opportunity</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{opportunity}</p>
                    </div>
                  )}
                  {action && (
                    <div>
                      <p className="text-xs font-semibold text-amber-700 mb-1">Next Step</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{action}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed">{fallbackInsight}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

