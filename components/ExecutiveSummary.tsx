"use client";

import { useState } from "react";
import type { ReactNode } from "react";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const MID_GRAY = "#5A6B7E";
const BORDER = "#E0E8F0";
const GREEN = "#16A34A";
const AMBER = "#D97706";
const RED = "#DC2626";

const SCORE_LABELS: Array<{ max: number; label: string; color: string }> = [
  { max: 40, label: "Needs Work", color: RED },
  { max: 60, label: "Developing", color: AMBER },
  { max: 75, label: "Good", color: AMBER },
  { max: 87, label: "Strong", color: GREEN },
  { max: 100, label: "Exceptional", color: GREEN },
];

function scoreLabel(score: number) {
  return SCORE_LABELS.find((s) => score <= s.max) ?? SCORE_LABELS[SCORE_LABELS.length - 1];
}

const SEVERITY_COLORS = {
  low: { label: "Low", color: GREEN, bg: "#F0FDF4" },
  medium: { label: "Medium", color: AMBER, bg: "#FEF3C7" },
  high: { label: "High", color: RED, bg: "#FEF2F2" },
};

export interface ExecutiveSummaryData {
  businessName: string;
  wunderBrandScore: number;
  strongestPillar: { name: string; score: number; max: number };
  opportunityPillar: { name: string; score: number; max: number };
  competitiveVulnerabilitySeverity?: "low" | "medium" | "high";
  marketingSpendEfficiencySeverity?: "low" | "medium" | "high";
  primaryArchetype: string;
  secondaryArchetype?: string;
  brandHealthVerdict: string;
  revenueImpactStatement: string;
  topPriorities: Array<{ rank: number; title: string; pillar: string }>;
  resultsDeliveredAt: string;
  productTier: string;
  lastGeneratedAt?: string;
  needsRegeneration?: boolean;
}

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryData;
}

const COLLAPSE_KEY = "wb_exec_summary_collapsed";

export default function ExecutiveSummary({
  data,
}: ExecutiveSummaryProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem(COLLAPSE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const sc = scoreLabel(data.wunderBrandScore);
  const isFree = data.productTier === "snapshot";

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      sessionStorage.setItem(COLLAPSE_KEY, String(next));
    } catch {
      // Ignore storage errors.
    }
  }

  if (collapsed) {
    return (
      <div
        className="executive-summary-content"
        style={{
          backgroundColor: "#ffffff",
          borderBottom: `1px solid ${BORDER}`,
          padding: "0 28px",
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 24,
          fontFamily: "'Lato', sans-serif",
          flexWrap: "nowrap",
          overflow: "hidden",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, flexShrink: 0 }}>
          {data.businessName}
        </span>
        <span style={{ color: "#CBD5E0", flexShrink: 0 }}>·</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: sc.color, flexShrink: 0 }}>
          {data.wunderBrandScore}/100
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: sc.color, flexShrink: 0 }}>
          {sc.label}
        </span>
        {!isFree && data.primaryArchetype && (
          <>
            <span style={{ color: "#CBD5E0", flexShrink: 0 }}>·</span>
            <span style={{ fontSize: 13, color: MID_GRAY, flexShrink: 0 }}>{data.primaryArchetype}</span>
          </>
        )}
        <span style={{ flex: 1, fontSize: 13, color: MID_GRAY, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.brandHealthVerdict}
        </span>
        <button
          onClick={toggleCollapse}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: BLUE,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Lato', sans-serif",
            flexShrink: 0,
            padding: 0,
          }}
        >
          Expand ↓
        </button>
      </div>
    );
  }

  return (
    <div
      className="executive-summary-content"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: `2px solid ${BORDER}`,
        padding: "28px 32px 24px",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: BLUE }}>
            Executive Summary
          </span>
          {data.needsRegeneration && (
            <span style={{ fontSize: 11, fontWeight: 700, color: AMBER, backgroundColor: "#FEF3C7", padding: "2px 9px", borderRadius: 10 }}>
              Workbook updated - regenerate to reflect changes
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="print-safe" onClick={toggleCollapse} style={{ background: "none", border: "none", fontSize: 12, color: MID_GRAY, cursor: "pointer", fontFamily: "'Lato', sans-serif", padding: "8px 0 8px 8px" }}>
            Collapse ↑
          </button>
        </div>
      </div>

      <div style={{ borderLeft: `3px solid ${BLUE}`, paddingLeft: 16, marginBottom: 24 }}>
        <p style={{ fontSize: 17, fontStyle: "italic", fontWeight: 600, color: NAVY, margin: 0, lineHeight: 1.5 }}>
          {data.brandHealthVerdict}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom:
            data.revenueImpactStatement || data.topPriorities.length > 0 ? 16 : 0,
        }}
      >
        <MetricCard
          label="WunderBrand Score™"
          value={
            <span>
              <span style={{ fontSize: 32, fontWeight: 900, color: sc.color }}>{data.wunderBrandScore}</span>
              <span style={{ fontSize: 14, color: MID_GRAY }}>/100</span>{" "}
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: sc.color }}>
                {sc.label}
              </span>
            </span>
          }
        />
        <MetricCard
          label="Strongest Pillar"
          value={
            <span>
              <span style={{ fontSize: 28, fontWeight: 900, color: GREEN }}>{data.strongestPillar.score}</span>
              <span style={{ fontSize: 13, color: MID_GRAY }}>/ {data.strongestPillar.max}</span>
            </span>
          }
          sub={data.strongestPillar.name}
          subColor={GREEN}
        />
        <MetricCard
          label="Primary Opportunity"
          value={
            <span>
              <span style={{ fontSize: 28, fontWeight: 900, color: AMBER }}>{data.opportunityPillar.score}</span>
              <span style={{ fontSize: 13, color: MID_GRAY }}>/ {data.opportunityPillar.max}</span>
            </span>
          }
          sub={data.opportunityPillar.name}
          subColor={AMBER}
        />
        {!isFree && data.primaryArchetype && (
          <MetricCard
            label="Brand Archetype"
            value={<span style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{data.primaryArchetype}</span>}
            sub={data.secondaryArchetype ? `+ ${data.secondaryArchetype}` : undefined}
            subColor={MID_GRAY}
          />
        )}
      </div>

      {!isFree && (data.revenueImpactStatement || data.topPriorities.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {data.revenueImpactStatement && (
            <div style={{ padding: "16px 18px", backgroundColor: NAVY, borderRadius: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BLUE, display: "block", marginBottom: 8 }}>
                Revenue Impact
              </span>
              <p style={{ fontSize: 14, color: "#ffffff", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                {data.revenueImpactStatement}
              </p>
            </div>
          )}
          {data.topPriorities.length > 0 && (
            <div style={{ padding: "16px 18px", border: `1px solid ${BORDER}`, borderRadius: 8, backgroundColor: "#FAFBFC" }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: MID_GRAY, display: "block", marginBottom: 12 }}>
                Top 3 Priorities
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.topPriorities.slice(0, 3).map((p) => (
                  <div key={p.rank} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: NAVY, color: "#ffffff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {p.rank}
                    </span>
                    <span style={{ fontSize: 13, color: NAVY, fontWeight: 600, flex: 1 }}>{p.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: BLUE, backgroundColor: "#E8F6FE", padding: "1px 7px", borderRadius: 10, flexShrink: 0 }}>
                      {p.pillar}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isFree && (data.competitiveVulnerabilitySeverity || data.marketingSpendEfficiencySeverity) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {data.competitiveVulnerabilitySeverity && (
            <SeverityChip labelPrefix="Competitive Vulnerability" severity={data.competitiveVulnerabilitySeverity} />
          )}
          {data.marketingSpendEfficiencySeverity && (
            <SeverityChip labelPrefix="Marketing Spend Efficiency" severity={data.marketingSpendEfficiencySeverity} />
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div style={{ padding: "14px 16px", border: `1px solid ${BORDER}`, borderRadius: 8, backgroundColor: "#FAFBFC" }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: MID_GRAY, display: "block", marginBottom: 8 }}>
        {label}
      </span>
      <div style={{ marginBottom: sub ? 4 : 0 }}>{value}</div>
      {sub && <span style={{ fontSize: 12, fontWeight: 700, color: subColor ?? MID_GRAY }}>{sub}</span>}
    </div>
  );
}

function SeverityChip({
  labelPrefix,
  severity,
}: {
  labelPrefix: string;
  severity: "low" | "medium" | "high";
}) {
  const s = SEVERITY_COLORS[severity];
  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, backgroundColor: s.bg, color: s.color }}>
      {labelPrefix} · {s.label}
    </span>
  );
}

