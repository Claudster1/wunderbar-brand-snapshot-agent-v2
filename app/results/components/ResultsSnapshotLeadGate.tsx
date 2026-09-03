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
  /**
   * When true, a successful email unlock reloads the page so the server can
   * re-render with a verified session (used when SSR withheld report body).
   */
  reloadOnUnlock?: boolean;
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
  reloadOnUnlock = false,
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
    // SSR withheld the report body — only unlock after a reload with session.
    if (reloadOnUnlock) return;
    if (readResultsEmailGateUnlocked(reportId)) {
      setContentUnlocked(true);
    }
  }, [requiresEmailGate, initiallyUnlocked, reportId, reloadOnUnlock]);

  const handleEmailCaptured = useCallback(() => {
    const firstUnlock = !readResultsEmailGateUnlocked(reportId);
    writeResultsEmailGateUnlocked(reportId);
    if (firstUnlock) {
      trackSnapshotComplete({});
    }
    // When SSR withheld the report body, keep children locked until tips finish,
    // then reload (see handleCaptureFlowComplete).
    if (!reloadOnUnlock) {
      setContentUnlocked(true);
    }
  }, [reportId, reloadOnUnlock]);

  const handleCaptureFlowComplete = useCallback(() => {
    if (reloadOnUnlock) {
      window.location.reload();
      return;
    }
    // Tips saved or skipped — replace Access/tips with suite education, then refresh flags.
    setShowPostUnlockUpsell(true);
  }, [reloadOnUnlock]);

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
            parentHandlesNavigation={reloadOnUnlock}
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
