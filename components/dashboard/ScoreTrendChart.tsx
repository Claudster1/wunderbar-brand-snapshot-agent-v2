// components/dashboard/ScoreTrendChart.tsx
"use client";

import { useEffect, useState } from "react";
import { getPersistedEmail } from "@/lib/persistEmail";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";

const PILLAR_COLORS: Record<string, string> = {
  positioning: "#07B0F2",
  messaging: "#6366F1",
  visibility: "#10B981",
  credibility: "#F59E0B",
  conversion: "#EF4444",
};

const PILLAR_LABELS: Record<string, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

type HistoryPoint = {
  reportId: string;
  brandAlignmentScore: number | null;
  pillarScores: Record<string, number> | null;
  brandName: string | null;
  createdAt: string;
};

function scoreColor(score: number) {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#4ADE80";
  if (score >= 40) return "#EAB308";
  if (score >= 20) return "#F97316";
  return "#EF4444";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DeltaArrow({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (diff === 0) return <span style={{ color: SUB, fontSize: 12 }}>—</span>;
  const isUp = diff > 0;
  return (
    <span style={{ color: isUp ? "#22C55E" : "#EF4444", fontSize: 12, fontWeight: 700 }}>
      {isUp ? "▲" : "▼"} {Math.abs(diff)}
    </span>
  );
}

export default function ScoreTrendChart() {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const email = getPersistedEmail();

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    fetch(`/api/score-history?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [email]);

  // Need at least 2 data points for a trend
  if (loading || history.length < 2) return null;

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];

  // Calculate chart dimensions
  const chartWidth = 100; // percentage
  const chartHeight = 160;
  const padding = { top: 10, right: 10, bottom: 30, left: 35 };
  const innerWidth = chartWidth;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // SVG viewBox-based chart
  const svgWidth = 600;
  const svgHeight = 200;
  const svgPadding = { top: 20, right: 20, bottom: 40, left: 45 };
  const svgInnerWidth = svgWidth - svgPadding.left - svgPadding.right;
  const svgInnerHeight = svgHeight - svgPadding.top - svgPadding.bottom;

  const scores = history.map((h) => h.brandAlignmentScore ?? 0);
  const maxScore = Math.max(100, ...scores);
  const minScore = Math.min(0, ...scores);

  const xScale = (i: number) =>
    svgPadding.left + (i / (history.length - 1)) * svgInnerWidth;
  const yScale = (score: number) =>
    svgPadding.top + svgInnerHeight - ((score - minScore) / (maxScore - minScore)) * svgInnerHeight;

  // Build SVG path for brand alignment score
  const linePath = history
    .map((h, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(h.brandAlignmentScore ?? 0)}`)
    .join(" ");

  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "24px",
        background: WHITE,
        marginBottom: 24,
        fontFamily: "'Lato', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: "0 0 4px" }}>
            Brand Score Trend
          </h3>
          <p style={{ fontSize: 13, color: SUB, margin: 0 }}>
            {history.length} assessments since {formatDate(history[0].createdAt)}
          </p>
        </div>
        {latest.brandAlignmentScore != null && previous.brandAlignmentScore != null && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: scoreColor(latest.brandAlignmentScore) }}>
              {latest.brandAlignmentScore}
            </div>
            <DeltaArrow current={latest.brandAlignmentScore} previous={previous.brandAlignmentScore} />
            <span style={{ fontSize: 11, color: SUB, marginLeft: 4 }}>vs previous</span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div style={{ width: "100%", marginBottom: 20 }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: "100%", height: "auto" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={tick}>
              <line
                x1={svgPadding.left}
                y1={yScale(tick)}
                x2={svgWidth - svgPadding.right}
                y2={yScale(tick)}
                stroke={BORDER}
                strokeWidth={0.5}
                strokeDasharray={tick === 0 ? "none" : "4,4"}
              />
              <text
                x={svgPadding.left - 8}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize={11}
                fill={SUB}
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Score line */}
          <path d={linePath} fill="none" stroke={BLUE} strokeWidth={2.5} strokeLinejoin="round" />

          {/* Data points */}
          {history.map((h, i) => (
            <g key={h.reportId}>
              <circle
                cx={xScale(i)}
                cy={yScale(h.brandAlignmentScore ?? 0)}
                r={4}
                fill={WHITE}
                stroke={BLUE}
                strokeWidth={2}
              />
              {/* Date label on x-axis */}
              <text
                x={xScale(i)}
                y={svgHeight - 8}
                textAnchor="middle"
                fontSize={10}
                fill={SUB}
              >
                {new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Pillar Comparison Table */}
      {latest.pillarScores && previous.pillarScores && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: SUB,
              marginBottom: 10,
            }}
          >
            Pillar Breakdown — Latest vs Previous
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, auto)", gap: "8px 16px", alignItems: "center" }}>
            {/* Header */}
            <div style={{ fontSize: 11, fontWeight: 700, color: SUB }}>Pillar</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textAlign: "right" }}>Previous</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textAlign: "right" }}>Current</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textAlign: "right" }}>Change</div>

            {Object.keys(PILLAR_LABELS).map((pillar) => {
              const curr = latest.pillarScores?.[pillar] ?? 0;
              const prev = previous.pillarScores?.[pillar] ?? 0;
              return (
                <div key={pillar} style={{ display: "contents" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: PILLAR_COLORS[pillar],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>
                      {PILLAR_LABELS[pillar]}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: SUB, textAlign: "right" }}>{prev}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, textAlign: "right" }}>{curr}</div>
                  <div style={{ textAlign: "right" }}>
                    <DeltaArrow current={curr} previous={prev} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
