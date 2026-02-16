"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy-load heavy interactive components to reduce initial bundle size
const ReportNav = dynamic(() => import("@/components/reports/ReportNav"), { ssr: false });
const WundyChat = dynamic(() => import("@/components/wundy/WundyChat"), { ssr: false });

// ─── BRAND TOKENS ───
const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const GREEN = "#22C55E";
const YELLOW = "#EAB308";
const ORANGE = "#F97316";
const RED_S = "#EF4444";
const ACCENT_BG = "#E8F6FE";

const GOOD_GREEN = "#4ADE80";

// ─── SCORE COLOR LOGIC ───
function scoreColor(pct: number) {
  if (pct >= 80) return GREEN;
  if (pct >= 60) return GOOD_GREEN;
  if (pct >= 40) return YELLOW;
  if (pct >= 20) return ORANGE;
  return RED_S;
}
function scoreLabel(pct: number) {
  if (pct >= 80) return "Strong";
  if (pct >= 60) return "Good";
  if (pct >= 40) return "Fair";
  if (pct >= 20) return "Weak";
  return "Critical";
}

// ─── ANIMATED NUMBER ───
function AnimNum({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    function tick(now: number) {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(ease * value));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{display}</>;
}

// ─── MAIN GAUGE (Smooth multi-segment arc) ───
function MainGauge({ score }: { score: number }) {
  const [animScore, setAnimScore] = useState(0);
  const W = 280;
  const strokeW = 24;
  const R = 90;
  const pad = 22;
  const cx = W / 2;
  const cy = R + strokeW / 2 + pad;
  const svgH = cy + 8;
  const svgW = W;

  useEffect(() => {
    let frame: number;
    const t0 = performance.now();
    function tick(now: number) {
      const p = Math.min((now - t0) / 1400, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimScore(ease * score);
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  function pol(deg: number, r: number) {
    const rad = (deg * Math.PI) / 180;
    // Round to 2 decimal places to prevent hydration mismatches from floating-point differences
    return { 
      x: Math.round((cx + r * Math.cos(rad)) * 100) / 100, 
      y: Math.round((cy - r * Math.sin(rad)) * 100) / 100 
    };
  }

  const stops: [number, number[]][] = [
    [0, [239, 68, 68]],
    [0.25, [249, 115, 22]],
    [0.45, [234, 179, 8]],
    [0.65, [74, 222, 128]],
    [1, [22, 128, 61]],
  ];

  function getColor(t: number) {
    let i = 0;
    for (let k = 1; k < stops.length; k++) {
      if (t <= stops[k][0]) { i = k - 1; break; }
    }
    if (t >= stops[stops.length - 1][0]) i = stops.length - 2;
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    const f = (t - t0) / (t1 - t0);
    const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
    const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
    const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
    return `rgb(${r},${g},${b})`;
  }

  const numSegs = 60;
  const arcSegs: { d: string; color: string }[] = [];
  for (let i = 0; i < numSegs; i++) {
    const pct1 = (i / numSegs) * 100;
    const pct2 = ((i + 1) / numSegs) * 100;
    const a1 = 180 - (pct1 / 100) * 180;
    const a2 = 180 - (pct2 / 100) * 180;
    const p1 = pol(a1, R);
    const p2 = pol(a2, R);
    const color = getColor((i + 0.5) / numSegs);
    // Use toFixed to ensure consistent string output between server and client
    arcSegs.push({ d: `M${p1.x.toFixed(2)},${p1.y.toFixed(2)} A${R},${R} 0 0 0 ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`, color });
  }

  const leftCap = pol(180, R);
  const rightCap = pol(0, R);

  // Needle — sleek tapered line
  const needleLen = R;
  const nAngle = 180 - (animScore / 100) * 180;
  const nTip = pol(nAngle, needleLen);
  // Tapered base: two points slightly offset perpendicular, close together
  const nB1 = pol(nAngle + 90, 2.5);
  const nB2 = pol(nAngle - 90, 2.5);
  // Tail extends slightly behind center for balance
  const nTail = pol(nAngle + 180, 14);

  const scoreRanges = [
    { label: "Critical", min: 0, max: 19, color: RED_S },
    { label: "Weak", min: 20, max: 39, color: ORANGE },
    { label: "Fair", min: 40, max: 59, color: YELLOW },
    { label: "Good", min: 60, max: 79, color: GOOD_GREEN },
    { label: "Strong", min: 80, max: 100, color: GREEN },
  ];

  const tickNums = [0, 20, 40, 60, 80, 100];
  const tickLabelR = R + strokeW / 2 + 14;

  return (
    <div data-gauge-row style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          {arcSegs.map((seg, i) => (
            <path key={i} d={seg.d} fill="none" stroke={seg.color} strokeWidth={strokeW} strokeLinecap="butt" />
          ))}
          <circle cx={leftCap.x.toFixed(2)} cy={leftCap.y.toFixed(2)} r={strokeW / 2} fill={getColor(0)} />
          <circle cx={rightCap.x.toFixed(2)} cy={rightCap.y.toFixed(2)} r={strokeW / 2} fill={getColor(1)} />
          {tickNums.map((t) => {
            const angle = 180 - (t / 100) * 180;
            const p = pol(angle, tickLabelR);
            return (
              <text key={t} x={p.x.toFixed(2)} y={p.y.toFixed(2)} textAnchor="middle" dominantBaseline="middle"
                fill="#94A3B8" fontSize="10" fontFamily="Lato, sans-serif" fontWeight="700">
                {t}
              </text>
            );
          })}
          {/* Needle — tapered with counterweight tail */}
          <polygon points={`${nTip.x.toFixed(2)},${nTip.y.toFixed(2)} ${nB1.x.toFixed(2)},${nB1.y.toFixed(2)} ${nTail.x.toFixed(2)},${nTail.y.toFixed(2)} ${nB2.x.toFixed(2)},${nB2.y.toFixed(2)}`} fill={NAVY} />
          {/* Clean center hub */}
          <circle cx={cx} cy={cy} r={5} fill={NAVY} />
          <circle cx={cx} cy={cy} r={2} fill={WHITE} />
        </svg>
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <div style={{ fontSize: 50, fontWeight: 900, color: NAVY, lineHeight: 1, fontFamily: "Lato, sans-serif" }}>
            <AnimNum value={score} />
          </div>
          <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>out of 100</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {scoreRanges.map((rng) => {
          const active = score >= rng.min && score <= rng.max;
          return (
            <div key={rng.label} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 5,
              background: active ? rng.color + "12" : "transparent",
              border: active ? `2px solid ${rng.color}35` : "2px solid transparent",
            }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: rng.color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: active ? rng.color : SUB, minWidth: 56 }}>{rng.label}</span>
              <span style={{ fontSize: 14, color: SUB, opacity: 0.55 }}>{rng.min}–{rng.max}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── PILLAR METER ───
function PillarMeter({ score, maxScore = 20, label }: { score: number; maxScore?: number; label: string }) {
  const pct = (score / maxScore) * 100;
  const color = scoreColor(pct);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 900, color }}>{score}<span style={{ fontWeight: 400, color: SUB }}>/{maxScore}</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 5, background: "#E2E8F0", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 5,
          background: "linear-gradient(90deg, #EF4444 0%, #F97316 25%, #EAB308 50%, #4ADE80 75%, #16A34A 100%)",
          backgroundSize: `${100 / (width / 100 || 0.01)}% 100%`,
          width: `${width}%`, transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
        }} />
      </div>
    </div>
  );
}

// ─── ARCHETYPE ICONS ───
const archSw = 2.2;
const archVb = { viewBox: "0 0 48 56", fill: "none", style: { width: "100%", height: "100%" } };

const archetypeIcons: Record<string, (c: string) => React.JSX.Element> = {
  "The Innocent": (c) => (
    <svg {...archVb}>
      <ellipse cx="24" cy="22" rx="14" ry="18" fill={c} opacity="0.15"/>
      <ellipse cx="24" cy="22" rx="14" ry="18" stroke={c} strokeWidth={archSw} fill="none"/>
      <path d="M22 40l2 2 2-2" stroke={c} strokeWidth={archSw} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 42c-2 3 2 5 0 10" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <ellipse cx="17" cy="16" rx="3" ry="5" fill={WHITE} opacity="0.35"/>
    </svg>
  ),
  "The Explorer": (c) => (
    <svg {...archVb}>
      <path d="M4 48l14-28 10 14 6-8 10 22H4z" fill={c} opacity="0.07"/>
      <path d="M4 48l14-28 10 14 6-8 10 22H4z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      <circle cx="36" cy="14" r="5" stroke={c} strokeWidth={archSw} fill="none"/>
      <path d="M36 5v-2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M36 23v2" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.4"/>
      <path d="M27 14h-2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M45 14h2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M30 8l-1.5-1.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M42 8l1.5-1.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M42 20l1.5 1.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.4"/>
      <path d="M30 20l-1.5 1.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.4"/>
      <path d="M10 48h28" stroke={c} strokeWidth={archSw} strokeLinecap="round" opacity="0.3"/>
    </svg>
  ),
  "The Sage": (c) => (
    <svg {...archVb}>
      <ellipse cx="24" cy="30" rx="16" ry="20" stroke={c} strokeWidth={archSw} fill="none"/>
      <ellipse cx="24" cy="30" rx="16" ry="20" fill={c} opacity="0.05"/>
      <circle cx="17" cy="26" r="7.5" stroke={c} strokeWidth={archSw} fill="none"/>
      <circle cx="31" cy="26" r="7.5" stroke={c} strokeWidth={archSw} fill="none"/>
      <circle cx="17" cy="26" r="4" fill={c}/>
      <circle cx="31" cy="26" r="4" fill={c}/>
      <circle cx="15" cy="24.5" r="1.5" fill={WHITE}/>
      <circle cx="29" cy="24.5" r="1.5" fill={WHITE}/>
      <path d="M22 35l2 3.5 2-3.5" stroke={c} strokeWidth={archSw} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 14l8 7M38 14l-8 7" stroke={c} strokeWidth={archSw} strokeLinecap="round"/>
    </svg>
  ),
  "The Hero": (c) => (
    <svg {...archVb}>
      <path d="M24 4L6 14v14c0 12 8 19 18 24 10-5 18-12 18-24V14L24 4z" fill={c} opacity="0.15"/>
      <path d="M24 4L6 14v14c0 12 8 19 18 24 10-5 18-12 18-24V14L24 4z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      <path d="M24 16l3 6.5h7l-5.5 4.5 2 7L24 30l-6.5 4 2-7L14 22.5h7z" fill={WHITE} opacity="0.5"/>
      <path d="M24 16l3 6.5h7l-5.5 4.5 2 7L24 30l-6.5 4 2-7L14 22.5h7z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  "The Outlaw": (c) => (
    <svg {...archVb}>
      <path d="M30 4L12 30h12L16 52l22-28H26L30 4z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      <path d="M30 4L12 30h12L16 52l22-28H26L30 4z" fill={c} opacity="0.08"/>
    </svg>
  ),
  "The Magician": (c) => (
    <svg {...archVb}>
      <path d="M24 4l6 14h15l-12 10 5 15-14-9-14 9 5-15L3 18h15z" fill={c} opacity="0.15"/>
      <path d="M24 4l6 14h15l-12 10 5 15-14-9-14 9 5-15L3 18h15z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  "The Neighbor": (c) => (
    <svg {...archVb}>
      <path d="M8 12h24v24c0 4-4 8-8 8H16c-4 0-8-4-8-8V12z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      <path d="M8 12h24v24c0 4-4 8-8 8H16c-4 0-8-4-8-8V12z" fill={c} opacity="0.05"/>
      <path d="M32 18h6c3 0 5 2.5 5 5.5S41 29 38 29h-6" stroke={c} strokeWidth={archSw} strokeLinecap="round" fill="none"/>
      <path d="M15 6c0-3 2.5-3 2.5 0S20 6 20 3M22 6c0-3 2.5-3 2.5 0S27 6 27 3" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  ),
  "The Lover": (c) => (
    <svg {...archVb}>
      <path d="M24 18c-2.5-5-8-9-13-5s-5 10 0 18c3.5 5 9 10 13 15 4-5 9.5-10 13-15 5-8 5-14 0-18s-10.5 0-13 5z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      <path d="M24 18c-2.5-5-8-9-13-5s-5 10 0 18c3.5 5 9 10 13 15 4-5 9.5-10 13-15 5-8 5-14 0-18s-10.5 0-13 5z" fill={c} opacity="0.07"/>
    </svg>
  ),
  "The Entertainer": (c) => (
    <svg {...archVb}>
      <path d="M16 14c0-6 3.5-10 8-10s8 4 8 10v16c0 6-3.5 10-8 10s-8-4-8-10V14z" stroke={c} strokeWidth={archSw} fill="none"/>
      <path d="M16 14c0-6 3.5-10 8-10s8 4 8 10v16c0 6-3.5 10-8 10s-8-4-8-10V14z" fill={c} opacity="0.06"/>
      <circle cx="21" cy="12" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="27" cy="12" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="21" cy="17" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="27" cy="17" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="24" cy="14.5" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="21" cy="22" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="27" cy="22" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="24" cy="19.5" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="24" cy="24.5" r="1.2" fill={c} opacity="0.3"/>
      <path d="M16 28h16" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
      <circle cx="22" cy="33" r="1" fill={c} opacity="0.3"/>
      <circle cx="26" cy="33" r="1" fill={c} opacity="0.3"/>
      <path d="M24 40v8" stroke={c} strokeWidth={archSw} strokeLinecap="round"/>
      <path d="M18 48h12" stroke={c} strokeWidth={archSw} strokeLinecap="round"/>
      <path d="M12 18c-2 3-2 8 0 12" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M8 14c-3 5-3 14 0 20" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M36 18c2 3 2 8 0 12" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M40 14c3 5 3 14 0 20" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
    </svg>
  ),
  "The Caregiver": (c) => (
    <svg {...archVb}>
      <path d="M18 10h12v12h12v12H30v12H18V34H6V22h12V10z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  "The Ruler": (c) => (
    <svg {...archVb}>
      <path d="M6 44V12l9 10 9-18 9 18 9-10v32H6z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      <path d="M6 44V12l9 10 9-18 9 18 9-10v32H6z" fill={c} opacity="0.06"/>
      <path d="M6 44h36" stroke={c} strokeWidth={archSw + 0.5} strokeLinecap="round"/>
      <path d="M6 38h36" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.2"/>
      <circle cx="15" cy="34" r="2" fill={c} opacity="0.15"/>
      <circle cx="24" cy="32" r="2.5" fill={c} opacity="0.2"/>
      <circle cx="33" cy="34" r="2" fill={c} opacity="0.15"/>
    </svg>
  ),
  "The Creator": (c) => (
    <svg {...archVb}>
      <rect x="4" y="18" width="40" height="28" rx="4" stroke={c} strokeWidth={archSw} fill="none"/>
      <rect x="4" y="18" width="40" height="28" rx="4" fill={c} opacity="0.08"/>
      <path d="M17 18v-4c0-1 1-2 2-2h10c1 0 2 1 2 2v4" stroke={c} strokeWidth={archSw} fill="none"/>
      <circle cx="24" cy="33" r="9" stroke={c} strokeWidth={archSw} fill="none"/>
      <circle cx="24" cy="33" r="5" fill={c} opacity="0.15"/>
      <circle cx="36" cy="24" r="2.5" fill={c} opacity="0.15"/>
    </svg>
  ),
};

// "The Guide" maps to "The Sage" (same archetype, different name)
archetypeIcons["The Guide"] = archetypeIcons["The Sage"];

function ArchetypeIcon({ name, size = 64 }: { name: string; size?: number }) {
  const fn = archetypeIcons[name];
  if (!fn) return null;
  return <div style={{ width: size, height: size }}>{fn(BLUE)}</div>;
}

// ─── PILLAR ICONS ───
function PillarIcon({ pillar, size = 24 }: { pillar: string; size?: number }) {
  const c = BLUE;
  const s = { width: size, height: size, flexShrink: 0 };
  const icons: Record<string, React.JSX.Element> = {
    positioning: (
      <svg viewBox="0 0 24 24" fill="none" style={s}>
        <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="6" stroke={c} strokeWidth="1.5" opacity="0.5"/>
        <circle cx="12" cy="12" r="2.5" fill={c}/>
      </svg>
    ),
    messaging: (
      <svg viewBox="0 0 24 24" fill="none" style={s}>
        <path d="M4 4h16v12H8l-4 4V4z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M8 8h8M8 11h5" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    visibility: (
      <svg viewBox="0 0 24 24" fill="none" style={s}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3.5" stroke={c} strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="1.5" fill={c}/>
      </svg>
    ),
    credibility: (
      <svg viewBox="0 0 24 24" fill="none" style={s}>
        <path d="M12 2l2.9 5.8L21 9l-4.5 4.4 1.1 6.3L12 17l-5.6 2.7 1.1-6.3L3 9l6.1-1.2L12 2z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    conversion: (
      <svg viewBox="0 0 24 24" fill="none" style={s}>
        <path d="M12 3v14M8 13l4 4 4-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 20h14" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  };
  return icons[pillar] || null;
}

// ─── SECTION WRAPPER ───
function Section({ children, style, pageBreak, id }: { children: React.ReactNode; style?: React.CSSProperties; pageBreak?: boolean; id?: string }) {
  return (
    <div id={id} data-section data-page-break={pageBreak || undefined} style={{
      background: WHITE, borderRadius: 5, border: `1px solid ${BORDER}`,
      padding: "32px 32px", ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children, hero, description }: { icon?: React.ReactNode; children: React.ReactNode; hero?: boolean; description?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 5, background: ACCENT_BG,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
        <h2 style={{
          fontSize: hero ? 24 : 20, fontWeight: 700, margin: 0,
          color: NAVY,
        }}>
          {children}
        </h2>
      </div>
      {description && (
        <p style={{ fontSize: 14, color: SUB, margin: "6px 0 0", lineHeight: 1.5 }}>{description}</p>
      )}
    </div>
  );
}

// ─── REPORT DATA ───
const REPORT = {
  businessName: "Acme Co",
  date: "February 5, 2026",
  executiveSummary: {
    brandAlignmentScore: 72,
    overview: "Acme Co has a strong internal understanding of its value but struggles to translate that clarity externally. Positioning is solid at 16/20, yet messaging (15/20) lacks the proof points needed to convert that positioning into trust. Visibility efforts (14/20) are active but unfocused, spreading resources thin. Credibility signals exist but remain hidden at key decision points (13/20). Conversion infrastructure is functional but underleveraged (14/20). The throughline: internal clarity is not reaching external audiences in a way that builds trust and drives action.",
    diagnosis: "Your brand is currently strong but inconsistent because your positioning is clear internally but not consistently reflected across customer touchpoints.",
    primaryOpportunity: "Aligning your external messaging with your internal clarity will immediately strengthen trust and conversion.",
    primaryRisk: "Without addressing visibility gaps, competitors with weaker offerings but stronger presence will continue to capture attention you deserve.",
  },
  brandAlignmentOverview: {
    positioning: "Clear differentiation exists but is not consistently communicated across channels.",
    messaging: "Core message is solid; supporting proof points are underdeveloped.",
    visibility: "Present on key channels but content lacks strategic cohesion.",
    credibility: "Strong foundation of trust signals; visibility of proof could improve.",
    conversion: "Functional conversion paths exist; optimization opportunities remain.",
  },
  pillarScores: {
    positioning: { score: 16, whatsWorking: "Clear understanding of target audience and competitive differentiation.", whatsUnclear: "Positioning statement is not consistently reflected in website copy and social presence.", whyItMatters: "Inconsistent positioning creates confusion and weakens the brand's ability to command premium pricing." },
    messaging: { score: 15, whatsWorking: "Core value proposition is compelling and benefit-focused.", whatsUnclear: "Supporting messages lack specific proof points and customer outcomes.", whyItMatters: "Without proof, messaging feels like claims rather than facts, reducing trust." },
    visibility: { score: 14, whatsWorking: "Active presence across multiple relevant channels.", whatsUnclear: "Content strategy appears reactive rather than strategically planned.", whyItMatters: "Scattered visibility efforts dilute impact and waste resources on low-return activities." },
    credibility: { score: 13, whatsWorking: "Testimonials and case studies exist and are genuine.", whatsUnclear: "Social proof is buried or hard to find at key decision points.", whyItMatters: "Hidden credibility signals force prospects to work harder to trust you, increasing drop-off." },
    conversion: { score: 14, whatsWorking: "Clear calls-to-action and defined conversion paths.", whatsUnclear: "Lead nurturing and follow-up sequences are underdeveloped.", whyItMatters: "Without nurturing, warm leads go cold and acquisition costs rise." },
  },
  brandArchetype: {
    name: "The Sage",
    alignedSignal: "When aligned, The Sage signals expertise, trustworthiness, and the ability to guide others toward better decisions.",
    misusedRisk: "If overused, The Sage can come across as condescending or overly academic, alienating audiences who want practical help.",
  },
  immediateActions: [
    { action: "Audit your homepage and ensure your positioning statement appears within the first screen fold.", pillar: "Positioning" },
    { action: "Add one customer testimonial or case study to your homepage above the fold.", pillar: "Credibility" },
    { action: "Review your last 10 social posts and identify which pillar each supports — if scattered, pick one pillar to focus on for 30 days.", pillar: "Visibility" },
  ],
  whatsNext: "This diagnostic reveals where your brand stands today. WunderBrand Snapshot+™ provides the deeper strategic insight needed to understand why these patterns exist and what to prioritize first — including audience clarity, archetype guidance, visual direction, and a prioritized action plan.",
};

const PILLAR_LABELS: Record<string, string> = { positioning: "Positioning", messaging: "Messaging", visibility: "Visibility", credibility: "Credibility", conversion: "Conversion" };
const PILLARS = ["positioning", "messaging", "visibility", "credibility", "conversion"] as const;

const ARCHETYPE_META: Record<string, { tagline: string; description: string }> = {
  "The Innocent": { tagline: "Life can be simple", description: "Optimistic, honest, and wholesome. Brands that promise simplicity and trust." },
  "The Explorer": { tagline: "Don't fence me in", description: "Adventurous and independent. Brands that inspire freedom and discovery." },
  "The Sage": { tagline: "The truth will set you free", description: "Wise, knowledgeable, and thoughtful. Brands built on expertise and insight." },
  "The Hero": { tagline: "Where there's a will, there's a way", description: "Courageous, bold, and determined. Brands that empower and inspire action." },
  "The Outlaw": { tagline: "Rules are made to be broken", description: "Rebellious and disruptive. Brands that challenge the status quo." },
  "The Magician": { tagline: "I make things happen", description: "Visionary and transformative. Brands that create extraordinary experiences." },
  "The Neighbor": { tagline: "All people are created equal", description: "Relatable and down-to-earth. Brands that connect through belonging." },
  "The Lover": { tagline: "You're the only one", description: "Passionate, sensual, and intimate. Brands that evoke desire and connection." },
  "The Entertainer": { tagline: "You only live once", description: "Fun, playful, and lighthearted. Brands that bring joy and laughter." },
  "The Caregiver": { tagline: "Love your neighbor as yourself", description: "Nurturing, generous, and compassionate. Brands built on trust and care." },
  "The Ruler": { tagline: "Power isn't everything, it's the only thing", description: "Authoritative, responsible, and commanding. Brands that lead with confidence." },
  "The Creator": { tagline: "If you can imagine it, it can be done", description: "Innovative, artistic, and expressive. Brands that inspire imagination." },
};

// "The Guide" maps to "The Sage" (same archetype, different name)
ARCHETYPE_META["The Guide"] = ARCHETYPE_META["The Sage"];

// ─── MAIN REPORT ───
export default function BrandSnapshotReport() {
  const r = REPORT;

  return (
    <>
    <div data-report style={{ minHeight: "100vh", background: LIGHT_BG, fontFamily: "'Lato', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          [data-section] { page-break-inside: avoid; break-inside: avoid; }
          [data-page-break] { page-break-before: always; break-before: page; }
          button { display: none !important; }
        }
        @media (max-width: 640px) {
          [data-report] { font-size: 15px; }
          [data-header-top] { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          [data-header-info] { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          [data-header-actions] { align-items: flex-start !important; }
          [data-key-cards] { grid-template-columns: 1fr !important; }
          [data-gauge-row] { flex-direction: column !important; align-items: center !important; gap: 20px !important; }
          [data-pillar-meters] { grid-template-columns: 1fr !important; }
          [data-pillar-detail] { grid-template-columns: 1fr !important; }
          [data-pillar-header] { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          [data-archetype-layout] { flex-direction: column !important; align-items: center !important; }
          [data-archetype-content] { min-width: 0 !important; width: 100% !important; }
          [data-section] { padding: 20px 16px !important; }
          [data-how-to-read] { flex-direction: column !important; gap: 8px !important; }
          [data-action-item] { flex-direction: column !important; gap: 10px !important; }
          [data-suite-cards] { grid-template-columns: 1fr !important; }
        }
      `}} />

      {/* ═══ HEADER ═══ */}
      <div style={{ background: WHITE, position: "relative", overflow: "hidden" }}>
        {/* Subtle dot pattern */}
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "40%", opacity: 0.04, backgroundImage: `radial-gradient(${NAVY} 1px, transparent 1px)`, backgroundSize: "16px 16px" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          {/* Top bar: logo + WunderBrand Snapshot™ lockup */}
          <div data-header-top style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: `1px solid ${BORDER}` }}>
            <a href="https://wunderbardigital.com/?utm_source=brand_snapshot_report&utm_medium=report_nav&utm_campaign=nav_header_logo&utm_content=snap_logo" target="_blank" rel="noopener noreferrer">
              <img src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp" alt="Wunderbar Digital" style={{ height: 26, objectFit: "contain" }} />
            </a>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: NAVY, lineHeight: 1 }}>WunderBrand Snapshot™</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: BLUE, marginTop: 3 }}>Powered by <a href="https://wunderbardigital.com/?utm_source=brand_snapshot_report&utm_medium=report_nav&utm_campaign=nav_header_logo&utm_content=snap_logo" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: BLUE, textDecoration: "none" }}>Wunderbar Digital</a></span>
            </div>
          </div>

          {/* Report info + download actions */}
          <div data-header-info style={{ padding: "22px 0 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>Brand Alignment Diagnostic</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>Prepared for:</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: BLUE }}>{r.businessName}</div>
              <p style={{ fontSize: 13, color: SUB, margin: "6px 0 0" }}>{r.date}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#8A97A8", margin: "8px 0 0", letterSpacing: "0.04em" }}>Confidential — Prepared exclusively for {r.businessName}</p>
            </div>
            <div data-header-actions style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => window.print()} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 5,
                  border: `1.5px solid ${BORDER}`, background: WHITE,
                  color: SUB, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "Lato, sans-serif",
                  transition: "border-color 0.2s ease, color 0.2s ease",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = BLUE; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = SUB; }}
                >
                  <svg viewBox="0 0 20 20" fill="none" style={{ width: 14, height: 14 }}>
                    <path d="M5 8V3h10v5M5 14h10v3H5v-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M3 8h14v6H3V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <circle cx="13" cy="11" r="0.8" fill="currentColor"/>
                  </svg>
                  Print
                </button>
                <button onClick={() => {
                  const el = document.querySelector('[data-report]');
                  if (el) {
                    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>WunderBrand Snapshot™ - ${r.businessName}</title><link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet"><style>body{margin:0;font-family:Lato,sans-serif;}</style></head><body>${el.outerHTML}</body></html>`;
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Brand-Snapshot-${r.businessName.replace(/\s+/g, '-')}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 5,
                  border: `1.5px solid ${BLUE}`, background: `${BLUE}08`,
                  color: BLUE, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "Lato, sans-serif",
                  transition: "background 0.2s ease",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${BLUE}15`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `${BLUE}08`; }}
                >
                  <svg viewBox="0 0 20 20" fill="none" style={{ width: 14, height: 14 }}>
                    <path d="M10 3v10M10 13l-3.5-3.5M10 13l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Brand accent line */}
        <div style={{ height: 3, background: BLUE }} />
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 48px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Preview Banner */}
        <div style={{
          background: "#fff9e6", border: "2px solid #f5e6b3", borderRadius: 5,
          padding: "12px 16px", fontSize: 14, color: "#8b6914",
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
        }}>
          <span><strong>Preview mode</strong> — Mock data showing new report structure.</span>
          <Link href="/preview" style={{ color: NAVY, fontWeight: 600, textDecoration: "underline" }}>← All previews</Link>
        </div>

        {/* ═══ HOW TO READ THIS REPORT ═══ */}
        <div data-how-to-read style={{
          display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
          borderRadius: 5, background: `${BLUE}06`, border: `1px solid ${BLUE}15`,
        }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="1.8"/>
            <path d="M12 8v5M12 16h.01" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <div style={{ fontSize: 14, color: SUB, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: NAVY }}>How to read this report:</span> Your brand is scored across five pillars, each rated out of 20. Scores are classified as
            {" "}<span style={{ fontWeight: 700, color: RED_S }}>Critical</span> (0–19),
            {" "}<span style={{ fontWeight: 700, color: ORANGE }}>Weak</span> (20–39),
            {" "}<span style={{ fontWeight: 700, color: YELLOW }}>Fair</span> (40–59),
            {" "}<span style={{ fontWeight: 700, color: GOOD_GREEN }}>Good</span> (60–79), or
            {" "}<span style={{ fontWeight: 700, color: GREEN }}>Strong</span> (80–100).
            The WunderBrand Score™ is the composite total out of 100.
          </div>
        </div>

        {/* ═══ 1. EXECUTIVE SUMMARY ═══ */}
        <Section id="executive-summary">
          <SectionTitle hero description="A high-level overview of your brand's alignment across five key pillars.">Executive Summary</SectionTitle>

          {/* Key Findings Cards */}
          {(() => {
            const pillarEntries = PILLARS.map(p => ({ key: p, label: PILLAR_LABELS[p], score: r.pillarScores[p].score }));
            const sorted = [...pillarEntries].sort((a, b) => b.score - a.score);
            const strongest = sorted[0];
            const weakest = sorted[sorted.length - 1];
            const overallScore = r.executiveSummary.brandAlignmentScore;
            const overallPct = overallScore;
            const strongPct = (strongest.score / 20) * 100;
            const weakPct = (weakest.score / 20) * 100;

            const cards = [
              {
                label: "Overall Score",
                value: String(overallScore),
                sub: "out of 100",
                pct: overallPct,
                pill: null as string | null,
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
                    <circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                label: "Strongest Pillar",
                value: `${strongest.score}/20`,
                sub: null as string | null,
                pct: strongPct,
                pill: strongest.label,
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
                    <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" stroke={GREEN} strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                label: "Needs Attention",
                value: `${weakest.score}/20`,
                sub: null as string | null,
                pct: weakPct,
                pill: weakest.label,
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
                    <path d="M12 9v4M12 17h.01" stroke={ORANGE} strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10.3 3.2L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.2a2 2 0 00-3.4 0z" stroke={ORANGE} strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                ),
              },
            ];

            return (
              <div data-key-cards style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
                {cards.map((card, i) => {
                  const tierColor = scoreColor(card.pct);
                  const tierLabel = scoreLabel(card.pct);
                  return (
                    <div key={i} style={{
                      padding: "20px", borderRadius: 5,
                      border: `1px solid ${BORDER}`, background: LIGHT_BG,
                      display: "flex", flexDirection: "column", alignItems: "center",
                      textAlign: "center",
                    }}>
                      {card.icon}
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginTop: 8 }}>{card.label}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
                        <span style={{ fontSize: 30, fontWeight: 700, color: tierColor, lineHeight: 1 }}>{card.value}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: tierColor, textTransform: "uppercase" }}>{tierLabel}</span>
                      </div>
                      {card.sub && (
                        <div style={{ fontSize: 12, color: SUB, marginTop: 4 }}>{card.sub}</div>
                      )}
                      {card.pill && (
                        <div style={{
                          display: "inline-block", marginTop: 8,
                          padding: "4px 14px", borderRadius: 5,
                          background: `${BLUE}12`, border: `1px solid ${BLUE}30`,
                          fontSize: 14, fontWeight: 700, color: NAVY,
                        }}>{card.pill}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div style={{
            padding: "16px 20px", borderRadius: 5, marginBottom: 16,
            background: `${BLUE}08`, borderLeft: `3px solid ${BLUE}`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, lineHeight: 1.6, fontStyle: "italic" }}>
              {r.executiveSummary.diagnosis.split(" because ")[0]}.
            </div>
          </div>

          <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75 }}>
            {r.executiveSummary.overview}
          </div>
        </Section>

        {/* ═══ 2. BRAND ALIGNMENT SCORE ═══ */}
        <Section id="brand-alignment-score">
          <SectionTitle hero description="A composite score measuring how well your brand communicates across five key pillars. Higher scores indicate stronger, more consistent brand presence.">WunderBrand Score™</SectionTitle>

          <MainGauge score={r.executiveSummary.brandAlignmentScore} />

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
            {[
              { label: "Diagnosis", text: r.executiveSummary.diagnosis, color: NAVY },
              { label: "Primary Opportunity", text: r.executiveSummary.primaryOpportunity, color: GREEN },
              { label: "Risk if Unchanged", text: r.executiveSummary.primaryRisk, color: ORANGE },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 4, minHeight: 40, borderRadius: 2, background: item.color, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div data-diagnosis-label style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ 3. PILLAR SCORES ═══ */}
        <Section id="pillar-scores" pageBreak>
          <SectionTitle description="Each pillar is scored out of 20, reflecting the strength and clarity of that dimension of your brand.">Brand Pillar Scores</SectionTitle>

          <div data-pillar-meters style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px",
            padding: "20px 24px", background: LIGHT_BG, borderRadius: 5, marginBottom: 24,
          }}>
            {PILLARS.map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PillarIcon pillar={p} size={20} />
                <div style={{ flex: 1 }}>
                  <PillarMeter score={r.pillarScores[p].score} label={PILLAR_LABELS[p]} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${BORDER}` }}>
            Detailed Breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PILLARS.map((p) => {
              const d = r.pillarScores[p];
              const pct = (d.score / 20) * 100;
              return (
                <div key={p} style={{
                  padding: "24px 28px", borderRadius: 5, border: `1px solid ${BORDER}`,
                  background: WHITE,
                }}>
                  <div data-pillar-header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <PillarIcon pillar={p} size={22} />
                      <span style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{PILLAR_LABELS[p]}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(pct), textTransform: "uppercase", letterSpacing: "0.04em" }}>{scoreLabel(pct)}</span>
                      <div style={{
                        padding: "4px 12px", borderRadius: 5,
                        background: scoreColor(pct), color: WHITE,
                        fontSize: 16, fontWeight: 900,
                      }}>{d.score}/20</div>
                    </div>
                  </div>

                  <div data-pillar-detail style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={{ padding: "14px 16px", borderRadius: 5, background: `${GREEN}08` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}>
                          <circle cx="10" cy="10" r="9" fill={GREEN} opacity="0.15"/>
                          <path d="M6 10.5l2.5 2.5L14 7.5" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize: 14, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>What&apos;s Working</span>
                      </div>
                      <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{d.whatsWorking}</div>
                    </div>
                    <div style={{ padding: "14px 16px", borderRadius: 5, background: `${ORANGE}08` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}>
                          <path d="M10 2l8.66 15H1.34L10 2z" fill={ORANGE} opacity="0.15"/>
                          <path d="M10 2l8.66 15H1.34L10 2z" stroke={ORANGE} strokeWidth="1.5" strokeLinejoin="round"/>
                          <path d="M10 8v3" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round"/>
                          <circle cx="10" cy="14" r="0.8" fill={ORANGE}/>
                        </svg>
                        <span style={{ fontSize: 14, fontWeight: 900, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.08em" }}>What&apos;s Unclear</span>
                      </div>
                      <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{d.whatsUnclear}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}>
                        <path d="M10 2a6 6 0 014 10.5V15H6v-2.5A6 6 0 0110 2z" stroke={NAVY} strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
                        <path d="M7 15h6v1.5c0 .8-.7 1.5-1.5 1.5h-3c-.8 0-1.5-.7-1.5-1.5V15z" stroke={NAVY} strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
                        <path d="M10 6v2M7.5 7.5l1 1M12.5 7.5l-1 1" stroke={NAVY} strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
                      </svg>
                      <span style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>Why This Matters</span>
                    </div>
                    <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{d.whyItMatters}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ═══ 4. BRAND ARCHETYPE ═══ */}
        <Section id="brand-archetype" pageBreak style={{ background: `linear-gradient(135deg, ${NAVY}05 0%, ${BLUE}08 100%)` }}>
          <SectionTitle hero description="Your brand archetype represents the personality pattern your brand most closely aligns with, based on the Jungian archetype framework.">Brand Archetype</SectionTitle>

          <div data-archetype-layout style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 180 }}>
              <div style={{
                width: 130, height: 130, borderRadius: 5, background: WHITE,
                border: `2px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(2,24,89,0.08)",
              }}>
                <ArchetypeIcon name={r.brandArchetype.name} size={90} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: BLUE, marginTop: 10, textAlign: "center" }}>{r.brandArchetype.name}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, fontStyle: "italic", marginTop: 4, textAlign: "center", opacity: 0.7 }}>
                &quot;{ARCHETYPE_META[r.brandArchetype.name]?.tagline}&quot;
              </div>
            </div>

            <div data-archetype-content style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{
                padding: "14px 18px", borderRadius: 5,
                background: `${BLUE}08`, border: `1px solid ${BLUE}15`,
              }}>
                <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 }}>
                  {ARCHETYPE_META[r.brandArchetype.name]?.description}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 4, minHeight: 36, borderRadius: 2, background: GREEN, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>When Aligned</div>
                  <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{r.brandArchetype.alignedSignal}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 4, minHeight: 36, borderRadius: 2, background: ORANGE, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Risk if Misused</div>
                  <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{r.brandArchetype.misusedRisk}</div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══ 5. IMMEDIATE ACTIONS ═══ */}
        <Section id="next-steps">
          <SectionTitle description="Based on your scores, these are the highest-impact actions you can take in the next 7–14 days to strengthen your brand alignment. Each action targets a specific pillar where improvement will be most visible.">Your Next Steps</SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {r.immediateActions.map((item, idx) => (
              <div key={idx} data-action-item style={{
                display: "flex", gap: 14, alignItems: "flex-start",
                padding: "18px 22px", borderRadius: 5, border: `1px solid ${BORDER}`,
                background: idx === 0 ? `${BLUE}06` : WHITE,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: BLUE,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: WHITE, fontWeight: 900, fontSize: 14, flexShrink: 0,
                }}>{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{item.action}</div>
                  <div style={{
                    display: "inline-block", marginTop: 6, padding: "2px 10px", borderRadius: 5,
                    background: ACCENT_BG, fontSize: 14, fontWeight: 700, color: BLUE,
                  }}>{item.pillar}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ 6. CTA — BRAND SNAPSHOT SUITE ═══ */}
        <Section id="whats-next">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              What&apos;s Next
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: "0 0 8px", lineHeight: 1.3 }}>
              Go Deeper with the WunderBrand Snapshot™ Suite
            </h2>
            <p style={{ fontSize: 16, color: SUB, lineHeight: 1.65, maxWidth: 560, margin: "0 auto" }}>
              This diagnostic reveals where your brand stands. The next step is understanding why — and what to do about it.
            </p>
            <p style={{ fontSize: 13, color: BLUE, fontWeight: 600, margin: "12px auto 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Built on 25+ years of brand strategy and growth marketing expertise — from Fortune 500 companies to startups
            </p>
          </div>

          {/* Personalized "What You're Missing" insight — based on weakest pillar */}
          {(() => {
            const pillarEntries = PILLARS.map(p => ({ key: p, label: PILLAR_LABELS[p], score: r.pillarScores[p].score }));
            const sorted = [...pillarEntries].sort((a, b) => a.score - b.score);
            const weakest = sorted[0];
            const PILLAR_UNLOCK_MAP: Record<string, string> = {
              positioning: "WunderBrand Snapshot+™ includes a full positioning diagnosis with before/after examples, competitive context, and a strategic recommendation specific to your positioning gaps.",
              messaging: "WunderBrand Snapshot+™ delivers a complete messaging framework — brand persona, messaging pillars, tone guidelines, and examples of what to say (and what to stop saying).",
              visibility: "WunderBrand Snapshot+™ includes AEO readiness diagnostic, visibility diagnosis, and a channel-specific strategy so your efforts compound instead of scatter.",
              credibility: "WunderBrand Snapshot+™ provides a credibility audit with specific recommendations for where to place proof points, testimonials, and trust signals for maximum impact.",
              conversion: "WunderBrand Snapshot+™ maps your conversion gaps with before/after CTA examples, lead magnet recommendations, and a prioritized action plan to capture more leads.",
            };
            return (
              <div style={{
                background: `linear-gradient(135deg, ${BLUE}08, ${BLUE}15)`,
                border: `1px solid ${BLUE}30`,
                borderRadius: 10, padding: "20px 24px", marginBottom: 20,
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: `${BLUE}15`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
                    Your biggest opportunity: <span style={{ color: BLUE }}>{weakest.label}</span> ({weakest.score}/20)
                  </div>
                  <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: 0 }}>
                    {PILLAR_UNLOCK_MAP[weakest.key] || "WunderBrand Snapshot+™ provides a deeper analysis of this pillar with specific, actionable recommendations."}
                  </p>
                </div>
              </div>
            );
          })()}

          <div data-suite-cards style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            {[
              {
                name: "WunderBrand Snapshot+™",
                description: "Deeper diagnostic with priority focus, audience insight, tagline options, and AI-ready brand assets.",
                features: ["Pillar deep dives & focus area diagnosis", "Tagline & slogan recommendations", "Messaging pillars & brand persona", "AEO readiness & 8 AI prompts"],
                highlight: true,
                url: "https://wunderbardigital.com/wunderbrand-snapshot-plus?utm_source=brand_snapshot_report&utm_medium=report_cta&utm_campaign=explore_upgrade&utm_content=snap_explore_snapshot_plus",
              },
              {
                name: "WunderBrand Blueprint™",
                description: "Complete brand operating system with SEO, AEO, email strategy, and 16 AI prompts.",
                features: ["Brand story & customer journey map", "SEO & AEO strategy", "Email & social media frameworks", "Content pillars & 16 AI prompts"],
                highlight: false,
                url: "https://wunderbardigital.com/wunderbrand-blueprint?utm_source=brand_snapshot_report&utm_medium=report_cta&utm_campaign=explore_upgrade&utm_content=snap_explore_blueprint",
              },
              {
                name: "WunderBrand Blueprint+™",
                description: "Everything in Blueprint™ plus SWOT, content calendar, brand glossary, and a strategy session.",
                features: ["SWOT analysis & competitive positioning", "Content calendar & brand glossary", "90-day roadmap & 28 AI prompts", "30-min Strategy Activation Session"],
                highlight: false,
                url: "https://wunderbardigital.com/wunderbrand-blueprint-plus?utm_source=brand_snapshot_report&utm_medium=report_cta&utm_campaign=explore_upgrade&utm_content=snap_explore_blueprint_plus",
              },
            ].map((product, i) => (
              <div key={i} style={{
                padding: "24px", borderRadius: 5,
                border: product.highlight ? `2px solid ${BLUE}` : `1px solid ${BORDER}`,
                background: product.highlight ? `${BLUE}04` : WHITE,
                display: "flex", flexDirection: "column",
              }}>
                {/* Fixed-height label row so product names align */}
                <div style={{ height: 18, marginBottom: 12 }}>
                  {product.highlight && (
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}>Recommended</div>
                  )}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{product.name}<span style={{ fontSize: 9, verticalAlign: "super", lineHeight: 0 }}>™</span></div>
                <div style={{ fontSize: 14, color: SUB, lineHeight: 1.55, marginBottom: 16 }}>{product.description}</div>
                <div style={{ flex: 1, marginBottom: 18 }}>
                  {product.features.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
                        <circle cx="10" cy="10" r="9" fill={product.highlight ? BLUE : NAVY} opacity="0.15"/>
                        <path d="M6 10.5l2.5 2.5L14 7.5" stroke={product.highlight ? BLUE : NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontSize: 13, color: "#1a1a2e" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block", width: "100%", padding: "12px 24px", borderRadius: 5,
                    border: product.highlight ? "none" : `2px solid ${NAVY}`,
                    background: product.highlight ? BLUE : "transparent",
                    color: product.highlight ? WHITE : NAVY,
                    fontSize: 15, fontWeight: 900, textAlign: "center",
                    textDecoration: "none", fontFamily: "Lato, sans-serif",
                    boxSizing: "border-box",
                    boxShadow: product.highlight ? `0 4px 14px ${BLUE}40` : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {`Explore ${product.name}™ →`}
                </a>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: SUB, margin: 0 }}>
              Not sure which is right? <a href="https://wunderbardigital.com/talk-to-an-expert?utm_source=brand_snapshot_report&utm_medium=report_nav&utm_campaign=nav_header_cta_secondary&utm_content=snap_cta_talk_expert" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: "none", fontWeight: 700 }}>Talk to an expert</a> to find the right fit.
            </p>
          </div>
        </Section>

        {/* ═══ FOOTER ═══ */}
        <footer style={{ textAlign: "center", padding: "20px 0 0", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <a href="https://wunderbardigital.com/?utm_source=brand_snapshot_report&utm_medium=report_nav&utm_campaign=nav_header_logo&utm_content=snap_logo" target="_blank" rel="noopener noreferrer">
              <img src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp" alt="Wunderbar Digital" style={{ height: 20, objectFit: "contain" }} />
            </a>
          </div>
          <p style={{ fontSize: 14, color: SUB, marginBottom: 4 }}>
            WunderBrand Snapshot™ is a product of Wunderbar Digital ·{" "}
            <a href="https://wunderbardigital.com/?utm_source=brand_snapshot_report&utm_medium=report_nav&utm_campaign=nav_header_logo&utm_content=snap_logo" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: "none", fontWeight: 700 }}>wunderbardigital.com</a>
          </p>
          <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
            © 2026 Wunderbar Digital. All rights reserved. WunderBrand Snapshot™ and the WunderBrand Score™ are trademarks of Wunderbar Digital.
            This report is confidential and intended solely for the use of the individual or entity to whom it is addressed.
            Unauthorized reproduction, distribution, or disclosure of this report is strictly prohibited.
          </p>
          <p style={{ fontSize: 9, fontWeight: 400, color: "#8A97A8", textAlign: "center", marginTop: 16 }}>
            Confidential — {r.businessName} | Generated {r.date} | wunderbardigital.com
          </p>
        </footer>
      </div>
    </div>
    <ReportNav reportTitle="WunderBrand Snapshot™" sections={[
      { id: "executive-summary", label: "Executive Summary" },
      { id: "brand-alignment-score", label: "WunderBrand Score™" },
      { id: "pillar-scores", label: "Brand Pillar Scores" },
      { id: "brand-archetype", label: "Brand Archetype" },
      { id: "next-steps", label: "Your Next Steps" },
      { id: "whats-next", label: "What's Next" },
    ]} />

    {/* Wundy™ General Guide — free tier (no report data access) */}
    <WundyChat
      mode="general"
      greeting="Hi, I\u2019m Wundy™ \u2014 your brand guide. I can help you understand your scores, explain branding concepts like archetypes and pillars, or tell you about our product suite. What can I help with?"
    />
    </>
  );
}
