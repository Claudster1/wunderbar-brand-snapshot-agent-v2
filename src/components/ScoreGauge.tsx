// src/components/ScoreGauge.tsx
// Semi-circular gauge matching sample: five solid segments (red → orange → yellow → light green → dark green), needle pivoted at center pointing to score.

export function ScoreGauge({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = 90;
  const cx = 100;
  const cy = 100;

  // Needle: 0% = left (180°), 50% = up (90°), 100% = right (0°). Needle drawn pointing up, then rotated.
  // Angle from right: 180 - (score/100)*180. Needle "up" = 90°, so rotation = (180 - score*1.8) - 90 = 90 - score*1.8.
  const needleRotation = 90 - (clamped / 100) * 180;

  // Arc segment endpoints (top semicircle: 180° left → 0° right). x = cx + r*cos(θ), y = cy - r*sin(θ)
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

  return (
    <svg
      viewBox={`0 0 200 ${viewBoxHeight}`}
      width="100%"
      height="auto"
      className="mx-auto block"
      style={{ maxWidth: "280px", aspectRatio: "200 / 175" }}
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
}
