// src/lib/prompts/blueprint/messaging.prompts.ts

import type { PillarPromptPack } from "../types";

export const messagingPromptPack: PillarPromptPack = {
  pillar: "Messaging",
  description:
    "Translates positioning into clear, consistent language that resonates across channels.",
  archetypes: {
    Explorer: {
      early: [
        {
          id: "msg-exp-early-1",
          title: "Clear, Flexible Messaging",
          intent: "Create simple messaging that evolves with the brand",
          prompt: `Develop messaging for an early-stage Explorer brand.
Ensure language is:
- Clear, not vague
- Inspiring without hype
- Flexible enough to evolve`,
        },
      ],
      scaling: [
        {
          id: "msg-exp-scale-1",
          title: "Message Consistency at Scale",
          intent: "Maintain clarity across growing channels",
          prompt: `Refine messaging for a scaling Explorer brand.
Define:
- Core message pillars
- Language that scales
- Messaging guardrails`,
        },
      ],
      growth: [
        {
          id: "msg-exp-growth-1",
          title: "Signature Voice System",
          intent: "Codify a recognizable brand voice",
          prompt: `Create a messaging system for a growth-stage Explorer brand.
Ensure consistency, tone ownership, and long-term recognizability.`,
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
