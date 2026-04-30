"use client";

import { useMemo } from "react";
import type { ScheduleRow } from "@/components/ExecutionSchedule";

/** Distinct fills for channel slices (cycles if > length). */
const SLICE_COLORS = [
  "#07b0f2",
  "#021859",
  "#0d9488",
  "#6366f1",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
  "#64748b",
];

type Props = {
  rows: ScheduleRow[];
};

function pieSlicePath(
  cx: number,
  cy: number,
  r: number,
  startRad: number,
  endRad: number,
): string {
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const sweep = endRad - startRad;
  const largeArc = sweep > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

/**
 * Row counts by channel — pie shows **share of total rows** (mix), not max-normalized bars.
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

  const total = useMemo(() => counts.reduce((s, [, n]) => s + n, 0), [counts]);

  if (counts.length === 0 || total === 0) return null;

  const cx = 50;
  const cy = 50;
  const r = 38;

  /** Start from top (-90°); accumulate in a loop (avoids mutating during `.map()`). */
  const slices = (() => {
    let cumulative = -Math.PI / 2;
    const out: Array<{
      channel: string;
      n: number;
      share: number;
      color: string;
      d: string;
      pctLabel: number;
    }> = [];
    for (let i = 0; i < counts.length; i++) {
      const [channel, n] = counts[i]!;
      const share = n / total;
      const sweep = share * 2 * Math.PI;
      const startRad = cumulative;
      cumulative += sweep;
      const endRad = cumulative;
      const color = SLICE_COLORS[i % SLICE_COLORS.length]!;
      let d: string;
      if (counts.length === 1 || Math.abs(sweep - 2 * Math.PI) < 1e-6) {
        d = "";
      } else if (sweep <= 1e-9) {
        d = "";
      } else {
        d = pieSlicePath(cx, cy, r, startRad, endRad);
      }
      out.push({ channel, n, share, color, d, pctLabel: Math.round(share * 100) });
    }
    return out;
  })();

  const ariaParts = slices.map((s) => `${s.channel}: ${s.n} rows (${s.pctLabel}%)`).join("; ");

  return (
    <div
      className="mb-6 rounded-xl border border-slate-200/90 bg-white px-5 py-5 shadow-sm sm:px-6 sm:py-6"
      role="img"
      aria-label={`Activation schedule mix by channel. ${ariaParts}`}
    >
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-brand-blue">Visual</p>
      <p className="mt-1 text-sm font-semibold text-brand-navy sm:text-base">Schedule mix by channel</p>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted sm:text-[13px]">
        Each slice is the share of scheduled rows for that channel in your plan (not dollars or reach).
      </p>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
        <div className="relative shrink-0" style={{ width: 200, height: 200 }}>
          <svg
            viewBox="0 0 100 100"
            className="h-[200px] w-[200px] overflow-visible"
            aria-hidden
          >
            {counts.length === 1 ? (
              <circle cx={cx} cy={cy} r={r} fill={slices[0]?.color ?? SLICE_COLORS[0]} />
            ) : (
              slices.map((s, i) =>
                s.d ? (
                  <path key={`${s.channel}-${i}`} d={s.d} fill={s.color} stroke="white" strokeWidth={0.75} />
                ) : null,
              )
            )}
          </svg>
        </div>

        <ul className="m-0 w-full max-w-sm list-none space-y-2.5 p-0 sm:pt-1">
          {slices.map((s, i) => (
            <li key={`${s.channel}-legend-${i}`} className="flex items-start gap-2.5 text-xs sm:text-sm">
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-sm ring-1 ring-black/10"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-brand-navy">{s.channel}</span>
                <span className="ml-2 tabular-nums text-brand-muted">
                  {s.n} ({s.pctLabel}%)
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
