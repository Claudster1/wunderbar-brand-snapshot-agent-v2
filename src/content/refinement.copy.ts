// src/content/refinement.copy.ts
// Refinement request copy and configuration

export const refinementCopy = {
  headline: "Refine a Key Insight",
  description:
    "If you'd like to deepen one specific area, you can provide additional context and regenerate that pillar with more precision.",
  allowedPillars: [
    "Positioning",
    "Messaging",
    "Visibility",
    "Credibility",
    "Conversion",
  ],
};

export const refinementTiers = {
  single: {
    price: 49,
    description: "Focused refinement for one pillar"
  },
  full: {
    price: 149,
    description: "Re-evaluate all pillars with added context"
  }
};
