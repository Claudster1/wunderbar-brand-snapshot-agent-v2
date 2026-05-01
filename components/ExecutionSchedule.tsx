"use client";

import { ActivationChannelMixChart } from "@/components/results/charts/ActivationChannelMixChart";
import {
  SUITE_BG_CARD,
  SUITE_BG_PAGE,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";

export interface ScheduleRow {
  week: number;
  channel: string;
  contentType: string;
  assetTopic: string;
  messagePillar: string;
  funnelStage: string;
  primaryCta: string;
  owner: string;
  status: "Not Started" | "In Progress" | "Done" | "Skipped";
  dueDate?: string;
}

interface ExecutionScheduleProps {
  rows: ScheduleRow[];
  onExportClick: () => void;
  /** When false, omit the built-in “Activation Schedule” title — parent supplies the section heading. */
  showHeading?: boolean;
  /** When true (default), show row-count mix by channel (pie) above the table. */
  showChannelMix?: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "Not Started": { bg: "#F1F5F9", color: SUITE_MUTED },
  "In Progress": { bg: "#FEF3C7", color: "#92400E" },
  Done: { bg: "#F0FDF4", color: "#166534" },
  Skipped: { bg: "#FEF2F2", color: "#991B1B" },
};

export default function ExecutionSchedule({
  rows,
  onExportClick,
  showHeading = true,
  showChannelMix = true,
}: ExecutionScheduleProps) {
  const preview = rows.slice(0, 12);

  return (
    <div style={{ fontFamily: SUITE_FONT_UI, marginTop: showHeading ? 48 : 12 }}>
      {showChannelMix && rows.length > 0 ? <ActivationChannelMixChart rows={rows} /> : null}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          {showHeading ? (
            <h3 style={{ fontSize: 18, fontWeight: 700, color: SUITE_NAVY, margin: "0 0 4px" }}>
              Activation Schedule
            </h3>
          ) : null}
          <p style={{ fontSize: 13, color: SUITE_MUTED, margin: 0 }}>
            {showHeading
              ? "First 12 rows shown here. Full schedule is available in Downloads."
              : "First 12 rows below."}
          </p>
        </div>
        <button
          onClick={onExportClick}
          style={{
            padding: "9px 18px",
            backgroundColor: "transparent",
            color: SUITE_NAVY,
            border: `2px solid ${SUITE_BORDER}`,
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: SUITE_FONT_UI,
          }}
        >
          Download .xlsx
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: SUITE_NAVY }}>
              {["Wk", "Channel", "Content Type", "Asset / Topic", "Pillar", "Funnel", "CTA", "Owner", "Status", "Due"].map(
                (label) => (
                  <th
                    key={label}
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, index) => {
              const style = STATUS_COLORS[row.status] ?? STATUS_COLORS["Not Started"];
              return (
                <tr
                  key={`${row.week}-${row.channel}-${index}`}
                  style={{
                    backgroundColor: index % 2 === 0 ? SUITE_BG_CARD : SUITE_BG_PAGE,
                    borderBottom: `1px solid ${SUITE_BORDER}`,
                  }}
                >
                  <td style={{ padding: "10px 12px", color: SUITE_MUTED, fontWeight: 600 }}>{row.week}</td>
                  <td style={{ padding: "10px 12px", color: SUITE_NAVY, fontWeight: 600 }}>{row.channel}</td>
                  <td style={{ padding: "10px 12px", color: "#2D3A4A" }}>{row.contentType}</td>
                  <td style={{ padding: "10px 12px", color: SUITE_NAVY }}>{row.assetTopic}</td>
                  <td style={{ padding: "10px 12px", color: SUITE_MUTED, whiteSpace: "nowrap" }}>{row.messagePillar}</td>
                  <td style={{ padding: "10px 12px", color: SUITE_MUTED, whiteSpace: "nowrap" }}>{row.funnelStage}</td>
                  <td style={{ padding: "10px 12px", color: "#2D3A4A" }}>{row.primaryCta}</td>
                  <td style={{ padding: "10px 12px", color: row.owner ? SUITE_NAVY : "#CBD5E0" }}>{row.owner || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: style.bg,
                        color: style.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color: SUITE_MUTED, whiteSpace: "nowrap" }}>
                    {row.dueDate ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
