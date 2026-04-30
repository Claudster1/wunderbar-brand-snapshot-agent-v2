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

type StepChrome = {
  border: string;
  from: string;
  to: string;
  chipBg: string;
  chipText: string;
};

const STEP_CHROME: StepChrome[] = [
  { border: "#1D4ED8", from: "#EFF6FF", to: "#FFFFFF", chipBg: "#DBEAFE", chipText: "#1E40AF" }, // Results
  { border: "#2563EB", from: "#EEF6FF", to: "#FFFFFF", chipBg: "#DBEAFE", chipText: "#1D4ED8" }, // Foundation
  { border: "#0891B2", from: "#ECFEFF", to: "#FFFFFF", chipBg: "#CFFAFE", chipText: "#0E7490" }, // Strategy
  { border: "#7C3AED", from: "#F5F3FF", to: "#FFFFFF", chipBg: "#EDE9FE", chipText: "#6D28D9" }, // Brand standards
  { border: "#059669", from: "#ECFDF5", to: "#FFFFFF", chipBg: "#D1FAE5", chipText: "#047857" }, // Activation
  { border: "#D97706", from: "#FFFBEB", to: "#FFFFFF", chipBg: "#FEF3C7", chipText: "#B45309" }, // Workbook
];

function Step({
  label,
  sub,
  index,
}: {
  label: string;
  sub?: string;
  index: number;
}) {
  const chrome = STEP_CHROME[index % STEP_CHROME.length]!;
  return (
    <div
      className="inline-flex min-h-[58px] min-w-[84px] flex-1 flex-col items-center justify-center rounded-[12px] px-2.5 py-3 text-center shadow-sm sm:min-w-0 sm:px-3 sm:py-3.5"
      style={{
        fontFamily: SUITE_FONT_UI,
        border: `1px solid ${chrome.border}33`,
        borderTop: `3px solid ${chrome.border}`,
        background: `linear-gradient(160deg, ${chrome.from} 0%, ${chrome.to} 100%)`,
        boxShadow: "0 2px 10px rgba(2,24,89,0.08)",
      }}
    >
      <span
        className="mb-1 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.07em] sm:text-[10px]"
        style={{ color: chrome.chipText, background: chrome.chipBg }}
      >
        Step {index + 1}
      </span>
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
  const steps = [
    { label: "Results", sub: "Scores & focus" },
    { label: "Foundation", sub: "Brand bedrock" },
    { label: "Strategy", sub: "Go-to-market plan" },
    ...(showBrandStandards ? [{ label: "Brand Standards", sub: "Before you ship" }] : []),
    { label: "Activation", sub: activationStepSub },
    { label: "Workbook", sub: "Edits" },
  ];

  return (
    <div
      style={{
        marginTop: 0,
        padding: "16px 18px 18px",
        borderRadius: 10,
        border: `1px solid ${SUITE_BORDER}`,
        background: "linear-gradient(180deg, #FBFDFF 0%, #FFFFFF 60%)",
        boxShadow: "0 2px 8px rgba(2, 24, 89, 0.07)",
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
      <div className="mt-4 flex flex-wrap items-stretch justify-center gap-x-2 gap-y-3 sm:flex-nowrap sm:justify-between sm:gap-y-2">
        {steps.map((step, index) => (
          <div key={`${step.label}-${index}`} className="contents">
            <Step label={step.label} sub={step.sub} index={index} />
            {index < steps.length - 1 ? (
              <span
                className={ARROW}
                aria-hidden
                style={{ alignSelf: "center", color: SUITE_ACCENT_BRIGHT, fontWeight: 800 }}
              >
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
