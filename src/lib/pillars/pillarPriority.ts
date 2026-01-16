// src/lib/pillars/pillarPriority.ts

export type PillarKey =
  | "positioning"
  | "messaging"
  | "visibility"
  | "credibility"
  | "conversion";

/**
 * Fallback hierarchy when scores tie.
 * This reflects strategic importance, not value judgment.
 */
const PILLAR_PRIORITY_ORDER: PillarKey[] = [
  "positioning",
  "messaging",
  "visibility",
  "credibility",
  "conversion",
];

export function resolvePillarPriority(
  pillarScores: Record<PillarKey, number>
): {
  primary: PillarKey;
  secondary: PillarKey[];
} {
  const sorted = Object.entries(pillarScores)
    .sort((a, b) => {
      // Primary sort: score DESC
      if (b[1] !== a[1]) return b[1] - a[1];

      // Tie-breaker: predefined priority
      return (
        PILLAR_PRIORITY_ORDER.indexOf(a[0] as PillarKey) -
        PILLAR_PRIORITY_ORDER.indexOf(b[0] as PillarKey)
      );
    })
    .map(([key]) => key as PillarKey);

  return {
    primary: sorted[0],
    secondary: sorted.slice(1),
  };
}

export function hasTopScoreTie(
  scores: Record<string, number>
): boolean {
  const values = Object.values(scores);
  const max = Math.max(...values);
  return values.filter(v => v === max).length > 1;
}
