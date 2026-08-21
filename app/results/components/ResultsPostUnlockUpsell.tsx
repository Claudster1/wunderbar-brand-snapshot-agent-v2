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
          <p className="results-gate-capture__eyebrow m-0">Go further</p>
          <h2 className="bs-h3 m-0 results-gate-capture__title">
            Turn your {productName} into a brand system
          </h2>
          <p className="results-gate-capture__lead m-0" style={{ marginTop: "0.75rem" }}>
            Snapshot+™, Blueprint™, and Blueprint+™ build on these results with deeper strategy,
            messaging frameworks, and activation you can run with your team.
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
