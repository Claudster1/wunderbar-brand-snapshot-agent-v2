"use client";

import { useMemo } from "react";
import type { ScheduleRow } from "@/components/ExecutionSchedule";

const BLUE = "#07b0f2";
const TRACK = "rgba(2, 24, 89, 0.08)";

type Props = {
  rows: ScheduleRow[];
};

/**
 * Row counts by channel — quick visual of where the schedule invests effort.
 */
export function ActivationChannelMixChart({ rows }: Props) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const ch = (r.channel || "Other").trim() || "Other";
      map.set(ch, (map.get(ch) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [rows]);

  if (counts.length === 0) return null;

  const max = counts[0]?.[1] ?? 1;

  return (
    <div
      className="mb-6 rounded-xl border border-slate-200/90 bg-white px-5 py-5 shadow-sm sm:px-6 sm:py-6"
      role="img"
      aria-label="Activation schedule row counts by channel"
    >
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-brand-blue">Visual</p>
      <p className="mt-1 text-sm font-semibold text-brand-navy sm:text-base">Schedule mix by channel</p>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted sm:text-[13px]">
        Each bar is the number of scheduled rows for that channel in your plan (not dollars or reach).
      </p>
      <ul className="mt-5 space-y-3 p-0 list-none m-0">
        {counts.map(([channel, n]) => {
          const pct = Math.round((n / max) * 100);
          return (
            <li key={channel} className="py-0.5">
              <div className="mb-1 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="min-w-0 truncate font-medium text-brand-navy">{channel}</span>
                <span className="shrink-0 tabular-nums font-semibold text-brand-muted">{n}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: TRACK }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(8, pct)}%`, background: BLUE }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
