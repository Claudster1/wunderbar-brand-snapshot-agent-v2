/**
 * Single source of truth for overall WunderBrand Score™ (0–100) bands.
 * Five bands match the semi-circular gauge arc (20-point segments): 0–19 … 80–100.
 * Used by: ScoreGauge + legend, hero “What this score means” headline, accents.
 */

/** Segment boundaries as percentage (0–100). Each segment is 20 points on the gauge arc. */
export const GAUGE_SEGMENT_PERCENTS = [0, 20, 40, 60, 80, 100] as const;

/**
 * Visual + language for each band. `stroke` matches gauge arc segment color; `label` is the public alignment name.
 */
export const OVERALL_SCORE_GAUGE_RANGES = [
  {
    min: 80,
    max: 100,
    stroke: "#34c759",
    headline: "#15803d",
    softBg: "rgba(52, 199, 89, 0.10)",
    label: "Strong Alignment",
  },
  {
    min: 60,
    max: 79,
    stroke: "#8bc34a",
    headline: "#3d6b0a",
    softBg: "rgba(139, 195, 74, 0.14)",
    label: "Moderate Alignment",
  },
  {
    min: 40,
    max: 59,
    stroke: "#ffcc00",
    headline: "#a16207",
    softBg: "rgba(255, 204, 0, 0.18)",
    label: "Partial Alignment",
  },
  {
    min: 20,
    max: 39,
    stroke: "#ff9500",
    headline: "#c2410c",
    softBg: "rgba(255, 149, 0, 0.14)",
    label: "Weak Alignment",
  },
  {
    min: 0,
    max: 19,
    stroke: "#ff3b30",
    headline: "#b91c1c",
    softBg: "rgba(255, 59, 48, 0.10)",
    label: "Low Alignment",
  },
] as const;

export function getGaugeAccentForScore(score: number): (typeof OVERALL_SCORE_GAUGE_RANGES)[number] {
  const s = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));
  return (
    OVERALL_SCORE_GAUGE_RANGES.find((r) => s >= r.min && s <= r.max) ?? OVERALL_SCORE_GAUGE_RANGES[4]
  );
}

/** Same alignment name shown in the gauge legend and the hero verdict line. */
export function getOverallScoreAlignmentLabel(score: number): string {
  return getGaugeAccentForScore(score).label;
}
