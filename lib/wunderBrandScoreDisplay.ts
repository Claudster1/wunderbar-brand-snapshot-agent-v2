import { computeWeightedBrandAlignmentScore } from "@/src/lib/pillarWeights";

const PILLAR_KEYS = [
  "positioning",
  "messaging",
  "visibility",
  "credibility",
  "conversion",
] as const;

/**
 * WunderBrand Score™ shown in the UI: same weighted formula as the scoring engine (pillars stay 0–20 each).
 * Recompute from `pillar_scores` when present so the gauge matches pillar bars even if
 * `brand_alignment_score` was stored out of sync.
 *
 * If pillar values are not on the 0–20 scale (legacy / bad rows), falls back to `brand_alignment_score`.
 */
export function wunderBrandScoreFromPillars(report: {
  brand_alignment_score?: number | null;
  pillar_scores?: Record<string, unknown> | null;
}): number {
  const ps = report.pillar_scores;
  if (ps && typeof ps === "object") {
    const raw = PILLAR_KEYS.map((k) => Number(ps[k]));
    const looksLikePillar20 = raw.every(
      (n) => Number.isFinite(n) && n >= 0 && n <= 20
    );
    if (looksLikePillar20) {
      return computeWeightedBrandAlignmentScore({
        positioning: Number(ps.positioning) || 0,
        messaging: Number(ps.messaging) || 0,
        visibility: Number(ps.visibility) || 0,
        credibility: Number(ps.credibility) || 0,
        conversion: Number(ps.conversion) || 0,
      });
    }
  }
  return Math.max(0, Math.min(100, Math.round(Number(report.brand_alignment_score) || 0)));
}
