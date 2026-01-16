// src/lib/prompts/blueprint/conversion.prompts.ts

import type { PillarPromptPack } from "../types";

export const conversionPromptPack: PillarPromptPack = {
  pillar: "Conversion",
  description:
    "Turns clarity and trust into action across key moments.",
  archetypes: {
    Explorer: {
      early: [
        {
          id: "conv-exp-early-1",
          title: "Clear First Actions",
          intent: "Help visitors understand what to do next",
          prompt: `Design conversion flows for an early-stage Explorer brand.
Focus on:
- Clear CTAs
- Low friction
- Confidence-building actions`,
        },
      ],
      scaling: [
        {
          id: "conv-exp-scale-1",
          title: "Optimized Decision Paths",
          intent: "Improve conversion efficiency",
          prompt: `Optimize conversion paths for a scaling Explorer brand.
Clarify:
- Primary actions
- Supporting content
- Reduced friction`,
        },
      ],
      growth: [
        {
          id: "conv-exp-growth-1",
          title: "Systemized Conversion",
          intent: "Create repeatable conversion systems",
          prompt: `Build a scalable conversion system for a growth-stage Explorer brand.
Ensure alignment across channels and stages of the customer journey.`,
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
