export function generateRecommendations(scores: any) {
  const recs: any[] = [];

  if (scores.positioning < 14) {
    recs.push({
      title: "Sharpen Your Market Position",
      detail:
        "Your positioning lacks the specificity needed for the market to understand why you're the right choice. Define a single, clear value proposition that articulates who you serve, the specific outcome you deliver, and the defensible reason competitors can't replicate it — then pressure-test it against your top 3 alternatives.",
    });
  }

  if (scores.visibility < 14) {
    recs.push({
      title: "Close the Discovery Gap",
      detail:
        "Qualified prospects are searching in channels where your brand doesn't appear. Prioritize 2–3 high-intent channels aligned with your audience, establish a consistent content cadence, and begin building structured content for both traditional SEO and AI-powered Answer Engine Optimization (AEO) — the brands that are discoverable in both will capture the next wave of organic growth.",
    });
  }

  if (scores.credibility < 14) {
    recs.push({
      title: "Build a Credibility System",
      detail:
        "Trust signals need to be deployed strategically — not just present, but placed where buying decisions happen. Start with 3–5 outcome-specific testimonials on your highest-traffic pages, create one detailed case study that demonstrates your methodology, and ensure visual consistency across every touchpoint so your brand looks as credible as your work actually is.",
    });
  }

  if (scores.messaging < 14) {
    recs.push({
      title: "Codify Your Messaging System",
      detail:
        "Inconsistent messaging is creating a compounding trust deficit across channels. Define 3 messaging pillars that anchor every communication, create a one-page messaging cheat sheet for your team, and audit your top 5 touchpoints to ensure they tell the same story with the same confidence.",
    });
  }

  if (scores.conversion < 14) {
    recs.push({
      title: "Eliminate Conversion Friction",
      detail:
        "Interest is being generated but lost before it becomes revenue. Map the 3-step path from first visit to first conversion, ensure every page has one clear primary CTA, and build a basic lead capture system — the gap between your traffic and your revenue is a solvable structural problem.",
    });
  }

  return recs;
}
