// lib/brandSnapshotEngine.ts

// =============================================================
// BRAND SNAPSHOT ENGINE™
// Core logic for:
// - Brand Alignment Score™
// - Pillar scoring (weighted)
// - Persona & Archetype inference
// - Color palette generation
// - Insights & recommendations
// - Snapshot+™ full deliverable support
// =============================================================

export type SnapshotInput = {
  businessName: string;
  industry: string;
  website?: string;
  socials?: string[];
  hasBrandGuidelines: boolean;
  brandConsistency: string; // "strong" | "somewhat" | "inconsistent"
  targetCustomers: string;
  competitorNames?: string[];
  offerClarity: string; // "very clear" | "somewhat clear" | "unclear"
  messagingClarity: string;
  brandVoiceDescription: string;
  primaryGoals: string[];
  marketingChannels: string[];
  visualConfidence: string; // "very confident" | "somewhat" | "not confident"
  brandPersonalityWords: string[];
};

// =============================================================
// 1. PILLAR WEIGHTS (not all pillars are equal)
// =============================================================
const WEIGHTS = {
  positioning: 0.28,
  messaging: 0.24,
  visibility: 0.18,
  credibility: 0.15,
  conversion: 0.15,
};

// =============================================================
// 2. SCORING HELPERS (0–20 per pillar)
// =============================================================
function scorePositioning(input: SnapshotInput): number {
  let score = 10;

  if (input.offerClarity === "very clear") score += 5;
  if (input.targetCustomers.length > 20) score += 3;
  if (input.brandConsistency === "strong") score += 2;
  if (input.industry.toLowerCase().includes("technology")) score += 1; // minor boost

  return Math.min(20, score);
}

function scoreMessaging(input: SnapshotInput): number {
  let score = 10;

  if (input.messagingClarity === "very clear") score += 6;
  if (input.brandVoiceDescription.length > 40) score += 2;

  return Math.min(20, score);
}

function scoreVisibility(input: SnapshotInput): number {
  let score = 8;

  if (input.marketingChannels.includes("seo")) score += 3;
  if (input.marketingChannels.includes("social")) score += 3;
  if (input.socials && input.socials.length >= 3) score += 3;

  return Math.min(20, score);
}

function scoreCredibility(input: SnapshotInput): number {
  let score = 8;

  if (input.hasBrandGuidelines) score += 4;
  if (input.competitorNames && input.competitorNames.length > 0) score += 2;
  if (input.visualConfidence === "very confident") score += 4;

  return Math.min(20, score);
}

function scoreConversion(input: SnapshotInput): number {
  let score = 8;

  if (input.offerClarity === "very clear") score += 6;
  if (input.marketingChannels.includes("email")) score += 3;

  return Math.min(20, score);
}

// =============================================================
// 3. PILLAR SCORE MAP
// =============================================================
export function calculatePillarScores(input: SnapshotInput) {
  return {
    positioning: scorePositioning(input),
    messaging: scoreMessaging(input),
    visibility: scoreVisibility(input),
    credibility: scoreCredibility(input),
    conversion: scoreConversion(input),
  };
}

// =============================================================
// 4. BRAND ALIGNMENT SCORE™ (0–100)
// =============================================================
export function calculateBrandAlignmentScore(pillars: Record<string, number>) {
  return Math.round(
    pillars.positioning * WEIGHTS.positioning +
      pillars.messaging * WEIGHTS.messaging +
      pillars.visibility * WEIGHTS.visibility +
      pillars.credibility * WEIGHTS.credibility +
      pillars.conversion * WEIGHTS.conversion
  );
}

// =============================================================
// 5. PERSONA & ARCHETYPE ENGINE
// =============================================================
export function inferPersona(input: SnapshotInput) {
  const words = input.brandPersonalityWords.map((w) => w.toLowerCase());

  if (words.includes("bold") || words.includes("innovative")) {
    return {
      persona: "The Visionary",
      archetype: "The Creator",
      description:
        "Forward-thinking, energetic, and driven by innovation. You attract customers who believe in transformation and originality.",
    };
  }

  if (words.includes("helpful") || words.includes("warm")) {
    return {
      persona: "The Guide",
      archetype: "The Caregiver",
      description:
        "Supportive, trustworthy, and empathetic — your brand thrives when customers feel understood and cared for.",
    };
  }

  if (words.includes("expert") || words.includes("professional")) {
    return {
      persona: "The Authority",
      archetype: "The Sage",
      description:
        "Clear, informative, and dependable. Your authority helps customers feel confident they're making the right choice.",
    };
  }

  // fallback
  return {
    persona: "The Builder",
    archetype: "The Everyperson",
    description:
      "Approachable, reliable, and grounded — your strength lies in making customers feel comfortable and supported.",
  };
}

// =============================================================
// 6. COLOR PALETTE GENERATOR (Persona-Based)
// =============================================================
export function generateColorPalette(persona: string) {
  switch (persona) {
    case "The Visionary":
      return [
        { name: "Electric Blue", hex: "#1E90FF", role: "Primary", meaning: "Innovation & momentum" },
        { name: "Deep Navy", hex: "#021859", role: "Secondary", meaning: "Confidence & stability" },
        { name: "Vibrant Aqua", hex: "#27CDF2", role: "Accent", meaning: "Energy & clarity" },
      ];

    case "The Guide":
      return [
        { name: "Warm Teal", hex: "#3BAE9C", role: "Primary", meaning: "Trust & empathy" },
        { name: "Soft Sand", hex: "#EADBC8", role: "Secondary", meaning: "Warmth & approachability" },
        { name: "Deep Ocean", hex: "#013A63", role: "Accent", meaning: "Reassurance & grounding" },
      ];

    case "The Authority":
      return [
        { name: "Charcoal Blue", hex: "#0C1526", role: "Primary", meaning: "Authority & clarity" },
        { name: "Steel Gray", hex: "#7C8CA5", role: "Secondary", meaning: "Structure & dependability" },
        { name: "Refined Gold", hex: "#C6A667", role: "Accent", meaning: "Excellence & leadership" },
      ];

    default:
      return [
        { name: "Friendly Blue", hex: "#4A90E2", role: "Primary", meaning: "Approachability & trust" },
        { name: "Fresh Green", hex: "#7ED957", role: "Secondary", meaning: "Growth & optimism" },
        { name: "Crisp White", hex: "#FFFFFF", role: "Accent", meaning: "Simplicity & clarity" },
      ];
  }
}

// =============================================================
// 7. INSIGHTS ENGINE
// =============================================================
export function generateInsights(
  pillars: Record<string, number>,
  persona: string
) {
  const insights: Record<string, string> = {};

  insights.positioning =
    pillars.positioning >= 16
      ? "Your positioning is strong — customers likely understand who you serve and what sets you apart."
      : "Small refinements to your market focus and offer clarity could significantly boost your differentiation.";

  insights.messaging =
    pillars.messaging >= 16
      ? "Your messaging feels confident and clear — a strong signal that your brand understands its voice."
      : "Clarifying your core message and refining tone can strengthen emotional connection and trust.";

  insights.visibility =
    pillars.visibility >= 15
      ? "You're present across key channels — now optimize consistency to increase reach."
      : "Increasing visibility across your strongest channels could meaningfully expand your brand awareness.";

  insights.credibility =
    pillars.credibility >= 15
      ? "Your brand feels trustworthy and dependable — continue reinforcing proof points and consistency."
      : "Strengthening visual consistency, testimonials, and authority signals will boost customer confidence.";

  insights.conversion =
    pillars.conversion >= 15
      ? "Your conversion fundamentals are strong — customers likely understand your next steps."
      : "Simplifying calls-to-action and clarifying your offer structure can meaningfully improve conversion performance.";

  return insights;
}

// =============================================================
// 8. RECOMMENDATIONS ENGINE (Snapshot+™ foundation)
// =============================================================
export function generateRecommendations(
  pillars: Record<string, number>,
  persona: string
) {
  const recs: string[] = [];

  if (pillars.positioning < 14)
    recs.push(
      "Refine your value proposition to more clearly communicate who you serve, what you solve, and why it matters."
    );

  if (pillars.messaging < 14)
    recs.push(
      "Develop a messaging hierarchy that clearly outlines your core message, supporting points, and tone guidelines."
    );

  if (pillars.visibility < 12)
    recs.push(
      "Increase visibility by strengthening your top-performing channels and improving consistency across touchpoints."
    );

  if (pillars.credibility < 12)
    recs.push(
      "Reinforce credibility with testimonials, case studies, certification badges, and consistent visual branding."
    );

  if (pillars.conversion < 12)
    recs.push(
      "Improve conversion by clarifying CTAs, simplifying landing pages, and communicating value earlier."
    );

  // Persona-based strategic recommendation
  if (persona === "The Visionary")
    recs.push(
      "Lean into originality — spotlight your unique perspective to differentiate your category position."
    );

  if (persona === "The Guide")
    recs.push(
      "Highlight support, clarity, and empathy in your brand experience — this builds trust faster."
    );

  if (persona === "The Authority")
    recs.push(
      "Elevate leadership content — frameworks, insights, and strategic guidance reinforce your expertise."
    );

  return recs;
}

// =============================================================
// 9. FINAL EXPORT: FULL REPORT OBJECT
// =============================================================
export function generateBrandSnapshotReport(input: SnapshotInput) {
  const pillarScores = calculatePillarScores(input);
  const brandAlignmentScore = calculateBrandAlignmentScore(pillarScores);
  const personaData = inferPersona(input);
  const colorPalette = generateColorPalette(personaData.persona);
  const pillarInsights = generateInsights(pillarScores, personaData.persona);
  const recommendations = generateRecommendations(
    pillarScores,
    personaData.persona
  );

  return {
    brandAlignmentScore,
    pillarScores,
    persona: personaData.persona,
    archetype: personaData.archetype,
    personaDescription: personaData.description,
    colorPalette,
    pillarInsights,
    recommendations,
  };
}

// =============================================================
// 10. COMPATIBILITY FUNCTION: calculateScores
// For backward compatibility with existing code that passes pillarScores directly
// =============================================================
export function calculateScores(pillarScores: Record<string, number>) {
  // Calculate Brand Alignment Score from existing pillar scores
  const brandAlignmentScore = calculateBrandAlignmentScore(pillarScores);
  
  // Find weakest pillar
  const weakestPillar = Object.entries(pillarScores).reduce((min, [pillar, score]) => 
    score < min.score ? { pillar, score } : min,
    { pillar: 'positioning', score: 20 }
  );
  
  // Find strong pillars (>= 16)
  const strengths = Object.entries(pillarScores)
    .filter(([_, score]) => score >= 16)
    .map(([pillar]) => pillar);
  
  // Generate insights (convert string insights to object format with strength/opportunity/action)
  const rawInsights = generateInsights(pillarScores, "The Builder"); // Default persona for compatibility
  const pillarInsights: Record<string, { strength: string; opportunity: string; action: string }> = {};
  
  Object.entries(rawInsights).forEach(([pillar, insight]) => {
    // Split insight into strength/opportunity/action based on score
    const score = pillarScores[pillar];
    if (score >= 16) {
      pillarInsights[pillar] = {
        strength: insight,
        opportunity: "Continue building on this strength to maintain momentum.",
        action: "Document what's working and scale these practices across touchpoints."
      };
    } else if (score >= 12) {
      pillarInsights[pillar] = {
        strength: "You have a solid foundation in this area.",
        opportunity: insight,
        action: "Focus on one key improvement to elevate this pillar."
      };
    } else {
      pillarInsights[pillar] = {
        strength: "There's significant opportunity for growth here.",
        opportunity: insight,
        action: "Start with the highest-impact change to see meaningful improvement."
      };
    }
  });
  
  // Generate upsell copy based on weakest pillar
  const upsellCopy = `Your ${weakestPillar.pillar} pillar shows the most opportunity for improvement. Snapshot+™ provides a complete strategic roadmap to strengthen this area and elevate your overall brand alignment.`;
  
  return {
    brandAlignmentScore,
    pillarScores,
    pillarInsights,
    weakestPillar,
    strengths,
    snapshotUpsell: upsellCopy,
    opportunities: Object.entries(pillarScores)
      .filter(([_, score]) => score < 14)
      .map(([pillar]) => pillar)
  };
}
