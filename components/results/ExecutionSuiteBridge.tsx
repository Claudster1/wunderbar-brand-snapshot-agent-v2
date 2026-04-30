"use client";

import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_MD,
  SUITE_SHADOW_CARD,
} from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID = SUITE_MUTED;
const BORDER = SUITE_BORDER;

export type ExecutionSuiteBridgeMode = "activation" | "workbook" | "downloads";

type Props = {
  mode: ExecutionSuiteBridgeMode;
  /** Short label, e.g. company name — reinforces “one report”. */
  reportLabel: string;
  onSelectPlans: () => void;
  onSelectWorkbook: () => void;
  onSelectDownloads: () => void;
};

function Segment({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      style={{
        flex: "1 1 160px",
        textAlign: "left",
        padding: "12px 14px",
        borderRadius: 10,
        border: `1px solid ${active ? BLUE : BORDER}`,
        background: active ? "linear-gradient(135deg, #E8F6FE 0%, #FFFFFF 100%)" : "#FFFFFF",
        cursor: "pointer",
        fontFamily: SUITE_FONT_UI,
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: active ? "0 1px 4px rgba(7, 176, 242, 0.12)" : "none",
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 800,
          color: NAVY,
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </span>
      <span style={{ display: "block", marginTop: 4, fontSize: 11, color: MID, lineHeight: 1.45 }}>{description}</span>
    </button>
  );
}

/**
 * Keeps Activation, Workbook, and Downloads feeling like one execution flow
 * (activation → workbook → exports) instead of disconnected destinations.
 */
export default function ExecutionSuiteBridge({
  mode,
  reportLabel,
  onSelectPlans,
  onSelectWorkbook,
  onSelectDownloads,
}: Props) {
  return (
    <div
      role="region"
      aria-label="Execution flow"
      style={{
        marginTop: 14,
        marginBottom: 4,
        padding: "14px 16px 16px",
        borderRadius: SUITE_RADIUS_MD,
        border: `1px solid ${BORDER}`,
        background: "#FAFBFD",
        boxShadow: SUITE_SHADOW_CARD,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: "0.06em" }}>
        EXECUTION FLOW
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: NAVY, fontWeight: 700, lineHeight: 1.4 }}>
        One report for <span style={{ color: BLUE }}>{reportLabel}</span> — move between activation, editable source,
        and exports without losing context.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Segment
          label="Activation"
          description="Channel playbooks, schedules, paste-ready copy."
          active={mode === "activation"}
          onClick={onSelectPlans}
        />
        <Segment
          label="Workbook"
          description="Inputs, versions, prompts — what regenerates into plans."
          active={mode === "workbook"}
          onClick={onSelectWorkbook}
        />
        <Segment
          label="Exports"
          description="PDFs, packs, spreadsheets from this report."
          active={mode === "downloads"}
          onClick={onSelectDownloads}
        />
      </div>
    </div>
  );
}
