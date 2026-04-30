"use client";

import { getPillarScoreVisual } from "@/src/lib/pillars/pillarReportCopy";
import type { PillarKey } from "@/src/types/pillars";

const ORDER: PillarKey[] = ["positioning", "messaging", "visibility", "credibility", "conversion"];

const LABELS: Record<PillarKey, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

type Props = {
  pillars: Partial<Record<PillarKey, number>>;
};

/** Compact horizontal bars — same 0–20 scale as Brand Pillar Analysis. */
export function PillarScoreBars({ pillars }: Props) {
  return (
    <div className="flex w-full flex-col gap-3.5 py-0.5 sm:gap-4" role="list" aria-label="Pillar scores zero to twenty as bars">
      {ORDER.map((key) => {
        const raw = pillars[key];
        const score = typeof raw === "number" && !Number.isNaN(raw) ? Math.min(20, Math.max(0, raw)) : 0;
        const pct = (score / 20) * 100;
        const vis = getPillarScoreVisual(score);
        return (
          <div
            key={key}
            className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-2 py-1 sm:gap-3"
            role="listitem"
          >
            <span className="truncate text-xs font-semibold text-brand-navy sm:text-sm">{LABELS[key]}</span>
            <div className="min-w-0 px-0.5">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80 sm:h-3">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: vis.stroke,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35)`,
                  }}
                />
              </div>
            </div>
            <span className="tabular-nums text-xs font-bold text-brand-navy sm:text-sm">{score}/20</span>
          </div>
        );
      })}
    </div>
  );
}
