"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SnapshotResultsLeadEmail } from "@/app/results/components/SnapshotResultsLeadEmail";
import {
  readResultsEmailGateUnlocked,
  writeResultsEmailGateUnlocked,
} from "@/lib/results/resultsEmailGateStorage";

type Props = {
  reportId: string;
  requiresEmailGate: boolean;
  /** Server-known unlock (full_report.results_email_unlocked) — avoids flash before sessionStorage. */
  initiallyUnlocked?: boolean;
  productTier: "snapshot" | "snapshot-plus";
  productName: string;
  firstNameHint?: string;
  children: ReactNode;
};

export function ResultsSnapshotLeadGate({
  reportId,
  requiresEmailGate,
  initiallyUnlocked = false,
  productTier,
  productName,
  firstNameHint,
  children,
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

  /** Form stays through insights step until server refresh clears `requiresEmailGate`. */
  const showEmailBlock = requiresEmailGate;

  return (
    <>
      {showEmailBlock ? (
        <div id="email-results" className="scroll-mt-28 px-4 sm:px-0">
          <SnapshotResultsLeadEmail
            reportId={reportId}
            productTier={productTier}
            productName={productName}
            {...(firstNameHint ? { firstNameHint } : {})}
            onEmailCaptured={handleEmailCaptured}
            contentUnlocked={contentUnlocked}
          />
        </div>
      ) : null}

      {contentUnlocked ? (
        children
      ) : (
        <section
          className="results-gated-veil scroll-mt-28"
          aria-labelledby="results-gated-veil-heading"
        >
          <div className="results-gated-veil-preview" aria-hidden>
            {children}
          </div>
          <div className="results-gated-veil-overlay">
            <p className="results-gated-veil-kicker">Your score is ready</p>
            <h2 id="results-gated-veil-heading" className="results-gated-veil-title">
              Enter your email to unlock your full {productName}
            </h2>
            <p className="results-gated-veil-body">
              See pillar-by-pillar scores, priority actions, your archetype, and everything else from this
              diagnostic — we&apos;ll save your link so you can return anytime.
            </p>
            <button type="button" onClick={scrollToEmail} className="btn-primary results-gated-veil-cta">
              Unlock my results
            </button>
          </div>
        </section>
      )}
    </>
  );
}
