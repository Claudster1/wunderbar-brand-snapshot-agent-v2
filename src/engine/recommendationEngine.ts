// src/engine/recommendationEngine.ts
// Recommendation engine for Brand Snapshot / Blueprint flows.

export type Recommendation = {
  title: string;
  detail: string;
};

export type ScoreInput = {
  positioning?: number;
  messaging?: number;
  visibility?: number;
  credibility?: number;
  conversion?: number;
};

export function generateRecommendations(scores: ScoreInput): Recommendation[] {
  const recs: Recommendation[] = [];

  if ((scores.positioning ?? 20) < 14) {
    recs.push({
      title: "Strengthen Your Positioning",
      detail:
        "Your value proposition and differentiation need clearer articulation. Start by defining who you serve, what outcome you deliver, and why you're the superior choice.",
    });
  }

  if ((scores.visibility ?? 20) < 14) {
    recs.push({
      title: "Increase Market Visibility",
      detail:
        "Your brand presence appears under-leveraged. Expand into 1–2 new channels and establish a consistent weekly content rhythm.",
    });
  }

  if ((scores.credibility ?? 20) < 14) {
    recs.push({
      title: "Boost Social Proof",
      detail:
        "Consider adding testimonials, case studies, press mentions, or trust indicators to your website and social profiles.",
    });
  }

  // Optional conversion flag
  if ((scores.conversion ?? 20) < 14) {
    recs.push({
      title: "Improve Conversion Clarity",
      detail:
        "Tighten your calls-to-action and reduce friction: simplify the next step, clarify outcomes, and align landing pages with the promise you make in your messaging.",
    });
  }

  return recs;
}


