// components/results/ResultsUpgradeCTA.tsx
"use client";

import { useEffect, useState } from "react";
import { getUpgradeNudge } from "@/lib/upgradeNudgeLogic";
import { getSuiteCTAVariant, shouldShowSuiteCTA } from "@/lib/featureFlags";
import { suiteCTACopy } from "@/lib/suiteCTACopy";
import { trackEvent } from "@/lib/activeCampaignTracking";
import { ProductAccess } from "@/lib/productAccess";

type Props = {
  snapshot: {
    brand_alignment_score: number;
    primary_pillar: string;
    context_coverage: number;
  };
  userEmail?: string;
};

export function ResultsUpgradeCTA({ snapshot, userEmail }: Props) {
  const [access, setAccess] = useState<ProductAccess | undefined>(undefined);
  const variant = getSuiteCTAVariant();

  // Load user product access if email provided
  useEffect(() => {
    if (userEmail) {
      fetch(`/api/user/access?email=${encodeURIComponent(userEmail)}`)
        .then((res) => res.json())
        .then((data) => setAccess(data.access))
        .catch(() => setAccess(undefined));
    }
  }, [userEmail]);

  const nudge = getUpgradeNudge(snapshot, access);

  if (!nudge) return null;

  return (
    <section className="mt-16 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-8 text-center">
      <h3 className="text-xl font-semibold text-brand-navy">
        {nudge.title}
      </h3>

      <p className="mt-3 text-base text-brand-midnight max-w-2xl mx-auto">
        {nudge.body}
      </p>

      {/* Primary CTA */}
      <a
        href={nudge.href}
        className="inline-flex mt-6 btn-primary"
      >
        {nudge.ctaLabel}
      </a>

      {/* Secondary CTA */}
      {shouldShowSuiteCTA() && (
        <div className="mt-4">
          <a
            href="/brand-snapshot-suite"
            onClick={() =>
              trackEvent("suite_explore_clicked", {
                source: "results_page",
                primaryPillar: snapshot.primary_pillar,
                variant,
              })
            }
            className="text-sm font-medium text-brand-blue hover:underline underline-offset-4"
          >
            {suiteCTACopy[variant]}
          </a>
        </div>
      )}
    </section>
  );
}
