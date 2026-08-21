"use client";

import { WUNDERBAR_SUITE_RESULTS_FUNNEL_URL } from "@/lib/wunderbarExternalUrls";

type Props = {
  productName: string;
};

/**
 * Replaces the Access / unlock card after email capture so the next action is suite education.
 */
export function ResultsPostUnlockUpsell({ productName }: Props) {
  return (
    <section
      className="results-gate-capture results-gate-capture--unlock"
      aria-label="Explore paid diagnostics"
    >
      <div className="results-gate-capture__inner">
        <div className="results-gate-capture__offer">
          <p className="results-gate-capture__eyebrow m-0">Why brand matters</p>
          <h2 className="bs-h3 m-0 results-gate-capture__title">
            Build one clear brand story your whole team can run with
          </h2>
          <p className="results-gate-capture__lead m-0" style={{ marginTop: "0.75rem" }}>
            When ads, your website, sales, and content each tell a slightly different story, buyers
            get confused and trust drops.
          </p>
          <p className="results-gate-capture__lead m-0" style={{ marginTop: "0.65rem" }}>
            A strong brand fixes that: <strong>one positioning, one message, one plan</strong>.
            Consistent brand presentation has been linked to revenue lifts of up to 33% (Lucidpress,{" "}
            <em>State of Brand Consistency</em>, 2019). Marketing spend compounds. Your team stops
            reinventing the pitch. Prospects recognize you faster—and decide with less friction.
          </p>
          <p className="results-gate-capture__lead m-0" style={{ marginTop: "0.65rem" }}>
            Snapshot+™, Blueprint™, and Blueprint+™ turn your {productName} diagnosis into that
            clarity—so growth gets cheaper and more repeatable.
          </p>
        </div>
        <div className="results-gate-capture__form">
          <a
            href={WUNDERBAR_SUITE_RESULTS_FUNNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="wb-cta wb-cta--solid wb-cta--block results-gate-capture__submit"
          >
            Explore the WunderBrand Suite™
          </a>
          <p className="results-gate-capture__legal">
            Compare what’s included, then choose the path that fits how you want to grow.
          </p>
        </div>
      </div>
    </section>
  );
}
