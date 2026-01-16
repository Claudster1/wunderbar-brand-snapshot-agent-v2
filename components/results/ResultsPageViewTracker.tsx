// components/results/ResultsPageViewTracker.tsx
// Component to track results page view events

"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/activeCampaignTracking";

export function ResultsPageViewTracker({
  brandAlignmentScore,
  primaryPillar,
}: {
  brandAlignmentScore: number;
  primaryPillar: string;
}) {
  useEffect(() => {
    trackEvent("results_page_viewed", {
      brandAlignmentScore,
      primaryPillar,
    });
  }, [brandAlignmentScore, primaryPillar]);

  return null;
}
