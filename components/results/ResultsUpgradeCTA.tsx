// components/results/ResultsUpgradeCTA.tsx
"use client";

import { useEffect, useState } from "react";
import { getOrAssignVariant } from "@/lib/abTesting";
import { RESULTS_CTA_COPY } from "@/content/resultsCtaCopy";
import { fireACEvent } from "@/lib/activeCampaign";
import { WUNDERBAR_SUITE_RESULTS_FUNNEL_URL } from "@/lib/wunderbarExternalUrls";

export function ResultsUpgradeCTA({
  primaryPillar,
  stage,
  hasPurchasedPlus,
  email,
}: {
  primaryPillar: string;
  stage: string;
  hasPurchasedPlus: boolean;
  email?: string;
  /** Kept for call-site compatibility; suite explore does not need report continuity. */
  reportId?: string;
}) {
  // Keep the initial render deterministic (server + first client render match),
  // then assign/read A/B variants after mount.
  const [variant, setVariant] = useState<"A" | "B">("A");

  useEffect(() => {
    setVariant(getOrAssignVariant<"A" | "B">("results_cta_variant", ["A", "B"]));
  }, []);

  const copy = RESULTS_CTA_COPY[variant];

  useEffect(() => {
    if (hasPurchasedPlus) return;
    fireACEvent({
      email,
      eventName: "snapshot_upgrade_cta_shown",
      fields: {
        cta_variant: variant,
        primary_pillar: primaryPillar,
        brand_stage: stage,
      },
    });
  }, [email, hasPurchasedPlus, primaryPillar, stage, variant]);

  // Only show to non-buyers
  if (hasPurchasedPlus) return null;

  const onPrimaryClick = () => {
    fireACEvent({
      email,
      eventName: "suite_explore_cta_clicked",
      tags: ["snapshot:explore-suite"],
      fields: {
        primary_pillar: primaryPillar,
        brand_stage: stage,
        cta_variant: variant,
      },
    });
    window.open(WUNDERBAR_SUITE_RESULTS_FUNNEL_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="bs-card rounded-xl p-6 sm:p-7">
      <h3 className="bs-h2 mb-2">{copy.headline}</h3>
      <p className="bs-body text-brand-midnight mb-7 max-w-xl">{copy.body}</p>

      <button type="button" onClick={onPrimaryClick} className="btn-primary">
        {copy.primaryCta}
      </button>
    </section>
  );
}
