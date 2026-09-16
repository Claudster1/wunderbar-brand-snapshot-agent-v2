"use client";

import type { CSSProperties } from "react";
import type { BlueprintPlusViewMode } from "@/lib/results/blueprintPlusGuidedMode";
import {
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_BUTTON,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

type Props = {
  mode: BlueprintPlusViewMode;
  onChange: (mode: BlueprintPlusViewMode) => void;
};

const WRAP: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: 3,
  borderRadius: 999,
  border: `1px solid ${SUITE_BORDER}`,
  background: "#FFFFFF",
  fontFamily: SUITE_FONT_UI,
};

function pillStyle(active: boolean): CSSProperties {
  return {
    border: "none",
    borderRadius: SUITE_RADIUS_BUTTON,
    padding: "7px 12px",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.02em",
    cursor: "pointer",
    fontFamily: SUITE_FONT_UI,
    background: active ? SUITE_NAVY : "transparent",
    color: active ? "#FFFFFF" : SUITE_MUTED,
  };
}

/**
 * Blueprint+ only — Guided (action path) vs Reference (full library).
 */
export default function BlueprintPlusViewModeToggle({ mode, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Blueprint+ view mode"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: SUITE_TEXT_PRIMARY }}>
        View
      </span>
      <div style={WRAP}>
        <button
          type="button"
          aria-pressed={mode === "guided"}
          onClick={() => onChange("guided")}
          style={pillStyle(mode === "guided")}
        >
          Guided
        </button>
        <button
          type="button"
          aria-pressed={mode === "reference"}
          onClick={() => onChange("reference")}
          style={pillStyle(mode === "reference")}
        >
          Reference
        </button>
      </div>
      <span style={{ fontSize: 13, color: SUITE_MUTED, lineHeight: 1.4, maxWidth: 480 }}>
        {mode === "guided"
          ? "Week-one path first. Full library stays one click away."
          : "Full Strategy, Activation, and Downloads library."}
      </span>
    </div>
  );
}
