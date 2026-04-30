"use client";

import { SUITE_ACCENT_BRIGHT, SUITE_FONT_UI, SUITE_MUTED, SUITE_NAVY } from "@/components/results/suiteBrandTokens";

const CARD =
  "flex min-w-[126px] flex-1 flex-col rounded-xl border px-3 py-3.5 shadow-sm sm:min-w-[146px]";

const CARD_CHROME = [
  {
    border: "border-blue-200",
    bg: "bg-gradient-to-br from-blue-50 to-white",
    chip: "bg-blue-100 text-blue-800",
    icon: "M",
  },
  {
    border: "border-cyan-200",
    bg: "bg-gradient-to-br from-cyan-50 to-white",
    chip: "bg-cyan-100 text-cyan-800",
    icon: "S",
  },
  {
    border: "border-emerald-200",
    bg: "bg-gradient-to-br from-emerald-50 to-white",
    chip: "bg-emerald-100 text-emerald-800",
    icon: "C",
  },
] as const;

function FlowCard({
  title,
  label,
  copy,
  index,
}: {
  title: string;
  label: string;
  copy: string;
  index: number;
}) {
  const c = CARD_CHROME[index % CARD_CHROME.length]!;
  return (
    <div className={`${CARD} ${c.border} ${c.bg}`}>
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${c.chip}`}
          aria-hidden
        >
          {c.icon}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-blue">{label}</span>
      </div>
      <span className="text-sm font-semibold leading-snug" style={{ color: SUITE_NAVY }}>
        {title}
      </span>
      <span className="mt-1.5 text-[12px] leading-relaxed sm:text-[13px]" style={{ color: SUITE_MUTED }}>
        {copy}
      </span>
    </div>
  );
}

/**
 * Plain-language handoff diagram for Sales & Marketing alignment (complements tables below).
 */
export default function SalesMarketingFlowVisual() {
  return (
    <div
      className="mb-5 rounded-xl border border-slate-900/[0.07] bg-gradient-to-b from-slate-50 to-white px-3 py-4 sm:px-4"
      style={{ fontFamily: SUITE_FONT_UI }}
    >
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-blue sm:text-xs">One story, two teams</p>
      <p className="mt-1.5 max-w-3xl text-[12px] leading-relaxed sm:text-sm" style={{ color: SUITE_MUTED }}>
        Marketing brings attention and trust. Sales turns interest into a clear next step. The sections below spell out how
        that should sound in practice.
      </p>
      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center">
        <FlowCard
          index={0}
          label="Marketing"
          title="Message & proof in the wild"
          copy="Website, ads, and content all reinforce the same promise."
        />
        <div
          className="flex items-center justify-center px-1 text-lg font-semibold sm:flex-col sm:py-6"
          style={{ color: SUITE_ACCENT_BRIGHT }}
          aria-hidden
        >
          <span className="sm:hidden">↓</span>
          <span className="hidden sm:inline">→</span>
        </div>
        <FlowCard
          index={1}
          label="Shared"
          title="Same language & proof"
          copy="Discovery questions and proof stay aligned with what marketing promised."
        />
        <div
          className="flex items-center justify-center px-1 text-lg font-semibold sm:flex-col sm:py-6"
          style={{ color: SUITE_ACCENT_BRIGHT }}
          aria-hidden
        >
          <span className="sm:hidden">↓</span>
          <span className="hidden sm:inline">→</span>
        </div>
        <FlowCard
          index={2}
          label="Sales"
          title="Conversation & close"
          copy="Talk tracks, objections, and next-step asks move buyers toward commitment."
        />
      </div>
    </div>
  );
}
