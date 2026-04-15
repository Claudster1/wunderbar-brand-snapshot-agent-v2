"use client";

import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";

type Props = {
  /** Blueprint tiers include Brand Standards between Strategy and Activation. */
  showBrandStandards: boolean;
  /** Subtitle under the Activation step (e.g. Blueprint+ emphasizes ship-ready content). */
  activationStepSub?: string;
  /** Optional second line under the path caption (e.g. Blueprint+ full deliverable). */
  pathSupplement?: string | null;
};

const ARROW = "hidden shrink-0 sm:block sm:px-0.5" as const;

function Step({ label, sub }: { label: string; sub?: string }) {
  return (
    <div
      className="inline-flex min-h-[52px] min-w-[76px] flex-1 flex-col items-center justify-center rounded-[10px] px-2.5 py-2.5 text-center shadow-sm sm:min-w-0 sm:px-3 sm:py-3"
      style={{
        fontFamily: SUITE_FONT_UI,
        border: `1px solid rgba(2, 24, 89, 0.08)`,
        borderTop: `3px solid ${SUITE_ACCENT_BRIGHT}`,
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)",
      }}
    >
      <span className="block text-[11px] font-bold leading-snug sm:text-xs" style={{ color: SUITE_NAVY }}>
        {label}
      </span>
      {sub ? (
        <span
          className="mt-1.5 block max-w-[9.5rem] text-[10px] font-normal leading-snug sm:max-w-[11rem] sm:text-[11px]"
          style={{ color: SUITE_MUTED }}
        >
          {sub}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Linear “where Strategy sits”: Foundation = brand bedrock, Strategy = plan, Activation = execute the plan.
 */
export default function StrategyPathwayVisual({
  showBrandStandards,
  activationStepSub = "Run the plan",
  pathSupplement = null,
}: Props) {
  return (
    <div
      style={{
        marginTop: 0,
        padding: "14px 16px 16px",
        borderRadius: 10,
        border: `1px solid ${SUITE_BORDER}`,
        background: "#FFFFFF",
        boxShadow: "0 1px 5px rgba(2, 24, 89, 0.05)",
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <p
        style={{
          margin: 0,
          paddingBottom: 12,
          marginBottom: 2,
          borderBottom: "1px solid rgba(7, 176, 242, 0.14)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.06em",
          color: SUITE_NAVY,
        }}
      >
        Your path in this product
      </p>
      <p className="mt-3 max-w-3xl text-[12px] leading-relaxed sm:text-sm" style={{ color: SUITE_MUTED }}>
        Read left to right. Foundation is the brand foundation; Strategy is the plan for who to target and how; Activation runs that plan in-market.
      </p>
      {pathSupplement ? (
        <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-brand-muted sm:text-sm" style={{ color: SUITE_MUTED }}>
          {pathSupplement}
        </p>
      ) : null}
      <div
        className="mt-4 flex flex-wrap items-stretch justify-center gap-x-2 gap-y-3 sm:flex-nowrap sm:justify-between sm:gap-y-2"
        style={{ color: SUITE_NAVY }}
      >
        <Step label="Results" sub="Scores & focus" />
        <span className={ARROW} aria-hidden style={{ alignSelf: "center", color: SUITE_ACCENT_BRIGHT }}>
          →
        </span>
        <Step label="Foundation" sub="Brand bedrock" />
        <span className={ARROW} aria-hidden style={{ alignSelf: "center", color: SUITE_ACCENT_BRIGHT }}>
          →
        </span>
        <Step label="Strategy" sub="Go-to-market plan" />
        {showBrandStandards ? (
          <>
            <span className={ARROW} aria-hidden style={{ alignSelf: "center", color: SUITE_ACCENT_BRIGHT }}>
              →
            </span>
            <Step label="Brand Standards" sub="Before you ship" />
          </>
        ) : null}
        <span className={ARROW} aria-hidden style={{ alignSelf: "center", color: SUITE_ACCENT_BRIGHT }}>
          →
        </span>
        <Step label="Activation" sub={activationStepSub} />
        <span className={ARROW} aria-hidden style={{ alignSelf: "center", color: SUITE_ACCENT_BRIGHT }}>
          →
        </span>
        <Step label="Workbook" sub="Edits" />
      </div>
    </div>
  );
}
