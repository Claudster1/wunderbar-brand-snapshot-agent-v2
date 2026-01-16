// src/types/contextCoverage.ts
// Context coverage type definitions

import { PillarKey } from "@/types/pillars";

export interface ContextCoverage {
  overallScore: number; // 0–100
  coverageByPillar: Record<PillarKey, number>; // 0–100
  gaps: PillarKey[];
}
