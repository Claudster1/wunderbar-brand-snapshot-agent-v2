// src/lib/prompts/blueprint/blueprintPlus.prompts.ts

import type { PillarPromptPack } from "../types";

export const blueprintPlusAdvancedPrompts: PillarPromptPack = {
  pillar: "Blueprint+™ Strategic Expansion",
  description:
    "Advanced prompts for campaign-level strategy, long-term planning, and AI-assisted execution.",
  archetypes: {
    Explorer: {
      scaling: [
        {
          id: "bpplus-exp-scale-1",
          title: "Campaign System Design",
          purpose: "Create a scalable campaign system",
          prompt: `Design a multi-channel campaign framework aligned to the brand's positioning.
Include:
- Campaign themes
- Channel roles
- Measurement signals`,
        },
      ],
      growth: [
        {
          id: "bpplus-exp-growth-1",
          title: "Brand Ecosystem Expansion",
          purpose: "Extend the brand across products and audiences",
          prompt: `Design a long-term brand ecosystem.
Include:
- Sub-brand logic
- Product narratives
- Expansion guardrails`,
        },
      ],
      early: [],
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
