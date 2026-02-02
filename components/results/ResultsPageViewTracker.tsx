// components/results/ResultsPageViewTracker.tsx
// Component to track results page view events

"use client";

import { useEffect } from "react";
import { fireACEvent } from "@/lib/fireACEvent";

export function ResultsPageViewTracker({
  brandAlignmentScore,
  primaryPillar,
  reportId,
  brandName,
  stage,
  contextCoverage,
  email,
}: {
  brandAlignmentScore: number;
  primaryPillar: string;
  reportId: string;
  brandName: string;
  stage: string;
  contextCoverage?: number;
  email?: string;
}) {
  useEffect(() => {
    const key = reportId
      ? `snapshot_results_viewed_${reportId}`
      : "snapshot_results_viewed";
    const isReturnVisit = Boolean(localStorage.getItem(key));

    fireACEvent({
      email,
      eventName: "snapshot_results_viewed",
      tags: [
        "snapshot:viewed-results",
        ...(isReturnVisit ? ["snapshot:return-visit"] : []),
      ],
      fields: {
        brand_name: brandName,
        primary_pillar: primaryPillar,
        brand_stage: stage,
        snapshot_score: brandAlignmentScore,
        context_coverage: contextCoverage ?? 0,
        return_visit: isReturnVisit,
      },
    });

    if (!isReturnVisit) {
      localStorage.setItem(key, "true");
    }

    if (typeof contextCoverage === "number" && contextCoverage < 70) {
      const coverageKey = reportId
        ? `snapshot_coverage_gap_${reportId}`
        : "snapshot_coverage_gap";
      const alreadySent = Boolean(localStorage.getItem(coverageKey));

      if (!alreadySent) {
        fireACEvent({
          email,
          eventName: "snapshot_coverage_gap",
          tags: ["snapshot:coverage-gap"],
          fields: {
            primary_pillar: primaryPillar,
            context_coverage: contextCoverage,
          },
        });
        localStorage.setItem(coverageKey, "true");
      }
    }
  }, []);

  return null;
}
