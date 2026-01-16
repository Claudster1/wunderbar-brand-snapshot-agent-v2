// src/utils/pillarRanking.ts
import { PillarKey } from "./pillarContent";

export function rankPillars(pillarScores: Record<PillarKey, number>) {
  return (Object.keys(pillarScores) as PillarKey[])
    .sort((a, b) => pillarScores[a] - pillarScores[b]);
}

export function getPillarPriority(
  pillar: PillarKey,
  ranked: PillarKey[]
): "primary" | "secondary" | "tertiary" {
  if (pillar === ranked[0]) return "primary";
  if (pillar === ranked[1]) return "secondary";
  return "tertiary";
}

export function categorizePillars(ranked: PillarKey[]) {
  return {
    primary: ranked[0],
    secondary: ranked.slice(1, 3),
    tertiary: ranked.slice(3),
  };
}
