/**
 * WunderBrand Score™ pillar weights (sum = 100).
 *
 * Rationale — “brand strength” vs. channel mechanics:
 * - **Positioning** — Who you serve, category, differentiation, offer clarity. Without this,
 *   the brand has no coherent definition of strength.
 * - **Messaging** — How the promise is expressed across touchpoints; direct expression of positioning.
 * - **Credibility** — Trust that the brand can deliver; especially important in B2B and
 *   high-consideration purchases.
 * - **Visibility** — Discoverability and presence; necessary, but reach without clarity matters less
 *   for strategic brand strength.
 * - **Conversion** — Capture and nurture mechanics; important operationally but downstream of
 *   clarity, narrative, and trust.
 *
 * Each pillar is still scored 0–20 on its own. The headline 0–100 score is a weighted blend so
 * stronger positioning/messaging/credibility moves the needle more than visibility/conversion alone.
 */
export const BRAND_PILLAR_WEIGHTS = {
  positioning: 26,
  messaging: 24,
  credibility: 22,
  visibility: 16,
  conversion: 12,
} as const;

export type BrandPillarKey = keyof typeof BRAND_PILLAR_WEIGHTS;

export type PillarScoresForWeighting = Record<BrandPillarKey, number>;

function clampPillar20(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(20, Math.max(0, Math.round(n)));
}

/**
 * Maps five pillar scores (each 0–20) to the headline WunderBrand Score™ (0–100).
 */
export function computeWeightedBrandAlignmentScore(
  pillars: Partial<PillarScoresForWeighting> | Record<string, number>
): number {
  const p = clampPillar20(Number(pillars.positioning) || 0);
  const m = clampPillar20(Number(pillars.messaging) || 0);
  const v = clampPillar20(Number(pillars.visibility) || 0);
  const c = clampPillar20(Number(pillars.credibility) || 0);
  const x = clampPillar20(Number(pillars.conversion) || 0);

  const raw =
    (p / 20) * BRAND_PILLAR_WEIGHTS.positioning +
    (m / 20) * BRAND_PILLAR_WEIGHTS.messaging +
    (v / 20) * BRAND_PILLAR_WEIGHTS.visibility +
    (c / 20) * BRAND_PILLAR_WEIGHTS.credibility +
    (x / 20) * BRAND_PILLAR_WEIGHTS.conversion;

  return Math.min(100, Math.max(0, Math.round(raw)));
}
