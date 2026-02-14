// src/components/ScoreGauge.tsx
// Semi-circular gauge: five segments (red → orange → yellow → light green → dark green) for 0–20, 20–40, 40–60, 60–80, 80–100.
// Segment boundaries must match rating labels: see src/lib/results/scoreBands.ts (60–80 = Strong = light green; 72 is in this band).

const SCORE_RANGES = [
  { min: 80, max: 100, color: "#34c759", label: "Strong alignment" },
  { min: 60, max: 79, color: "#8bc34a", label: "Moderate alignment" },
  { min: 40, max: 59, color: "#ffcc00", label: "Partial alignment" },
  { min: 20, max: 39, color: "#ff9500", label: "Weak alignment" },
  { min: 0, max: 19, color: "#ff3b30", label: "Low alignment" },
] as const;

function getActiveRange(score: number) {
  return SCORE_RANGES.find((r) => score >= r.min && score <= r.max) ?? SCORE_RANGES[4];
}

/** Score range legend — shows color swatches, ranges, labels, and highlights the active band */
export function ScoreRangeLegend({ score }: { score: number }) {
  const activeRange = getActiveRange(score);

  return (
    <div className="w-full max-w-[220px]">
      <span className="block text-[11px] font-black text-[#07B0F2] uppercase tracking-[1.5px] mb-3">
        Score Ranges
      </span>
      <div className="space-y-0">
        {SCORE_RANGES.map((range) => {
          const isActive = range === activeRange;
          return (
            <div
              key={range.min}
              className={`flex items-center gap-2.5 py-2 border-b border-[#E6EAF2] last:border-b-0 ${
                isActive ? "bg-[rgba(139,195,74,0.1)] rounded -mx-2 px-2" : ""
              }`}
            >
              <span
                className="inline-block w-3.5 h-3.5 rounded-[3px] flex-shrink-0"
                style={{ backgroundColor: range.color }}
              />
              <span className={`text-sm min-w-[48px] ${isActive ? "font-bold text-[#021859]" : "font-black text-[#021859]"}`}>
                {range.min}–{range.max}
              </span>
              <span className={`text-sm ${isActive ? "font-bold text-[#021859]" : "text-[#404040]"}`}>
                {range.label}
              </span>
              {isActive && (
                <span className="text-xs font-black text-[#8bc34a] ml-auto whitespace-nowrap">
                  ← {Math.round(score)}
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
  const resolvedValue = value ?? score ?? 0;
  const clamped = Math.min(100, Math.max(0, resolvedValue));
  const radius = 90;
  const cx = 100;
  const cy = 100;

  // Needle: 0% = left (180°), 50% = up (90°), 100% = right (0°). Needle drawn pointing up, then rotated.
  const needleRotation = 90 - (clamped / 100) * 180;

  // Arc segment endpoints (top semicircle: 180° left → 0° right). 20% per segment: 0–20→180°–144°, 20–40→144°–108°, 40–60→108°–72°, 60–80→72°–36°, 80–100→36°–0°.
  const deg = (d: number) => (d * Math.PI) / 180;
  const pt = (angle: number) => ({
    x: cx + radius * Math.cos(deg(angle)),
    y: cy - radius * Math.sin(deg(angle)),
  });
  const p180 = pt(180);
  const p144 = pt(144);
  const p108 = pt(108);
  const p72 = pt(72);
  const p36 = pt(36);
  const p0 = pt(0);

  const segment = (x1: number, y1: number, x2: number, y2: number) =>
    `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;

  const strokeWidth = 16;
  // ViewBox: arc (y ~10–100), clear gap, then score text so needle never overlaps number
  const viewBoxHeight = 175;
  const scoreY = 138;
  const labelY = 156;

  const gauge = (
    <svg
      viewBox={`0 0 200 ${viewBoxHeight}`}
      width="100%"
      height="auto"
      className="mx-auto block"
      style={{ maxWidth: showLegend ? "220px" : "280px", aspectRatio: "200 / 175" }}
    >
      <defs>
        <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Five distinct color segments (solid, not gradient) */}
      <path d={segment(p180.x, p180.y, p144.x, p144.y)} fill="none" stroke="#ff3b30" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d={segment(p144.x, p144.y, p108.x, p108.y)} fill="none" stroke="#ff9500" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d={segment(p108.x, p108.y, p72.x, p72.y)} fill="none" stroke="#ffcc00" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d={segment(p72.x, p72.y, p36.x, p36.y)} fill="none" stroke="#8bc34a" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d={segment(p36.x, p36.y, p0.x, p0.y)} fill="none" stroke="#34c759" strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Needle: from center pointing up, then rotated to score position */}
      <g transform={`rotate(${needleRotation} ${cx} ${cy})`} filter="url(#needleShadow)">
        <line x1={cx} y1={cy} x2={cx} y2={cy - radius + 4} stroke="#021859" strokeWidth="4" strokeLinecap="round" />
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
