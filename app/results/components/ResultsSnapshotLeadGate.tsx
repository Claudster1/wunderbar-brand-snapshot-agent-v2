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
  /** Rendered only after unlock (e.g. upgrade funnel) — never inside the blur veil. */
  afterUnlock?: ReactNode;
};

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

  /** Form stays through insights step until server refresh clears `requiresEmailGate`. */
  const showEmailBlock = requiresEmailGate;

  const unlockPreviewItems = [
    "Pillar-by-pillar scores and narrative",
    "Ranked priority actions for your brand",
    "Your archetype pattern and meaning",
    "Context coverage and next-step guidance",
  ];

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
        <>
          {children}
          {afterUnlock}
        </>
      ) : (
        <section
          className="results-gated-veil scroll-mt-28"
          aria-labelledby="results-gated-veil-heading"
        >
          <div className="results-gated-veil-preview" aria-hidden>
            {children}
          </div>
          <div className="results-gated-veil-overlay">
            <p className="results-gated-veil-kicker">Included in your full report</p>
            <h2 id="results-gated-veil-heading" className="results-gated-veil-title">
              What unlocks after your email
            </h2>
            <ul className="results-gated-veil-list">
              {unlockPreviewItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button type="button" onClick={scrollToEmail} className="results-gated-veil-scroll-hint">
              ↑ Back to the form above
            </button>
          </div>
        </section>
      )}
    </>
  );
}
