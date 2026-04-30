import { SUITE_SECTION_KICKER_CLASS } from "@/components/results/suiteBrandTokens";

/** Shown when a report has no context-coverage payload so the Results tab keeps a stable anchor and explanation. */
export function ContextCoveragePlaceholder() {
  return (
    <section
      className="bs-card rounded-xl border border-brand-border/80 p-6 sm:p-7 shadow-sm"
      aria-labelledby="context-coverage-placeholder-heading"
    >
      <p className={`${SUITE_SECTION_KICKER_CLASS} m-0 mb-4`}>Context Signal</p>
      <h3 id="context-coverage-placeholder-heading" className="bs-h4 text-brand-navy m-0 mb-2">
        Coverage not scored for this report
      </h3>
      <p className="bs-body-sm text-brand-muted m-0 max-w-3xl leading-relaxed">
        Diagnostic confidence and area breakdowns appear when your snapshot includes context-coverage data.
        Your pillar scores and priority actions above remain the source of truth for this readout.
      </p>
    </section>
  );
}
