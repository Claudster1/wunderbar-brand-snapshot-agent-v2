"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SnapshotResultsLeadEmail } from "@/app/results/components/SnapshotResultsLeadEmail";
import { ResultsListIcon } from "@/components/results/BrandIcons";
import {
  readResultsEmailGateUnlocked,
  writeResultsEmailGateUnlocked,
} from "@/lib/results/resultsEmailGateStorage";

const WUNDERBAR_HOME =
  "https://www.wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=results_gate&utm_campaign=brand_continuity&utm_content=included_band";

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
  { label: "Pillar-by-pillar scores and narrative", icon: "positioning" },
  { label: "Ranked priority actions for your brand", icon: "priorities" },
  { label: "Your archetype pattern and meaning", icon: "archetype" },
  { label: "Context coverage and next-step guidance", icon: "journey" },
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

  return (
    <>
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

          {!contentUnlocked ? (
            <section
              className="results-gate-included-band"
              aria-labelledby="results-gate-included-heading"
            >
              <div className="results-gate-included-band__glow" aria-hidden />
              <div className="results-gate-included-band__inner">
                <p className="results-gate-included-band__eyebrow">Included in your full report</p>
                <h2 id="results-gate-included-heading" className="results-gate-included-band__title">
                  What unlocks after your email
                </h2>
                <ul className="results-gate-included-band__list">
                  {UNLOCK_PREVIEW_ITEMS.map(({ label, icon }) => (
                    <li key={label}>
                      <ResultsListIcon token={icon} variant="dark" />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={scrollToEmail} className="results-gate-included-band__cta">
                  Unlock my results
                </button>
                <a
                  href={WUNDERBAR_HOME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="results-gate-included-band__brand"
                >
                  wunderbardigital.com
                </a>
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
          <div className="results-gated-veil-preview">{children}</div>
        </section>
      )}
    </>
  );
}
