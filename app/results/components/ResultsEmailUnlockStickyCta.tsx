"use client";

import { useCallback, useEffect, useState } from "react";
import { resultsCompleteSnapshotCtaLabel } from "@/lib/copy/resultsEmailGateCopy";

type Props = {
  productName: string;
};

/**
 * Shown when the primary email gate scrolls out of view — second chance to convert without duplicating the navy bottom funnel.
 */
export function ResultsEmailUnlockStickyCta({ productName }: Props) {
  const [visible, setVisible] = useState(false);

  const scrollToEmail = useCallback(() => {
    document.getElementById("email-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const target = document.getElementById("email-results");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="results-email-sticky-cta" role="region" aria-label="Get your complete snapshot">
      <div className="results-email-sticky-cta__inner">
        <p className="results-email-sticky-cta__label">{resultsCompleteSnapshotCtaLabel(productName)}</p>
        <button type="button" onClick={scrollToEmail} className="wb-cta wb-cta--outline results-email-sticky-cta__btn">
          {resultsCompleteSnapshotCtaLabel(productName)}
        </button>
      </div>
    </div>
  );
}
