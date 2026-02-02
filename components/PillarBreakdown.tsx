// components/PillarBreakdown.tsx
// Five pillar breakdown: green→red gradient meters, score key, pillar-specific copy, tooltips

"use client";

import { getPillarStageCopy, getScoreBand, PILLAR_OPPORTUNITY, PILLAR_OPPORTUNITY_EXPANDED } from "@/src/lib/pillars/pillarReportCopy";
import type { PillarKey } from "@/src/lib/pillars/pillarCopy";
import { TooltipIcon } from "@/components/ui/Tooltip";

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
  businessName?: string;
  stage?: "early" | "scaling" | "growing";
}

export function PillarBreakdown({
  pillars,
  insights,
  businessName = "Your brand",
  stage = "scaling",
}: PillarBreakdownProps) {
  const pillarList: { key: PillarKey; label: string }[] = [
    { key: "positioning", label: "Positioning" },
    { key: "messaging", label: "Messaging" },
    { key: "visibility", label: "Visibility" },
    { key: "credibility", label: "Credibility" },
    { key: "conversion", label: "Conversion" },
  ];

  return (
    <div>
      <h2 className="bs-h2 mb-4">
        How your score breaks down
      </h2>
      <div className="bs-card rounded-xl bg-brand-bg p-4 mb-6 border-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="bs-body-sm font-bold text-brand-navy">How to read your scores</span>
          <TooltipIcon
            content={
              <>
                Each pillar is scored 0–20. The bar runs from red (needs work) to green (strong). Your dot shows where you land. Use the band under each pillar to see what your score means and your biggest opportunity.
              </>
            }
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 bs-small text-brand-muted">
          <span><strong className="text-[#ff3b30]">0–8</strong> Critical opportunity</span>
          <span><strong className="text-[#ff9500]">9–12</strong> Needs focus</span>
          <span><strong className="text-brand-blue">13–16</strong> Developing</span>
          <span><strong className="text-[#34c759]">17–20</strong> Strong</span>
        </div>
      </div>

      <div className="space-y-5">
        {pillarList.map((pillar, index) => {
          const score = pillars[pillar.key] || 0;
          const insightData = insights[pillar.key];
          const isNewFormat = insightData && typeof insightData === "object" && "strength" in insightData;
          const strength = isNewFormat ? (insightData as PillarInsight).strength : null;
          const opportunity = isNewFormat ? (insightData as PillarInsight).opportunity : null;
          const action = isNewFormat ? (insightData as PillarInsight).action : null;
          const fallbackInsight = typeof insightData === "string" ? insightData : "No insight available.";
          const percent = (score / 20) * 100;
          const band = getScoreBand(score);
          const pillarOpportunity = PILLAR_OPPORTUNITY[pillar.key];
          const pillarOpportunityExpanded = PILLAR_OPPORTUNITY_EXPANDED[pillar.key];
          const stageCopy = getPillarStageCopy(pillar.key, businessName, stage);

          return (
            <div
              key={pillar.key}
              className="fadein bs-card rounded-xl p-6 sm:p-7"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-6 mb-4">
                <h3 className="bs-h4 capitalize pt-0.5">
                  {pillar.label}
                </h3>
                <div className="flex items-baseline gap-2 shrink-0">
                  <span className="text-2xl sm:text-[32px] font-bold tabular-nums text-brand-navy leading-none">
                    {score}
                  </span>
                  <span className="bs-body-sm font-bold text-brand-muted tabular-nums">/20</span>
                  <TooltipIcon
                    content={
                      <>
                        Each pillar is scored 0–20. Higher means stronger alignment in that area. Green = strong, red = biggest opportunity.
                      </>
                    }
                  />
                </div>
              </div>

              {/* Meter: full green→red gradient, needle at score */}
              <div className="relative mb-4">
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{
                    background: "linear-gradient(to right, #ff3b30 0%, #ff9500 25%, #ffcc00 50%, #34c759 100%)",
                  }}
                />
                <div
                  className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm bg-brand-navy transition-all duration-500 ease-out pointer-events-none"
                  style={{ left: `${percent}%`, transform: "translate(-50%, -50%)" }}
                  aria-hidden
                />
                <div className="flex justify-between mt-1.5 bs-small text-brand-muted tabular-nums">
                  <span>0</span>
                  <span>20</span>
                </div>
              </div>

              {/* Score key: band + opportunity */}
              <div className="rounded-xl bg-brand-bg px-4 py-3 space-y-2 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bs-body-sm font-bold text-brand-navy">
                    Your score: {score}/20 — {band.label}
                  </span>
                  <TooltipIcon
                    content={
                      <>
                        <strong>0–8:</strong> Critical opportunity — biggest leverage.<br />
                        <strong>9–12:</strong> Needs focus — gains here lift overall alignment.<br />
                        <strong>13–16:</strong> Developing — solid base, room to improve.<br />
                        <strong>17–20:</strong> Strong — a strength; look for small refinements.
                      </>
                    }
                  />
                </div>
                <p className="bs-small text-brand-muted">{band.description}</p>
                {score < 20 && (
                  <div className="space-y-2">
                    <p className="bs-small text-brand-navy">
                      <span className="font-bold">Biggest opportunity: </span>
                      {pillarOpportunity}
                      {" "}
                      <TooltipIcon
                        content={
                          <>This is the highest-impact area to improve for {pillar.label}. Focusing here will lift your overall Brand Alignment Score™.</>
                        }
                      />
                    </p>
                    <p className="bs-small text-brand-muted">
                      {pillarOpportunityExpanded}
                    </p>
                  </div>
                )}
                <p className="bs-small text-brand-muted">
                  {stageCopy}
                </p>
              </div>

              {/* Insight content */}
              {isNewFormat && (strength || opportunity || action) ? (
                <div className="space-y-4">
                  {strength && (
                    <div>
                      <p className="bs-eyebrow text-[#34c759] mb-1">Strength</p>
                      <p className="bs-body-sm text-brand-navy">{strength}</p>
                    </div>
                  )}
                  {opportunity && (
                    <div>
                      <p className="bs-eyebrow text-brand-blue mb-1">Opportunity</p>
                      <p className="bs-body-sm text-brand-navy">{opportunity}</p>
                    </div>
                  )}
                  {action && (
                    <div>
                      <p className="bs-eyebrow text-[#ff9500] mb-1">Next step</p>
                      <p className="bs-body-sm text-brand-navy">{action}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="bs-body-sm text-brand-navy">{fallbackInsight}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
