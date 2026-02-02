// components/results/ResultsUpgradeCTA.tsx
"use client";

import { useEffect, useState } from "react";
import { getOrAssignVariant } from "@/lib/abTesting";
import { RESULTS_CTA_COPY } from "@/content/resultsCtaCopy";
import { fireACEvent } from "@/lib/activeCampaign";

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
}) {
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [presence, setPresence] = useState<"single" | "dual">("single");

  useEffect(() => {
    setVariant(getOrAssignVariant("results_cta_variant", ["A", "B"]));
    setPresence(getOrAssignVariant("results_cta_presence", ["single", "dual"]));
  }, []);

  // Only show to non-buyers
  if (hasPurchasedPlus) return null;

  const copy = RESULTS_CTA_COPY[variant];

  useEffect(() => {
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
  }, [variant, presence]);

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

    window.location.href = "/snapshot-plus";
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
    <section className="mt-16 rounded-xl border border-brand-border p-8 bg-white">
      <h3 className="text-2xl font-semibold mb-2">{copy.headline}</h3>
      <p className="text-brand-midnight mb-6 max-w-xl">{copy.body}</p>

      <div className="flex flex-wrap gap-4">
        <button onClick={onPrimaryClick} className="btn-primary">
          {copy.primaryCta}
        </button>

        {presence === "dual" && (
          <button onClick={onSecondaryClick} className="btn-secondary">
            {copy.secondaryCta}
          </button>
        )}
      </div>
    </section>
  );
}
