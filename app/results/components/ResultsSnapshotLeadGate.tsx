"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SnapshotResultsLeadEmail } from "@/app/results/components/SnapshotResultsLeadEmail";
import { ResultsCheckIcon } from "@/components/results/BrandIcons";
import { ResultsEmailUnlockStickyCta } from "@/app/results/components/ResultsEmailUnlockStickyCta";
import {
  resultsCompleteSnapshotCtaLabel,
  resultsCompleteSnapshotHeadline,
} from "@/lib/copy/resultsEmailGateCopy";
import {
  readResultsEmailGateUnlocked,
  writeResultsEmailGateUnlocked,
} from "@/lib/results/resultsEmailGateStorage";

type Props = {
  reportId: string;
  requiresEmailGate: boolean;
  initiallyUnlocked?: boolean;
  productTier: "snapshot" | "snapshot-plus";
  productName: string;
  firstNameHint?: string;
  children: ReactNode;
  afterUnlock?: ReactNode;
};

const UNLOCK_PREVIEW_ITEMS = [
  "Pillar-by-pillar scores and narrative",
  "Ranked priority actions for your brand",
  "Your archetype pattern and meaning",
  "Context coverage and next-step guidance",
] as const;

export function ResultsSnapshotLeadGate({
  reportId,
  requiresEmailGate,
  initiallyUnlocked = false,
  productTier,
  productName,
  firstNameHint,
  children,
  afterUnlock,
}: Props) {
  const [contentUnlocked, setContentUnlocked] = useState(
    !requiresEmailGate || initiallyUnlocked,
  );

  useEffect(() => {
    if (!requiresEmailGate || initiallyUnlocked) {
      setContentUnlocked(true);
      return;
    }
    if (readResultsEmailGateUnlocked(reportId)) {
      setContentUnlocked(true);
    }
  }, [requiresEmailGate, initiallyUnlocked, reportId]);

  const handleEmailCaptured = useCallback(() => {
    writeResultsEmailGateUnlocked(reportId);
    setContentUnlocked(true);
  }, [reportId]);

  const scrollToEmail = useCallback(() => {
    document.getElementById("email-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const showEmailBlock = requiresEmailGate;
  const gateActive = showEmailBlock && !contentUnlocked;
  const completeLabel = resultsCompleteSnapshotCtaLabel(productName);

  return (
    <>
      {gateActive ? <ResultsEmailUnlockStickyCta productName={productName} /> : null}

      {showEmailBlock ? (
        <div id="email-results" className="results-gate-stack scroll-mt-28">
          <SnapshotResultsLeadEmail
            reportId={reportId}
            productTier={productTier}
            productName={productName}
            {...(firstNameHint ? { firstNameHint } : {})}
            onEmailCaptured={handleEmailCaptured}
            contentUnlocked={contentUnlocked}
          />

          {gateActive ? (
            <section
              className="results-gate-included-band"
              aria-labelledby="results-gate-included-heading"
            >
              <div className="results-gate-included-band__inner">
                <p className="results-gate-included-band__eyebrow">Included in your full report</p>
                <h2 id="results-gate-included-heading" className="results-gate-included-band__title">
                  {resultsCompleteSnapshotHeadline(productName)}
                </h2>
                <ul className="results-gate-included-band__list">
                  {UNLOCK_PREVIEW_ITEMS.map((label) => (
                    <li key={label}>
                      <ResultsCheckIcon />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={scrollToEmail}
                  className="wb-cta wb-cta--outline wb-cta--block results-gate-included-band__cta"
                >
                  {completeLabel}
                </button>
                <button
                  type="button"
                  onClick={scrollToEmail}
                  className="wb-cta wb-cta--text results-gate-included-band__scroll-hint"
                >
                  ↑ Back to the form above
                </button>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {contentUnlocked ? (
        <>
          {children}
          {afterUnlock}
        </>
      ) : (
        <section className="results-gated-preview-only scroll-mt-4" aria-hidden>
          <div className="results-gated-preview-banner">
            <p className="results-gated-preview-banner__text m-0">
              {resultsCompleteSnapshotHeadline(productName)} — enter your email above to open the rest of this
              report.
            </p>
            <button
              type="button"
              onClick={scrollToEmail}
              className="wb-cta wb-cta--outline results-gated-preview-banner__btn"
            >
              {completeLabel}
            </button>
          </div>
          <div className="results-gated-veil-preview">{children}</div>
        </section>
      )}
    </>
  );
}
