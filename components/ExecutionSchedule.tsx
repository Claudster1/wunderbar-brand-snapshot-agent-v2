"use client";

const NAVY = "#021859";
const MID_GRAY = "#5A6B7E";
const BORDER = "#E0E8F0";
const LIGHT = "#F7F9FC";

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
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "Not Started": { bg: "#F1F5F9", color: MID_GRAY },
  "In Progress": { bg: "#FEF3C7", color: "#92400E" },
  Done: { bg: "#F0FDF4", color: "#166534" },
  Skipped: { bg: "#FEF2F2", color: "#991B1B" },
};

export default function ExecutionSchedule({ rows, onExportClick, showHeading = true }: ExecutionScheduleProps) {
  const preview = rows.slice(0, 12);

  return (
    <div style={{ fontFamily: "'Lato', sans-serif", marginTop: showHeading ? 48 : 12 }}>
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
            <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 4px" }}>
              Activation Schedule
            </h3>
          ) : null}
          <p style={{ fontSize: 13, color: MID_GRAY, margin: 0 }}>
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
            color: NAVY,
            border: `2px solid ${BORDER}`,
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Download .xlsx
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: NAVY }}>
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
                    backgroundColor: index % 2 === 0 ? "#ffffff" : LIGHT,
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  <td style={{ padding: "10px 12px", color: MID_GRAY, fontWeight: 600 }}>{row.week}</td>
                  <td style={{ padding: "10px 12px", color: NAVY, fontWeight: 600 }}>{row.channel}</td>
                  <td style={{ padding: "10px 12px", color: "#2D3A4A" }}>{row.contentType}</td>
                  <td style={{ padding: "10px 12px", color: NAVY }}>{row.assetTopic}</td>
                  <td style={{ padding: "10px 12px", color: MID_GRAY, whiteSpace: "nowrap" }}>{row.messagePillar}</td>
                  <td style={{ padding: "10px 12px", color: MID_GRAY, whiteSpace: "nowrap" }}>{row.funnelStage}</td>
                  <td style={{ padding: "10px 12px", color: "#2D3A4A" }}>{row.primaryCta}</td>
                  <td style={{ padding: "10px 12px", color: row.owner ? NAVY : "#CBD5E0" }}>{row.owner || "—"}</td>
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
                  <td style={{ padding: "10px 12px", color: MID_GRAY, whiteSpace: "nowrap" }}>
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
