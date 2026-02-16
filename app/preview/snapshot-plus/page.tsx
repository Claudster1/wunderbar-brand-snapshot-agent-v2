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
    arcSegs.push({ d: `M${p1.x.toFixed(2)},${p1.y.toFixed(2)} A${R},${R} 0 0 0 ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`, color });
  }

  const leftCap = pol(180, R);
  const rightCap = pol(0, R);

  const needleLen = R;
  const nAngle = 180 - (animScore / 100) * 180;
  const nTip = pol(nAngle, needleLen);
  const nB1 = pol(nAngle + 90, 2.5);
  const nB2 = pol(nAngle - 90, 2.5);
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
          <polygon points={`${nTip.x.toFixed(2)},${nTip.y.toFixed(2)} ${nB1.x.toFixed(2)},${nB1.y.toFixed(2)} ${nTail.x.toFixed(2)},${nTail.y.toFixed(2)} ${nB2.x.toFixed(2)},${nB2.y.toFixed(2)}`} fill={NAVY} />
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
      {/* Balloon */}
      <ellipse cx="24" cy="22" rx="14" ry="18" fill={c} opacity="0.15"/>
      <ellipse cx="24" cy="22" rx="14" ry="18" stroke={c} strokeWidth={archSw} fill="none"/>
      {/* Balloon knot */}
      <path d="M22 40l2 2 2-2" stroke={c} strokeWidth={archSw} strokeLinecap="round" strokeLinejoin="round"/>
      {/* String */}
      <path d="M24 42c-2 3 2 5 0 10" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Shine */}
      <ellipse cx="17" cy="16" rx="3" ry="5" fill={WHITE} opacity="0.35"/>
    </svg>
  ),
  "The Explorer": (c) => (
    <svg {...archVb}>
      {/* Mountains with sun and rays */}
      <path d="M4 48l14-28 10 14 6-8 10 22H4z" fill={c} opacity="0.07"/>
      <path d="M4 48l14-28 10 14 6-8 10 22H4z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      <circle cx="36" cy="14" r="5" stroke={c} strokeWidth={archSw} fill="none"/>
      {/* Sun rays */}
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
      {/* Owl - scaled to fill viewBox */}
      <ellipse cx="24" cy="30" rx="16" ry="20" stroke={c} strokeWidth={archSw} fill="none"/>
      <ellipse cx="24" cy="30" rx="16" ry="20" fill={c} opacity="0.05"/>
      {/* Eye circles - outlined */}
      <circle cx="17" cy="26" r="7.5" stroke={c} strokeWidth={archSw} fill="none"/>
      <circle cx="31" cy="26" r="7.5" stroke={c} strokeWidth={archSw} fill="none"/>
      {/* Pupils - solid filled */}
      <circle cx="17" cy="26" r="4" fill={c}/>
      <circle cx="31" cy="26" r="4" fill={c}/>
      {/* Eye glints */}
      <circle cx="15" cy="24.5" r="1.5" fill={WHITE}/>
      <circle cx="29" cy="24.5" r="1.5" fill={WHITE}/>
      {/* Beak */}
      <path d="M22 35l2 3.5 2-3.5" stroke={c} strokeWidth={archSw} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Ear tufts */}
      <path d="M10 14l8 7M38 14l-8 7" stroke={c} strokeWidth={archSw} strokeLinecap="round"/>
    </svg>
  ),
  "The Hero": (c) => (
    <svg {...archVb}>
      {/* Shield with star emblem */}
      <path d="M24 4L6 14v14c0 12 8 19 18 24 10-5 18-12 18-24V14L24 4z" fill={c} opacity="0.15"/>
      <path d="M24 4L6 14v14c0 12 8 19 18 24 10-5 18-12 18-24V14L24 4z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      {/* Star */}
      <path d="M24 16l3 6.5h7l-5.5 4.5 2 7L24 30l-6.5 4 2-7L14 22.5h7z" fill={WHITE} opacity="0.5"/>
      <path d="M24 16l3 6.5h7l-5.5 4.5 2 7L24 30l-6.5 4 2-7L14 22.5h7z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  "The Outlaw": (c) => (
    <svg {...archVb}>
      {/* Lightning bolt */}
      <path d="M30 4L12 30h12L16 52l22-28H26L30 4z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      <path d="M30 4L12 30h12L16 52l22-28H26L30 4z" fill={c} opacity="0.08"/>
    </svg>
  ),
  "The Magician": (c) => (
    <svg {...archVb}>
      {/* Bold star */}
      <path d="M24 4l6 14h15l-12 10 5 15-14-9-14 9 5-15L3 18h15z" fill={c} opacity="0.15"/>
      <path d="M24 4l6 14h15l-12 10 5 15-14-9-14 9 5-15L3 18h15z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  "The Neighbor": (c) => (
    <svg {...archVb}>
      {/* Coffee mug */}
      <path d="M8 12h24v24c0 4-4 8-8 8H16c-4 0-8-4-8-8V12z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      <path d="M8 12h24v24c0 4-4 8-8 8H16c-4 0-8-4-8-8V12z" fill={c} opacity="0.05"/>
      <path d="M32 18h6c3 0 5 2.5 5 5.5S41 29 38 29h-6" stroke={c} strokeWidth={archSw} strokeLinecap="round" fill="none"/>
      <path d="M15 6c0-3 2.5-3 2.5 0S20 6 20 3M22 6c0-3 2.5-3 2.5 0S27 6 27 3" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  ),
  "The Lover": (c) => (
    <svg {...archVb}>
      {/* Heart */}
      <path d="M24 18c-2.5-5-8-9-13-5s-5 10 0 18c3.5 5 9 10 13 15 4-5 9.5-10 13-15 5-8 5-14 0-18s-10.5 0-13 5z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
      <path d="M24 18c-2.5-5-8-9-13-5s-5 10 0 18c3.5 5 9 10 13 15 4-5 9.5-10 13-15 5-8 5-14 0-18s-10.5 0-13 5z" fill={c} opacity="0.07"/>
    </svg>
  ),
  "The Entertainer": (c) => (
    <svg {...archVb}>
      {/* Retro podcast microphone */}
      {/* Mic body - rounded capsule */}
      <path d="M16 14c0-6 3.5-10 8-10s8 4 8 10v16c0 6-3.5 10-8 10s-8-4-8-10V14z" stroke={c} strokeWidth={archSw} fill="none"/>
      <path d="M16 14c0-6 3.5-10 8-10s8 4 8 10v16c0 6-3.5 10-8 10s-8-4-8-10V14z" fill={c} opacity="0.06"/>
      {/* Grille dots */}
      <circle cx="21" cy="12" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="27" cy="12" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="21" cy="17" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="27" cy="17" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="24" cy="14.5" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="21" cy="22" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="27" cy="22" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="24" cy="19.5" r="1.2" fill={c} opacity="0.3"/>
      <circle cx="24" cy="24.5" r="1.2" fill={c} opacity="0.3"/>
      {/* Divider line between grille and body */}
      <path d="M16 28h16" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
      {/* Bottom buttons */}
      <circle cx="22" cy="33" r="1" fill={c} opacity="0.3"/>
      <circle cx="26" cy="33" r="1" fill={c} opacity="0.3"/>
      {/* Stand */}
      <path d="M24 40v8" stroke={c} strokeWidth={archSw} strokeLinecap="round"/>
      <path d="M18 48h12" stroke={c} strokeWidth={archSw} strokeLinecap="round"/>
      {/* Sound waves left */}
      <path d="M12 18c-2 3-2 8 0 12" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M8 14c-3 5-3 14 0 20" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
      {/* Sound waves right */}
      <path d="M36 18c2 3 2 8 0 12" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M40 14c3 5 3 14 0 20" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
    </svg>
  ),
  "The Caregiver": (c) => (
    <svg {...archVb}>
      {/* Outlined Greek cross - equal arms */}
      <path d="M18 10h12v12h12v12H30v12H18V34H6V22h12V10z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  "The Ruler": (c) => (
    <svg {...archVb}>
      {/* Tall crown */}
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
      {/* Camera */}
      {/* Camera body */}
      <rect x="4" y="18" width="40" height="28" rx="4" stroke={c} strokeWidth={archSw} fill="none"/>
      <rect x="4" y="18" width="40" height="28" rx="4" fill={c} opacity="0.08"/>
      {/* Top bump / viewfinder */}
      <path d="M17 18v-4c0-1 1-2 2-2h10c1 0 2 1 2 2v4" stroke={c} strokeWidth={archSw} fill="none"/>
      {/* Lens */}
      <circle cx="24" cy="33" r="9" stroke={c} strokeWidth={archSw} fill="none"/>
      <circle cx="24" cy="33" r="5" fill={c} opacity="0.15"/>
      {/* Flash */}
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
    <div data-section id={id} data-page-break={pageBreak || undefined} style={{
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
    synthesis: "Acme Co has a strong internal understanding of its value but struggles to translate that clarity externally. Positioning is solid at 16/20, yet messaging (15/20) lacks the proof points needed to convert that positioning into trust. Visibility efforts (14/20) are active but unfocused, spreading resources thin. Credibility signals exist but remain hidden at key decision points (13/20). Conversion infrastructure is functional but underleveraged (14/20). The throughline: internal clarity is not reaching external audiences in a way that builds trust and drives action.",
    diagnosis: "Your brand is currently strong but inconsistent because your positioning is clear internally but not consistently reflected across customer touchpoints.",
    primaryFocusArea: "Credibility",
    secondaryFocusArea: "Messaging",
    industryBenchmark: "For a regional B2B marketing consultancy at Acme Co\u2019s revenue stage, a WunderBrand Score™ of 72 is above average \u2014 most firms in this space operate in the 58\u201368 range. Acme Co\u2019s positioning strength is a genuine competitive asset, but the credibility gap is exactly where peers pull ahead. Closing that gap could move Acme Co into the top tier of its market.",
  },
  priorityDiagnosis: {
    primary: {
      whyFocus: "Credibility is the highest-leverage pillar because your positioning and messaging are already strong — but without visible proof, prospects cannot verify your claims. Trust is the bottleneck.",
      downstreamIssues: "Low credibility visibility forces your messaging to work harder, makes your positioning feel like marketing speak rather than fact, and causes prospects to hesitate at conversion points. Every pillar is underperforming because proof is not doing its job.",
      whatImproves: "When credibility is surfaced at key touchpoints, messaging becomes believable, positioning becomes defensible, and conversion friction drops. One change unlocks momentum across the system.",
    },
    secondary: {
      whyFocus: "Messaging is your secondary focus because while your core message is solid, it lacks the specific proof points that make claims believable. This creates a gap between what you say and what prospects can verify.",
      downstreamIssues: "Without concrete evidence backing your messaging, even strong positioning feels like marketing fluff. Prospects hear your value proposition but can't validate it, leading to longer decision cycles and price sensitivity.",
      whatImproves: "When messaging is reinforced with specific outcomes and evidence, your positioning gains teeth. Prospects move from ‘that sounds nice’ to ‘I believe that’ — shortening sales cycles and reducing objections.",
    },
  },
  pillarDeepDives: {
    positioning: {
      score: 16,
      interpretation: "Strong — Acme Co's differentiation is clear internally.",
      whatsHappeningNow: "Acme Co knows who it serves and why it's different. However, this clarity lives in your team's heads, not on acmeco.com. Visitors have to dig to understand Acme Co's value.",
      whyItMattersCommercially: "Unclear positioning on first impression means Acme Co's bounce rates stay elevated and sales cycles drag. You're leaving money on the table in the first 5 seconds of every site visit.",
      industryContext: "A positioning score of 16 is notably strong for a regional B2B marketing consultancy. Most firms in this space score 11\u201314 because they describe what they do rather than why it matters. Acme Co\u2019s internal clarity is a genuine advantage.",
      financialImpact: "Strong positioning reduces sales cycle length by 15\u201325% because prospects self-qualify faster. For Acme Co, that could mean closing deals 2\u20133 weeks sooner and reducing the cost per qualified lead.",
      riskOfInaction: "If Acme Co doesn\u2019t translate this internal positioning to the website and sales materials, competitors with weaker offerings but clearer messaging will continue winning head-to-head comparisons.",
      concreteExample: {
        before: "Acme Co — We help businesses grow with strategic marketing solutions.",
        after: "Acme Co helps B2B service companies turn brand confusion into clarity — so your marketing actually converts.",
      },
      strategicRecommendation: "Rewrite acmeco.com's homepage headline and subhead to reflect Acme Co's positioning statement. Test it with 5 people outside the company — if they can't repeat back what Acme Co does and for whom, iterate.",
      successLooksLike: "A visitor can articulate Acme Co's value proposition after 10 seconds on the homepage without scrolling.",
    },
    messaging: {
      score: 15,
      interpretation: "Solid foundation — but Acme Co's proof is missing.",
      whatsHappeningNow: "Acme Co's core message is benefit-focused and clear. However, supporting messages rely on claims (‘we deliver results’) rather than evidence (‘Acme Co increased TechNova’s revenue by 40% in 90 days’).",
      whyItMattersCommercially: "Claims without proof trigger skepticism. In Acme Co's market, where every B2B consultancy says the same thing, specificity and evidence are your competitive advantage.",
      industryContext: "For B2B consultancies, messaging scores above 14 indicate a clear core message exists. The gap is almost always in proof points \u2014 Acme Co follows this pattern precisely.",
      financialImpact: "Evidence-backed messaging typically improves proposal win rates by 20\u201330% in B2B services. For Acme Co, that means winning 1\u20132 more deals per quarter from the same pipeline.",
      riskOfInaction: "Without proof-driven messaging, Acme Co will continue competing on price and relationships alone \u2014 making growth dependent on referrals and leaving inbound leads under-converted.",
      concreteExample: {
        before: "Acme Co clients see real results from working with us.",
        after: "87% of Acme Co clients report measurable ROI within 90 days. Here's how we did it for TechNova.",
      },
      strategicRecommendation: "Audit acmeco.com and Acme Co's sales materials. Replace every claim with a specific outcome, number, or customer quote. If Acme Co doesn't have the data, that's the first action item.",
      successLooksLike: "Every page on acmeco.com includes at least one specific, verifiable proof point.",
    },
    visibility: {
      score: 14,
      interpretation: "Active presence — but Acme Co's strategy is unclear.",
      whatsHappeningNow: "Acme Co is posting on LinkedIn, the website is live, and you're present on relevant channels. But content feels reactive — topics shift based on inspiration rather than a plan tied to Acme Co's positioning.",
      whyItMattersCommercially: "Scattered visibility wastes Acme Co's time and budget. Worse, inconsistent messaging confuses your B2B audience and dilutes brand recall. Acme Co becomes forgettable.",
      industryContext: "Most regional B2B consultancies score 10\u201313 on visibility because they post inconsistently and without a content framework. Acme Co\u2019s active presence puts it ahead, but without strategic focus, the effort doesn\u2019t compound.",
      financialImpact: "A strategic content framework typically increases organic lead generation by 30\u201350% within 6 months for B2B firms. For Acme Co, that\u2019s the difference between hoping for referrals and building a predictable pipeline.",
      riskOfInaction: "Without a content strategy tied to brand pillars, Acme Co\u2019s team will burn out posting without results, competitors will claim topical authority in the space, and organic discovery will plateau.",
      concreteExample: {
        before: "Acme Co posting 3x/week on LinkedIn about whatever feels relevant that day.",
        after: "Acme Co's 4-week content calendar: Week 1 = Positioning (why B2B service companies need Acme Co), Week 2 = Credibility (TechNova case study), Week 3 = Messaging (proof-driven posts), Week 4 = Conversion (lead magnet promotion).",
      },
      strategicRecommendation: "Create a simple content framework for Acme Co that ties every piece of content to one of the five brand pillars. If it doesn't support a pillar, don't publish it.",
      successLooksLike: "Acme Co can look at any piece of content and immediately identify which pillar it strengthens.",
    },
    credibility: {
      score: 13,
      interpretation: "Trust signals exist — but Acme Co's proof is hidden.",
      whatsHappeningNow: "Acme Co has testimonials, case studies, and satisfied clients like TechNova and BrightPath. But these assets are buried on a testimonials page or mentioned only in sales calls. They're not doing their job at decision points.",
      whyItMattersCommercially: "Prospects don't visit Acme Co's testimonials page. They decide on the homepage, pricing page, and contact form. If proof isn't visible at those moments, hesitation wins.",
      industryContext: "A credibility score of 13 is typical for B2B consultancies that have strong client relationships but haven\u2019t systematized their social proof. Top performers in this space score 16\u201318 by making proof visible at every decision point.",
      financialImpact: "Visible credibility signals reduce sales cycle length by 20\u201335% in B2B services. For Acme Co, surfacing testimonials at decision points could be the single highest-ROI change available.",
      riskOfInaction: "Without visible credibility at key touchpoints, Acme Co will continue losing prospects to competitors who look more established \u2014 even when Acme Co\u2019s actual work is superior. Trust is decided in seconds, not meetings.",
      concreteExample: {
        before: "Acme Co's testimonials page with 12 quotes, linked in the footer.",
        after: "TechNova's testimonial on Acme Co's homepage hero. Client logo bar (TechNova, BrightPath, Meridian) above the fold. Case study preview on the services page.",
      },
      strategicRecommendation: "Identify Acme Co's top 3 testimonials — TechNova, BrightPath, and Meridian are strong candidates. Place one on the homepage, one on the services/pricing page, and one on the contact page. Make proof impossible to miss.",
      successLooksLike: "A prospect sees Acme Co social proof within 10 seconds of landing on any key page.",
    },
    conversion: {
      score: 14,
      interpretation: "Functional — but Acme Co's conversion path isn't optimized.",
      whatsHappeningNow: "Acme Co's CTAs exist and the contact form works. But there's no lead magnet, no nurture sequence, and no clear next step for B2B visitors who aren't ready to buy today.",
      whyItMattersCommercially: "Only 3% of Acme Co's visitors are ready to buy now. The other 97% need nurturing. Without a low-commitment entry point, Acme Co loses the majority of its traffic.",
      industryContext: "A conversion score of 14 is average for B2B consultancies. Most have a contact form and little else. Top performers differentiate with multi-path conversion systems \u2014 and that\u2019s where Acme Co has the biggest quick win.",
      financialImpact: "Adding a lead magnet and nurture sequence typically increases lead capture by 40\u201360% for B2B service firms. For Acme Co, this means capturing visitors who would otherwise leave and never return.",
      riskOfInaction: "Without a low-commitment conversion path, Acme Co will continue losing 97% of its website visitors permanently. Each visitor costs money to acquire \u2014 this is the most quantifiable leak in the system.",
      concreteExample: {
        before: "‘Contact Acme Co’ as the only CTA.",
        after: "‘Get the Free B2B Strategy Audit Checklist’ (lead magnet) + ‘Book a Strategy Session with Acme Co’ (high intent). Two paths for two audiences.",
      },
      strategicRecommendation: "Create one lead magnet specific to Acme Co's expertise that provides immediate value and captures email. Set up a 3-email nurture sequence that builds trust before asking for a call.",
      successLooksLike: "Acme Co has two conversion paths: one for high-intent visitors (book a strategy session) and one for early-stage visitors (download the audit checklist).",
    },
  },
  brandArchetypeSystem: {
    primary: {
      name: "The Sage",
      whenAligned: "When aligned, The Sage signals expertise, trustworthiness, and the ability to guide others toward better decisions. Your audience sees you as the go-to authority in your space.",
      riskIfMisused: "If overused, The Sage can come across as condescending or overly academic, alienating audiences who want practical help rather than lectures.",
      languageTone: "Lead with insight, not instruction. Ask questions that demonstrate understanding. Share frameworks, not just advice. Be confident, not condescending.",
      behaviorGuide: "Position yourself as a thinking partner, not a know-it-all. Validate your audience's intelligence while providing clarity they couldn't reach alone.",
    },
    secondary: {
      name: "The Caregiver",
      whenAligned: "When aligned, The Caregiver signals empathy, support, and a genuine desire to help others succeed. Your audience feels seen and supported on their journey.",
      riskIfMisused: "If overused, The Caregiver can come across as overly nurturing or self-sacrificing, making audiences feel guilty or creating dependency rather than empowerment.",
      languageTone: "Speak with warmth and encouragement. Use ‘we’ language to create partnership. Celebrate progress and normalize challenges.",
      behaviorGuide: "Show up as a trusted companion on the journey. Offer support without taking over. Make your audience feel capable while providing the care they need.",
    },
    howTheyWorkTogether: "The Sage provides expertise and credibility; The Caregiver ensures that expertise is accessible and supportive. Together, they position your brand as a trusted advisor who not only knows the answers but genuinely cares about helping others find them.",
  },
  brandPersona: {
    personaSummary: "Your brand persona is the trusted expert who makes complexity simple. You're knowledgeable without being academic, confident without being arrogant, and supportive without being soft. You lead with insight and back it with proof.",
    coreIdentity: {
      whoYouAre: "A strategic partner who sees what others miss and explains it in a way that creates clarity, not confusion.",
      whatYouStandFor: "The belief that great work deserves to be seen, understood, and valued — and that clear communication is the bridge between quality and recognition.",
      howYouShowUp: "As a thinking partner who brings both expertise and empathy. You don't just diagnose problems — you illuminate the path forward.",
    },
    communicationStyle: {
      tone: "Confident but not arrogant. Direct but not cold. Insightful but not academic.",
      pace: "Measured and intentional. You don't rush. Every word earns its place.",
      energy: "Calm authority. You project competence through clarity, not volume.",
    },
    messagingExamples: {
      headlines: {
        avoid: ["We help businesses grow", "Acme Co — Your Success Partner", "Results-driven solutions for every business"],
        use: ["Acme Co: Strategic consulting that turns complexity into competitive advantage", "B2B service companies lose deals when strategy is unclear. Acme Co fixes that.", "Acme Co helps B2B teams stop guessing and start growing with clarity"],
      },
      ctaButtons: {
        avoid: ["Submit", "Learn More", "Contact Us"],
        use: ["Book a Strategy Session with Acme", "See How Acme Co Can Help", "Get Your Free Clarity Audit"],
      },
      socialPosts: {
        avoid: ["Check out our latest blog post! [link]", "We're hiring! Apply now!", "Happy Monday! What are your goals this week?"],
        use: ["We just helped a B2B SaaS company cut their sales cycle by 30%. Here's what we changed first:", "Your services page says ‘We deliver results.’ Your prospect's brain says ‘prove it.’ Here's how Acme Co bridges that gap:", "3 things we tell every new Acme Co client before we touch their marketing strategy:"],
      },
    },
    doAndDont: {
      do: [
        { 
          guideline: "Lead with the insight, then the offer",
          example: "“Most B2B service companies lose deals before the first call. At Acme Co, we've identified why — and built a process to fix it.”"
        },
        { 
          guideline: "Use specific numbers and outcomes",
          example: "\"Acme Co clients see 40% faster decision cycles within 90 days\" vs \"We help you close deals faster\""
        },
        { 
          guideline: "Acknowledge the reader's intelligence",
          example: "\"You've built something real. Acme Co helps you communicate its value as clearly as you deliver it.\""
        },
        { 
          guideline: "Create a sense of possibility, not pressure",
          example: "\"Imagine if every prospect understood Acme Co's value within the first 5 seconds on your site.\""
        },
      ],
      dont: [
        { 
          guideline: "Use hollow superlatives (‘best-in-class’, ‘world-class’)",
          example: "❌ \"Acme Co provides world-class solutions\" → ✓ \"Acme Co has helped 47 B2B teams reduce their sales cycle by 35%\""
        },
        { 
          guideline: "Make promises without proof",
          example: "❌ \"We guarantee results\" → ✓ \"Here's exactly what changed for TechNova after 90 days with Acme Co\""
        },
        { 
          guideline: "Talk about yourself before addressing their situation",
          example: "❌ \"Acme Co is a leading consulting firm...\" → ✓ \"Your strategy is strong but invisible. Here's how Acme Co would approach it.\""
        },
        { 
          guideline: "Use jargon that creates distance instead of connection",
          example: "❌ \"Leverage synergies to optimize ROI\" → ✓ \"Acme Co makes your marketing work harder with less waste\""
        },
      ],
    },
  },
  messagingPillars: [
    {
      name: "Strategic Clarity",
      whatItCommunicates: "We cut through complexity and give you a clear, actionable path forward — no jargon, no fluff.",
      whyItMatters: "In a market where every B2B consultancy promises 'results,' Acme Co's ability to simplify complexity is a rare and defensible advantage that builds trust before the first conversation.",
      exampleMessage: "Your brand has value. The problem isn't your work — it's your communication. We make what's true visible.",
    },
    {
      name: "Proof-Backed Credibility",
      whatItCommunicates: "Every claim we make is backed by evidence, outcomes, and real-world results — not marketing speak.",
      whyItMatters: "B2B buyers are skeptical of consultants who talk big but can't prove impact. Acme Co's proof-first approach reduces friction at every decision point.",
      exampleMessage: "Acme Co clients close 35% more deals within 90 days — here's how we do it for companies like yours.",
    },
    {
      name: "Client-First Partnership",
      whatItCommunicates: "We're not a vendor. We're a strategic partner who invests in your success as if it were our own.",
      whyItMatters: "The consultancy market is crowded with transactional relationships. Positioning as a partner creates longer engagements, higher retention, and better referrals.",
      exampleMessage: "We don't hand you a deck and disappear. We build alongside you until the strategy is working.",
    },
  ],
  visualVerbalSignals: {
    colorPaletteDirection: "Navy and deep blue for authority and trust. Bright blue accents for clarity and forward motion. White space for confidence. Avoid overly warm colors that undermine professionalism.",
    colorSwatches: [
      { name: "Navy", hex: "#021859", usage: "Primary / Headers" },
      { name: "Deep Blue", hex: "#0A2E6E", usage: "Secondary text" },
      { name: "Bright Blue", hex: "#07B0F2", usage: "Accents / CTAs" },
      { name: "Light Blue", hex: "#E8F6FE", usage: "Backgrounds" },
      { name: "White", hex: "#FFFFFF", usage: "Primary background" },
      { name: "Light Gray", hex: "#F4F7FB", usage: "Section backgrounds" },
    ],
    avoidColors: [
      { name: "Warm Orange", hex: "#FF6B35", reason: "Too casual" },
      { name: "Bright Red", hex: "#E63946", reason: "Aggressive" },
    ],
    voiceTraits: ["Clear", "Confident", "Supportive", "Direct", "Insightful"],
    consistencyRisks: "Avoid shifting between overly casual (social) and overly formal (website). The voice should feel like the same person across all channels — knowledgeable but approachable.",
  },
  strategicActionPlan: [
    { 
      action: "Surface your strongest testimonial on your homepage above the fold.", 
      pillar: "Credibility", 
      outcome: "Immediate trust signal at first impression.", 
      priority: 1,
      why: "Visitors make judgment calls in under 5 seconds. A strong testimonial from a recognizable name or company immediately answers the question ‘Can I trust these people?’ before they even read your headline.",
      howTo: [
        "Identify your best testimonial — look for specific outcomes, named clients, or recognizable companies",
        "Place it within the first viewport (visible without scrolling) near your headline",
        "Include the person's name, title, and company logo if possible",
        "Keep it to 1-2 sentences max — impact over length"
      ],
      example: "\"Acme increased our qualified leads by 47% in 90 days. Their process was clear from day one.\" — Sarah Chen, VP Marketing, TechCorp",
      effort: "Low",
      impact: "High"
    },
    { 
      action: "Rewrite your homepage headline to reflect your positioning statement.", 
      pillar: "Positioning", 
      outcome: "Visitors understand your value in 5 seconds.", 
      priority: 2,
      why: "Your headline is the most-read piece of copy on your site. If it's generic (‘We help businesses grow’), you're wasting your highest-value real estate. A clear positioning headline immediately filters the right visitors in and wrong ones out.",
      howTo: [
        "Start with your differentiation: What do you do that others don't?",
        "Include who you serve: Be specific about your ideal client",
        "Add the transformation: What changes because of your work?",
        "Test it: Can someone understand your value without reading anything else?"
      ],
      example: "Before: ‘Acme Co — Marketing Solutions for Growing Businesses’ → After: ‘Acme Co helps B2B service companies turn invisible expertise into visible authority — and authority into revenue.’",
      effort: "Medium",
      impact: "High"
    },
    { 
      action: "Replace one claim on your services page with a specific outcome or number.", 
      pillar: "Messaging", 
      outcome: "Claims become believable proof.", 
      priority: 3,
      why: "Generic claims (‘We deliver results’) create skepticism. Specific outcomes (‘Clients see 40% faster close rates’) create belief. One concrete proof point is worth ten vague promises.",
      howTo: [
        "Audit your services page for vague claims (results, quality, expertise, etc.)",
        "Pick the weakest claim — the one that sounds most like marketing speak",
        "Replace it with a specific number, timeframe, or named outcome",
        "If you don't have data, use a specific client example or case study reference"
      ],
      example: "Before: ‘Acme Co helps you close more deals’ → After: ‘Acme Co clients close 35% more deals within 90 days — here’s how we do it for companies like yours.’",
      effort: "Low",
      impact: "Medium"
    },
    { 
      action: "Create a simple lead magnet that provides immediate value.", 
      pillar: "Conversion", 
      outcome: "Capture early-stage visitors who aren't ready to buy.", 
      priority: 4,
      why: "Most visitors aren't ready to buy on their first visit. Without a low-commitment entry point, you lose the opportunity to build trust over time. A valuable lead magnet trades their email for something genuinely useful.",
      howTo: [
        "Identify a specific problem your ideal client faces early in their journey",
        "Create a resource that solves that problem (checklist, template, mini-guide)",
        "Keep it short and immediately actionable — 1-3 pages max",
        "Place the opt-in at key decision points: homepage, blog posts, exit intent"
      ],
      example: "For Acme Co: ‘The B2B Strategy Audit Checklist: 7 Questions That Reveal Why Your Expertise Isn’t Converting to Revenue’",
      effort: "Medium",
      impact: "High"
    },
    { 
      action: "Build a 4-week content calendar tied to your five pillars.", 
      pillar: "Visibility", 
      outcome: "Content becomes strategic, not scattered.", 
      priority: 5,
      why: "Random content creates random results. When every piece of content maps to a specific pillar (Positioning, Messaging, Visibility, Credibility, Conversion), you're systematically strengthening your brand instead of just ‘staying active.’",
      howTo: [
        "Map one pillar to each week of the month (rotate through all five)",
        "For each pillar, create 2-3 content pieces: one educational, one proof-based, one conversion-focused",
        "Repurpose across channels: blog → LinkedIn → email → social",
        "Track which pillar-focused content performs best — double down there"
      ],
      example: "Week 1 (Credibility): Acme Co case study — how we helped TechNova reduce sales cycles by 35%. Week 2 (Positioning): ‘Why B2B service companies hire Acme Co over generalist agencies’ → Acme Co's take on the industry's biggest blind spot → FAQ that reinforces Acme Co's positioning.",
      effort: "Medium",
      impact: "Medium"
    },
  ],
  contextCoverage: {
    overallPercent: 78,
    areas: [
      { name: "Brand Positioning", percent: 90, status: "strong" },
      { name: "Messaging & Copy", percent: 85, status: "strong" },
      { name: "Audience Clarity", percent: 72, status: "moderate" },
      { name: "Visual Identity", percent: 65, status: "moderate" },
      { name: "Competitive Context", percent: 58, status: "limited" },
      { name: "Conversion Data", percent: 70, status: "moderate" },
    ],
    contextGaps: [
      "Competitor positioning and differentiation data would sharpen Acme Co's positioning recommendations",
      "Website analytics (bounce rate, time on page) would allow more precise conversion diagnosis",
      "Customer interview transcripts or survey data would deepen audience signal accuracy",
    ],
  },
  strategicAlignmentOverview: {
    summary: "Acme Co's five pillars are not working as a unified system. Positioning and messaging are relatively aligned but disconnected from credibility. Visibility operates independently without strategic direction. Conversion exists but isn't supported by the trust signals it needs to perform.",
    reinforcements: [
      { pillars: "Positioning → Messaging", insight: "Acme Co's clear positioning (16/20) provides a strong foundation for messaging. When the positioning statement is reflected consistently in copy, messaging becomes more effective automatically." },
      { pillars: "Credibility → Conversion", insight: "Surfacing Acme Co's hidden trust signals at key decision points will directly reduce friction in the conversion path. These two pillars are tightly linked — fixing one improves the other." },
    ],
    conflicts: [
      { pillars: "Visibility ↔ Positioning", insight: "Acme Co's content is active but doesn't consistently reflect positioning. This creates a disconnect: prospects see the brand often but can't articulate what Acme Co does differently." },
      { pillars: "Messaging ↔ Credibility", insight: "Acme Co's messaging makes strong claims, but credibility signals aren't placed where those claims are made. This gap forces messaging to do the work of both persuasion and proof." },
    ],
    systemRecommendation: "Start with credibility (primary focus) to create a trust foundation. Then refine messaging with proof points. This sequence will naturally strengthen conversion and give visibility efforts a clearer message to amplify.",
  },
  visibilityDiscovery: {
    visibilityMode: "Hybrid",
    visibilityModeExplanation: "Acme Co operates in a hybrid mode — the website serves as the authority hub while LinkedIn drives discovery and engagement. Neither channel is optimized to its full potential, but the foundation for both exists.",
    discoveryDiagnosis: {
      whereTheyShouldFind: ["Google search for ‘B2B consulting firms’", "LinkedIn thought leadership content", "Industry podcast guest appearances", "Referral networks and partner channels"],
      whereTheyActuallyFind: ["Direct referrals (word of mouth)", "LinkedIn profile visits (not posts)", "Google branded search only"],
      gap: "Acme Co is discoverable by people who already know the name, but nearly invisible to prospects actively searching for solutions. Non-branded discovery is the critical gap.",
    },
    aeoReadiness: {
      score: "Low-Moderate",
      explanation: "Acme Co's website content is not structured for AI engine discovery. Key issues: no FAQ schema, no structured data markup, service descriptions use marketing language rather than the question-answer format AI engines prefer.",
      recommendations: [
        "Add FAQ sections to key service pages using the exact questions prospects ask",
        "Structure content in question-answer pairs that AI engines can extract",
        "Include specific outcome data and named examples that AI can cite as sources",
        "Ensure meta descriptions match conversational search queries, not just keywords",
      ],
    },
    visibilityPriorities: [
      { priority: 1, action: "Optimize acmeco.com service pages for non-branded search queries", impact: "Opens discovery to prospects who don't yet know Acme Co" },
      { priority: 2, action: "Shift LinkedIn from profile-based to content-based discovery", impact: "Reaches prospects before they know they need Acme Co" },
      { priority: 3, action: "Implement structured FAQ content for AI engine readiness", impact: "Positions Acme Co for next-generation search and AI recommendations" },
      { priority: 4, action: "Launch a monthly guest appearance strategy (podcasts, webinars)", impact: "Builds authority in channels where B2B decision-makers spend time" },
    ],
  },
  audienceClarity: {
    audienceSignals: {
      primaryAudience: "B2B service company founders and marketing leaders (10-100 employees) who have built something valuable but struggle to communicate that value externally.",
      audienceCharacteristics: [
        "Revenue between $1M-$20M — successful enough to invest, frustrated enough to seek help",
        "Have tried DIY marketing or worked with generalist agencies with underwhelming results",
        "Understand their product/service deeply but can't translate that clarity into marketing that converts",
        "Time-constrained leaders who need strategic clarity, not more tactics",
      ],
      audienceLanguage: "They say things like: ‘Our work speaks for itself, but not enough people are hearing it.’ ‘We keep losing to competitors who aren’t as good as us.’ ‘I know we need better marketing, but I don’t know where to start.’",
    },
    decisionDrivers: {
      motivators: [
        { driver: "Clarity", explanation: "They're overwhelmed by marketing noise and want a clear, prioritized path forward — not more options." },
        { driver: "Credibility of the advisor", explanation: "They've been burned by agencies that overpromised. They need to see proof that Acme Co practices what it preaches." },
        { driver: "Speed to value", explanation: "They want to see tangible progress quickly — not a 6-month strategy phase before anything happens." },
        { driver: "Strategic partnership", explanation: "They want a partner who understands their business, not a vendor who runs campaigns." },
      ],
      hesitationFactors: [
        { factor: "Past disappointment", explanation: "Previous agency or consultant relationships didn't deliver. They're skeptical of promises." },
        { factor: "Price sensitivity", explanation: "Not because they can't afford it, but because they've spent money before without seeing results." },
        { factor: "Loss of control", explanation: "They've built their brand personally and are hesitant to hand it to someone who doesn't understand it." },
        { factor: "Unclear ROI timeline", explanation: "They need to know when they'll see results, not just that results are possible." },
      ],
    },
  },
  foundationalPromptPack: {
    packName: "Foundational Prompt Pack",
    description: "Brand platform building prompts — positioning, messaging, voice, and strategic direction. These help you build the foundation every other brand decision stands on.",
    promptCount: 8,
    prompts: [
      {
        category: "Positioning",
        title: "Brand Positioning Statement Builder",
        instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.",
        prompt: `You are a brand strategist helping Acme Co develop a foundational positioning statement.

Brand context from diagnostic:
- Primary Archetype: The Sage
- Secondary Archetype: The Caregiver
- Industry: B2B consulting
- Target Audience: B2B service company founders and marketing leaders (10–100 employees)
- Top Strengths: Clear internal positioning (16/20), Active content presence, Strong service delivery understanding
- Top Gaps: Credibility signals hidden at decision points (13/20), Messaging lacks proof points (15/20), Visibility efforts unfocused (14/20)
- WunderBrand Score™: 72

Create a brand positioning statement using this framework:

"For [target audience] who [need/desire], [brand name] is the [category] that [key differentiator] because [reason to believe]."

Then provide:
1. The completed positioning statement
2. A 2–3 sentence expanded narrative that brings this positioning to life
3. Three alternative positioning angles, each emphasizing a different strength from the diagnostic
4. A "positioning litmus test" — 3 yes/no questions to validate which option is strongest

Keep the language authentic to The Sage voice. No corporate jargon, no empty superlatives.`,
        whyItMatters: "Your positioning statement is the single sentence every brand decision should trace back to. Without it, your messaging drifts, your visuals disconnect, and your audience can't repeat what you do.",
      },
      {
        category: "Positioning",
        title: "Competitive Differentiation Finder",
        instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.",
        prompt: `You are a brand strategist helping Acme Co identify meaningful competitive differentiation.

My brand diagnostic results:
- Archetype: The Sage / The Caregiver
- Alignment Score: 72
- Strongest Dimensions: Positioning (16/20), Messaging (15/20)
- Weakest Dimensions: Credibility (13/20), Visibility (14/20), Conversion (14/20)
- Industry: B2B consulting
- Current competitors or alternatives my audience considers: Unknown

Help me find my differentiation:
1. Based on my archetype combination, identify 3 "differentiation territories" — areas where my archetype blend naturally has permission to lead that other archetypes don't
2. For each territory, suggest a specific claim I could own — not a vague attribute but a concrete promise
3. Identify which of my weak dimensions could undermine this differentiation if left unaddressed
4. Suggest one "white space" opportunity — a position no one in B2B consulting is claiming that my archetype is perfectly suited for

Be specific. "Quality" and "great service" are not differentiators. I need positions that would make a competitor uncomfortable to copy.`,
        whyItMatters: "Differentiation isn't about being different everywhere — it's about being meaningfully different where it matters most. Your archetype profile reveals natural territories competitors can't authentically claim.",
      },
      {
        category: "Messaging",
        title: "Core Messaging Framework",
        instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.",
        prompt: `You are a brand messaging strategist building a core messaging framework for Acme Co.

Brand foundation:
- Archetype: The Sage with The Caregiver influence
- Positioning: Use output from Prompt 1 if completed
- Target Audience: B2B service company founders and marketing leaders
- Key Strengths: Clear positioning, strong internal brand understanding, active content presence
- Brand Personality: Insightful, confident, supportive, clear, knowledgeable

Build a messaging hierarchy:
1. Brand Promise — one sentence about the transformation or value you deliver (not what you do, but what changes for the customer)
2. Brand Narrative — a 3-sentence story structure: the problem your audience faces → your unique approach → the outcome they can expect
3. Three Message Pillars — the main themes every piece of content should reinforce. For each pillar:
   - Pillar name (2–3 words)
   - What it communicates
   - Example headline that brings it to life
4. Proof Points — 2 evidence examples under each pillar (suggest types of proof if specifics aren't available yet)
5. Brand Boilerplate — a 50-word "about" paragraph for bios, proposals, and footers

The tone should reflect The Sage voice throughout. This framework should feel like a cheat sheet someone could hand to any copywriter and get consistent results.`,
        whyItMatters: "A messaging framework solves the blank-page problem. Instead of reinventing your story every time you write, you pull from a structured hierarchy that keeps everything aligned.",
      },
      {
        category: "Messaging",
        title: "Value Proposition Sharpener",
        instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.",
        prompt: `You are a brand strategist helping Acme Co sharpen their value proposition.

Context:
- Archetype: The Sage / The Caregiver
- What we do: B2B consulting that helps service companies translate internal expertise into visible market authority
- Who we serve: B2B service company founders and marketing leaders (10–100 employees)
- Current value proposition: None yet
- Diagnostic strengths: Clear positioning (16/20), Strong service delivery, Active content presence
- Diagnostic gaps: Credibility signals hidden (13/20), Messaging lacks proof points, Visibility unfocused

Create three value proposition options, each taking a different strategic angle:

Option A — Outcome-Led: Emphasize the result or transformation the customer achieves
Option B — Experience-Led: Emphasize how working with us feels, leaning into our Sage personality
Option C — Problem-Led: Emphasize the specific pain point we eliminate better than anyone

For each option provide:
- The value proposition (1–2 sentences max)
- A website hero headline using this angle
- A supporting subheadline that adds specificity
- Score it on: Clarity (1–10), Emotional resonance (1–10), Differentiation (1–10)

Then recommend which option is strongest for my archetype and audience, and why.`,
        whyItMatters: "Your value proposition needs to answer ‘why you, why now?’ in under 10 seconds. Most brands take a paragraph. These three angles let you test which resonates before committing.",
      },
      {
        category: "Brand Voice",
        title: "Brand Voice Guidelines Builder",
        instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.",
        prompt: `You are a brand voice specialist creating voice guidelines for Acme Co.

Archetype profile:
- Primary: The Sage
- Secondary: The Caregiver
- How they blend: Sage credibility and insight with Caregiver warmth and support
- Industry: B2B consulting
- Audience: B2B service company founders and marketing leaders

Build a comprehensive voice guide:

1. Voice Summary — 2 sentences describing how this brand sounds in conversation

2. Four Voice Attributes — for each:
   - Name the attribute as a spectrum (e.g., "Confident, not arrogant" or "Warm, not casual")
   - "This means we..." — what it looks like in practice
   - "This doesn't mean we..." — the boundary
   - Do/Don't example sentence pair

3. Tone Adaptation — how the voice flexes across:
   - Website copy (most polished)
   - Social media (most personality)
   - Email marketing (most direct)
   - Client communications (most personal)
   - Sales/proposals (most authoritative)

4. Language Bank:
   - 15 words/phrases that are "on brand"
   - 10 words/phrases that are "off brand"
   - 5 sentence starters we'd use
   - 5 sentence starters we'd never use

Root everything in The Sage communication patterns with The Caregiver influence.`,
        whyItMatters: "Your voice is the most consistent element of your brand — it shows up in every email, post, call, and proposal. Documenting it means anyone who writes for your brand sounds like your brand.",
      },
      {
        category: "Brand Voice",
        title: "Elevator Pitch & Brand Story Generator",
        instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.",
        prompt: `You are a brand storytelling expert helping Acme Co craft their brand narrative.

Brand foundation:
- Archetype: The Sage / The Caregiver
- Positioning: Use output from Prompt 1 if completed
- Industry: B2B consulting
- Audience: B2B service company founders and marketing leaders
- Key Differentiator: Turns invisible expertise into visible authority
- Brand Personality: Insightful, confident, supportive, clear

Create multiple versions of the brand story:

1. The 10-Second Pitch — one sentence that works at a networking event
2. The 30-Second Elevator Pitch — 3 sentences: context, what you do differently, outcome
3. The 2-Minute Origin Story — the narrative version: why this brand exists, the problem that sparked it, the belief that drives it, where it's going
4. The "About Us" Page Version — 150 words, written in brand voice, for website use
5. The Social Bio — under 160 characters for LinkedIn/Instagram

Each version should:
- Feel like the same brand at different zoom levels
- Reflect The Sage storytelling patterns
- Lead with the audience's problem, not your credentials
- Include at least one specific, concrete detail (not generic platitudes)`,
        whyItMatters: "You need your brand story at multiple lengths for different contexts. When all versions trace back to the same core narrative, your brand stays coherent whether you have 10 seconds or 10 minutes.",
      },
      {
        category: "Strategy",
        title: "Brand-Aligned Content Idea Generator",
        instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.",
        prompt: `You are a content strategist for Acme Co generating ideas that reinforce brand positioning.

Brand context:
- Archetype: The Sage / The Caregiver
- Message Pillars: Use output from Prompt 3 if completed
- Audience: B2B service company founders and marketing leaders
- Industry: B2B consulting
- Strengths to showcase: Clear positioning, strong internal brand understanding, active content presence

Generate 12 content ideas organized by strategic purpose:

Thought Leadership (3 ideas) — establish authority in our Sage domain
Audience-First (3 ideas) — address pain points while staying on-brand
Brand Personality (3 ideas) — showcase values and voice, build connection
Differentiation (3 ideas) — highlight what makes us unlike alternatives

For each idea include:
- Working title
- One-sentence angle
- Best format (article, video, carousel, email, podcast episode, etc.)
- Which message pillar it reinforces
- Difficulty level (easy / medium / ambitious)

Rules: No generic "5 Tips for X" content. Every idea should be something only a Sage brand would create. If a competitor could publish it unchanged, it's not on-brand enough.`,
        whyItMatters: "Content that doesn't connect to your brand strategy is just noise. This ensures every piece reinforces your positioning, not just your visibility.",
      },
      {
        category: "Strategy",
        title: "90-Day Brand Action Plan Builder",
        instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.",
        prompt: `You are a brand consultant creating a prioritized action plan for Acme Co.

Diagnostic results:
- Overall Alignment Score: 72
- Archetype: The Sage / The Caregiver
- Dimension Scores:
  Positioning: 16/20
  Messaging: 15/20
  Visibility: 14/20
  Credibility: 13/20
  Conversion: 14/20
- Top Strengths: Clear internal positioning, active content presence, strong service delivery understanding
- Critical Gaps: Credibility signals hidden at decision points, messaging lacks proof points, visibility unfocused
- Recommendations from Report: Surface credibility signals at key touchpoints, add proof points to messaging, focus visibility efforts on highest-value channels

Build a 90-day brand improvement roadmap:

Phase 1: Quick Wins (Weeks 1–2)
- 3–4 high-impact, low-effort actions that leverage existing strengths
- Focus on fixes that improve brand consistency immediately

Phase 2: Foundation Building (Weeks 3–6)
- 3–4 structural improvements targeting the weakest dimensions
- Each should directly improve a specific diagnostic score

Phase 3: Growth Moves (Weeks 7–12)
- 3–4 strategic initiatives that build on the foundation
- Focus on differentiation and visibility

For each action item include:
- What to do (specific and actionable, not vague)
- Which dimension it improves
- Expected effort: Low / Medium / High
- Expected impact: Low / Medium / High
- Dependencies (does this require another action first?)

Prioritize ruthlessly. A brand trying to fix everything at once fixes nothing.`,
        whyItMatters: "Diagnostic scores without an action plan are just data. This turns your results into a prioritized roadmap with clear phases so you know exactly what to do next.",
      },
    ],
  },
  whatsNextUnlocks: "WunderBrand Snapshot+™ diagnoses and prioritizes. WunderBrand Blueprint™ takes these insights and turns them into an operational system — messaging frameworks, voice guidelines, visual direction, and AI prompts you can use immediately. WunderBrand Blueprint™ is where strategy becomes implementation.",
  taglineRecommendations: [
    {
      tagline: "Strategy That Scales With You",
      rationale: "Positions Acme Co as a growth partner, not just a service provider — reflects the Sage archetype's emphasis on wisdom applied practically.",
      bestUsedOn: "Website hero section, LinkedIn bio, email signature",
      tone: "Confident authority with warmth"
    },
    {
      tagline: "Clarity First. Growth Follows.",
      rationale: "Emphasizes Acme Co's strategic clarity as the foundation for measurable results — directly ties to their primary messaging pillar.",
      bestUsedOn: "Tagline beneath logo, presentation title slides, proposal covers",
      tone: "Direct and assured"
    },
    {
      tagline: "Your Brand, Fully Aligned",
      rationale: "Speaks to the core WunderBrand Snapshot™ value proposition — brand alignment — and positions Acme Co as the path to achieving it.",
      bestUsedOn: "Social media bios, ad campaigns, brand collateral",
      tone: "Warm and aspirational"
    }
  ],
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
export default function BrandSnapshotPlusReport() {
  const r = REPORT;
  const [selectedFocus, setSelectedFocus] = useState<"primary" | "secondary">("primary");
  const [selectedArchetype, setSelectedArchetype] = useState<"primary" | "secondary">("primary");

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
          [data-before-after] { grid-template-columns: 1fr !important; }
          [data-archetype-cards] { grid-template-columns: 1fr !important; }
          [data-focus-cards] { grid-template-columns: 1fr !important; }
          [data-voice-traits] { flex-wrap: wrap !important; }
        }
      `}} />

      {/* ═══ HEADER ═══ */}
      <div style={{ background: WHITE, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "40%", opacity: 0.04, backgroundImage: `radial-gradient(${NAVY} 1px, transparent 1px)`, backgroundSize: "16px 16px" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div data-header-top style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: `1px solid ${BORDER}` }}>
            <a href="https://wunderbardigital.com/?utm_source=brand_snapshot_plus_report&utm_medium=report_nav&utm_campaign=nav_header_logo&utm_content=snap_plus_logo" target="_blank" rel="noopener noreferrer">
              <img src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp" alt="Wunderbar Digital" style={{ height: 26, objectFit: "contain" }} />
            </a>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: NAVY, lineHeight: 1 }}>WunderBrand Snapshot+™<span style={{ fontSize: 9, verticalAlign: "super", lineHeight: 0 }}>™</span></span>
              <span style={{ fontSize: 12, fontWeight: 400, color: BLUE, marginTop: 3 }}>Powered by <a href="https://wunderbardigital.com/?utm_source=brand_snapshot_plus_report&utm_medium=report_nav&utm_campaign=nav_header_logo&utm_content=snap_plus_logo" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: BLUE, textDecoration: "none" }}>Wunderbar Digital</a></span>
            </div>
          </div>

          <div data-header-info style={{ padding: "22px 0 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>Strategic Brand Alignment Diagnostic</span>
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
                    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>WunderBrand Snapshot+™ - ${r.businessName}</title><link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet"><style>body{margin:0;font-family:Lato,sans-serif;}</style></head><body>${el.outerHTML}</body></html>`;
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Brand-Snapshot-Plus-${r.businessName.replace(/\s+/g, '-')}.html`;
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

        <div style={{ height: 3, background: BLUE }} />
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 48px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Preview Banner */}
        <div style={{
          background: "#fff9e6", border: "2px solid #f5e6b3", borderRadius: 5,
          padding: "12px 16px", fontSize: 14, color: "#8b6914",
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
        }}>
          <span><strong>Preview mode</strong> — Mock data showing WunderBrand Snapshot+™ structure.</span>
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
            <span style={{ fontWeight: 700, color: NAVY }}>How to read this report:</span> WunderBrand Snapshot+™ builds on your diagnostic with deeper analysis, priority focus, and strategic recommendations. Each pillar includes concrete examples and success metrics.
          </div>
        </div>

        {/* ═══ 1. EXECUTIVE SUMMARY ═══ */}
        <Section id="executive-summary">
          <SectionTitle hero description="A strategic overview of your brand's alignment with prioritized focus areas.">Executive Summary</SectionTitle>

          {/* Key Findings Cards */}
          {(() => {
            const pillarEntries = PILLARS.map(p => ({ key: p, label: PILLAR_LABELS[p], score: r.pillarDeepDives[p].score }));
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

          <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75, marginBottom: 20 }}>
            {r.executiveSummary.synthesis}
          </div>

          {/* Industry Benchmark */}
          {(r.executiveSummary as any).industryBenchmark && (
            <div style={{ padding: "16px 20px", borderRadius: 5, background: `${BLUE}06`, borderLeft: `3px solid ${BLUE}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2 }}>
                <rect x="2" y="10" width="4" height="8" rx="1" fill={BLUE} opacity="0.3"/>
                <rect x="8" y="6" width="4" height="12" rx="1" fill={BLUE} opacity="0.5"/>
                <rect x="14" y="2" width="4" height="16" rx="1" fill={BLUE} opacity="0.7"/>
              </svg>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Industry Benchmark</div>
                <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{(r.executiveSummary as any).industryBenchmark}</div>
              </div>
            </div>
          )}
        </Section>

        {/* ═══ CONTEXT COVERAGE METER ═══ */}
        <Section id="context-coverage">
          <SectionTitle description="How thoroughly we were able to analyze your brand based on the information provided.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="1.5" opacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="3" fill={BLUE}/>
              </svg>
              Context Coverage
            </span>
          </SectionTitle>

          {/* Overall meter */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, padding: "20px 24px", background: `${BLUE}06`, borderRadius: 5, border: `1px solid ${BLUE}20` }}>
            <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
              <svg viewBox="0 0 80 80" style={{ width: 80, height: 80 }}>
                <circle cx="40" cy="40" r="34" fill="none" stroke={BORDER} strokeWidth="6"/>
                <circle cx="40" cy="40" r="34" fill="none" stroke={BLUE} strokeWidth="6"
                  strokeDasharray={`${(r.contextCoverage.overallPercent / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)"/>
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: NAVY }}>
                {r.contextCoverage.overallPercent}%
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Overall Context Coverage</div>
              <div style={{ fontSize: 15, color: SUB, lineHeight: 1.55 }}>
                We had sufficient information to provide a {r.contextCoverage.overallPercent >= 80 ? "highly detailed" : r.contextCoverage.overallPercent >= 60 ? "thorough" : "foundational"} analysis. Areas with lower coverage may benefit from additional data in a follow-up diagnostic.
              </div>
            </div>
          </div>

          {/* Individual area bars */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {r.contextCoverage.areas.map((area, i) => (
              <div key={i} style={{ padding: "14px 16px", background: WHITE, borderRadius: 5, border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{area.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                    background: area.status === "strong" ? `${GREEN}15` : area.status === "moderate" ? `${YELLOW}15` : `${RED_S}10`,
                    color: area.status === "strong" ? GREEN : area.status === "moderate" ? "#92700C" : RED_S,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>{area.percent}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: `${NAVY}10`, overflow: "hidden" }}>
                  <div style={{
                    width: `${area.percent}%`, height: "100%", borderRadius: 3,
                    background: area.status === "strong" ? GREEN : area.status === "moderate" ? YELLOW : RED_S,
                    transition: "width 0.6s ease",
                  }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Context gaps */}
          {r.contextCoverage.contextGaps.length > 0 && (
            <div style={{ marginTop: 20, padding: "16px 20px", background: `${YELLOW}08`, borderRadius: 5, border: `1px solid ${YELLOW}25` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                  <circle cx="10" cy="10" r="9" stroke={YELLOW} strokeWidth="1.5"/>
                  <path d="M10 6v5M10 14h.01" stroke={YELLOW} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 900, color: "#92700C", textTransform: "uppercase", letterSpacing: "0.08em" }}>Areas for Deeper Analysis</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {r.contextCoverage.contextGaps.map((gap, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#92700C", marginTop: 7, flexShrink: 0 }}/>
                    <span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* ═══ STRENGTHEN YOUR ANALYSIS CTA ═══ */}
        {r.contextCoverage.overallPercent < 85 && (
          <div id="refine-analysis" style={{
            margin: "8px 0 0",
            padding: "22px 28px",
            background: `linear-gradient(135deg, ${BLUE}06, ${BLUE}12)`,
            borderRadius: 5,
            border: `1.5px solid ${BLUE}25`,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `${BLUE}15`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: NAVY, marginBottom: 3 }}>Strengthen Your Analysis</div>
              <div style={{ fontSize: 13, color: SUB, lineHeight: 1.5 }}>
                Your context coverage is {r.contextCoverage.overallPercent}%. Answer a few follow-up questions to sharpen your scores and get more precise recommendations.
              </div>
            </div>
            <a
              href={`/refine/preview-snapshot-plus`}
              target="_blank" rel="noopener noreferrer"
              style={{
                padding: "10px 22px", borderRadius: 5,
                background: BLUE, color: WHITE,
                fontSize: 13, fontWeight: 700,
                textDecoration: "none", fontFamily: "Lato, sans-serif",
                whiteSpace: "nowrap",
                boxShadow: `0 2px 8px ${BLUE}30`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              Refine Now →
            </a>
          </div>
        )}

        {/* ═══ 2. BRAND ALIGNMENT SCORE ═══ */}
        <Section id="brand-alignment-score">
          <SectionTitle hero description="A composite score measuring how well your brand communicates across five key pillars.">WunderBrand Score™<span style={{ fontSize: 10, verticalAlign: "super", lineHeight: 0, marginLeft: 0 }}>™</span></SectionTitle>

          <MainGauge score={r.executiveSummary.brandAlignmentScore} />

          {/* Focus Area Cards - Interactive Toggle */}
          <div data-focus-cards style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 28 }}>
            {/* Primary Focus Area Card */}
            <button
              aria-pressed={selectedFocus === "primary"}
              onClick={() => setSelectedFocus("primary")}
              style={{
                padding: "18px 20px", borderRadius: 5, textAlign: "left",
                background: selectedFocus === "primary" ? `${BLUE}12` : WHITE,
                border: selectedFocus === "primary" ? `2px solid ${BLUE}` : `1px solid ${BORDER}`,
                cursor: "pointer", transition: "all 0.2s ease",
                position: "relative", overflow: "hidden",
              }}
            >
              {selectedFocus === "primary" && (
                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
                    <circle cx="10" cy="10" r="10" fill={BLUE}/>
                    <path d="M6 10l2.5 2.5L14 7" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: BLUE, color: WHITE,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 900,
                }}>1</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em" }}>Primary Focus Area</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: NAVY }}>{r.executiveSummary.primaryFocusArea}</div>
              <div style={{ fontSize: 13, color: SUB, marginTop: 6 }}>Highest leverage opportunity</div>
              <div style={{ fontSize: 11, color: BLUE, marginTop: 10, fontWeight: 600 }}>
                {selectedFocus === "primary" ? "Viewing diagnosis below ↓" : "Click to view"}
              </div>
            </button>

            {/* Secondary Focus Area Card */}
            <button
              aria-pressed={selectedFocus === "secondary"}
              onClick={() => setSelectedFocus("secondary")}
              style={{
                padding: "18px 20px", borderRadius: 5, textAlign: "left",
                background: selectedFocus === "secondary" ? `${NAVY}10` : WHITE,
                border: selectedFocus === "secondary" ? `2px solid ${NAVY}` : `1px solid ${BORDER}`,
                cursor: "pointer", transition: "all 0.2s ease",
                position: "relative", overflow: "hidden",
              }}
            >
              {selectedFocus === "secondary" && (
                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
                    <circle cx="10" cy="10" r="10" fill={NAVY}/>
                    <path d="M6 10l2.5 2.5L14 7" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: NAVY, color: WHITE,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 900,
                }}>2</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.1em" }}>Secondary Focus Area</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: NAVY }}>{r.executiveSummary.secondaryFocusArea}</div>
              <div style={{ fontSize: 13, color: SUB, marginTop: 6 }}>Supporting priority area</div>
              <div style={{ fontSize: 11, color: NAVY, marginTop: 10, fontWeight: 600 }}>
                {selectedFocus === "secondary" ? "Viewing diagnosis below ↓" : "Click to view"}
              </div>
            </button>
          </div>
        </Section>

        {/* ═══ 3. FOCUS AREA DIAGNOSIS (Both rendered, inactive hidden via CSS for print) ═══ */}
        <div id="focus-area-diagnosis">
          {/* Primary Focus Area Diagnosis */}
          <div data-print-always style={{ display: selectedFocus === "primary" ? "block" : "none" }}>
            <Section style={{ background: `linear-gradient(135deg, ${BLUE}04 0%, ${BLUE}08 100%)`, border: `2px solid ${BLUE}30` }}>
              <SectionTitle hero description={`Deep analysis of why ${r.executiveSummary.primaryFocusArea} is your highest-leverage focus area.`}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: BLUE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>1</div>
                  Primary Diagnosis: {r.executiveSummary.primaryFocusArea}
                </span>
              </SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 4, minHeight: 40, borderRadius: 2, background: BLUE, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Why This Is Your Primary Focus</div>
                    <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.primary.whyFocus}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 4, minHeight: 40, borderRadius: 2, background: ORANGE, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Downstream Issues It Creates</div>
                    <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.primary.downstreamIssues}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 4, minHeight: 40, borderRadius: 2, background: GREEN, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>What Improves When Resolved</div>
                    <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.primary.whatImproves}</div>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Secondary Focus Area Diagnosis */}
          <div data-print-always data-print-label="Secondary Focus Area Diagnosis" style={{ display: selectedFocus === "secondary" ? "block" : "none" }}>
            <Section style={{ background: `linear-gradient(135deg, ${NAVY}04 0%, ${NAVY}08 100%)`, border: `2px solid ${NAVY}30` }}>
              <SectionTitle hero description={`Deep analysis of why ${r.executiveSummary.secondaryFocusArea} is a key supporting focus area.`}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: NAVY, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>2</div>
                  Secondary Diagnosis: {r.executiveSummary.secondaryFocusArea}
                </span>
              </SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 4, minHeight: 40, borderRadius: 2, background: NAVY, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Why This Is A Key Focus</div>
                    <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.secondary.whyFocus}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 4, minHeight: 40, borderRadius: 2, background: ORANGE, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Downstream Issues It Creates</div>
                    <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.secondary.downstreamIssues}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 4, minHeight: 40, borderRadius: 2, background: GREEN, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>What Improves When Resolved</div>
                    <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.secondary.whatImproves}</div>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>

        {/* ═══ 4. PILLAR DEEP DIVES ═══ */}
        <Section id="pillar-deep-dives" pageBreak>
          <SectionTitle description="Strategic analysis of each pillar with concrete examples and success metrics.">Pillar Deep Dives</SectionTitle>

          <div data-pillar-meters style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px",
            padding: "20px 24px", background: LIGHT_BG, borderRadius: 5, marginBottom: 24,
          }}>
            {PILLARS.map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PillarIcon pillar={p} size={20} />
                <div style={{ flex: 1 }}>
                  <PillarMeter score={r.pillarDeepDives[p].score} label={PILLAR_LABELS[p]} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {PILLARS.map((p) => {
              const d = r.pillarDeepDives[p];
              const pct = (d.score / 20) * 100;
              return (
                <div key={p} style={{
                  padding: "28px", borderRadius: 5, border: `1px solid ${BORDER}`,
                  background: WHITE,
                }}>
                  <div data-pillar-header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <PillarIcon pillar={p} size={24} />
                      <span style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>{PILLAR_LABELS[p]}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(pct), textTransform: "uppercase" }}>{scoreLabel(pct)}</span>
                      <div style={{
                        padding: "5px 14px", borderRadius: 5,
                        background: scoreColor(pct), color: WHITE,
                        fontSize: 18, fontWeight: 900,
                      }}>{d.score}/20</div>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: 15, fontWeight: 700, color: SUB, marginBottom: 16, fontStyle: "italic" }}>{d.interpretation}</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {/* What's Happening Now */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}>
                          <circle cx="10" cy="10" r="9" stroke={NAVY} strokeWidth="1.5" opacity="0.4"/>
                          <path d="M10 6v4l2.5 1.5" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                        </svg>
                        <span style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>What&apos;s Happening Now</span>
                      </div>
                      <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{d.whatsHappeningNow}</div>
                    </div>

                    {/* Why It Matters Commercially */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}>
                          <path d="M10 2v16M2 10h16" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                          <circle cx="10" cy="10" r="3" fill={ORANGE} opacity="0.2"/>
                        </svg>
                        <span style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>Why It Matters Commercially</span>
                      </div>
                      <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{d.whyItMattersCommercially}</div>
                    </div>

                    {/* Industry Context, Financial Impact, Risk of Inaction */}
                    {(d as any).industryContext && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {/* Industry Context */}
                        <div style={{ padding: "16px 18px", borderRadius: 5, background: `${BLUE}06`, borderTop: `3px solid ${BLUE}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
                              <rect x="2" y="8" width="4" height="10" rx="1" fill={BLUE} opacity="0.3"/>
                              <rect x="8" y="4" width="4" height="14" rx="1" fill={BLUE} opacity="0.5"/>
                              <rect x="14" y="1" width="4" height="17" rx="1" fill={BLUE} opacity="0.7"/>
                            </svg>
                            <span style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Industry Context</span>
                          </div>
                          <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{(d as any).industryContext}</div>
                        </div>
                        {/* Financial Impact */}
                        <div style={{ padding: "16px 18px", borderRadius: 5, background: `${GREEN}06`, borderTop: `3px solid ${GREEN}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
                              <circle cx="10" cy="10" r="8" stroke={GREEN} strokeWidth="1.5" opacity="0.5"/>
                              <text x="10" y="14" textAnchor="middle" fill={GREEN} fontSize="11" fontWeight="bold">$</text>
                            </svg>
                            <span style={{ fontSize: 12, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.06em" }}>Financial Impact</span>
                          </div>
                          <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{(d as any).financialImpact}</div>
                        </div>
                        {/* Risk of Inaction */}
                        <div style={{ padding: "16px 18px", borderRadius: 5, background: `${ORANGE}08`, borderTop: `3px solid ${ORANGE}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
                              <path d="M10 2L18 17H2L10 2z" stroke={ORANGE} strokeWidth="1.5" fill={ORANGE} opacity="0.15"/>
                              <path d="M10 8v4M10 14v1" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span style={{ fontSize: 12, fontWeight: 900, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Risk of Inaction</span>
                          </div>
                          <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{(d as any).riskOfInaction}</div>
                        </div>
                      </div>
                    )}

                    {/* Concrete Example */}
                    <div style={{ background: LIGHT_BG, borderRadius: 5, padding: "18px 20px" }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Concrete Example</div>
                      <div data-before-after style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div style={{ padding: "14px 16px", borderRadius: 5, background: `${RED_S}08`, border: `1px solid ${RED_S}20` }}>
                          <div style={{ fontSize: 12, fontWeight: 900, color: RED_S, textTransform: "uppercase", marginBottom: 6 }}>Before</div>
                          <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.5, fontStyle: "italic" }}>&quot;{d.concreteExample.before}&quot;</div>
                        </div>
                        <div style={{ padding: "14px 16px", borderRadius: 5, background: `${GREEN}08`, border: `1px solid ${GREEN}20` }}>
                          <div style={{ fontSize: 12, fontWeight: 900, color: GREEN, textTransform: "uppercase", marginBottom: 6 }}>After</div>
                          <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.5, fontStyle: "italic" }}>&quot;{d.concreteExample.after}&quot;</div>
                        </div>
                      </div>
                    </div>

                    {/* Strategic Recommendation */}
                    <div style={{ padding: "14px 18px", borderRadius: 5, background: `${BLUE}06`, borderLeft: `3px solid ${BLUE}` }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Strategic Recommendation</div>
                      <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{d.strategicRecommendation}</div>
                    </div>

                    {/* Success Looks Like */}
                    <div style={{ paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}>
                          <circle cx="10" cy="10" r="9" fill={GREEN} opacity="0.15"/>
                          <path d="M6 10.5l2.5 2.5L14 7.5" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize: 14, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>Success Looks Like</span>
                      </div>
                      <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65, fontWeight: 600 }}>{d.successLooksLike}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ═══ STRATEGIC ALIGNMENT OVERVIEW ═══ */}
        <Section id="strategic-alignment" pageBreak>
          <SectionTitle hero description="How your five brand pillars interact — where they reinforce each other and where misalignment creates friction.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <circle cx="12" cy="12" r="3" fill={BLUE}/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Strategic Alignment Overview
            </span>
          </SectionTitle>

          <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75, marginBottom: 24 }}>
            {r.strategicAlignmentOverview.summary}
          </div>

          {/* Reinforcements */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
                <circle cx="10" cy="10" r="8" fill={GREEN} opacity="0.15"/>
                <path d="M7 10h6M10 7v6" stroke={GREEN} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>Reinforcing Connections</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {r.strategicAlignmentOverview.reinforcements.map((item, i) => (
                <div key={i} style={{ padding: "16px 20px", background: `${GREEN}06`, borderRadius: 5, borderLeft: `3px solid ${GREEN}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: GREEN, marginBottom: 6 }}>{item.pillars}</div>
                  <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{item.insight}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conflicts */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
                <circle cx="10" cy="10" r="8" fill={RED_S} opacity="0.12"/>
                <path d="M10 6v5M10 14h.01" stroke={RED_S} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 900, color: RED_S, textTransform: "uppercase", letterSpacing: "0.08em" }}>Friction Points</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {r.strategicAlignmentOverview.conflicts.map((item, i) => (
                <div key={i} style={{ padding: "16px 20px", background: `${RED_S}04`, borderRadius: 5, borderLeft: `3px solid ${RED_S}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: RED_S, marginBottom: 6 }}>{item.pillars}</div>
                  <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{item.insight}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Recommendation */}
          <div style={{ padding: "18px 22px", borderRadius: 5, background: `${BLUE}08`, borderLeft: `3px solid ${BLUE}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                <path d="M10 2l2.47 5.01L18 7.74l-4 3.9.94 5.5L10 14.27l-4.94 2.87.94-5.5-4-3.9 5.53-.73z" fill={BLUE}/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em" }}>Recommended Sequence</span>
            </div>
            <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{r.strategicAlignmentOverview.systemRecommendation}</div>
          </div>
        </Section>

        {/* ═══ VISIBILITY & DISCOVERY ═══ */}
        <Section id="visibility-discovery">
          <SectionTitle hero description="How prospects discover your brand today, where discovery gaps exist, and how to position for AI-powered search.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <circle cx="11" cy="11" r="7" stroke={BLUE} strokeWidth="1.5"/>
                <path d="M16 16l5 5" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/>
                <circle cx="11" cy="11" r="3" fill={BLUE} opacity="0.2"/>
              </svg>
              Visibility &amp; Discovery
            </span>
          </SectionTitle>

          {/* Visibility Mode Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "20px 24px", background: `${BLUE}06`, borderRadius: 5, border: `1px solid ${BLUE}20` }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: `${BLUE}15`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" stroke={BLUE} strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3.5" fill={BLUE}/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Visibility Mode</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>{r.visibilityDiscovery.visibilityMode}</div>
              <div style={{ fontSize: 14, color: SUB, lineHeight: 1.55, marginTop: 4 }}>{r.visibilityDiscovery.visibilityModeExplanation}</div>
            </div>
          </div>

          {/* Discovery Diagnosis */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" stroke={BLUE} strokeWidth="1.5"/>
                <path d="M10 6v4l3 2" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>Discovery Diagnosis</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ padding: "16px 20px", background: `${GREEN}06`, borderRadius: 5, border: `1px solid ${GREEN}25` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Where They Should Find You</div>
                {r.visibilityDiscovery.discoveryDiagnosis.whereTheyShouldFind.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                    <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}>
                      <circle cx="8" cy="8" r="7" fill={GREEN} opacity="0.2"/>
                      <path d="M5 8l2 2 4-4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 20px", background: `${RED_S}04`, borderRadius: 5, border: `1px solid ${RED_S}15` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: RED_S, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Where They Actually Find You</div>
                {r.visibilityDiscovery.discoveryDiagnosis.whereTheyActuallyFind.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                    <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}>
                      <circle cx="8" cy="8" r="7" fill={RED_S} opacity="0.15"/>
                      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={RED_S} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 12, padding: "14px 18px", background: `${NAVY}06`, borderRadius: 5, borderLeft: `3px solid ${NAVY}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>The Gap</div>
              <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{r.visibilityDiscovery.discoveryDiagnosis.gap}</div>
            </div>
          </div>

          {/* AEO Readiness */}
          <div style={{ marginBottom: 24, padding: "20px 24px", background: WHITE, borderRadius: 5, border: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
                  <rect x="2" y="3" width="16" height="14" rx="2" stroke={BLUE} strokeWidth="1.5"/>
                  <path d="M6 8h8M6 11h5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>AEO Readiness Review</span>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 10,
                background: r.visibilityDiscovery.aeoReadiness.score === "High" ? `${GREEN}15` : r.visibilityDiscovery.aeoReadiness.score.includes("Moderate") ? `${YELLOW}15` : `${RED_S}10`,
                color: r.visibilityDiscovery.aeoReadiness.score === "High" ? GREEN : r.visibilityDiscovery.aeoReadiness.score.includes("Moderate") ? "#92700C" : RED_S,
              }}>{r.visibilityDiscovery.aeoReadiness.score}</span>
            </div>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 16 }}>{r.visibilityDiscovery.aeoReadiness.explanation}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {r.visibilityDiscovery.aeoReadiness.recommendations.map((rec, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", background: `${BLUE}12`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                    fontSize: 11, fontWeight: 700, color: BLUE,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility Priorities */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                <path d="M3 10l5 5L17 5" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>Visibility Priorities</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {r.visibilityDiscovery.visibilityPriorities.map((vp, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 18px", background: i === 0 ? `${BLUE}06` : WHITE, borderRadius: 5, border: `1px solid ${i === 0 ? BLUE + "25" : BORDER}` }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: i === 0 ? BLUE : `${NAVY}10`,
                    color: i === 0 ? WHITE : NAVY,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    fontSize: 13, fontWeight: 900,
                  }}>{vp.priority}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, lineHeight: 1.4, marginBottom: 4 }}>{vp.action}</div>
                    <div style={{ fontSize: 13, color: SUB, lineHeight: 1.5 }}>{vp.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ 5. BRAND ARCHETYPE SYSTEM ═══ */}
        <Section id="brand-archetypes" pageBreak style={{ background: `linear-gradient(135deg, ${NAVY}05 0%, ${BLUE}08 100%)` }}>
          <SectionTitle hero description="Your brand archetype system defines the personality pattern that shapes your messaging and positioning.">Brand Archetype System</SectionTitle>

          {/* Archetype Cards - Interactive Toggle */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, textAlign: "center" }}>
              Click to explore each archetype
            </div>
            <div data-archetype-cards style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {/* Primary Archetype */}
              <button
                aria-pressed={selectedArchetype === "primary"}
                onClick={() => setSelectedArchetype("primary")}
                style={{
                  padding: "24px", borderRadius: 5, background: WHITE,
                  border: selectedArchetype === "primary" ? `2px solid ${BLUE}` : `1px solid ${BORDER}`,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  cursor: "pointer", transition: "all 0.2s ease",
                  transform: selectedArchetype === "primary" ? "scale(1.02)" : "scale(1)",
                  boxShadow: selectedArchetype === "primary" ? `0 4px 12px ${BLUE}20` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: selectedArchetype === "primary" ? BLUE : LIGHT_BG,
                    color: selectedArchetype === "primary" ? WHITE : SUB,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 900,
                  }}>1</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: selectedArchetype === "primary" ? BLUE : SUB, textTransform: "uppercase", letterSpacing: "0.1em" }}>Primary</div>
                  {selectedArchetype === "primary" && (
                    <svg viewBox="0 0 20 20" fill="none" style={{ width: 14, height: 14 }}>
                      <circle cx="10" cy="10" r="9" fill={BLUE} opacity="0.2"/>
                      <path d="M6 10.5l2.5 2.5L14 7.5" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div style={{
                  width: 90, height: 90, borderRadius: 5,
                  background: selectedArchetype === "primary" ? `${BLUE}12` : LIGHT_BG,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
                  transition: "background 0.2s ease",
                }}>
                  <ArchetypeIcon name={r.brandArchetypeSystem.primary.name} size={65} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{r.brandArchetypeSystem.primary.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: SUB, fontStyle: "italic", marginTop: 4, textAlign: "center" }}>
                  &quot;{ARCHETYPE_META[r.brandArchetypeSystem.primary.name]?.tagline}&quot;
                </div>
              </button>

              {/* Secondary Archetype */}
              <button
                aria-pressed={selectedArchetype === "secondary"}
                onClick={() => setSelectedArchetype("secondary")}
                style={{
                  padding: "24px", borderRadius: 5, background: WHITE,
                  border: selectedArchetype === "secondary" ? `2px solid ${BLUE}` : `1px solid ${BORDER}`,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  cursor: "pointer", transition: "all 0.2s ease",
                  transform: selectedArchetype === "secondary" ? "scale(1.02)" : "scale(1)",
                  boxShadow: selectedArchetype === "secondary" ? `0 4px 12px ${BLUE}20` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: selectedArchetype === "secondary" ? BLUE : LIGHT_BG,
                    color: selectedArchetype === "secondary" ? WHITE : SUB,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 900,
                  }}>2</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: selectedArchetype === "secondary" ? BLUE : SUB, textTransform: "uppercase", letterSpacing: "0.1em" }}>Secondary</div>
                  {selectedArchetype === "secondary" && (
                    <svg viewBox="0 0 20 20" fill="none" style={{ width: 14, height: 14 }}>
                      <circle cx="10" cy="10" r="9" fill={BLUE} opacity="0.2"/>
                      <path d="M6 10.5l2.5 2.5L14 7.5" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div style={{
                  width: 90, height: 90, borderRadius: 5,
                  background: selectedArchetype === "secondary" ? `${BLUE}12` : LIGHT_BG,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
                  transition: "background 0.2s ease",
                }}>
                  <ArchetypeIcon name={r.brandArchetypeSystem.secondary.name} size={65} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{r.brandArchetypeSystem.secondary.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: SUB, fontStyle: "italic", marginTop: 4, textAlign: "center" }}>
                  &quot;{ARCHETYPE_META[r.brandArchetypeSystem.secondary.name]?.tagline}&quot;
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Archetype Content — both rendered, inactive hidden for print */}
          {(["primary", "secondary"] as const).map((key) => {
            const arch = r.brandArchetypeSystem[key];
            const isActive = selectedArchetype === key;
            return (
              <div key={key} data-print-always={true} data-print-label={key === "secondary" ? `Secondary Archetype: ${arch.name}` : undefined} style={{ display: isActive ? "block" : "none", marginBottom: 20 }}>
                <div style={{
                  padding: "24px", borderRadius: 5, background: WHITE,
                  border: `1px solid ${BORDER}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <ArchetypeIcon name={arch.name} size={40} />
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{arch.name}</div>
                      <div style={{ fontSize: 13, color: SUB }}>{ARCHETYPE_META[arch.name]?.description}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 4, minHeight: 36, borderRadius: 2, background: GREEN, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>When Aligned</div>
                        <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{arch.whenAligned}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 4, minHeight: 36, borderRadius: 2, background: ORANGE, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Risk If Misused</div>
                        <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{arch.riskIfMisused}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 4, minHeight: 36, borderRadius: 2, background: BLUE, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Language & Tone</div>
                        <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{arch.languageTone}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 4, minHeight: 36, borderRadius: 2, background: NAVY, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Behavior Guide</div>
                        <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{arch.behaviorGuide}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* How They Work Together - Always Visible */}
          <div style={{
            padding: "18px 22px", borderRadius: 5,
            background: `${BLUE}08`, borderLeft: `3px solid ${BLUE}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>How Your Archetypes Work Together</div>
            <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{r.brandArchetypeSystem.howTheyWorkTogether}</div>
          </div>
        </Section>

        {/* ═══ 6. YOUR BRAND PERSONA ═══ */}
        <Section pageBreak>
          <SectionTitle hero description="How your brand should present itself — your personality, voice, and communication style.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <circle cx="12" cy="8" r="5" stroke={BLUE} strokeWidth="1.8"/>
                <path d="M3 21v-2c0-2.8 2.2-5 5-5h8c2.8 0 5 2.2 5 5v2" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Your Brand Persona
            </span>
          </SectionTitle>

          {/* Persona Summary */}
          <div style={{
            padding: "18px 22px", borderRadius: 5, marginBottom: 24,
            background: `${BLUE}08`, borderLeft: `4px solid ${BLUE}`,
          }}>
            <div style={{ fontSize: 17, color: "#1a1a2e", lineHeight: 1.7, fontStyle: "italic" }}>
              {r.brandPersona.personaSummary}
            </div>
          </div>

          {/* Core Identity */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Core Identity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 4, minHeight: 36, borderRadius: 2, background: BLUE, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Who You Are</div>
                  <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{r.brandPersona.coreIdentity.whoYouAre}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 4, minHeight: 36, borderRadius: 2, background: NAVY, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>What You Stand For</div>
                  <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{r.brandPersona.coreIdentity.whatYouStandFor}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 4, minHeight: 36, borderRadius: 2, background: GREEN, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginBottom: 4 }}>How You Show Up</div>
                  <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{r.brandPersona.coreIdentity.howYouShowUp}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Style */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Communication Style</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                { 
                  label: "Tone", 
                  value: r.brandPersona.communicationStyle.tone, 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
                      <circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="1.8"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="9" cy="10" r="1.2" fill={BLUE}/>
                      <circle cx="15" cy="10" r="1.2" fill={BLUE}/>
                    </svg>
                  )
                },
                { 
                  label: "Pace", 
                  value: r.brandPersona.communicationStyle.pace, 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
                      <circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="1.8"/>
                      <path d="M12 6v6l4 2" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                },
                { 
                  label: "Energy", 
                  value: r.brandPersona.communicationStyle.energy, 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
                      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "16px", borderRadius: 5,
                  background: LIGHT_BG, border: `1px solid ${BORDER}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    {item.icon}
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{item.label}</div>
                  </div>
                  <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.5 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Messaging Examples */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Messaging Examples</div>
            
            {/* Headlines */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                  <rect x="2" y="4" width="16" height="12" rx="1" stroke={NAVY} strokeWidth="1.5"/>
                  <path d="M5 8h10M5 11h6" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Headlines
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: "14px 16px", borderRadius: 5, background: `${RED_S}06`, border: `1px solid ${RED_S}15` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: RED_S, textTransform: "uppercase", marginBottom: 8 }}>Avoid</div>
                  {r.brandPersona.messagingExamples.headlines.avoid.map((ex, i) => (
                    <div key={i} style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5, marginBottom: 6, display: "flex", gap: 8 }}>
                      <span style={{ color: RED_S }}>✗</span>
                      <span style={{ fontStyle: "italic", opacity: 0.8 }}>&quot;{ex}&quot;</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 5, background: `${GREEN}06`, border: `1px solid ${GREEN}15` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", marginBottom: 8 }}>Use Instead</div>
                  {r.brandPersona.messagingExamples.headlines.use.map((ex, i) => (
                    <div key={i} style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5, marginBottom: 6, display: "flex", gap: 8 }}>
                      <span style={{ color: GREEN }}>✓</span>
                      <span style={{ fontWeight: 600 }}>&quot;{ex}&quot;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                  <rect x="2" y="6" width="16" height="8" rx="2" stroke={NAVY} strokeWidth="1.5"/>
                  <path d="M6 10h8" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                CTA Buttons
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: "14px 16px", borderRadius: 5, background: `${RED_S}06`, border: `1px solid ${RED_S}15` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: RED_S, textTransform: "uppercase", marginBottom: 8 }}>Avoid</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {r.brandPersona.messagingExamples.ctaButtons.avoid.map((ex, i) => (
                      <span key={i} style={{
                        padding: "6px 12px", borderRadius: 5,
                        background: "#e5e5e5", color: "#888",
                        fontSize: 13, fontWeight: 600, textDecoration: "line-through",
                      }}>{ex}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 5, background: `${GREEN}06`, border: `1px solid ${GREEN}15` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", marginBottom: 8 }}>Use Instead</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {r.brandPersona.messagingExamples.ctaButtons.use.map((ex, i) => (
                      <span key={i} style={{
                        padding: "6px 12px", borderRadius: 5,
                        background: BLUE, color: WHITE,
                        fontSize: 13, fontWeight: 700,
                      }}>{ex}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Posts */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                  <path d="M18 5a3 3 0 01-3 3c-.6 0-1.2-.2-1.6-.5L8.5 10l4.9 2.5c.4-.3 1-.5 1.6-.5a3 3 0 110 6 3 3 0 01-3-3c0-.4.1-.7.2-1l-5-2.6c-.5.4-1.1.6-1.7.6a3 3 0 110-6c.6 0 1.2.2 1.7.6l5-2.6c-.1-.3-.2-.6-.2-1a3 3 0 016 0z" stroke={NAVY} strokeWidth="1.3"/>
                </svg>
                Social Posts
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: "14px 16px", borderRadius: 5, background: `${RED_S}06`, border: `1px solid ${RED_S}15` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: RED_S, textTransform: "uppercase", marginBottom: 8 }}>Avoid</div>
                  {r.brandPersona.messagingExamples.socialPosts.avoid.map((ex, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.4, marginBottom: 8, fontStyle: "italic", opacity: 0.7 }}>
                      &quot;{ex}&quot;
                    </div>
                  ))}
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 5, background: `${GREEN}06`, border: `1px solid ${GREEN}15` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", marginBottom: 8 }}>Use Instead</div>
                  {r.brandPersona.messagingExamples.socialPosts.use.map((ex, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.4, marginBottom: 8, fontWeight: 500 }}>
                      &quot;{ex}&quot;
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Communication Guidelines</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ padding: "18px 20px", borderRadius: 5, background: `${GREEN}06`, border: `1px solid ${GREEN}20` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
                    <circle cx="10" cy="10" r="9" fill={GREEN} opacity="0.2"/>
                    <path d="M6 10.5l2.5 2.5L14 7.5" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 900, color: GREEN, textTransform: "uppercase" }}>Do</span>
                </div>
                {r.brandPersona.doAndDont.do.map((item, i) => (
                  <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < r.brandPersona.doAndDont.do.length - 1 ? `1px solid ${GREEN}15` : "none" }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                      <span style={{ color: GREEN, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.4 }}>{item.guideline}</span>
                    </div>
                    <div style={{ marginLeft: 22, padding: "8px 12px", background: `${GREEN}08`, borderRadius: 4, borderLeft: `2px solid ${GREEN}40` }}>
                      <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5, fontStyle: "italic" }}>{item.example}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "18px 20px", borderRadius: 5, background: `${RED_S}06`, border: `1px solid ${RED_S}20` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
                    <circle cx="10" cy="10" r="9" fill={RED_S} opacity="0.2"/>
                    <path d="M7 7l6 6M13 7l-6 6" stroke={RED_S} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 900, color: RED_S, textTransform: "uppercase" }}>Don&apos;t</span>
                </div>
                {r.brandPersona.doAndDont.dont.map((item, i) => (
                  <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < r.brandPersona.doAndDont.dont.length - 1 ? `1px solid ${RED_S}15` : "none" }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                      <span style={{ color: RED_S, fontWeight: 700, flexShrink: 0 }}>✗</span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.4 }}>{item.guideline}</span>
                    </div>
                    <div style={{ marginLeft: 22, padding: "8px 12px", background: `${RED_S}06`, borderRadius: 4, borderLeft: `2px solid ${RED_S}40` }}>
                      <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5, fontStyle: "italic" }}>{item.example}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ═══ AUDIENCE SIGNALS & DECISION DRIVERS ═══ */}
        <Section id="audience-signals">
          <SectionTitle hero description="Who your brand speaks to, what drives their decisions, and what holds them back.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <circle cx="9" cy="7" r="4" stroke={BLUE} strokeWidth="1.5"/>
                <path d="M2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="19" cy="9" r="3" stroke={BLUE} strokeWidth="1.5" opacity="0.5"/>
                <path d="M19 15a4 4 0 014 4v2" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              </svg>
              Audience Signals &amp; Decision Drivers
            </span>
          </SectionTitle>

          {/* Primary Audience */}
          <div style={{ padding: "20px 24px", background: `${BLUE}06`, borderRadius: 5, border: `1px solid ${BLUE}20`, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Primary Audience</div>
            <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65, fontWeight: 600 }}>{r.audienceClarity.audienceSignals.primaryAudience}</div>
          </div>

          {/* Audience Characteristics */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Key Characteristics</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {r.audienceClarity.audienceSignals.audienceCharacteristics.map((char, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 16px", background: WHITE, borderRadius: 5, border: `1px solid ${BORDER}` }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="7" fill={BLUE} opacity="0.15"/>
                    <path d="M5 8l2 2 4-4" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{char}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Language */}
          <div style={{ padding: "16px 20px", background: `${NAVY}05`, borderRadius: 5, borderLeft: `3px solid ${NAVY}`, marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>How They Talk About Their Problem</div>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, fontStyle: "italic" }}>{r.audienceClarity.audienceSignals.audienceLanguage}</div>
          </div>

          {/* Decision Drivers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Motivators */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
                  <circle cx="10" cy="10" r="8" fill={GREEN} opacity="0.15"/>
                  <path d="M10 5v5l3 2" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>What Motivates Them</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {r.audienceClarity.decisionDrivers.motivators.map((m, i) => (
                  <div key={i} style={{ padding: "14px 16px", background: `${GREEN}05`, borderRadius: 5, borderLeft: `3px solid ${GREEN}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: GREEN, marginBottom: 4 }}>{m.driver}</div>
                    <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{m.explanation}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hesitation Factors */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
                  <circle cx="10" cy="10" r="8" fill={RED_S} opacity="0.12"/>
                  <path d="M10 6v5M10 14h.01" stroke={RED_S} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 900, color: RED_S, textTransform: "uppercase", letterSpacing: "0.08em" }}>What Holds Them Back</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {r.audienceClarity.decisionDrivers.hesitationFactors.map((h, i) => (
                  <div key={i} style={{ padding: "14px 16px", background: `${RED_S}04`, borderRadius: 5, borderLeft: `3px solid ${RED_S}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: RED_S, marginBottom: 4 }}>{h.factor}</div>
                    <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{h.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ═══ MESSAGING PILLARS ═══ */}
        <Section id="messaging-pillars">
          <SectionTitle hero description="The 3 strategic themes your brand should consistently communicate across every touchpoint — website, social, email, sales conversations, and more.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Messaging Pillars
            </span>
          </SectionTitle>

          <div style={{ fontSize: 15, color: "#444", lineHeight: 1.7, marginBottom: 24 }}>
            These are the core strategic themes that should run through everything Acme Co communicates. Every piece of content, every sales conversation, every email should reinforce at least one of these pillars.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {r.messagingPillars.map((pillar: any, i: number) => (
              <div key={i} style={{ borderRadius: 8, border: `1px solid ${BORDER}`, overflow: "hidden", background: WHITE }}>
                {/* Pillar header */}
                <div style={{ padding: "16px 20px", background: `${BLUE}08`, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: BLUE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: NAVY }}>{pillar.name}</div>
                  </div>
                </div>
                {/* Pillar body */}
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>What It Communicates</div>
                    <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{pillar.whatItCommunicates}</div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Why It Matters</div>
                    <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{pillar.whyItMatters}</div>
                  </div>
                  <div style={{ padding: "12px 16px", background: `${BLUE}06`, borderRadius: 5, borderLeft: `3px solid ${BLUE}` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Example Message</div>
                    <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6, fontStyle: "italic" }}>{pillar.exampleMessage}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ 7. VISUAL & VERBAL BRAND SIGNALS ═══ */}
        <Section id="visual-verbal-signals">
          <SectionTitle description="Direction for your brand's visual identity and verbal communication.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke={BLUE} strokeWidth="1.8"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill={BLUE}/>
                <path d="M21 15l-5-5L6 21" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Visual & Verbal Brand Signals
            </span>
          </SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Color Palette Direction */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Color Palette Direction</div>
              <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7, marginBottom: 16 }}>{r.visualVerbalSignals.colorPaletteDirection}</div>
              
              {/* Recommended Color Swatches */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Recommended Palette</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {r.visualVerbalSignals.colorSwatches.map((swatch, i) => (
                    <div key={i} style={{
                      borderRadius: 5, overflow: "hidden",
                      border: `1px solid ${BORDER}`, background: WHITE,
                    }}>
                      <div style={{
                        height: 48, background: swatch.hex,
                        borderBottom: swatch.hex === "#FFFFFF" ? `1px solid ${BORDER}` : "none",
                      }} />
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{swatch.name}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: SUB, fontFamily: "monospace", marginTop: 2 }}>{swatch.hex}</div>
                        <div style={{ fontSize: 11, color: SUB, marginTop: 4 }}>{swatch.usage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors to Avoid */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: RED_S, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Colors to Avoid</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {r.visualVerbalSignals.avoidColors.map((color, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 14px", borderRadius: 5,
                      background: `${RED_S}06`, border: `1px solid ${RED_S}20`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 5, background: color.hex,
                        flexShrink: 0,
                      }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{color.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: SUB, fontFamily: "monospace" }}>{color.hex}</span>
                          <span style={{ fontSize: 11, color: RED_S }}>— {color.reason}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice Traits */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Voice Traits</div>
              <div data-voice-traits style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {r.visualVerbalSignals.voiceTraits.map((trait, i) => (
                  <span key={i} style={{
                    padding: "8px 18px", borderRadius: 5,
                    background: `${BLUE}10`, border: `1px solid ${BLUE}25`,
                    fontSize: 15, fontWeight: 700, color: NAVY,
                  }}>{trait}</span>
                ))}
              </div>
            </div>

            {/* Consistency Risk */}
            <div style={{ padding: "16px 20px", borderRadius: 5, background: `${YELLOW}12`, border: `1px solid ${YELLOW}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}>
                  <circle cx="10" cy="10" r="9" stroke={YELLOW} strokeWidth="1.5"/>
                  <path d="M10 6v5M10 14h.01" stroke={YELLOW} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 900, color: "#92700C", textTransform: "uppercase", letterSpacing: "0.08em" }}>Consistency Risk</span>
              </div>
              <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{r.visualVerbalSignals.consistencyRisks}</div>
            </div>
          </div>
        </Section>

        {/* ═══ 8. STRATEGIC ACTION PLAN ═══ */}
        <Section id="strategic-action-plan">
          <SectionTitle description="Five prioritized actions ordered by impact, with expected outcomes.">Strategic Action Plan</SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {r.strategicActionPlan.map((item, idx) => (
              <div key={idx} data-action-item style={{
                borderRadius: 5, border: `1px solid ${BORDER}`,
                background: WHITE, overflow: "hidden",
              }}>
                {/* Action Header */}
                <div style={{
                  display: "flex", gap: 16, alignItems: "flex-start",
                  padding: "20px 24px",
                  background: idx === 0 ? `${BLUE}08` : LIGHT_BG,
                  borderBottom: `1px solid ${BORDER}`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", 
                    background: idx === 0 ? BLUE : NAVY,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: WHITE, fontWeight: 900, fontSize: 18, flexShrink: 0,
                  }}>{item.priority}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, color: NAVY, lineHeight: 1.5, fontWeight: 700 }}>{item.action}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "4px 12px", borderRadius: 5,
                        background: ACCENT_BG, fontSize: 13, fontWeight: 700, color: BLUE,
                      }}>
                        <PillarIcon pillar={item.pillar.toLowerCase()} size={14} />
                        {item.pillar}
                      </div>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "4px 10px", borderRadius: 5,
                        background: item.effort === "Low" ? `${GREEN}12` : item.effort === "Medium" ? `${ORANGE}12` : `${RED_S}12`,
                        fontSize: 12, fontWeight: 600, 
                        color: item.effort === "Low" ? GREEN : item.effort === "Medium" ? ORANGE : RED_S,
                      }}>
                        <svg viewBox="0 0 16 16" fill="none" style={{ width: 12, height: 12 }}>
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 5v3l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        {item.effort} Effort
                      </div>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "4px 10px", borderRadius: 5,
                        background: item.impact === "High" ? `${GREEN}12` : item.impact === "Medium" ? `${BLUE}12` : `${SUB}15`,
                        fontSize: 12, fontWeight: 600,
                        color: item.impact === "High" ? GREEN : item.impact === "Medium" ? BLUE : SUB,
                      }}>
                        <svg viewBox="0 0 16 16" fill="none" style={{ width: 12, height: 12 }}>
                          <path d="M8 2v12M2 8l6-6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {item.impact} Impact
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Details */}
                <div style={{ padding: "20px 24px" }}>
                  {/* Why This Matters */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
                        <circle cx="10" cy="10" r="8" stroke={BLUE} strokeWidth="1.5"/>
                        <path d="M10 6v4M10 13h.01" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.05em" }}>Why This Matters</span>
                    </div>
                    <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginLeft: 26 }}>{item.why}</div>
                  </div>

                  {/* How To Implement */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
                        <path d="M3 10h14M10 3v14" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.05em" }}>How To Implement</span>
                    </div>
                    <div style={{ marginLeft: 26 }}>
                      {item.howTo.map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: "50%",
                            background: `${GREEN}15`, color: GREEN,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, flexShrink: 0,
                          }}>{i + 1}</div>
                          <span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Example */}
                  <div style={{
                    padding: "14px 18px", borderRadius: 5,
                    background: `${NAVY}04`, borderLeft: `3px solid ${NAVY}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                        <path d="M4 5h12M4 10h12M4 15h8" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.05em" }}>Example</span>
                    </div>
                    <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6, fontStyle: "italic" }}>{item.example}</div>
                  </div>

                  {/* Outcome */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: "10px 14px", background: `${GREEN}08`, borderRadius: 5 }}>
                    <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
                      <circle cx="10" cy="10" r="8" fill={GREEN} opacity="0.2"/>
                      <path d="M6 10l2.5 2.5L14 7" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 600, color: GREEN }}>Expected Outcome:</span>
                    <span style={{ fontSize: 14, color: "#1a1a2e" }}>{item.outcome}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ FOUNDATIONAL AI PROMPT PACK ═══ */}
        <Section id="prompt-pack" pageBreak>
          <SectionTitle hero description={r.foundationalPromptPack.description}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <rect x="3" y="3" width="18" height="18" rx="3" stroke={BLUE} strokeWidth="1.5"/>
                <path d="M8 10l3 3-3 3" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 16h3" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {r.foundationalPromptPack.packName}
            </span>
          </SectionTitle>

          {/* Pack overview badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "14px 20px", background: `${BLUE}06`, borderRadius: 5, border: `1px solid ${BLUE}18` }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", background: `${BLUE}15`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: BLUE }}>{r.foundationalPromptPack.promptCount}</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>
                {r.foundationalPromptPack.promptCount} AI Prompts — Calibrated to {r.businessName}
              </div>
              <div style={{ fontSize: 13, color: SUB, lineHeight: 1.4 }}>
                Pre-filled with your diagnostic data. Copy directly into ChatGPT, Claude, or any AI tool.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {r.foundationalPromptPack.prompts.map((p, idx) => (
              <div key={idx} style={{
                borderRadius: 5, overflow: "hidden",
                border: `1px solid ${BORDER}`, background: WHITE,
              }}>
                {/* Prompt header */}
                <div style={{
                  padding: "14px 20px",
                  background: idx === 0 ? `${BLUE}08` : LIGHT_BG,
                  borderBottom: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `${BLUE}15`, color: BLUE,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 900, flexShrink: 0,
                  }}>{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{p.category}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{p.title}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
                      <rect x="1" y="1" width="10" height="10" rx="1.5" stroke={SUB} strokeWidth="1.2"/>
                      <rect x="5" y="5" width="10" height="10" rx="1.5" stroke={SUB} strokeWidth="1.2" fill={LIGHT_BG}/>
                    </svg>
                    <span style={{ fontSize: 11, color: SUB, fontWeight: 600 }}>Copy</span>
                  </div>
                </div>

                {/* Prompt body */}
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: 12, color: SUB, marginBottom: 10, fontStyle: "italic" }}>
                    {p.instruction}
                  </div>
                  <div style={{
                    padding: "14px 16px",
                    background: `${NAVY}04`,
                    borderRadius: 4,
                    border: `1px dashed ${NAVY}20`,
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: 12.5,
                    color: "#1a1a2e",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    maxHeight: 280,
                    overflowY: "auto",
                  }}>
                    {p.prompt}
                  </div>
                </div>

                {/* Why It Matters */}
                <div style={{
                  padding: "12px 20px",
                  background: `${BLUE}05`,
                  borderTop: `1px solid ${BORDER}`,
                  display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="7" fill={BLUE} opacity="0.15"/>
                    <path d="M8 5v4M8 11h.01" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Why It Matters: </span>
                    <span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55 }}>{p.whyItMatters}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: "18px 22px", background: `${BLUE}06`, borderRadius: 5, borderLeft: `3px solid ${BLUE}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                <path d="M10 2l2.47 5.01L18 7.74l-4 3.9.94 5.5L10 14.27l-4.94 2.87.94-5.5-4-3.9 5.53-.73z" fill={BLUE}/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em" }}>Want More Prompts?</span>
            </div>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65 }}>
              WunderBrand Blueprint™ includes an <strong>Execution Prompt Pack</strong> with 8 additional prompts for campaign messaging, email sequences, social media systems, website copy auditing, and more — all calibrated to your brand voice. WunderBrand Blueprint+™ unlocks a full <strong>Advanced Prompt Library</strong> of 12 strategic prompts including persona messaging maps, full-funnel architecture, and competitive war room analysis.
            </div>
          </div>
        </Section>

        {/* Tagline & Slogan Recommendations */}
        <div id="tagline-recommendations" style={{ marginBottom: 48 }}>
          <div style={{ borderBottom: '2px solid #07B0F2', paddingBottom: 10, marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 400, color: NAVY, margin: 0, letterSpacing: '-0.3px' }}>Tagline & Slogan Recommendations</h2>
            <p style={{ fontSize: 14, color: SUB, margin: '6px 0 0', lineHeight: 1.5 }}>Three tagline options calibrated to your brand positioning, archetype, and messaging pillars.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {r.taglineRecommendations.map((t: any, i: number) => (
              <div key={i} style={{ background: i === 0 ? '#F0F7FF' : WHITE, border: `1px solid ${i === 0 ? BLUE : BORDER}`, borderRadius: 10, padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${BLUE}15`, color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: 0, fontStyle: 'italic' }}>"{t.tagline}"</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Why It Works</div>
                    <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: 0 }}>{t.rationale}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Best Used On</div>
                    <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: 0 }}>{t.bestUsedOn}</p>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'inline-block', padding: '4px 12px', background: `${BLUE}10`, borderRadius: 20, fontSize: 12, color: BLUE, fontWeight: 600 }}>Tone: {t.tone}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 9. CTA — WHAT'S NEXT ═══ */}
        <Section id="whats-next">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              What&apos;s Next
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.3 }}>
              Turn Diagnosis Into Implementation
            </h2>
            <p style={{ fontSize: 16, color: SUB, lineHeight: 1.65, maxWidth: 560, margin: "0 auto" }}>
              {r.whatsNextUnlocks}
            </p>
            <p style={{ fontSize: 13, color: BLUE, fontWeight: 600, margin: "12px auto 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Built on 25+ years of brand strategy and growth marketing expertise — from Fortune 500 companies to startups
            </p>
          </div>

          {/* Personalized "What You're Missing" — based on weakest pillar */}
          {(() => {
            const pillarEntries = PILLARS.map(p => ({ key: p, label: PILLAR_LABELS[p], score: r.pillarDeepDives[p].score }));
            const sorted = [...pillarEntries].sort((a, b) => a.score - b.score);
            const weakest = sorted[0];
            const BLUEPRINT_UNLOCK_MAP: Record<string, string> = {
              positioning: "WunderBrand Blueprint™ builds your complete brand foundation — brand purpose, promise, and a positioning statement you can use across every channel. Plus a competitive positioning map so you know exactly where you stand.",
              messaging: "WunderBrand Blueprint™ delivers your full messaging system — core message, proof points, value propositions, and what NOT to say. Including 16 AI prompts to generate on-brand copy instantly.",
              visibility: "WunderBrand Blueprint™ includes SEO keyword strategy, AEO optimization, social media platform strategy, and an email marketing framework — everything you need to get discovered consistently.",
              credibility: "WunderBrand Blueprint™ provides a brand story and origin narrative, customer journey map, and trust-building strategy that positions your proof points at every decision point in the buyer journey.",
              conversion: "WunderBrand Blueprint™ maps your full customer journey with conversion triggers, email nurture frameworks, CTA hierarchy, and lead magnet strategy — turning your website into a conversion engine.",
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
                    {BLUEPRINT_UNLOCK_MAP[weakest.key] || "WunderBrand Blueprint™ turns this diagnosis into a complete brand operating system with step-by-step implementation."}
                  </p>
                </div>
              </div>
            );
          })()}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* WunderBrand Blueprint™ */}
            <div style={{
              padding: "24px", borderRadius: 5,
              border: `2px solid ${BLUE}`, background: `${BLUE}04`,
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Recommended</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 6 }}>WunderBrand Blueprint™</div>
              <div style={{ fontSize: 14, color: SUB, lineHeight: 1.55, marginBottom: 16 }}>
                Your diagnostic turned into an operational system — messaging frameworks, voice guidelines, and AI prompts you can use immediately.
              </div>
              <div style={{ flex: 1, marginBottom: 18 }}>
                {["Messaging framework & brand voice", "Strategic alignment system", "Execution-ready AI prompt pack", "Downloadable PDF report"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
                      <circle cx="10" cy="10" r="9" fill={BLUE} opacity="0.15"/>
                      <path d="M6 10.5l2.5 2.5L14 7.5" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: 13, color: "#1a1a2e" }}>{f}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://wunderbardigital.com/wunderbrand-blueprint?utm_source=brand_snapshot_plus_report&utm_medium=report_cta&utm_campaign=explore_upgrade&utm_content=snap_plus_explore_blueprint"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "block", width: "100%", padding: "12px 24px", borderRadius: 5, border: "none",
                  background: BLUE, color: WHITE, fontSize: 15, fontWeight: 900,
                  textAlign: "center", textDecoration: "none", fontFamily: "Lato, sans-serif",
                  boxSizing: "border-box",
                  boxShadow: `0 4px 14px ${BLUE}40`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                Explore WunderBrand Blueprint™ →
              </a>
            </div>

            {/* WunderBrand Blueprint+™ */}
            <div style={{
              padding: "24px", borderRadius: 5,
              border: `1px solid ${BORDER}`, background: WHITE,
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ height: 18 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 6 }}>WunderBrand Blueprint+™</div>
              <div style={{ fontSize: 14, color: SUB, lineHeight: 1.55, marginBottom: 16 }}>
                Everything in WunderBrand Blueprint™ plus visual direction, advanced AI tools, campaign strategy, and full archetype mapping.
              </div>
              <div style={{ flex: 1, marginBottom: 18 }}>
                {["Everything in WunderBrand Blueprint™", "Visual direction & design rationale", "Campaign & content strategy", "Advanced AI prompt library"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
                      <circle cx="10" cy="10" r="9" fill={NAVY} opacity="0.1"/>
                      <path d="M6 10.5l2.5 2.5L14 7.5" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: 13, color: "#1a1a2e" }}>{f}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://wunderbardigital.com/wunderbrand-blueprint-plus?utm_source=brand_snapshot_plus_report&utm_medium=report_cta&utm_campaign=explore_upgrade&utm_content=snap_plus_explore_blueprint_plus"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "block", width: "100%", padding: "12px 24px", borderRadius: 5,
                  border: `2px solid ${NAVY}`, background: "transparent",
                  color: NAVY, fontSize: 15, fontWeight: 900,
                  textAlign: "center", textDecoration: "none", fontFamily: "Lato, sans-serif",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                }}
              >
                Explore WunderBrand Blueprint+™ →
              </a>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 16, marginBottom: 28 }}>
            <p style={{ fontSize: 14, color: SUB, margin: 0 }}>
              Not sure which is right? <a href="https://wunderbardigital.com/talk-to-an-expert?utm_source=brand_snapshot_plus_report&utm_medium=report_nav&utm_campaign=nav_header_cta_secondary&utm_content=snap_plus_cta_talk_expert" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: "none", fontWeight: 700 }}>Talk to an expert</a> to find the right fit.
            </p>
          </div>

          {/* Service Path CTAs */}
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 28 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                Prefer Hands-On Help?
              </div>
              <p style={{ fontSize: 15, color: SUB, lineHeight: 1.55, maxWidth: 500, margin: "0 auto" }}>
                Let our team implement your brand strategy for you — from AI-powered marketing systems to full campaign execution.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Managed Marketing */}
              <div style={{
                padding: "20px", borderRadius: 5,
                border: `1px solid ${BORDER}`, background: WHITE,
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", background: `${BLUE}10`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Managed Marketing</div>
                </div>
                <div style={{ fontSize: 14, color: SUB, lineHeight: 1.55, marginBottom: 14, flex: 1 }}>
                  We take your brand strategy and execute it — content creation, campaign management, performance optimization, and ongoing strategic guidance.
                </div>
                <a
                  href="https://wunderbardigital.com/managed-marketing?utm_source=brand_snapshot_plus_report&utm_medium=report_nav&utm_campaign=nav_nav_dropdown_item&utm_content=snap_plus_managed_marketing"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "block", textAlign: "center", padding: "10px 20px", borderRadius: 5,
                    border: `1.5px solid ${BLUE}`, background: "transparent",
                    color: BLUE, fontSize: 14, fontWeight: 700,
                    textDecoration: "none", fontFamily: "Lato, sans-serif",
                    transition: "all 0.2s ease",
                  }}
                >
                  Explore Managed Marketing →
                </a>
              </div>

              {/* AI Consulting */}
              <div style={{
                padding: "20px", borderRadius: 5,
                border: `1px solid ${BORDER}`, background: WHITE,
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", background: `${NAVY}08`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke={NAVY} strokeWidth="1.5"/>
                      <path d="M8 10l3 3-3 3" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 16h3" stroke={NAVY} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>AI Consulting</div>
                </div>
                <div style={{ fontSize: 14, color: SUB, lineHeight: 1.55, marginBottom: 14, flex: 1 }}>
                  Get expert guidance on integrating AI into your marketing workflow — from prompt engineering to automation strategy to AI-powered brand systems.
                </div>
                <a
                  href="https://wunderbardigital.com/ai-consulting?utm_source=brand_snapshot_plus_report&utm_medium=report_nav&utm_campaign=nav_nav_dropdown_item&utm_content=snap_plus_ai_consulting"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "block", textAlign: "center", padding: "10px 20px", borderRadius: 5,
                    border: `1.5px solid ${NAVY}`, background: "transparent",
                    color: NAVY, fontSize: 14, fontWeight: 700,
                    textDecoration: "none", fontFamily: "Lato, sans-serif",
                    transition: "all 0.2s ease",
                  }}
                >
                  Explore AI Consulting →
                </a>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══ FOOTER ═══ */}
        <footer style={{ textAlign: "center", padding: "20px 0 0", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <a href="https://wunderbardigital.com/?utm_source=brand_snapshot_plus_report&utm_medium=report_nav&utm_campaign=nav_header_logo&utm_content=snap_plus_logo" target="_blank" rel="noopener noreferrer">
              <img src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp" alt="Wunderbar Digital" style={{ height: 20, objectFit: "contain" }} />
            </a>
          </div>
          <p style={{ fontSize: 14, color: SUB, marginBottom: 4 }}>
            WunderBrand Snapshot+™ is a product of Wunderbar Digital ·{" "}
            <a href="https://wunderbardigital.com/?utm_source=brand_snapshot_plus_report&utm_medium=report_nav&utm_campaign=nav_header_logo&utm_content=snap_plus_logo" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: "none", fontWeight: 700 }}>wunderbardigital.com</a>
          </p>
          <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
            © 2026 Wunderbar Digital. All rights reserved. WunderBrand Snapshot+™ and the WunderBrand Score™ are trademarks of Wunderbar Digital.
            This report is confidential and intended solely for the use of the individual or entity to whom it is addressed.
          </p>
          <p style={{ fontSize: 9, fontWeight: 400, color: "#8A97A8", textAlign: "center", marginTop: 16 }}>
            Confidential — {r.businessName} | Generated {r.date} | wunderbardigital.com
          </p>
        </footer>

      </div>
    </div>
    <ReportNav reportTitle="WunderBrand Snapshot+™" sections={[
      { id: "executive-summary", label: "Executive Summary" },
      { id: "context-coverage", label: "Context Coverage" },
      { id: "brand-alignment-score", label: "WunderBrand Score™" },
      { id: "focus-area-diagnosis", label: "Focus Area Diagnosis" },
      { id: "pillar-deep-dives", label: "Pillar Deep Dives" },
      { id: "strategic-alignment", label: "Strategic Alignment" },
      { id: "visibility-discovery", label: "Visibility & Discovery" },
      { id: "brand-archetypes", label: "Brand Archetypes" },
      { id: "brand-persona", label: "Your Brand Persona" },
      { id: "messaging-pillars", label: "Messaging Pillars" },
      { id: "audience-signals", label: "Audience Signals" },
      { id: "visual-verbal-signals", label: "Visual & Verbal Signals" },
      { id: "strategic-action-plan", label: "Strategic Action Plan" },
      { id: "prompt-pack", label: "AI Prompt Pack" },
      { id: "tagline-recommendations", label: "Tagline Recommendations" },
      { id: "whats-next", label: "What's Next" },
    ]} />

    {/* Wundy™ Report Companion — Snapshot+ tier */}
    <WundyChat
      mode="report"
      tier="snapshot-plus"
      reportId="preview"
      greeting={`Hi, I\u2019m Wundy™ \u2014 I have your WunderBrand Snapshot+™\u2122 report right here. I can help you understand your scores, explain any section, or help you figure out where to start. What would you like to know?`}
    />
    </>
  );
}
