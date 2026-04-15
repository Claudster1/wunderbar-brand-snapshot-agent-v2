"use client";

import type { CSSProperties } from "react";
import type { ProductTier } from "@/components/results/tabConfig";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_MD,
  SUITE_SHADOW_CARD,
} from "@/components/results/suiteBrandTokens";

type Props = {
  productTier: ProductTier;
  onOpenActivation: () => void;
};

const BTN: CSSProperties = {
  flexShrink: 0,
  padding: "10px 18px",
  borderRadius: 8,
  border: "none",
  background: SUITE_ACCENT_BRIGHT,
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: SUITE_FONT_UI,
};

/**
 * On Results: routes users to Activation as the home of all execution plans.
 */
export default function ResultsActivationRoutingCallout({ productTier, onOpenActivation }: Props) {
  const isPlus =
    productTier === "snapshot-plus" ||
    productTier === "blueprint" ||
    productTier === "blueprint-plus";

  if (!isPlus) return null;

  return (
    <div
      role="region"
      aria-label="Where to find execution plans"
      style={{
        margin: "0 0 24px",
        padding: "16px 18px",
        borderRadius: SUITE_RADIUS_MD,
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderLeft: `3px solid ${SUITE_ACCENT_BRIGHT}`,
        background: "#FFFFFF",
        boxShadow: SUITE_SHADOW_CARD,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <div style={{ minWidth: 0, flex: "1 1 240px" }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", color: SUITE_ACCENT_BRIGHT }}>
          Execution plans
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 700, color: SUITE_NAVY, lineHeight: 1.35 }}>
          All channel playbooks and schedules live in Activation
        </p>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: SUITE_MUTED, lineHeight: 1.55, maxWidth: 560 }}>
          {productTier === "blueprint-plus"
            ? "Blueprint+ fills Activation with ship-ready copy, sequences, and plans—open it after Strategy when you are ready to run work in-market."
            : productTier === "blueprint"
              ? "Blueprint: Activation holds structured channel plans and schedules to execute Strategy. Blueprint+ adds more paste-ready content in the same places—the main tier gap is execution richness, not Strategy."
              : "Use Activation after Strategy when you are ready to turn the plan into channel-specific plays, owners, and timelines."}
        </p>
      </div>
      <button type="button" onClick={onOpenActivation} style={BTN}>
        Open Activation
      </button>
    </div>
  );
}
