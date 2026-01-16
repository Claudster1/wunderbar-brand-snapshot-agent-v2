// src/lib/prompts/blueprint/visibility.prompts.ts

import type { PillarPromptPack } from "../types";

export const visibilityPromptPack: PillarPromptPack = {
  pillar: "Visibility",
  description:
    "Improves discoverability across search engines, AI answer engines, and social platforms.",
  archetypes: {
    Explorer: {
      early: [
        {
          id: "vis-exp-early-1",
          title: "Baseline Discoverability",
          intent: "Ensure the brand can be found where prospects look",
          prompt: `Create a visibility strategy for an early-stage Explorer brand.
Include:
- SEO basics
- Social presence alignment
- Introductory AEO (Answer Engine Optimization) signals`,
        },
      ],
      scaling: [
        {
          id: "vis-exp-scale-1",
          title: "AI-First Visibility",
          intent: "Optimize for search and AI assistants",
          prompt: `Develop a visibility strategy for a scaling Explorer brand.
Focus on:
- SEO + AEO alignment
- Structured content
- Authority signals for AI tools like ChatGPT and Perplexity`,
        },
      ],
      growth: [
        {
          id: "vis-exp-growth-1",
          title: "Category-Level Visibility",
          intent: "Dominate visibility across platforms",
          prompt: `Design an advanced visibility system for a growth-stage Explorer brand.
Ensure the brand is referenced, cited, and recommended across search, AI, and media.`,
        },
      ],
    },
    Sage: { early: [], scaling: [], growth: [] },
    Hero: { early: [], scaling: [], growth: [] },
    Caregiver: { early: [], scaling: [], growth: [] },
    Creator: { early: [], scaling: [], growth: [] },
    Ruler: { early: [], scaling: [], growth: [] },
    Magician: { early: [], scaling: [], growth: [] },
    Everyperson: { early: [], scaling: [], growth: [] },
  },
};
