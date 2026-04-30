// lib/brandSnapshotEngine.ts
// ---------------------------------------------
// Core scoring + insights engine for WunderBrand Snapshot™
// ---------------------------------------------

import {
  deriveSnapshotFactorsFromAssessment,
  resolveSnapshotFactor,
  type SnapshotFactorKey,
} from "./snapshotAssessmentFactors";
import { computeWeightedBrandAlignmentScore } from "./pillarWeights";

export { computeWeightedBrandAlignmentScore, BRAND_PILLAR_WEIGHTS } from "./pillarWeights";

export type PillarScores = {
  positioning: number;
  messaging: number;
  visibility: number;
  credibility: number;
  conversion: number;
};

export type SnapshotResult = {
  brandAlignmentScore: number;
  pillarScores: PillarScores;
  insights: string[];
  recommendations: string[];
};

export function calculateBrandSnapshotScores(
  answers: Record<string, any>
): SnapshotResult {
  const asRecord = answers as Record<string, unknown>;
  const derived = deriveSnapshotFactorsFromAssessment(asRecord);
  const f = (key: SnapshotFactorKey) =>
    resolveSnapshotFactor(asRecord, key, derived[key]);

  const toPillar20 = (factors: number[]) => {
    if (factors.length === 0) return 0;
    const sum = factors.reduce((acc, value) => acc + value, 0);
    return Math.min(Math.max(Math.round((sum / (factors.length * 5)) * 20), 0), 20);
  };

  // Pillar scoring (factors 0–5 each; explicit numeric overrides + Wundy-derived fill)
  const positioning = toPillar20([
    f("marketClarity"),
    f("targetCustomerDefinition"),
    f("uniqueValue"),
    f("marketDifferentiation"),
    f("offerClarity"),
  ]);

  const messaging = toPillar20([
    f("coreMessageStrength"),
    f("websiteMessagingClarity"),
    f("socialMessagingConsistency"),
    f("storyClarity"),
    f("benefitClarity"),
  ]);

  const visibility = toPillar20([
    f("webPresence"),
    f("socialPresence"),
    f("seoHealth"),
    f("contentVelocity"),
    f("discoverability"),
  ]);

  const credibility = toPillar20([
    f("proofPoints"),
    f("reviews"),
    f("socialProof"),
    f("brandProfessionalism"),
    f("websiteTrustSignals"),
  ]);

  const conversion = toPillar20([
    f("ctaClarity"),
    f("funnelStrength"),
    f("leadCapture"),
    f("offerMessaging"),
    f("salesReadiness"),
  ]);

  const pillarScores: PillarScores = {
    positioning,
    messaging,
    visibility,
    credibility,
    conversion,
  };

  // Headline 0–100: weighted blend (pillars stay 0–20 each for bars and copy).
  const brandAlignmentScore = computeWeightedBrandAlignmentScore(pillarScores);

  // Generate insights dynamically
  const insights = generateInsights(pillarScores);
  const recommendations = generateRecommendations(pillarScores);

  return {
    brandAlignmentScore,
    pillarScores,
    insights,
    recommendations,
  };
}

// Insight logic
function generateInsights(pillars: PillarScores): string[] {
  const list: string[] = [];

  if (pillars.positioning < 14)
    list.push(
      "Your positioning could be sharper. Customers may not instantly understand what you offer or why you stand out."
    );

  if (pillars.messaging < 14)
    list.push(
      "Your messaging has room to become more magnetic and benefit-driven."
    );

  if (pillars.visibility < 14)
    list.push(
      "Your visibility foundation suggests opportunities to strengthen consistency and discoverability."
    );

  if (pillars.credibility < 14)
    list.push(
      "Building additional trust signals could meaningfully increase perceived authority."
    );

  if (pillars.conversion < 14)
    list.push(
      "Your conversion structure may not be supporting your growth as effectively as it could."
    );

  return list;
}

// Recommendation logic
function generateRecommendations(pillars: PillarScores): string[] {
  const recs: string[] = [];

  if (pillars.positioning < 14)
    recs.push("Refine your core positioning around value, audience, and outcomes.");

  if (pillars.messaging < 14)
    recs.push(
      "Strengthen messaging to emphasize clarity, differentiation, and emotional resonance."
    );

  if (pillars.visibility < 14)
    recs.push(
      "Increase branded visibility across search, social, and owned channels. Optimize for both traditional SEO and Answer Engine Optimization (AEO) to ensure you show up in AI search results."
    );

  if (pillars.credibility < 14)
    recs.push(
      "Enhance trust with stronger social proof, testimonials, and brand professionalism."
    );

  if (pillars.conversion < 14)
    recs.push("Optimize CTAs, landing pages, and narrative flow for higher conversion.");

  return recs;
}

// =============================================================
// BACKWARD COMPATIBILITY: calculateScores function
// For existing code that passes pillarScores directly
// =============================================================
export function calculateScores(pillarScores: PillarScores) {
  // Calculate WunderBrand Score™ from existing pillar scores
  const normalizedPillars: PillarScores = {
    positioning: Math.min(Math.max(Math.round(Number(pillarScores.positioning || 0)), 0), 20),
    messaging: Math.min(Math.max(Math.round(Number(pillarScores.messaging || 0)), 0), 20),
    visibility: Math.min(Math.max(Math.round(Number(pillarScores.visibility || 0)), 0), 20),
    credibility: Math.min(Math.max(Math.round(Number(pillarScores.credibility || 0)), 0), 20),
    conversion: Math.min(Math.max(Math.round(Number(pillarScores.conversion || 0)), 0), 20),
  };
  const brandAlignmentScore = computeWeightedBrandAlignmentScore(normalizedPillars);
  
  // Find weakest pillar
  const entries = Object.entries(normalizedPillars) as [keyof PillarScores, number][];
  const weakestPillar = entries.reduce((min, [pillar, score]) => 
    score < min.score ? { pillar, score } : min,
    { pillar: 'positioning' as keyof PillarScores, score: 20 }
  );
  
  // Find strong pillars (>= 20)
  const strengths = Object.entries(normalizedPillars)
    .filter(([_, score]) => score >= 20)
    .map(([pillar]) => pillar);
  
  // Generate insights (convert to object format with strength/opportunity/action)
  const rawInsights = generateInsights(normalizedPillars);
  const pillarInsights: Record<string, { strength: string; opportunity: string; action: string }> = {};
  
  Object.entries(normalizedPillars).forEach(([pillar, score]) => {
    const insight = rawInsights.find((ins) => ins.toLowerCase().includes(pillar)) || "";
    if (score >= 20) {
      pillarInsights[pillar] = {
        strength: `Your ${pillar} is strong — continue building on this foundation.`,
        opportunity: "Maintain momentum and scale these practices.",
        action: "Document what's working and replicate across touchpoints."
      };
    } else if (score >= 14) {
      pillarInsights[pillar] = {
        strength: "You have a solid foundation in this area.",
        opportunity: insight || "There's room to elevate this pillar further.",
        action: "Focus on one key improvement to see meaningful growth."
      };
    } else {
      pillarInsights[pillar] = {
        strength: "There's significant opportunity for growth here.",
        opportunity: insight || "This area needs focused attention.",
        action: "Start with the highest-impact change to see improvement."
      };
    }
  });
  
  // Generate upsell copy based on weakest pillar
  const upsellCopy = `Your ${weakestPillar.pillar} pillar shows the most opportunity for improvement. Snapshot+™ provides a complete strategic roadmap to strengthen this area and elevate your overall brand alignment.`;
  
  return {
    brandAlignmentScore,
    pillarScores: normalizedPillars,
    pillarInsights,
    weakestPillar: {
      pillar: weakestPillar.pillar,
      score: weakestPillar.score,
      severity: weakestPillar.score < 10 ? "major" : weakestPillar.score < 14 ? "moderate" : "light"
    },
    strengths,
    snapshotUpsell: upsellCopy,
    opportunities: Object.entries(normalizedPillars)
      .filter(([_, score]) => score < 14)
      .map(([pillar]) => pillar)
  };
}
