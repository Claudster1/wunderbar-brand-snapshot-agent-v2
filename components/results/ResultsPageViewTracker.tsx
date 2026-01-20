// components/results/ResultsPageViewTracker.tsx
// Component to track results page view events

"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function ResultsPageViewTracker({
  brandAlignmentScore,
  primaryPillar,
}: {
  brandAlignmentScore: number;
  primaryPillar: string;
}) {
  useEffect(() => {
    trackEvent("RESULTS_VIEWED", {
      score: brandAlignmentScore,
      primaryPillar,
    });
  }, []);

  return null;
}
