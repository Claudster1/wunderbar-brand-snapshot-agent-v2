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
  positioning: 0.25,
  messaging: 0.25,
  visibility: 0.20,
  credibility: 0.15,
  conversion: 0.15,
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
  const total =
    pillarScores.positioning * PILLAR_WEIGHTS.positioning +
    pillarScores.messaging * PILLAR_WEIGHTS.messaging +
    pillarScores.visibility * PILLAR_WEIGHTS.visibility +
    pillarScores.credibility * PILLAR_WEIGHTS.credibility +
    pillarScores.conversion * PILLAR_WEIGHTS.conversion;

  // Scale from 0-20 to 0-100
  return Math.round((total / 20) * 100);
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
 * Generate color palette based on brand archetype
 * Uses "Meaning" (not "what it communicates") for color psychology
 */
export function generateColorPalette(archetype: string): Array<{
  name: string;
  hex: string;
  role: string;
  meaning: string;
}> {
  const palettes: Record<string, Array<{
    name: string;
    hex: string;
    role: string;
    meaning: string;
  }>> = {
    "Sage": [
      { name: "Deep Blue", hex: "#021859", role: "Primary", meaning: "Wisdom, depth, clarity" },
      { name: "Aqua Glow", hex: "#27CDF2", role: "Secondary", meaning: "Freshness, agility, innovation" },
      { name: "Warm Amber", hex: "#FFB45E", role: "Accent", meaning: "Momentum, optimism" },
      { name: "Soft Gray", hex: "#F2F2F2", role: "Neutral", meaning: "Balance, calm" },
      { name: "Midnight", hex: "#0C1526", role: "Neutral Deep", meaning: "Premium depth, sophistication" }
    ],
    "Hero": [
      { name: "Bold Navy", hex: "#021859", role: "Primary", meaning: "Authority, trust, strength" },
      { name: "Electric Blue", hex: "#07B0F2", role: "Secondary", meaning: "Action, confidence, forward motion" },
      { name: "Crimson", hex: "#DC2626", role: "Accent", meaning: "Passion, urgency, impact" },
      { name: "Light Gray", hex: "#F5F5F5", role: "Neutral", meaning: "Clarity, focus, precision" },
      { name: "Charcoal", hex: "#1F2937", role: "Neutral Deep", meaning: "Grounded, professional, reliable" }
    ],
    "Explorer": [
      { name: "Forest Green", hex: "#065F46", role: "Primary", meaning: "Growth, adventure, natural authenticity" },
      { name: "Sky Blue", hex: "#0EA5E9", role: "Secondary", meaning: "Freedom, possibility, open horizons" },
      { name: "Sunset Orange", hex: "#F97316", role: "Accent", meaning: "Energy, discovery, boldness" },
      { name: "Sand", hex: "#FEF3C7", role: "Neutral", meaning: "Warmth, approachability, earthiness" },
      { name: "Deep Teal", hex: "#0F766E", role: "Neutral Deep", meaning: "Depth, exploration, wisdom" }
    ],
    "Creator": [
      { name: "Royal Purple", hex: "#6B21A8", role: "Primary", meaning: "Creativity, innovation, imagination" },
      { name: "Vibrant Pink", hex: "#EC4899", role: "Secondary", meaning: "Expression, boldness, artistic flair" },
      { name: "Golden Yellow", hex: "#FBBF24", role: "Accent", meaning: "Optimism, inspiration, brilliance" },
      { name: "Lavender", hex: "#E9D5FF", role: "Neutral", meaning: "Dreaminess, creativity, softness" },
      { name: "Deep Plum", hex: "#581C87", role: "Neutral Deep", meaning: "Sophistication, depth, artistic vision" }
    ],
    "Caregiver": [
      { name: "Sage Green", hex: "#10B981", role: "Primary", meaning: "Nurturing, growth, harmony" },
      { name: "Soft Blue", hex: "#60A5FA", role: "Secondary", meaning: "Trust, calm, care" },
      { name: "Warm Peach", hex: "#FB923C", role: "Accent", meaning: "Compassion, warmth, approachability" },
      { name: "Cream", hex: "#FFFBEB", role: "Neutral", meaning: "Gentleness, comfort, safety" },
      { name: "Olive", hex: "#84CC16", role: "Neutral Deep", meaning: "Stability, natural care, groundedness" }
    ],
    "Ruler": [
      { name: "Navy Blue", hex: "#021859", role: "Primary", meaning: "Authority, leadership, excellence" },
      { name: "Gold", hex: "#F59E0B", role: "Secondary", meaning: "Prestige, value, achievement" },
      { name: "Silver", hex: "#94A3B8", role: "Accent", meaning: "Refinement, sophistication, quality" },
      { name: "Ivory", hex: "#FFFEF7", role: "Neutral", meaning: "Elegance, luxury, space" },
      { name: "Charcoal", hex: "#1F2937", role: "Neutral Deep", meaning: "Power, stability, command" }
    ],
    "Innocent": [
      { name: "Sky Blue", hex: "#0EA5E9", role: "Primary", meaning: "Purity, simplicity, clarity" },
      { name: "Soft Pink", hex: "#F9A8D4", role: "Secondary", meaning: "Gentleness, optimism, joy" },
      { name: "Sunshine Yellow", hex: "#FCD34D", role: "Accent", meaning: "Happiness, positivity, light" },
      { name: "Cloud White", hex: "#FFFFFF", role: "Neutral", meaning: "Simplicity, cleanliness, openness" },
      { name: "Baby Blue", hex: "#BFDBFE", role: "Neutral Deep", meaning: "Trust, innocence, peace" }
    ],
    "Magician": [
      { name: "Deep Purple", hex: "#6B21A8", role: "Primary", meaning: "Transformation, mystery, innovation" },
      { name: "Electric Cyan", hex: "#06B6D4", role: "Secondary", meaning: "Magic, possibility, breakthrough" },
      { name: "Vibrant Magenta", hex: "#D946EF", role: "Accent", meaning: "Energy, transformation, boldness" },
      { name: "Misty Gray", hex: "#E5E7EB", role: "Neutral", meaning: "Mystery, depth, sophistication" },
      { name: "Midnight Blue", hex: "#0C1526", role: "Neutral Deep", meaning: "Depth, wisdom, transformation" }
    ],
  };

  return palettes[archetype] || palettes["Sage"];
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

