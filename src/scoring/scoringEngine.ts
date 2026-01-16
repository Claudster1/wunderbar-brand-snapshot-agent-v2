// src/scoring/scoringEngine.ts
// All scoring + priority logic

import { PillarKey } from "../copy/pillars";

export type PillarScore = Record<PillarKey, number>;

export function calculateBrandAlignmentScore(scores: PillarScore): number {
  const values = Object.values(scores);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function getPrimaryPillar(scores: PillarScore): PillarKey {
  return Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0] as PillarKey;
}

export function classifyStrength(score: number): "strong" | "mixed" | "weak" {
  if (score >= 16) return "strong";
  if (score >= 11) return "mixed";
  return "weak";
}
