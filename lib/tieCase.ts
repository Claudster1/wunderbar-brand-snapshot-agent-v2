// lib/tieCase.ts
// Tie detection and explanation utilities

export function hasTopScoreTie(
  scores: Record<string, number>
): boolean {
  const values = Object.values(scores);
  const max = Math.max(...values);
  return values.filter(v => v === max).length > 1;
}

export const tieExplanation =
  "Several areas are equally influential right now. We've highlighted the one most likely to unlock momentum first.";
