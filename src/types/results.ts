// src/types/results.ts
// Results page type definitions

import { PillarKey } from "@/types/pillars";

export interface ResultsState {
  brandName: string;
  brandAlignmentScore: number;
  pillarScores: Record<PillarKey, number>;
  primaryPillar: PillarKey;
  stage: "early" | "scaling" | "established";
  contextCoverage: number; // 0–100
}
