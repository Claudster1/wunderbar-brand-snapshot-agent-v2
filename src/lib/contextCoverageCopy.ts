// src/lib/contextCoverageCopy.ts
// Copy utilities for context coverage messaging

import { ContextCoverageResult } from "@/src/engine/contextCoverage";

export function getContextSummaryCopy(
  coverage: ContextCoverageResult
): string {
  if (coverage.confidenceLevel === "high") {
    return "This Snapshot+™ is built on strong, well-confirmed context, allowing for precise and confident recommendations.";
  }

  if (coverage.confidenceLevel === "medium") {
    return "This Snapshot+™ reflects solid context, with a few areas where deeper input could sharpen recommendations further.";
  }

  return "This Snapshot+™ provides directional guidance based on limited context. Expanding inputs will increase precision.";
}

export function shouldSuggestRefinement(
  coverage: ContextCoverageResult
): boolean {
  return coverage.confidenceLevel !== "high";
}

export function getRefinementCTA(
  primaryPillar: string,
  brandName: string
): string {
  return `Want to go deeper on ${primaryPillar} for ${brandName}?`;
}
