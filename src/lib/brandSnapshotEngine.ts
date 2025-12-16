// lib/brandSnapshotEngine.ts
// ---------------------------------------------
// Core scoring + insights engine for Brand Snapshot™
// ---------------------------------------------

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
  // Normalize helper
  const normalize = (value: number, max = 5) =>
    Math.min(Math.max(value, 1), max);

  // Pillar scoring
  const positioning =
    normalize(answers.marketClarity) +
    normalize(answers.targetCustomerDefinition) +
    normalize(answers.uniqueValue) +
    normalize(answers.marketDifferentiation) +
    normalize(answers.offerClarity);

  const messaging =
    normalize(answers.coreMessageStrength) +
    normalize(answers.websiteMessagingClarity) +
    normalize(answers.socialMessagingConsistency) +
    normalize(answers.storyClarity) +
    normalize(answers.benefitClarity);

  const visibility =
    normalize(answers.webPresence) +
    normalize(answers.socialPresence) +
    normalize(answers.seoHealth) +
    normalize(answers.contentVelocity) +
    normalize(answers.discoverability);

  const credibility =
    normalize(answers.proofPoints) +
    normalize(answers.reviews) +
    normalize(answers.socialProof) +
    normalize(answers.brandProfessionalism) +
    normalize(answers.websiteTrustSignals);

  const conversion =
    normalize(answers.ctaClarity) +
    normalize(answers.funnelStrength) +
    normalize(answers.leadCapture) +
    normalize(answers.offerMessaging) +
    normalize(answers.salesReadiness);

  const pillarScores: PillarScores = {
    positioning,
    messaging,
    visibility,
    credibility,
    conversion,
  };

  const brandAlignmentScore = Math.round(
    (positioning +
      messaging +
      visibility +
      credibility +
      conversion) /
      5
  );

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
      "Increase branded visibility across search, social, and owned channels."
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
  // Calculate Brand Alignment Score from existing pillar scores
  const brandAlignmentScore = Math.round(
    (pillarScores.positioning +
      pillarScores.messaging +
      pillarScores.visibility +
      pillarScores.credibility +
      pillarScores.conversion) /
      5
  );
  
  // Find weakest pillar
  const weakestPillar = Object.entries(pillarScores).reduce((min, [pillar, score]) => 
    score < min.score ? { pillar, score } : min,
    { pillar: 'positioning' as keyof PillarScores, score: 25 }
  );
  
  // Find strong pillars (>= 20)
  const strengths = Object.entries(pillarScores)
    .filter(([_, score]) => score >= 20)
    .map(([pillar]) => pillar);
  
  // Generate insights (convert to object format with strength/opportunity/action)
  const rawInsights = generateInsights(pillarScores);
  const pillarInsights: Record<string, { strength: string; opportunity: string; action: string }> = {};
  
  Object.entries(pillarScores).forEach(([pillar, score]) => {
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
    pillarScores,
    pillarInsights,
    weakestPillar: {
      pillar: weakestPillar.pillar,
      score: weakestPillar.score,
      severity: weakestPillar.score < 10 ? "major" : weakestPillar.score < 14 ? "moderate" : "light"
    },
    strengths,
    snapshotUpsell: upsellCopy,
    opportunities: Object.entries(pillarScores)
      .filter(([_, score]) => score < 14)
      .map(([pillar]) => pillar)
  };
}
