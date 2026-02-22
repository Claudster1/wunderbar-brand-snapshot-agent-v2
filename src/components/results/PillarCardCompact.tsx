import { getScoreBand } from "@/src/lib/pillars/pillarReportCopy";
import type { PillarKey } from "@/src/types/pillars";

interface PillarCardCompactProps {
  pillar: PillarKey;
  pillarLabel: string;
  score: number;
  insight: string;
  isPrimaryOpportunity?: boolean;
}

function getBadgeClassesFromScore(score: number): string {
  if (score >= 17) return "bg-[#34c759]/15 text-[#34c759]";
  if (score >= 13) return "bg-[#ffcc00]/20 text-[#b38600]";
  if (score >= 9) return "bg-[#ff9500]/15 text-[#ff9500]";
  return "bg-[#ff3b30]/15 text-[#ff3b30]";
}

export function PillarCardCompact({
  pillar,
  pillarLabel,
  score,
  insight,
  isPrimaryOpportunity = false,
}: PillarCardCompactProps) {
  const band = getScoreBand(score);
  const badgeClasses = getBadgeClassesFromScore(score);

  return (
    <div
      className={`bs-card rounded-xl p-5 sm:p-6 min-h-[200px] h-full flex flex-col relative ${
        isPrimaryOpportunity ? "ring-2 ring-brand-blue/40 shadow-md" : ""
      }`}
    >
      {isPrimaryOpportunity && (
        <span className="absolute -top-3 left-4 bg-brand-blue text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
          Primary opportunity
        </span>
      )}
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
      <p className="text-2xl font-bold tabular-nums text-brand-navy leading-none mb-3">
        {score}
        <span className="bs-body-sm font-bold text-brand-muted">/20</span>
      </p>
      <p className="bs-small text-brand-muted">
        {band.description}
      </p>
      {insight && (
        <p className="bs-small text-brand-navy mt-3 leading-relaxed">
          {insight}
        </p>
      )}
    </div>
  );
}
