// app/preview/blueprint-plus/page.tsx
// WunderBrand Blueprint+™ — Complete report (Snapshot+ + Blueprint + Blueprint+ exclusive)
"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import nextDynamic from "next/dynamic";

// Lazy-load heavy interactive components to reduce initial bundle size
const ReportNav = nextDynamic(() => import("@/components/reports/ReportNav"), { ssr: false });
const WundyChat = nextDynamic(() => import("@/components/wundy/WundyChat"), { ssr: false });

/* ─── Brand tokens (match Snapshot+) ─── */
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

/* ─── UTM base ─── */
const UTM_BASE = "https://wunderbardigital.com/?utm_source=brand_blueprint_plus_report&utm_medium=report_nav&utm_campaign=nav_header_logo&utm_content=blueprint_plus_logo";

/* ─── Score color logic ─── */
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

/* ─── AnimNum ─── */
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

/* ─── MainGauge ─── */
function MainGauge({ score }: { score: number }) {
  const [animScore, setAnimScore] = useState(0);
  const W = 280;
  const strokeW = 24;
  const R = 90;
  const pad = 22;
  const cx = W / 2;
  const cy = R + strokeW / 2 + pad;
  const svgH = cy + 8;
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
    return { x: Math.round((cx + r * Math.cos(rad)) * 100) / 100, y: Math.round((cy - r * Math.sin(rad)) * 100) / 100 };
  }
  const stops: [number, number[]][] = [[0, [239, 68, 68]], [0.25, [249, 115, 22]], [0.45, [234, 179, 8]], [0.65, [74, 222, 128]], [1, [22, 128, 61]]];
  function getColor(t: number) {
    let i = 0;
    for (let k = 1; k < stops.length; k++) { if (t <= stops[k][0]) { i = k - 1; break; } }
    if (t >= stops[stops.length - 1][0]) i = stops.length - 2;
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    const f = (t - t0) / (t1 - t0);
    return `rgb(${Math.round(c0[0] + (c1[0] - c0[0]) * f)},${Math.round(c0[1] + (c1[1] - c0[1]) * f)},${Math.round(c0[2] + (c1[2] - c0[2]) * f)})`;
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
    arcSegs.push({ d: `M${p1.x},${p1.y} A${R},${R} 0 0 0 ${p2.x},${p2.y}`, color: getColor((i + 0.5) / numSegs) });
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
    <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width={W} height={svgH} viewBox={`0 0 ${W} ${svgH}`}>
          {arcSegs.map((seg, i) => (
            <path key={i} d={seg.d} fill="none" stroke={seg.color} strokeWidth={strokeW} strokeLinecap="butt" />
          ))}
          <circle cx={leftCap.x} cy={leftCap.y} r={strokeW / 2} fill={getColor(0)} />
          <circle cx={rightCap.x} cy={rightCap.y} r={strokeW / 2} fill={getColor(1)} />
          {tickNums.map((t) => {
            const angle = 180 - (t / 100) * 180;
            const p = pol(angle, tickLabelR);
            return <text key={t} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill="#94A3B8" fontSize="10" fontFamily="Lato, sans-serif" fontWeight="700">{t}</text>;
          })}
          <polygon points={`${nTip.x},${nTip.y} ${nB1.x},${nB1.y} ${nTail.x},${nTail.y} ${nB2.x},${nB2.y}`} fill={NAVY} />
          <circle cx={cx} cy={cy} r={5} fill={NAVY} />
          <circle cx={cx} cy={cy} r={2} fill={WHITE} />
        </svg>
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <div style={{ fontSize: 50, fontWeight: 900, color: NAVY, lineHeight: 1, fontFamily: "Lato, sans-serif" }}><AnimNum value={score} /></div>
          <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>out of 100</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {scoreRanges.map((rng) => {
          const active = score >= rng.min && score <= rng.max;
          return (
            <div key={rng.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 5, background: active ? rng.color + "12" : "transparent", border: active ? `2px solid ${rng.color}35` : "2px solid transparent" }}>
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

/* ─── PillarMeter ─── */
function PillarMeter({ score, maxScore = 20, label }: { score: number; maxScore?: number; label: string }) {
  const pct = (score / maxScore) * 100;
  const color = scoreColor(pct);
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 100); return () => clearTimeout(t); }, [pct]);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 900, color }}>{score}<span style={{ fontWeight: 400, color: SUB }}>/{maxScore}</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 5, background: "#E2E8F0", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 5, background: "linear-gradient(90deg, #EF4444 0%, #F97316 25%, #EAB308 50%, #4ADE80 75%, #16A34A 100%)", backgroundSize: `${100 / (width / 100 || 0.01)}% 100%`, width: `${width}%`, transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
    </div>
  );
}

/* ─── Section & SectionTitle ─── */
function Section({ children, style, pageBreak, id }: { children: React.ReactNode; style?: React.CSSProperties; pageBreak?: boolean; id?: string }) {
  return (
    <div id={id} data-section data-page-break={pageBreak || undefined} style={{ background: WHITE, borderRadius: 5, border: `1px solid ${BORDER}`, padding: "32px 32px", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children, hero, description }: { icon?: React.ReactNode; children: React.ReactNode; hero?: boolean; description?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon && (
          <div style={{ width: 36, height: 36, borderRadius: 5, background: ACCENT_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
        )}
        <h2 style={{ fontSize: hero ? 24 : 20, fontWeight: 700, margin: 0, color: NAVY }}>{children}</h2>
      </div>
      {description && <p style={{ fontSize: 14, color: SUB, margin: "6px 0 0", lineHeight: 1.5 }}>{description}</p>}
    </div>
  );
}

/* ─── PillarIcon ─── */
function PillarIcon({ pillar, size = 24 }: { pillar: string; size?: number }) {
  const c = BLUE;
  const s = { width: size, height: size, flexShrink: 0 };
  const icons: Record<string, React.JSX.Element> = {
    positioning: <svg viewBox="0 0 24 24" fill="none" style={s}><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8"/><circle cx="12" cy="12" r="6" stroke={c} strokeWidth="1.5" opacity="0.5"/><circle cx="12" cy="12" r="2.5" fill={c}/></svg>,
    messaging: <svg viewBox="0 0 24 24" fill="none" style={s}><path d="M4 4h16v12H8l-4 4V4z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 8h8M8 11h5" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/></svg>,
    visibility: <svg viewBox="0 0 24 24" fill="none" style={s}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="12" r="3.5" stroke={c} strokeWidth="1.8"/><circle cx="12" cy="12" r="1.5" fill={c}/></svg>,
    credibility: <svg viewBox="0 0 24 24" fill="none" style={s}><path d="M12 2l2.9 5.8L21 9l-4.5 4.4 1.1 6.3L12 17l-5.6 2.7 1.1-6.3L3 9l6.1-1.2L12 2z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    conversion: <svg viewBox="0 0 24 24" fill="none" style={s}><path d="M12 3v14M8 13l4 4 4-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 20h14" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  };
  return icons[pillar] || null;
}

/* ─── Archetype icons (all 12, match Snapshot+) ─── */
const archSw = 2.2;
const archVb = { viewBox: "0 0 48 56" as const, fill: "none" as const, style: { width: "100%", height: "100%" } };

const archetypeIcons: Record<string, (c: string) => React.JSX.Element> = {
  "The Innocent": (c) => <svg {...archVb}><ellipse cx="24" cy="22" rx="14" ry="18" fill={c} opacity="0.15"/><ellipse cx="24" cy="22" rx="14" ry="18" stroke={c} strokeWidth={archSw} fill="none"/><path d="M22 40l2 2 2-2" stroke={c} strokeWidth={archSw} strokeLinecap="round" strokeLinejoin="round"/><path d="M24 42c-2 3 2 5 0 10" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/><ellipse cx="17" cy="16" rx="3" ry="5" fill={WHITE} opacity="0.35"/></svg>,
  "The Explorer": (c) => <svg {...archVb}><path d="M4 48l14-28 10 14 6-8 10 22H4z" fill={c} opacity="0.07"/><path d="M4 48l14-28 10 14 6-8 10 22H4z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/><circle cx="36" cy="14" r="5" stroke={c} strokeWidth={archSw} fill="none"/><path d="M36 5v-2M36 23v2M27 14h-2M45 14h2M30 8l-1.5-1.5M42 8l1.5-1.5M42 20l1.5 1.5M30 20l-1.5 1.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M10 48h28" stroke={c} strokeWidth={archSw} strokeLinecap="round" opacity="0.3"/></svg>,
  "The Sage": (c) => <svg {...archVb}><ellipse cx="24" cy="30" rx="16" ry="20" stroke={c} strokeWidth={archSw} fill="none"/><ellipse cx="24" cy="30" rx="16" ry="20" fill={c} opacity="0.05"/><circle cx="17" cy="26" r="7.5" stroke={c} strokeWidth={archSw} fill="none"/><circle cx="31" cy="26" r="7.5" stroke={c} strokeWidth={archSw} fill="none"/><circle cx="17" cy="26" r="4" fill={c}/><circle cx="31" cy="26" r="4" fill={c}/><circle cx="15" cy="24.5" r="1.5" fill={WHITE}/><circle cx="29" cy="24.5" r="1.5" fill={WHITE}/><path d="M22 35l2 3.5 2-3.5" stroke={c} strokeWidth={archSw} strokeLinecap="round" strokeLinejoin="round"/><path d="M10 14l8 7M38 14l-8 7" stroke={c} strokeWidth={archSw} strokeLinecap="round"/></svg>,
  "The Hero": (c) => <svg {...archVb}><path d="M24 4L6 14v14c0 12 8 19 18 24 10-5 18-12 18-24V14L24 4z" fill={c} opacity="0.15"/><path d="M24 4L6 14v14c0 12 8 19 18 24 10-5 18-12 18-24V14L24 4z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/><path d="M24 16l3 6.5h7l-5.5 4.5 2 7L24 30l-6.5 4 2-7L14 22.5h7z" fill={WHITE} opacity="0.5"/><path d="M24 16l3 6.5h7l-5.5 4.5 2 7L24 30l-6.5 4 2-7L14 22.5h7z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill="none"/></svg>,
  "The Outlaw": (c) => <svg {...archVb}><path d="M30 4L12 30h12L16 52l22-28H26L30 4z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/><path d="M30 4L12 30h12L16 52l22-28H26L30 4z" fill={c} opacity="0.08"/></svg>,
  "The Magician": (c) => <svg {...archVb}><path d="M24 4l6 14h15l-12 10 5 15-14-9-14 9 5-15L3 18h15z" fill={c} opacity="0.15"/><path d="M24 4l6 14h15l-12 10 5 15-14-9-14 9 5-15L3 18h15z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/></svg>,
  "The Neighbor": (c) => <svg {...archVb}><path d="M8 12h24v24c0 4-4 8-8 8H16c-4 0-8-4-8-8V12z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/><path d="M8 12h24v24c0 4-4 8-8 8H16c-4 0-8-4-8-8V12z" fill={c} opacity="0.05"/><path d="M32 18h6c3 0 5 2.5 5 5.5S41 29 38 29h-6" stroke={c} strokeWidth={archSw} strokeLinecap="round" fill="none"/><path d="M15 6c0-3 2.5-3 2.5 0S20 6 20 3M22 6c0-3 2.5-3 2.5 0S27 6 27 3" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/></svg>,
  "The Lover": (c) => <svg {...archVb}><path d="M24 18c-2.5-5-8-9-13-5s-5 10 0 18c3.5 5 9 10 13 15 4-5 9.5-10 13-15 5-8 5-14 0-18s-10.5 0-13 5z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/><path d="M24 18c-2.5-5-8-9-13-5s-5 10 0 18c3.5 5 9 10 13 15 4-5 9.5-10 13-15 5-8 5-14 0-18s-10.5 0-13 5z" fill={c} opacity="0.07"/></svg>,
  "The Entertainer": (c) => <svg {...archVb}><path d="M16 14c0-6 3.5-10 8-10s8 4 8 10v16c0 6-3.5 10-8 10s-8-4-8-10V14z" stroke={c} strokeWidth={archSw} fill="none"/><path d="M16 14c0-6 3.5-10 8-10s8 4 8 10v16c0 6-3.5 10-8 10s-8-4-8-10V14z" fill={c} opacity="0.06"/><circle cx="21" cy="12" r="1.2" fill={c} opacity="0.3"/><circle cx="27" cy="12" r="1.2" fill={c} opacity="0.3"/><circle cx="21" cy="17" r="1.2" fill={c} opacity="0.3"/><circle cx="27" cy="17" r="1.2" fill={c} opacity="0.3"/><circle cx="24" cy="14.5" r="1.2" fill={c} opacity="0.3"/><circle cx="21" cy="22" r="1.2" fill={c} opacity="0.3"/><circle cx="27" cy="22" r="1.2" fill={c} opacity="0.3"/><circle cx="24" cy="19.5" r="1.2" fill={c} opacity="0.3"/><circle cx="24" cy="24.5" r="1.2" fill={c} opacity="0.3"/><path d="M16 28h16" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/><circle cx="22" cy="33" r="1" fill={c} opacity="0.3"/><circle cx="26" cy="33" r="1" fill={c} opacity="0.3"/><path d="M24 40v8M18 48h12" stroke={c} strokeWidth={archSw} strokeLinecap="round"/><path d="M12 18c-2 3-2 8 0 12M8 14c-3 5-3 14 0 20M36 18c2 3 2 8 0 12M40 14c3 5 3 14 0 20" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/></svg>,
  "The Caregiver": (c) => <svg {...archVb}><path d="M18 10h12v12h12v12H30v12H18V34H6V22h12V10z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/></svg>,
  "The Ruler": (c) => <svg {...archVb}><path d="M6 44V12l9 10 9-18 9 18 9-10v32H6z" stroke={c} strokeWidth={archSw} strokeLinejoin="round" fill="none"/><path d="M6 44V12l9 10 9-18 9 18 9-10v32H6z" fill={c} opacity="0.06"/><path d="M6 44h36M6 38h36" stroke={c} strokeWidth={archSw} strokeLinecap="round"/><circle cx="15" cy="34" r="2" fill={c} opacity="0.15"/><circle cx="24" cy="32" r="2.5" fill={c} opacity="0.2"/><circle cx="33" cy="34" r="2" fill={c} opacity="0.15"/></svg>,
  "The Creator": (c) => <svg {...archVb}><rect x="4" y="18" width="40" height="28" rx="4" stroke={c} strokeWidth={archSw} fill="none"/><rect x="4" y="18" width="40" height="28" rx="4" fill={c} opacity="0.08"/><path d="M17 18v-4c0-1 1-2 2-2h10c1 0 2 1 2 2v4" stroke={c} strokeWidth={archSw} fill="none"/><circle cx="24" cy="33" r="9" stroke={c} strokeWidth={archSw} fill="none"/><circle cx="24" cy="33" r="5" fill={c} opacity="0.15"/><circle cx="36" cy="24" r="2.5" fill={c} opacity="0.15"/></svg>,
};
archetypeIcons["The Guide"] = archetypeIcons["The Sage"];

function ArchetypeIcon({ name, size = 64 }: { name: string; size?: number }) {
  const fn = archetypeIcons[name];
  if (!fn) return null;
  return <div style={{ width: size, height: size }}>{fn(BLUE)}</div>;
}

/* ─── Mock data ─── */
const REPORT = {
  businessName: "Acme Co",
  date: "February 5, 2026",

  // Carried forward from Snapshot+ (WunderBrand Score™)
  executiveSummary: {
    brandAlignmentScore: 72,
    synthesis: "Acme Co has a strong internal understanding of its value but struggles to translate that clarity externally. Positioning is solid at 16/20, yet messaging (15/20) lacks the proof points needed to convert that positioning into trust. Visibility efforts (14/20) are active but unfocused, spreading resources thin. Credibility signals exist but remain hidden at key decision points (13/20). Conversion infrastructure is functional but underleveraged (14/20). The throughline: internal clarity is not reaching external audiences in a way that builds trust and drives action.",
    diagnosis: "Your brand is currently strong but inconsistent because your positioning is clear internally but not consistently reflected across customer touchpoints.",
    primaryFocusArea: "Credibility",
    secondaryFocusArea: "Messaging",
    industryBenchmark: "For a regional B2B marketing consultancy at Acme Co\u2019s revenue stage, a WunderBrand Score™ of 72 places Acme Co in the upper-middle tier \u2014 ahead of most peers, but below the market leaders who have invested in systematic brand infrastructure. Closing the credibility gap alone could move Acme Co into the top 15% of its competitive set.",
  },
  priorityDiagnosis: {
    primary: { whyFocus: "Credibility is the highest-leverage pillar because your positioning and messaging are already strong — but without visible proof, prospects cannot verify your claims. Trust is the bottleneck.", downstreamIssues: "Low credibility visibility forces your messaging to work harder, makes your positioning feel like marketing speak rather than fact, and causes prospects to hesitate at conversion points. Every pillar is underperforming because proof is not doing its job.", whatImproves: "When credibility is surfaced at key touchpoints, messaging becomes believable, positioning becomes defensible, and conversion friction drops. One change unlocks momentum across the system." },
    secondary: { whyFocus: "Messaging is your secondary focus because while your core message is solid, it lacks the specific proof points that make claims believable. This creates a gap between what you say and what prospects can verify.", downstreamIssues: "Without concrete evidence backing your messaging, even strong positioning feels like marketing fluff. Prospects hear your value proposition but can't validate it, leading to longer decision cycles and price sensitivity.", whatImproves: "When messaging is reinforced with specific outcomes and evidence, your positioning gains teeth. Prospects move from ‘that sounds nice’ to ‘I believe that’ — shortening sales cycles and reducing objections." },
  },
  pillarDeepDives: {
    positioning: {
      score: 16,
      interpretation: "Strong \u2014 Acme Co\u2019s differentiation is clear internally.",
      whatsHappeningNow: "Acme Co knows who it serves and why it\u2019s different. However, this clarity lives in your team\u2019s heads, not on acmeco.com. Visitors have to dig to understand Acme Co\u2019s value.",
      whyItMattersCommercially: "Unclear positioning on first impression means Acme Co\u2019s bounce rates stay elevated and sales cycles drag. You\u2019re leaving money on the table in the first 5 seconds of every site visit.",
      industryContext: "A positioning score of 16 is notably strong for a regional B2B marketing consultancy. Most firms in this space score 11\u201314 because they describe what they do rather than why it matters. Acme Co\u2019s internal clarity is a genuine advantage.",
      financialImpact: "Strong positioning reduces sales cycle length by 15\u201325% because prospects self-qualify faster. For Acme Co, that could mean closing deals 2\u20133 weeks sooner and reducing cost per qualified lead.",
      riskOfInaction: "If Acme Co doesn\u2019t translate this internal positioning to the website and sales materials, competitors with weaker offerings but clearer messaging will continue winning head-to-head comparisons.",
      concreteExample: {
        before: "Acme Co \u2014 We help businesses grow with strategic marketing solutions.",
        after: "Acme Co helps B2B service companies turn brand confusion into clarity \u2014 so your marketing actually converts."
      },
      strategicRecommendation: "Rewrite acmeco.com\u2019s homepage headline and subhead to reflect Acme Co\u2019s positioning statement. Test it with 5 people outside the company \u2014 if they can\u2019t repeat back what Acme Co does and for whom, iterate.",
      successLooksLike: "A visitor can articulate Acme Co\u2019s value proposition after 10 seconds on the homepage without scrolling.",
      implementationGuide: [
        { step: "Audit your current homepage headline", detail: "Screenshot your homepage. Show it to 3 people for 5 seconds. Ask: \u2018What does this company do?\u2019 If they say \u2018marketing\u2019 or \u2018consulting\u2019 without specifics, your positioning isn\u2019t landing." },
        { step: "Rewrite using the positioning formula", detail: "Formula: \u2018[Brand] helps [specific audience] [specific transformation] \u2014 so [outcome they care about].\u2019 For Acme Co: \u2018Acme Co helps B2B service companies turn invisible expertise into visible authority \u2014 and authority into revenue.\u2019" },
        { step: "Update your website hero section", detail: "Replace your current headline. Add a 1-sentence subheadline that answers \u2018how?\u2019 Add a CTA button that reflects the next logical step (e.g., \u2018See How We Do It\u2019 or \u2018Book a Strategy Call\u2019)." },
        { step: "Extend positioning to other touchpoints", detail: "Update your LinkedIn headline, email signature, proposal intro paragraph, and About page to match. Consistency compounds \u2014 the same positioning everywhere builds recognition faster." }
      ],
      toolsAndResources: "Hotjar or Microsoft Clarity (free heatmapping to see where visitors look first), Google Analytics (bounce rate tracking), Hemingway App (headline readability check)"
    },
    messaging: {
      score: 15,
      interpretation: "Solid foundation \u2014 but Acme Co\u2019s proof is missing.",
      whatsHappeningNow: "Acme Co\u2019s core message is benefit-focused and clear. However, supporting messages rely on claims (\u2018we deliver results\u2019) rather than evidence (\u2018Acme Co increased TechNova\u2019s revenue by 40% in 90 days\u2019).",
      whyItMattersCommercially: "Claims without proof trigger skepticism. In Acme Co\u2019s market, where every B2B consultancy says the same thing, specificity and evidence are your competitive advantage.",
      industryContext: "For B2B consultancies, messaging scores above 14 indicate a clear core message exists. The gap is almost always in proof points \u2014 Acme Co follows this pattern precisely.",
      financialImpact: "Evidence-backed messaging typically improves proposal win rates by 20\u201330% in B2B services. For Acme Co, that means winning 1\u20132 more deals per quarter from the same pipeline.",
      riskOfInaction: "Without proof-driven messaging, Acme Co will continue competing on price and relationships alone \u2014 making growth dependent on referrals and leaving inbound leads under-converted.",
      concreteExample: {
        before: "Acme Co clients see real results from working with us.",
        after: "87% of Acme Co clients report measurable ROI within 90 days. Here\u2019s how we did it for TechNova."
      },
      strategicRecommendation: "Audit acmeco.com and Acme Co\u2019s sales materials. Replace every claim with a specific outcome, number, or customer quote. If Acme Co doesn\u2019t have the data, that\u2019s the first action item.",
      successLooksLike: "Every page on acmeco.com includes at least one specific, verifiable proof point.",
      implementationGuide: [
        { step: "Create a proof point inventory", detail: "Open a spreadsheet with columns: Client Name, Result, Timeframe, Category (revenue, efficiency, growth, satisfaction). Fill it with every measurable outcome you can find \u2014 even approximate ones. This is your ammunition." },
        { step: "Map proof points to your website pages", detail: "For each page (homepage, services, about, contact), assign 1\u20132 proof points. Homepage gets your best stat. Services page gets client-specific results. Contact page gets an experience-focused quote." },
        { step: "Rewrite your top 3 weakest claims", detail: "Find sentences that say \u2018we deliver,\u2019 \u2018we help,\u2019 or \u2018we provide\u2019 without evidence. Replace each with: [Specific number] + [Timeframe] + [Named outcome]. Example: \u2018We help companies grow\u2019 \u2192 \u201887% of clients see measurable ROI within 90 days.\u2019" },
        { step: "Start collecting proof systematically", detail: "Add a 90-day check-in email to your client process: \u2018Hi [Name], we\u2019d love to hear about the results you\u2019ve seen since working with us. Even a few sentences would be incredibly valuable.\u2019 This builds your proof library over time." }
      ],
      toolsAndResources: "Google Sheets (proof point tracker), Testimonial.to or Senja (automated testimonial collection), Loom (quick video testimonials from clients)"
    },
    visibility: {
      score: 14,
      interpretation: "Active presence \u2014 but Acme Co\u2019s strategy is unclear.",
      whatsHappeningNow: "Acme Co is posting on LinkedIn, the website is live, and you\u2019re present on relevant channels. But content feels reactive \u2014 topics shift based on inspiration rather than a plan tied to Acme Co\u2019s positioning.",
      whyItMattersCommercially: "Scattered visibility wastes Acme Co\u2019s time and budget. Worse, inconsistent messaging confuses your B2B audience and dilutes brand recall. Acme Co becomes forgettable.",
      industryContext: "Most regional B2B consultancies score 10\u201313 on visibility because they post inconsistently and without a content framework. Acme Co\u2019s active presence puts it ahead, but without strategic focus, the effort doesn\u2019t compound.",
      financialImpact: "A strategic content framework typically increases organic lead generation by 30\u201350% within 6 months for B2B firms. For Acme Co, that\u2019s the difference between hoping for referrals and building a predictable pipeline.",
      riskOfInaction: "Without a content strategy tied to brand pillars, Acme Co\u2019s team will burn out posting without results, competitors will claim topical authority in the space, and organic discovery will plateau.",
      concreteExample: {
        before: "Acme Co posting 3x/week on LinkedIn about whatever feels relevant that day.",
        after: "Acme Co\u2019s 4-week content calendar: Week 1 = Positioning (why B2B service companies need Acme Co), Week 2 = Credibility (TechNova case study), Week 3 = Messaging (proof-driven posts), Week 4 = Conversion (lead magnet promotion)."
      },
      strategicRecommendation: "Create a simple content framework for Acme Co that ties every piece of content to one of the five brand pillars. If it doesn\u2019t support a pillar, don\u2019t publish it.",
      successLooksLike: "Acme Co can look at any piece of content and immediately identify which pillar it strengthens.",
      implementationGuide: [
        { step: "Build your pillar-based content calendar", detail: "Open Google Sheets. Create columns: Week, Pillar Focus, Content Topic, Format (post/article/email), Channel, Status. Map one pillar per week. Rotate through all five monthly. This takes 30 minutes and replaces \u2018what should I post?\u2019 anxiety." },
        { step: "Create 3 LinkedIn post templates you can reuse", detail: "Template 1 (Insight): \u2018Most [audience] think [common belief]. But [counterpoint]. Here\u2019s what actually works: [3 bullet points].\u2019 Template 2 (Proof): \u2018We helped [Client] achieve [result] in [timeframe]. Here\u2019s what we did differently: [story].\u2019 Template 3 (Question): \u2018[Provocative question]? [Short answer]. [CTA to engage].\u2019" },
        { step: "Repurpose every piece of content 3 ways", detail: "One blog post \u2192 3 LinkedIn posts (intro, key takeaway, controversial angle) \u2192 1 email to your list \u2192 2 social media quotes. This 1-to-7 ratio means you create once and distribute widely." },
        { step: "Track and optimize monthly", detail: "After 30 days, check: Which pillar\u2019s content got the most engagement? Which drove the most website traffic? Which generated replies or DMs? Double down on what resonates. Adjust what doesn\u2019t." }
      ],
      toolsAndResources: "Google Sheets or Notion (content calendar), Buffer or Later (scheduling), LinkedIn Analytics (track post performance), Google Analytics (measure traffic from social)"
    },
    credibility: {
      score: 13,
      interpretation: "Trust signals exist \u2014 but Acme Co\u2019s proof is hidden.",
      whatsHappeningNow: "Acme Co has testimonials, case studies, and satisfied clients like TechNova and BrightPath. But these assets are buried on a testimonials page or mentioned only in sales calls. They\u2019re not doing their job at decision points.",
      whyItMattersCommercially: "Prospects don\u2019t visit Acme Co\u2019s testimonials page. They decide on the homepage, pricing page, and contact form. If proof isn\u2019t visible at those moments, hesitation wins.",
      industryContext: "A credibility score of 13 is typical for B2B consultancies that have strong client relationships but haven\u2019t systematized their social proof. Top performers in this space score 16\u201318 by making proof visible at every decision point.",
      financialImpact: "Visible credibility signals reduce sales cycle length by 20\u201335% in B2B services. For Acme Co, surfacing testimonials at decision points could be the single highest-ROI change available.",
      riskOfInaction: "Without visible credibility at key touchpoints, Acme Co will continue losing prospects to competitors who look more established \u2014 even when Acme Co\u2019s actual work is superior. Trust is decided in seconds, not meetings.",
      concreteExample: {
        before: "Acme Co\u2019s testimonials page with 12 quotes, linked in the footer.",
        after: "TechNova\u2019s testimonial on Acme Co\u2019s homepage hero. Client logo bar (TechNova, BrightPath, Meridian) above the fold. Case study preview on the services page."
      },
      strategicRecommendation: "Identify Acme Co\u2019s top 3 testimonials \u2014 TechNova, BrightPath, and Meridian are strong candidates. Place one on the homepage, one on the services/pricing page, and one on the contact page. Make proof impossible to miss.",
      successLooksLike: "A prospect sees Acme Co social proof within 10 seconds of landing on any key page.",
      implementationGuide: [
        { step: "Rank your existing testimonials by impact", detail: "Pull all testimonials into one document. Score each on: (1) specificity of result, (2) recognizability of the client, (3) relevance to your ideal audience. Your top 3 go on your most important pages." },
        { step: "Create a client logo bar", detail: "Collect logos from your top 5\u201310 clients (ask permission if needed). Create a simple \u2018Trusted By\u2019 or \u2018Companies We\u2019ve Helped\u2019 logo bar. Place it on your homepage below the fold \u2014 even grayscale logos signal credibility instantly." },
        { step: "Place proof at every decision point", detail: "Map your buyer\u2019s journey on your website: Homepage \u2192 Services \u2192 Pricing/Contact. At each page, add one form of social proof: testimonial quote, client logo, case study snippet, or specific metric. The rule: never let a prospect reach a CTA without seeing proof first." },
        { step: "Build one full case study", detail: "Pick your best client result. Write a 500-word case study: Challenge (what they struggled with), Solution (what you did), Result (specific numbers). Post it on your website and link to it from your services page. One great case study outweighs 20 generic testimonials." }
      ],
      toolsAndResources: "Canva (logo bar design, case study layout), Google Docs (case study template), Hotjar (see if visitors scroll to your proof sections)"
    },
    conversion: {
      score: 14,
      interpretation: "Functional \u2014 but Acme Co\u2019s conversion path isn\u2019t optimized.",
      whatsHappeningNow: "Acme Co\u2019s CTAs exist and the contact form works. But there\u2019s no lead magnet, no nurture sequence, and no clear next step for B2B visitors who aren\u2019t ready to buy today.",
      whyItMattersCommercially: "Only 3% of Acme Co\u2019s visitors are ready to buy now. The other 97% need nurturing. Without a low-commitment entry point, Acme Co loses the majority of its traffic.",
      industryContext: "A conversion score of 14 is average for B2B consultancies. Most have a contact form and little else. Top performers differentiate with multi-path conversion systems \u2014 and that\u2019s where Acme Co has the biggest quick win.",
      financialImpact: "Adding a lead magnet and nurture sequence typically increases lead capture by 40\u201360% for B2B service firms. For Acme Co, this means capturing visitors who would otherwise leave and never return.",
      riskOfInaction: "Without a low-commitment conversion path, Acme Co will continue losing 97% of its website visitors permanently. Each visitor costs money to acquire \u2014 this is the most quantifiable leak in the system.",
      concreteExample: {
        before: "\u2018Contact Acme Co\u2019 as the only CTA.",
        after: "\u2018Get the Free B2B Strategy Audit Checklist\u2019 (lead magnet) + \u2018Book a Strategy Session with Acme Co\u2019 (high intent). Two paths for two audiences."
      },
      strategicRecommendation: "Create one lead magnet specific to Acme Co\u2019s expertise that provides immediate value and captures email. Set up a 3-email nurture sequence that builds trust before asking for a call.",
      successLooksLike: "Acme Co has two conversion paths: one for high-intent visitors (book a strategy session) and one for early-stage visitors (download the audit checklist).",
      implementationGuide: [
        { step: "Add a second CTA path to your homepage", detail: "Right now you likely have one CTA (\u2018Contact Us\u2019 or \u2018Book a Call\u2019). Add a lower-commitment option nearby: \u2018Get the Free [Resource Name]\u2019. This captures the 97% who aren\u2019t ready to buy but are interested enough to learn." },
        { step: "Build a 3-email nurture sequence", detail: "Email 1 (Day 0): Deliver the resource + one key insight that makes them think differently. Email 2 (Day 3): Share a relevant case study or testimonial \u2014 proof that you deliver. Email 3 (Day 7): Soft CTA: \u2018Want to see how this applies to your business? Book a 15-minute call.\u2019 Keep each email under 200 words." },
        { step: "Optimize your CTA button copy", detail: "Replace generic CTAs with specific, benefit-driven language. \u2018Contact Us\u2019 \u2192 \u2018Book a Strategy Session.\u2019 \u2018Learn More\u2019 \u2192 \u2018See How Acme Co Can Help.\u2019 \u2018Submit\u2019 \u2192 \u2018Get Your Free Audit.\u2019 The more specific the CTA, the higher the click rate." },
        { step: "Add exit-intent or scroll-triggered opt-ins", detail: "When a visitor starts to leave your site (exit intent) or scrolls past 50% of a page, show a simple popup: \u2018Before you go \u2014 grab our free B2B Strategy Audit Checklist.\u2019 Tools: ConvertKit, OptinMonster, or Sumo (all have free tiers)." }
      ],
      toolsAndResources: "ConvertKit or Mailchimp (email sequences), OptinMonster or Sumo (opt-in popups), Calendly (booking link for strategy calls), Google Analytics (conversion tracking)"
    },
  },
  contextCoverage: { overallPercent: 78, areas: [{ name: "Brand Positioning", percent: 90, status: "strong" }, { name: "Messaging & Copy", percent: 85, status: "strong" }, { name: "Audience Clarity", percent: 72, status: "moderate" }, { name: "Visual Identity", percent: 65, status: "moderate" }, { name: "Competitive Context", percent: 58, status: "limited" }, { name: "Conversion Data", percent: 70, status: "moderate" }], contextGaps: ["Competitor positioning and differentiation data would sharpen Acme Co's positioning recommendations", "Website analytics (bounce rate, time on page) would allow more precise conversion diagnosis", "Customer interview transcripts or survey data would deepen audience signal accuracy"] },
  strategicAlignmentOverview: { summary: "Acme Co's five pillars are not working as a unified system. Positioning and messaging are relatively aligned but disconnected from credibility. Visibility operates independently without strategic direction. Conversion exists but isn't supported by the trust signals it needs to perform.", reinforcements: [{ pillars: "Positioning → Messaging", insight: "Acme Co's clear positioning (16/20) provides a strong foundation for messaging. When the positioning statement is reflected consistently in copy, messaging becomes more effective automatically." }, { pillars: "Credibility → Conversion", insight: "Surfacing Acme Co's hidden trust signals at key decision points will directly reduce friction in the conversion path. These two pillars are tightly linked — fixing one improves the other." }], conflicts: [{ pillars: "Visibility ↔ Positioning", insight: "Acme Co's content is active but doesn't consistently reflect positioning. This creates a disconnect: prospects see the brand often but can't articulate what Acme Co does differently." }, { pillars: "Messaging ↔ Credibility", insight: "Acme Co's messaging makes strong claims, but credibility signals aren't placed where those claims are made. This gap forces messaging to do the work of both persuasion and proof." }], systemRecommendation: "Start with credibility (primary focus) to create a trust foundation. Then refine messaging with proof points. This sequence will naturally strengthen conversion and give visibility efforts a clearer message to amplify." },
  brandArchetypeSystem: { primary: { name: "The Sage", whenAligned: "When aligned, The Sage signals expertise, trustworthiness, and the ability to guide others toward better decisions. Your audience sees you as the go-to authority in your space.", riskIfMisused: "If overused, The Sage can come across as condescending or overly academic, alienating audiences who want practical help rather than lectures.", languageTone: "Lead with insight, not instruction. Ask questions that demonstrate understanding. Share frameworks, not just advice. Be confident, not condescending.", behaviorGuide: "Position yourself as a thinking partner, not a know-it-all. Validate your audience's intelligence while providing clarity they couldn't reach alone." }, secondary: { name: "The Caregiver", whenAligned: "When aligned, The Caregiver signals empathy, support, and a genuine desire to help others succeed. Your audience feels seen and supported on their journey.", riskIfMisused: "If overused, The Caregiver can come across as overly nurturing or self-sacrificing, making audiences feel guilty or creating dependency rather than empowerment.", languageTone: "Speak with warmth and encouragement. Use ‘we’ language to create partnership. Celebrate progress and normalize challenges.", behaviorGuide: "Show up as a trusted companion on the journey. Offer support without taking over. Make your audience feel capable while providing the care they need." }, howTheyWorkTogether: "The Sage provides expertise and credibility; The Caregiver ensures that expertise is accessible and supportive. Together, they position your brand as a trusted advisor who not only knows the answers but genuinely cares about helping others find them." },
  brandPersona: {
    personaSummary: "Your brand persona is the trusted expert who makes complexity simple. You\u2019re knowledgeable without being academic, confident without being arrogant, and supportive without being soft. You lead with insight and back it with proof.",
    coreIdentity: {
      whoYouAre: "A strategic partner who sees what others miss and explains it in a way that creates clarity, not confusion.",
      whatYouStandFor: "The belief that great work deserves to be seen, understood, and valued \u2014 and that clear communication is the bridge between quality and recognition.",
      howYouShowUp: "As a thinking partner who brings both expertise and empathy. You don\u2019t just diagnose problems \u2014 you illuminate the path forward.",
    },
    communicationStyle: {
      tone: "Confident but not arrogant. Direct but not cold. You speak like a trusted advisor who\u2019s earned the right to be direct.",
      pace: "Measured and intentional. You give the audience time to absorb. Short sentences. Then elaboration. Then action.",
      energy: "Calm authority with moments of sharp clarity. Think boardroom, not stage. Presence, not performance.",
    },
    messagingExamples: {
      elevator: {
        wrong: "We are a full-service B2B marketing and consulting firm providing a range of solutions to help businesses optimize their growth potential.",
        right: "We help B2B service companies turn invisible expertise into visible authority \u2014 so the right clients find you, trust you, and choose you.",
        why: "The \u2018right\u2019 version is specific (B2B service companies), benefit-driven (visible authority), and paints a journey (find, trust, choose).",
      },
      linkedin: {
        wrong: "Acme Co is excited to announce our new strategy framework! We\u2019re the best in the business. Contact us to learn more!",
        right: "80% of B2B companies we audit have the same problem: their marketing says \u2018we\u2019re great\u2019 instead of \u2018here\u2019s what you\u2019ll get.\u2019 The fix takes 15 minutes. Here\u2019s how \u2192",
        why: "The \u2018right\u2019 version leads with a stat, creates curiosity, and promises value \u2014 no self-promotion needed.",
      },
      email: {
        wrong: "Hi [Name], I wanted to reach out to introduce Acme Co. We offer brand strategy, marketing consulting, and growth optimization services...",
        right: "Hi [Name], I noticed [Company] ranks on page 3 for \u2018[key term]\u2019 \u2014 which means prospects searching for exactly what you do aren\u2019t finding you. I put together a quick diagnosis. Want me to send it over?",
        why: "The \u2018right\u2019 version demonstrates you\u2019ve done homework, identifies a specific problem, and offers value before asking for anything.",
      },
      proposal: {
        wrong: "Acme Co will provide a comprehensive brand strategy engagement including positioning, messaging, and visual identity services.",
        right: "In 90 days, we\u2019ll move Acme Co from invisible to undeniable: a positioning statement that stops prospects mid-scroll, messaging that converts, and a visual system that signals authority on sight.",
        why: "The \u2018right\u2019 version paints a picture of transformation with a timeline, specific outcomes, and emotional language.",
      },
    },
    communicationGuidelines: {
      dos: [
        { do: "Lead with insight, not credentials", example: "\u2018Here\u2019s what we see in your data\u2019 not \u2018We\u2019ve been in business for 15 years\u2019" },
        { do: "Use \u2018you/your\u2019 more than \u2018we/our\u2019", example: "\u2018Your brand has untapped authority\u2019 not \u2018Our firm delivers authority-building solutions\u2019" },
        { do: "Back claims with specifics", example: "\u201887% of clients see measurable ROI in 90 days\u2019 not \u2018We deliver great results\u2019" },
        { do: "Create contrast (before/after)", example: "\u2018From invisible to undeniable\u2019 not \u2018Improving your brand presence\u2019" },
        { do: "End with one clear action", example: "\u2018Take the 2-minute WunderBrand Snapshot™\u2019 not \u2018Contact us to learn more about our services\u2019" },
      ],
      donts: [
        { dont: "Don\u2019t use jargon without context", example: "Avoid: \u2018synergistic omnichannel brand activation\u2019 \u2014 Say: \u2018showing up consistently where your audience already spends time\u2019" },
        { dont: "Don\u2019t be vague about outcomes", example: "Avoid: \u2018We\u2019ll help you grow\u2019 \u2014 Say: \u2018We\u2019ll increase qualified inbound leads by 40% in 90 days\u2019" },
        { dont: "Don\u2019t lead with features", example: "Avoid: \u2018Our engagement includes 12 deliverables\u2019 \u2014 Say: \u2018You\u2019ll walk away with a complete brand playbook your team can execute tomorrow\u2019" },
        { dont: "Don\u2019t be generic", example: "Avoid: \u2018We work with businesses of all sizes\u2019 \u2014 Say: \u2018We work with B2B service companies doing $1M\u2013$10M who\u2019ve outgrown their marketing\u2019" },
        { dont: "Don\u2019t sound desperate", example: "Avoid: \u2018Limited time offer! Act now!\u2019 \u2014 Say: \u2018When you\u2019re ready, here\u2019s the next step\u2019" },
      ],
    },
  },
  visualVerbalSignals: { colorPaletteDirection: "Navy and deep blue for authority and trust. Bright blue accents for clarity and forward motion. White space for confidence. Avoid overly warm colors that undermine professionalism.", colorSwatches: [{ name: "Navy", hex: "#021859", usage: "Primary / Headers" }, { name: "Deep Blue", hex: "#0A2E6E", usage: "Secondary text" }, { name: "Bright Blue", hex: "#07B0F2", usage: "Accents / CTAs" }, { name: "Light Blue", hex: "#E8F6FE", usage: "Backgrounds" }, { name: "White", hex: "#FFFFFF", usage: "Primary background" }, { name: "Light Gray", hex: "#F4F7FB", usage: "Section backgrounds" }], avoidColors: [{ name: "Warm Orange", hex: "#FF6B35", reason: "Too casual" }, { name: "Bright Red", hex: "#E63946", reason: "Aggressive" }], voiceTraits: ["Clear", "Confident", "Supportive", "Direct", "Insightful"], consistencyRisks: "Avoid shifting between overly casual (social) and overly formal (website). The voice should feel like the same person across all channels — knowledgeable but approachable." },
  strategicActionPlan: [
    {
      action: "Surface your strongest testimonial on your homepage above the fold.",
      pillar: "Credibility",
      outcome: "Immediate trust signal at first impression.",
      priority: 1,
      why: "Visitors make judgment calls in under 5 seconds. A strong testimonial from a recognizable name or company immediately answers the question \u2018Can I trust these people?\u2019 before they even read your headline.",
      howTo: [
        "Identify your best testimonial \u2014 look for specific outcomes, named clients, or recognizable companies",
        "Place it within the first viewport (visible without scrolling) near your headline",
        "Include the person\u2019s name, title, and company logo if possible",
        "Keep it to 1\u20132 sentences max \u2014 impact over length"
      ],
      example: "\u201cAcme increased our qualified leads by 47% in 90 days. Their process was clear from day one.\u201d \u2014 Sarah Chen, VP Marketing, TechCorp",
      effort: "Low",
      impact: "High",
      quickWin: "Right now: Open your homepage in a new tab. Is there a client quote visible without scrolling? If not, add one today \u2014 even a plain-text quote works while you design something polished.",
      template: "Copy this testimonial format and customize:\n\n\u201c[Specific result + timeframe]. [What made the experience stand out].\u201d\n\u2014 [Full Name], [Title], [Company]\n\nPlacement checklist:\n\u2022 Homepage hero section (next to or below your headline)\n\u2022 Services page (near pricing or CTA)\n\u2022 Contact page (above the form)\n\nDesign tip: Add the client\u2019s company logo next to the quote. Even a grayscale logo adds visual credibility. If you have 3+ logos, create a \u201cTrusted By\u201d logo bar.",
      implementationSteps: [
        { step: "Email your 3 happiest clients today", detail: "Use this exact message: \u2018Hi [Name], I\u2019m updating our website and would love to feature a short quote from you. Could you share 1\u20132 sentences about the results we helped you achieve? No pressure \u2014 even a few words would mean a lot.\u2019" },
        { step: "Pick the quote with the most specific result", detail: "The best testimonials include a number (47% increase), a timeframe (90 days), or a named outcome (qualified leads). Avoid vague praise like \u2018great to work with.\u2019" },
        { step: "Add it to your homepage above the fold", detail: "Place it directly below your headline or in a light-background callout box. Use a slightly larger font size than body copy (16\u201318px). Add the person\u2019s name, title, and company." },
        { step: "Repeat on your services and contact pages", detail: "Different testimonials for different pages: services page = results-focused, contact page = experience-focused (\u2018easy process,\u2019 \u2018clear communication\u2019)." }
      ]
    },
    {
      action: "Rewrite your homepage headline to reflect your positioning statement.",
      pillar: "Positioning",
      outcome: "Visitors understand your value in 5 seconds.",
      priority: 2,
      why: "Your headline is the most-read piece of copy on your site. If it\u2019s generic (\u2018We help businesses grow\u2019), you\u2019re wasting your highest-value real estate.",
      howTo: [
        "Start with your differentiation: What do you do that others don\u2019t?",
        "Include who you serve: Be specific about your ideal client",
        "Add the transformation: What changes because of your work?",
        "Test it: Can someone understand your value without reading anything else?"
      ],
      example: "Before: \u2018Acme Co \u2014 Marketing Solutions for Growing Businesses\u2019 \u2192 After: \u2018Acme Co helps B2B service companies turn invisible expertise into visible authority \u2014 and authority into revenue.\u2019",
      effort: "Medium",
      impact: "High",
      quickWin: "Right now: Show your current headline to someone who doesn\u2019t know your business. Ask them: \u2018What do we do and who do we do it for?\u2019 If they can\u2019t answer both clearly, your headline needs work.",
      template: "Use this headline formula and fill in the blanks:\n\n[Company Name] helps [specific audience] [achieve specific transformation] \u2014 so [outcome they care about].\n\nExample variations for Acme Co:\n\nOption A (Outcome-Led):\n\u201cAcme Co helps B2B service companies turn invisible expertise into visible authority \u2014 and authority into revenue.\u201d\n\nOption B (Problem-Led):\n\u201cYour expertise is real. Your marketing doesn\u2019t show it. Acme Co fixes that.\u201d\n\nOption C (Proof-Led):\n\u201c87% of our clients see measurable ROI in 90 days. Here\u2019s how Acme Co does it for B2B service companies.\u201d\n\nSubheadline (add below your main headline):\n\u201cWe align your brand strategy with your business reality \u2014 so every touchpoint builds trust and drives action.\u201d",
      implementationSteps: [
        { step: "Draft 3 headline options using the formula above", detail: "Write one outcome-led, one problem-led, and one proof-led version. Don\u2019t overthink it \u2014 you\u2019re testing, not finalizing." },
        { step: "Run the 5-second test with 3\u20135 people", detail: "Show each headline for 5 seconds, then hide it. Ask: \u2018What does this company do?\u2019 and \u2018Who is it for?\u2019 The headline where people answer both correctly is your winner." },
        { step: "Add a supporting subheadline", detail: "Your headline grabs attention. Your subheadline adds specificity. Keep it to one sentence that answers \u2018how?\u2019 or \u2018why us?\u2019" },
        { step: "Update your homepage and monitor bounce rate", detail: "Watch your bounce rate for 2 weeks. A clearer headline should reduce bounce by 5\u201315%. If it doesn\u2019t, test another option." }
      ]
    },
    {
      action: "Replace one claim on your services page with a specific outcome or number.",
      pillar: "Messaging",
      outcome: "Claims become believable proof.",
      priority: 3,
      why: "Generic claims (\u2018We deliver results\u2019) create skepticism. Specific outcomes (\u2018Clients see 40% faster close rates\u2019) create belief.",
      howTo: [
        "Audit your services page for vague claims",
        "Pick the weakest claim",
        "Replace it with a specific number, timeframe, or named outcome",
        "If you don\u2019t have data, use a specific client example or case study reference"
      ],
      example: "Before: \u2018Acme Co helps you close more deals\u2019 \u2192 After: \u2018Acme Co clients close 35% more deals within 90 days \u2014 here\u2019s how we do it for companies like yours.\u2019",
      effort: "Low",
      impact: "Medium",
      quickWin: "Right now: Open your services page. Find one sentence that says \u2018we deliver results\u2019 or similar. Replace it with one specific number from a real client engagement.",
      template: "Claim-to-proof conversion formulas:\n\nFormula 1 \u2014 Stat + Timeframe:\n\u201c[X]% of our clients [specific result] within [timeframe].\u201d\nExample: \u201c87% of our clients report measurable ROI within 90 days.\u201d\n\nFormula 2 \u2014 Named Client + Result:\n\u201cWe helped [Client Name] [achieve specific outcome].\u201d\nExample: \u201cWe helped TechNova reduce their sales cycle by 35% in one quarter.\u201d\n\nFormula 3 \u2014 Before/After:\n\u201c[Client] came to us with [problem]. Within [timeframe], [specific improvement].\u201d\nExample: \u201cBrightPath came to us with a 2% website conversion rate. Within 60 days, it was 5.8%.\u201d\n\nIf you don\u2019t have exact numbers yet:\n\u2022 Use client language: \u201cOur clients describe the shift as \u2018finally feeling understood by our own marketing.\u2019\u201d\n\u2022 Use directional data: \u201cClients consistently report shorter sales cycles and higher-quality leads.\u201d",
      implementationSteps: [
        { step: "Audit your services page for vague claims", detail: "Copy your entire services page text into a document. Highlight every sentence that includes words like \u2018results,\u2019 \u2018success,\u2019 \u2018growth,\u2019 or \u2018value\u2019 without a specific number or example. Those are your targets." },
        { step: "Pick the weakest claim and rewrite it", detail: "Start with the one that appears earliest on the page (first impressions matter most). Use one of the formulas above to replace it with a specific, verifiable proof point." },
        { step: "Add supporting evidence nearby", detail: "Under the rewritten claim, add a mini case study: 1\u20132 sentences about a specific client result. Link to a full case study if you have one." },
        { step: "Repeat for one claim per week", detail: "Don\u2019t try to fix everything at once. Replace one claim per week until every page has at least one specific proof point." }
      ]
    },
    {
      action: "Create a simple lead magnet that provides immediate value.",
      pillar: "Conversion",
      outcome: "Capture early-stage visitors who aren\u2019t ready to buy.",
      priority: 4,
      why: "Most visitors aren\u2019t ready to buy on their first visit. Without a low-commitment entry point, you lose the opportunity to build trust over time.",
      howTo: [
        "Identify a specific problem your ideal client faces early in their journey",
        "Create a resource that solves that problem (checklist, template, mini-guide)",
        "Keep it short and immediately actionable \u2014 1\u20133 pages max",
        "Place the opt-in at key decision points: homepage, blog posts, exit intent"
      ],
      example: "For Acme Co: \u2018The B2B Strategy Audit Checklist: 7 Questions That Reveal Why Your Expertise Isn\u2019t Converting to Revenue\u2019",
      effort: "Medium",
      impact: "High",
      quickWin: "Right now: Write down the #1 question your best clients asked you before they hired you. That question is your lead magnet topic.",
      template: "Lead magnet blueprint for Acme Co:\n\nTitle: \u201cThe B2B Strategy Audit Checklist\u201d\n\nFormat: 1-page PDF checklist (simple, scannable)\n\nOutline:\n1. Can a stranger explain what you do after 5 seconds on your homepage?\n2. Does your website include at least 3 specific client results?\n3. Is your value proposition different from your top 3 competitors\u2019?\n4. Do you have a lead capture beyond \u2018Contact Us\u2019?\n5. Is your content tied to a strategy, or are you posting reactively?\n6. Can your team articulate your brand promise in one sentence?\n7. When was the last time you updated your positioning?\n\nEach question includes a \u2018Why This Matters\u2019 one-liner and a \u2018Quick Fix\u2019 action item.\n\nLanding page headline: \u201cIs your marketing telling the truth about your brand? Find out in 2 minutes.\u201d\nCTA button: \u201cGet the Free Checklist \u2192\u201d",
      implementationSteps: [
        { step: "Choose your format and topic", detail: "Checklists convert best for B2B (they\u2019re fast, actionable, and feel immediately useful). Pick a topic that addresses a problem your audience is already aware of \u2014 not something they need to be educated about." },
        { step: "Write the content (aim for 1\u20133 pages)", detail: "Use Google Docs or Canva. Include 5\u20137 checklist items, each with a one-liner explanation. Add your logo, brand colors, and a CTA at the bottom linking to your services page or booking link." },
        { step: "Create a simple landing page", detail: "Tools: Carrd ($19/yr), ConvertKit landing page (free), or a page on your existing site. Include: headline, 2\u20133 bullet points about what they\u2019ll learn, email capture form, and a preview image of the checklist." },
        { step: "Set up a 3-email welcome sequence", detail: "Email 1 (immediate): Deliver the checklist + one key insight. Email 2 (Day 3): Share a relevant case study. Email 3 (Day 7): Offer a free 15-minute strategy call. Use your brand voice throughout." },
        { step: "Place opt-ins on your highest-traffic pages", detail: "Add the opt-in to: homepage (inline or popup), blog posts (end of article), and your About page. Use exit-intent popups as a last resort \u2014 they work but can feel aggressive." }
      ]
    },
    {
      action: "Build a 4-week content calendar tied to your five pillars.",
      pillar: "Visibility",
      outcome: "Content becomes strategic, not scattered.",
      priority: 5,
      why: "Random content creates random results. When every piece of content maps to a specific pillar, you\u2019re systematically strengthening your brand instead of just \u2018staying active.\u2019",
      howTo: [
        "Map one pillar to each week of the month (rotate through all five)",
        "For each pillar, create 2\u20133 content pieces: one educational, one proof-based, one conversion-focused",
        "Repurpose across channels: blog \u2192 LinkedIn \u2192 email \u2192 social",
        "Track which pillar-focused content performs best \u2014 double down there"
      ],
      example: "Week 1 (Credibility): Acme Co case study \u2014 how we helped TechNova reduce sales cycles by 35%. Week 2 (Positioning): \u2018Why B2B service companies hire Acme Co over generalist agencies.\u2019",
      effort: "Medium",
      impact: "Medium",
      quickWin: "Right now: Open a spreadsheet. Create 5 columns (one per pillar). Under each, write 3 content ideas you could create this month. You now have a 4-week calendar.",
      template: "Month 1 content calendar for Acme Co:\n\nWeek 1 \u2014 CREDIBILITY (build trust)\n\u2022 LinkedIn post: Case study highlight \u2014 \u201cHow we helped TechNova reduce sales cycles by 35%\u201d\n\u2022 Blog: \u201c3 Signs Your B2B Marketing Lacks Proof \u2014 and What to Do About It\u201d\n\u2022 Email: Share the TechNova story with your list, end with: \u201cWant similar results?\u201d\n\nWeek 2 \u2014 POSITIONING (clarify value)\n\u2022 LinkedIn post: \u201cWhy B2B service companies hire Acme Co over generalist agencies\u201d\n\u2022 Blog: \u201cThe #1 Reason Great B2B Companies Stay Invisible\u201d\n\u2022 Email: Positioning tip + link to the blog post\n\nWeek 3 \u2014 MESSAGING (sharpen words)\n\u2022 LinkedIn post: Before/after messaging example from a real client\n\u2022 Blog: \u201cYour Services Page Says \u2018We Deliver Results.\u2019 Your Prospect\u2019s Brain Says \u2018Prove It.\u2019\u201d\n\u2022 Email: Share 3 messaging formulas your subscribers can use today\n\nWeek 4 \u2014 CONVERSION (drive action)\n\u2022 LinkedIn post: \u201c97% of your website visitors aren\u2019t ready to buy. Here\u2019s what to offer them instead.\u201d\n\u2022 Blog: Promote your lead magnet with a value-driven post\n\u2022 Email: Nurture sequence for new lead magnet subscribers\n\nRepurposing rule: Every blog \u2192 3 LinkedIn posts \u2192 1 email \u2192 2 social snippets.",
      implementationSteps: [
        { step: "Set up a simple spreadsheet or Notion board", detail: "Columns: Week, Pillar, Content Type, Topic, Channel, Status. Tools that work well: Google Sheets (free), Notion (free), or Trello (free). Don\u2019t buy a fancy tool \u2014 start simple." },
        { step: "Batch-write one week of content at a time", detail: "Block 2\u20133 hours on Monday to write all content for that week. Writing in batches keeps your voice consistent and saves time vs. daily creation. Use the AI prompts from this report to draft faster." },
        { step: "Follow the 3-format rule per pillar", detail: "For each weekly pillar, create: (1) one educational piece (teach something), (2) one proof piece (show a result), (3) one conversion piece (ask for something). This ensures balance." },
        { step: "Track what performs and adjust monthly", detail: "After 4 weeks, check: Which pillar\u2019s content got the most engagement? Which drove the most traffic? Double down on what works. Cut what doesn\u2019t. Adjust the rotation." }
      ]
    },
  ],
  visibilityDiscovery: {
    visibilityMode: "Hybrid",
    visibilityModeExplanation: "Acme Co operates in a hybrid mode \u2014 the website serves as the authority hub while LinkedIn drives discovery and engagement. Neither channel is optimized to its full potential, but the foundation for both exists.",
    discoveryDiagnosis: {
      whereTheyShouldFind: [
        "Google search for \u2018B2B consulting firms\u2019",
        "LinkedIn thought leadership content",
        "Industry podcast guest appearances",
        "Referral networks and partner channels"
      ],
      whereTheyActuallyFind: [
        "Direct referrals (word of mouth)",
        "LinkedIn profile visits (not posts)",
        "Google branded search only"
      ],
      gap: "Acme Co is discoverable by people who already know the name, but nearly invisible to prospects actively searching for solutions. Non-branded discovery is the critical gap."
    },
    aeoReadiness: {
      score: "Low-Moderate",
      explanation: "Acme Co\u2019s website content is not structured for AI engine discovery. Key issues: no FAQ schema, no structured data markup, service descriptions use marketing language rather than the question-answer format AI engines prefer.",
      recommendations: [
        { action: "Add FAQ sections to key service pages", detail: "Write 5\u201310 questions per page using the exact language your prospects type into Google or ask ChatGPT. Example for Acme Co\u2019s services page: \u2018How do I know if my B2B brand is underperforming?\u2019 \u2018What does a brand clarity consultant do?\u2019 \u2018How long does it take to see results from brand strategy work?\u2019" },
        { action: "Structure content in question-answer pairs", detail: "AI engines extract Q&A formatted content more readily than paragraphs. Rewrite your key pages to include: clear question headings (H2/H3), concise direct answers in the first sentence, then supporting detail. This doubles as good SEO." },
        { action: "Include specific outcome data AI can cite", detail: "AI engines reference sources with specific, verifiable claims. Add named results throughout your content: \u201887% of clients see ROI in 90 days\u2019 is citable. \u2018We deliver great results\u2019 is not. The more specific your claims, the more likely AI recommends you." },
        { action: "Ensure meta descriptions match conversational search", detail: "Rewrite meta descriptions as answers to questions: Instead of \u2018Acme Co \u2014 B2B marketing consulting,\u2019 try \u2018Acme Co helps B2B service companies turn invisible expertise into visible authority. 87% of clients see measurable ROI within 90 days.\u2019" }
      ]
    },
    visibilityPriorities: [
      {
        priority: 1,
        action: "Optimize acmeco.com service pages for non-branded search queries",
        impact: "Opens discovery to prospects who don\u2019t yet know Acme Co",
        howToImplement: "Step 1: Use Google Search Console to find what queries your site already appears for. Step 2: Identify 5\u201310 non-branded keywords your audience searches (e.g., \u2018B2B brand strategy consultant,\u2019 \u2018how to improve B2B marketing\u2019). Step 3: Create or optimize one page per keyword cluster. Step 4: Include the keyword in: title tag, H1, first paragraph, and meta description.",
        tools: "Google Search Console (free), Ubersuggest or Ahrefs (keyword research), Yoast SEO or RankMath (WordPress optimization)"
      },
      {
        priority: 2,
        action: "Shift LinkedIn from profile-based to content-based discovery",
        impact: "Reaches prospects before they know they need Acme Co",
        howToImplement: "Step 1: Commit to posting 3x/week on LinkedIn (Mon/Wed/Fri). Step 2: Use the pillar-based content calendar from your Strategic Action Plan. Step 3: Focus on \u2018hook-first\u2019 posts: the first line must stop the scroll. Step 4: End every post with a question or soft CTA to drive engagement. Step 5: Engage with 5\u201310 relevant posts daily \u2014 comments build visibility faster than posts.",
        tools: "LinkedIn native posting (free), Shield Analytics (LinkedIn analytics), Buffer or Taplio (scheduling and hooks)"
      },
      {
        priority: 3,
        action: "Implement structured FAQ content for AI engine readiness",
        impact: "Positions Acme Co for next-generation search and AI recommendations",
        howToImplement: "Step 1: List the top 20 questions your clients ask before, during, and after working with you. Step 2: Group them by topic (5 groups of 4 questions). Step 3: Create one FAQ page per service page with these questions. Step 4: Use FAQ schema markup (Google\u2019s structured data) so search engines display your answers directly. Step 5: Update quarterly as new questions emerge.",
        tools: "Google\u2019s Structured Data Markup Helper (free), Schema.org FAQ schema, AlsoAsked.com (find related questions)"
      },
      {
        priority: 4,
        action: "Launch a monthly guest appearance strategy (podcasts, webinars)",
        impact: "Builds authority in channels where B2B decision-makers spend time",
        howToImplement: "Step 1: Identify 10 podcasts your ideal clients listen to (search \u2018B2B marketing podcast\u2019 on Apple Podcasts or Spotify). Step 2: Draft a pitch template: \u2018Hi [Host], I help B2B service companies close the gap between what they deliver and how they\u2019re perceived. I\u2019d love to share [specific topic] with your audience.\u2019 Step 3: Send 3\u20135 pitches per month. Step 4: Repurpose every appearance into 3+ LinkedIn posts and a blog recap.",
        tools: "Podmatch or PodcastGuests.com (find opportunities), Loom (video pitches), Descript (clip and repurpose audio)"
      }
    ],
  },
  audienceClarity: { audienceSignals: { primaryAudience: "B2B service company founders and marketing leaders (10-100 employees) who have built something valuable but struggle to communicate that value externally.", audienceCharacteristics: ["Revenue between $1M-$20M — successful enough to invest, frustrated enough to seek help", "Have tried DIY marketing or worked with generalist agencies with underwhelming results", "Understand their product/service deeply but can't translate that clarity into marketing that converts", "Time-constrained leaders who need strategic clarity, not more tactics"], audienceLanguage: "They say things like: ‘Our work speaks for itself, but not enough people are hearing it.’ ‘We keep losing to competitors who aren’t as good as us.’ ‘I know we need better marketing, but I don’t know where to start.’" }, decisionDrivers: { motivators: [{ driver: "Clarity", explanation: "They're overwhelmed by marketing noise and want a clear, prioritized path forward — not more options." }, { driver: "Credibility of the advisor", explanation: "They've been burned by agencies that overpromised. They need to see proof that Acme Co practices what it preaches." }, { driver: "Speed to value", explanation: "They want to see tangible progress quickly — not a 6-month strategy phase before anything happens." }, { driver: "Strategic partnership", explanation: "They want a partner who understands their business, not a vendor who runs campaigns." }], hesitationFactors: [{ factor: "Past disappointment", explanation: "Previous agency or consultant relationships didn't deliver. They're skeptical of promises." }, { factor: "Price sensitivity", explanation: "Not because they can't afford it, but because they've spent money before without seeing results." }, { factor: "Loss of control", explanation: "They've built their brand personally and are hesitant to hand it to someone who doesn't understand it." }, { factor: "Unclear ROI timeline", explanation: "They need to know when they'll see results, not just that results are possible." }] } },

  // Blueprint-specific content
  blueprintOverview: {
    whatThisEnables: "This WunderBrand Blueprint+™ is your operational system for consistent, strategic brand execution. It defines how your brand speaks, looks, converts, and maintains integrity across every touchpoint. Use it as the source of truth for marketing decisions, content creation, sales conversations, and team alignment.",
    howToUse: "Reference this document before creating any external communication. Share relevant sections with contractors, agencies, and team members. Review quarterly to ensure execution matches strategy. Update only when business fundamentals change — not based on trends or preferences.",
  },
  brandFoundation: {
    brandPurpose: "To eliminate the gap between what businesses deliver and how they're perceived — so that great work gets the recognition it deserves.",
    brandPromise: "We deliver clarity that converts. Every engagement ends with a clearer understanding of your brand and a concrete path to stronger market position.",
    positioningStatement: "For B2B service companies frustrated that their marketing doesn't reflect the quality of their work, Acme Co is the brand clarity partner that transforms confusion into confidence — so your expertise becomes visible, trusted, and chosen.",
    differentiationNarrative: "Most marketing agencies focus on tactics — more content, more ads, more channels. We focus on alignment. We ensure every piece of marketing reflects who you actually are and what you actually deliver. The result is marketing that doesn't just look good — it works, because it's true.",
  },
  audiencePersonaDefinition: {
    primaryAudience: "B2B service company founders and marketing leaders (typically 10-100 employees) who have built something valuable but feel invisible or misunderstood in the market. They've tried various marketing approaches but nothing seems to capture their true value.",
    secondaryAudience: "Marketing team members at mid-sized B2B companies who need frameworks and language to execute consistently. They have skills but lack strategic clarity from leadership.",
    decisionDrivers: [
      "Proof that we understand their specific challenge (not generic marketing talk)",
      "Clear methodology that feels structured but not rigid",
      "Evidence of results with similar companies",
      "Confidence that we'll make their life easier, not harder",
    ],
    objectionsToOvercome: [
      "We've worked with agencies before and it didn't work",
      "We don't have time for a long discovery process",
      "How is this different from what we could do ourselves?",
      "Our industry is different — will this apply to us?",
    ],
  },
  brandArchetypeActivation: {
    primaryArchetype: "The Sage",
    secondaryArchetype: "The Caregiver",
    activation: {
      messaging: {
        guidance: "Lead with insight. Share observations before recommendations. Ask questions that demonstrate understanding. Use frameworks to structure complexity. Avoid jargon that creates distance.",
        examples: [
          { context: "LinkedIn post opening", onBrand: "Most B2B companies spend 60% of their marketing budget on tactics that don\u2019t connect to their positioning. Here\u2019s the diagnostic question that reveals if you\u2019re one of them:", offBrand: "We\u2019re the best marketing agency in the B2B space! Here\u2019s why you should work with us:" },
          { context: "Email subject line", onBrand: "The positioning mistake that\u2019s costing you deals (and the 5-second fix)", offBrand: "Acme Co Newsletter \u2014 January Edition" },
          { context: "Website headline", onBrand: "Your expertise is real. Your marketing doesn\u2019t show it. We fix that.", offBrand: "Welcome to Acme Co \u2014 Your Trusted Marketing Partner" }
        ]
      },
      content: {
        guidance: "Publish thought leadership that demonstrates expertise without showing off. Create resources that genuinely help \u2014 even for non-customers. Teach principles, not just tactics.",
        examples: [
          { context: "Blog post topic", onBrand: "\u2018Why Your B2B Services Page Sounds Like Everyone Else\u2019s (And the 3 Questions That Fix It)\u2019 \u2014 teaches a framework, builds authority", offBrand: "\u20185 Marketing Tips for B2B Companies\u2019 \u2014 generic, could come from anyone" },
          { context: "Lead magnet", onBrand: "\u2018The Brand Clarity Audit: 7 Questions That Reveal Why Your Expertise Isn\u2019t Converting\u2019 \u2014 diagnostic tool they can use immediately", offBrand: "\u2018Free eBook: Everything You Need to Know About Marketing\u2019 \u2014 too broad, low perceived value" },
          { context: "Social proof integration", onBrand: "Sharing a client transformation story with specific before/after metrics and the methodology behind the results", offBrand: "Posting a client logo with \u2018Thanks for trusting us!\u2019" }
        ]
      },
      salesConversations: {
        guidance: "Listen more than pitch. Diagnose before prescribing. Be honest about fit \u2014 refer out when appropriate. Make the prospect feel understood, not sold to.",
        examples: [
          { context: "Discovery call opening", onBrand: "\u2018Before I tell you about us, I\u2019d love to understand your situation. What\u2019s the biggest frustration with your current marketing?\u2019", offBrand: "\u2018Let me walk you through our services and what makes Acme Co different.\u2019" },
          { context: "Handling objections", onBrand: "\u2018That\u2019s a fair concern. Let me share what happened when TechNova had the same hesitation \u2014 and what they found after 90 days.\u2019", offBrand: "\u2018I understand, but trust me, we\u2019re different from other agencies.\u2019" },
          { context: "Proposal introduction", onBrand: "\u2018Based on our conversation, here\u2019s what I\u2019ve diagnosed and the specific approach I\u2019d recommend for [Company].\u2019", offBrand: "\u2018Here\u2019s our standard proposal with our packages and pricing.\u2019" }
        ]
      },
      visualTone: {
        guidance: "Clean, confident, and professional. Enough white space to breathe. Visuals that clarify, not decorate. Color used intentionally to guide attention, not impress.",
        examples: [
          { context: "Website design", onBrand: "Clean layouts with generous whitespace, navy and blue color palette, data visualizations that tell a story, real photography over stock images", offBrand: "Busy designs with multiple competing elements, trendy gradients, generic stock photos of people in suits" },
          { context: "Social media visuals", onBrand: "Quote cards with clean typography on brand-colored backgrounds, simple data charts, framework diagrams", offBrand: "Overly designed graphics, meme-style content, animated GIFs" },
          { context: "Presentation decks", onBrand: "Structured slides with one key point each, proof points highlighted visually, clean data presentation", offBrand: "Dense text slides, clipart, inconsistent formatting across slides" }
        ]
      },
    },
  },
  messagingSystem: {
    coreMessage: "Clarity converts. We help B2B service companies close the gap between what they deliver and how they're perceived — so their marketing actually works.",
    supportingMessages: [
      "Your brand has value. The problem is communication, not substance.",
      "Most marketing fails because it's disconnected from reality. We start with what's true.",
      "We don't make you look good. We make you understood — which is better.",
      "Strategy without execution is a document. We build systems you can actually use.",
    ],
    proofPoints: [
      "87% of clients report measurable ROI within 90 days",
      "Average client engagement: 18 months (they stay because it works)",
      "50+ B2B service companies transformed from confused to confident",
      "Methodology refined over 8 years and 200+ engagements",
    ],
    whatNotToSay: [
      "We're the best agency in [city/industry]",
      "We do everything — strategy, design, content, ads, etc.",
      "Trust us — we know what we're doing",
      "Our process is proprietary and secret",
      "Results may vary (even if legally required, reframe positively)",
    ],
  },
  messagingPillars: [
    {
      name: "Strategic Clarity",
      whatItCommunicates: "We cut through complexity and give you a clear, actionable path forward — no jargon, no fluff.",
      whyItMatters: "In a market where every B2B consultancy promises 'results,' Acme Co's ability to simplify complexity is a rare and defensible advantage that builds trust before the first conversation.",
      exampleMessage: "Your brand has value. The problem isn't your work — it's your communication. We make what's true visible.",
      howToUse: "Lead with clarity in every touchpoint. On the website, use this pillar in the hero section and 'how we work' pages. In social content, share frameworks that simplify complex ideas. In sales conversations, demonstrate strategic clarity by diagnosing their problem in real-time.",
      channelExamples: { website: "We don't add complexity — we eliminate it. Acme Co turns brand confusion into strategic clarity.", social: "Most B2B companies know what they do. Very few can explain why it matters. Here's a 3-step framework to close that gap.", email: "Subject: The one thing standing between your brand and growth (it's not what you think)" },
      audienceVariations: [
        { audience: "Founders", adaptation: "Emphasize speed to clarity — founders are time-poor and want to see the path quickly.", exampleCopy: "You built something real. We make sure the world sees it that way — in weeks, not months." },
        { audience: "Marketing Leaders", adaptation: "Emphasize systematic clarity — marketing leaders need frameworks they can operationalize across teams.", exampleCopy: "Stop reinventing your messaging every quarter. We build the system once so your team can execute with confidence." },
      ],
      funnelStageUsage: { awareness: "Use frameworks and educational content to demonstrate clarity before they engage.", consideration: "Show how you simplify their specific problem — make their complexity feel solvable.", decision: "Present the clear path forward: timeline, deliverables, and expected outcomes in plain language." },
    },
    {
      name: "Proof-Backed Credibility",
      whatItCommunicates: "Every claim we make is backed by evidence, outcomes, and real-world results — not marketing speak.",
      whyItMatters: "B2B buyers are skeptical of consultants who talk big but can't prove impact. Acme Co's proof-first approach reduces friction at every decision point.",
      exampleMessage: "Acme Co clients close 35% more deals within 90 days — here's how we do it for companies like yours.",
      howToUse: "Never make a claim without a proof point within the same content piece. On the website, pair every benefit with a specific outcome. In case studies, lead with the result, not the process. On social, share client outcomes as narrative stories.",
      channelExamples: { website: "87% of clients report measurable ROI within 90 days. See their stories.", social: "A client came to us saying 'Our marketing isn't working.' 90 days later, their close rate jumped 35%. Here's what changed.", email: "Subject: How TechNova went from invisible to undeniable in 90 days" },
      audienceVariations: [
        { audience: "Founders", adaptation: "Lead with ROI and business outcomes — founders care about growth metrics.", exampleCopy: "Our last 10 clients averaged 40% increase in qualified leads within 90 days. Here's exactly how." },
        { audience: "Marketing Leaders", adaptation: "Lead with operational proof — what changed internally and externally.", exampleCopy: "TechNova's marketing team went from 'What should we post?' to a repeatable system generating 3x more qualified leads." },
      ],
      funnelStageUsage: { awareness: "Share outcome statistics and client results that establish authority without selling.", consideration: "Present detailed case studies showing the journey from problem to result.", decision: "Provide specific ROI projections based on their inputs and comparable client data." },
    },
    {
      name: "Client-First Partnership",
      whatItCommunicates: "We're not a vendor. We're a strategic partner who invests in your success as if it were our own.",
      whyItMatters: "The consultancy market is crowded with transactional relationships. Positioning as a partner creates longer engagements, higher retention, and better referrals.",
      exampleMessage: "We don't hand you a deck and disappear. We build alongside you until the strategy is working.",
      howToUse: "Show partnership in action, not just in words. On the website, describe the collaboration process. In proposals, frame deliverables as co-created. On social, spotlight client partnerships and collaborative wins.",
      channelExamples: { website: "We don't deliver reports — we build systems alongside you. Our average client relationship is 18 months because the work keeps compounding.", social: "The best brand strategies aren't handed down — they're built together. Here's what partnership actually looks like in B2B consulting.", email: "Subject: What our 18-month client retention rate says about how we work" },
      audienceVariations: [
        { audience: "Founders", adaptation: "Emphasize that you understand the founder's burden — you don't just advise, you roll up your sleeves.", exampleCopy: "You don't need another consultant who tells you what to do. You need a partner who helps you get it done." },
        { audience: "Marketing Leaders", adaptation: "Emphasize team enablement — you make their team better, not dependent.", exampleCopy: "We don't replace your team — we accelerate them. Every engagement leaves your marketing team more capable than before." },
      ],
      funnelStageUsage: { awareness: "Share philosophy pieces about what real partnership looks like in consulting.", consideration: "Describe your collaborative process — show how you co-create rather than dictate.", decision: "Offer a low-commitment first step that demonstrates partnership (strategy session, mini-audit)." },
    },
  ],
  contentPillars: [
    {
      name: "Industry Insights",
      description: "Original analysis and perspectives on B2B marketing trends, brand strategy shifts, and industry developments that affect Acme Co's target audience.",
      exampleTopics: ["Why 73% of B2B service companies struggle with brand differentiation", "The shift from SEO to AEO: what it means for B2B brands", "How the best B2B companies build trust before the first sales call", "The hidden cost of brand inconsistency in B2B services", "What Fortune 500 brand strategy looks like at the $1M revenue level"],
      suggestedFormats: ["LinkedIn article", "Blog post", "Email newsletter deep-dive", "Podcast guest appearance"],
      messagingPillarConnection: "Strategic Clarity",
      audienceMapping: "Founders and Marketing Leaders — both consume industry analysis to inform strategy.",
      channelDistribution: { primary: "LinkedIn — B2B decision-makers actively seek industry insights here", secondary: "Blog/SEO — captures search intent from people actively researching" },
      frequencyCadence: "2x per month",
      exampleHeadlines: ["The Brand Clarity Playbook: What B2B Leaders Get Wrong (and How to Fix It)", "3 Trends Reshaping B2B Brand Strategy in 2026", "Why Your B2B Marketing Feels Like Shouting Into the Void"],
    },
    {
      name: "Client Transformation Stories",
      description: "Real-world case studies and outcome narratives that demonstrate Acme Co's impact — written as stories, not brochures.",
      exampleTopics: ["How TechNova went from invisible to undeniable in 90 days", "The messaging rewrite that doubled a B2B firm's proposal win rate", "From referral-dependent to predictable pipeline: a brand strategy case study", "Before and after: what brand clarity actually looks like in practice"],
      suggestedFormats: ["Blog post / case study", "LinkedIn carousel", "Video testimonial", "Email case study breakdown"],
      messagingPillarConnection: "Proof-Backed Credibility",
      audienceMapping: "Founders (proof of ROI) and Marketing Team Members (proof of process).",
      channelDistribution: { primary: "Website — case studies are critical trust signals at the decision stage", secondary: "LinkedIn — transformation stories perform exceptionally well in B2B feeds" },
      frequencyCadence: "2x per month",
      exampleHeadlines: ["Case Study: How a 10-Person Agency Doubled Revenue with Brand Clarity", "The 3 Changes That Turned a 'Best-Kept Secret' Into an Industry Leader", "What Happens When a B2B Company Finally Gets Its Messaging Right"],
    },
    {
      name: "Frameworks & How-To Guides",
      description: "Practical, actionable frameworks that Acme Co's audience can apply immediately — demonstrates expertise through generosity.",
      exampleTopics: ["The 5-pillar brand alignment framework (simplified for founders)", "How to audit your website messaging in 15 minutes", "A step-by-step guide to building your first brand messaging hierarchy", "The content calendar template every B2B company needs", "How to create a proof point library from your existing clients"],
      suggestedFormats: ["LinkedIn carousel", "Downloadable PDF / lead magnet", "Email series", "Webinar / workshop"],
      messagingPillarConnection: "Strategic Clarity",
      audienceMapping: "Marketing Leaders and Marketing Team Members — both need actionable frameworks.",
      channelDistribution: { primary: "LinkedIn — carousels and how-to content drive high engagement in B2B", secondary: "Email — frameworks delivered as a series create ongoing engagement" },
      frequencyCadence: "Weekly",
      exampleHeadlines: ["The 15-Minute Messaging Audit: How to Tell If Your Brand Is Working", "Template: The Brand Messaging Hierarchy You Can Fill Out Today", "Framework: How to Choose the Right Marketing Channels for Your B2B Company"],
    },
    {
      name: "Behind the Strategy",
      description: "Transparent, insider-level content that shows how Acme Co thinks and works — building trust through vulnerability and process visibility.",
      exampleTopics: ["What we actually look at in a brand diagnostic (and why)", "The question we ask every client that changes the conversation", "Lessons from 200+ brand strategy engagements", "Why we turned down a $50K project (and what it taught us)", "The tools and processes we use to build brand strategies"],
      suggestedFormats: ["LinkedIn post", "Newsletter", "Podcast episode / guest appearance", "Short-form video"],
      messagingPillarConnection: "Client-First Partnership",
      audienceMapping: "Founders — they connect with authenticity and the human behind the business.",
      channelDistribution: { primary: "LinkedIn — personal/authentic content resonates strongly with B2B founders", secondary: "Newsletter — behind-the-scenes content builds deep loyalty" },
      frequencyCadence: "1x per week",
      exampleHeadlines: ["The #1 Mistake I See in Every B2B Brand Audit (It's Not What You Think)", "What Our Client Intake Process Reveals About Brand Health", "Why We Stopped Calling Ourselves a 'Marketing Agency'"],
    },
    {
      name: "Tools & Templates",
      description: "Ready-to-use resources that provide immediate value and position Acme Co as the go-to source for brand strategy tools.",
      exampleTopics: ["Brand messaging template: fill in the blanks for your core message", "The B2B content calendar template we use with every client", "Competitive positioning worksheet: find your whitespace", "Brand voice guidelines template", "The testimonial collection script that actually works"],
      suggestedFormats: ["Downloadable template / lead magnet", "Interactive tool", "Email opt-in", "Notion / Google Docs template"],
      messagingPillarConnection: "Proof-Backed Credibility",
      audienceMapping: "Marketing Team Members — they need tools they can use immediately.",
      channelDistribution: { primary: "Website — downloadable resources convert visitors to leads", secondary: "LinkedIn — template previews drive traffic and downloads" },
      frequencyCadence: "1x per month",
      exampleHeadlines: ["Download: The Brand Messaging Hierarchy Template", "Free Tool: Score Your Brand Alignment in 5 Minutes", "Template: The Testimonial Request Email That Gets a 60% Response Rate"],
    },
  ],
  visualDirection: {
    colorPalette: [
      { name: "Navy", hex: "#021859", usage: "Headlines, key text, primary CTAs — authority, trust, depth" },
      { name: "Bright Blue", hex: "#07B0F2", usage: "Highlights, links, secondary CTAs — clarity, action, optimism" },
      { name: "White", hex: "#FFFFFF", usage: "Backgrounds — confidence, space, professionalism" },
      { name: "Light Gray", hex: "#F8FAFC", usage: "Section backgrounds — subtle separation, breathing room" },
    ],
    typographyTone: "Clean, modern sans-serif. Lato or similar. Headlines: Bold but not aggressive. Body: Readable, generous line height. Avoid: Script fonts, overly decorative type, all-caps body text.",
    visualConsistencyPrinciples: "Every visual should feel like it came from the same brain. When in doubt, simpler is better. Photography should feature real people in real work contexts — not stock poses. Icons and illustrations should clarify, not decorate.",
  },
  conversionStrategy: {
    howTrustIsBuilt: "Trust is built through specificity and proof. Every claim should be supported by evidence. Every promise should be kept. Every interaction should demonstrate competence, not just claim it. Consistency across touchpoints compounds trust over time.",
    howClarityDrivesAction: "When visitors immediately understand what you do, who you help, and why you\u2019re different, the decision to engage becomes obvious. Remove friction by removing confusion. Make the next step clear and low-risk.",
    ctaHierarchy: [
      { level: "Primary", action: "Book a Strategy Call", context: "High intent, ready to engage", template: "CTA text: \u2018Book a Free Strategy Call \u2192\u2019\nPlacement: Homepage hero, services page, contact page\nSupporting copy: \u2018In 15 minutes, we\u2019ll diagnose your biggest brand gap and outline a clear next step. No pitch, no pressure.\u2019" },
      { level: "Secondary", action: "Download a Resource", context: "Lower commitment, building trust", template: "CTA text: \u2018Get the Free Brand Clarity Checklist \u2192\u2019\nPlacement: Blog posts, homepage sidebar, exit intent popup\nSupporting copy: \u2018Find out if your marketing is telling the truth about your brand. 7 questions, 2 minutes.\u2019" },
      { level: "Tertiary", action: "Subscribe to Newsletter", context: "Staying connected, not ready to act", template: "CTA text: \u2018Get Weekly Brand Insights \u2192\u2019\nPlacement: Blog footer, About page\nSupporting copy: \u2018One actionable brand insight per week. No fluff. Unsubscribe anytime.\u2019" },
    ],
    emailNurtureTemplate: {
      description: "3-email welcome sequence for new leads who download your resource:",
      emails: [
        { timing: "Immediately", subject: "Here\u2019s your Brand Clarity Checklist (+ a quick insight)", purpose: "Deliver value and establish expertise", body: "Hi [Name],\n\nHere\u2019s your checklist \u2014 [link].\n\nQuick insight before you dive in: Question #3 (\u2018Is your value proposition different from your top 3 competitors?\u2019) is where 80% of B2B companies discover their biggest blind spot.\n\nIf you want to chat through your results, I\u2019m here.\n\n\u2014 [Your name]" },
        { timing: "Day 3", subject: "How TechNova went from invisible to undeniable in 90 days", purpose: "Build credibility with a specific example", body: "Hi [Name],\n\nTechNova had the same challenge many B2B service companies face: great work, zero visibility.\n\nHere\u2019s what we changed:\n\u2022 Rewrote their homepage headline (5-second clarity test)\n\u2022 Surfaced 3 testimonials at decision points\n\u2022 Created one lead magnet that captured 200+ emails\n\nResult: 47% increase in qualified leads in 90 days.\n\nFull case study: [link]\n\n\u2014 [Your name]" },
        { timing: "Day 7", subject: "Quick question about your brand clarity results", purpose: "Soft conversion ask", body: "Hi [Name],\n\nHow did the checklist go? If you found gaps (most people do), here\u2019s an option:\n\nI have a few 15-minute strategy call slots open this week. We\u2019ll look at your specific situation and I\u2019ll give you one concrete recommendation you can act on immediately.\n\nNo pitch, no obligation. Book here: [Calendly link]\n\n\u2014 [Your name]" }
      ]
    }
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
  executionPromptPack: {
    packName: "Execution Prompt Pack",
    description: "Campaign, content, and messaging execution prompts that keep every touchpoint aligned with your brand platform. These turn your brand foundation into consistent, on-brand output across every channel.",
    promptCount: 8,
    prompts: [
      { category: "Campaign Messaging", title: "Campaign Messaging System Builder", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.", prompt: "You are a campaign strategist building a complete messaging system for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Brand Voice: Insightful, confident, supportive, clear\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n- Message Pillars: Strategic clarity, Proof-backed credibility, Authentic authority\n- Campaign Goal: [DESCRIBE — e.g., launch, awareness, lead gen, rebrand]\n- Target Audience Segment: B2B service company founders (10–100 employees)\n\nBuild a complete campaign messaging kit:\n\n1. Campaign Concept — a unifying creative theme that reflects our Sage personality\n2. Campaign Tagline — 5–8 words, memorable and ownable\n3. Three Headline Variations — different angles on the same theme for testing\n4. Body Copy Template — a flexible structure: hook → problem → our approach → proof → CTA. Write one complete example.\n5. CTA Spectrum — 5 calls-to-action ranging from soft (learn more) to direct (buy/hire), all in brand voice\n6. Social Proof Integration — how to weave testimonials and results in our Sage tone (provide templates)\n7. Objection Anticipation — top 3 likely objections this audience has, with on-brand responses\n\nEvery element should feel like it came from the same brand.", whyItMatters: "Campaigns fail when each touchpoint sounds like a different company wrote it. A messaging system ensures your ad, your email, your landing page, and your sales follow-up all feel like one conversation." },
      { category: "Campaign Messaging", title: "Email Sequence Architect", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.", prompt: "You are an email strategist designing a 5-email sequence for Acme Co.\n\nBrand voice: Insightful, confident, supportive, clear\nArchetype: The Sage / The Caregiver\nSequence Purpose: [welcome series / nurture / launch / re-engagement / post-purchase]\nAudience: B2B service company founders and marketing leaders\nDesired Action: Book a discovery call\n\nFor each email:\n1. Send timing\n2. Email purpose\n3. Emotional progression\n4. Subject line + A/B variant\n5. Preview text\n6. Body copy structure\n7. CTA button text\n8. P.S. line\n\nAlso include: the thread, escalation strategy, and re-engagement fork.", whyItMatters: "Disconnected emails erode brand trust. A sequence with a narrative arc converts significantly better than random sends." },
      { category: "Content Execution", title: "Social Media Content System", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.", prompt: "You are a social media strategist building a repeatable content system for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Voice: Insightful, confident, supportive, clear\n- Platforms: LinkedIn (primary)\n- Posting: 3x per week\n\nBuild:\n1. Content Pillars (4–5 categories)\n2. Signature Formats (3 recurring templates with examples)\n3. Four-Week Rotation calendar\n4. Hook Library (10 first lines)\n5. CTA Toolkit (8 CTAs for social)", whyItMatters: "A content system eliminates ‘what should I post?’ and ensures your social presence tells a coherent brand story." },
      { category: "Content Execution", title: "Website Copy Alignment Auditor", instruction: "Paste your current website copy where indicated.", prompt: "You are a brand-focused copywriter auditing Acme Co's website.\n\nBrand standards:\n- Archetype: The Sage / The Caregiver\n- Voice: Insightful, confident, supportive, clear\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n\nPaste page copy and audit against: Voice Consistency, Positioning Clarity, Message Pillar Presence, Emotional Arc, CTA Strength, Proof Integration, Differentiation (score each 1–10).", whyItMatters: "Your website is the most viewed expression of your brand. If it doesn't reflect your positioning, nothing downstream will either." },
      { category: "Messaging Consistency", title: "Brand Consistency Checker", instruction: "Use this prompt every time you create content.", prompt: "You are a brand QA editor for Acme Co. Check content for brand consistency.\n\nBrand standards:\n- Archetype: The Sage / The Caregiver\n- Voice: Insightful, confident, supportive, clear\n- On-Brand: Clarity, evidence, insight, strategic, partnership, proven\n- Off-Brand: Crush it, game-changing, ninja, guru, leverage, synergy\n\n[PASTE DRAFT] — Score: Voice, Message, Audience, Differentiation, Action (1–10 each).", whyItMatters: "Brand consistency is a system, not a gut feeling. This turns 'does this feel right?' into a measurable standard." },
      { category: "Messaging Consistency", title: "Sales-to-Brand Voice Alignment Script", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.", prompt: "You are a sales enablement consultant for Acme Co.\n\nCreate on-brand scripts for: Discovery Call Opening, 'What Do You Do?' Response, Differentiator Delivery, Objection Handling, Proposal Introduction, Follow-Up Email.\n\nInclude 'say this / not that' for each.", whyItMatters: "The fastest way to break brand trust is when sales sounds nothing like marketing." },
      { category: "Content Execution", title: "Blog & Long-Form Content Framework", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.", prompt: "You are a content strategist for Acme Co.\n\nCreate: Title Options (3), Content Structure with proof integration points, CTA Strategy, Distribution Plan (social teasers, email intro, repurposing suggestions).\n\nTopic: [SPECIFIC TOPIC]\nFormat: [Blog / Guide / White paper]\nGoal: [Thought leadership / SEO / Lead gen]", whyItMatters: "Long-form content is where brand authority is built." },
      { category: "Campaign Messaging", title: "Lead Magnet & Conversion Asset Builder", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.", prompt: "You are a conversion strategist for Acme Co.\n\nBuild: Format Recommendation, Title Options (3), Content Outline (5–7 sections), Design Direction, Delivery Sequence (3 emails), Landing Page Copy.\n\nAudience Pain Point: [SPECIFIC PROBLEM]\nNext Step After Download: Book a discovery call", whyItMatters: "A lead magnet is often someone's first real brand experience. Make it unmistakably yours." },
    ],
  },
  executionGuardrails: {
    whatToMaintain: [
      "Positioning statement and core message — these are foundational",
      "Voice traits: clear, confident, supportive, direct, insightful",
      "Visual consistency: navy + bright blue, clean sans-serif, generous white space",
      "Proof-first approach: claims always backed by evidence",
      "Archetype alignment: Sage + Caregiver in every interaction",
    ],
    whatToAvoid: [
      "Generic marketing language that could apply to anyone",
      "Promising things you can't deliver consistently",
      "Copying competitor tactics without strategic alignment",
      "Chasing trends that don't fit your archetype",
      "Inconsistent voice across channels",
    ],
    driftIndicators: [
      "Team members unsure how to describe what you do",
      "Marketing materials that feel disconnected from each other",
      "Prospects surprised by what you actually deliver",
      "Feedback that your marketing feels generic or unclear",
      "Metrics that show traffic but not conversion",
    ],
  },

  // ─── Blueprint+ Exclusive Content ───
  strategicOverview: {
    wherePositioned: "Acme Co is positioned to become the definitive brand clarity partner for B2B service companies in the $1M-$50M revenue range. The market is saturated with tactical marketing agencies but underserved by strategic brand partners who combine clarity with execution. This gap is your opportunity.",
    leverageCreated: "This Blueprint+ creates leverage in three ways: (1) A messaging system that scales across channels without losing consistency, (2) Audience segmentation that enables personalized outreach without personalized effort, (3) An AI prompt library that allows anyone on your team to produce on-brand content. The result: more output, less chaos, compounding brand equity.",
  },
  advancedAudienceSegmentation: {
    coreSegments: [
      { segment: "Founders (Decision Makers)", messagingDifferentiation: "Focus on strategic outcomes: clarity, confidence, competitive advantage. They care about results, not process. Lead with transformation, not methodology.", channelRelevance: "LinkedIn (primary), Email (nurture), Direct outreach (high-value), Podcast appearances" },
      { segment: "Marketing Leaders (Influencers)", messagingDifferentiation: "Focus on execution and tools: frameworks, templates, systems. They need ammunition to present internally and resources to do their job better.", channelRelevance: "LinkedIn, Email, Blog/SEO, Webinars, Community forums" },
      { segment: "Marketing Team Members (Users)", messagingDifferentiation: "Focus on clarity and confidence: how to know if they're doing it right. They want guardrails and examples, not theory.", channelRelevance: "Blog/SEO, Social (educational content), Templates and downloads, Newsletter" },
    ],
  },
  advancedMessagingMatrix: {
    byAudience: [
      { audience: "Founders", message: "Your brand has value. The problem is communication, not substance. We make what\u2019s true visible.", exampleCopy: "LinkedIn ad: \u2018You didn\u2019t build your company by guessing. Stop guessing with your marketing. Acme Co brings the same strategic clarity to your brand that you bring to your clients.\u2019" },
      { audience: "Marketing Leaders", message: "Stop reinventing the wheel. We give you the system and language to execute with confidence.", exampleCopy: "Email subject: \u2018The brand messaging cheat sheet your team actually needs\u2019 \u2014 Body: \u2018Your team knows the product. They just need the words. This framework gives them both.\u2019" },
      { audience: "Marketing Teams", message: "Know exactly what to say, how to say it, and why it works. Clarity removes guesswork.", exampleCopy: "Blog title: \u20185 Brand Voice Templates That Make Every Piece of Content Sound Like Your Brand\u2019 \u2014 Practical, immediately usable, demonstrates expertise." },
    ],
    byFunnelStage: {
      awareness: { message: "Most B2B marketing fails because it\u2019s disconnected from reality. There\u2019s a better way.", exampleCopy: "LinkedIn post hook: \u2018Your competitors aren\u2019t better than you. They\u2019re just better at saying what they do. Here\u2019s the 1 test that reveals if your brand is invisible:\u2019" },
      consideration: { message: "WunderBrand Snapshot™ reveals where your brand stands today. WunderBrand Snapshot+™ shows you why and what to do about it.", exampleCopy: "Retargeting ad: \u2018You scored your brand. Now understand what it means. WunderBrand Snapshot+™ gives you the diagnosis, the roadmap, and the AI tools to fix it.\u2019" },
      decision: { message: "WunderBrand Blueprint™ is your operating system. It\u2019s not a document you file \u2014 it\u2019s a tool you use daily.", exampleCopy: "Email CTA: \u2018Your WunderBrand Blueprint™ includes 16 AI prompts calibrated to your brand, a messaging system, and a 90-day roadmap. It\u2019s not a report \u2014 it\u2019s the playbook. See a sample \u2192\u2019" },
      retention: { message: "Your brand evolves. We help you maintain clarity as you scale without starting over.", exampleCopy: "Client email: \u2018It\u2019s been 90 days since your Blueprint. Here\u2019s what to review, what to update, and 3 new prompts based on your growth.\u2019" },
    },
    byChannel: {
      website: { guidance: "Clear, confident, benefit-focused. Lead with outcomes, support with methodology. Social proof at every decision point.", exampleCopy: "Hero section: \u2018Acme Co helps B2B service companies turn invisible expertise into visible authority \u2014 and authority into revenue.\u2019 + testimonial + primary CTA + secondary CTA" },
      email: { guidance: "Personal, insightful, action-oriented. Each email should deliver value and end with one clear next step.", exampleCopy: "Subject: \u2018The 5-second test your homepage is probably failing\u2019 \u2014 Body: One insight, one example, one CTA. Under 200 words." },
      social: { guidance: "Thought leadership that demonstrates expertise. Teach, don\u2019t pitch. Engage, don\u2019t broadcast.", exampleCopy: "LinkedIn format: Hook (1 line) + Story or insight (3\u20135 lines) + Takeaway (1 line) + Question or soft CTA (1 line). Total: under 150 words." },
      paid: { guidance: "Problem-aware targeting. \u2018Frustrated that your marketing doesn\u2019t reflect your true value?\u2019 + clear CTA.", exampleCopy: "Ad copy: \u2018Your expertise is real. Your marketing doesn\u2019t show it. Take the free 2-minute WunderBrand Snapshot™ \u2014 find out where your brand stands. [Start Free \u2192]\u2019" },
      sales: { guidance: "Listen first. Diagnose before prescribing. Make the prospect feel understood, not sold to.", exampleCopy: "Discovery call opener: \u2018Before I tell you anything about us, I\u2019d love to understand your situation. What\u2019s the biggest frustration with your current marketing?\u2019" },
    },
  },
  brandArchitectureExpansion: {
    howBrandCanStretch: "Acme Co can expand into adjacent offerings (consulting, courses, community) without brand confusion if each extension maps back to the core promise: clarity converts. The test: does this new offering help B2B service companies close the gap between what they deliver and how they're perceived? If yes, it fits.",
    subBrandAlignment: "If product tiers become distinct brands (e.g., \u2018Acme Snapshot\u2019 vs. \u2018Acme Blueprint\u2019), maintain visual consistency and voice traits. Differentiate by outcome level, not by brand personality. Same Sage archetype, different depth of transformation.",
  },
  campaignContentStrategy: {
    campaignThemes: [
      "The Clarity Gap — Why great companies stay invisible",
      "Marketing That Tells the Truth — Authenticity as competitive advantage",
      "From Confusion to Confidence — The transformation journey",
      "Proof Over Promise — Why specificity wins",
    ],
    narrativeArcs: [
      "The founder who built something great but couldn't explain it — until they found clarity",
      "The marketing leader who was tired of tactics without strategy — and discovered alignment",
      "The company that thought they had a marketing problem but actually had a positioning problem",
    ],
    longTermStorytelling: "Over 12+ months, build a body of content that establishes Acme Co as the definitive voice on B2B brand clarity. Document client transformations. Share methodology openly. Create resources competitors can't match. The goal: when someone thinks ‘brand clarity for B2B,’ they think Acme Co.",
  },
  advancedPromptLibrary: {
    packName: "Advanced Prompt Library",
    description: "Persona-based, funnel-stage, and campaign system prompts for sophisticated brand execution. These give you a strategic operating system — not just tools, but interconnected frameworks that scale your brand across audiences, channels, and growth stages.",
    promptCount: 12,
    prompts: [
      { category: "Persona-Based Messaging", title: "Audience Persona Messaging Map", instruction: "Run this prompt once per persona (typically 2–4 personas). Each output creates a complete messaging playbook for one audience segment.", prompt: "You are a persona-based messaging strategist for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Voice: Insightful, confident, supportive, clear\n- Core Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n- Message Pillars: Strategic clarity, Proof-backed credibility, Authentic authority\n\nPersona: [PERSONA NAME]\n- Role/Title: [ROLE]\n- Key Pain Points: [TOP 3]\n- Goals/Aspirations: [TOP 3]\n- Decision Drivers: [WHAT INFLUENCES THEIR BUYING DECISION]\n- Primary Objections: [TOP 2 HESITATIONS]\n- Content Channels: [WHERE THEY CONSUME CONTENT]\n- Awareness Level: [Unaware / Problem-Aware / Solution-Aware / Product-Aware]\n\nCreate a complete persona messaging map:\n1. Persona-Specific Value Prop\n2. Messaging Angle\n3. Hook Library — 5 attention-grabbing openers\n4. Pain-to-Promise Bridge\n5. Proof Strategy\n6. Objection Scripts\n7. Content Journey — 5-step path from first touch to conversion\n8. Micro-Copy Library — 3 headlines, 3 email subject lines, 3 ad hooks, and 3 CTAs\n\nThe brand voice stays constant. The emphasis, examples, and entry points shift for this persona.", whyItMatters: "One message for all audiences is a message for no one. Persona maps let you personalize at scale without fragmenting your brand." },
      { category: "Persona-Based Messaging", title: "Stakeholder Communication Toolkit", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.", prompt: "You are a brand communications strategist building a stakeholder messaging toolkit for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n- Voice: Insightful, confident, supportive, clear\n\nCreate tailored messaging for four stakeholder groups:\n\n1. CUSTOMERS — Retention & Deepening\n2. PARTNERS & COLLABORATORS — Alignment & Co-creation\n3. TEAM & TALENT — Internal Brand Alignment\n4. INVESTORS / ADVISORS — Strategic Narrative\n\nEach section: 2–3 templates written in full, in our Sage voice at the appropriate formality level.", whyItMatters: "Your brand speaks to more audiences than just buyers. Inconsistency across stakeholders creates confusion. Consistency builds a reputation that compounds." },
      { category: "Funnel-Stage Messaging", title: "Full-Funnel Messaging Architecture", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool. This prompt maps your complete buyer journey with stage-specific messaging.", prompt: "You are a full-funnel brand strategist for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Voice: Insightful, confident, supportive, clear\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n- Value Proposition: Diagnostic-first brand clarity that turns invisible expertise into visible authority\n- Message Pillars: Strategic clarity, Proof-backed credibility, Authentic authority\n- Primary Audience: B2B service company founders and marketing leaders\n- Primary Offer: WunderBrand Suite™\n\nMap the complete messaging architecture across 5 funnel stages:\n\nSTAGE 1: UNAWARE → Problem Recognition\nSTAGE 2: PROBLEM-AWARE → Solution Exploration\nSTAGE 3: SOLUTION-AWARE → Brand Preference\nSTAGE 4: PRODUCT-AWARE → Decision & Conversion\nSTAGE 5: CUSTOMER → Advocacy & Expansion\n\nFor each stage provide: audience mindset, messaging goal, 3 content angles, channel recommendations, and one fully written example piece.\n\nInclude transition triggers — what signals someone is moving from one stage to the next.", whyItMatters: "Most brands have decent awareness messaging and decent sales pages but nothing in between. A full-funnel architecture ensures you're speaking to every stage, not just the top and bottom." },
      { category: "Funnel-Stage Messaging", title: "Retargeting & Re-engagement Message Library", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.", prompt: "You are a re-engagement messaging specialist for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Voice: Insightful, confident, supportive, clear\n- Value Prop: Diagnostic-first brand clarity that turns invisible expertise into visible authority\n\nCreate on-brand re-engagement messaging for these scenarios:\n\n1. WEBSITE VISITOR (no conversion)\n2. EMAIL SUBSCRIBER (gone cold)\n3. LEAD (downloaded content but didn't convert)\n4. PAST CLIENT (hasn't returned)\n5. ABANDONED CART / INCOMPLETE SIGNUP\n\nAll messaging must feel like our Sage archetype — never desperate, spammy, or guilt-tripping.", whyItMatters: "Most re-engagement messaging is generic and off-brand. On-brand re-engagement actually rebuilds trust instead of eroding it." },
      { category: "Campaign Systems", title: "Product/Service Launch Campaign System", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool. This creates a complete launch campaign with pre-launch, launch, and post-launch phases.", prompt: "You are a launch campaign strategist for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Voice: Insightful, confident, supportive, clear\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n\nLaunch details:\n- What's launching: [PRODUCT/SERVICE/OFFER]\n- Launch date: [DATE]\n- Target audience: B2B service company founders\n\nBuild a complete launch system:\n\nPRE-LAUNCH (2–4 weeks before): Teaser campaign, email sequence, social countdown, waitlist copy\nLAUNCH WEEK: Launch day email, social series (5 posts), paid ad copy (3 variations), social proof strategy\nPOST-LAUNCH (2–4 weeks after): Follow-up for non-converters, social proof amplification, retargeting\n\nInclude a messaging consistency guide for the entire launch.", whyItMatters: "Launches fail when they're treated as a single event instead of a system. This ensures every phase is on-brand." },
      { category: "Campaign Systems", title: "Quarterly Campaign Planning Framework", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool. Run quarterly to maintain strategic alignment.", prompt: "You are a strategic marketing planner for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n- Message Pillars: Strategic clarity, Proof-backed credibility, Authentic authority\n\nQuarterly context:\n- Quarter: [Q1/Q2/Q3/Q4] [YEAR]\n- Business priorities: [TOP 3]\n- Key offer: [PRIMARY PRODUCT/SERVICE]\n\nBuild a quarterly campaign plan:\n1. Quarterly Theme — a unifying narrative\n2. Campaign Calendar — month-by-month focus\n3. Content Plan — 12 key content pieces (4/month)\n4. Email Plan — sends mapped to phases\n5. Social Plan — weekly themes\n6. Measurement Framework\n7. Resource Requirements", whyItMatters: "Quarterly planning prevents the 'random acts of marketing' trap. When every tactic traces back to positioning, growth compounds." },
      { category: "Advanced Brand Strategy", title: "Brand Architecture & Extension Evaluator", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool. Use when considering new products, services, or sub-brands.", prompt: "You are a brand architecture consultant for Acme Co.\n\nCurrent brand platform:\n- Archetype: The Sage / The Caregiver\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n- Core Audience: B2B service company founders and marketing leaders\n- Current Offerings: WunderBrand Snapshot™ (Free), WunderBrand Snapshot+™, WunderBrand Blueprint™, WunderBrand Blueprint+™, Managed Marketing, AI Consulting\n\nProposed extension:\n- What's being considered: [NEW PRODUCT / SERVICE / SUB-BRAND]\n- Target audience: [SAME OR DIFFERENT FROM CORE]\n- Price positioning: [ABOVE / SAME / BELOW]\n\nEvaluate:\n1. Archetype Alignment Test (1–10)\n2. Positioning Stretch Test (1–10)\n3. Audience Coherence Test (1–10)\n4. Architecture Recommendation — same brand / sub-brand / endorsed / separate\n5. Messaging Bridge\n6. Risk Assessment — top 3 risks with mitigation strategies", whyItMatters: "Every brand extension either strengthens or dilutes your positioning. This ensures you evaluate through a brand lens." },
      { category: "Advanced Brand Strategy", title: "Competitive Positioning War Room", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool. Use for strategic planning or when competitor activity changes.", prompt: "You are a competitive strategy consultant for Acme Co.\n\nOur brand:\n- Archetype: The Sage / The Caregiver\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n- Key Strengths: Clear positioning (16/20), Messaging clarity (15/20)\n- Key Gaps: Credibility signals (13/20), Visibility focus (14/20)\n\nCompetitive landscape:\n- Competitor 1: [NAME] — [BRIEF DESCRIPTION]\n- Competitor 2: [NAME] — [BRIEF DESCRIPTION]\n- Competitor 3: [NAME] — [BRIEF DESCRIPTION]\n\nBuild:\n1. Positioning Map — plot us and competitors, identify white space\n2. Archetype Contrast — what we can say that they can't\n3. Messaging Opportunities — 2 offensive, 2 defensive, 1 flanking\n4. Content Strategy Response\n5. Differentiation Talking Points — 3 scripts\n6. 90-Day Competitive Action Plan", whyItMatters: "Competitive strategy isn't about copying — it's about owning a position they can't take from you." },
      { category: "Campaign Systems", title: "Referral & Advocacy Campaign Builder", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.", prompt: "You are a brand advocacy strategist for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Voice: Insightful, confident, supportive, clear\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n\nBuild a referral and advocacy campaign:\n\n1. Testimonial Collection System — timing triggers, email templates, specific prompts\n2. Case Study Pipeline — selection criteria, interview questions, structure template\n3. Referral Program Messaging — positioning in Sage voice, ask templates, welcome messaging\n4. Brand Advocate Nurture — identification criteria, exclusive content, co-creation opportunities\n\nNothing should feel like a referral 'program.' It should feel natural for our Sage brand.", whyItMatters: "Referrals are the highest-converting, lowest-cost channel — but only when the experience matches your brand personality." },
      { category: "Persona-Based Messaging", title: "Decision-Maker vs. Influencer Messaging Split", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool.", prompt: "You are a B2B messaging strategist for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Voice: Insightful, confident, supportive, clear\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n\nBuying committee:\n- Decision Maker: [TITLE/ROLE]\n- Influencer: [TITLE/ROLE]\n- End User: [TITLE/ROLE]\n- Gatekeeper: [TITLE/ROLE]\n\nFor each stakeholder, create:\n1. Primary Concern\n2. Messaging Angle\n3. Proof Type\n4. Objection Profile\n5. Channel Strategy\n6. Content Assets — 2–3 pieces per role\n7. Internal Champion Toolkit\n\nThen create a 'universal message' and a routing strategy.", whyItMatters: "In complex sales, different people need different reasons. This ensures personalization without fragmentation." },
      { category: "Advanced Brand Strategy", title: "Brand Crisis & Reputation Response Playbook", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool. Build this proactively.", prompt: "You are a brand crisis communications consultant for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Voice: Insightful, confident, supportive, clear\n- Values: Clarity, evidence-based insight, genuine helpfulness, intellectual honesty\n\nBuild a crisis and reputation response playbook:\n\n1. Crisis Tiers — 3 levels (Minor, Moderate, Major) with examples\n2. For each tier: response timeline, channel strategy, statement templates in Sage voice\n3. Proactive Reputation Building — monthly actions\n4. Response Principles — 5 non-negotiable rules\n5. Recovery Messaging — Week 1, Weeks 2–4, Month 2+\n\nThe goal: your response reinforces brand values, not contradicts them.", whyItMatters: "Brands are defined not by what they say on good days but by how they respond on bad ones." },
      { category: "Campaign Systems", title: "Annual Brand Strategy & Measurement Framework", instruction: "Copy and paste into ChatGPT, Claude, or any AI tool. Use for annual planning.", prompt: "You are a brand strategy director for Acme Co.\n\nBrand platform:\n- Archetype: The Sage / The Caregiver\n- Positioning: We help B2B service companies close the gap between what they deliver and how they're perceived\n- Current Alignment Score: 72\n\nBusiness context:\n- Revenue goal: [ANNUAL TARGET]\n- Growth stage: Growth\n- Team size: [NUMBER]\n- Marketing budget: [LOW / MEDIUM / HIGH]\n\nBuild an annual brand strategy framework:\n\n1. Brand Health Scorecard — 6 metrics to track quarterly\n2. Annual Theme — one overarching narrative\n3. Quarterly Breakdown — focus, initiative, milestone per quarter\n4. Brand Investment Priorities — must-do, should-do, could-do\n5. Brand Governance — monthly review, quarterly audit, annual refresh\n6. Team Alignment — training, inspiration share, decision filter", whyItMatters: "Brand building without measurement is hope. This connects your brand platform to business outcomes." },
    ],
  },
  measurementOptimization: {
    whatToTrack: [
      "WunderBrand Snapshot™ completion rate (awareness → conversion)",
      "WunderBrand Snapshot™ → WunderBrand Snapshot+™ upgrade rate",
      "Time-to-close for WunderBrand Blueprint™ sales",
      "Content engagement rate by pillar theme",
      "Branded search volume over time",
      "Client retention and expansion",
    ],
    signalsThatMatter: [
      "Prospects referencing your content before first call = content is working",
      "Decrease in \u2018What exactly do you do?\u2019 questions = positioning is landing",
      "Increase in inbound qualified leads = visibility + credibility compounding",
      "Clients staying 12+ months = delivery matches promise",
      "Referrals from existing clients = trust earned",
    ],
    howToAdapt: "Review metrics quarterly. If conversion is down but traffic is up, the problem is messaging or credibility — not visibility. If traffic is down, revisit content strategy. Never change positioning based on a single metric; look for patterns across 90+ days. Brand changes compound slowly — give strategy time to work before pivoting.",
  },
  strategicGuardrails: {
    whatNeverChanges: [
      "Core promise: Clarity converts",
      "Primary archetype: The Sage",
      "Target audience: B2B service companies",
      "Voice traits: Clear, confident, supportive, direct, insightful",
      "Proof-first approach: Claims always backed by evidence",
    ],
    whatCanEvolve: [
      "Specific language and phrasing (test and optimize)",
      "Channel mix (follow where audience attention shifts)",
      "Product offerings (as long as they map to core promise)",
      "Visual details (refresh within brand system)",
      "Tactical campaigns (seasonal, trend-responsive)",
    ],
    maintainingIntegrityAtScale: "As you grow, brand drift becomes the biggest risk. Prevent it by: (1) Making this WunderBrand Blueprint+™ the onboarding foundation for every hire and contractor, (2) Reviewing content against guardrails monthly, (3) Empowering team members to flag inconsistencies without hierarchy, (4) Updating the WunderBrand Blueprint+™ annually to reflect learnings while maintaining core identity.",
  },
  competitivePositioning: {
    positioningAxis1: { label: "Service Depth", lowEnd: "Tactical Execution", highEnd: "Strategic Advisory" },
    positioningAxis2: { label: "Client Focus", lowEnd: "Generalist (All Industries)", highEnd: "Specialist (B2B Services)" },
    players: [
      { name: "Acme Co", position: { x: "high", y: "high" }, narrative: "Acme Co occupies the strategic-advisory, B2B-specialist quadrant \u2014 a defensible position because it requires both deep expertise and industry-specific credibility." },
      { name: "Large Agency Incumbents", position: { x: "mid", y: "low" }, narrative: "Full-service agencies offer breadth but lack the specialized depth that B2B service companies need." },
      { name: "Freelance Strategists", position: { x: "high", y: "mid" }, narrative: "Individual strategists can offer deep thinking but struggle with execution capacity and scalability." },
      { name: "Marketing Automation Platforms", position: { x: "low", y: "low" }, narrative: "Tool-first solutions provide execution infrastructure but no strategic guidance \u2014 they\u2019re complementary to Acme Co, not competitive." },
    ],
    strategicWhitespace: "The intersection of \u2018strategic advisory + B2B specialist + execution capability\u2019 is remarkably uncrowded. Most competitors are either strategic but generalist, or specialized but tactical. Acme Co can own this space.",
    differentiationSummary: "Acme Co\u2019s position is defensible because it requires both deep B2B expertise AND strategic capability \u2014 a combination that takes years to build and is difficult for generalist agencies to replicate.",
    vulnerabilities: "Acme Co is most exposed to well-funded boutique firms that decide to specialize in B2B services. The primary defense is building visible thought leadership and a portfolio of named client results.",
    movementPlan: "In 12 months, Acme Co should aim to solidify the \u2018high-high\u2019 quadrant position by publishing 3\u20135 deep case studies, launching a thought leadership platform, and formalizing its methodology \u2014 making the position increasingly difficult to replicate.",
  },
  strategicTradeOffs: [
    { decision: "Audience Focus: Serve all B2B companies vs. specialize in B2B service companies", context: "Acme Co\u2019s positioning is already strongest with B2B service companies, but broadening could accelerate revenue.", optionA: { label: "All B2B Companies", description: "Expand targeting to include B2B SaaS, manufacturing, and e-commerce alongside services.", pros: ["Larger addressable market", "More lead sources", "Diversified revenue"], cons: ["Diluted positioning", "Harder to build authority", "Generic messaging"], bestIf: "Revenue is the primary short-term goal.", exampleBrand: "HubSpot started broad and became a $30B company by serving everyone \u2014 but invested hundreds of millions in content to maintain relevance across audiences." }, optionB: { label: "B2B Service Companies Only", description: "Maintain laser focus on the niche where Acme Co\u2019s expertise is deepest.", pros: ["Sharper positioning", "Faster authority building", "Higher close rates", "Premium pricing"], cons: ["Smaller initial market", "Revenue concentration risk"], bestIf: "Building a premium, defensible brand is the priority.", exampleBrand: "Bain & Company specialized in strategy consulting and now commands $10B+ in revenue from a narrow niche \u2014 proof that depth beats breadth for premium positioning." }, recommendation: "Based on Acme Co\u2019s current positioning strength (16/20) and strategic goals, Option B is recommended. The positioning clarity already exists internally \u2014 narrowing the external focus will accelerate authority building and justify premium pricing.", revisitWhen: "When Acme Co has 20+ named B2B service company clients and is ready to expand into adjacent verticals." },
    { decision: "Growth Strategy: Depth (fewer clients, deeper engagement) vs. Breadth (more clients, lighter touch)", context: "This trade-off directly impacts service delivery model, hiring, and revenue forecasting.", optionA: { label: "Deep Engagement Model", description: "Serve fewer clients with comprehensive, transformational engagements.", pros: ["Higher revenue per client", "Stronger case studies", "Better retention", "More referrals"], cons: ["Revenue concentration", "Capacity constraints", "Slower growth"], bestIf: "The team is small and the brand\u2019s reputation benefits from transformational outcomes.", exampleBrand: "McKinsey serves roughly 2,000 clients globally with an average engagement of $1M+ \u2014 depth over breadth built their $16B brand." }, optionB: { label: "Scalable Light-Touch Model", description: "Serve more clients with productized, systematized offerings.", pros: ["Faster revenue growth", "Lower delivery risk", "Easier to systematize"], cons: ["Weaker case studies", "Harder to differentiate", "Higher churn"], bestIf: "The goal is rapid market penetration and the team has systems for efficient delivery.", exampleBrand: "Canva scaled to 150M+ users by making design accessible and light-touch \u2014 volume over depth." }, recommendation: "Option A is recommended for Acme Co\u2019s current stage. Deep engagements produce the case studies and testimonials needed to close the credibility gap.", revisitWhen: "When Acme Co has 5+ published case studies with named clients and measurable outcomes." },
    { decision: "Content Strategy: Thought leadership first vs. Social proof amplification first", context: "Both are important, but resource constraints require sequencing.", optionA: { label: "Thought Leadership First", description: "Invest in weekly long-form content, frameworks, and industry commentary.", pros: ["Builds authority", "Attracts inbound leads", "Supports SEO/AEO"], cons: ["Slower to convert", "Requires consistent effort"], bestIf: "The goal is long-term brand building.", exampleBrand: "Rand Fishkin built Moz\u2019s entire brand through thought leadership before the product could stand alone." }, optionB: { label: "Social Proof First", description: "Prioritize surfacing testimonials, case studies, and client wins.", pros: ["Directly addresses credibility gap", "Higher conversion rates", "Easier to produce"], cons: ["Doesn\u2019t build top-of-funnel", "Dependent on client participation"], bestIf: "The primary goal is improving conversion from existing traffic.", exampleBrand: "Basecamp grew primarily through customer stories and word-of-mouth \u2014 proof before thought leadership." }, recommendation: "Option B is recommended as the immediate priority (next 90 days) because it directly addresses Acme Co\u2019s primary focus area (credibility). Shift to thought leadership once proof is visible.", revisitWhen: "When Acme Co\u2019s credibility is visible at all key touchpoints and conversion rates have improved." },
    { decision: "Pricing: Premium positioning vs. Accessible entry points", context: "This shapes everything from messaging to client expectations.", optionA: { label: "Premium Only", description: "Price above market, attract clients who value expertise over cost.", pros: ["Higher margins", "Better clients", "Stronger brand perception"], cons: ["Smaller pipeline", "Longer sales cycle", "Pressure to deliver"], bestIf: "The brand has strong enough credibility to justify premium pricing.", exampleBrand: "Pentagram charges $200K+ for brand identity work and turns away 90% of inquiries \u2014 scarcity creates demand." }, optionB: { label: "Tiered with Entry Point", description: "Offer a lower-cost entry product alongside premium services.", pros: ["Larger pipeline", "Land-and-expand opportunity", "Builds trust before big commitment"], cons: ["Potential brand dilution", "More complex operations"], bestIf: "The brand needs more pipeline volume and wants to demonstrate value before asking for premium investment.", exampleBrand: "The WunderBrand Snapshot™\u2122 suite itself is a perfect example \u2014 free entry, escalating value, premium top tier." }, recommendation: "Option B is recommended \u2014 Acme Co\u2019s own product suite demonstrates this model perfectly. Use entry-level offerings to build the pipeline, then graduate clients into premium engagements.", revisitWhen: "When Acme Co\u2019s pipeline is consistently full and the team can afford to be more selective." },
  ],
  ninetyDayRoadmap: {
    overview: "This 90-day roadmap transforms Acme Co\u2019s diagnostic insights into measurable brand improvements. The sequence matters: Phase 1 builds the trust foundation (credibility), Phase 2 activates that foundation through messaging and visibility, Phase 3 optimizes the system for sustainable growth.",
    phase1: {
      name: "Foundation",
      objective: "Surface hidden credibility, fix the biggest conversion leak, and establish baseline metrics.",
      weeks: [
        { weekNumber: 1, focus: "Credibility Audit & Quick Wins", tasks: [{ task: "Rank all existing testimonials by impact", pillar: "Credibility", deliverable: "Scored testimonial spreadsheet with top 3 identified", timeEstimate: "2 hours", resources: "Google Sheets, existing testimonials" }, { task: "Place #1 testimonial on homepage hero section", pillar: "Credibility", deliverable: "Live testimonial on homepage", timeEstimate: "1 hour", resources: "Website CMS" }, { task: "Create client logo bar with top 5\u201310 clients", pillar: "Credibility", deliverable: "Logo bar designed and live on homepage", timeEstimate: "3 hours", resources: "Canva (free), client logos" }], milestone: "Social proof is visible above the fold on the homepage." },
        { weekNumber: 2, focus: "Conversion Path Setup", tasks: [{ task: "Draft lead magnet concept and outline", pillar: "Conversion", deliverable: "Lead magnet outline approved", timeEstimate: "3 hours", resources: "Google Docs" }, { task: "Set up email capture form on website", pillar: "Conversion", deliverable: "Working opt-in form on homepage or blog", timeEstimate: "2 hours", resources: "Mailchimp or ConvertKit (free tier)" }, { task: "Write 3-email welcome nurture sequence", pillar: "Conversion", deliverable: "3 emails written, loaded in email platform", timeEstimate: "4 hours", resources: "Email platform" }], milestone: "Two conversion paths exist: high-intent (book a call) and low-intent (download lead magnet)." },
        { weekNumber: 3, focus: "Messaging Proof Audit", tasks: [{ task: "Audit website copy for unsubstantiated claims", pillar: "Messaging", deliverable: "List of 10+ claims that need proof points", timeEstimate: "2 hours", resources: "Website" }, { task: "Replace top 5 claims with evidence-backed statements", pillar: "Messaging", deliverable: "5 pages updated with proof-driven copy", timeEstimate: "3 hours", resources: "Website CMS" }, { task: "Request testimonials from 3 recent clients", pillar: "Credibility", deliverable: "3 outreach emails sent", timeEstimate: "1 hour", resources: "Email" }], milestone: "Homepage and services page lead with proof, not claims." },
        { weekNumber: 4, focus: "Baseline Metrics & Case Study", tasks: [{ task: "Set up Google Analytics goals for conversions", pillar: "Conversion", deliverable: "GA goals tracking form submissions and CTA clicks", timeEstimate: "2 hours", resources: "Google Analytics" }, { task: "Draft first full case study (TechNova recommended)", pillar: "Credibility", deliverable: "500-word case study: Challenge \u2192 Solution \u2192 Result", timeEstimate: "4 hours", resources: "Google Docs, client data" }, { task: "Record baseline metrics for all pillars", pillar: "All", deliverable: "Metrics dashboard with starting numbers", timeEstimate: "2 hours", resources: "Google Sheets" }], milestone: "Phase 1 baseline established. One case study published. Analytics tracking live." },
      ],
      phase1Success: "Credibility is visible at key touchpoints, a second conversion path exists, and baseline metrics are established for ongoing measurement.",
    },
    phase2: {
      name: "Execution",
      objective: "Activate the credibility foundation through strategic content, refine messaging, and build visibility momentum.",
      weeks: [
        { weekNumber: 5, focus: "Content Strategy Launch", tasks: [{ task: "Create 4-week pillar-based content calendar", pillar: "Visibility", deliverable: "Content calendar with topics, formats, and pillar alignment", timeEstimate: "3 hours", resources: "Google Sheets or Notion" }, { task: "Write and publish first pillar-aligned LinkedIn post", pillar: "Visibility", deliverable: "First strategic post live on LinkedIn", timeEstimate: "1 hour", resources: "LinkedIn" }, { task: "Publish TechNova case study on website", pillar: "Credibility", deliverable: "Case study page live with CTA", timeEstimate: "2 hours", resources: "Website CMS" }], milestone: "Content strategy is activated with pillar alignment." },
        { weekNumber: 6, focus: "Positioning Refinement", tasks: [{ task: "Rewrite homepage headline using positioning formula", pillar: "Positioning", deliverable: "New headline live on website", timeEstimate: "2 hours", resources: "Website CMS" }, { task: "Update LinkedIn headline and About section", pillar: "Positioning", deliverable: "LinkedIn profile reflects positioning", timeEstimate: "1 hour", resources: "LinkedIn" }, { task: "Test new positioning with 5 people outside the company", pillar: "Positioning", deliverable: "Feedback documented, headline refined if needed", timeEstimate: "2 hours", resources: "Email or Slack" }], milestone: "Positioning is consistent across website and LinkedIn." },
        { weekNumber: 7, focus: "Email & Nurture Optimization", tasks: [{ task: "Launch lead magnet", pillar: "Conversion", deliverable: "Lead magnet live, promoted on homepage and LinkedIn", timeEstimate: "4 hours", resources: "Design tool, website, email platform" }, { task: "Analyze first 2 weeks of email performance", pillar: "Conversion", deliverable: "Open rates, click rates documented", timeEstimate: "1 hour", resources: "Email platform analytics" }, { task: "Publish second case study or client spotlight", pillar: "Credibility", deliverable: "Second proof asset published", timeEstimate: "3 hours", resources: "Website CMS" }], milestone: "Lead magnet is live. Email nurture is running. Second case study published." },
        { weekNumber: 8, focus: "Visibility Momentum", tasks: [{ task: "Complete first full month of pillar-aligned content", pillar: "Visibility", deliverable: "12+ pieces of strategic content published", timeEstimate: "Ongoing", resources: "Content calendar" }, { task: "Identify and join 2 relevant LinkedIn groups or communities", pillar: "Visibility", deliverable: "Active in 2 communities", timeEstimate: "1 hour", resources: "LinkedIn" }, { task: "Pitch one guest article or podcast appearance", pillar: "Credibility", deliverable: "1 outreach sent to relevant publication or podcast", timeEstimate: "2 hours", resources: "Email" }], milestone: "Visibility strategy is systematic, not reactive." },
      ],
      phase2Success: "Content strategy is running on a pillar-based framework. Positioning is consistent across all touchpoints. Lead magnet is capturing leads. Two+ case studies are published.",
    },
    phase3: {
      name: "Optimization",
      objective: "Measure what\u2019s working, optimize for conversion, and build sustainable brand systems.",
      weeks: [
        { weekNumber: 9, focus: "Analytics Review & Optimization", tasks: [{ task: "Review 60-day analytics against baseline", pillar: "All", deliverable: "Performance report comparing baseline to current", timeEstimate: "3 hours", resources: "Google Analytics, email platform" }, { task: "Identify top-performing content and double down", pillar: "Visibility", deliverable: "Next month\u2019s content plan weighted toward winners", timeEstimate: "2 hours", resources: "Analytics data, content calendar" }, { task: "A/B test homepage headline", pillar: "Positioning", deliverable: "Two headline variants running", timeEstimate: "2 hours", resources: "Google Optimize or website CMS" }], milestone: "Data is informing strategy. Optimization cycle begins." },
        { weekNumber: 10, focus: "Conversion Optimization", tasks: [{ task: "Review lead magnet download-to-email-open funnel", pillar: "Conversion", deliverable: "Funnel analysis with drop-off points identified", timeEstimate: "2 hours", resources: "Email platform analytics" }, { task: "Optimize email nurture based on open/click data", pillar: "Conversion", deliverable: "Updated email sequence with improved subject lines and CTAs", timeEstimate: "3 hours", resources: "Email platform" }, { task: "Add social proof to 2 additional website pages", pillar: "Credibility", deliverable: "Testimonials/logos on services and contact pages", timeEstimate: "2 hours", resources: "Website CMS" }], milestone: "Conversion funnel is optimized based on real data." },
        { weekNumber: 11, focus: "Authority Building", tasks: [{ task: "Publish a thought leadership piece (framework or methodology)", pillar: "Visibility", deliverable: "Long-form article published on website and LinkedIn", timeEstimate: "4 hours", resources: "Website CMS, LinkedIn" }, { task: "Collect and publish 2 new client testimonials", pillar: "Credibility", deliverable: "2 new testimonials live on website", timeEstimate: "2 hours", resources: "Testimonial collection tool" }, { task: "Create a \u2018Speaking Topics\u2019 or \u2018Media Kit\u2019 page", pillar: "Credibility", deliverable: "New page live on website", timeEstimate: "3 hours", resources: "Website CMS" }], milestone: "Thought leadership is established. Proof library is growing." },
        { weekNumber: 12, focus: "90-Day Review & Next Phase Planning", tasks: [{ task: "Conduct full 90-day brand health review", pillar: "All", deliverable: "Comprehensive review document with metrics comparison", timeEstimate: "4 hours", resources: "Brand Health Scorecard (section 35 of this report)" }, { task: "Identify top 3 priorities for next 90 days", pillar: "All", deliverable: "Next phase strategic plan drafted", timeEstimate: "2 hours", resources: "This report + 90-day data" }, { task: "Schedule WunderBrand Blueprint+™ Strategy Activation Session", pillar: "All", deliverable: "Session booked with Wunderbar Digital", timeEstimate: "15 minutes", resources: "Calendly link in this report" }], milestone: "90-day cycle complete. Next phase planned. Brand health measured." },
      ],
      phase3Success: "Brand health metrics show measurable improvement. Content strategy is sustainable. Conversion funnel is optimized. Clear plan for next 90 days exists.",
    },
    day90Snapshot: {
      brandAlignmentTarget: "+8\u201312 points (projected improvement from 72 to 80\u201384)",
      biggestWins: ["Credibility visible at all key decision points (testimonials, case studies, logos)", "Two conversion paths capturing leads at different intent levels", "Pillar-aligned content strategy replacing reactive posting"],
      keyRisks: ["Team capacity constraints \u2014 mitigate by prioritizing the highest-impact tasks each week", "Client participation in case studies/testimonials \u2014 mitigate by offering easy formats (email Q&A, 5-minute Loom video)"],
      nextHorizon: "Days 91\u2013180 should focus on scaling visibility through thought leadership, building an email audience to 500+, and exploring strategic partnerships with complementary B2B service providers.",
    },
  },
  brandHealthScorecard: {
    overview: "This scorecard transforms the one-time WunderBrand Blueprint+™ diagnostic into an ongoing measurement framework. Review these dimensions quarterly to track brand health, catch drift early, and make data-informed decisions about where to invest.",
    scorecardDimensions: [
      { dimension: "Brand Awareness", currentState: "Acme Co has active LinkedIn presence but limited organic search visibility and no thought leadership platform.", targetState: "Top 3 organic search results for \u2018B2B brand strategy [region]\u2019 and consistent LinkedIn engagement (50+ reactions per post).", keyMetric: "Monthly branded search volume + LinkedIn post engagement rate", measurementMethod: "Google Search Console (branded queries) + LinkedIn Analytics", frequency: "Monthly", greenThreshold: "Branded search up 20%+ MoM; LinkedIn engagement rate above 3%", yellowThreshold: "Flat branded search; LinkedIn engagement 1\u20133%", redThreshold: "Declining branded search; LinkedIn engagement below 1%" },
      { dimension: "Lead Quality", currentState: "Leads come primarily through referrals with no systematic lead capture.", targetState: "50% of leads come through inbound channels (website, content, LinkedIn) with clear attribution.", keyMetric: "Inbound lead percentage + Lead-to-qualified-opportunity rate", measurementMethod: "CRM tracking (or spreadsheet) with source attribution", frequency: "Monthly", greenThreshold: "40%+ inbound leads; 30%+ qualification rate", yellowThreshold: "20\u201340% inbound; 15\u201330% qualification", redThreshold: "Below 20% inbound; below 15% qualification" },
      { dimension: "Messaging Consistency", currentState: "Core message exists internally but is expressed inconsistently across touchpoints.", targetState: "Every touchpoint (website, LinkedIn, email, proposals) reflects the same positioning and proof-driven messaging.", keyMetric: "Quarterly messaging audit score (self-assessed 1\u201310)", measurementMethod: "Review 5 touchpoints against brand guidelines and score consistency", frequency: "Quarterly", greenThreshold: "Score 8+/10 across all touchpoints", yellowThreshold: "Score 5\u20137/10 with 1\u20132 inconsistent touchpoints", redThreshold: "Score below 5/10 or 3+ inconsistent touchpoints" },
      { dimension: "Credibility Visibility", currentState: "Testimonials and case studies exist but are buried. Proof is not visible at decision points.", targetState: "Social proof appears within 10 seconds on every key page. 3+ published case studies.", keyMetric: "Number of published case studies + proof elements on key pages", measurementMethod: "Manual audit of homepage, services, pricing, and contact pages", frequency: "Quarterly", greenThreshold: "5+ case studies; proof on all key pages", yellowThreshold: "2\u20134 case studies; proof on some pages", redThreshold: "0\u20131 case studies; proof missing from key pages" },
      { dimension: "Content Performance", currentState: "Content is published reactively without a strategic framework.", targetState: "100% of content maps to a brand pillar. Top-performing content generates measurable engagement and traffic.", keyMetric: "Content-to-pillar alignment rate + average engagement per piece", measurementMethod: "Content audit spreadsheet + LinkedIn/Google Analytics", frequency: "Monthly", greenThreshold: "100% pillar-aligned; engagement up 25%+", yellowThreshold: "80%+ pillar-aligned; flat engagement", redThreshold: "Below 80% alignment; declining engagement" },
      { dimension: "Conversion Rate", currentState: "Single conversion path (contact form). No lead magnet or nurture sequence.", targetState: "Two conversion paths with tracked funnel metrics. 3%+ website visitor-to-lead rate.", keyMetric: "Website visitor-to-lead conversion rate + email opt-in rate", measurementMethod: "Google Analytics goals + email platform metrics", frequency: "Monthly", greenThreshold: "3%+ conversion; 2%+ email opt-in", yellowThreshold: "1\u20133% conversion; 1\u20132% opt-in", redThreshold: "Below 1% conversion; below 1% opt-in" },
      { dimension: "Sales Cycle Length", currentState: "No systematic tracking. Estimated 6\u20138 weeks for typical engagement.", targetState: "Tracked and trending downward. Target: 3\u20134 weeks for qualified leads.", keyMetric: "Average days from first contact to signed proposal", measurementMethod: "CRM or deal tracking spreadsheet", frequency: "Quarterly", greenThreshold: "Below 30 days average", yellowThreshold: "30\u201345 days average", redThreshold: "Above 45 days average" },
      { dimension: "Client Satisfaction & Advocacy", currentState: "Clients are satisfied but not systematically asked for feedback or referrals.", targetState: "NPS tracked quarterly. 30%+ of new business comes from client referrals.", keyMetric: "Net Promoter Score + referral percentage of new business", measurementMethod: "Quarterly NPS survey (email) + source tracking", frequency: "Quarterly", greenThreshold: "NPS 50+; 30%+ referral rate", yellowThreshold: "NPS 30\u201350; 15\u201330% referral rate", redThreshold: "NPS below 30; below 15% referral rate" },
    ],
    quarterlyReviewProcess: {
      description: "A structured process for reviewing brand health every 90 days. Block 3 hours, invite key stakeholders, and use this framework to turn data into decisions.",
      steps: [
        { step: "Gather metrics (Week before review)", detail: "Pull data for all 8 scorecard dimensions. Use the measurement methods specified above. Document in a single spreadsheet or dashboard.", timeEstimate: "2 hours" },
        { step: "Score each dimension (Red/Yellow/Green)", detail: "Compare current metrics to thresholds. Be honest \u2014 yellow is not green. Document the score AND the evidence.", timeEstimate: "30 minutes" },
        { step: "Identify the 2 biggest wins since last quarter", detail: "What improved? Why? What can be replicated? Document so the team can see progress and stay motivated.", timeEstimate: "20 minutes" },
        { step: "Identify the 2 biggest risks or declines", detail: "What\u2019s trending down or stuck? Is it a resource issue, strategy issue, or execution issue? Be specific.", timeEstimate: "20 minutes" },
        { step: "Set 3 priorities for next quarter", detail: "Based on wins and risks, choose 3 focus areas. Each should have a specific metric target, an owner, and a deadline.", timeEstimate: "30 minutes" },
        { step: "Update this WunderBrand Blueprint+™ if needed", detail: "Has anything changed about the business, audience, or market that should be reflected? Update relevant sections to keep the document alive.", timeEstimate: "20 minutes" },
      ],
      reviewTemplate: "QUARTERLY BRAND HEALTH REVIEW \u2014 [Quarter/Year]\\n\\n1. Overall WunderBrand Score™ Estimate: ___/100\\n2. Dimension Scores: [List each with Red/Yellow/Green]\\n3. Top 2 Wins: [What improved and why]\\n4. Top 2 Risks: [What declined or stalled]\\n5. Last Quarter\u2019s Priorities \u2014 Status: [Did we hit them?]\\n6. Next Quarter\u2019s 3 Priorities: [Specific, measurable, owned]\\n7. Blueprint Updates Needed: [Yes/No \u2014 what changed?]",
    },
    leadingIndicators: [
      { indicator: "Decline in LinkedIn post engagement", whatItMeans: "Content may be drifting off-pillar or audience is fatiguing. Check alignment with content calendar and experiment with formats.", actionToTake: "Audit last 10 posts against brand pillars. If <80% are aligned, refocus. If aligned but declining, test new formats (carousels, video, polls)." },
      { indicator: "Increase in \u2018how much does it cost?\u2019 as first question", whatItMeans: "Positioning isn\u2019t communicating value clearly enough. Prospects are defaulting to price as the decision factor.", actionToTake: "Review website and LinkedIn for value-first messaging. Ensure proof points and outcomes appear before pricing. Consider adding a \u2018Results\u2019 page." },
      { indicator: "Prospects can\u2019t articulate what you do", whatItMeans: "Positioning statement isn\u2019t landing. The gap between internal clarity and external perception is widening.", actionToTake: "Run the 5-second test again: show the homepage to 3 new people. If they can\u2019t describe what Acme Co does, rewrite the headline." },
      { indicator: "Team members unsure how to describe the brand", whatItMeans: "Internal alignment is breaking down. This is a drift indicator \u2014 catch it early before it reaches customers.", actionToTake: "Run a 15-minute brand alignment exercise with the team. Everyone writes down: What we do, for whom, and why it matters. Compare answers." },
      { indicator: "Referral rate declining quarter-over-quarter", whatItMeans: "Client experience or satisfaction may be slipping, or clients aren\u2019t being asked to refer.", actionToTake: "Implement a systematic referral ask at the 90-day mark of every engagement. Check NPS scores for decline patterns." },
    ],
    laggingIndicators: [
      { indicator: "Customer acquisition cost trend", whatItMeans: "Rising CAC suggests brand awareness and credibility aren\u2019t doing their job \u2014 you\u2019re paying more to convince each new customer.", benchmarkContext: "For B2B consulting firms, healthy CAC is typically 10\u201315% of first-year client value. If it\u2019s above 20%, brand investment should be prioritized over paid acquisition." },
      { indicator: "Revenue per client trend", whatItMeans: "Declining revenue per client may indicate positioning drift (attracting price-sensitive clients) or failure to expand relationships.", benchmarkContext: "Top B2B consultancies grow revenue per client 10\u201320% annually through expanded engagements. Flat or declining suggests the brand isn\u2019t creating enough perceived value for upsells." },
      { indicator: "Proposal win rate", whatItMeans: "A declining win rate suggests either positioning is attracting the wrong prospects, messaging isn\u2019t converting at the decision stage, or credibility isn\u2019t sufficient.", benchmarkContext: "B2B consulting firms with strong brands typically win 40\u201360% of proposals. Below 30% suggests a brand credibility or positioning issue, not a pricing issue." },
      { indicator: "Time to hire / talent attraction", whatItMeans: "A strong brand attracts talent more easily. If hiring becomes harder, it may signal that the employer brand isn\u2019t keeping pace with the customer brand.", benchmarkContext: "This is a lagging indicator of brand health \u2014 but one that directly impacts delivery quality. Monitor it as an indirect signal." },
    ],
  },
  taglineRecommendations: [
    { tagline: "Strategy That Scales With You", rationale: "Positions Acme Co as a growth partner \u2014 reflects the Sage archetype.", bestUsedOn: "Website hero, LinkedIn bio, email signature", tone: "Confident authority with warmth", audienceResonance: "Resonates most with scaling founders who value strategic partnerships over transactional vendor relationships.", variations: [{ context: "Social media bio", variation: "Strategy that scales." }, { context: "Formal presentation", variation: "Strategic Brand Alignment That Scales With Your Ambition" }] },
    { tagline: "Clarity First. Growth Follows.", rationale: "Emphasizes strategic clarity as the foundation for results.", bestUsedOn: "Tagline beneath logo, presentation slides", tone: "Direct and assured", audienceResonance: "Appeals to data-driven marketing leaders who want measurable outcomes before creative polish.", variations: [{ context: "Email signature", variation: "Clarity first." }, { context: "Trade show booth", variation: "Brand Clarity First. Sustainable Growth Follows." }] },
    { tagline: "Your Brand, Fully Aligned", rationale: "Speaks to the core value proposition \u2014 brand alignment.", bestUsedOn: "Ad campaigns, brand collateral", tone: "Warm and aspirational", audienceResonance: "Connects with operations-minded leaders who feel the pain of misaligned brand touchpoints.", variations: [{ context: "LinkedIn ad", variation: "Is your brand fully aligned?" }, { context: "Case study header", variation: "From Fragmented to Fully Aligned" }] },
  ],
  brandStory: {
    headline: "We started with a question nobody else was asking.",
    narrative: "In 2018, Acme Co's founders noticed something broken in the B2B consulting landscape: businesses were investing heavily in tactics \u2014 ads, funnels, content \u2014 without ever aligning on what their brand actually stood for. The result was wasted budgets, confused audiences, and growth that plateaued.\n\nAcme Co was built on a simple belief: strategy before tactics. When a brand knows exactly who it is, who it serves, and what it stands for, everything else \u2014 from marketing to hiring to partnerships \u2014 becomes exponentially easier.\n\nToday, Acme Co helps mid-market B2B companies transform fragmented brand presence into cohesive, high-performing brand systems. Our approach combines diagnostic precision with practical implementation, so brands don't just understand their gaps \u2014 they close them.\n\nWe're building toward a future where every B2B brand operates with the clarity and confidence of the world's most recognized consumer brands.",
    elevatorPitch: "Acme Co helps B2B companies align their brand strategy across every touchpoint \u2014 so they stop competing on price and start winning on clarity, credibility, and trust.",
    founderStory: "Founded on the belief that B2B brands deserve the same strategic rigor as the world's best consumer brands.",
    pressVersion: "Acme Co is a B2B brand strategy firm that helps mid-market companies transform fragmented brand presence into cohesive brand systems. Using a proprietary diagnostic framework, Acme Co delivers data-driven brand alignment strategies that improve marketing ROI, shorten sales cycles, and build long-term competitive advantage.",
    investorVersion: "Acme Co addresses a $47B market opportunity in B2B brand consulting by democratizing enterprise-grade brand strategy through AI-powered diagnostics. Our SaaS-enabled approach delivers 10x the value of traditional agency engagements at a fraction of the cost, with 85% gross margins and a clear path to recurring revenue through tiered subscriptions."
  },
  companyDescription: {
    oneLiner: "Acme Co helps B2B companies align their brand strategy for measurable growth.",
    shortDescription: "Acme Co is a B2B brand strategy firm that helps mid-market companies transform fragmented brand presence into cohesive, high-performing brand systems. Using a proprietary diagnostic framework, we deliver data-driven brand alignment strategies that improve marketing ROI and shorten sales cycles.",
    fullBoilerplate: "Founded in 2018, Acme Co is a B2B brand strategy firm serving mid-market companies with $1M–$20M in revenue. The company's proprietary WunderBrand Score™ framework diagnoses brand health across five key pillars — Positioning, Messaging, Visibility, Credibility, and Conversion — and delivers actionable strategies that drive measurable business outcomes. Acme Co's approach combines diagnostic precision with practical implementation, helping brands close the gap between what they deliver and how they're perceived. The company serves clients nationally across professional services, SaaS, and consulting industries.",
    proposalIntro: "Acme Co specializes in B2B brand strategy for mid-market companies. Our diagnostic-driven approach has helped 200+ businesses improve brand alignment by an average of 23 points, resulting in shorter sales cycles, higher conversion rates, and stronger market positioning.",
    industrySpecific: "Acme Co is a B2B brand alignment firm built for professional services, SaaS, and consulting companies scaling from $1M to $20M. Our diagnostic-first approach identifies the exact gaps between how your brand is perceived and what you actually deliver — then closes them with data-backed strategy.",
    recruitingVersion: "Acme Co is on a mission to give every B2B brand the strategic clarity of a Fortune 500 company. We're a fast-growing brand strategy firm combining AI-powered diagnostics with human expertise to transform how mid-market companies build and communicate their brands. Join a team of strategists, technologists, and creative thinkers who believe great brands aren't just designed — they're engineered.",
  },
  customerJourneyMap: {
    overview: "Acme Co's ideal customer moves from problem awareness to brand loyalty over 3\u20136 months, with key conversion windows at consideration and decision stages.",
    stages: [
      { stage: "Awareness", customerMindset: "Something is off with our brand, but I can't pinpoint what.", keyQuestions: ["Why aren't our marketing efforts converting?", "Is our brand holding us back?"], touchpoints: ["Google search", "LinkedIn", "Industry events"], messagingFocus: "Validate the problem \u2014 show you understand the pain of brand misalignment.", contentTypes: ["Blog posts", "LinkedIn articles", "Podcast appearances"], conversionTrigger: "Free WunderBrand Snapshot™ diagnostic CTA", kpiToTrack: "Website traffic from search", personaVariations: [{ persona: "Marketing Director", adaptation: "Focuses on proving marketing ROI to leadership \u2014 needs data-backed diagnosis." }, { persona: "Founder/CEO", adaptation: "Focuses on competitive positioning and 'why we're losing deals.'" }], optimizationTips: ["A/B test LinkedIn ad creatives monthly", "Create comparison content targeting competitor brand names"], toolsRecommended: ["Google Search Console", "LinkedIn Campaign Manager", "Ahrefs"] },
      { stage: "Consideration", customerMindset: "I need help, but I'm comparing options.", keyQuestions: ["What makes Acme Co different?", "Can I see proof?"], touchpoints: ["Website case studies", "Email nurture", "Webinars"], messagingFocus: "Differentiate with proof \u2014 case studies, methodology, and thought leadership.", contentTypes: ["Case studies", "Comparison guides", "Webinars"], conversionTrigger: "Downloadable Brand Audit Checklist or Snapshot+ upgrade", kpiToTrack: "Lead-to-MQL conversion rate", personaVariations: [{ persona: "Marketing Director", adaptation: "Needs peer case studies and ROI metrics they can present to leadership." }, { persona: "Founder/CEO", adaptation: "Wants to see founder stories and strategic outcomes, not just marketing metrics." }], optimizationTips: ["Add exit-intent popup with lead magnet on pricing page", "Create persona-specific landing pages"], toolsRecommended: ["HubSpot", "Hotjar", "Loom for video testimonials"] },
      { stage: "Decision", customerMindset: "I'm ready to invest \u2014 I need confidence.", keyQuestions: ["What's the ROI?", "What does the process look like?"], touchpoints: ["Strategy call", "Proposal", "Free consultation"], messagingFocus: "Remove risk \u2014 clear process, pricing, guaranteed deliverables.", contentTypes: ["Proposals", "ROI calculators", "Testimonials"], conversionTrigger: "Strategy consultation booking or purchase", kpiToTrack: "Proposal-to-close rate", personaVariations: [{ persona: "Marketing Director", adaptation: "Needs a business case template to present internally." }, { persona: "Founder/CEO", adaptation: "Values speed and directness \u2014 wants to start immediately." }], optimizationTips: ["Offer a money-back guarantee on first engagement", "Reduce friction: one-click checkout for digital products"], toolsRecommended: ["Calendly", "Stripe", "PandaDoc"] },
      { stage: "Onboarding", customerMindset: "I've committed \u2014 now reassure me.", keyQuestions: ["What happens first?", "How do I access my report?"], touchpoints: ["Welcome email", "Onboarding portal", "First deliverable"], messagingFocus: "Reassure and activate \u2014 immediate value delivery.", contentTypes: ["Welcome sequence", "Quick-start guide"], conversionTrigger: "First 'aha moment' from report", kpiToTrack: "Time-to-first-value", personaVariations: [{ persona: "Marketing Director", adaptation: "Wants team access and shareable assets." }, { persona: "Founder/CEO", adaptation: "Wants executive summary first, details later." }], optimizationTips: ["Send first deliverable within 60 seconds of purchase", "Include a 'share with your team' one-click feature"], toolsRecommended: ["Intercom", "Loom", "Notion"] },
      { stage: "Retention", customerMindset: "Am I getting enough value to upgrade?", keyQuestions: ["How do I measure if this is working?", "What else can you help with?"], touchpoints: ["Quarterly check-in", "New content", "Upgrade prompts"], messagingFocus: "Demonstrate ongoing value \u2014 insights, recommendations, community.", contentTypes: ["Monthly insights", "Exclusive resources", "Upgrade CTAs"], conversionTrigger: "Tier upgrade or managed services inquiry", kpiToTrack: "Upgrade rate and retention", personaVariations: [{ persona: "Marketing Director", adaptation: "Wants benchmarking data and team training resources." }, { persona: "Founder/CEO", adaptation: "Wants strategic check-ins and industry trend briefings." }], optimizationTips: ["Send quarterly 'brand health check' emails", "Create an exclusive Slack community for paid users"], toolsRecommended: ["Customer.io", "Slack", "Typeform for NPS"] },
      { stage: "Advocacy", customerMindset: "This worked \u2014 I want to share it.", keyQuestions: ["Can I refer someone?", "Partner program?"], touchpoints: ["Referral program", "Case study collaboration", "Social sharing"], messagingFocus: "Celebrate and amplify \u2014 make it easy to refer.", contentTypes: ["Referral incentives", "Co-branded case studies"], conversionTrigger: "Referral or public testimonial", kpiToTrack: "NPS and referral rate", personaVariations: [{ persona: "Marketing Director", adaptation: "Shares in professional communities and on LinkedIn." }, { persona: "Founder/CEO", adaptation: "Refers through personal network and EO/YPO groups." }], optimizationTips: ["Create 'shareable results' cards users can post on LinkedIn", "Offer referral credit toward next-tier upgrade"], toolsRecommended: ["ReferralCandy", "Canva for shareable assets"] },
    ],
    dropOffRisks: [
      { stage: "Awareness \u2192 Consideration", risk: "Content doesn't demonstrate enough depth or differentiation", mitigation: "Publish detailed methodology content and comparison guides" },
      { stage: "Consideration \u2192 Decision", risk: "Pricing or process uncertainty causes hesitation", mitigation: "Add pricing transparency page and offer a 'talk to an expert' option" },
      { stage: "Onboarding \u2192 Retention", risk: "Report is overwhelming or feels generic", mitigation: "Add guided walkthrough and personalized action priorities" },
    ]
  },
  seoStrategy: {
    overview: "SEO is a critical visibility lever, connecting content pillars to search intent and ensuring discoverability when B2B decision-makers search for solutions.",
    primaryKeywords: [
      { keyword: "B2B brand strategy", intent: "Commercial", difficulty: "Medium", contentAngle: "Definitive guide to B2B brand strategy", pillarConnection: "Industry Insights", competitiveGap: "Most competitors focus on B2C \u2014 Acme Co can own the B2B angle", priorityLevel: "High" },
      { keyword: "brand alignment audit", intent: "Commercial", difficulty: "Low", contentAngle: "Free brand alignment audit tool + educational content", pillarConnection: "Frameworks & How-To", competitiveGap: "No competitors offer a free diagnostic tool", priorityLevel: "High" },
      { keyword: "brand positioning consulting", intent: "Transactional", difficulty: "High", contentAngle: "Service page with case studies", pillarConnection: "Client Success Stories", competitiveGap: "Competitors lack specific B2B case studies", priorityLevel: "Medium" },
      { keyword: "brand messaging framework", intent: "Informational", difficulty: "Medium", contentAngle: "Template + guide", pillarConnection: "Frameworks & How-To", competitiveGap: "Existing content is outdated or consumer-focused", priorityLevel: "High" },
      { keyword: "how to improve brand consistency", intent: "Informational", difficulty: "Low", contentAngle: "Actionable checklist", pillarConnection: "Industry Insights", competitiveGap: "Top results are generic \u2014 Acme can be B2B-specific", priorityLevel: "Medium" },
    ],
    longTailOpportunities: [
      { keyword: "how to fix inconsistent brand messaging B2B", searchIntent: "Tactical advice for known problem", contentRecommendation: "'5 Signs Your Brand Messaging Is Costing You Deals'", estimatedImpact: "High conversion \u2014 these searchers are problem-aware and solution-seeking" },
      { keyword: "brand strategy vs brand identity", searchIntent: "Concept clarification before investing", contentRecommendation: "Educational article establishing authority", estimatedImpact: "High traffic, moderate conversion \u2014 builds top-of-funnel" },
      { keyword: "B2B brand audit checklist free", searchIntent: "Self-assessment tools", contentRecommendation: "Gated lead magnet", estimatedImpact: "High lead generation \u2014 direct path to WunderBrand Snapshot™" },
    ],
    technicalPriorities: ["FAQ schema on all service pages", "Organization and Service schema", "Core Web Vitals optimization", "XML sitemap with priority tags", "Canonical URLs for blog content", "Internal linking audit across service pages", "Image alt text optimization for all case study images"],
    contentSEOPlaybook: "Publish 2\u20133 optimized posts per month targeting mid-funnel queries. Each should include FAQ schema, internal links to services, and a WunderBrand Snapshot™ CTA.",
    competitorKeywordGaps: "Competitors rank for broad terms like 'brand strategy' but not B2B-specific variations. Acme Co can own 'B2B brand [specific topic]' queries with targeted content.",
    localSEOStrategy: "While primarily national, Acme Co should optimize for '[city] brand strategy consulting' for any markets with concentrated clients."
  },
  aeoStrategy: {
    overview: "AI-powered search is reshaping B2B discovery. Acme Co must position itself as a citable authority across ChatGPT, Perplexity, Google AI Overviews, and emerging AI search tools.",
    entityOptimization: {
      currentEntityStatus: "Moderate entity recognition \u2014 established website and content, but not consistently cited by AI systems.",
      entityBuildingActions: ["Comprehensive 'About Acme Co' page with Organization schema", "Authoritative long-form content AI systems can reference", "Consistent brand mentions across industry publications", "NAP consistency across all web properties", "Wikipedia-style knowledge base content", "Crunchbase and industry directory listings", "Regular contributions to authoritative industry publications"],
      structuredDataRecommendations: ["Organization schema with full details", "FAQ schema on all service/pricing pages", "HowTo schema on methodology pages", "Article schema on all blog posts", "Service schema on offering pages"],
      knowledgeGraphStrategy: "Build Acme Co's presence in Google's Knowledge Graph by ensuring consistent entity information across Wikidata, Crunchbase, LinkedIn Company Page, and industry directories. Aim for Knowledge Panel within 6 months."
    },
    contentForAICitation: {
      strategy: "Create definitive-source content that AI systems naturally cite. Focus on comprehensive, well-structured answers over keyword density.",
      formatRecommendations: ["Q&A format blog posts", "Definitive guide pages (3,000+ words)", "Data-backed reports with original insights", "Comparison and 'vs.' pages for AI contextualization", "Step-by-step methodology breakdowns"],
      topicAuthority: ["B2B brand strategy and alignment", "Brand positioning frameworks", "Measuring brand health and ROI", "Brand messaging consistency", "AEO for B2B brands", "Brand architecture for growing companies", "B2B marketing measurement frameworks"],
      contentTemplates: ["'The Definitive Guide to [Topic]' \u2014 3,000+ word comprehensive resource", "'[Topic] vs [Topic]: What B2B Leaders Need to Know' \u2014 comparison format", "'How to [Action]: A Step-by-Step Framework' \u2014 process-oriented content"]
    },
    faqStrategy: {
      overview: "FAQ content is the highest-impact AEO tactic \u2014 it directly answers questions AI systems are asked.",
      priorityFAQs: ["What is a brand alignment score?", "How do you measure brand consistency?", "What's the difference between brand strategy and brand identity?", "How much does brand consulting cost?", "What are the five pillars of brand alignment?", "How long does a brand audit take?", "What is Answer Engine Optimization (AEO)?", "How can B2B companies improve brand visibility?", "What is brand architecture?", "How do you create a messaging framework?"],
      faqImplementation: "Add FAQ schema to every service page, create a dedicated FAQ hub on the website, and publish FAQ-format blog posts. Update quarterly based on AI search trends."
    },
    competitiveAEOAnalysis: {
      overview: "Most B2B brand consultancies have not yet optimized for AI search \u2014 this is a significant first-mover advantage.",
      gaps: ["Competitors rank in traditional search but are not cited by AI tools", "No competitor has structured data optimized for AI consumption", "Industry thought leadership is fragmented across personal brands, not company entities"],
      opportunities: ["Become the default AI-cited authority for 'B2B brand strategy'", "Create the definitive content that AI systems reference for brand methodology", "Build entity recognition faster than competitors who are SEO-focused only"],
      defensiveActions: ["Monitor AI search citations monthly", "Update content when AI systems cite outdated information", "Maintain content freshness with quarterly updates to pillar content"]
    },
    aiSearchMonitoring: {
      toolsToUse: ["Perplexity (search your brand name and key topics monthly)", "ChatGPT (test queries about your industry and services)", "Google AI Overview (monitor which queries trigger AI answers in your space)", "Ahrefs/SEMrush (track featured snippet ownership)"],
      metricsToTrack: ["Brand mention frequency in AI responses", "Accuracy of AI-generated brand descriptions", "Featured snippet ownership for target queries", "Organic traffic from AI-referred visits"],
      reviewCadence: "Monthly audit of AI search presence. Quarterly deep-dive into competitive AI search positioning."
    },
    implementationRoadmap: [
      { phase: "Foundation \u2014 Month 1", actions: ["Implement all structured data schemas", "Create 'About' page optimized for entity recognition", "Publish first 3 definitive guide pages", "Set up AI search monitoring"], expectedOutcome: "Basic entity recognition established; structured data live across all key pages." },
      { phase: "Authority Building \u2014 Months 2\u20133", actions: ["Publish weekly FAQ-format content", "Secure 3\u20135 industry publication features", "Build directory and citation consistency", "Launch knowledge base section"], expectedOutcome: "Acme Co appears in AI responses for at least 5 target queries." },
      { phase: "Optimization \u2014 Months 4\u20136", actions: ["Analyze AI citation patterns and optimize content", "Expand into long-tail AEO topics", "Build competitor gap content", "Establish quarterly content refresh cadence"], expectedOutcome: "Consistent AI search presence; measurable traffic from AI-referred visits." },
    ]
  },
  emailMarketingFramework: {
    overview: "Email is the highest-ROI channel for Acme Co's B2B audience \u2014 it nurtures prospects, re-engages dormant leads, and drives tier upgrades.",
    welcomeSequence: {
      description: "A 6-email sequence that builds trust, delivers value, and introduces the WunderBrand Suite™.",
      emails: [
        { timing: "Immediately", subject: "Your WunderBrand Snapshot™ is ready \u2014 here's what it means", purpose: "Deliver value and set expectations", keyMessage: "Welcome, here's how to read your results and what to do first.", ctaButton: "View My Report \u2192" },
        { timing: "Day 2", subject: "The #1 thing holding most B2B brands back", purpose: "Educate and build authority", keyMessage: "Most B2B brands invest in tactics before strategy \u2014 here's why that's expensive.", ctaButton: "Read the Full Article \u2192" },
        { timing: "Day 4", subject: "Quick win: One thing you can fix today", purpose: "Deliver actionable value from their report", keyMessage: "Based on your diagnostic, here's one high-impact change you can make right now.", ctaButton: "See Your Top Priority \u2192" },
        { timing: "Day 7", subject: "How [similar company] improved their score by 23 points", purpose: "Social proof and aspiration", keyMessage: "Case study showing impact of brand alignment on real business metrics.", ctaButton: "Read the Case Study \u2192" },
        { timing: "Day 10", subject: "Your brand has a blind spot (here's the data)", purpose: "Create urgency around identified gap", keyMessage: "Your [weakest pillar] score suggests a specific vulnerability. Here's what it means.", ctaButton: "Explore Your Options \u2192" },
        { timing: "Day 14", subject: "Ready to go deeper? Your upgrade options", purpose: "Soft upsell to paid tier", keyMessage: "Introduce Snapshot+ or Blueprint as the logical next step.", ctaButton: "See What's Included \u2192" },
      ]
    },
    nurtureCampaign: {
      description: "An ongoing nurture sequence for leads not yet ready to convert \u2014 builds trust over time.",
      emails: [
        { timing: "Week 3", subject: "The brand strategy framework we use with every client", purpose: "Share methodology \u2014 build credibility", keyMessage: "Our 5-pillar framework explained in plain language.", contentType: "Educational" },
        { timing: "Week 5", subject: "3 questions every B2B brand should answer before spending on marketing", purpose: "Challenge assumptions", keyMessage: "Most brands skip these questions \u2014 and waste budget because of it.", contentType: "Thought leadership" },
        { timing: "Week 7", subject: "[Industry] brands that got alignment right (and wrong)", purpose: "Industry-relevant proof", keyMessage: "Real examples of brands that invested in alignment vs. those that didn't.", contentType: "Social proof" },
        { timing: "Week 9", subject: "Your brand score hasn't changed \u2014 here's why that matters", purpose: "Re-engage with diagnostic data", keyMessage: "A stale brand score means opportunities are slipping. Here's the cost of inaction.", contentType: "Urgency/re-engagement" },
      ]
    },
    reEngagementSequence: {
      trigger: "30 days inactive (no opens or clicks)",
      emails: [
        { timing: "Day 1 of sequence", subject: "We noticed you've been quiet \u2014 everything okay?", purpose: "Warm check-in", keyMessage: "No pressure \u2014 just checking in. Your brand data is still here if you want to revisit." },
        { timing: "Day 5", subject: "3 new things since you last checked in", purpose: "Value-driven re-engagement", keyMessage: "Here's what's new: updated insights, new features, and fresh content." },
        { timing: "Day 10", subject: "Last chance: Your brand insights expire in 30 days", purpose: "Create urgency", keyMessage: "Your diagnostic data will be archived. Access your report before it's gone." },
      ]
    },
    segmentationStrategy: "Segment by: (1) Report tier, (2) Primary pillar gap, (3) Industry, (4) Engagement level, (5) Purchase intent signals. This enables hyper-targeted follow-ups.",
    subjectLineFormulas: ["Your [pillar] score is [score] \u2014 here's what to do", "The [industry] brand playbook: [specific tactic]", "[Name], your brand has an unfair advantage", "3 things I'd change about your brand today", "Most [industry] brands get this wrong \u2014 do you?", "The $15K strategy session \u2014 for free", "Your competitors just got more visible. Did you?"],
    sendCadence: "Weekly for first month (welcome), bi-weekly for nurture, monthly for long-term engagement. Tuesday/Thursday 9\u201310 AM.",
    automationTriggers: ["Visits pricing page but doesn't purchase \u2192 Send comparison email", "Downloads lead magnet \u2192 Enter welcome sequence", "Opens 3+ emails without clicking \u2192 Send 'quick win' email with clear CTA", "Completes free Snapshot \u2192 Send upgrade sequence after 48 hours", "Clicks 'Talk to Expert' but doesn't book \u2192 Follow up in 24 hours"]
  },
  socialMediaStrategy: {
    overview: "LinkedIn is the primary platform, YouTube for long-form thought leadership, and Twitter/X for industry commentary. Other platforms are lower priority.",
    platforms: [
      { platform: "LinkedIn", whyThisPlatform: "90% of B2B decision-makers use LinkedIn. It's where Acme Co's ideal customers spend time and make vendor decisions.", audienceOnPlatform: "Marketing directors, CMOs, founders at mid-market B2B companies.", contentStrategy: "Thought leadership, tactical how-tos, case studies, and frameworks. Prioritize text posts and carousels.", postingFrequency: "4\u20135x per week", contentMix: "40% educational, 25% proof/case studies, 20% frameworks/tools, 15% personal", examplePosts: ["Carousel: 'The 5 Pillars of Brand Alignment'", "Text: 'I audited 50 B2B websites. Here's the #1 mistake...'", "Case study: 'From 42 to 78 on WunderBrand Score™ in 90 days'", "Poll: 'What's your biggest brand challenge right now?'"], kpiToTrack: "Engagement rate \u2014 target 3%+", competitorInsight: "Competitors post sporadically and focus on self-promotion. Acme Co can differentiate with consistent educational value.", growthTactics: ["Comment on 10 relevant posts daily from target accounts", "Repurpose blog content as LinkedIn carousels weekly", "Run LinkedIn Thought Leader ads on highest-performing organic posts"] },
      { platform: "YouTube", whyThisPlatform: "Long-form content builds deep trust and improves SEO/AEO visibility.", audienceOnPlatform: "B2B professionals researching brand strategy or self-educating.", contentStrategy: "Monthly deep-dives, case study walkthroughs, 'brand audit' breakdowns. SEO-optimize titles and descriptions.", postingFrequency: "2\u20134x per month", contentMix: "50% educational, 30% case studies, 20% analysis", examplePosts: ["'How to Build a Brand Messaging Framework (Step-by-Step)'", "'100 B2B Brands Scored \u2014 What the Top 10% Do Differently'", "'Brand Strategy vs Identity: Why It Matters'"], kpiToTrack: "Watch time and subscriber growth", competitorInsight: "Few competitors invest in YouTube \u2014 massive opportunity.", growthTactics: ["Optimize thumbnails and titles for click-through", "Create playlists by topic for binge-watching", "Cross-promote on LinkedIn with short clips"] },
      { platform: "Twitter / X", whyThisPlatform: "Quick industry commentary and thought leadership amplification. Lower investment but valuable for brand awareness.", audienceOnPlatform: "Tech-savvy founders, marketing leaders, and industry commentators.", contentStrategy: "Short-form insights, thread breakdowns of frameworks, real-time industry commentary.", postingFrequency: "3\u20135x per week", contentMix: "50% insights/commentary, 30% threads, 20% engagement", examplePosts: ["Thread: '7 signs your B2B brand needs a strategy refresh (\ud83d\udc4d)'", "Quick take: 'Hot take: Your brand guidelines doc isn't a brand strategy.'", "Quote tweet industry news with perspective"], kpiToTrack: "Impressions and follower growth", competitorInsight: "Most competitors are inactive on X \u2014 low competition.", growthTactics: ["Engage in trending B2B/marketing conversations", "Repurpose LinkedIn content as threads", "Build relationships with industry influencers through replies"] },
    ],
    platformsToAvoid: {
      platforms: ["TikTok", "Pinterest", "Snapchat"],
      reasoning: "Acme Co's B2B audience isn't active on these platforms professionally. Resources are better invested in LinkedIn and YouTube."
    },
    crossPlatformStrategy: "Follow the 1\u21925 repurposing framework: turn every YouTube video into a LinkedIn carousel, 3 LinkedIn posts, a Twitter thread, and an email newsletter segment. Batch-create content monthly to maintain consistency without daily content creation burden."
  },
  contentCalendarFramework: {
    overview: "This content calendar provides a repeatable system for consistent content creation. Use it as a template \u2014 adjust themes based on seasonal priorities and campaign goals.",
    monthlyThemes: [
      { month: "Month 1", theme: "Brand Foundations", contentPillarFocus: "Industry Insights", keyTopics: ["Why brand strategy matters before tactics", "The 5 pillars of brand alignment explained", "Brand audit: how to assess your current state", "Common branding mistakes that cost B2B companies money"] },
      { month: "Month 2", theme: "Visibility & Growth", contentPillarFocus: "Frameworks & How-To", keyTopics: ["AEO: how to get your brand cited by AI", "SEO vs. AEO: the new visibility playbook", "LinkedIn strategy for B2B brand building", "How to measure brand visibility (with tools)"] },
      { month: "Month 3", theme: "Conversion & Proof", contentPillarFocus: "Client Success Stories", keyTopics: ["Case study deep-dive: from low to high alignment score", "How brand clarity shortens sales cycles", "Building trust signals for B2B buyers", "The ROI of brand alignment (with data)"] },
    ],
    weeklyStructure: {
      description: "A repeatable weekly content rhythm that covers all pillars and platforms without daily content creation stress.",
      days: [
        { day: "Monday", contentType: "Educational LinkedIn post", platform: "LinkedIn", contentPillar: "Industry Insights", exampleTopic: "One insight from the week's theme \u2014 text post with a strong hook" },
        { day: "Tuesday", contentType: "Blog article (published)", platform: "Website + Email", contentPillar: "Frameworks & How-To", exampleTopic: "In-depth article on the month's theme \u2014 SEO-optimized with FAQ schema" },
        { day: "Wednesday", contentType: "Case study or proof point", platform: "LinkedIn", contentPillar: "Client Success Stories", exampleTopic: "Client result highlight, before/after metric, or testimonial" },
        { day: "Thursday", contentType: "Framework carousel or thread", platform: "LinkedIn + Twitter", contentPillar: "Tools & Templates", exampleTopic: "Visual breakdown of a strategy framework or process" },
        { day: "Friday", contentType: "Behind-the-scenes or personal", platform: "LinkedIn", contentPillar: "Behind the Strategy", exampleTopic: "Lesson learned, team insight, or industry reflection" },
      ]
    },
    batchingStrategy: "Dedicate one 3-hour session per month to batch-create the next month's content. Write all LinkedIn posts, outline the blog article, prepare carousel graphics, and draft email newsletters in a single focused session.",
    repurposingPlaybook: "1\u21925 Rule: Every YouTube video becomes a LinkedIn carousel, 3 LinkedIn text posts, a Twitter thread, and an email newsletter segment. Every blog post becomes a LinkedIn post, an email topic, and 2\u20133 social media quotes. This maximizes reach while minimizing creation time."
  },
  swotAnalysis: {
    overview: "This SWOT analysis connects your brand diagnostic data to strategic positioning \u2014 it's not generic, it's calibrated to Acme Co's specific diagnostic results.",
    strengths: [
      { item: "Strong positioning clarity", evidence: "Positioning scored 16/20 \u2014 the highest pillar. Acme Co has a clear sense of who they are and what they offer.", leverage: "Use this as the foundation for all marketing \u2014 lead with positioning strength in sales materials and website copy." },
      { item: "Differentiated methodology", evidence: "The diagnostic framework and 5-pillar system are unique in the market.", leverage: "Position the methodology as a thought leadership asset \u2014 publish it, speak about it, make it the brand's calling card." },
      { item: "Strong credibility signals", evidence: "Credibility scored 15/20 \u2014 testimonials, case studies, and proof points are solid.", leverage: "Amplify credibility on the website with a dedicated results page and integrate proof points into every conversion touchpoint." },
      { item: "Clear target audience", evidence: "Audience clarity data shows well-defined ICP with specific pain points.", leverage: "Create hyper-targeted content and campaigns for the primary ICP rather than trying to serve everyone." },
    ],
    weaknesses: [
      { item: "Visibility gaps", evidence: "Visibility scored 12/20 \u2014 the brand isn't consistently discoverable where the audience looks.", mitigation: "Implement the SEO + AEO strategy in this report. Prioritize LinkedIn and content marketing over the next 90 days." },
      { item: "Messaging inconsistency across channels", evidence: "Messaging scored 13/20 \u2014 different touchpoints communicate different value propositions.", mitigation: "Implement the messaging system from this report. Audit and update all customer-facing copy within 30 days." },
      { item: "Limited content volume", evidence: "Content analysis shows sporadic publishing with no consistent cadence.", mitigation: "Follow the content calendar framework. Start with 2 posts per week and build to the recommended cadence." },
      { item: "Conversion path complexity", evidence: "Conversion scored 14/20 \u2014 the path from awareness to purchase has too many steps.", mitigation: "Simplify the CTA hierarchy and implement the conversion strategy recommendations." },
    ],
    opportunities: [
      { item: "AI search is a wide-open field", context: "No competitor in B2B brand consulting has established AEO authority yet.", action: "Execute the AEO strategy aggressively over the next 3\u20136 months to establish first-mover advantage." },
      { item: "Content-driven lead generation", context: "B2B buyers self-educate through content before engaging vendors.", action: "Invest in the content pillar strategy and SEO/AEO playbook to capture top-of-funnel demand." },
      { item: "Product-led growth through free diagnostic", context: "The free WunderBrand Snapshot™ is a powerful entry point \u2014 few competitors offer anything comparable.", action: "Optimize the free-to-paid conversion funnel and build automated upgrade pathways." },
      { item: "Partnership and co-marketing potential", context: "Adjacent service providers (agencies, SaaS tools) could amplify reach.", action: "Identify 5\u201310 potential co-marketing partners and propose joint content or referral arrangements." },
    ],
    threats: [
      { item: "Commoditization of AI-generated brand advice", likelihood: "Medium", impact: "High", contingency: "Differentiate through proprietary methodology, human expertise layer, and depth of personalization that generic AI tools can't match." },
      { item: "Larger agencies entering the diagnostic market", likelihood: "Medium", impact: "Medium", contingency: "Move faster \u2014 establish brand authority and market presence before larger players catch up. Focus on mid-market niche they won't prioritize." },
      { item: "Economic downturn reducing brand investment budgets", likelihood: "Low", impact: "High", contingency: "Position brand strategy as cost-saving (reduce wasted marketing spend) rather than cost-adding. Emphasize ROI metrics." },
    ],
    strategicImplications: "Acme Co's strongest play is to leverage its positioning clarity and unique methodology to become the definitive authority in B2B brand alignment \u2014 then use that authority to capture the AI search opportunity before competitors recognize it."
  },
  brandGlossary: {
    overview: "Use this glossary to ensure consistent language across all communications \u2014 website, social, sales, emails, and internal documents. Consistency builds trust; inconsistency erodes it.",
    termsToUse: [
      { term: "brand alignment", insteadOf: "brand consistency", context: "When discussing the relationship between brand strategy and execution", example: "Our brand alignment diagnostic reveals where strategy and execution diverge." },
      { term: "strategic partner", insteadOf: "vendor / agency / contractor", context: "When describing Acme Co's relationship with clients", example: "As your strategic partner, we'll guide you through implementation." },
      { term: "diagnostic", insteadOf: "test / quiz / assessment", context: "When referring to the WunderBrand Snapshot™ product", example: "Complete your brand diagnostic to uncover your alignment score." },
      { term: "brand system", insteadOf: "brand package / branding", context: "When describing the comprehensive brand deliverable", example: "Your WunderBrand Blueprint™ is a complete brand system \u2014 not just a logo and guidelines." },
      { term: "clarity", insteadOf: "simplicity", context: "When describing the benefit of brand work", example: "Brand clarity drives every decision \u2014 from marketing to hiring." },
      { term: "invest in", insteadOf: "spend on / pay for", context: "When discussing pricing or commitment", example: "When you invest in your WunderBrand Blueprint™, you're investing in long-term competitive advantage." },
      { term: "insights", insteadOf: "data / numbers / metrics", context: "When presenting diagnostic results to non-technical audiences", example: "Your diagnostic insights reveal three key opportunities for growth." },
      { term: "implementation", insteadOf: "execution / doing", context: "When describing the action phase after strategy", example: "The implementation phase is where strategy becomes visible to your audience." },
    ],
    phrasesToAvoid: [
      { phrase: "We're the best", why: "Self-congratulatory claims erode trust \u2014 let proof points speak.", alternative: "Our clients see an average 23-point improvement in brand alignment scores." },
      { phrase: "One-stop shop", why: "Implies generalist \u2014 conflicts with specialist positioning.", alternative: "Your complete brand alignment system, from diagnosis to implementation." },
      { phrase: "Cutting-edge / revolutionary", why: "Overused and signals insecurity about actual value.", alternative: "A proven framework trusted by 200+ B2B companies." },
      { phrase: "Synergy / leverage / pivot", why: "Corporate jargon that distances the brand from its approachable persona.", alternative: "Use plain language: 'work together,' 'build on,' 'shift focus.'" },
      { phrase: "It depends", why: "Sounds evasive \u2014 even when technically true.", alternative: "Here's how it typically works: [specific answer], though we'll calibrate to your situation." },
      { phrase: "Just / only / simply", why: "Minimizing language undermines the value of the recommendation.", alternative: "State the recommendation confidently without qualifiers." },
    ],
    industryJargonGuide: {
      useFreely: ["Brand positioning", "Value proposition", "Target audience", "Content strategy", "Conversion rate", "Brand equity", "Market positioning"],
      defineWhenUsed: ["AEO (Answer Engine Optimization)", "Brand alignment score", "Pillar analysis", "Brand archetype", "Entity optimization", "ICP (Ideal Customer Profile)"],
      neverUse: ["Growth hacking", "Disruptive innovation", "Move the needle", "Low-hanging fruit", "Circle back", "Take offline", "Best-in-class", "World-class"]
    }
  },
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
ARCHETYPE_META["The Guide"] = ARCHETYPE_META["The Sage"];

/* ─── Main Component ─── */
export default function BrandBlueprintPlusReport() {
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
          [data-two-col] { grid-template-columns: 1fr !important; }
          [data-three-col] { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}} />
      {/* ═══ HEADER ═══ */}
      <div style={{ background: WHITE, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "40%", opacity: 0.04, backgroundImage: `radial-gradient(${NAVY} 1px, transparent 1px)`, backgroundSize: "16px 16px" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div data-header-top style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: `1px solid ${BORDER}` }}>
            <a href={UTM_BASE} target="_blank" rel="noopener noreferrer">
              <img src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp" alt="Wunderbar Digital" style={{ height: 26, objectFit: "contain" }} />
            </a>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: NAVY, lineHeight: 1 }}>WunderBrand Blueprint+™</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: BLUE, marginTop: 3 }}>Powered by <a href={UTM_BASE} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: BLUE, textDecoration: "none" }}>Wunderbar Digital</a></span>
            </div>
          </div>

        {/* Report info + actions */}
        <div data-header-info style={{ padding: "22px 0 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>Complete Brand Operating System</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>Prepared for:</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: BLUE }}>{r.businessName}</div>
            <p style={{ fontSize: 13, color: SUB, margin: "6px 0 0" }}>{r.date}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#8A97A8", margin: "8px 0 0", letterSpacing: "0.04em" }}>Confidential — Prepared exclusively for {r.businessName}</p>
          </div>
          <div data-header-actions style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button aria-label="Print report" onClick={() => window.print()} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "8px 16px", minHeight: 36, borderRadius: 5,
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
              <button aria-label="Download report" onClick={() => {
                const el = document.querySelector('[data-report]') || document.querySelector('main') || document.body;
                if (el) {
                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>WunderBrand Blueprint+™ - ${r.businessName}</title><link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet"><style>body{margin:0;font-family:Lato,sans-serif;}</style></head><body>${el.outerHTML}</body></html>`;
                  const blob = new Blob([html], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Brand-Blueprint-Plus-${r.businessName.replace(/\s+/g, '-')}.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "8px 16px", minHeight: 36, borderRadius: 5,
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

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ padding: "28px 0 48px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Preview Banner */}
        <div style={{ background: "#fff9e6", border: "2px solid #f5e6b3", borderRadius: 5, padding: "12px 16px", fontSize: 14, color: "#8b6914", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <span><strong>Preview mode</strong> — Mock data showing WunderBrand Blueprint+™ structure.</span>
          <Link href="/preview" style={{ color: NAVY, fontWeight: 600, textDecoration: "underline" }}>← All previews</Link>
        </div>

        {/* How to use this Blueprint */}
        <div data-how-to-read style={{ padding: "14px 20px", borderRadius: 5, background: `${BLUE}06`, border: `1px solid ${BLUE}15`, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20, flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="1.8"/><path d="M12 8v5M12 16h.01" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/></svg>
          <div style={{ fontSize: 14, color: SUB, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: NAVY }}>How to use this Blueprint:</span> {r.blueprintOverview.howToUse}
          </div>
        </div>

        {/* ═══ 1. EXECUTIVE SUMMARY ═══ */}
        <Section id="executive-summary">
          <SectionTitle hero description="A strategic overview of your brand's alignment with prioritized focus areas.">Executive Summary</SectionTitle>
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
              { label: "Overall Score", value: String(overallScore), sub: "out of 100", pct: overallPct, pill: null as string | null, icon: <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}><circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="2"/><path d="M12 6v6l4 2" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/></svg> },
              { label: "Strongest Pillar", value: `${strongest.score}/20`, sub: null as string | null, pct: strongPct, pill: strongest.label, icon: <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}><path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" stroke={GREEN} strokeWidth="2" strokeLinejoin="round"/></svg> },
              { label: "Needs Attention", value: `${weakest.score}/20`, sub: null as string | null, pct: weakPct, pill: weakest.label, icon: <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}><path d="M12 9v4M12 17h.01" stroke={ORANGE} strokeWidth="2" strokeLinecap="round"/><path d="M10.3 3.2L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.2a2 2 0 00-3.4 0z" stroke={ORANGE} strokeWidth="2" strokeLinejoin="round"/></svg> },
            ];
            return (
              <>
                <div data-key-cards style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
                  {cards.map((card, i) => {
                    const tierColor = scoreColor(card.pct);
                    const tierLabel = scoreLabel(card.pct);
                    return (
                      <div key={i} style={{ padding: "20px", borderRadius: 5, border: `1px solid ${BORDER}`, background: LIGHT_BG, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                        {card.icon}
                        <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginTop: 8 }}>{card.label}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
                          <span style={{ fontSize: 30, fontWeight: 700, color: tierColor, lineHeight: 1 }}>{card.value}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: tierColor, textTransform: "uppercase" }}>{tierLabel}</span>
                        </div>
                        {card.sub && <div style={{ fontSize: 12, color: SUB, marginTop: 4 }}>{card.sub}</div>}
                        {card.pill && <div style={{ display: "inline-block", marginTop: 8, padding: "4px 14px", borderRadius: 5, background: `${BLUE}12`, border: `1px solid ${BLUE}30`, fontSize: 14, fontWeight: 700, color: NAVY }}>{card.pill}</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: "16px 20px", borderRadius: 5, marginBottom: 16, background: `${BLUE}08`, borderLeft: `3px solid ${BLUE}` }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, lineHeight: 1.6, fontStyle: "italic" }}>{r.executiveSummary.diagnosis.split(" because ")[0]}.</div>
                </div>
                <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75, marginBottom: 20 }}>{r.executiveSummary.synthesis}</div>
                {(r.executiveSummary as any).industryBenchmark && (
                  <div style={{ padding: "16px 20px", borderRadius: 5, background: `${BLUE}06`, borderLeft: `3px solid ${BLUE}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2 }}><rect x="2" y="10" width="4" height="8" rx="1" fill={BLUE} opacity="0.3"/><rect x="8" y="6" width="4" height="12" rx="1" fill={BLUE} opacity="0.5"/><rect x="14" y="2" width="4" height="16" rx="1" fill={BLUE} opacity="0.7"/></svg>
                    <div><div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Industry Benchmark</div><div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{(r.executiveSummary as any).industryBenchmark}</div></div>
                  </div>
                )}
              </>
            );
          })()}
        </Section>

        {/* ═══ CONTEXT COVERAGE ═══ */}
        <Section id="context-coverage">
          <SectionTitle description="How thoroughly we were able to analyze your brand based on the information provided.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="1.5" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round"/><circle cx="12" cy="12" r="3" fill={BLUE}/></svg>
              Context Coverage
            </span>
          </SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, padding: "20px 24px", background: `${BLUE}06`, borderRadius: 5, border: `1px solid ${BLUE}20` }}>
            <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
              <svg viewBox="0 0 80 80" style={{ width: 80, height: 80 }}>
                <circle cx="40" cy="40" r="34" fill="none" stroke={BORDER} strokeWidth="6"/>
                <circle cx="40" cy="40" r="34" fill="none" stroke={BLUE} strokeWidth="6" strokeDasharray={`${(r.contextCoverage.overallPercent / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`} strokeLinecap="round" transform="rotate(-90 40 40)"/>
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: NAVY }}>{r.contextCoverage.overallPercent}%</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Overall Context Coverage</div>
              <div style={{ fontSize: 15, color: SUB, lineHeight: 1.55 }}>We had sufficient information to provide a {r.contextCoverage.overallPercent >= 80 ? "highly detailed" : r.contextCoverage.overallPercent >= 60 ? "thorough" : "foundational"} analysis.</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {r.contextCoverage.areas.map((area, i) => (
              <div key={i} style={{ padding: "14px 16px", background: WHITE, borderRadius: 5, border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{area.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: area.status === "strong" ? `${GREEN}15` : area.status === "moderate" ? `${YELLOW}15` : `${RED_S}10`, color: area.status === "strong" ? GREEN : area.status === "moderate" ? "#92700C" : RED_S, textTransform: "uppercase", letterSpacing: "0.05em" }}>{area.percent}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: `${NAVY}10`, overflow: "hidden" }}>
                  <div style={{ width: `${area.percent}%`, height: "100%", borderRadius: 3, background: area.status === "strong" ? GREEN : area.status === "moderate" ? YELLOW : RED_S, transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
          {r.contextCoverage.contextGaps.length > 0 && (
            <div style={{ marginTop: 20, padding: "16px 20px", background: `${YELLOW}08`, borderRadius: 5, border: `1px solid ${YELLOW}25` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}><circle cx="10" cy="10" r="9" stroke={YELLOW} strokeWidth="1.5"/><path d="M10 6v5M10 14h.01" stroke={YELLOW} strokeWidth="1.8" strokeLinecap="round"/></svg><span style={{ fontSize: 13, fontWeight: 900, color: "#92700C", textTransform: "uppercase", letterSpacing: "0.08em" }}>Areas for Deeper Analysis</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{r.contextCoverage.contextGaps.map((gap, i) => (<div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: "#92700C", marginTop: 7, flexShrink: 0 }}/><span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{gap}</span></div>))}</div>
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
              href={`/refine/preview-blueprint-plus`}
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

        {/* ═══ 2. BRAND ALIGNMENT SCORE + FOCUS TOGGLE ═══ */}
        <Section id="brand-alignment-score">
          <SectionTitle hero description="A composite score measuring how well your brand communicates across five key pillars.">WunderBrand Score™</SectionTitle>
          <MainGauge score={r.executiveSummary.brandAlignmentScore} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 28 }}>
            <button aria-pressed={selectedFocus === "primary"} onClick={() => setSelectedFocus("primary")} style={{ padding: "18px 20px", borderRadius: 5, textAlign: "left", background: selectedFocus === "primary" ? `${BLUE}12` : WHITE, border: selectedFocus === "primary" ? `2px solid ${BLUE}` : `1px solid ${BORDER}`, cursor: "pointer", transition: "all 0.2s ease", position: "relative", overflow: "hidden" }}>
              {selectedFocus === "primary" && <div style={{ position: "absolute", top: 8, right: 8 }}><svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}><circle cx="10" cy="10" r="10" fill={BLUE}/><path d="M6 10l2.5 2.5L14 7" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: BLUE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>1</div><div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em" }}>Primary Focus Area</div></div>
              <div style={{ fontSize: 22, fontWeight: 900, color: NAVY }}>{r.executiveSummary.primaryFocusArea}</div>
              <div style={{ fontSize: 13, color: SUB, marginTop: 6 }}>Highest leverage opportunity</div>
            </button>
            <button aria-pressed={selectedFocus === "secondary"} onClick={() => setSelectedFocus("secondary")} style={{ padding: "18px 20px", borderRadius: 5, textAlign: "left", background: selectedFocus === "secondary" ? `${NAVY}10` : WHITE, border: selectedFocus === "secondary" ? `2px solid ${NAVY}` : `1px solid ${BORDER}`, cursor: "pointer", transition: "all 0.2s ease", position: "relative", overflow: "hidden" }}>
              {selectedFocus === "secondary" && <div style={{ position: "absolute", top: 8, right: 8 }}><svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}><circle cx="10" cy="10" r="10" fill={NAVY}/><path d="M6 10l2.5 2.5L14 7" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: NAVY, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>2</div><div style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.1em" }}>Secondary Focus Area</div></div>
              <div style={{ fontSize: 22, fontWeight: 900, color: NAVY }}>{r.executiveSummary.secondaryFocusArea}</div>
              <div style={{ fontSize: 13, color: SUB, marginTop: 6 }}>Supporting priority area</div>
            </button>
          </div>
        </Section>

        {/* ═══ 3. FOCUS AREA DIAGNOSIS (Both rendered, inactive hidden for print) ═══ */}
        <div id="focus-area-diagnosis">
          {/* Primary Focus Area Diagnosis */}
          <div data-print-always style={{ display: selectedFocus === "primary" ? "block" : "none" }}>
            <Section style={{ background: `linear-gradient(135deg, ${BLUE}04 0%, ${BLUE}08 100%)`, border: `2px solid ${BLUE}30` }}>
              <SectionTitle hero description={`Deep analysis of why ${r.executiveSummary.primaryFocusArea} is your highest-leverage focus area.`}><span style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: BLUE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>1</div>Primary Diagnosis: {r.executiveSummary.primaryFocusArea}</span></SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 40, borderRadius: 2, background: BLUE, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Why This Is Your Primary Focus</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.primary.whyFocus}</div></div></div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 40, borderRadius: 2, background: ORANGE, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Downstream Issues It Creates</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.primary.downstreamIssues}</div></div></div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 40, borderRadius: 2, background: GREEN, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>What Improves When Resolved</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.primary.whatImproves}</div></div></div>
              </div>
            </Section>
          </div>
          {/* Secondary Focus Area Diagnosis */}
          <div data-print-always data-print-label="Secondary Focus Area Diagnosis" style={{ display: selectedFocus === "secondary" ? "block" : "none" }}>
            <Section style={{ background: `linear-gradient(135deg, ${NAVY}04 0%, ${NAVY}08 100%)`, border: `2px solid ${NAVY}30` }}>
              <SectionTitle hero description={`Deep analysis of why ${r.executiveSummary.secondaryFocusArea} is a key supporting focus area.`}><span style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: NAVY, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>2</div>Secondary Diagnosis: {r.executiveSummary.secondaryFocusArea}</span></SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 40, borderRadius: 2, background: NAVY, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Why This Is A Key Focus</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.secondary.whyFocus}</div></div></div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 40, borderRadius: 2, background: ORANGE, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Downstream Issues It Creates</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.secondary.downstreamIssues}</div></div></div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 40, borderRadius: 2, background: GREEN, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>What Improves When Resolved</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.7 }}>{r.priorityDiagnosis.secondary.whatImproves}</div></div></div>
              </div>
            </Section>
          </div>
        </div>

        {/* ═══ 4. PILLAR DEEP DIVES ═══ */}
        <Section id="pillar-deep-dives" pageBreak>
          <SectionTitle description="Strategic analysis of each pillar with examples, step-by-step implementation guides, and recommended tools.">Pillar Deep Dives</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px", padding: "20px 24px", background: LIGHT_BG, borderRadius: 5, marginBottom: 24 }}>{PILLARS.map((p) => (<div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}><PillarIcon pillar={p} size={20} /><div style={{ flex: 1 }}><PillarMeter score={r.pillarDeepDives[p].score} label={PILLAR_LABELS[p]} /></div></div>))}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{PILLARS.map((p) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const d = r.pillarDeepDives[p] as any;
            const pct = (d.score / 20) * 100;
            return (
              <div key={p} style={{ padding: "28px", borderRadius: 5, border: `1px solid ${BORDER}`, background: WHITE }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><PillarIcon pillar={p} size={24} /><span style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>{PILLAR_LABELS[p]}</span></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(pct), textTransform: "uppercase" }}>{scoreLabel(pct)}</span><div style={{ padding: "5px 14px", borderRadius: 5, background: scoreColor(pct), color: WHITE, fontSize: 18, fontWeight: 900 }}>{d.score}/20</div></div></div>
                <div style={{ fontSize: 15, fontWeight: 700, color: SUB, marginBottom: 16, fontStyle: "italic" }}>{d.interpretation}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>What&apos;s Happening Now</span></div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{d.whatsHappeningNow}</div></div>
                  <div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>Why It Matters Commercially</span></div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{d.whyItMattersCommercially}</div></div>
                  {(d as any).industryContext && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div style={{ padding: "16px 18px", borderRadius: 5, background: `${BLUE}06`, borderTop: `3px solid ${BLUE}` }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}><rect x="2" y="10" width="4" height="8" rx="1" fill={BLUE} opacity="0.3"/><rect x="8" y="6" width="4" height="12" rx="1" fill={BLUE} opacity="0.5"/><rect x="14" y="2" width="4" height="16" rx="1" fill={BLUE} opacity="0.7"/></svg><span style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Industry Context</span></div><div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{(d as any).industryContext}</div></div>
                    <div style={{ padding: "16px 18px", borderRadius: 5, background: `${GREEN}06`, borderTop: `3px solid ${GREEN}` }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}><circle cx="10" cy="10" r="8" stroke={GREEN} strokeWidth="1.5" opacity="0.5"/><text x="10" y="14" textAnchor="middle" fill={GREEN} fontSize="11" fontWeight="bold">$</text></svg><span style={{ fontSize: 12, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.06em" }}>Financial Impact</span></div><div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{(d as any).financialImpact}</div></div>
                    <div style={{ padding: "16px 18px", borderRadius: 5, background: `${ORANGE}08`, borderTop: `3px solid ${ORANGE}` }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}><path d="M10 2L18 17H2L10 2z" stroke={ORANGE} strokeWidth="1.5" fill={ORANGE} opacity="0.15"/><path d="M10 8v4M10 14v1" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round"/></svg><span style={{ fontSize: 12, fontWeight: 900, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Risk of Inaction</span></div><div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{(d as any).riskOfInaction}</div></div>
                  </div>}
                  <div style={{ background: LIGHT_BG, borderRadius: 5, padding: "18px 20px" }}><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Example</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><div style={{ padding: "14px 16px", borderRadius: 5, background: `${RED_S}08`, border: `1px solid ${RED_S}20` }}><div style={{ fontSize: 12, fontWeight: 900, color: RED_S, textTransform: "uppercase", marginBottom: 6 }}>Before</div><div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.5, fontStyle: "italic" }}>&quot;{d.concreteExample.before}&quot;</div></div><div style={{ padding: "14px 16px", borderRadius: 5, background: `${GREEN}08`, border: `1px solid ${GREEN}20` }}><div style={{ fontSize: 12, fontWeight: 900, color: GREEN, textTransform: "uppercase", marginBottom: 6 }}>After</div><div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.5, fontStyle: "italic" }}>&quot;{d.concreteExample.after}&quot;</div></div></div></div>
                  <div style={{ padding: "14px 18px", borderRadius: 5, background: `${BLUE}06`, borderLeft: `3px solid ${BLUE}` }}><div style={{ fontSize: 14, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Strategic Recommendation</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{d.strategicRecommendation}</div></div>

                  {/* Implementation Guide */}
                  {d.implementationGuide && (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}><rect x="2" y="2" width="12" height="12" rx="2" stroke={GREEN} strokeWidth="1.3"/><path d="M5 8l2 2 4-4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize: 14, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>How to Implement This</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(d.implementationGuide as Array<{step: string; detail: string}>).map((guide: {step: string; detail: string}, gi: number) => (
                          <div key={gi} style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 6, background: gi % 2 === 0 ? `${GREEN}04` : WHITE, border: `1px solid ${BORDER}` }}>
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: GREEN, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{gi + 1}</div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{guide.step}</div>
                              <div style={{ fontSize: 13.5, color: "#1a1a2e", lineHeight: 1.6 }}>{guide.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools & Resources */}
                  {d.toolsAndResources && (
                    <div style={{ display: "flex", gap: 10, padding: "12px 16px", background: `${NAVY}04`, borderRadius: 5, borderLeft: `3px solid ${NAVY}30`, marginTop: 4 }}>
                      <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }}><path d="M9.5 2.5L13.5 6.5L6 14H2V10L9.5 2.5Z" stroke={NAVY} strokeWidth="1.3" strokeLinejoin="round"/></svg>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Recommended Tools</div>
                        <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55 }}>{d.toolsAndResources}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ paddingTop: 14, borderTop: `1px solid ${BORDER}`, marginTop: 4 }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}><circle cx="8" cy="8" r="6" stroke={GREEN} strokeWidth="1.3"/><path d="M8 5v3l2 1" stroke={GREEN} strokeWidth="1.3" strokeLinecap="round"/></svg><span style={{ fontSize: 14, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>Success Looks Like</span></div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65, fontWeight: 600 }}>{d.successLooksLike}</div></div>
                </div>
              </div>
            );
          })}</div>
        </Section>

        {/* ═══ STRATEGIC ALIGNMENT OVERVIEW ═══ */}
        <Section id="strategic-alignment" pageBreak>
          <SectionTitle hero description="How your five brand pillars interact — where they reinforce each other and where misalignment creates friction."><span style={{ display: "flex", alignItems: "center", gap: 10 }}><svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><circle cx="12" cy="12" r="3" fill={BLUE}/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/></svg>Strategic Alignment Overview</span></SectionTitle>
          <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75, marginBottom: 24 }}>{r.strategicAlignmentOverview.summary}</div>
          <div style={{ marginBottom: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><span style={{ fontSize: 14, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>Reinforcing Connections</span></div><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{r.strategicAlignmentOverview.reinforcements.map((item, i) => (<div key={i} style={{ padding: "16px 20px", background: `${GREEN}06`, borderRadius: 5, borderLeft: `3px solid ${GREEN}` }}><div style={{ fontSize: 14, fontWeight: 700, color: GREEN, marginBottom: 6 }}>{item.pillars}</div><div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{item.insight}</div></div>))}</div></div>
          <div style={{ marginBottom: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><span style={{ fontSize: 14, fontWeight: 900, color: RED_S, textTransform: "uppercase", letterSpacing: "0.08em" }}>Friction Points</span></div><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{r.strategicAlignmentOverview.conflicts.map((item, i) => (<div key={i} style={{ padding: "16px 20px", background: `${RED_S}04`, borderRadius: 5, borderLeft: `3px solid ${RED_S}` }}><div style={{ fontSize: 14, fontWeight: 700, color: RED_S, marginBottom: 6 }}>{item.pillars}</div><div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{item.insight}</div></div>))}</div></div>
          <div style={{ padding: "18px 22px", borderRadius: 5, background: `${BLUE}08`, borderLeft: `3px solid ${BLUE}` }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ fontSize: 14, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em" }}>Recommended Sequence</span></div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{r.strategicAlignmentOverview.systemRecommendation}</div></div>
        </Section>

        {/* ═══ STRATEGIC OVERVIEW (Blueprint+ Exclusive) ═══ */}
        <Section id="strategic-overview" pageBreak style={{ background: `linear-gradient(135deg, ${BLUE}06 0%, ${NAVY}04 100%)`, border: `2px solid ${BLUE}20` }}>
          <SectionTitle hero description="Where your brand stands in the market and the strategic leverage this WunderBrand Blueprint+™ creates.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" fill={BLUE} opacity="0.15"/><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/></svg>
              Strategic Overview
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: `${BLUE}15`, fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 8 }}>Blueprint+ Exclusive</span>
            </span>
          </SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ padding: "20px 24px", background: `${BLUE}08`, borderRadius: 5, borderLeft: `4px solid ${BLUE}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Where You&apos;re Positioned</div>
              <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75 }}>{r.strategicOverview.wherePositioned}</div>
            </div>
            <div style={{ padding: "20px 24px", background: `${NAVY}04`, borderRadius: 5, borderLeft: `4px solid ${NAVY}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Strategic Leverage Created</div>
              <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75 }}>{r.strategicOverview.leverageCreated}</div>
            </div>
          </div>
        </Section>

        {/* ═══ 2. BLUEPRINT+ OVERVIEW ═══ */}
        <Section id="blueprint-overview">
          <SectionTitle hero description="What this system enables and how to get maximum value from it.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><rect x="3" y="3" width="18" height="18" rx="3" stroke={BLUE} strokeWidth="1.5"/><path d="M8 8h8M8 12h8M8 16h4" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/></svg>
              WunderBrand Blueprint+™ Overview
            </span>
          </SectionTitle>

          <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75 }}>
            {r.blueprintOverview.whatThisEnables}
          </div>
        </Section>

        {/* ═══ 3. BRAND FOUNDATION ═══ */}
        <Section id="brand-foundation" pageBreak style={{ background: `linear-gradient(135deg, ${NAVY}04 0%, ${BLUE}06 100%)`, border: `2px solid ${NAVY}15` }}>
          <SectionTitle hero description="The strategic foundation that every brand decision traces back to.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M12 2L3 9l9 6 9-6-9-7z" fill={BLUE} opacity="0.1"/><path d="M3 9l9 6 9-6M3 13l9 6 9-6" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/></svg>
              Brand Foundation
            </span>
          </SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Brand Purpose</div>
              <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65, fontWeight: 600 }}>{r.brandFoundation.brandPurpose}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Brand Promise</div>
              <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65, fontWeight: 600 }}>{r.brandFoundation.brandPromise}</div>
            </div>

            <div style={{ padding: "20px 24px", background: `${BLUE}08`, borderRadius: 5, borderLeft: `4px solid ${BLUE}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Positioning Statement</div>
              <div style={{ fontSize: 17, color: "#1a1a2e", lineHeight: 1.65, fontStyle: "italic", fontWeight: 500 }}>"{r.brandFoundation.positioningStatement}"</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Differentiation Narrative</div>
              <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65 }}>{r.brandFoundation.differentiationNarrative}</div>
            </div>
          </div>
        </Section>

        {/* ═══ BRAND ARCHETYPE SYSTEM + ARCHETYPE ACTIVATION ═══ */}
        <Section id="brand-archetypes" pageBreak style={{ background: `linear-gradient(135deg, ${NAVY}05 0%, ${BLUE}08 100%)` }}>
          <SectionTitle hero description="Your brand archetype system defines the personality pattern that shapes your messaging and positioning.">Brand Archetype System</SectionTitle>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, textAlign: "center" }}>Click to explore each archetype</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <button aria-pressed={selectedArchetype === "primary"} onClick={() => setSelectedArchetype("primary")} style={{ padding: "24px", borderRadius: 5, background: WHITE, border: selectedArchetype === "primary" ? `2px solid ${BLUE}` : `1px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", transition: "all 0.2s ease", transform: selectedArchetype === "primary" ? "scale(1.02)" : "scale(1)", boxShadow: selectedArchetype === "primary" ? `0 4px 12px ${BLUE}20` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><div style={{ width: 24, height: 24, borderRadius: "50%", background: selectedArchetype === "primary" ? BLUE : LIGHT_BG, color: selectedArchetype === "primary" ? WHITE : SUB, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>1</div><div style={{ fontSize: 10, fontWeight: 700, color: selectedArchetype === "primary" ? BLUE : SUB, textTransform: "uppercase", letterSpacing: "0.1em" }}>Primary</div></div>
                <div style={{ width: 90, height: 90, borderRadius: 5, background: selectedArchetype === "primary" ? `${BLUE}12` : LIGHT_BG, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><ArchetypeIcon name={r.brandArchetypeSystem.primary.name} size={65} /></div>
                <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{r.brandArchetypeSystem.primary.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: SUB, fontStyle: "italic", marginTop: 4, textAlign: "center" }}>&quot;{ARCHETYPE_META[r.brandArchetypeSystem.primary.name]?.tagline}&quot;</div>
              </button>
              <button aria-pressed={selectedArchetype === "secondary"} onClick={() => setSelectedArchetype("secondary")} style={{ padding: "24px", borderRadius: 5, background: WHITE, border: selectedArchetype === "secondary" ? `2px solid ${BLUE}` : `1px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", transition: "all 0.2s ease", transform: selectedArchetype === "secondary" ? "scale(1.02)" : "scale(1)", boxShadow: selectedArchetype === "secondary" ? `0 4px 12px ${BLUE}20` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><div style={{ width: 24, height: 24, borderRadius: "50%", background: selectedArchetype === "secondary" ? BLUE : LIGHT_BG, color: selectedArchetype === "secondary" ? WHITE : SUB, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>2</div><div style={{ fontSize: 10, fontWeight: 700, color: selectedArchetype === "secondary" ? BLUE : SUB, textTransform: "uppercase", letterSpacing: "0.1em" }}>Secondary</div></div>
                <div style={{ width: 90, height: 90, borderRadius: 5, background: selectedArchetype === "secondary" ? `${BLUE}12` : LIGHT_BG, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><ArchetypeIcon name={r.brandArchetypeSystem.secondary.name} size={65} /></div>
                <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{r.brandArchetypeSystem.secondary.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: SUB, fontStyle: "italic", marginTop: 4, textAlign: "center" }}>&quot;{ARCHETYPE_META[r.brandArchetypeSystem.secondary.name]?.tagline}&quot;</div>
              </button>
            </div>
          </div>
          {/* Archetype detail — both rendered, inactive hidden for print */}
          {(["primary", "secondary"] as const).map((key) => {
            const arch = r.brandArchetypeSystem[key];
            const isActive = selectedArchetype === key;
            return (
              <div key={key} data-print-always={true} data-print-label={key === "secondary" ? `Secondary Archetype: ${arch.name}` : undefined} style={{ display: isActive ? "block" : "none", marginBottom: 20 }}>
                <div style={{ padding: "24px", borderRadius: 5, background: WHITE, border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><ArchetypeIcon name={arch.name} size={40} /><div><div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{arch.name}</div><div style={{ fontSize: 13, color: SUB }}>{ARCHETYPE_META[arch.name]?.description}</div></div></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 36, borderRadius: 2, background: GREEN, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>When Aligned</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{arch.whenAligned}</div></div></div>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 36, borderRadius: 2, background: ORANGE, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Risk If Misused</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{arch.riskIfMisused}</div></div></div>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 36, borderRadius: 2, background: BLUE, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Language & Tone</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{arch.languageTone}</div></div></div>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 36, borderRadius: 2, background: NAVY, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Behavior Guide</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{arch.behaviorGuide}</div></div></div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ padding: "18px 22px", borderRadius: 5, background: `${BLUE}08`, borderLeft: `3px solid ${BLUE}`, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>How Your Archetypes Work Together</div>
            <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65 }}>{r.brandArchetypeSystem.howTheyWorkTogether}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Archetype Activation — How It Shows Up</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {([{ key: "messaging" as const, label: "Messaging", icon: <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}><path d="M17 10.5a7 7 0 01-.75 3.15A7.08 7.08 0 0110 17a7 7 0 01-3.15-.75L3 17.5l1.25-3.85A7 7 0 013.5 10.5 7.08 7.08 0 017 4.33 7 7 0 0110.15 3.5h.35A7.07 7.07 0 0117 10.15v.35z" stroke={BLUE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }, { key: "content" as const, label: "Content", icon: <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}><rect x="3" y="2" width="14" height="16" rx="2" stroke={BLUE} strokeWidth="1.3"/><path d="M7 6h6M7 10h6M7 14h4" stroke={BLUE} strokeWidth="1.3" strokeLinecap="round"/></svg> }, { key: "salesConversations" as const, label: "Sales Conversations", icon: <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}><circle cx="10" cy="7" r="4" stroke={BLUE} strokeWidth="1.3"/><path d="M3 17v-1a5 5 0 0110 0v1" stroke={BLUE} strokeWidth="1.3" strokeLinecap="round"/></svg> }, { key: "visualTone" as const, label: "Visual Tone", icon: <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}><circle cx="10" cy="10" r="7" stroke={BLUE} strokeWidth="1.3"/><circle cx="10" cy="10" r="3" fill={BLUE} opacity="0.2"/></svg> }]).map((item, i) => {
              const activation = r.brandArchetypeActivation.activation[item.key] as { guidance: string; examples: Array<{ context: string; onBrand: string; offBrand: string }> };
              return (
                <div key={i} style={{ padding: "20px 24px", background: WHITE, borderRadius: 8, border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    {item.icon}
                    <span style={{ fontSize: 15, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</span>
                  </div>
                  <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 16 }}>{activation.guidance}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {activation.examples.map((ex, ei) => (
                      <div key={ei} style={{ borderRadius: 6, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                        <div style={{ padding: "8px 14px", background: LIGHT_BG, borderBottom: `1px solid ${BORDER}` }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.06em" }}>{ex.context}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                          <div style={{ padding: "12px 14px", borderRight: `1px solid ${BORDER}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                              <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}><circle cx="7" cy="7" r="6" fill={GREEN} opacity="0.15"/><path d="M4 7l2 2 4-4" stroke={GREEN} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase" }}>On-Brand</span>
                            </div>
                            <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55 }}>{ex.onBrand}</div>
                          </div>
                          <div style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                              <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}><circle cx="7" cy="7" r="6" fill={RED_S} opacity="0.15"/><path d="M5 5l4 4M9 5l-4 4" stroke={RED_S} strokeWidth="1.3" strokeLinecap="round"/></svg>
                              <span style={{ fontSize: 11, fontWeight: 700, color: RED_S, textTransform: "uppercase" }}>Off-Brand</span>
                            </div>
                            <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55 }}>{ex.offBrand}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ═══ 6. MESSAGING SYSTEM ═══ */}
        <Section id="messaging-system">
          <SectionTitle hero description="Your complete messaging hierarchy — from core message to proof points to language guardrails.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Messaging System
            </span>
          </SectionTitle>

          {/* Core Message */}
          <div style={{ padding: "20px 24px", background: `${BLUE}08`, borderRadius: 5, borderLeft: `4px solid ${BLUE}`, marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Core Message</div>
            <div style={{ fontSize: 17, color: "#1a1a2e", lineHeight: 1.65, fontWeight: 600 }}>{r.messagingSystem.coreMessage}</div>
          </div>

          {/* Supporting Messages */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Supporting Messages</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {r.messagingSystem.supportingMessages.map((msg, i) => (
                <div key={i} style={{ padding: "12px 16px", borderLeft: `3px solid ${BLUE}40`, background: `${BLUE}04`, borderRadius: "0 5px 5px 0" }}>
                  <span style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.55 }}>{msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proof Points */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Proof Points</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {r.messagingSystem.proofPoints.map((point, i) => (
                <div key={i} style={{ padding: "14px 16px", background: `${GREEN}06`, borderRadius: 5, border: `1px solid ${GREEN}20`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={GREEN} opacity="0.2"/><path d="M5 8l2 2 4-4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What NOT to Say */}
          <div style={{ padding: "16px 20px", background: `${RED_S}04`, borderRadius: 5, borderLeft: `3px solid ${RED_S}` }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: RED_S, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>What NOT to Say</div>
            {r.messagingSystem.whatNotToSay.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={RED_S} opacity="0.15"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={RED_S} strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ ADVANCED MESSAGING MATRIX (Blueprint+ Exclusive) ═══ */}
        <Section id="messaging-matrix" style={{ background: `linear-gradient(135deg, ${BLUE}04 0%, ${NAVY}04 100%)`, border: `2px solid ${BLUE}15` }}>
          <SectionTitle hero description="Multi-dimensional messaging strategy — tailored by audience, funnel stage, and channel for maximum impact.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><rect x="3" y="3" width="7" height="7" rx="1" stroke={BLUE} strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke={BLUE} strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke={BLUE} strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke={BLUE} strokeWidth="1.5"/></svg>
              Advanced Messaging Matrix
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: `${BLUE}15`, fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 8 }}>Blueprint+ Exclusive</span>
            </span>
          </SectionTitle>

          {/* By Audience */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Messaging by Audience</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {r.advancedMessagingMatrix.byAudience.map((item: any, i: number) => (
                <div key={i} style={{ borderRadius: 6, background: WHITE, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}><circle cx="12" cy="8" r="4" stroke={BLUE} strokeWidth="1.5"/><path d="M4 20v-1a6 6 0 0112 0v1" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{item.audience}</div>
                      <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{item.message}</div>
                    </div>
                  </div>
                  {item.exampleCopy && (
                    <div style={{ padding: "10px 20px 14px", borderTop: `1px dashed ${BORDER}`, background: `${BLUE}03` }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}><svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}><path d="M4 2v3l3 2-3 2v3l7-5-7-5z" fill={BLUE}/></svg><span style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Example Copy</span></div>
                      <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55, fontStyle: "italic" }}>{item.exampleCopy}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* By Funnel Stage */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Messaging by Funnel Stage</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(["awareness", "consideration", "decision", "retention"] as const).map((stage, i) => {
                const stageLabels = { awareness: "Awareness", consideration: "Consideration", decision: "Decision", retention: "Retention" };
                const stageColors = { awareness: BLUE, consideration: NAVY, decision: GREEN, retention: GOOD_GREEN };
                return (
                  <div key={stage} style={{ borderRadius: 6, borderLeft: `4px solid ${stageColors[stage]}`, background: `${stageColors[stage]}06`, overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: stageColors[stage], color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>{i + 1}</div>
                        <span style={{ fontSize: 13, fontWeight: 900, color: stageColors[stage], textTransform: "uppercase", letterSpacing: "0.08em" }}>{stageLabels[stage]}</span>
                      </div>
                      <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6, marginLeft: 30 }}>{(r.advancedMessagingMatrix.byFunnelStage[stage] as any).message || r.advancedMessagingMatrix.byFunnelStage[stage]}</div>
                    </div>
                    {(r.advancedMessagingMatrix.byFunnelStage[stage] as any).exampleCopy && (
                      <div style={{ padding: "10px 20px 14px", borderTop: `1px dashed ${stageColors[stage]}20`, marginLeft: 30 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}><svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}><path d="M4 2v3l3 2-3 2v3l7-5-7-5z" fill={stageColors[stage]}/></svg><span style={{ fontSize: 11, fontWeight: 700, color: stageColors[stage], textTransform: "uppercase", letterSpacing: "0.06em" }}>Example Copy</span></div>
                        <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55, fontStyle: "italic" }}>{(r.advancedMessagingMatrix.byFunnelStage[stage] as any).exampleCopy}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Channel */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Messaging by Channel</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {(["website", "email", "social", "paid", "sales"] as const).map((ch) => {
                const channelLabels: Record<string, string> = { website: "Website", email: "Email", social: "Social Media", paid: "Paid Advertising", sales: "Sales Conversations" };
                const channelIcons: Record<string, React.JSX.Element> = {
                  website: <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}><circle cx="10" cy="10" r="8" stroke={BLUE} strokeWidth="1.5"/><path d="M2 10h16M10 2c2.5 3 3.5 5 3.5 8s-1 5-3.5 8c-2.5-3-3.5-5-3.5-8s1-5 3.5-8z" stroke={BLUE} strokeWidth="1.2"/></svg>,
                  email: <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}><rect x="2" y="4" width="16" height="12" rx="2" stroke={BLUE} strokeWidth="1.5"/><path d="M2 4l8 6 8-6" stroke={BLUE} strokeWidth="1.5"/></svg>,
                  social: <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}><circle cx="6" cy="6" r="2.5" stroke={BLUE} strokeWidth="1.2"/><circle cx="14" cy="6" r="2.5" stroke={BLUE} strokeWidth="1.2"/><circle cx="10" cy="14" r="2.5" stroke={BLUE} strokeWidth="1.2"/><path d="M8 7l2 5M12 7l-2 5" stroke={BLUE} strokeWidth="1"/></svg>,
                  paid: <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}><rect x="2" y="4" width="16" height="12" rx="2" stroke={BLUE} strokeWidth="1.5"/><path d="M10 8v4M8 10h4" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/></svg>,
                  sales: <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}><path d="M3 3h14v10H7l-4 4V3z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
                };
                return (
                  <div key={ch} style={{ padding: "14px 16px", background: WHITE, borderRadius: 6, border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      {channelIcons[ch]}
                      <span style={{ fontSize: 13, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.06em" }}>{channelLabels[ch]}</span>
                    </div>
                    <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55, marginBottom: (r.advancedMessagingMatrix.byChannel[ch] as any).exampleCopy ? 8 : 0 }}>{(r.advancedMessagingMatrix.byChannel[ch] as any).guidance || r.advancedMessagingMatrix.byChannel[ch]}</div>
                    {(r.advancedMessagingMatrix.byChannel[ch] as any).exampleCopy && (
                      <div style={{ padding: "8px 10px", borderRadius: 4, background: `${BLUE}04`, borderLeft: `2px solid ${BLUE}30` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Example</div>
                        <div style={{ fontSize: 12.5, color: "#1a1a2e", lineHeight: 1.5, fontStyle: "italic" }}>{(r.advancedMessagingMatrix.byChannel[ch] as any).exampleCopy}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ═══ YOUR BRAND PERSONA ═══ */}
        <Section id="brand-persona" pageBreak>
          <SectionTitle hero description="How your brand should present itself — your personality, voice, and communication style.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><circle cx="12" cy="8" r="5" stroke={BLUE} strokeWidth="1.8"/><path d="M3 21v-2c0-2.8 2.2-5 5-5h8c2.8 0 5 2.2 5 5v2" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/></svg>
              Your Brand Persona
            </span>
          </SectionTitle>
          <div style={{ padding: "18px 22px", borderRadius: 5, marginBottom: 24, background: `${BLUE}08`, borderLeft: `4px solid ${BLUE}` }}>
            <div style={{ fontSize: 17, color: "#1a1a2e", lineHeight: 1.7, fontStyle: "italic" }}>{r.brandPersona.personaSummary}</div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Core Identity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 36, borderRadius: 2, background: BLUE, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Who You Are</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{r.brandPersona.coreIdentity.whoYouAre}</div></div></div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 36, borderRadius: 2, background: NAVY, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>What You Stand For</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{r.brandPersona.coreIdentity.whatYouStandFor}</div></div></div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 4, minHeight: 36, borderRadius: 2, background: GREEN, flexShrink: 0, marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginBottom: 4 }}>How You Show Up</div><div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.6 }}>{r.brandPersona.coreIdentity.howYouShowUp}</div></div></div>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Communication Style</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div style={{ padding: "16px", borderRadius: 5, background: LIGHT_BG, border: `1px solid ${BORDER}` }}><div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Tone</div><div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.5 }}>{r.brandPersona.communicationStyle.tone}</div></div>
              <div style={{ padding: "16px", borderRadius: 5, background: LIGHT_BG, border: `1px solid ${BORDER}` }}><div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Pace</div><div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.5 }}>{r.brandPersona.communicationStyle.pace}</div></div>
              <div style={{ padding: "16px", borderRadius: 5, background: LIGHT_BG, border: `1px solid ${BORDER}` }}><div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Energy</div><div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.5 }}>{r.brandPersona.communicationStyle.energy}</div></div>
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Voice Traits</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{r.visualVerbalSignals.voiceTraits.map((trait, i) => (<span key={i} style={{ padding: "8px 18px", borderRadius: 5, background: `${BLUE}10`, border: `1px solid ${BLUE}25`, fontSize: 15, fontWeight: 700, color: NAVY }}>{trait}</span>))}</div>
          </div>

          {/* Messaging Examples — Before/After */}
          {(r.brandPersona as any).messagingExamples && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}><path d="M3 3h14v10H7l-4 4V3z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 7h6M7 10h3" stroke={BLUE} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/></svg>
                <span style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>Messaging Examples — Before &amp; After</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(["elevator", "linkedin", "email", "proposal"] as const).map((key) => {
                  const labels: Record<string, string> = { elevator: "Elevator Pitch", linkedin: "LinkedIn Post", email: "Cold Email", proposal: "Proposal Language" };
                  const ex = (r.brandPersona as any).messagingExamples[key];
                  if (!ex) return null;
                  return (
                    <div key={key} style={{ borderRadius: 6, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                      <div style={{ padding: "10px 18px", background: `${NAVY}06`, borderBottom: `1px solid ${BORDER}` }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.06em" }}>{labels[key]}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                        <div style={{ padding: "14px 18px", borderRight: `1px solid ${BORDER}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}><circle cx="7" cy="7" r="6" fill={RED_S} opacity="0.15"/><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke={RED_S} strokeWidth="1.3" strokeLinecap="round"/></svg>
                            <span style={{ fontSize: 11, fontWeight: 700, color: RED_S, textTransform: "uppercase" }}>Instead of This</span>
                          </div>
                          <div style={{ fontSize: 13.5, color: "#555", lineHeight: 1.55, fontStyle: "italic" }}>&ldquo;{ex.wrong}&rdquo;</div>
                        </div>
                        <div style={{ padding: "14px 18px", background: `${GREEN}04` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}><circle cx="7" cy="7" r="6" fill={GREEN} opacity="0.15"/><path d="M4 7l2 2 4-4" stroke={GREEN} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase" }}>Try This</span>
                          </div>
                          <div style={{ fontSize: 13.5, color: "#1a1a2e", lineHeight: 1.55, fontStyle: "italic", fontWeight: 600 }}>&ldquo;{ex.right}&rdquo;</div>
                        </div>
                      </div>
                      <div style={{ padding: "8px 18px", background: `${BLUE}04`, borderTop: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 12.5, color: NAVY, lineHeight: 1.5 }}><strong>Why:</strong> {ex.why}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhanced Communication Guidelines */}
          {(r.brandPersona as any).communicationGuidelines && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Communication Guidelines</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <svg viewBox="0 0 14 14" fill="none" style={{ width: 14, height: 14 }}><circle cx="7" cy="7" r="6" fill={GREEN} opacity="0.15"/><path d="M4 7l2 2 4-4" stroke={GREEN} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.06em" }}>Do</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(r.brandPersona as any).communicationGuidelines.dos.map((item: any, i: number) => (
                      <div key={i} style={{ padding: "12px 14px", borderRadius: 5, background: `${GREEN}04`, borderLeft: `3px solid ${GREEN}` }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>{item.do || item}</div>
                        {item.example && <div style={{ fontSize: 12.5, color: SUB, lineHeight: 1.5, fontStyle: "italic" }}>{item.example}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <svg viewBox="0 0 14 14" fill="none" style={{ width: 14, height: 14 }}><circle cx="7" cy="7" r="6" fill={RED_S} opacity="0.15"/><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke={RED_S} strokeWidth="1.3" strokeLinecap="round"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 900, color: RED_S, textTransform: "uppercase", letterSpacing: "0.06em" }}>Don&apos;t</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(r.brandPersona as any).communicationGuidelines.donts.map((item: any, i: number) => (
                      <div key={i} style={{ padding: "12px 14px", borderRadius: 5, background: `${RED_S}03`, borderLeft: `3px solid ${RED_S}` }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>{item.dont || item}</div>
                        {item.example && <div style={{ fontSize: 12.5, color: SUB, lineHeight: 1.5, fontStyle: "italic" }}>{item.example}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ═══ AUDIENCE & PERSONA DEFINITION (expanded) ═══ */}
        <Section>
          <SectionTitle hero description="Who your brand speaks to, what motivates them, and what holds them back.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><circle cx="9" cy="7" r="4" stroke={BLUE} strokeWidth="1.5"/><path d="M2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/><circle cx="19" cy="9" r="3" stroke={BLUE} strokeWidth="1.5" opacity="0.5"/><path d="M19 15a4 4 0 014 4v2" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/></svg>
              Audience &amp; Persona Definition
            </span>
          </SectionTitle>
          <div style={{ padding: "20px 24px", background: `${BLUE}06`, borderRadius: 5, border: `1px solid ${BLUE}20`, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Primary Audience</div>
            <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.65, fontWeight: 600 }}>{r.audienceClarity.audienceSignals.primaryAudience}</div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Key Characteristics</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{r.audienceClarity.audienceSignals.audienceCharacteristics.map((char, i) => (<div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 16px", background: WHITE, borderRadius: 5, border: `1px solid ${BORDER}` }}><svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={BLUE} opacity="0.15"/><path d="M5 8l2 2 4-4" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{char}</span></div>))}</div>
          </div>
          <div style={{ padding: "16px 20px", background: `${NAVY}05`, borderRadius: 5, borderLeft: `3px solid ${NAVY}`, marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>How They Talk About Their Problem</div>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, fontStyle: "italic" }}>{r.audienceClarity.audienceSignals.audienceLanguage}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><span style={{ fontSize: 14, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>What Motivates Them</span></div><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{r.audienceClarity.decisionDrivers.motivators.map((m, i) => (<div key={i} style={{ padding: "14px 16px", background: `${GREEN}05`, borderRadius: 5, borderLeft: `3px solid ${GREEN}` }}><div style={{ fontSize: 14, fontWeight: 700, color: GREEN, marginBottom: 4 }}>{m.driver}</div><div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{m.explanation}</div></div>))}</div></div>
            <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><span style={{ fontSize: 14, fontWeight: 900, color: RED_S, textTransform: "uppercase", letterSpacing: "0.08em" }}>What Holds Them Back</span></div><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{r.audienceClarity.decisionDrivers.hesitationFactors.map((h, i) => (<div key={i} style={{ padding: "14px 16px", background: `${RED_S}04`, borderRadius: 5, borderLeft: `3px solid ${RED_S}` }}><div style={{ fontSize: 14, fontWeight: 700, color: RED_S, marginBottom: 4 }}>{h.factor}</div><div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{h.explanation}</div></div>))}</div></div>
          </div>
          <div style={{ padding: "18px 22px", background: `${NAVY}04`, borderRadius: 5, border: `1px solid ${NAVY}12`, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Secondary Audience</div>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{r.audiencePersonaDefinition.secondaryAudience}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ padding: "16px 20px", background: `${GREEN}06`, borderRadius: 5, borderLeft: `3px solid ${GREEN}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Decision Drivers</div>
              {r.audiencePersonaDefinition.decisionDrivers.map((item, i) => (<div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}><svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={GREEN} opacity="0.2"/><path d="M5 8l2 2 4-4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{item}</span></div>))}
            </div>
            <div style={{ padding: "16px 20px", background: `${YELLOW}08`, borderRadius: 5, borderLeft: `3px solid ${YELLOW}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#92700C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Objections to Overcome</div>
              {r.audiencePersonaDefinition.objectionsToOvercome.map((item, i) => (<div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}><svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={YELLOW} opacity="0.2"/><path d="M8 5v4M8 11h.01" stroke="#92700C" strokeWidth="1.5" strokeLinecap="round"/></svg><span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{item}</span></div>))}
            </div>
          </div>
        </Section>

        {/* ═══ ADVANCED AUDIENCE SEGMENTATION (Blueprint+ Exclusive) ═══ */}
        <Section id="audience-segmentation" style={{ background: `linear-gradient(135deg, ${NAVY}04 0%, ${BLUE}06 100%)`, border: `2px solid ${NAVY}12` }}>
          <SectionTitle hero description="Segmented messaging strategy for each core audience — what to say, where to say it, and how to differentiate.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><circle cx="9" cy="7" r="4" stroke={BLUE} strokeWidth="1.5"/><path d="M2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/><circle cx="19" cy="9" r="3" stroke={BLUE} strokeWidth="1.5" opacity="0.5"/><path d="M19 15a4 4 0 014 4v2" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/></svg>
              Advanced Audience Segmentation
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: `${BLUE}15`, fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 8 }}>Blueprint+ Exclusive</span>
            </span>
          </SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {r.advancedAudienceSegmentation.coreSegments.map((seg, i) => (
              <div key={i} style={{ borderRadius: 5, overflow: "hidden", border: `1px solid ${BORDER}`, background: WHITE }}>
                <div style={{ padding: "16px 20px", background: i === 0 ? `${BLUE}08` : LIGHT_BG, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: i === 0 ? BLUE : `${NAVY}12`, color: i === 0 ? WHITE : NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: NAVY }}>{seg.segment}</div>
                </div>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Messaging Differentiation</div>
                    <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65 }}>{seg.messagingDifferentiation}</div>
                  </div>
                  <div style={{ padding: "12px 16px", background: `${BLUE}06`, borderRadius: 5, borderLeft: `3px solid ${BLUE}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Channel Relevance</div>
                    <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{seg.channelRelevance}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ VISIBILITY & DISCOVERY ═══ */}
        <Section id="visibility-discovery">
          <SectionTitle hero description="How prospects discover your brand today, where discovery gaps exist, and how to position for AI-powered search.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><circle cx="11" cy="11" r="7" stroke={BLUE} strokeWidth="1.5"/><path d="M16 16l5 5" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/><circle cx="11" cy="11" r="3" fill={BLUE} opacity="0.2"/></svg>
              Visibility &amp; Discovery
            </span>
          </SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "20px 24px", background: `${BLUE}06`, borderRadius: 5, border: `1px solid ${BLUE}20` }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${BLUE}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" stroke={BLUE} strokeWidth="1.5"/><circle cx="12" cy="12" r="3.5" fill={BLUE}/></svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Visibility Mode</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>{r.visibilityDiscovery.visibilityMode}</div>
              <div style={{ fontSize: 14, color: SUB, lineHeight: 1.55, marginTop: 4 }}>{r.visibilityDiscovery.visibilityModeExplanation}</div>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><span style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>Discovery Diagnosis</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ padding: "16px 20px", background: `${GREEN}06`, borderRadius: 5, border: `1px solid ${GREEN}25` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Where They Should Find You</div>
                {r.visibilityDiscovery.discoveryDiagnosis.whereTheyShouldFind.map((item, i) => (<div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}><svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={GREEN} opacity="0.2"/><path d="M5 8l2 2 4-4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{item}</span></div>))}
              </div>
              <div style={{ padding: "16px 20px", background: `${RED_S}04`, borderRadius: 5, border: `1px solid ${RED_S}15` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: RED_S, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Where They Actually Find You</div>
                {r.visibilityDiscovery.discoveryDiagnosis.whereTheyActuallyFind.map((item, i) => (<div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}><svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={RED_S} opacity="0.15"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={RED_S} strokeWidth="1.5" strokeLinecap="round"/></svg><span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5 }}>{item}</span></div>))}
              </div>
            </div>
            <div style={{ marginTop: 12, padding: "14px 18px", background: `${NAVY}06`, borderRadius: 5, borderLeft: `3px solid ${NAVY}` }}><div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>The Gap</div><div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{r.visibilityDiscovery.discoveryDiagnosis.gap}</div></div>
          </div>
          <div style={{ padding: "20px 24px", background: WHITE, borderRadius: 5, border: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>AEO Readiness Review</span></div><span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 10, background: r.visibilityDiscovery.aeoReadiness.score === "High" ? `${GREEN}15` : r.visibilityDiscovery.aeoReadiness.score.includes("Moderate") ? `${YELLOW}15` : `${RED_S}10`, color: r.visibilityDiscovery.aeoReadiness.score === "High" ? GREEN : r.visibilityDiscovery.aeoReadiness.score.includes("Moderate") ? "#92700C" : RED_S }}>{r.visibilityDiscovery.aeoReadiness.score}</span></div>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 16 }}>{r.visibilityDiscovery.aeoReadiness.explanation}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {r.visibilityDiscovery.aeoReadiness.recommendations.map((rec: any, i: number) => (
                <div key={i} style={{ padding: "14px 18px", borderRadius: 6, border: `1px solid ${BORDER}`, background: WHITE }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: rec.detail ? 8 : 0 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, fontSize: 11, fontWeight: 700, color: BLUE }}>{i + 1}</div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: NAVY, lineHeight: 1.5 }}>{rec.action || rec}</span>
                  </div>
                  {rec.detail && (
                    <div style={{ fontSize: 13.5, color: "#1a1a2e", lineHeight: 1.6, marginLeft: 32 }}>{rec.detail}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visibility Priorities */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>Visibility Priorities — Implementation Roadmap</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {r.visibilityDiscovery.visibilityPriorities.map((vp: any, i: number) => (
                <div key={i} style={{ borderRadius: 6, border: `1px solid ${i === 0 ? BLUE + "25" : BORDER}`, background: WHITE, overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 18px", background: i === 0 ? `${BLUE}06` : LIGHT_BG, borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? BLUE : `${NAVY}10`, color: i === 0 ? WHITE : NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 900 }}>{vp.priority}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, lineHeight: 1.4, marginBottom: 4 }}>{vp.action}</div>
                      <div style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>{vp.impact}</div>
                    </div>
                  </div>
                  {vp.howToImplement && (
                    <div style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>How to Implement</div>
                      <div style={{ fontSize: 13.5, color: "#1a1a2e", lineHeight: 1.65 }}>{vp.howToImplement}</div>
                      {vp.tools && (
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, padding: "8px 12px", background: `${NAVY}03`, borderRadius: 4 }}>
                          <svg viewBox="0 0 14 14" fill="none" style={{ width: 13, height: 13, flexShrink: 0, marginTop: 2 }}><path d="M8 1.5L12.5 6L5 13.5H1V9.5L8 1.5Z" stroke={NAVY} strokeWidth="1.2" strokeLinejoin="round"/></svg>
                          <div style={{ fontSize: 12, color: SUB, lineHeight: 1.5 }}><strong style={{ color: NAVY }}>Tools:</strong> {vp.tools}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ MESSAGING PILLARS (BLUEPRINT+ ENHANCED) ═══ */}
        <Section id="messaging-pillars">
          <SectionTitle hero description="The strategic themes Acme Co should consistently communicate — with audience-specific variations and funnel-stage guidance.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Messaging Pillars
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: `${BLUE}15`, fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 8 }}>Enhanced</span>
            </span>
          </SectionTitle>

          <div style={{ fontSize: 15, color: "#444", lineHeight: 1.7, marginBottom: 24 }}>
            These are the core strategic themes that should run through everything Acme Co communicates. Blueprint+ expands each pillar with audience-specific adaptations and funnel-stage messaging guidance.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {r.messagingPillars.map((pillar: any, i: number) => (
              <div key={i} style={{ borderRadius: 8, border: `1px solid ${BORDER}`, overflow: "hidden", background: WHITE }}>
                <div style={{ padding: "16px 20px", background: `${BLUE}08`, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: BLUE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: NAVY }}>{pillar.name}</div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>What It Communicates</div>
                      <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 }}>{pillar.whatItCommunicates}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Why It Matters</div>
                      <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 }}>{pillar.whyItMatters}</div>
                    </div>
                  </div>
                  <div style={{ padding: "12px 16px", background: `${BLUE}06`, borderRadius: 5, borderLeft: `3px solid ${BLUE}`, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Example Message</div>
                    <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6, fontStyle: "italic" }}>{pillar.exampleMessage}</div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>How to Use</div>
                    <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 }}>{pillar.howToUse}</div>
                  </div>
                  {/* Channel examples */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {Object.entries(pillar.channelExamples).map(([channel, copy]: [string, any]) => (
                      <div key={channel} style={{ padding: "12px 14px", borderRadius: 5, background: `${BLUE}04`, border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{channel}</div>
                        <div style={{ fontSize: 12.5, color: "#1a1a2e", lineHeight: 1.5, fontStyle: "italic" }}>{copy}</div>
                      </div>
                    ))}
                  </div>
                  {/* Audience variations — Blueprint+ exclusive */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}><path d="M8 1a3 3 0 100 6 3 3 0 000-6zM2 13c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke={BLUE} strokeWidth="1.3" strokeLinecap="round"/></svg>
                      Audience Variations
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {pillar.audienceVariations.map((av: any, j: number) => (
                        <div key={j} style={{ padding: "12px 16px", borderRadius: 5, border: `1px solid ${BORDER}`, background: `${NAVY}03` }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, marginBottom: 4 }}>{av.audience}</div>
                          <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5, marginBottom: 6 }}>{av.adaptation}</div>
                          <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5, fontStyle: "italic", padding: "8px 12px", background: `${BLUE}04`, borderRadius: 4, borderLeft: `2px solid ${BLUE}30` }}>{av.exampleCopy}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Funnel stage usage — Blueprint+ exclusive */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}><path d="M2 2h12l-3 5v4l-2 3-2-3V7L4 2z" stroke={BLUE} strokeWidth="1.3" strokeLinejoin="round"/></svg>
                      Funnel Stage Usage
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {Object.entries(pillar.funnelStageUsage).map(([stage, desc]: [string, any]) => (
                        <div key={stage} style={{ padding: "10px 14px", borderRadius: 5, background: `${BLUE}04`, border: `1px solid ${BORDER}` }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{stage}</div>
                          <div style={{ fontSize: 12.5, color: "#1a1a2e", lineHeight: 1.5 }}>{desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ CONTENT PILLARS (BLUEPRINT+ ENHANCED) ═══ */}
        <Section id="content-pillars">
          <SectionTitle hero description="The topical categories that guide what content Acme Co should create — with channel mapping, frequency cadence, audience targeting, and example headlines.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                <rect x="3" y="3" width="7" height="7" rx="1" stroke={BLUE} strokeWidth="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke={BLUE} strokeWidth="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke={BLUE} strokeWidth="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke={BLUE} strokeWidth="1.5"/>
              </svg>
              Content Pillars
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: `${BLUE}15`, fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 8 }}>Enhanced</span>
            </span>
          </SectionTitle>

          <div style={{ fontSize: 15, color: "#444", lineHeight: 1.7, marginBottom: 24 }}>
            Content pillars are the topical categories that guide what Acme Co creates. Blueprint+ adds channel distribution, audience mapping, frequency cadence, and ready-to-use headlines for each pillar.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {r.contentPillars.map((cp: any, i: number) => (
              <div key={i} style={{ borderRadius: 8, border: `1px solid ${BORDER}`, overflow: "hidden", background: WHITE }}>
                <div style={{ padding: "14px 20px", background: `${NAVY}04`, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${BLUE}15`, color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{cp.name}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: BLUE, background: `${BLUE}10`, padding: "3px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Reinforces: {cp.messagingPillarConnection}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: NAVY, background: `${NAVY}08`, padding: "3px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{cp.frequencyCadence}</span>
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6, marginBottom: 14 }}>{cp.description}</div>
                  
                  {/* Audience + Channel distribution */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    <div style={{ padding: "10px 14px", borderRadius: 5, background: `${NAVY}03`, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Audience</div>
                      <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{cp.audienceMapping}</div>
                    </div>
                    <div style={{ padding: "10px 14px", borderRadius: 5, background: `${BLUE}04`, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Channels</div>
                      <div style={{ fontSize: 12, color: "#1a1a2e", lineHeight: 1.4, marginBottom: 2 }}><strong>Primary:</strong> {cp.channelDistribution.primary}</div>
                      <div style={{ fontSize: 12, color: "#1a1a2e", lineHeight: 1.4 }}><strong>Secondary:</strong> {cp.channelDistribution.secondary}</div>
                    </div>
                  </div>

                  {/* Example Topics */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Example Topics</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {cp.exampleTopics.map((topic: string, j: number) => (
                        <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <svg viewBox="0 0 16 16" fill="none" style={{ width: 12, height: 12, marginTop: 3, flexShrink: 0 }}><circle cx="8" cy="8" r="3" fill={BLUE} opacity="0.3"/></svg>
                          <span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Example Headlines */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ready-to-Use Headlines</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {cp.exampleHeadlines.map((hl: string, j: number) => (
                        <div key={j} style={{ padding: "8px 12px", background: `${BLUE}04`, borderRadius: 4, borderLeft: `2px solid ${BLUE}30`, fontSize: 13, color: "#1a1a2e", lineHeight: 1.5, fontStyle: "italic" }}>{hl}</div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Formats */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Suggested Formats</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {cp.suggestedFormats.map((fmt: string, j: number) => (
                        <span key={j} style={{ padding: "4px 12px", borderRadius: 12, background: `${BLUE}08`, border: `1px solid ${BLUE}20`, fontSize: 12, fontWeight: 600, color: NAVY }}>{fmt}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ VISUAL DIRECTION ═══ */}
        <Section id="visual-direction">
          <SectionTitle hero description="Visual identity direction that reinforces your brand personality and positioning.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><circle cx="12" cy="12" r="4" stroke={BLUE} strokeWidth="1.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/></svg>
              Visual Direction
            </span>
          </SectionTitle>

          {/* Color Palette */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Color Palette</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {r.visualDirection.colorPalette.map((color, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px", background: WHITE, borderRadius: 5, border: `1px solid ${BORDER}` }}>
                  <div style={{ width: 44, height: 44, borderRadius: 5, background: color.hex, border: color.hex === "#FFFFFF" ? `1px solid ${BORDER}` : "none", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{color.name} <span style={{ fontSize: 12, fontWeight: 400, color: SUB }}>{color.hex}</span></div>
                    <div style={{ fontSize: 12, color: SUB, lineHeight: 1.4, marginTop: 2 }}>{color.usage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: "16px 20px", background: `${NAVY}04`, borderRadius: 5, borderLeft: `3px solid ${NAVY}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Typography Tone</div>
              <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65 }}>{r.visualDirection.typographyTone}</div>
            </div>
            <div style={{ padding: "16px 20px", background: `${NAVY}04`, borderRadius: 5, borderLeft: `3px solid ${NAVY}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Visual Consistency Principles</div>
              <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65 }}>{r.visualDirection.visualConsistencyPrinciples}</div>
            </div>
          </div>
        </Section>

        {/* ═══ 8. CONVERSION STRATEGY ═══ */}
        <Section id="conversion-strategy">
          <SectionTitle hero description="How your brand builds trust, creates clarity, and moves people to action.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/></svg>
              Conversion Strategy
            </span>
          </SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            <div style={{ padding: "16px 20px", background: `${BLUE}06`, borderRadius: 5, borderLeft: `3px solid ${BLUE}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>How Trust Is Built</div>
              <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65 }}>{r.conversionStrategy.howTrustIsBuilt}</div>
            </div>
            <div style={{ padding: "16px 20px", background: `${BLUE}06`, borderRadius: 5, borderLeft: `3px solid ${BLUE}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>How Clarity Drives Action</div>
              <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65 }}>{r.conversionStrategy.howClarityDrivesAction}</div>
            </div>
          </div>

          {/* CTA Hierarchy with Templates */}
          {(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cs = r.conversionStrategy as any;
            return (<>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>CTA Hierarchy — Ready-to-Use Copy</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {cs.ctaHierarchy.map((cta: any, i: number) => (
                <div key={i} style={{ borderRadius: 6, border: `1px solid ${i === 0 ? BLUE + "25" : BORDER}`, background: WHITE, overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "14px 18px", background: i === 0 ? `${BLUE}08` : LIGHT_BG, borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: i === 0 ? BLUE : i === 1 ? `${NAVY}12` : `${NAVY}08`,
                      color: i === 0 ? WHITE : NAVY,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 900, flexShrink: 0,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{cta.level as string}: {cta.action as string}</div>
                      <div style={{ fontSize: 13, color: SUB, marginTop: 2 }}>{cta.context as string}</div>
                    </div>
                  </div>
                  {cta.template && (
                    <div style={{ padding: "14px 18px", fontSize: 13.5, color: "#1a1a2e", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {(cta.template as string).split("\\n").map((line: string, li: number) => (
                        <span key={li}>{li > 0 && <br />}{line}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Email Nurture Sequence Template */}
          {cs.emailNurtureTemplate && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}><rect x="2" y="4" width="16" height="12" rx="2" stroke={BLUE} strokeWidth="1.3"/><path d="M2 4l8 6 8-6" stroke={BLUE} strokeWidth="1.3"/></svg>
                <span style={{ fontSize: 13, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email Nurture Sequence — Ready to Use</span>
              </div>
              <div style={{ fontSize: 14, color: SUB, marginBottom: 16, lineHeight: 1.5 }}>
                {cs.emailNurtureTemplate.description}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {cs.emailNurtureTemplate.emails.map((email: any, ei: number) => (
                  <div key={ei} style={{ borderRadius: 6, border: `1px solid ${BORDER}`, background: WHITE, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: LIGHT_BG, borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLUE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>{ei + 1}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{email.timing}</div>
                          <div style={{ fontSize: 12, color: SUB }}>{email.purpose}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Subject Line</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>{email.subject}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Email Body</div>
                      <div style={{ padding: "14px 16px", borderRadius: 5, background: `${NAVY}03`, border: `1px dashed ${NAVY}15`, fontSize: 13.5, color: "#1a1a2e", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                        {email.body.split("\\n").map((line: string, li: number) => (
                          <span key={li}>{li > 0 && <br />}{line}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </>);
          })()}
        </Section>

        {/* ═══ BRAND ARCHITECTURE & EXPANSION (Blueprint+ Exclusive) ═══ */}
        <Section id="brand-architecture" style={{ background: `linear-gradient(135deg, ${NAVY}04 0%, ${BLUE}06 100%)`, border: `2px solid ${NAVY}12` }}>
          <SectionTitle hero description="How your brand can expand into new offerings and markets without losing coherence.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><rect x="3" y="3" width="18" height="18" rx="3" stroke={BLUE} strokeWidth="1.5"/><path d="M3 9h18M9 3v18" stroke={BLUE} strokeWidth="1.5"/></svg>
              Brand Architecture &amp; Expansion
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: `${BLUE}15`, fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 8 }}>Blueprint+ Exclusive</span>
            </span>
          </SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ padding: "20px 24px", background: `${BLUE}08`, borderRadius: 5, borderLeft: `4px solid ${BLUE}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>How Your Brand Can Stretch</div>
              <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75 }}>{r.brandArchitectureExpansion.howBrandCanStretch}</div>
            </div>
            <div style={{ padding: "20px 24px", background: `${NAVY}04`, borderRadius: 5, borderLeft: `4px solid ${NAVY}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Sub-Brand Alignment</div>
              <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75 }}>{r.brandArchitectureExpansion.subBrandAlignment}</div>
            </div>
          </div>
        </Section>

        {/* ═══ CAMPAIGN & CONTENT STRATEGY (Blueprint+ Exclusive) ═══ */}
        <Section id="campaign-strategy" pageBreak style={{ background: `linear-gradient(135deg, ${BLUE}04 0%, ${NAVY}04 100%)`, border: `2px solid ${BLUE}15` }}>
          <SectionTitle hero description="Long-term campaign themes, narrative arcs, and a storytelling strategy that builds authority over time.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 7h4M7 10v4M17 10v4M10 17h4" stroke={BLUE} strokeWidth="1" opacity="0.4"/></svg>
              Campaign &amp; Content Strategy
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: `${BLUE}15`, fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 8 }}>Blueprint+ Exclusive</span>
            </span>
          </SectionTitle>

          {/* Campaign Themes */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Campaign Themes</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {r.campaignContentStrategy.campaignThemes.map((theme, i) => (
                <div key={i} style={{ padding: "16px 20px", borderRadius: 5, background: WHITE, border: `1px solid ${BORDER}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? BLUE : `${BLUE}12`, color: i === 0 ? WHITE : BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.55, fontWeight: 600 }}>{theme}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Narrative Arcs */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Narrative Arcs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {r.campaignContentStrategy.narrativeArcs.map((arc, i) => (
                <div key={i} style={{ padding: "14px 18px", borderLeft: `3px solid ${BLUE}40`, background: `${BLUE}04`, borderRadius: "0 5px 5px 0" }}>
                  <span style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.55, fontStyle: "italic" }}>&quot;{arc}&quot;</span>
                </div>
              ))}
            </div>
          </div>

          {/* Long-Term Storytelling */}
          <div style={{ padding: "20px 24px", background: `${NAVY}06`, borderRadius: 5, borderLeft: `4px solid ${NAVY}` }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Long-Term Storytelling Strategy</div>
            <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75 }}>{r.campaignContentStrategy.longTermStorytelling}</div>
          </div>
        </Section>

        {/* ═══ STRATEGIC ACTION PLAN ═══ */}
        <Section id="strategic-action-plan">
          <SectionTitle description="Five prioritized actions with step-by-step implementation guides, ready-to-use templates, and examples you can apply today.">Strategic Action Plan</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {r.strategicActionPlan.map((item: any, idx: number) => (
              <div key={idx} style={{ borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, overflow: "hidden" }}>
                {/* Header */}
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px 24px", background: idx === 0 ? `${BLUE}08` : LIGHT_BG, borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: idx === 0 ? BLUE : NAVY, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 900, fontSize: 20, flexShrink: 0 }}>{item.priority as number}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, color: NAVY, lineHeight: 1.5, fontWeight: 700 }}>{item.action as string}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 5, background: ACCENT_BG, fontSize: 13, fontWeight: 700, color: BLUE }}><PillarIcon pillar={(item.pillar as string).toLowerCase()} size={14} />{item.pillar as string}</div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 5, background: item.effort === "Low" ? `${GREEN}12` : item.effort === "Medium" ? `${ORANGE}12` : `${RED_S}12`, fontSize: 12, fontWeight: 600, color: item.effort === "Low" ? GREEN : item.effort === "Medium" ? ORANGE : RED_S }}>{item.effort as string} Effort</div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 5, background: item.impact === "High" ? `${GREEN}12` : item.impact === "Medium" ? `${BLUE}12` : `${SUB}15`, fontSize: 12, fontWeight: 600, color: item.impact === "High" ? GREEN : item.impact === "Medium" ? BLUE : SUB }}>{item.impact as string} Impact</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "20px 24px" }}>
                  {/* Quick Win callout */}
                  {item.quickWin && (
                    <div style={{ display: "flex", gap: 12, padding: "14px 18px", borderRadius: 6, background: `${BLUE}06`, border: `1px solid ${BLUE}15`, marginBottom: 20 }}>
                      <div style={{ flexShrink: 0, marginTop: 1 }}>
                        <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}><circle cx="10" cy="10" r="9" stroke={BLUE} strokeWidth="1.5"/><path d="M10 6v4l2.5 1.5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Quick Win — Do This Right Now</div>
                        <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 }}>{item.quickWin as string}</div>
                      </div>
                    </div>
                  )}

                  {/* Why This Matters */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}><circle cx="8" cy="8" r="7" stroke={BLUE} strokeWidth="1.3"/><path d="M8 5v3M8 10h.01" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <span style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.05em" }}>Why This Matters</span>
                    </div>
                    <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginLeft: 24 }}>{item.why as string}</div>
                  </div>

                  {/* Implementation Steps */}
                  {item.implementationSteps && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}><rect x="2" y="2" width="12" height="12" rx="2" stroke={GREEN} strokeWidth="1.3"/><path d="M5 8l2 2 4-4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize: 13, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.05em" }}>Step-by-Step Implementation</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginLeft: 0 }}>
                        {(item.implementationSteps as Array<{step: string; detail: string}>).map((s, i) => (
                          <div key={i} style={{ display: "flex", gap: 14, padding: "14px 16px", borderRadius: 6, background: i % 2 === 0 ? `${GREEN}04` : WHITE, border: `1px solid ${BORDER}` }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: GREEN, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{s.step}</div>
                              <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 }}>{s.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Template / Copy-Paste Section */}
                  {item.template && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}><rect x="2" y="1" width="9" height="11" rx="1.5" stroke={NAVY} strokeWidth="1.2"/><path d="M5 4h6v11H3V4" stroke={NAVY} strokeWidth="1.2" fill="none"/></svg>
                        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ready-to-Use Template</span>
                      </div>
                      <div style={{ padding: "18px 20px", borderRadius: 6, background: `${NAVY}04`, border: `1px dashed ${NAVY}20`, fontFamily: "'Lato', sans-serif", fontSize: 13.5, color: "#1a1a2e", lineHeight: 1.75, whiteSpace: "pre-wrap", maxHeight: 360, overflowY: "auto" }}>
                        {(item.template as string).split("\\n").map((line, i) => (
                          <span key={i}>{i > 0 && <br />}{line}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example */}
                  <div style={{ padding: "14px 18px", borderRadius: 6, background: `${NAVY}04`, borderLeft: `3px solid ${NAVY}`, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.05em" }}>Example</span>
                    </div>
                    <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6, fontStyle: "italic" }}>{item.example as string}</div>
                  </div>

                  {/* Expected Outcome */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: `${GREEN}08`, borderRadius: 5 }}>
                    <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}><circle cx="10" cy="10" r="8" fill={GREEN} opacity="0.2"/><path d="M6 10l2.5 2.5L14 7" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 14, fontWeight: 600, color: GREEN }}>Expected Outcome:</span>
                    <span style={{ fontSize: 14, color: "#1a1a2e" }}>{item.outcome as string}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ AI PROMPT LIBRARY ═══ */}
        <Section pageBreak>
          <SectionTitle hero description="Complete AI prompt library combining foundational brand building prompts with execution-focused prompts — all calibrated to your brand.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><rect x="3" y="3" width="18" height="18" rx="3" stroke={BLUE} strokeWidth="1.5"/><path d="M8 10l3 3-3 3" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 16h3" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/></svg>
              AI Prompt Library
            </span>
          </SectionTitle>

          {/* Overall header with total count */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, padding: "14px 20px", background: `${BLUE}06`, borderRadius: 5, border: `1px solid ${BLUE}18` }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${BLUE}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: BLUE }}>28</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>28 AI Prompts — Calibrated to {r.businessName}</div>
              <div style={{ fontSize: 13, color: SUB, lineHeight: 1.4 }}>Complete library: Foundational (8) + Execution (8) + Advanced (12). Copy directly into ChatGPT, Claude, or any AI tool.</div>
            </div>
          </div>

          {/* ═══ FOUNDATIONAL PROMPT PACK ═══ */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: NAVY, marginBottom: 4 }}>{r.foundationalPromptPack.packName}</div>
                <div style={{ fontSize: 13, color: SUB, lineHeight: 1.4 }}>{r.foundationalPromptPack.description}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ padding: "6px 12px", borderRadius: 5, background: `${BLUE}12`, fontSize: 12, fontWeight: 700, color: BLUE }}>{r.foundationalPromptPack.promptCount} Prompts</div>
                <div style={{ padding: "6px 12px", borderRadius: 5, background: `${GREEN}12`, fontSize: 12, fontWeight: 700, color: GREEN }}>Included from WunderBrand Snapshot+™</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {r.foundationalPromptPack.prompts.map((p, idx) => (
                <div key={idx} style={{ borderRadius: 5, overflow: "hidden", border: `1px solid ${BORDER}`, background: WHITE }}>
                  <div style={{ padding: "14px 20px", background: idx === 0 ? `${BLUE}08` : LIGHT_BG, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${BLUE}15`, color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{p.category}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{p.title}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}><rect x="1" y="1" width="10" height="10" rx="1.5" stroke={SUB} strokeWidth="1.2"/><rect x="5" y="5" width="10" height="10" rx="1.5" stroke={SUB} strokeWidth="1.2" fill={LIGHT_BG}/></svg>
                      <span style={{ fontSize: 11, color: SUB, fontWeight: 600 }}>Copy</span>
                    </div>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 12, color: SUB, marginBottom: 10, fontStyle: "italic" }}>{p.instruction}</div>
                    <div style={{ padding: "14px 16px", background: `${NAVY}04`, borderRadius: 4, border: `1px dashed ${NAVY}20`, fontFamily: "'Courier New', Courier, monospace", fontSize: 12.5, color: "#1a1a2e", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 280, overflowY: "auto" }}>{p.prompt}</div>
                  </div>
                  <div style={{ padding: "12px 20px", background: `${BLUE}05`, borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={BLUE} opacity="0.15"/><path d="M8 5v4M8 11h.01" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <div><span style={{ fontSize: 11, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Why It Matters: </span><span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55 }}>{p.whyItMatters}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ EXECUTION PROMPT PACK ═══ */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: NAVY, marginBottom: 4 }}>{r.executionPromptPack.packName}</div>
                <div style={{ fontSize: 13, color: SUB, lineHeight: 1.4 }}>{r.executionPromptPack.description}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ padding: "6px 12px", borderRadius: 5, background: `${BLUE}12`, fontSize: 12, fontWeight: 700, color: BLUE }}>{r.executionPromptPack.promptCount} Prompts</div>
                <div style={{ padding: "6px 12px", borderRadius: 5, background: `${GREEN}12`, fontSize: 12, fontWeight: 700, color: GREEN }}>Included from WunderBrand Blueprint™</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {r.executionPromptPack.prompts.map((p, idx) => (
                <div key={idx} style={{ borderRadius: 5, overflow: "hidden", border: `1px solid ${BORDER}`, background: WHITE }}>
                  <div style={{ padding: "14px 20px", background: idx === 0 ? `${BLUE}08` : LIGHT_BG, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${BLUE}15`, color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{idx + 9}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{p.category}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{p.title}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}><rect x="1" y="1" width="10" height="10" rx="1.5" stroke={SUB} strokeWidth="1.2"/><rect x="5" y="5" width="10" height="10" rx="1.5" stroke={SUB} strokeWidth="1.2" fill={LIGHT_BG}/></svg>
                      <span style={{ fontSize: 11, color: SUB, fontWeight: 600 }}>Copy</span>
                    </div>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 12, color: SUB, marginBottom: 10, fontStyle: "italic" }}>{p.instruction}</div>
                    <div style={{ padding: "14px 16px", background: `${NAVY}04`, borderRadius: 4, border: `1px dashed ${NAVY}20`, fontFamily: "'Courier New', Courier, monospace", fontSize: 12.5, color: "#1a1a2e", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 280, overflowY: "auto" }}>{p.prompt}</div>
                  </div>
                  <div style={{ padding: "12px 20px", background: `${BLUE}05`, borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={BLUE} opacity="0.15"/><path d="M8 5v4M8 11h.01" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <div><span style={{ fontSize: 11, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Why It Matters: </span><span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55 }}>{p.whyItMatters}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ ADVANCED PROMPT LIBRARY (Blueprint+ Exclusive) ═══ */}
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: NAVY, marginBottom: 4 }}>{r.advancedPromptLibrary.packName}</div>
                <div style={{ fontSize: 13, color: SUB, lineHeight: 1.4 }}>{r.advancedPromptLibrary.description}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ padding: "6px 12px", borderRadius: 5, background: `${BLUE}12`, fontSize: 12, fontWeight: 700, color: BLUE }}>{r.advancedPromptLibrary.promptCount} Prompts</div>
                <div style={{ padding: "6px 12px", borderRadius: 5, background: `${BLUE}15`, fontSize: 12, fontWeight: 700, color: BLUE }}>Blueprint+ Exclusive</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {r.advancedPromptLibrary.prompts.map((p, idx) => (
                <div key={idx} style={{ borderRadius: 5, overflow: "hidden", border: `1px solid ${BORDER}`, background: WHITE }}>
                  <div style={{ padding: "14px 20px", background: idx === 0 ? `${BLUE}08` : LIGHT_BG, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${BLUE}15`, color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{idx + 17}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{p.category}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{p.title}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}><rect x="1" y="1" width="10" height="10" rx="1.5" stroke={SUB} strokeWidth="1.2"/><rect x="5" y="5" width="10" height="10" rx="1.5" stroke={SUB} strokeWidth="1.2" fill={LIGHT_BG}/></svg>
                      <span style={{ fontSize: 11, color: SUB, fontWeight: 600 }}>Copy</span>
                    </div>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 12, color: SUB, marginBottom: 10, fontStyle: "italic" }}>{p.instruction}</div>
                    <div style={{ padding: "14px 16px", background: `${NAVY}04`, borderRadius: 4, border: `1px dashed ${NAVY}20`, fontFamily: "'Courier New', Courier, monospace", fontSize: 12.5, color: "#1a1a2e", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 280, overflowY: "auto" }}>{p.prompt}</div>
                  </div>
                  <div style={{ padding: "12px 20px", background: `${BLUE}05`, borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={BLUE} opacity="0.15"/><path d="M8 5v4M8 11h.01" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <div><span style={{ fontSize: 11, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Why It Matters: </span><span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55 }}>{p.whyItMatters}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ 10. EXECUTION GUARDRAILS ═══ */}
        <Section id="execution-guardrails">
          <SectionTitle hero description="What to protect, what to avoid, and the early warning signs of brand drift.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Execution Guardrails
            </span>
          </SectionTitle>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {/* Maintain */}
            <div style={{ padding: "16px 18px", background: `${GREEN}06`, borderRadius: 5, borderTop: `3px solid ${GREEN}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>What to Maintain</div>
              {r.executionGuardrails.whatToMaintain.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }}><path d="M5 8l2 2 4-4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.45 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Avoid */}
            <div style={{ padding: "16px 18px", background: `${RED_S}04`, borderRadius: 5, borderTop: `3px solid ${RED_S}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: RED_S, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>What to Avoid</div>
              {r.executionGuardrails.whatToAvoid.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }}><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={RED_S} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.45 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Drift Indicators */}
            <div style={{ padding: "16px 18px", background: `${YELLOW}08`, borderRadius: 5, borderTop: `3px solid ${YELLOW}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#92700C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Drift Indicators</div>
              {r.executionGuardrails.driftIndicators.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }}><circle cx="8" cy="8" r="7" stroke={YELLOW} strokeWidth="1.2"/><path d="M8 5v4M8 11h.01" stroke="#92700C" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.45 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ MEASUREMENT & OPTIMIZATION (Blueprint+ Exclusive) ═══ */}
        <Section id="measurement-optimization" style={{ background: `linear-gradient(135deg, ${BLUE}04 0%, ${NAVY}04 100%)`, border: `2px solid ${BLUE}15` }}>
          <SectionTitle hero description="What to measure, what the signals mean, and how to adapt your strategy based on real data.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M3 20h18" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/><path d="M5 16l4-6 4 3 3-5 3 4" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="10" r="1.5" fill={BLUE} opacity="0.3"/><circle cx="13" cy="13" r="1.5" fill={BLUE} opacity="0.3"/><circle cx="16" cy="8" r="1.5" fill={BLUE} opacity="0.3"/></svg>
              Measurement &amp; Optimization
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: `${BLUE}15`, fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 8 }}>Blueprint+ Exclusive</span>
            </span>
          </SectionTitle>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* What to Track */}
            <div style={{ padding: "18px 22px", background: `${BLUE}06`, borderRadius: 5, borderTop: `3px solid ${BLUE}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>What to Track</div>
              {r.measurementOptimization.whatToTrack.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${BLUE}15`, color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Signals That Matter */}
            <div style={{ padding: "18px 22px", background: `${GREEN}06`, borderRadius: 5, borderTop: `3px solid ${GREEN}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Signals That Matter</div>
              {r.measurementOptimization.signalsThatMatter.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 3, flexShrink: 0 }}><circle cx="8" cy="8" r="7" fill={GREEN} opacity="0.2"/><path d="M5 8l2 2 4-4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How to Adapt */}
          <div style={{ padding: "18px 22px", background: `${NAVY}04`, borderRadius: 5, borderLeft: `4px solid ${NAVY}` }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>How to Adapt</div>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.75 }}>{r.measurementOptimization.howToAdapt}</div>
          </div>
        </Section>

        {/* ═══ STRATEGIC GUARDRAILS (Blueprint+ Exclusive) ═══ */}
        <Section id="strategic-guardrails" style={{ background: `linear-gradient(135deg, ${NAVY}04 0%, ${BLUE}04 100%)`, border: `2px solid ${NAVY}12` }}>
          <SectionTitle hero description="The principles that protect your brand as you scale — what never changes, what can evolve, and how to maintain integrity.">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M12 2L4 6v6c0 5.5 3.5 10 8 12 4.5-2 8-6.5 8-12V6l-8-4z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 2L4 6v6c0 5.5 3.5 10 8 12 4.5-2 8-6.5 8-12V6l-8-4z" fill={BLUE} opacity="0.06"/><path d="M9 12l2 2 4-4" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Strategic Guardrails
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 10, background: `${BLUE}15`, fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 8 }}>Blueprint+ Exclusive</span>
            </span>
          </SectionTitle>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {/* What Never Changes */}
            <div style={{ padding: "18px 22px", background: `${NAVY}06`, borderRadius: 5, borderTop: `3px solid ${NAVY}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>What Never Changes</div>
              {r.strategicGuardrails.whatNeverChanges.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }}><path d="M8 2L3 6v4c0 3 2.5 5.5 5 6.5 2.5-1 5-3.5 5-6.5V6L8 2z" stroke={NAVY} strokeWidth="1.2" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* What Can Evolve */}
            <div style={{ padding: "18px 22px", background: `${BLUE}06`, borderRadius: 5, borderTop: `3px solid ${BLUE}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>What Can Evolve</div>
              {r.strategicGuardrails.whatCanEvolve.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }}><path d="M8 2a6 6 0 110 12 6 6 0 010-12z" stroke={BLUE} strokeWidth="1.2"/><path d="M8 5v3l2 2" stroke={BLUE} strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Maintaining Integrity at Scale */}
          <div style={{ padding: "20px 24px", background: `${NAVY}08`, borderRadius: 5, borderLeft: `4px solid ${NAVY}` }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Maintaining Integrity at Scale</div>
            <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75 }}>{r.strategicGuardrails.maintainingIntegrityAtScale}</div>
          </div>
        </Section>

        {/* ═══ COMPETITIVE POSITIONING MAP ═══ */}
        {(r as any).competitivePositioning && (
          <Section id="competitive-positioning" pageBreak>
            <SectionTitle hero description="Where your brand sits in the competitive landscape \u2014 and where the strategic opportunities are.">
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                  <rect x="2" y="2" width="20" height="20" rx="2" stroke={BLUE} strokeWidth="1.5"/>
                  <line x1="12" y1="2" x2="12" y2="22" stroke={BLUE} strokeWidth="1" opacity="0.3"/>
                  <line x1="2" y1="12" x2="22" y2="12" stroke={BLUE} strokeWidth="1" opacity="0.3"/>
                  <circle cx="15" cy="7" r="3" fill={BLUE} opacity="0.6"/>
                  <circle cx="8" cy="15" r="2.5" fill={ORANGE} opacity="0.5"/>
                  <circle cx="16" cy="16" r="2" fill={GREEN} opacity="0.5"/>
                </svg>
                Competitive Positioning Map
              </span>
            </SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div style={{ padding: "14px 18px", borderRadius: 5, background: `${BLUE}06`, borderLeft: `3px solid ${BLUE}` }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Axis 1: {(r as any).competitivePositioning.positioningAxis1.label}</div>
                <div style={{ fontSize: 14, color: SUB }}>{(r as any).competitivePositioning.positioningAxis1.lowEnd} \u2192 {(r as any).competitivePositioning.positioningAxis1.highEnd}</div>
              </div>
              <div style={{ padding: "14px 18px", borderRadius: 5, background: `${BLUE}06`, borderLeft: `3px solid ${BLUE}` }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Axis 2: {(r as any).competitivePositioning.positioningAxis2.label}</div>
                <div style={{ fontSize: 14, color: SUB }}>{(r as any).competitivePositioning.positioningAxis2.lowEnd} \u2192 {(r as any).competitivePositioning.positioningAxis2.highEnd}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {(r as any).competitivePositioning.players.map((player: any, i: number) => (
                <div key={i} style={{ padding: "16px 20px", borderRadius: 5, border: `1px solid ${i === 0 ? BLUE : BORDER}`, background: i === 0 ? `${BLUE}06` : WHITE }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {i === 0 && <svg viewBox="0 0 16 16" style={{ width: 14, height: 14 }}><circle cx="8" cy="8" r="6" fill={BLUE}/></svg>}
                    <span style={{ fontSize: 16, fontWeight: 700, color: i === 0 ? BLUE : NAVY }}>{player.name}</span>
                    <span style={{ fontSize: 12, color: SUB, marginLeft: "auto" }}>({player.position.x}, {player.position.y})</span>
                  </div>
                  <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{player.narrative}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "16px 20px", borderRadius: 5, background: `${GREEN}06`, borderLeft: `3px solid ${GREEN}` }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: GREEN, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Strategic Whitespace</div>
                <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{(r as any).competitivePositioning.strategicWhitespace}</div>
              </div>
              <div style={{ padding: "16px 20px", borderRadius: 5, background: `${BLUE}06`, borderLeft: `3px solid ${BLUE}` }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Differentiation Summary</div>
                <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{(r as any).competitivePositioning.differentiationSummary}</div>
              </div>
              <div style={{ padding: "16px 20px", borderRadius: 5, background: `${ORANGE}08`, borderLeft: `3px solid ${ORANGE}` }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Vulnerabilities</div>
                <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{(r as any).competitivePositioning.vulnerabilities}</div>
              </div>
              {(r as any).competitivePositioning.movementPlan && (
                <div style={{ padding: "16px 20px", borderRadius: 5, background: `${NAVY}06`, borderLeft: `3px solid ${NAVY}` }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>12-Month Movement Plan</div>
                  <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{(r as any).competitivePositioning.movementPlan}</div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ═══ STRATEGIC TRADE-OFFS ═══ */}
        {(r as any).strategicTradeOffs && (
          <Section id="strategic-trade-offs" pageBreak>
            <SectionTitle hero description="Every brand strategy involves trade-offs. Making them explicit empowers you to make informed, intentional decisions rather than drifting into default positions.">
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                  <path d="M12 3v18" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M5 8l7-5 7 5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="5" cy="19" r="2.5" fill={GREEN} opacity="0.5"/>
                  <circle cx="19" cy="19" r="2.5" fill={ORANGE} opacity="0.5"/>
                </svg>
                Strategic Trade-Offs
              </span>
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {(r as any).strategicTradeOffs.map((t: any, i: number) => (
                <div key={i} style={{ borderRadius: 5, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", background: `${NAVY}08`, borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Decision {i + 1}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{t.decision}</div>
                    {t.context && <div style={{ fontSize: 14, color: SUB, marginTop: 4 }}>{t.context}</div>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    {[t.optionA, t.optionB].map((opt: any, j: number) => (
                      <div key={j} style={{ padding: "16px 20px", borderRight: j === 0 ? `1px solid ${BORDER}` : "none" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 10 }}>{opt.label}</div>
                        {opt.description && <div style={{ fontSize: 13, color: SUB, marginBottom: 8, fontStyle: "italic" }}>{opt.description}</div>}
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", marginBottom: 4 }}>Pros</div>
                          {opt.pros.map((p: string, k: number) => <div key={k} style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: GREEN }}>+</span>{p}</div>)}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: RED_S, textTransform: "uppercase", marginBottom: 4 }}>Cons</div>
                          {opt.cons.map((c: string, k: number) => <div key={k} style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: RED_S }}>{"\u2013"}</span>{c}</div>)}
                        </div>
                        <div style={{ fontSize: 12, color: SUB, marginTop: 8, fontStyle: "italic" }}>Best if: {opt.bestIf}</div>
                        {opt.exampleBrand && <div style={{ fontSize: 12, color: BLUE, marginTop: 4 }}>Example: {opt.exampleBrand}</div>}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "14px 20px", background: `${BLUE}06`, borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Recommendation</div>
                    <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{t.recommendation}</div>
                    <div style={{ fontSize: 12, color: SUB, marginTop: 8 }}><strong>Revisit when:</strong> {t.revisitWhen}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ═══ 90-DAY STRATEGIC ROADMAP ═══ */}
        {(r as any).ninetyDayRoadmap && (
          <Section id="ninety-day-roadmap" pageBreak>
            <SectionTitle hero description="A phased implementation plan with specific deliverables, accountability markers, and success metrics for each week.">
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke={BLUE} strokeWidth="1.5"/>
                  <path d="M3 10h18" stroke={BLUE} strokeWidth="1.5"/>
                  <path d="M8 2v4M16 2v4" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="15" r="1.5" fill={GREEN}/>
                  <circle cx="12" cy="15" r="1.5" fill={BLUE}/>
                  <circle cx="16" cy="15" r="1.5" fill={ORANGE}/>
                </svg>
                90-Day Strategic Roadmap
              </span>
            </SectionTitle>

            <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75, marginBottom: 24 }}>
              {(r as any).ninetyDayRoadmap.overview}
            </div>

            {[(r as any).ninetyDayRoadmap.phase1, (r as any).ninetyDayRoadmap.phase2, (r as any).ninetyDayRoadmap.phase3].map((phase: any, phaseIdx: number) => {
              const phaseColors = [GREEN, BLUE, ORANGE];
              const phaseColor = phaseColors[phaseIdx];
              const dayRanges = ["Days 1\u201330", "Days 31\u201360", "Days 61\u201390"];
              return (
                <div key={phaseIdx} style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: phaseColor, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>{phaseIdx + 1}</div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>Phase {phaseIdx + 1}: {phase.name}</div>
                      <div style={{ fontSize: 13, color: SUB }}>{dayRanges[phaseIdx]}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6, marginBottom: 16, padding: "12px 16px", background: `${phaseColor}06`, borderLeft: `3px solid ${phaseColor}`, borderRadius: 5 }}>{phase.objective}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {phase.weeks.map((week: any, wIdx: number) => (
                      <div key={wIdx} style={{ borderRadius: 5, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", background: `${NAVY}04`, borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Week {week.weekNumber}: {week.focus}</div>
                        </div>
                        <div style={{ padding: "12px 16px" }}>
                          {week.tasks.map((task: any, tIdx: number) => (
                            <div key={tIdx} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, padding: "8px 0", borderBottom: tIdx < week.tasks.length - 1 ? `1px solid ${BORDER}40` : "none", alignItems: "start" }}>
                              <div style={{ width: 22, height: 22, borderRadius: 4, border: `2px solid ${phaseColor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                <span style={{ fontSize: 10, fontWeight: 900, color: phaseColor }}>{tIdx + 1}</span>
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{task.task}</div>
                                <div style={{ fontSize: 12, color: SUB, marginTop: 2 }}>{task.deliverable}</div>
                              </div>
                              <div style={{ fontSize: 11, color: SUB, whiteSpace: "nowrap" }}>{task.timeEstimate}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: "10px 16px", background: `${GREEN}06`, borderTop: `1px solid ${BORDER}` }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.06em" }}>Milestone: </span>
                          <span style={{ fontSize: 13, color: "#1a1a2e" }}>{week.milestone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 5, background: `${phaseColor}08`, border: `1px solid ${phaseColor}20` }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: phaseColor, textTransform: "uppercase" }}>Phase {phaseIdx + 1} Success: </span>
                    <span style={{ fontSize: 14, color: "#1a1a2e" }}>{phase[`phase${phaseIdx + 1}Success`]}</span>
                  </div>
                </div>
              );
            })}

            {/* Day 90 Snapshot */}
            <div style={{ padding: "24px", borderRadius: 5, background: `linear-gradient(135deg, ${NAVY}06 0%, ${BLUE}06 100%)`, border: `2px solid ${BLUE}15` }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: NAVY, marginBottom: 12 }}>Day 90 Snapshot</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ padding: "14px 16px", borderRadius: 5, background: `${GREEN}08` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, textTransform: "uppercase", marginBottom: 4 }}>Projected Score Improvement</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{(r as any).ninetyDayRoadmap.day90Snapshot.brandAlignmentTarget}</div>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 5, background: `${ORANGE}08` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: ORANGE, textTransform: "uppercase", marginBottom: 4 }}>Key Risks</div>
                  {(r as any).ninetyDayRoadmap.day90Snapshot.keyRisks.map((risk: string, i: number) => <div key={i} style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{"\u2022"} {risk}</div>)}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", marginBottom: 6 }}>Biggest Wins</div>
                {(r as any).ninetyDayRoadmap.day90Snapshot.biggestWins.map((win: string, i: number) => <div key={i} style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.5, paddingLeft: 16, position: "relative" }}><span style={{ position: "absolute", left: 0, color: GREEN }}>{"\u2713"}</span>{win}</div>)}
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 5, background: `${BLUE}06`, borderLeft: `3px solid ${BLUE}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", marginBottom: 4 }}>Next Horizon (Days 91\u2013180)</div>
                <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 }}>{(r as any).ninetyDayRoadmap.day90Snapshot.nextHorizon}</div>
              </div>
            </div>
          </Section>
        )}

        {/* ═══ BRAND HEALTH SCORECARD ═══ */}
        {(r as any).brandHealthScorecard && (
          <Section id="brand-health-scorecard" pageBreak>
            <SectionTitle hero description="A living measurement framework to track brand health quarterly. This turns a one-time diagnostic into an ongoing operational tool.">
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke={BLUE} strokeWidth="1.5"/>
                  <path d="M7 14l3-3 3 3 4-4" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Brand Health Scorecard
              </span>
            </SectionTitle>

            <div style={{ fontSize: 16, color: "#1a1a2e", lineHeight: 1.75, marginBottom: 24 }}>
              {(r as any).brandHealthScorecard.overview}
            </div>

            {/* Scorecard Dimensions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
              {(r as any).brandHealthScorecard.scorecardDimensions.map((dim: any, i: number) => (
                <div key={i} style={{ borderRadius: 5, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", background: `${NAVY}04`, borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{dim.dimension}</div>
                    <div style={{ fontSize: 12, color: SUB }}>{dim.frequency}</div>
                  </div>
                  <div style={{ padding: "14px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><div style={{ fontSize: 11, fontWeight: 700, color: RED_S, textTransform: "uppercase", marginBottom: 2 }}>Current State</div><div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{dim.currentState}</div></div>
                      <div><div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", marginBottom: 2 }}>Target State (90 Days)</div><div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{dim.targetState}</div></div>
                    </div>
                    <div style={{ fontSize: 12, color: SUB, marginBottom: 8 }}><strong>Key Metric:</strong> {dim.keyMetric}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div style={{ padding: "8px 10px", borderRadius: 4, background: `${GREEN}10`, textAlign: "center" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: GREEN, textTransform: "uppercase" }}>Green</div>
                        <div style={{ fontSize: 11, color: "#1a1a2e", lineHeight: 1.4, marginTop: 2 }}>{dim.greenThreshold}</div>
                      </div>
                      <div style={{ padding: "8px 10px", borderRadius: 4, background: `${YELLOW}15`, textAlign: "center" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#B8860B", textTransform: "uppercase" }}>Yellow</div>
                        <div style={{ fontSize: 11, color: "#1a1a2e", lineHeight: 1.4, marginTop: 2 }}>{dim.yellowThreshold}</div>
                      </div>
                      <div style={{ padding: "8px 10px", borderRadius: 4, background: `${RED_S}10`, textAlign: "center" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: RED_S, textTransform: "uppercase" }}>Red</div>
                        <div style={{ fontSize: 11, color: "#1a1a2e", lineHeight: 1.4, marginTop: 2 }}>{dim.redThreshold}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quarterly Review Process */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: NAVY, marginBottom: 12 }}>Quarterly Review Process</div>
              <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6, marginBottom: 16 }}>{(r as any).brandHealthScorecard.quarterlyReviewProcess.description}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(r as any).brandHealthScorecard.quarterlyReviewProcess.steps.map((step: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${BLUE}12`, color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{step.step} <span style={{ fontSize: 12, fontWeight: 400, color: SUB }}>({step.timeEstimate})</span></div>
                      <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{step.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leading & Lagging Indicators */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Leading Indicators (Early Warning)</div>
                {(r as any).brandHealthScorecard.leadingIndicators.map((ind: any, i: number) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 5, border: `1px solid ${BORDER}`, marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{ind.indicator}</div>
                    <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>{ind.whatItMeans}</div>
                    <div style={{ fontSize: 12, color: BLUE }}><strong>Action:</strong> {ind.actionToTake}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Lagging Indicators (Trailing Outcomes)</div>
                {(r as any).brandHealthScorecard.laggingIndicators.map((ind: any, i: number) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 5, border: `1px solid ${BORDER}`, marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{ind.indicator}</div>
                    <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>{ind.whatItMeans}</div>
                    <div style={{ fontSize: 12, color: GREEN }}><strong>Benchmark:</strong> {ind.benchmarkContext}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ═══ TAGLINE RECOMMENDATIONS ═══ */}
        {(r as any).taglineRecommendations && (
          <Section id="tagline-recommendations" pageBreak>
            <SectionTitle hero description="Tagline options calibrated to your brand positioning, archetype, and messaging pillars — with variations and audience resonance.">
              Tagline Recommendations
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(r as any).taglineRecommendations.map((t: any, i: number) => (
                <div key={i} style={{ background: i === 0 ? ACCENT_BG : WHITE, border: `1px solid ${i === 0 ? BLUE : BORDER}`, borderRadius: 10, padding: "24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${BLUE}15`, color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: 0, fontStyle: "italic" }}>&quot;{t.tagline}&quot;</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Why It Works</div>
                      <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, margin: 0 }}>{t.rationale}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Best Used On</div>
                      <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, margin: 0 }}>{t.bestUsedOn}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: "inline-block", padding: "4px 12px", background: `${BLUE}10`, borderRadius: 20, fontSize: 12, color: BLUE, fontWeight: 600 }}>Tone: {t.tone}</div>
                  {t.audienceResonance && (
                    <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 5, background: `${NAVY}04`, borderLeft: `3px solid ${BLUE}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", marginBottom: 4 }}>Audience Resonance</div>
                      <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{t.audienceResonance}</div>
                    </div>
                  )}
                  {t.variations && t.variations.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Variations</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {t.variations.map((v: any, j: number) => (
                          <div key={j} style={{ padding: "8px 12px", borderRadius: 5, border: `1px solid ${BORDER}`, fontSize: 12 }}>
                            <span style={{ color: SUB }}>{v.context}:</span> <span style={{ fontWeight: 600, color: NAVY }}>{v.variation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ═══ BRAND STORY ═══ */}
        {(r as any).brandStory && (
          <Section id="brand-story" pageBreak>
            <SectionTitle hero description="Your brand narrative in multiple formats for different contexts.">
              Brand Story
            </SectionTitle>
            <div style={{ fontSize: 22, fontStyle: "italic", fontWeight: 600, color: NAVY, marginBottom: 20, lineHeight: 1.4 }}>{(r as any).brandStory.headline}</div>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.75, whiteSpace: "pre-line", marginBottom: 24 }}>{(r as any).brandStory.narrative}</div>
            <div style={{ padding: "20px 24px", borderRadius: 5, background: ACCENT_BG, borderLeft: `4px solid ${BLUE}`, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Elevator Pitch</div>
              <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{(r as any).brandStory.elevatorPitch}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ padding: "16px 20px", borderRadius: 5, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", marginBottom: 6 }}>Founder Story</div>
                <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{(r as any).brandStory.founderStory}</div>
              </div>
              <div style={{ padding: "16px 20px", borderRadius: 5, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", marginBottom: 6 }}>Press Version</div>
                <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{(r as any).brandStory.pressVersion}</div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: "16px 20px", borderRadius: 5, border: `1px solid ${BORDER}`, background: `${NAVY}04` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", marginBottom: 6 }}>Investor Version</div>
              <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.55 }}>{(r as any).brandStory.investorVersion}</div>
            </div>
          </Section>
        )}

        {/* ═══ COMPANY DESCRIPTION ═══ */}
        {(r as any).companyDescription && (
          <div id="company-description" style={{ marginBottom: 48 }}>
            <div style={{ borderBottom: '2px solid #07B0F2', paddingBottom: 10, marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>Company Description</h2>
              <p style={{ fontSize: 14, color: SUB, margin: '6px 0 0', lineHeight: 1.5 }}>Ready-to-use descriptions for every context — directories, social, proposals, press, recruiting, and industry-specific communications.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: "One-Liner", sublabel: "LinkedIn tagline, Google Business, directories", text: (r as any).companyDescription.oneLiner },
                { label: "Short Description", sublabel: "Social bios, email signatures, directory listings", text: (r as any).companyDescription.shortDescription },
                { label: "Full Boilerplate", sublabel: "Press releases, About page, proposals", text: (r as any).companyDescription.fullBoilerplate },
                { label: "Proposal Intro", sublabel: "Pitch decks, RFP responses, cover letters", text: (r as any).companyDescription.proposalIntro },
                { label: "Industry-Specific", sublabel: "Industry directories, vertical-specific outreach", text: (r as any).companyDescription.industrySpecific, exclusive: true },
                { label: "Recruiting Version", sublabel: "Job postings, employer branding, careers page", text: (r as any).companyDescription.recruitingVersion, exclusive: true },
              ].map((item: any, i: number) => (
                <div key={i} style={{ background: WHITE, border: `1px solid ${item.exclusive ? BLUE : BORDER}`, borderRadius: 10, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: SUB, fontStyle: 'italic' }}>— {item.sublabel}</div>
                    {item.exclusive && <span style={{ fontSize: 10, fontWeight: 700, color: BLUE, background: `${BLUE}10`, padding: '2px 8px', borderRadius: 10 }}>Blueprint+ Exclusive</span>}
                  </div>
                  <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, margin: 0, background: '#F8FAFC', padding: '14px 16px', borderRadius: 6, border: '1px solid #E8ECF1' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ CUSTOMER JOURNEY ═══ */}
        {(r as any).customerJourneyMap && (
          <Section id="customer-journey" pageBreak>
            <SectionTitle hero description="Ideal customer journey from awareness to advocacy, with touchpoints, messaging, and conversion triggers.">
              Customer Journey
            </SectionTitle>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 24 }}>{(r as any).customerJourneyMap.overview}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(r as any).customerJourneyMap.stages.map((stage: any, i: number) => (
                <div key={i} style={{ borderRadius: 5, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", background: `${BLUE}08`, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ padding: "4px 12px", borderRadius: 20, background: BLUE, color: WHITE, fontSize: 12, fontWeight: 700 }}>{stage.stage}</span>
                    <span style={{ fontSize: 14, fontStyle: "italic", color: NAVY }}>{stage.customerMindset}</span>
                  </div>
                  <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", marginBottom: 6 }}>Touchpoints</div>
                      <div style={{ fontSize: 13, color: "#1a1a2e" }}>{stage.touchpoints.join(", ")}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", marginTop: 10, marginBottom: 4 }}>Messaging Focus</div>
                      <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{stage.messagingFocus}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", marginTop: 10, marginBottom: 4 }}>Conversion Trigger</div>
                      <div style={{ fontSize: 13, color: BLUE, fontWeight: 600 }}>{stage.conversionTrigger}</div>
                      <div style={{ fontSize: 12, color: SUB, marginTop: 6 }}>KPI: {stage.kpiToTrack}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", marginBottom: 6 }}>Content Types</div>
                      <div style={{ fontSize: 13, color: "#1a1a2e" }}>{stage.contentTypes.join(", ")}</div>
                      {stage.personaVariations && stage.personaVariations.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", marginBottom: 6 }}>Persona Variations</div>
                          {stage.personaVariations.map((p: any, j: number) => (
                            <div key={j} style={{ padding: "8px 10px", borderRadius: 5, border: `1px solid ${BORDER}`, marginBottom: 6, fontSize: 12 }}>
                              <strong style={{ color: NAVY }}>{p.persona}:</strong> <span style={{ color: "#1a1a2e" }}>{p.adaptation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {stage.optimizationTips && stage.optimizationTips.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", marginBottom: 4 }}>Optimization Tips</div>
                          {stage.optimizationTips.map((tip: string, j: number) => <div key={j} style={{ fontSize: 12, color: "#1a1a2e", lineHeight: 1.5 }}>{"\u2022"} {tip}</div>)}
                        </div>
                      )}
                    </div>
                  </div>
                  {stage.toolsRecommended && stage.toolsRecommended.length > 0 && (
                    <div style={{ padding: "10px 20px", background: LIGHT_BG, borderTop: `1px solid ${BORDER}`, fontSize: 12, color: SUB }}>Tools: {stage.toolsRecommended.join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
            {(r as any).customerJourneyMap.dropOffRisks && (r as any).customerJourneyMap.dropOffRisks.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: ORANGE, marginBottom: 12 }}>Drop-Off Risks & Mitigation</div>
                {(r as any).customerJourneyMap.dropOffRisks.map((d: any, i: number) => (
                  <div key={i} style={{ padding: "12px 16px", borderRadius: 5, border: `1px solid ${BORDER}`, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{d.stage}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>{d.risk}</div>
                      <div style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Mitigation: {d.mitigation}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ═══ SEO STRATEGY ═══ */}
        {(r as any).seoStrategy && (
          <Section id="seo-strategy" pageBreak>
            <SectionTitle hero description="Primary keywords, long-tail opportunities, and technical priorities for search visibility.">
              SEO & Keywords
            </SectionTitle>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 20 }}>{(r as any).seoStrategy.overview}</div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${BLUE}` }}>Primary Keywords</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {(r as any).seoStrategy.primaryKeywords.map((kw: any, i: number) => (
                  <div key={i} style={{ padding: "14px 16px", borderRadius: 5, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{kw.keyword}</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 4, background: `${BLUE}15`, fontSize: 11, fontWeight: 600, color: BLUE }}>{kw.intent}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 4, background: `${SUB}15`, fontSize: 11, fontWeight: 600, color: SUB }}>{kw.difficulty}</span>
                      {kw.priorityLevel && <span style={{ padding: "2px 8px", borderRadius: 4, background: `${GREEN}15`, fontSize: 11, fontWeight: 600, color: GREEN }}>{kw.priorityLevel}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#1a1a2e", lineHeight: 1.5, marginBottom: 4 }}>{kw.contentAngle}</div>
                    <div style={{ fontSize: 11, color: SUB }}>Pillar: {kw.pillarConnection}</div>
                    {kw.competitiveGap && <div style={{ fontSize: 11, color: BLUE, marginTop: 6 }}>Gap: {kw.competitiveGap}</div>}
                  </div>
                ))}
              </div>
            </div>
            {(r as any).seoStrategy.longTailOpportunities && (r as any).seoStrategy.longTailOpportunities.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${BLUE}` }}>Long-Tail Opportunities</div>
                {(r as any).seoStrategy.longTailOpportunities.map((lt: any, i: number) => (
                  <div key={i} style={{ padding: "12px 16px", borderRadius: 5, border: `1px solid ${BORDER}`, marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{lt.keyword}</div>
                    <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>Intent: {lt.searchIntent}</div>
                    <div style={{ fontSize: 12, color: "#1a1a2e" }}>Content: {lt.contentRecommendation} — {lt.estimatedImpact}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 8, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Technical Priorities</div>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#1a1a2e", lineHeight: 1.8 }}>
                {(r as any).seoStrategy.technicalPriorities.map((p: string, i: number) => <li key={i}>{p}</li>)}
              </ol>
            </div>
            <div style={{ padding: "14px 18px", borderRadius: 5, background: ACCENT_BG, borderLeft: `4px solid ${BLUE}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", marginBottom: 6 }}>Content SEO Playbook</div>
              <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 }}>{(r as any).seoStrategy.contentSEOPlaybook}</div>
            </div>
            {(r as any).seoStrategy.competitorKeywordGaps && <div style={{ marginTop: 12, fontSize: 13, color: SUB, lineHeight: 1.5 }}><strong>Competitor gaps:</strong> {(r as any).seoStrategy.competitorKeywordGaps}</div>}
            {(r as any).seoStrategy.localSEOStrategy && <div style={{ marginTop: 8, fontSize: 13, color: SUB, lineHeight: 1.5 }}><strong>Local SEO:</strong> {(r as any).seoStrategy.localSEOStrategy}</div>}
          </Section>
        )}

        {/* ═══ AEO STRATEGY ═══ */}
        {(r as any).aeoStrategy && (
          <Section id="aeo-strategy" pageBreak>
            <SectionTitle hero description="Answer Engine Optimization — entity building, content for AI citation, FAQ strategy, and implementation roadmap.">
              AEO & AI Search
            </SectionTitle>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 24 }}>{(r as any).aeoStrategy.overview}</div>
            {(() => {
              const aeo = (r as any).aeoStrategy;
              return (
                <>
                  {aeo.entityOptimization && (
                    <div style={{ marginBottom: 24, padding: "18px 20px", borderRadius: 5, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Entity Optimization</div>
                      <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55, marginBottom: 12 }}>{aeo.entityOptimization.currentEntityStatus}</div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#1a1a2e", lineHeight: 1.7 }}>{aeo.entityOptimization.entityBuildingActions.map((a: string, i: number) => <li key={i}>{a}</li>)}</ul>
                      <div style={{ marginTop: 12, fontSize: 12, color: SUB }}>Structured data: {aeo.entityOptimization.structuredDataRecommendations.join("; ")}</div>
                      <div style={{ marginTop: 8, fontSize: 12, color: BLUE }}>{aeo.entityOptimization.knowledgeGraphStrategy}</div>
                    </div>
                  )}
                  {aeo.contentForAICitation && (
                    <div style={{ marginBottom: 24, padding: "18px 20px", borderRadius: 5, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Content for AI Citation</div>
                      <div style={{ fontSize: 13, marginBottom: 10 }}>{aeo.contentForAICitation.strategy}</div>
                      <div style={{ fontSize: 12, color: SUB }}>Formats: {aeo.contentForAICitation.formatRecommendations.join("; ")}</div>
                      <div style={{ marginTop: 8, fontSize: 12 }}>Topic authority: {aeo.contentForAICitation.topicAuthority.join(", ")}</div>
                    </div>
                  )}
                  {aeo.faqStrategy && (
                    <div style={{ marginBottom: 24, padding: "18px 20px", borderRadius: 5, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>FAQ Strategy</div>
                      <div style={{ fontSize: 13, marginBottom: 10 }}>{aeo.faqStrategy.overview}</div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "#1a1a2e", lineHeight: 1.7 }}>{aeo.faqStrategy.priorityFAQs.slice(0, 10).map((q: string, i: number) => <li key={i}>{q}</li>)}</ul>
                      <div style={{ marginTop: 10, fontSize: 12, color: SUB }}>{aeo.faqStrategy.faqImplementation}</div>
                    </div>
                  )}
                  {aeo.competitiveAEOAnalysis && (
                    <div style={{ marginBottom: 24, padding: "18px 20px", borderRadius: 5, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Competitive AEO Analysis</div>
                      <div style={{ fontSize: 13, marginBottom: 8 }}>{aeo.competitiveAEOAnalysis.overview}</div>
                      <div style={{ fontSize: 12 }}>Gaps: {aeo.competitiveAEOAnalysis.gaps.join("; ")}</div>
                      <div style={{ marginTop: 8, fontSize: 12, color: GREEN }}>Opportunities: {aeo.competitiveAEOAnalysis.opportunities.join("; ")}</div>
                    </div>
                  )}
                  {aeo.aiSearchMonitoring && (
                    <div style={{ marginBottom: 24, padding: "18px 20px", borderRadius: 5, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>AI Search Monitoring</div>
                      <div style={{ fontSize: 12 }}>Tools: {aeo.aiSearchMonitoring.toolsToUse.join("; ")}</div>
                      <div style={{ marginTop: 6, fontSize: 12 }}>Metrics: {aeo.aiSearchMonitoring.metricsToTrack.join("; ")}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: SUB }}>{aeo.aiSearchMonitoring.reviewCadence}</div>
                    </div>
                  )}
                  {aeo.implementationRoadmap && aeo.implementationRoadmap.length > 0 && (
                    <div style={{ marginBottom: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Implementation Roadmap</div>
                      {aeo.implementationRoadmap.map((phase: any, i: number) => (
                        <div key={i} style={{ padding: "14px 18px", borderRadius: 5, border: `1px solid ${BORDER}`, marginBottom: 10 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 6 }}>{phase.phase}</div>
                          <ul style={{ margin: "0 0 8px", paddingLeft: 20, fontSize: 12 }}>{phase.actions.map((a: string, j: number) => <li key={j}>{a}</li>)}</ul>
                          <div style={{ fontSize: 12, color: GREEN }}>Outcome: {phase.expectedOutcome}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </Section>
        )}

        {/* ═══ EMAIL FRAMEWORK ═══ */}
        {(r as any).emailMarketingFramework && (
          <Section id="email-framework" pageBreak>
            <SectionTitle hero description="Welcome sequence, nurture campaign, re-engagement, segmentation, and automation triggers.">
              Email Framework
            </SectionTitle>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 24 }}>{(r as any).emailMarketingFramework.overview}</div>
            {(() => {
              const em = (r as any).emailMarketingFramework;
              return (
                <>
                  {em.welcomeSequence && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Welcome Sequence</div>
                      <div style={{ fontSize: 13, color: SUB, marginBottom: 12 }}>{em.welcomeSequence.description}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {em.welcomeSequence.emails.map((email: any, i: number) => (
                          <div key={i} style={{ padding: "14px 18px", borderRadius: 5, border: `1px solid ${BORDER}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${BLUE}15`, color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, color: SUB, marginBottom: 2 }}>{email.timing}</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{email.subject}</div>
                              <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>Purpose: {email.purpose}</div>
                              <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.5 }}>{email.keyMessage}</div>
                              {email.ctaButton && <div style={{ marginTop: 8 }}><span style={{ padding: "4px 10px", borderRadius: 5, background: BLUE, color: WHITE, fontSize: 12, fontWeight: 700 }}>{email.ctaButton}</span></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {em.nurtureCampaign && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Nurture Campaign</div>
                      <div style={{ fontSize: 13, color: SUB, marginBottom: 12 }}>{em.nurtureCampaign.description}</div>
                      {em.nurtureCampaign.emails.map((email: any, i: number) => (
                        <div key={i} style={{ padding: "12px 16px", borderRadius: 5, border: `1px solid ${BORDER}`, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: SUB }}>{email.timing}</span> — <strong style={{ color: NAVY }}>{email.subject}</strong> ({email.contentType})
                        </div>
                      ))}
                    </div>
                  )}
                  {em.reEngagementSequence && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 8, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Re-engagement Sequence</div>
                      <div style={{ fontSize: 12, color: SUB, marginBottom: 10 }}>Trigger: {em.reEngagementSequence.trigger}</div>
                      {em.reEngagementSequence.emails.map((email: any, i: number) => (
                        <div key={i} style={{ padding: "10px 14px", borderRadius: 5, border: `1px solid ${BORDER}`, marginBottom: 6, fontSize: 13 }}><strong>{email.subject}</strong> — {email.keyMessage}</div>
                      ))}
                    </div>
                  )}
                  {em.segmentationStrategy && <div style={{ padding: "14px 18px", borderRadius: 5, background: ACCENT_BG, borderLeft: `4px solid ${BLUE}`, marginBottom: 16, fontSize: 13 }}>{em.segmentationStrategy}</div>}
                  {em.subjectLineFormulas && em.subjectLineFormulas.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", marginBottom: 8 }}>Subject Line Formulas</div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>{em.subjectLineFormulas.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                    </div>
                  )}
                  {em.sendCadence && <div style={{ fontSize: 13, color: SUB, marginBottom: 12 }}>Cadence: {em.sendCadence}</div>}
                  {em.automationTriggers && em.automationTriggers.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", marginBottom: 8 }}>Automation Triggers</div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, lineHeight: 1.8, color: "#1a1a2e" }}>{em.automationTriggers.map((t: string, i: number) => <li key={i}>{t}</li>)}</ul>
                    </div>
                  )}
                </>
              );
            })()}
          </Section>
        )}

        {/* ═══ SOCIAL MEDIA STRATEGY ═══ */}
        {(r as any).socialMediaStrategy && (
          <Section id="social-media-strategy" pageBreak>
            <SectionTitle hero description="Platform priorities, content strategy, and cross-platform repurposing.">
              Social Media Strategy
            </SectionTitle>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 24 }}>{(r as any).socialMediaStrategy.overview}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(r as any).socialMediaStrategy.platforms.map((plat: any, i: number) => (
                <div key={i} style={{ padding: "20px 24px", borderRadius: 5, border: `2px solid ${BORDER}` }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: NAVY, marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${BLUE}` }}>{plat.platform}</div>
                  <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.55, marginBottom: 12 }}>{plat.whyThisPlatform}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div><span style={{ fontSize: 11, fontWeight: 700, color: SUB }}>AUDIENCE</span><div style={{ fontSize: 12 }}>{plat.audienceOnPlatform}</div></div>
                    <div><span style={{ fontSize: 11, fontWeight: 700, color: SUB }}>POSTING</span><div style={{ fontSize: 12 }}>{plat.postingFrequency} · {plat.contentMix}</div></div>
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 8 }}><strong>Strategy:</strong> {plat.contentStrategy}</div>
                  {plat.examplePosts && plat.examplePosts.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: SUB, marginBottom: 4 }}>Example posts</div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.6 }}>{plat.examplePosts.map((p: string, j: number) => <li key={j}>{p}</li>)}</ul>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: BLUE }}>KPI: {plat.kpiToTrack}</div>
                  {plat.growthTactics && plat.growthTactics.length > 0 && <div style={{ marginTop: 8, fontSize: 12 }}>Growth: {plat.growthTactics.join("; ")}</div>}
                </div>
              ))}
            </div>
            {(r as any).socialMediaStrategy.platformsToAvoid && (
              <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 5, border: `1px solid ${BORDER}`, background: `${SUB}08` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: SUB, marginBottom: 6 }}>Platforms to avoid</div>
                <div style={{ fontSize: 13 }}>{(r as any).socialMediaStrategy.platformsToAvoid.platforms.join(", ")} — {(r as any).socialMediaStrategy.platformsToAvoid.reasoning}</div>
              </div>
            )}
            {(r as any).socialMediaStrategy.crossPlatformStrategy && (
              <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 5, background: ACCENT_BG, borderLeft: `4px solid ${BLUE}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 6 }}>Cross-Platform Strategy</div>
                <div style={{ fontSize: 14, color: "#1a1a2e", lineHeight: 1.6 }}>{(r as any).socialMediaStrategy.crossPlatformStrategy}</div>
              </div>
            )}
          </Section>
        )}

        {/* ═══ CONTENT CALENDAR ═══ */}
        {(r as any).contentCalendarFramework && (
          <Section id="content-calendar" pageBreak>
            <SectionTitle hero description="Monthly themes, weekly structure, batching and repurposing playbook.">
              Content Calendar
            </SectionTitle>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 24 }}>{(r as any).contentCalendarFramework.overview}</div>
            {(r as any).contentCalendarFramework.monthlyThemes && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Monthly Themes</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                  {(r as any).contentCalendarFramework.monthlyThemes.map((m: any, i: number) => (
                    <div key={i} style={{ padding: "14px 16px", borderRadius: 5, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 4 }}>{m.month}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{m.theme}</div>
                      <div style={{ fontSize: 11, color: SUB, marginBottom: 6 }}>Pillar: {m.contentPillarFocus}</div>
                      <div style={{ fontSize: 12, lineHeight: 1.5 }}>{m.keyTopics.join("; ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(r as any).contentCalendarFramework.weeklyStructure && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Weekly Structure</div>
                <div style={{ fontSize: 13, color: SUB, marginBottom: 12 }}>{(r as any).contentCalendarFramework.weeklyStructure.description}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(r as any).contentCalendarFramework.weeklyStructure.days.map((d: any, i: number) => (
                    <div key={i} style={{ padding: "12px 16px", borderRadius: 5, border: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontWeight: 700, color: NAVY }}>{d.day}</span>
                      <span style={{ fontSize: 12, color: SUB }}>{d.contentType} · {d.platform}</span>
                      <span style={{ fontSize: 12, color: "#1a1a2e" }}>{d.exampleTopic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(r as any).contentCalendarFramework.batchingStrategy && <div style={{ padding: "14px 18px", borderRadius: 5, background: `${BLUE}08`, borderLeft: `4px solid ${BLUE}`, marginBottom: 12, fontSize: 13 }}>{(r as any).contentCalendarFramework.batchingStrategy}</div>}
            {(r as any).contentCalendarFramework.repurposingPlaybook && <div style={{ padding: "14px 18px", borderRadius: 5, border: `1px solid ${BORDER}`, fontSize: 13 }}>{(r as any).contentCalendarFramework.repurposingPlaybook}</div>}
          </Section>
        )}

        {/* ═══ SWOT ANALYSIS ═══ */}
        {(r as any).swotAnalysis && (
          <Section id="swot-analysis" pageBreak>
            <SectionTitle hero description="Strengths, weaknesses, opportunities, and threats calibrated to your diagnostic results.">
              SWOT Analysis
            </SectionTitle>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 24 }}>{(r as any).swotAnalysis.overview}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ padding: "16px 20px", borderRadius: 5, border: `2px solid ${GREEN}`, background: `${GREEN}08` }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: GREEN, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${GREEN}` }}>Strengths</div>
                {(r as any).swotAnalysis.strengths.map((s: any, i: number) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{s.item}</div>
                    <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>{s.evidence}</div>
                    <div style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Leverage: {s.leverage}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 20px", borderRadius: 5, border: `2px solid ${ORANGE}`, background: `${ORANGE}08` }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: ORANGE, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${ORANGE}` }}>Weaknesses</div>
                {(r as any).swotAnalysis.weaknesses.map((w: any, i: number) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{w.item}</div>
                    <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>{w.evidence}</div>
                    <div style={{ fontSize: 12, color: ORANGE, fontWeight: 600 }}>Mitigation: {w.mitigation}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 20px", borderRadius: 5, border: `2px solid ${BLUE}`, background: `${BLUE}08` }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: BLUE, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Opportunities</div>
                {(r as any).swotAnalysis.opportunities.map((o: any, i: number) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{o.item}</div>
                    <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>{o.context}</div>
                    <div style={{ fontSize: 12, color: BLUE, fontWeight: 600 }}>Action: {o.action}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 20px", borderRadius: 5, border: `2px solid ${RED_S}`, background: `${RED_S}08` }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: RED_S, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${RED_S}` }}>Threats</div>
                {(r as any).swotAnalysis.threats.map((t: any, i: number) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{t.item}</div>
                    <div style={{ fontSize: 12, color: SUB }}>Likelihood: {t.likelihood} · Impact: {t.impact}</div>
                    <div style={{ fontSize: 12, color: RED_S, fontWeight: 600 }}>Contingency: {t.contingency}</div>
                  </div>
                ))}
              </div>
            </div>
            {(r as any).swotAnalysis.strategicImplications && (
              <div style={{ marginTop: 20, padding: "18px 22px", borderRadius: 5, background: `linear-gradient(135deg, ${NAVY}08 0%, ${BLUE}08 100%)`, border: `2px solid ${BLUE}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", marginBottom: 8 }}>Strategic Implications</div>
                <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.6 }}>{(r as any).swotAnalysis.strategicImplications}</div>
              </div>
            )}
          </Section>
        )}

        {/* ═══ BRAND GLOSSARY ═══ */}
        {(r as any).brandGlossary && (
          <Section id="brand-glossary" pageBreak>
            <SectionTitle hero description="Consistent language across all communications — terms to use, phrases to avoid, and jargon guide.">
              Brand Glossary
            </SectionTitle>
            <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 24 }}>{(r as any).brandGlossary.overview}</div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Terms to Use</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                      <th style={{ textAlign: "left", padding: "10px 12px", color: BLUE, fontWeight: 700 }}>Term</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", color: BLUE, fontWeight: 700 }}>Instead of</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", color: BLUE, fontWeight: 700 }}>Context</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", color: BLUE, fontWeight: 700 }}>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(r as any).brandGlossary.termsToUse.map((row: any, i: number) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: NAVY }}>{row.term}</td>
                        <td style={{ padding: "10px 12px", color: SUB }}>{row.insteadOf}</td>
                        <td style={{ padding: "10px 12px", color: "#1a1a2e" }}>{row.context}</td>
                        <td style={{ padding: "10px 12px", color: "#1a1a2e", fontStyle: "italic" }}>{row.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${BLUE}` }}>Phrases to Avoid</div>
              {(r as any).brandGlossary.phrasesToAvoid.map((p: any, i: number) => (
                <div key={i} style={{ padding: "12px 16px", borderRadius: 5, border: `1px solid ${BORDER}`, marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, color: RED_S }}>&quot;{p.phrase}&quot;</span>
                  <span style={{ fontSize: 12, color: SUB }}> — {p.why}</span>
                  <div style={{ fontSize: 12, color: GREEN, marginTop: 4 }}>Use instead: {p.alternative}</div>
                </div>
              ))}
            </div>
            {(r as any).brandGlossary.industryJargonGuide && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <div style={{ padding: "14px 16px", borderRadius: 5, border: `1px solid ${GREEN}`, background: `${GREEN}06` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, marginBottom: 8 }}>Use freely</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6 }}>{(r as any).brandGlossary.industryJargonGuide.useFreely.join(", ")}</div>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 5, border: `1px solid ${BLUE}`, background: `${BLUE}06` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 8 }}>Define when used</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6 }}>{(r as any).brandGlossary.industryJargonGuide.defineWhenUsed.join(", ")}</div>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 5, border: `1px solid ${RED_S}`, background: `${RED_S}06` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: RED_S, marginBottom: 8 }}>Never use</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6 }}>{(r as any).brandGlossary.industryJargonGuide.neverUse.join(", ")}</div>
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ═══ BRAND STRATEGY ACTIVATION SESSION CTA ═══ */}
        <Section id="activation-session">
          <div style={{
            padding: "32px 36px",
            borderRadius: 5,
            background: `linear-gradient(135deg, ${NAVY} 0%, #0A2A7A 100%)`,
            color: WHITE,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `${BLUE}15` }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: `${BLUE}10` }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: `${BLUE}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 16l2 2 4-4" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>Included With Your WunderBrand Blueprint+™</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>Brand Strategy Activation Session</div>
                </div>
              </div>

              <p style={{ fontSize: 16, color: `${WHITE}DD`, lineHeight: 1.65, marginBottom: 24, maxWidth: 620 }}>
                Your WunderBrand Blueprint+™ includes a complimentary 30-minute Brand Strategy Activation Session. We&apos;ll turn your diagnostic results into a prioritized game plan and identify your highest-impact next moves.
              </p>

              <a
                href="https://calendly.com/claudine-wunderbardigital/brand-blueprint-strategy-activation-session?utm_source=brand_blueprint_plus_report&utm_medium=report_cta&utm_campaign=strategy_activation"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 32px", borderRadius: 5,
                  background: BLUE, color: WHITE,
                  fontSize: 16, fontWeight: 900,
                  textDecoration: "none", fontFamily: "Lato, sans-serif",
                  boxShadow: `0 4px 20px ${BLUE}50`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                Activate Your Strategy →
              </a>
            </div>
          </div>
        </Section>

        {/* ═══ CTA — WORK WITH US ═══ */}
        <Section id="work-with-us">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>What&apos;s Next</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.3 }}>Ready to Execute Your Brand System?</h2>
            <p style={{ fontSize: 16, color: SUB, lineHeight: 1.65, maxWidth: 620, margin: "0 auto" }}>
              You now have the most comprehensive brand operating system available. The next step is execution. Whether you need hands-on marketing support or AI strategy guidance, our team is ready to help you turn this system into results.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Managed Marketing */}
            <div style={{ padding: "28px", borderRadius: 5, border: `2px solid ${BLUE}`, background: `${BLUE}04`, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${BLUE}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z" stroke={BLUE} strokeWidth="1.5" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Recommended</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>Managed Marketing</div>
                </div>
              </div>
              <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 20 }}>
                We execute your brand strategy — content creation, campaign management, performance optimization, and ongoing brand stewardship. Your Blueprint+ becomes the playbook our team follows.
              </div>
              <div style={{ flex: 1, marginBottom: 20 }}>
                {["Full execution of your WunderBrand Blueprint+™ strategy", "Content creation aligned to your brand system", "Campaign management across all channels", "Monthly performance reporting & optimization", "Direct access to brand strategists"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}><circle cx="10" cy="10" r="9" fill={BLUE} opacity="0.15"/><path d="M6 10.5l2.5 2.5L14 7.5" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 13, color: "#1a1a2e" }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href="https://wunderbardigital.com/managed-marketing?utm_source=brand_blueprint_plus_report&utm_medium=report_cta&utm_campaign=explore_service&utm_content=blueprint_plus_managed_marketing" target="_blank" rel="noopener noreferrer" style={{
                display: "block", width: "100%", padding: "14px 24px", borderRadius: 5, border: "none",
                background: BLUE, color: WHITE, fontSize: 15, fontWeight: 900,
                textAlign: "center", textDecoration: "none", fontFamily: "Lato, sans-serif",
                boxSizing: "border-box", boxShadow: `0 4px 14px ${BLUE}40`,
              }}>Explore Managed Marketing →</a>
            </div>

            {/* AI Consulting */}
            <div style={{ padding: "28px", borderRadius: 5, border: `2px solid ${NAVY}20`, background: `${NAVY}04`, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${NAVY}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><rect x="3" y="3" width="18" height="18" rx="3" stroke={NAVY} strokeWidth="1.5"/><path d="M8 10l3 3-3 3" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 16h3" stroke={NAVY} strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Expert Guidance</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>AI Consulting</div>
                </div>
              </div>
              <div style={{ fontSize: 15, color: "#1a1a2e", lineHeight: 1.65, marginBottom: 20 }}>
                Expert guidance on integrating AI into your marketing workflow. We help you leverage your 28-prompt library and build custom AI systems that amplify your brand at scale.
              </div>
              <div style={{ flex: 1, marginBottom: 20 }}>
                {["Custom AI workflow design for your team", "Prompt engineering & optimization training", "AI tool selection & integration strategy", "Brand-safe AI content governance", "Ongoing AI strategy advisory"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}><circle cx="10" cy="10" r="9" fill={NAVY} opacity="0.12"/><path d="M6 10.5l2.5 2.5L14 7.5" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 13, color: "#1a1a2e" }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href="https://wunderbardigital.com/ai-consulting?utm_source=brand_blueprint_plus_report&utm_medium=report_cta&utm_campaign=explore_service&utm_content=blueprint_plus_ai_consulting" target="_blank" rel="noopener noreferrer" style={{
                display: "block", width: "100%", padding: "14px 24px", borderRadius: 5,
                border: `2px solid ${NAVY}`, background: "transparent", color: NAVY,
                fontSize: 15, fontWeight: 900, textAlign: "center", textDecoration: "none",
                fontFamily: "Lato, sans-serif", boxSizing: "border-box",
              }}>Explore AI Consulting →</a>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p style={{ fontSize: 14, color: SUB, margin: 0 }}>
              Need help deciding? <a href="https://wunderbardigital.com/talk-to-an-expert?utm_source=brand_blueprint_plus_report&utm_medium=report_cta&utm_campaign=talk_expert&utm_content=blueprint_plus_cta_talk_expert" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: "none", fontWeight: 700 }}>Talk to an expert</a> — we&apos;ll help you determine the right path forward.
            </p>
          </div>
        </Section>

        {/* ═══ FOOTER ═══ */}
        <footer style={{ textAlign: "center", padding: "20px 0 0", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <a href={UTM_BASE} target="_blank" rel="noopener noreferrer">
              <img src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp" alt="Wunderbar Digital" style={{ height: 20, objectFit: "contain" }} />
            </a>
          </div>
          <p style={{ fontSize: 14, color: SUB, marginBottom: 4 }}>
            WunderBrand Blueprint+™ is a product of Wunderbar Digital ·{" "}
            <a href={UTM_BASE} target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: "none", fontWeight: 700 }}>wunderbardigital.com</a>
          </p>
          <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
            © 2026 Wunderbar Digital. All rights reserved. WunderBrand Blueprint+™ and the WunderBrand Score™ are trademarks of Wunderbar Digital.
            This report is confidential and intended solely for the use of the individual or entity to whom it is addressed.
          </p>
          <p style={{ fontSize: 9, fontWeight: 400, color: "#8A97A8", textAlign: "center", marginTop: 16 }}>
            Confidential — {r.businessName} | Generated {r.date} | wunderbardigital.com
          </p>
        </footer>
        </div>
      </div>
    </div>
    <ReportNav reportTitle="WunderBrand Blueprint+™" sections={[
      { id: "executive-summary", label: "Executive Summary", group: "Diagnostic" },
      { id: "context-coverage", label: "Context Coverage", group: "Diagnostic" },
      { id: "brand-alignment-score", label: "WunderBrand Score™", group: "Diagnostic" },
      { id: "focus-area-diagnosis", label: "Focus Area Diagnosis", group: "Diagnostic" },
      { id: "pillar-deep-dives", label: "Pillar Deep Dives", group: "Diagnostic" },
      { id: "strategic-alignment", label: "Strategic Alignment", group: "Diagnostic" },
      { id: "strategic-overview", label: "Strategic Overview", group: "Strategic Foundation" },
      { id: "blueprint-overview", label: "Blueprint+ Overview", group: "Strategic Foundation" },
      { id: "brand-foundation", label: "Brand Foundation", group: "Strategic Foundation" },
      { id: "brand-archetypes", label: "Brand Archetypes", group: "Strategic Foundation" },
      { id: "messaging-system", label: "Messaging System", group: "Messaging & Content" },
      { id: "messaging-pillars", label: "Messaging Pillars", group: "Messaging & Content" },
      { id: "content-pillars", label: "Content Pillars", group: "Messaging & Content" },
      { id: "messaging-matrix", label: "Messaging Matrix", group: "Messaging & Content" },
      { id: "brand-persona", label: "Your Brand Persona", group: "Messaging & Content" },
      { id: "audience-persona", label: "Audience & Persona", group: "Audience & Positioning" },
      { id: "audience-segmentation", label: "Audience Segmentation", group: "Audience & Positioning" },
      { id: "competitive-positioning", label: "Competitive Positioning", group: "Audience & Positioning" },
      { id: "visibility-discovery", label: "Visibility & Discovery", group: "Visibility & Growth" },
      { id: "visual-direction", label: "Visual Direction", group: "Visibility & Growth" },
      { id: "conversion-strategy", label: "Conversion Strategy", group: "Visibility & Growth" },
      { id: "brand-architecture", label: "Brand Architecture", group: "Visibility & Growth" },
      { id: "campaign-strategy", label: "Campaign Strategy", group: "Visibility & Growth" },
      { id: "strategic-action-plan", label: "Strategic Action Plan", group: "Implementation" },
      { id: "prompt-library", label: "AI Prompt Library (28)", group: "Implementation" },
      { id: "execution-guardrails", label: "Execution Guardrails", group: "Implementation" },
      { id: "measurement-optimization", label: "Measurement & Optimization", group: "Implementation" },
      { id: "strategic-guardrails", label: "Strategic Guardrails", group: "Implementation" },
      { id: "strategic-trade-offs", label: "Strategic Trade-Offs", group: "Implementation" },
      { id: "ninety-day-roadmap", label: "90-Day Roadmap", group: "Implementation" },
      { id: "brand-health-scorecard", label: "Brand Health Scorecard", group: "Implementation" },
      { id: "tagline-recommendations", label: "Tagline Recommendations", group: "Brand Assets" },
      { id: "brand-story", label: "Brand Story", group: "Brand Assets" },
      { id: "company-description", label: "Company Description", group: "Brand Assets" },
      { id: "customer-journey", label: "Customer Journey", group: "Channel Strategy" },
      { id: "seo-strategy", label: "SEO & Keywords", group: "Channel Strategy" },
      { id: "aeo-strategy", label: "AEO & AI Search", group: "Channel Strategy" },
      { id: "email-framework", label: "Email Framework", group: "Channel Strategy" },
      { id: "social-media-strategy", label: "Social Media Strategy", group: "Channel Strategy" },
      { id: "content-calendar", label: "Content Calendar", group: "Channel Strategy" },
      { id: "swot-analysis", label: "SWOT Analysis", group: "Reference" },
      { id: "brand-glossary", label: "Brand Glossary", group: "Reference" },
      { id: "activation-session", label: "Strategy Activation Session", group: "Reference" },
      { id: "work-with-us", label: "Work with Us", group: "Reference" },
    ]} />

    {/* Wundy™ Report Companion — Blueprint+ tier */}
    <WundyChat
      mode="report"
      tier="blueprint-plus"
      reportId="preview"
      greeting={`Hi, I\u2019m Wundy™ \u2014 I have ${r.businessName}\u2019s WunderBrand Blueprint+™ report right here. I can help you understand your scores, explain any section, or help you figure out where to start. What would you like to know?`}
    />
    </>
  );
}
