"use client";

// src/components/ScoreGauge.tsx
// Semi-circular gauge: same smooth red→green gradient as pillar meters (PILLAR_SCORE_METER_GRADIENT_STOPS).
// Legend bands: src/lib/results/scoreBands.ts (OVERALL_SCORE_GAUGE_RANGES).

import { useId } from "react";
import { PILLAR_SCORE_METER_GRADIENT_STOPS } from "@/src/lib/pillars/pillarReportCopy";
import { getGaugeAccentForScore, OVERALL_SCORE_GAUGE_RANGES } from "@/src/lib/results/scoreBands";

/** Score range legend — shows color swatches, ranges, labels, and highlights the active band */
export function ScoreRangeLegend({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));
  const active = getGaugeAccentForScore(score);

  return (
    <div className="w-full max-w-[220px]">
      <span className="block text-[11px] font-black text-[#07B0F2] tracking-[0.06em] mb-3">
        Score Ranges
      </span>
      <div className="space-y-0">
        {OVERALL_SCORE_GAUGE_RANGES.map((range) => {
          const isActive = range.min === active.min && range.max === active.max;
          return (
            <div
              key={range.min}
              className={`flex items-center gap-2.5 py-2 border-b border-[#E6EAF2] last:border-b-0 ${
                isActive ? "bg-[rgba(139,195,74,0.1)] rounded -mx-2 px-2" : ""
              }`}
            >
              <span
                className="inline-block w-3.5 h-3.5 rounded-[3px] flex-shrink-0"
                style={{ backgroundColor: range.stroke }}
              />
              <span className={`text-sm min-w-[48px] ${isActive ? "font-bold text-[#021859]" : "font-black text-[#021859]"}`}>
                {range.min}–{range.max}
              </span>
              <span className={`text-sm ${isActive ? "font-bold text-[#021859]" : "text-[#404040]"}`}>
                {range.label}
              </span>
              {isActive && (
                <span className="text-xs font-black text-[#8bc34a] ml-auto whitespace-nowrap">
                  ← {clamped}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScoreGauge({ value, score, size, showLegend = false }: { value?: number; score?: number; size?: number; showLegend?: boolean }) {
  const reactId = useId().replace(/:/g, "");
  const gradId = `${reactId}-score-gauge-arc`;
  const filterId = `${reactId}-needle-shadow`;

  const resolvedValue = value ?? score ?? 0;
  const clamped = Math.min(100, Math.max(0, resolvedValue));
  const radius = 90;
  const cx = 100;
  const cy = 100;

  // Arc segment endpoints (top semicircle: 180° left → 0° right). 20% per segment: 0–20→180°–144°, …
  const deg = (d: number) => (d * Math.PI) / 180;
  const pt = (angle: number) => ({
    x: cx + radius * Math.cos(deg(angle)),
    y: cy - radius * Math.sin(deg(angle)),
  });
  const p180 = pt(180);
  const p0 = pt(0);

  // Needle tip on upper semicircle: 180° = left (0%), 90° = top (50%), 0° = right (100%).
  const angleDeg = 180 - (clamped / 100) * 180;
  const angleRad = deg(angleDeg);
  const tipR = radius - 4;
  const tipX = cx + tipR * Math.cos(angleRad);
  const tipY = cy - tipR * Math.sin(angleRad);

  // Sweep 0 = upper semicircle (y ≤ cy); sweep 1 = lower. Needle uses angles along the upper arc
  // (same convention as `app/preview/results/page.tsx` MainGauge). Mismatch was red arc + needle in green zone.
  const fullArcD = `M ${p180.x} ${p180.y} A ${radius} ${radius} 0 0 0 ${p0.x} ${p0.y}`;

  const strokeWidth = 16;
  // ViewBox: arc (y ~10–100), clear gap, then score text so needle never overlaps number
  const viewBoxHeight = 175;
  const scoreY = 138;
  const labelY = 156;

  const gauge = (
    <svg
      viewBox={`0 0 200 ${viewBoxHeight}`}
      width="100%"
      className="mx-auto block"
      style={{ maxWidth: showLegend ? "220px" : "280px", aspectRatio: "200 / 175" }}
    >
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={p180.x} y1={cy} x2={p0.x} y2={cy}>
          {PILLAR_SCORE_METER_GRADIENT_STOPS.map((s) => (
            <stop key={s.pct} offset={`${s.pct}%`} stopColor={s.color} />
          ))}
        </linearGradient>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
        </filter>
      </defs>

      <path
        d={fullArcD}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      <g filter={`url(#${filterId})`}>
        <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke="#021859" strokeWidth="4" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="8" fill="#021859" />
      </g>

      {/* Score well below arc/needle so needle never overlaps */}
      <text x={cx} y={scoreY} textAnchor="middle" className="fill-[#021859] font-semibold tabular-nums" style={{ fontSize: "32px", fontWeight: 600 }}>
        {Math.round(clamped)}
      </text>
      <text x={cx} y={labelY} textAnchor="middle" className="fill-[#5a6c8a]" style={{ fontSize: "12px" }}>
        out of 100
      </text>
    </svg>
  );

  if (!showLegend) return gauge;

  return (
    <div className="flex items-center justify-center gap-10 sm:gap-16 bg-[#F8FAFC] border-2 border-[#07B0F2] rounded-xl p-6 sm:p-8 max-w-[600px] mx-auto">
      <div className="flex-shrink-0 w-[200px] sm:w-[220px]">
        {gauge}
      </div>
      <ScoreRangeLegend score={clamped} />
    </div>
  );
}
