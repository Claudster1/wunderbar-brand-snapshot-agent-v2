"use client";

import { SUITE_ACCENT_BRIGHT, SUITE_FONT_UI, SUITE_MUTED, SUITE_NAVY } from "@/components/results/suiteBrandTokens";

const CARD =
  "flex min-w-[120px] flex-1 flex-col rounded-lg border border-slate-900/[0.08] bg-white px-3 py-3 shadow-sm sm:min-w-[140px]";

/**
 * Plain-language handoff diagram for Sales & Marketing alignment (complements tables below).
 */
export default function SalesMarketingFlowVisual() {
  return (
    <div
      className="mb-5 rounded-xl border border-slate-900/[0.06] bg-[#FAFAFC] px-3 py-4 sm:px-4"
      style={{ fontFamily: SUITE_FONT_UI }}
    >
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-blue sm:text-xs">One story, two teams</p>
      <p className="mt-1.5 max-w-3xl text-[12px] leading-relaxed sm:text-sm" style={{ color: SUITE_MUTED }}>
        Marketing brings attention and trust. Sales turns interest into a clear next step. The sections below spell out how
        that should sound in practice.
      </p>
      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center">
        <div className={CARD}>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-blue">Marketing</span>
          <span className="mt-1 text-sm font-semibold leading-snug" style={{ color: SUITE_NAVY }}>
            Message & proof in the wild
          </span>
          <span className="mt-1 text-[12px] leading-relaxed sm:text-[13px]" style={{ color: SUITE_MUTED }}>
            Website, ads, content—same promise everywhere.
          </span>
        </div>
        <div
          className="flex items-center justify-center px-1 text-lg font-semibold sm:flex-col sm:py-6"
          style={{ color: SUITE_ACCENT_BRIGHT }}
          aria-hidden
        >
          <span className="sm:hidden">↓</span>
          <span className="hidden sm:inline">→</span>
        </div>
        <div className={CARD}>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-blue">Shared</span>
          <span className="mt-1 text-sm font-semibold leading-snug" style={{ color: SUITE_NAVY }}>
            Same language & proof
          </span>
          <span className="mt-1 text-[12px] leading-relaxed sm:text-[13px]" style={{ color: SUITE_MUTED }}>
            Discovery questions and proof line up with what marketing promised.
          </span>
        </div>
        <div
          className="flex items-center justify-center px-1 text-lg font-semibold sm:flex-col sm:py-6"
          style={{ color: SUITE_ACCENT_BRIGHT }}
          aria-hidden
        >
          <span className="sm:hidden">↓</span>
          <span className="hidden sm:inline">→</span>
        </div>
        <div className={CARD}>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-blue">Sales</span>
          <span className="mt-1 text-sm font-semibold leading-snug" style={{ color: SUITE_NAVY }}>
            Conversation & close
          </span>
          <span className="mt-1 text-[12px] leading-relaxed sm:text-[13px]" style={{ color: SUITE_MUTED }}>
            Talk tracks, objections, and how you ask for the next meeting or sale.
          </span>
        </div>
      </div>
    </div>
  );
}
