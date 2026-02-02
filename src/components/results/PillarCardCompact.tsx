// Compact pillar card for grid: title, score, grade badge, description (sample-style)

import { getScoreBand } from "@/src/lib/pillars/pillarReportCopy";
import type { PillarKey } from "@/src/types/pillars";

interface PillarCardCompactProps {
  pillar: PillarKey;
  pillarLabel: string;
  score: number;
  insight: string;
}

// Pill colors match the score meter: red → orange → yellow → green (0–8, 9–12, 13–16, 17–20)
function getBadgeClassesFromScore(score: number): string {
  if (score >= 17) return "bg-[#34c759]/15 text-[#34c759]";       // green — Strong
  if (score >= 13) return "bg-[#ffcc00]/20 text-[#b38600]";     // yellow — Developing
  if (score >= 9) return "bg-[#ff9500]/15 text-[#ff9500]";     // orange — Needs focus
  return "bg-[#ff3b30]/15 text-[#ff3b30]";                      // red — Critical opportunity
}

export function PillarCardCompact({
  pillar,
  pillarLabel,
  score,
  insight,
}: PillarCardCompactProps) {
  const band = getScoreBand(score);
  const badgeClasses = getBadgeClassesFromScore(score);

  return (
    <div className="bs-card rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="bs-h4 capitalize mb-0 flex-1 min-w-0">
          {pillarLabel}
        </h3>
        <span
          className={`bs-badge shrink-0 ${badgeClasses}`}
          aria-label={`Score band: ${band.label}`}
        >
          {band.label}
        </span>
      </div>
      <p className="text-2xl font-bold tabular-nums text-brand-navy leading-none mb-2">
        {score}
        <span className="bs-body-sm font-bold text-brand-muted">/20</span>
      </p>
      <p className="bs-small text-brand-muted flex-1 line-clamp-3">
        {band.description}
      </p>
      {insight && (
        <p className="bs-small text-brand-navy mt-2 line-clamp-2">
          {insight}
        </p>
      )}
    </div>
  );
}
