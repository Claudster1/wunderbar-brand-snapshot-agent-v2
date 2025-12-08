// src/lib/brandSnapshotEngine.ts
// Centralized Brand Snapshot Intelligence Engine
// Handles scoring, normalization, insights, and personalization

import {
  PillarScores as DynamicPillarScores,
  getGapSeverity,
  findWeakestPillar,
  findStrongPillars,
  generatePillarInsight,
  generateUpsellCopy,
  type GapSeverity,
} from '../services/dynamicInsights';

// Re-export types for convenience
export type PillarScores = DynamicPillarScores;
export type { GapSeverity };

/**
 * Pillar weights for Brand Alignment Score calculation
 */
const PILLAR_WEIGHTS = {
  positioning: 0.30,
  messaging: 0.25,
  credibility: 0.20,
  visibility: 0.15,
  conversion: 0.10,
} as const;

/**
 * Normalize a raw score to 1-20 scale
 * If score is already in 1-20 range, return as-is
 * If score is in 0-100 range, scale it down
 */
export function normalizeTo1_20(score: number): number {
  if (score >= 1 && score <= 20) {
    return Math.round(score);
  }
  if (score >= 0 && score <= 100) {
    return Math.round((score / 100) * 20);
  }
  // Clamp to valid range
  return Math.max(1, Math.min(20, Math.round(score)));
}

/**
 * Calculate Brand Alignment Score from pillar scores using weighted formula
 * Returns score 0-100
 */
export function calculateBrandAlignmentScore(pillarScores: PillarScores): number {
  const weightedSum =
    pillarScores.positioning * PILLAR_WEIGHTS.positioning +
    pillarScores.messaging * PILLAR_WEIGHTS.messaging +
    pillarScores.credibility * PILLAR_WEIGHTS.credibility +
    pillarScores.visibility * PILLAR_WEIGHTS.visibility +
    pillarScores.conversion * PILLAR_WEIGHTS.conversion;

  // Scale from 0-20 to 0-100
  return Math.round(weightedSum * 5);
}

/**
 * Classify pillar severity based on score
 */
export function classifyPillarSeverity(score: number): {
  severity: GapSeverity;
  tier: 'excellent' | 'strong' | 'developing' | 'needs_focus';
} {
  if (score >= 18) {
    return { severity: 'light', tier: 'excellent' };
  }
  if (score >= 15) {
    return { severity: 'light', tier: 'strong' };
  }
  if (score >= 11) {
    return { severity: 'moderate', tier: 'developing' };
  }
  return { severity: 'major', tier: 'needs_focus' };
}

/**
 * Generate strength insight for a pillar
 */
function generateStrengthInsight(
  pillar: keyof PillarScores,
  score: number,
  tier: 'excellent' | 'strong' | 'developing' | 'needs_focus'
): string {
  const pillarName = pillar.charAt(0).toUpperCase() + pillar.slice(1);

  if (tier === 'excellent') {
    return `Your ${pillarName} is excellent—you've built a strong foundation that clearly communicates your value. This strength creates trust and recognition in the market.`;
  }
  if (tier === 'strong') {
    return `Your ${pillarName} is strong, showing clear progress and a solid foundation. You're well-positioned to build on this momentum.`;
  }
  if (tier === 'developing') {
    return `Your ${pillarName} is developing—you have the right pieces in place, and with focused attention, you can quickly strengthen this area.`;
  }
  return `Your ${pillarName} shows opportunity for growth. The good news is that improvements here will create meaningful impact on your overall brand alignment.`;
}

/**
 * Generate opportunity insight (same as current dynamic insight)
 */
function generateOpportunityInsight(
  pillar: keyof PillarScores,
  score: number
): string {
  return generatePillarInsight(pillar, score);
}

/**
 * Generate immediate next-step action for a pillar
 */
function generateActionInsight(
  pillar: keyof PillarScores,
  score: number,
  tier: 'excellent' | 'strong' | 'developing' | 'needs_focus'
): string {
  const pillarName = pillar.charAt(0).toUpperCase() + pillar.slice(1);

  if (tier === 'excellent') {
    return `Maintain your ${pillarName} strength by regularly reviewing and refreshing your approach. Consider how you can scale what's working as you grow.`;
  }
  if (tier === 'strong') {
    return `Build on your ${pillarName} foundation by identifying one specific area to refine or expand. Small improvements here will compound over time.`;
  }
  if (tier === 'developing') {
    return `Focus on strengthening ${pillarName} by addressing the most impactful gaps first. Start with one clear action and build from there.`;
  }
  return `Prioritize ${pillarName} as a key focus area. Start with the most foundational elements—even small improvements will create noticeable impact.`;
}

/**
 * Generate complete pillar insights (strength, opportunity, action)
 */
export function generatePillarInsights(pillarScores: PillarScores): {
  [key in keyof PillarScores]: {
    score: number;
    severity: GapSeverity;
    tier: 'excellent' | 'strong' | 'developing' | 'needs_focus';
    strength: string;
    opportunity: string;
    action: string;
  };
} {
  const insights: any = {};

  for (const [pillar, score] of Object.entries(pillarScores) as [
    keyof PillarScores,
    number
  ][]) {
    const normalizedScore = normalizeTo1_20(score);
    const { severity, tier } = classifyPillarSeverity(normalizedScore);

    insights[pillar] = {
      score: normalizedScore,
      severity,
      tier,
      strength: generateStrengthInsight(pillar, normalizedScore, tier),
      opportunity: generateOpportunityInsight(pillar, normalizedScore),
      action: generateActionInsight(pillar, normalizedScore, tier),
    };
  }

  return insights;
}

/**
 * Generate Snapshot+ personalized upsell message
 */
export function generateSnapshotUpsell(pillarScores: PillarScores): string {
  return generateUpsellCopy(pillarScores);
}

/**
 * Main function: Calculate scores and generate all insights
 */
export function calculateScores(rawPillarScores: Partial<PillarScores>): {
  brandAlignmentScore: number;
  pillarScores: PillarScores;
  pillarInsights: ReturnType<typeof generatePillarInsights>;
  weakestPillar: {
    pillar: keyof PillarScores;
    score: number;
    severity: GapSeverity;
  };
  strengths: (keyof PillarScores)[];
  opportunities: {
    pillar: keyof PillarScores;
    score: number;
    severity: GapSeverity;
  }[];
  snapshotUpsell: string;
} {
  // Normalize all pillar scores to 1-20
  const normalizedScores: PillarScores = {
    positioning: normalizeTo1_20(rawPillarScores.positioning || 0),
    messaging: normalizeTo1_20(rawPillarScores.messaging || 0),
    visibility: normalizeTo1_20(rawPillarScores.visibility || 0),
    credibility: normalizeTo1_20(rawPillarScores.credibility || 0),
    conversion: normalizeTo1_20(rawPillarScores.conversion || 0),
  };

  // Calculate Brand Alignment Score
  const brandAlignmentScore = calculateBrandAlignmentScore(normalizedScores);

  // Generate pillar insights
  const pillarInsights = generatePillarInsights(normalizedScores);

  // Find weakest pillar
  const weakestPillar = findWeakestPillar(normalizedScores);

  // Find strong pillars (score >= 16)
  const strengths = findStrongPillars(normalizedScores);

  // Find opportunities (sorted by score, ascending)
  const opportunities = Object.entries(normalizedScores)
    .map(([pillar, score]) => ({
      pillar: pillar as keyof PillarScores,
      score,
      severity: getGapSeverity(score),
    }))
    .sort((a, b) => a.score - b.score);

  // Generate Snapshot+ upsell
  const snapshotUpsell = generateSnapshotUpsell(normalizedScores);

  return {
    brandAlignmentScore,
    pillarScores: normalizedScores,
    pillarInsights,
    weakestPillar,
    strengths,
    opportunities,
    snapshotUpsell,
  };
}

