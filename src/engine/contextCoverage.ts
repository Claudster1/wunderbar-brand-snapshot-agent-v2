// src/engine/contextCoverage.ts
// Context coverage types and utilities

export interface ContextCoverageResult {
  coveragePercent: number;
  confidenceLevel: "high" | "medium" | "low";
}
