// Overall Brand Alignment Score (0–100) rating label for report hero.
// Bands must match gauge segments in ScoreGauge (see scoreBands.ts).

import { OVERALL_SCORE_BANDS, getOverallScoreBand } from "./scoreBands";

export function getOverallScoreRating(score: number): string {
  const band = getOverallScoreBand(score);
  return OVERALL_SCORE_BANDS[band].label;
}
