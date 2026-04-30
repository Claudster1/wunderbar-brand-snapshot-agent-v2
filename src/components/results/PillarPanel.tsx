// components/results/PillarPanel.tsx
// Report pillar card: green→red gradient meter, score key, pillar-specific copy, tooltips.

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

interface Props {
  pillar: string;
  score: number;
  insight: string;
  expanded: boolean;
  isPrimary?: boolean;
  stage: "early" | "scaling" | "growing";
  businessName: string;
}

export function PillarPanel({
  pillar,
  score,
  insight,
  expanded,
  isPrimary = false,
  stage,
  businessName,
}: Props) {
  const pillarKey = pillar as PillarKey;
  const stageCopy = getPillarStageCopy(pillarKey, businessName, stage);
  const band = getScoreBand(score);
  const scoreVisual = getPillarScoreVisual(score);
  const opportunity = PILLAR_OPPORTUNITY[pillarKey];
  const opportunityExpanded = PILLAR_OPPORTUNITY_EXPANDED[pillarKey];
  const percent = (score / 20) * 100;

  return (
    <div
      className={`
        bs-card rounded-xl p-6 sm:p-7
        ${isPrimary ? "ring-2 ring-brand-blue/30" : ""}
      `}
    >
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0 pt-0.5">
          <p className={`m-0 mb-1.5 ${SUITE_SECTION_KICKER_CLASS}`}>Pillar</p>
          <h3 className="bs-h4 m-0 capitalize text-brand-navy">{pillar}</h3>
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
      </header>

      {/* Meter: full green→red gradient, needle at score */}
      <div className="mt-4 relative">
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{
            background: PILLAR_SCORE_METER_GRADIENT,
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

      {/* Score key: light blue shell; band label + numerals follow result colors */}
      <div className="mt-4 rounded-xl border border-brand-border/55 border-l-[5px] border-l-brand-blue bg-gradient-to-r from-[#eff6ff] via-[#f5faff] to-white px-4 py-3 space-y-2 shadow-sm">
        <p className={`m-0 ${SUITE_SECTION_KICKER_CLASS}`}>Pillar Score</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
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
        <p className="bs-small text-brand-midnight leading-relaxed m-0">{band.description}</p>
        {score < 20 && (
          <div className="space-y-2 border-t border-brand-border/45 pt-3 mt-3">
            <p className={`m-0 ${SUITE_SECTION_KICKER_CLASS}`}>Biggest Opportunity</p>
            <p className="bs-small text-brand-navy flex flex-wrap items-baseline gap-2 m-0">
              <span>{opportunity}</span>
              <TooltipIcon
                content={
                  <>This is the highest-impact area to improve for {pillar}. Focusing here will lift your overall WunderBrand Score™.</>
                }
              />
            </p>
            <p className="bs-small text-brand-muted pl-0 m-0 leading-relaxed">{opportunityExpanded}</p>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-5 space-y-4">
          <p className="bs-body-sm text-brand-navy">
            {insight}
          </p>
          <p className="bs-small text-brand-muted">
            {stageCopy}
          </p>
        </div>
      )}
    </div>
  );
}
