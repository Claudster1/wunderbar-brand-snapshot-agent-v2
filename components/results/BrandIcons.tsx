"use client";

import type { ReactNode } from "react";

const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";

export function SectionGlyph({
  token,
  size = 18,
  color = BLUE,
}: {
  token: string;
  size?: number;
  color?: string;
}) {
  const t = token.toLowerCase();
  const common = { width: size, height: size, viewBox: "0 0 16 16", fill: "none" as const, "aria-hidden": true };

  const map: Record<string, ReactNode> = {
    positioning: <><circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth="1.2" /><circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.2" /></>,
    messaging: <><path d="M2.5 3.5h11v7h-7L3.5 13V10.5h-1z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" /></>,
    archetype: <><path d="M8 3v6M5.5 6h5M3.5 13h9" stroke={color} strokeWidth="1.2" strokeLinecap="round" /></>,
    audience: <><circle cx="6" cy="6" r="2" stroke={color} strokeWidth="1.2" /><circle cx="11" cy="7" r="2" stroke={color} strokeWidth="1.2" /><path d="M2.5 13c.7-2 2-3 3.5-3s2.8 1 3.5 3" stroke={color} strokeWidth="1.1" strokeLinecap="round" /></>,
    persona: <><rect x="2.8" y="2.8" width="10.4" height="10.4" rx="1.6" stroke={color} strokeWidth="1.2" /><path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" /></>,
    journey: <><circle cx="3" cy="8" r="1.6" stroke={color} strokeWidth="1.1" /><circle cx="8" cy="8" r="1.6" stroke={color} strokeWidth="1.1" /><circle cx="13" cy="8" r="1.6" stroke={color} strokeWidth="1.1" /><path d="M4.6 8h1.8M9.6 8h1.8" stroke={color} strokeWidth="1.1" strokeLinecap="round" /></>,
    competitive: <><path d="M3 12l4-8 4 8M5 9h6" stroke={color} strokeWidth="1.2" strokeLinejoin="round" /><circle cx="12.5" cy="4.5" r="1.5" stroke={color} strokeWidth="1.2" /></>,
    channel: <><rect x="2.5" y="3" width="4.2" height="4.2" stroke={color} strokeWidth="1.1" /><rect x="9.3" y="3" width="4.2" height="4.2" stroke={color} strokeWidth="1.1" /><rect x="5.9" y="8.8" width="4.2" height="4.2" stroke={color} strokeWidth="1.1" /></>,
    spend: <><circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth="1.2" /><path d="M8 5v6M6 6.2h3.2a1.1 1.1 0 1 1 0 2.2H6.8a1.1 1.1 0 1 0 0 2.2H10" stroke={color} strokeWidth="1.1" strokeLinecap="round" /></>,
    priorities: <><path d="M3 4h10M3 8h7M3 12h5" stroke={color} strokeWidth="1.2" strokeLinecap="round" /><circle cx="12.5" cy="8" r="1.3" fill={color} /></>,
    voice: <><rect x="6" y="3" width="4" height="7" rx="2" stroke={color} strokeWidth="1.2" /><path d="M4 8a4 4 0 0 0 8 0M8 12v2M6.5 14h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" /></>,
    visual: <><path d="M8 2.8a5.2 5.2 0 1 0 5.2 5.2c0 .9-.7 1.6-1.6 1.6H10a1.6 1.6 0 0 0-1.6 1.6c0 .9-.7 1.6-1.6 1.6A5.2 5.2 0 0 1 8 2.8z" stroke={color} strokeWidth="1.2" /><circle cx="5.2" cy="7" r=".8" fill={color} /></>,
    checklist: <><rect x="3.5" y="2.5" width="9" height="11" rx="1.5" stroke={color} strokeWidth="1.2" /><path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" /></>,
    email: <><rect x="2.5" y="4" width="11" height="8" rx="1.2" stroke={color} strokeWidth="1.2" /><path d="M3.3 4.8L8 8.5l4.7-3.7" stroke={color} strokeWidth="1.2" strokeLinecap="round" /></>,
    seo: <><circle cx="6.5" cy="6.5" r="3" stroke={color} strokeWidth="1.2" /><path d="M9 9l3.5 3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" /></>,
    paid: <><path d="M8 2.8l2.4 4.8H8.9v3.8H7.1V7.6H5.6z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" /><path d="M5.2 12.2h5.6" stroke={color} strokeWidth="1.2" strokeLinecap="round" /></>,
    thought: <><circle cx="8" cy="7" r="3.2" stroke={color} strokeWidth="1.2" /><path d="M6.6 10.2V12h2.8v-1.8" stroke={color} strokeWidth="1.2" strokeLinecap="round" /><path d="M6 13h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" /></>,
    pr: <><path d="M3 12V4h4.8a2 2 0 0 1 0 4H3" stroke={color} strokeWidth="1.2" strokeLinecap="round" /><path d="M9.8 7.2l3.2 4.8" stroke={color} strokeWidth="1.2" strokeLinecap="round" /></>,
    roadmap: <><path d="M2.8 3.8h4.2v2.5H2.8zM9 3.8h4.2v2.5H9zM5.9 9.8h4.2v2.5H5.9z" stroke={color} strokeWidth="1.1" /><path d="M7 5h2M8 6.3v3.4" stroke={color} strokeWidth="1.1" strokeLinecap="round" /></>,
  };

  return <svg {...common}>{map[t] || map.positioning}</svg>;
}

/** Solid cyan circle + check (wunderbardigital.com value-prop lists). */
export function ResultsCheckIcon() {
  return (
    <span className="results-check-icon" aria-hidden>
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path
          d="M1 4.2 3.6 6.8 9 1.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Icon tile for results insight / unlock lists (replaces round bullets). */
export function ResultsListIcon({
  token,
  size = 20,
  variant = "light",
}: {
  token: string;
  size?: number;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <span
      className={
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border shadow-sm " +
        (isDark
          ? "border-white/20 bg-white/10"
          : "border-brand-blue/20 bg-gradient-to-br from-[#f0f9ff] to-white")
      }
      aria-hidden
    >
      <SectionGlyph token={token} size={size} color={isDark ? "#7dd3fc" : "#021859"} />
    </span>
  );
}

export function BrandArchetypeIcon({
  archetype,
  size = 54,
  color = BLUE,
}: {
  archetype?: string | null;
  size?: number;
  color?: string;
}) {
  const name = (archetype || "").toLowerCase();
  const common = { width: size, height: size, viewBox: "0 0 48 56", fill: "none" as const, "aria-hidden": true };

  if (name.includes("sage") || name.includes("guide")) {
    return (
      <svg {...common}>
        <ellipse cx="24" cy="30" rx="16" ry="20" stroke={color} strokeWidth="2.2" fill="none" />
        <ellipse cx="24" cy="30" rx="16" ry="20" fill={color} opacity="0.05" />
        <circle cx="17" cy="26" r="7.5" stroke={color} strokeWidth="2.2" fill="none" />
        <circle cx="31" cy="26" r="7.5" stroke={color} strokeWidth="2.2" fill="none" />
        <circle cx="17" cy="26" r="4" fill={color} />
        <circle cx="31" cy="26" r="4" fill={color} />
        <circle cx="15" cy="24.5" r="1.5" fill={WHITE} />
        <circle cx="29" cy="24.5" r="1.5" fill={WHITE} />
        <path d="M22 35l2 3.5 2-3.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 14l8 7M38 14l-8 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name.includes("explorer")) {
    return (
      <svg {...common}>
        <path d="M4 48l14-28 10 14 6-8 10 22H4z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="36" cy="14" r="5" stroke={color} strokeWidth="2.2" />
      </svg>
    );
  }
  if (name.includes("hero")) {
    return (
      <svg {...common}>
        <path d="M24 4L6 14v14c0 12 8 19 18 24 10-5 18-12 18-24V14L24 4z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M24 16l3 6.5h7l-5.5 4.5 2 7L24 30l-6.5 4 2-7L14 22.5h7z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name.includes("creator")) {
    return (
      <svg {...common}>
        <rect x="4" y="18" width="40" height="28" rx="4" stroke={color} strokeWidth="2.2" />
        <circle cx="24" cy="33" r="9" stroke={color} strokeWidth="2.2" />
      </svg>
    );
  }
  if (name.includes("caregiver")) {
    return (
      <svg {...common}>
        <path d="M18 10h12v12h12v12H30v12H18V34H6V22h12V10z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name.includes("ruler")) {
    return (
      <svg {...common}>
        <path d="M6 44V12l9 10 9-18 9 18 9-10v32H6z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M6 44h36" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name.includes("magician")) {
    return (
      <svg {...common}>
        <path d="M24 4l6 14h15l-12 10 5 15-14-9-14 9 5-15L3 18h15z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name.includes("outlaw")) {
    return (
      <svg {...common}>
        <path d="M30 4L12 30h12L16 52l22-28H26L30 4z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name.includes("lover")) {
    return (
      <svg {...common}>
        <path d="M24 18c-2.5-5-8-9-13-5s-5 10 0 18c3.5 5 9 10 13 15 4-5 9.5-10 13-15 5-8 5-14 0-18s-10.5 0-13 5z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name.includes("innocent")) {
    return (
      <svg {...common}>
        <ellipse cx="24" cy="22" rx="14" ry="18" stroke={color} strokeWidth="2.2" />
        <path d="M22 40l2 2 2-2" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name.includes("entertainer")) {
    return (
      <svg {...common}>
        <path d="M16 14c0-6 3.5-10 8-10s8 4 8 10v16c0 6-3.5 10-8 10s-8-4-8-10V14z" stroke={color} strokeWidth="2.2" />
        <path d="M24 40v8M18 48h12" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name.includes("neighbor")) {
    return (
      <svg {...common}>
        <path d="M8 12h24v24c0 4-4 8-8 8H16c-4 0-8-4-8-8V12z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="2.2" />
      <path d="M24 14v20M14 24h20" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

