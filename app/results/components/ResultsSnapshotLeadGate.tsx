"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SnapshotResultsLeadEmail } from "@/app/results/components/SnapshotResultsLeadEmail";
import { ResultsEmailUnlockStickyCta } from "@/app/results/components/ResultsEmailUnlockStickyCta";
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
