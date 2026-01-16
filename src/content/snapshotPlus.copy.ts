// src/content/snapshotPlus.copy.ts
// Copy for Brand Snapshot+™ ($149)

export const snapshotPlusCopy = {
  hero: {
    title: "Brand Snapshot+™",
    subtitle: "Turn insight into focused brand momentum",
    intro:
      "Brand Snapshot+™ expands your diagnostic into a personalized strategic report — translating scores into clarity, priorities, and actionable direction.",
    // Personalized intro with role phrase support
    introWithRole: (rolePhrase: string) =>
      `Brand Snapshot+™ builds directly on your results, translating them into clear priorities designed to support you in ${rolePhrase} — not abstract brand theory.`,
  },

  value: [
    "Deeper interpretation of your Brand Alignment Score™",
    "Clear explanation of why your primary pillar matters most",
    "Context-aware insights based on your stage and inputs",
    "Prioritized recommendations you can act on immediately",
  ],

  pillarsExpanded: {
    description:
      "Each pillar includes a tailored breakdown, what's working, what's limiting progress, and how to strengthen it — starting with your highest-impact pillar.",
  },

  aeo: {
    headline: "Visibility built for modern discovery",
    description:
      "Snapshot+™ includes Answer Engine Optimization (AEO) guidance to help your brand show up accurately in AI-driven search and recommendation environments.",
  },

  outcome: {
    headline: "The result",
    bullets: [
      "Sharper brand clarity",
      "Reduced guesswork",
      "A focused path forward",
      "Confidence in what to fix — and what not to touch",
    ],
  },

  pricing: {
    label: "Brand Snapshot+™",
    price: "$149",
    note: "One-time purchase. Credits apply toward Blueprint™.",
  },

  cta: {
    primary: "See how to strengthen what matters most right now",
    secondary: "Get my personalized brand report",
    // Personalized CTA with business name
    getPlan: (businessName: string) => `Get your Snapshot+™ plan for ${businessName}`,
  },
};
