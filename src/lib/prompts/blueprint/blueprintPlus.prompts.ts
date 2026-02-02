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
      established: [
        {
          id: "bpplus-exp-established-1",
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

    Sage: { early: [], scaling: [], established: [] },
    Hero: { early: [], scaling: [], established: [] },
    Caregiver: { early: [], scaling: [], established: [] },
    Creator: { early: [], scaling: [], established: [] },
    Ruler: { early: [], scaling: [], established: [] },
    Magician: { early: [], scaling: [], established: [] },
    Everyperson: { early: [], scaling: [], established: [] },
  },
};
