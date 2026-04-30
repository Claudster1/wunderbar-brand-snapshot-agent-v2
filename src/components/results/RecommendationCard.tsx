"use client";

import { useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { trackUpgradeNudgeClick } from "@/lib/trackUpgradeNudgeClick";
import { getUpgradeNudgeCopy } from "@/lib/upgrade/ctaCopy";
import { getTrackedCheckoutUrl } from "@/lib/checkoutUrls";

interface RecommendationCardProps {
  primaryPillar: string;
}

export function RecommendationCard({ primaryPillar }: RecommendationCardProps) {
  const copy = getUpgradeNudgeCopy({ primaryPillar });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      trackEvent("UPGRADE_ABANDONED", { target: "Snapshot+" });
    }, 60000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="bs-card rounded-xl border-l-4 border-l-brand-blue p-6 sm:p-7 h-full flex flex-col shadow-md">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="bs-badge bg-brand-blue/15 text-brand-blue shrink-0">
          Recommended for you
        </span>
      </div>
      <h3 className="bs-h3 text-brand-navy mb-2 leading-tight">
        {copy.headline}
      </h3>
      <p className="bs-body-sm text-brand-muted mb-4 flex-1">
        {copy.detail}
      </p>
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
        className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center"
      >
        {copy.ctaLabel}
      </Link>
    </div>
  );
}
