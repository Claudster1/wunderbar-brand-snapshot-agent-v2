"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SnapshotResultsLeadEmail } from "@/app/results/components/SnapshotResultsLeadEmail";
import { ResultsCheckIcon } from "@/components/results/BrandIcons";
import { ResultsEmailUnlockStickyCta } from "@/app/results/components/ResultsEmailUnlockStickyCta";
import {
  resultsEmailGateIncludedEyebrow,
  resultsEmailGateUnlockHint,
} from "@/lib/copy/resultsEmailGateCopy";
import {
  readResultsEmailGateUnlocked,
  writeResultsEmailGateUnlocked,
} from "@/lib/results/resultsEmailGateStorage";
import { trackSnapshotComplete } from "@/lib/adTracking";

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
  "Brand Pillar Analysis — scores, strengths, and gaps",
  "Your brand archetype and what it means",
  "Ranked priority actions for your brand",
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
    // Fire the "Lead" conversion once per report (email capture = the lead moment).
    // Guard on the persisted unlock flag so revisits / preference re-submits don't
    // double-count.
    const firstUnlock = !readResultsEmailGateUnlocked(reportId);
    writeResultsEmailGateUnlocked(reportId);
    setContentUnlocked(true);
    if (firstUnlock) {
      trackSnapshotComplete({});
    }
  }, [reportId]);

  const showEmailBlock = requiresEmailGate;
  const gateActive = showEmailBlock && !contentUnlocked;

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
                <p className="results-gate-included-band__eyebrow">
                  {resultsEmailGateIncludedEyebrow(productName)}
                </p>
                <h2 id="results-gate-included-heading" className="results-gate-included-band__title">
                  What you’ll unlock
                </h2>
                <ul className="results-gate-included-band__list">
                  {UNLOCK_PREVIEW_ITEMS.map((label) => (
                    <li key={label}>
                      <ResultsCheckIcon />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
                <p className="results-gate-included-band__hint">{resultsEmailGateUnlockHint()}</p>
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
      ) : null}
    </>
  );
}
