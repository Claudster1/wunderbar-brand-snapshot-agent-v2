import type { CSSProperties, ReactNode } from "react";
import { BLUE } from "./tokens";

export function PillarIcon({ pillar, size = 24 }: { pillar: string; size?: number }) {
  const style: CSSProperties = { width: size, height: size, flexShrink: 0 };
  const icons: Record<string, ReactNode> = {
    positioning: (
      <svg viewBox="0 0 24 24" fill="none" style={style} aria-hidden>
        <circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="1.8" />
        <circle cx="12" cy="12" r="6" stroke={BLUE} strokeWidth="1.5" opacity="0.5" />
        <circle cx="12" cy="12" r="2.5" fill={BLUE} />
      </svg>
    ),
    messaging: (
      <svg viewBox="0 0 24 24" fill="none" style={style} aria-hidden>
        <path d="M4 4h16v12H8l-4 4V4z" stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8 8h8M8 11h5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    visibility: (
      <svg viewBox="0 0 24 24" fill="none" style={style} aria-hidden>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3.5" stroke={BLUE} strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1.5" fill={BLUE} />
      </svg>
    ),
    credibility: (
      <svg viewBox="0 0 24 24" fill="none" style={style} aria-hidden>
        <path d="M12 2l2.9 5.8L21 9l-4.5 4.4 1.1 6.3L12 17l-5.6 2.7 1.1-6.3L3 9l6.1-1.2L12 2z" stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
    conversion: (
      <svg viewBox="0 0 24 24" fill="none" style={style} aria-hidden>
        <path d="M12 3v14M8 13l4 4 4-4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 20h14" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  };

  return icons[pillar] ?? null;
}
