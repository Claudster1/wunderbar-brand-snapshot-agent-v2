// lib/scoring/primaryPillar.ts
// Primary pillar calculation

import { PillarKey } from "@/types/pillars";

export function getPrimaryPillar(
  scores: Record<PillarKey, number>
): PillarKey {
  const entries = Object.entries(scores) as [PillarKey, number][];
  const maxScore = Math.max(...entries.map(([, v]) => v));
  const lowest = entries.filter(([, v]) => v === maxScore);
  return lowest[0][0]; // deterministic, stable
}
