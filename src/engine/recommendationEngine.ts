// src/engine/recommendationEngine.ts
// Recommendation engine for WunderBrand Snapshot™ / Blueprint flows.

export function generateRecommendations(scores: any) {
  const recs: any[] = [];

  if (scores.positioning < 14) {
    recs.push({
      title: "Strengthen Your Positioning",
      detail:
        "Your value proposition and differentiation need clearer articulation. Start by defining who you serve, what outcome you deliver, and why you're the superior choice.",
    });
  }

  if (scores.visibility < 14) {
    recs.push({
      title: "Increase Market Visibility",
      detail:
        "Your brand presence appears under-leveraged. Expand into 1–2 new channels and establish a consistent weekly content rhythm. Additionally, optimize for both traditional SEO and Answer Engine Optimization (AEO) to ensure you show up when people search via AI assistants like ChatGPT and Perplexity.",
    });
  }

  if (scores.credibility < 14) {
    recs.push({
      title: "Boost Social Proof",
      detail:
        "Consider adding testimonials, case studies, press mentions, or trust indicators to your website and social profiles.",
    });
  }

  return recs;
}


