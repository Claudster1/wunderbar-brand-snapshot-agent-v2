"use client";

import type { ReactNode } from "react";

import { SUITE_BLUE, SUITE_BORDER, SUITE_MUTED, SUITE_NAVY } from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_BLUE;
const SUB = SUITE_MUTED;
const BORDER = SUITE_BORDER;

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
  const panelTint = tint || "#FFFFFF";
  return (
    <section
      id={id}
      style={{
        background: `linear-gradient(135deg, ${panelTint} 0%, #FFFFFF 100%)`,
        borderRadius: 5,
        border: `1px solid ${BORDER}`,
        borderTop: `2px solid ${accent}30`,
        borderLeft: `3px solid ${accent}`,
        boxShadow: "0 8px 24px rgba(2, 24, 89, 0.08)",
        padding: "18px 20px",
        scrollMarginTop: 124,
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
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon ? (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: accent }}>
            {icon}
          </span>
        ) : null}
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: NAVY }}>{title}</h3>
      </div>
      {subtitle ? <p style={{ margin: "6px 0 0", color: SUB, fontSize: 14, lineHeight: 1.5 }}>{subtitle}</p> : null}
    </div>
  );
}

export function ReportCallout({ label, children, accentColor }: { label: string; children: ReactNode; accentColor?: string }) {
  const accent = accentColor || BLUE;
  return (
    <div
      style={{
        marginTop: 12,
        padding: "14px 16px",
        borderRadius: 5,
        background: `${accent}12`,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 12,
          fontWeight: 800,
          color: accent,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </p>
      <div style={{ margin: 0, color: "#1A1A2E", fontSize: 14, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

