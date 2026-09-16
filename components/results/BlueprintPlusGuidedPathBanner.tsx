"use client";

import type { CSSProperties } from "react";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_BUTTON,
  SUITE_RADIUS_MD,
} from "@/components/results/suiteBrandTokens";

type Props = {
  /** e.g. "5 strategy panels" */
  showingLabel: string;
  onBrowseFullLibrary: () => void;
};

const WRAP: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  margin: "0 0 16px",
  padding: "12px 14px",
  borderRadius: SUITE_RADIUS_MD,
  border: `1px solid ${SUITE_BORDER}`,
  background: "#FFFFFF",
  fontFamily: SUITE_FONT_UI,
};

/**
 * Reminds Blueprint+ Guided users that Reference still has the full library.
 */
export default function BlueprintPlusGuidedPathBanner({ showingLabel, onBrowseFullLibrary }: Props) {
  return (
    <div style={WRAP} role="status">
      <p style={{ margin: 0, fontSize: 13, color: SUITE_MUTED, lineHeight: 1.45 }}>
        <span style={{ fontWeight: 800, color: SUITE_NAVY }}>Guided path</span>
        {" · "}
        Showing {showingLabel}. Everything else stays in Reference.
      </p>
      <button
        type="button"
        onClick={onBrowseFullLibrary}
        style={{
          border: `1px solid ${SUITE_BORDER}`,
          borderRadius: SUITE_RADIUS_BUTTON,
          padding: "7px 12px",
          background: "#FFFFFF",
          color: SUITE_ACCENT_BRIGHT,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: SUITE_FONT_UI,
        }}
      >
        Browse full library
      </button>
    </div>
  );
}
