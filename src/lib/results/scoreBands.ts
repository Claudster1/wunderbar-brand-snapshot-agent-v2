/**
 * Single source of truth for overall Brand Alignment Score (0–100) bands.
 * Used by: gauge segments (ScoreGauge), rating label (getOverallScoreRating),
 * and any copy that references score ranges. Keep in sync so needle color and
 * "Rating: X" text always match.
 */
/** Rating labels. Gauge arc: 0–20 red, 20–40 orange, 40–60 yellow, 60–80 light green, 80–100 dark green. */
export const OVERALL_SCORE_BANDS = {
  needsFocus: { min: 0, max: 40, label: "Needs focus" },
  developing: { min: 40, max: 60, label: "Developing" },
  strong: { min: 60, max: 80, label: "Strong" },
  excellent: { min: 80, max: 100, label: "Excellent" },
} as const;

/** Segment boundaries as percentage (0–100). Each segment is 20% for the gauge arc. */
export const GAUGE_SEGMENT_PERCENTS = [0, 20, 40, 60, 80, 100] as const;

/** Which band a score (0–100) falls into. */
export function getOverallScoreBand(score: number): keyof typeof OVERALL_SCORE_BANDS {
  if (score >= OVERALL_SCORE_BANDS.excellent.min) return "excellent";
  if (score >= OVERALL_SCORE_BANDS.strong.min) return "strong";
  if (score >= OVERALL_SCORE_BANDS.developing.min) return "developing";
  return "needsFocus";
}
