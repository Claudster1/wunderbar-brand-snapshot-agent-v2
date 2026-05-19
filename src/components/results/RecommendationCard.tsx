"use client";

import { useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { trackUpgradeNudgeClick } from "@/lib/trackUpgradeNudgeClick";
import { getUpgradeNudgeCopy } from "@/lib/upgrade/ctaCopy";
import { getTrackedCheckoutUrl } from "@/lib/checkoutUrls";
import { PRICING } from "@/lib/pricing";

interface RecommendationCardProps {
  primaryPillar: string;
}

export function RecommendationCard({ primaryPillar }: RecommendationCardProps) {
  const copy = getUpgradeNudgeCopy({ primaryPillar });
  const nextTier = PRICING.snapshot_plus.label;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      trackEvent("UPGRADE_ABANDONED", { target: "Snapshot+" });
    }, 60000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <aside
      className="results-upgrade-card rounded-2xl border-2 border-brand-blue/30 bg-gradient-to-br from-[#e8f6fe] via-white to-white p-7 sm:p-8 shadow-[0_10px_40px_rgba(7,176,242,0.12)]"
      aria-labelledby="results-upgrade-heading"
    >
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-blue m-0 mb-3">
        Next step · {nextTier}
      </p>
      <h3 id="results-upgrade-heading" className="text-xl sm:text-2xl font-bold text-brand-navy mb-3 leading-snug">
        {copy.headline}
      </h3>
      <p className="text-sm sm:text-base text-brand-midnight leading-relaxed mb-2">{copy.body}</p>
      <p className="text-sm text-brand-muted leading-relaxed mb-6">{copy.detail}</p>
      <Link
        href={getTrackedCheckoutUrl({
          product: "snapshot-plus",
          medium: "results_cta",
          content: `results_recommendation_${primaryPillar.replace(/[^a-z0-9_-]/gi, "_")}`,
        })}
        onClick={() => {
          trackEvent("UPGRADE_CLICKED", { target: "Snapshot+", primaryPillar });
          trackUpgradeNudgeClick(primaryPillar);
        }}
        className="btn-primary w-full sm:w-auto inline-flex items-center justify-center text-base px-8 py-3.5 shadow-[0_4px_14px_rgba(7,176,242,0.35)]"
      >
        {copy.ctaLabel}
      </Link>
      <p className="bs-small text-brand-muted mt-4 mb-0">{copy.note}</p>
    </aside>
  );
}
