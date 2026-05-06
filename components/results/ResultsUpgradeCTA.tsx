// components/results/ResultsUpgradeCTA.tsx
"use client";

import { useEffect, useState } from "react";
import { getOrAssignVariant } from "@/lib/abTesting";
import { RESULTS_CTA_COPY } from "@/content/resultsCtaCopy";
import { fireACEvent } from "@/lib/activeCampaign";
import { trackUpgradeClick } from "@/lib/adTracking";

export function ResultsUpgradeCTA({
  primaryPillar,
  stage,
  hasPurchasedPlus,
  email,
  reportId,
}: {
  primaryPillar: string;
  stage: string;
  hasPurchasedPlus: boolean;
  email?: string;
  /** Free Snapshot report id — keeps intake when user continues to Snapshot+ checkout from the app. */
  reportId?: string;
}) {
  // Keep the initial render deterministic (server + first client render match),
  // then assign/read A/B variants after mount.
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [presence, setPresence] = useState<"single" | "dual">("single");

  useEffect(() => {
    setVariant(getOrAssignVariant<"A" | "B">("results_cta_variant", ["A", "B"]));
    setPresence(
      getOrAssignVariant<"single" | "dual">("results_cta_presence", ["single", "dual"])
    );
  }, []);

  const copy = RESULTS_CTA_COPY[variant];

  useEffect(() => {
    if (hasPurchasedPlus) return;
    fireACEvent({
      email,
      eventName: "snapshot_upgrade_cta_shown",
      fields: {
        cta_variant: variant,
        cta_presence: presence,
        primary_pillar: primaryPillar,
        brand_stage: stage,
      },
    });
  }, [email, hasPurchasedPlus, presence, primaryPillar, stage, variant]);

  // Only show to non-buyers
  if (hasPurchasedPlus) return null;

  const onPrimaryClick = () => {
    fireACEvent({
      email,
      eventName: "snapshot_upgrade_cta_clicked",
      tags: ["snapshot:clicked-upgrade"],
      fields: {
        primary_pillar: primaryPillar,
        brand_stage: stage,
        cta_variant: variant,
        cta_presence: presence,
      },
    });
    trackUpgradeClick({ fromTier: "snapshot", toTier: "snapshot-plus", value: 497 });

    const q =
      reportId && /^[0-9a-f-]{36}$/i.test(reportId.trim())
        ? `?baseReportId=${encodeURIComponent(reportId.trim())}`
        : "";
    window.location.href = `/snapshot-plus${q}`;
  };

  const onSecondaryClick = () => {
    fireACEvent({
      email,
      eventName: "snapshot_upgrade_cta_clicked",
      fields: {
        primary_pillar: primaryPillar,
        brand_stage: stage,
        cta_variant: variant,
        cta_presence: presence,
      },
    });

    window.location.href = "/brand-snapshot-suite";
  };

  return (
    <section className="bs-card rounded-xl p-6 sm:p-7">
      <h3 className="bs-h2 mb-2">{copy.headline}</h3>
      <p className="bs-body text-brand-midnight mb-7 max-w-xl">{copy.body}</p>

      <div className="flex flex-wrap gap-4">
        <button type="button" onClick={onPrimaryClick} className="btn-primary">
          {copy.primaryCta}
        </button>

        {presence === "dual" && (
          <button type="button" onClick={onSecondaryClick} className="btn-secondary">
            {copy.secondaryCta}
          </button>
        )}
      </div>
    </section>
  );
}
