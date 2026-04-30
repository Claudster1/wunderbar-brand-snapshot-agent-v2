"use client";

import type { PillarKey } from "@/src/types/pillars";
import { SUITE_SECTION_KICKER_CLASS } from "@/components/results/suiteBrandTokens";
import { TooltipIcon } from "@/components/ui/Tooltip";
import { PillarScoreBars } from "./PillarScoreBars";

type Props = {
  pillars: Partial<Record<PillarKey, number>>;
};

/** Visual summary for the Results tab — shared-scale pillar bars (no chart library). */
export function ResultsSuiteVisualSummary({ pillars }: Props) {
  return (
    <section
      id="results-visual-summary"
      className="scroll-mt-28 rounded-2xl border border-brand-border/70 bg-white px-5 py-6 shadow-[0_8px_30px_rgba(2,24,89,0.06)] sm:px-7 sm:py-8"
      aria-labelledby="results-visual-summary-heading"
    >
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={`${SUITE_SECTION_KICKER_CLASS} m-0`}>Visual summary</p>
          <h2 id="results-visual-summary-heading" className="bs-h3 mt-1 text-brand-navy">
            Five pillars at a glance
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-muted sm:text-base">
            Each pillar uses the same 0–20 scale so you can compare at a glance before you read the full Brand Pillar
            Analysis below.
          </p>
        </div>
        <TooltipIcon
          side="bottom"
          content={
            <>
              Same scores as Brand Pillar Analysis in a compact layout. Scores are out of 20; the headline WunderBrand Score™
              on the overview uses a weighted blend, so it will not match a simple average of these five numbers.
            </>
          }
        />
      </div>

      <div className="max-w-2xl">
        <div className="min-w-0 rounded-xl border border-brand-border/50 bg-slate-50/60 px-5 py-5 sm:px-6 sm:py-6">
          <PillarScoreBars pillars={pillars} />
        </div>
      </div>
    </section>
  );
}
