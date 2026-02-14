// components/results/PillarPanel.tsx
// Report pillar card: green→red gradient meter, score key, pillar-specific copy, tooltips.

import { getPillarStageCopy, getScoreBand, PILLAR_OPPORTUNITY, PILLAR_OPPORTUNITY_EXPANDED } from "@/src/lib/pillars/pillarReportCopy";
import type { PillarKey } from "@/src/lib/pillars/pillarCopy";
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
        <h3 className="bs-h4 capitalize pt-0.5">
          {pillar}
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
      </header>

      {/* Meter: full green→red gradient, needle at score */}
      <div className="mt-4 relative">
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

      {/* Score key: band + what it means + biggest opportunity */}
      <div className="mt-4 rounded-xl bg-brand-bg px-4 py-3 space-y-2">
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
        <p className="bs-small text-brand-muted">
          {band.description}
        </p>
        {score < 20 && (
          <div className="space-y-2">
            <p className="bs-small text-brand-navy">
              <span className="font-bold text-brand-navy">Biggest opportunity: </span>
              <span>{opportunity}</span>
              {" "}
              <TooltipIcon
                content={
                  <>This is the highest-impact area to improve for {pillar}. Focusing here will lift your overall WunderBrand Score™.</>
                }
              />
            </p>
            <p className="bs-small text-brand-muted pl-0">
              {opportunityExpanded}
            </p>
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
