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
