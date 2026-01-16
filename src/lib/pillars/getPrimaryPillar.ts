// src/lib/pillars/getPrimaryPillar.ts
// Get the primary (lowest scoring) pillar from pillar scores

import { PillarKey } from "./pillarCopy";

export function getPrimaryPillar(
  pillarScores: Record<PillarKey, number>
): PillarKey {
  return Object.entries(pillarScores)
    .sort((a, b) => a[1] - b[1])[0][0] as PillarKey;
}
