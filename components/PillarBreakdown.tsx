// components/PillarBreakdown.tsx
// Five pillar breakdown: green→red gradient meters, score key, pillar-specific copy, tooltips

"use client";

import {
  getPillarStageCopy,
  getPillarScoreVisual,
  getScoreBand,
  PILLAR_OPPORTUNITY,
  PILLAR_OPPORTUNITY_EXPANDED,
  PILLAR_SCORE_METER_GRADIENT,
} from "@/src/lib/pillars/pillarReportCopy";
import type { PillarKey } from "@/src/lib/pillars/pillarCopy";
import { SUITE_SECTION_KICKER_CLASS } from "@/components/results/suiteBrandTokens";
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
    <div className="space-y-8 md:space-y-10">
      <div className="mb-0 pb-5 border-b border-brand-border/80 sm:pb-6">
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.12em] text-brand-blue mb-4">
          Pillar scores
        </p>
        <h2 className="bs-h2 mb-1">Brand Pillar Analysis</h2>
        <p className="bs-body-sm text-brand-muted max-w-2xl">
          Each bar is your 0–20 pillar score. Below it, we separate score context from strengths, gaps, and next moves.
        </p>
      </div>
      <div className="bs-card rounded-xl bg-brand-bg/90 px-5 py-5 sm:px-6 sm:py-6 mb-8 border border-brand-border/60">
        <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
          <span className="text-base sm:text-lg font-bold text-brand-navy">How to Read Your Scores</span>
          <TooltipIcon
            content={
              <>
                Each pillar is scored 0–20. The bar runs from red (needs work) to green (strong). Your dot shows where you land. Your overall WunderBrand Score™ (0–100) weights these pillars by strategic importance — positioning, messaging, and credibility count more than visibility and conversion — so the headline number is not a simple sum of the five bars.
              </>
            }
          />
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-4 p-0">
          <li className="flex flex-col gap-2.5 rounded-lg border border-brand-border/45 bg-white/50 px-4 py-4 sm:px-5 sm:py-4">
            <span className="text-base sm:text-lg font-bold tabular-nums text-[#ff3b30]">0–8</span>
            <span className="text-base sm:text-[1.05rem] leading-snug text-brand-midnight">Critical opportunity</span>
          </li>
          <li className="flex flex-col gap-2.5 rounded-lg border border-brand-border/45 bg-white/50 px-4 py-4 sm:px-5 sm:py-4">
            <span className="text-base sm:text-lg font-bold tabular-nums text-[#ff9500]">9–12</span>
            <span className="text-base sm:text-[1.05rem] leading-snug text-brand-midnight">Needs focus</span>
          </li>
          <li className="flex flex-col gap-2.5 rounded-lg border border-brand-border/45 bg-white/50 px-4 py-4 sm:px-5 sm:py-4">
            <span className="text-base sm:text-lg font-bold tabular-nums text-[#ca8a04]">13–16</span>
            <span className="text-base sm:text-[1.05rem] leading-snug text-brand-midnight">Developing</span>
          </li>
          <li className="flex flex-col gap-2.5 rounded-lg border border-brand-border/45 bg-white/50 px-4 py-4 sm:px-5 sm:py-4">
            <span className="text-base sm:text-lg font-bold tabular-nums text-[#34c759]">17–20</span>
            <span className="text-base sm:text-[1.05rem] leading-snug text-brand-midnight">Strong</span>
          </li>
        </ul>
      </div>

      <div className="space-y-6 sm:space-y-7">
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
          const scoreVisual = getPillarScoreVisual(score);
          const pillarOpportunity = PILLAR_OPPORTUNITY[pillar.key];
          const pillarOpportunityExpanded = PILLAR_OPPORTUNITY_EXPANDED[pillar.key];
          const stageCopy = getPillarStageCopy(pillar.key, businessName, stage);

          return (
            <div
              key={pillar.key}
              className="fadein bs-card rounded-xl p-6 sm:p-7"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-6 mb-5">
                <div className="min-w-0 pt-0.5">
                  <p className={`m-0 mb-1.5 ${SUITE_SECTION_KICKER_CLASS}`}>Pillar</p>
                  <h3 className="bs-h4 m-0 capitalize text-brand-navy">{pillar.label}</h3>
                </div>
                <div className="flex items-baseline gap-3 shrink-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-2xl sm:text-[32px] font-bold tabular-nums leading-none"
                      style={{ color: scoreVisual.headline }}
                    >
                      {score}
                    </span>
                    <span
                      className="bs-body-sm font-bold tabular-nums"
                      style={{ color: scoreVisual.headline }}
                    >
                      /20
                    </span>
                  </div>
                  <TooltipIcon
                    content={
                      <>
                        Each pillar is scored 0–20. Higher means stronger alignment in that area. Green = strong, red = biggest opportunity.
                      </>
                    }
                  />
                </div>
              </div>

              {/* Meter: needle is only vertically centered on the bar track (not the axis labels) */}
              <div className="mb-6">
                <div className="relative z-0 h-4 w-full sm:h-[18px]">
                  <div
                    className="absolute inset-0 rounded-full overflow-hidden shadow-inner ring-1 ring-black/[0.06]"
                    style={{
                      background: PILLAR_SCORE_METER_GRADIENT,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#0a0a0a] shadow-md ring-2 ring-black/15 transition-[left] duration-500 ease-out"
                    style={{ left: `${percent}%` }}
                    aria-hidden
                  />
                </div>
                <div className="mt-2 flex justify-between bs-small text-brand-muted tabular-nums font-medium">
                  <span>0</span>
                  <span>20</span>
                </div>
              </div>

              {/* Score readout — light blue shell; band + numerals use result colors */}
              <div className="mb-5 rounded-xl border border-brand-border/55 border-l-[5px] border-l-brand-blue bg-gradient-to-r from-[#eff6ff] via-[#f5faff] to-white px-4 py-4 sm:px-5 sm:py-5 shadow-sm">
                <p className={`m-0 mb-3 ${SUITE_SECTION_KICKER_CLASS}`}>Pillar Score</p>
                <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide"
                    style={{
                      color: scoreVisual.headline,
                      backgroundColor: scoreVisual.softBg,
                      border: `1px solid ${scoreVisual.softBorder}`,
                    }}
                  >
                    {band.label}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    <span className="bs-body-sm font-bold tabular-nums text-brand-navy">
                      Score{" "}
                      <span style={{ color: scoreVisual.headline }}>{score}</span>
                      <span style={{ color: scoreVisual.headline }}>/20</span>
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
                </div>
                <p className="m-0 text-[15px] leading-relaxed text-brand-midnight sm:text-base">
                  {band.description}
                </p>
              </div>

              {score < 20 && (
                <div className="mb-5 overflow-hidden rounded-xl border border-brand-border/55 border-l-[5px] border-l-brand-blue bg-white shadow-sm">
                  <div className="flex items-start gap-3 border-b border-brand-border/50 bg-gradient-to-r from-[#eff6ff] via-[#f5faff] to-white px-4 py-3 sm:px-5 sm:py-3.5">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue text-sm font-black text-white shadow-sm"
                      aria-hidden
                    >
                      !
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className={`m-0 ${SUITE_SECTION_KICKER_CLASS}`}>
                        Biggest Opportunity — {pillar.label}
                      </p>
                      <p className="mt-1.5 m-0 flex flex-wrap items-baseline gap-2 text-sm font-semibold leading-snug text-brand-navy sm:text-[15px]">
                        <span>{pillarOpportunity}</span>
                        <TooltipIcon
                          content={
                            <>
                              This is the highest-impact area to improve for {pillar.label}. Focusing here will lift your overall WunderBrand Score™.
                            </>
                          }
                        />
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-4 sm:px-5 sm:py-5">
                    <p className="m-0 text-sm leading-[1.65] text-brand-midnight sm:text-[15px] sm:leading-relaxed">
                      {pillarOpportunityExpanded}
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-xl border border-dashed border-brand-border/70 bg-brand-bg/40 px-4 py-4 sm:px-5 sm:py-4">
                <p className={`m-0 mb-2 ${SUITE_SECTION_KICKER_CLASS}`}>Why This Pillar Matters</p>
                <p className="m-0 text-sm leading-[1.65] text-brand-midnight sm:text-[15px] sm:leading-relaxed">
                  {stageCopy}
                </p>
              </div>

              {/* Insight content — panels so scores vs narrative don’t run together */}
              {isNewFormat && (strength || opportunity || action) ? (
                <div className="space-y-4 sm:space-y-5">
                  {strength && (
                    <div className="rounded-xl border border-brand-border/50 border-l-[5px] border-l-[#34c759] bg-[#f0fdf4]/90 px-4 py-4 sm:px-5 sm:py-4 shadow-sm">
                      <p className={`m-0 mb-2 ${SUITE_SECTION_KICKER_CLASS}`}>Strength</p>
                      <p className="bs-body-sm text-brand-navy leading-[1.65] sm:leading-relaxed">{strength}</p>
                    </div>
                  )}
                  {opportunity && (
                    <div className="rounded-xl border border-brand-border/50 border-l-[5px] border-l-brand-blue bg-[#eff6ff]/80 px-4 py-4 sm:px-5 sm:py-4 shadow-sm">
                      <p className={`m-0 mb-2 ${SUITE_SECTION_KICKER_CLASS}`}>Opportunity</p>
                      <p className="bs-body-sm text-brand-navy leading-[1.65] sm:leading-relaxed">{opportunity}</p>
                    </div>
                  )}
                  {action && (
                    <div className="rounded-xl border border-brand-border/50 border-l-[5px] border-l-[#ea580c] bg-[#fff7ed]/90 px-4 py-4 sm:px-5 sm:py-4 shadow-sm">
                      <p className={`m-0 mb-2 ${SUITE_SECTION_KICKER_CLASS}`}>Next Step</p>
                      <p className="bs-body-sm text-brand-navy leading-[1.65] sm:leading-relaxed">{action}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-brand-border/60 bg-white/80 px-4 py-3">
                  <p className="bs-body-sm text-brand-navy leading-relaxed">{fallbackInsight}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
