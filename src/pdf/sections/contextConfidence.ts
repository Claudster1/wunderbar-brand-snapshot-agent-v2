// src/pdf/sections/contextConfidence.ts
// Context confidence section builder

import { SnapshotPDFSection } from "@/types/snapshotPDF";
import { ContextCoverageResult } from "@/engine/contextCoverage";

export function buildContextConfidenceSection(
  context: ContextCoverageResult
): SnapshotPDFSection {
  let confidenceCopy: string;

  if (context.confidenceLevel === "high") {
    confidenceCopy =
      "This Snapshot+™ is built on strong, well-confirmed context. The insights and recommendations in this report are highly specific and actionable.";
  } else if (context.confidenceLevel === "medium") {
    confidenceCopy =
      "This Snapshot+™ reflects solid context with a few areas where additional input could sharpen clarity and prioritization.";
  } else {
    confidenceCopy =
      "This Snapshot+™ provides directional guidance based on limited context. Expanding inputs would significantly increase precision.";
  }

  return {
    id: "context-confidence",
    title: "Context & Confidence",
    body: [
      `Context Coverage: ${context.coveragePercent}%`,
      confidenceCopy,
    ],
  };
}
