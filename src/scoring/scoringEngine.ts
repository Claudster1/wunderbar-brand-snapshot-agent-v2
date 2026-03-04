// src/scoring/scoringEngine.ts
// All scoring + priority logic

import { PillarKey } from "../copy/pillars";
import { getPrimaryPillar as getPrimaryPillarFromSpec } from "@/lib/pillars/getPrimaryPillar";

export type PillarScore = Record<PillarKey, number>;

export function calculateBrandAlignmentScore(scores: PillarScore): number {
  const values = Object.values(scores).map((value) =>
    Math.min(Math.max(Math.round(Number(value || 0)), 0), 20),
  );
  return values.reduce((a, b) => a + b, 0);
}

export function getPrimaryPillar(
  scores: PillarScore,
  businessType?: string | null,
): PillarKey {
  const result = getPrimaryPillarFromSpec(scores, { businessType });
  return (result.type === "single" ? result.pillar : result.pillars?.[0]) as PillarKey;
}

export function classifyStrength(score: number): "strong" | "mixed" | "weak" {
  if (score >= 16) return "strong";
  if (score >= 11) return "mixed";
  return "weak";
}
