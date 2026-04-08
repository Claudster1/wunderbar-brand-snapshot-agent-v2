"use client";

import { useEffect, useMemo, useState } from "react";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const BORDER = "#D6DFE8";
const BG = "#F8FBFF";

interface ExecutiveSummaryLandingPanelProps {
  diagnosticData: Record<string, unknown>;
  onContinueToFoundation: () => void;
  storageKey?: string;
}

function getScoreColor(score: number): string {
  if (score >= 85) return "#0EA472";
  if (score >= 70) return "#0D5BD7";
  if (score >= 55) return "#F59E0B";
  return "#E11D48";
}

export default function ExecutiveSummaryLandingPanel({
  diagnosticData,
  onContinueToFoundation,
  storageKey = "results-summary-panel",
}: ExecutiveSummaryLandingPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const persistedKey = `wunderbrand:${storageKey}`;
  const score =
    typeof diagnosticData.wunderBrandScore === "number" ? diagnosticData.wunderBrandScore : 0;
  const scoreColor = useMemo(() => getScoreColor(score), [score]);
  const topOpportunity =
    typeof diagnosticData.topOpportunity === "string" && diagnosticData.topOpportunity.trim()
      ? diagnosticData.topOpportunity
      : "Strengthen your lowest-scoring pillar with one focused 30-day activation plan.";
  const primaryPillar =
    typeof diagnosticData.primaryPillar === "string" && diagnosticData.primaryPillar.trim()
      ? diagnosticData.primaryPillar
      : "Positioning";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(persistedKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { collapsed?: boolean; dismissed?: boolean };
      setCollapsed(Boolean(parsed.collapsed));
      setDismissed(Boolean(parsed.dismissed));
    } catch {
      // Ignore malformed local storage values.
    }
  }, [persistedKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        persistedKey,
        JSON.stringify({
          collapsed,
          dismissed,
        }),
      );
    } catch {
      // Ignore storage failures.
    }
  }, [collapsed, dismissed, persistedKey]);

  if (dismissed) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <button
          type="button"
          onClick={() => setDismissed(false)}
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 999,
            backgroundColor: "#FFFFFF",
            color: NAVY,
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Show Executive Summary
        </button>
      </div>
    );
  }

  return (
    <section
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        backgroundColor: BG,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "8px 10px 8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          style={{
            border: "none",
            background: "transparent",
            padding: "4px 0",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Executive Summary</span>
          <span style={{ fontSize: 12, color: "#5A6B7E" }}>{collapsed ? "Show" : "Hide"}</span>
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            fontSize: 12,
            color: "#5A6B7E",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Dismiss
        </button>
      </div>
      {!collapsed && (
        <div
          style={{
            padding: "0 14px 12px",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#5A6B7E", fontWeight: 700 }}>WunderBrand Score</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: scoreColor }}>{score}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#24364D", lineHeight: 1.5 }}>
            <strong>Primary focus:</strong> {primaryPillar}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#24364D", lineHeight: 1.5 }}>
            <strong>Top opportunity:</strong> {topOpportunity}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onContinueToFoundation}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = NAVY;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = BLUE;
              }}
              style={{
                border: "none",
                borderRadius: 8,
                backgroundColor: BLUE,
                color: "#FFFFFF",
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Continue to Foundation
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                backgroundColor: "#FFFFFF",
                color: NAVY,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Print current view
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
