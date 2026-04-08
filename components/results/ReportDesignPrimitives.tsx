"use client";

import type { ReactNode } from "react";

import {
  SUITE_BLUE,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_LG,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
  SUITE_BG_CARD,
} from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_BLUE;
const SUB = SUITE_MUTED;

export function ReportPanel({
  children,
  id,
  accentColor,
  tint,
  style,
}: {
  children: ReactNode;
  id?: string;
  accentColor?: string;
  tint?: string;
  style?: React.CSSProperties;
}) {
  const accent = accentColor || BLUE;
  const panelTint = tint || SUITE_BG_CARD;
  return (
    <section
      id={id}
      style={{
        background: panelTint,
        borderRadius: SUITE_RADIUS_LG,
        border: `1px solid rgba(0, 0, 0, 0.08)`,
        borderTop: `1px solid rgba(0, 0, 0, 0.06)`,
        borderLeft: `3px solid ${accent}`,
        boxShadow: SUITE_SHADOW_CARD,
        padding: "22px 24px",
        scrollMarginTop: 108,
        fontFamily: SUITE_FONT_UI,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function ReportPanelTitle({
  icon,
  title,
  subtitle,
  accentColor,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: string;
}) {
  const accent = accentColor || BLUE;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: accent,
              opacity: 0.92,
            }}
          >
            {icon}
          </span>
        ) : null}
        <h3
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.2,
            color: NAVY,
            fontFamily: SUITE_FONT_UI,
          }}
        >
          {title}
        </h3>
      </div>
      {subtitle ? (
        <p
          style={{
            margin: "8px 0 0",
            color: SUB,
            fontSize: 15,
            lineHeight: 1.5,
            fontWeight: 400,
            maxWidth: 720,
            fontFamily: SUITE_FONT_UI,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function ReportCallout({ label, children, accentColor }: { label: string; children: ReactNode; accentColor?: string }) {
  const accent = accentColor || BLUE;
  return (
    <div
      style={{
        marginTop: 14,
        padding: "16px 18px",
        borderRadius: SUITE_RADIUS_LG - 2,
        background: "rgba(0, 0, 0, 0.03)",
        border: `1px solid rgba(0, 0, 0, 0.06)`,
        borderLeft: `3px solid ${accent}`,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 11,
          fontWeight: 600,
          color: accent,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      <div style={{ margin: 0, color: SUITE_TEXT_PRIMARY, fontSize: 15, lineHeight: 1.55, fontWeight: 400 }}>{children}</div>
    </div>
  );
}
