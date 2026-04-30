// Overall WunderBrand Score™ (0–100) rating label for report hero — must match gauge bands (scoreBands.ts).

import { getOverallScoreAlignmentLabel } from "./scoreBands";

export function getOverallScoreRating(score: number): string {
  return getOverallScoreAlignmentLabel(score);
}
