export const snapshotPlusCopy = {
  hero: {
    title: "WunderBrand Snapshot+\u2122",
    subtitle: "Transform your diagnostic into a strategic brand roadmap",
    intro:
      "WunderBrand Snapshot+\u2122 takes your scores and translates them into a comprehensive strategic report \u2014 with prioritized recommendations, brand persona analysis, voice and tone guidance, a recommended color system, and 8 AI-ready prompts calibrated to your brand.",
    introWithRole: (rolePhrase: string) =>
      `WunderBrand Snapshot+\u2122 builds directly on your diagnostic results, translating them into a prioritized strategic roadmap designed to support you in ${rolePhrase} \u2014 every recommendation is grounded in your specific brand data, not generic advice.`,
  },

  value: [
    "Pillar-by-pillar deep dive with commercial impact analysis and risk-of-inaction framing",
    "Prioritized diagnosis of your primary opportunity with downstream system effects",
    "Brand persona, archetype system, and voice and tone guide with ready-to-use examples",
    "Recommended color palette with hex, RGB, and CMYK codes for immediate design use",
    "30/60/90-day strategic action plan with effort/impact prioritization",
    "8 AI prompts calibrated to your brand for content, messaging, and strategy",
    "Full AEO (Answer Engine Optimization) readiness assessment and recommendations",
    "Value proposition statement ready for your homepage, LinkedIn, and pitch deck",
  ],

  pillarsExpanded: {
    description:
      "Each pillar receives a full strategic analysis: what\u2019s happening, why it matters commercially, how it compares to industry benchmarks, the risk of leaving it unaddressed, and a concrete before-and-after example \u2014 starting with the pillar where improvement creates the most cascading impact.",
  },

  aeo: {
    headline: "Built for the next era of brand discovery",
    description:
      "Snapshot+\u2122 includes a full AEO readiness assessment \u2014 evaluating how your brand performs in AI-powered search environments and providing specific, actionable recommendations to ensure you\u2019re discoverable where buying decisions increasingly begin.",
  },

  outcome: {
    headline: "What changes after Snapshot+\u2122",
    bullets: [
      "A clear diagnosis of where your brand stands and why \u2014 not just scores, but strategic implications",
      "Confidence in which pillar to invest in first, with a concrete action plan to follow",
      "A brand persona and voice system you can hand to any copywriter, designer, or agency",
      "Reduced guesswork \u2014 every recommendation is grounded in your actual brand data",
    ],
  },

  pricing: {
    label: "WunderBrand Snapshot+\u2122",
    price: "$497",
    note: "One-time investment. Credits apply toward Blueprint\u2122.",
  },

  cta: {
    primary: "Get your strategic brand roadmap",
    secondary: "See what\u2019s included in Snapshot+\u2122",
    getPlan: (businessName: string) => `Get ${businessName}\u2019s Snapshot+\u2122 strategy report`,
  },
};
