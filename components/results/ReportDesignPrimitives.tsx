"use client";

import type { ReactNode } from "react";

import {
  SUITE_BLUE,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_LG,
  SUITE_RADIUS_MD,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
  SUITE_BG_CARD,
} from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_BLUE;
const SUB = SUITE_MUTED;

export type ReportPanelEdgeAccent = "left" | "none" | "top";

export function ReportPanel({
  children,
  id,
  accentColor,
  tint,
  style,
  /** Default `left` (suite rail). Use `none` or `top` when stacked panels feel too “striped.” */
  edgeAccent = "left",
}: {
  children: ReactNode;
  id?: string;
  accentColor?: string;
  tint?: string;
  style?: React.CSSProperties;
  edgeAccent?: ReportPanelEdgeAccent;
}) {
  const accent = accentColor || BLUE;
  const panelTint = tint || SUITE_BG_CARD;
  const edge: ReportPanelEdgeAccent = edgeAccent;
  const uniformBorder = `1px solid rgba(0, 0, 0, 0.08)`;
  const borderTop =
    edge === "top" ? `3px solid ${accent}` : edge === "none" ? uniformBorder : `1px solid rgba(0, 0, 0, 0.06)`;
  const borderLeft = edge === "left" ? `3px solid ${accent}` : undefined;
  return (
    <section
      id={id}
      style={{
        background: panelTint,
        borderRadius: SUITE_RADIUS_LG,
        border: uniformBorder,
        borderTop,
        ...(borderLeft ? { borderLeft } : {}),
        boxShadow: SUITE_SHADOW_CARD,
        padding: "26px 28px",
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
            fontSize: 24,
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
            fontSize: 16,
            lineHeight: 1.55,
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
        marginTop: 16,
        padding: "18px 22px",
        borderRadius: SUITE_RADIUS_MD,
        background: "linear-gradient(165deg, rgba(7, 176, 242, 0.07) 0%, rgba(255, 255, 255, 0.98) 52%, #FFFFFF 100%)",
        border: `1px solid ${SUITE_BORDER}`,
        borderLeft: `3px solid ${accent}`,
        boxShadow: SUITE_SHADOW_CARD,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 12,
          fontWeight: 600,
          color: accent,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </p>
      <div style={{ margin: 0, color: SUITE_TEXT_PRIMARY, fontSize: 16, lineHeight: 1.55, fontWeight: 400 }}>{children}</div>
    </div>
  );
}
