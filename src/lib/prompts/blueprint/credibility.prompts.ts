// src/lib/prompts/blueprint/credibility.prompts.ts

import type { PillarPromptPack } from "../types";

export const credibilityPromptPack: PillarPromptPack = {
  pillar: "Credibility",
  description:
    "Builds trust through consistency, proof, and professional signals.",
  archetypes: {
    Explorer: {
      early: [
        {
          id: "cred-exp-early-1",
          title: "Trust Signals",
          intent: "Establish baseline trust quickly",
          prompt: `Identify credibility signals for an early-stage Explorer brand.
Focus on:
- Consistency
- Proof points
- Visual trust markers`,
        },
      ],
      scaling: [
        {
          id: "cred-exp-scale-1",
          title: "Authority Reinforcement",
          intent: "Reinforce trust as reach expands",
          prompt: `Strengthen credibility for a scaling Explorer brand.
Include:
- Case studies
- Testimonials
- Visual consistency`,
        },
      ],
      growth: [
        {
          id: "cred-exp-growth-1",
          title: "Institutional Trust",
          intent: "Codify credibility at scale",
          prompt: `Create a credibility framework for a growth-stage Explorer brand.
Ensure trust is unmistakable across every touchpoint.`,
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
