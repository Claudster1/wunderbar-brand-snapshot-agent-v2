"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SnapshotResultsLeadEmail } from "@/app/results/components/SnapshotResultsLeadEmail";
import { ResultsPostUnlockUpsell } from "@/app/results/components/ResultsPostUnlockUpsell";
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
  /** Fresh unlock in this visit — after tips dismiss, show suite upsell where Access was. */
  const [showPostUnlockUpsell, setShowPostUnlockUpsell] = useState(false);

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
    const firstUnlock = !readResultsEmailGateUnlocked(reportId);
    writeResultsEmailGateUnlocked(reportId);
    setContentUnlocked(true);
    if (firstUnlock) {
      trackSnapshotComplete({});
    }
  }, [reportId]);

  const handleCaptureFlowComplete = useCallback(() => {
    // Tips saved or skipped — replace Access/tips with suite education, then refresh flags.
    setShowPostUnlockUpsell(true);
  }, []);

  // Returning unlocked visitors (email link / server flag): never show Access form.
  const showCaptureUi = requiresEmailGate && !initiallyUnlocked;

  return (
    <>
      {showCaptureUi ? (
        <div id="email-results" className="results-gate-stack scroll-mt-28">
          <SnapshotResultsLeadEmail
            reportId={reportId}
            productTier={productTier}
            productName={productName}
            {...(firstNameHint ? { firstNameHint } : {})}
            onEmailCaptured={handleEmailCaptured}
            contentUnlocked={contentUnlocked}
            onCaptureFlowComplete={handleCaptureFlowComplete}
          />
          {showPostUnlockUpsell ? <ResultsPostUnlockUpsell productName={productName} /> : null}
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
