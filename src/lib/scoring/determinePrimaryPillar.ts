// src/lib/scoring/determinePrimaryPillar.ts
// Determine the primary pillar from scores

export function determinePrimaryPillar(
  scores: Record<string, number>
): string {
  const sorted = Object.entries(scores).sort(
    ([, a], [, b]) => b - a
  );

  if (sorted.length < 2) return sorted[0][0];

  if (sorted[0][1] === sorted[1][1]) {
    return sorted[0][0]; // tie → first priority
  }

  return sorted[0][0];
}
