// src/lib/prompts/blueprint/positioning.prompts.ts

import type { PillarPromptPack } from "../types";

export const positioningPromptPack: PillarPromptPack = {
  pillar: "Positioning",
  description:
    "Clarifies what the brand stands for, who it serves, and why it wins — without overcomplicating or over-narrowing.",
  archetypes: {
    Explorer: {
      early: [
        {
          id: "pos-exp-early-1",
          title: "Core Position Clarity",
          intent: "Establish a clear position without boxing the brand in too early",
          prompt: `You are a senior brand strategist helping an early-stage Explorer brand.
Clarify the brand's core positioning by defining:
- Who the brand is for
- The core problem it helps solve
- What makes its approach distinct
Avoid over-specialization. Keep flexibility while creating clarity.`,
        },
      ],
      scaling: [
        {
          id: "pos-exp-scale-1",
          title: "Differentiated Expansion",
          intent: "Refine positioning while expanding market reach",
          prompt: `Act as a brand consultant for a scaling Explorer brand.
Refine the brand's positioning to emphasize differentiation while supporting growth.
Identify:
- Primary audience segments
- Distinct value signals
- What must remain consistent as the brand expands`,
        },
      ],
      growth: [
        {
          id: "pos-exp-growth-1",
          title: "Category Leadership Positioning",
          intent: "Anchor the brand as a category leader without losing its edge",
          prompt: `You are advising a mature Explorer brand.
Reposition the brand as a category leader while preserving innovation and curiosity.
Define:
- Category ownership
- Strategic boundaries
- Long-term positioning narrative`,
        },
      ],
    },
    Sage: {
      early: [
        {
          id: "pos-sage-early-1",
          title: "Authority Foundation",
          intent: "Establish credibility without sounding academic",
          prompt: `Help an early-stage Sage brand define its positioning.
Focus on:
- Expertise without arrogance
- Clear value of insight
- Who benefits most from this knowledge`,
        },
      ],
      scaling: [
        {
          id: "pos-sage-scale-1",
          title: "Trusted Advisor Position",
          intent: "Strengthen authority as demand grows",
          prompt: `Refine positioning for a scaling Sage brand.
Emphasize trust, clarity, and guidance.
Define how the brand differentiates from louder, less credible competitors.`,
        },
      ],
      growth: [
        {
          id: "pos-sage-growth-1",
          title: "Institutional Authority",
          intent: "Codify leadership and long-term trust",
          prompt: `Position a growth-stage Sage brand as a definitive authority.
Clarify:
- Institutional credibility
- Thought leadership ownership
- Strategic influence`,
        },
      ],
    },
    Hero: { early: [], scaling: [], growth: [] },
    Caregiver: { early: [], scaling: [], growth: [] },
    Creator: { early: [], scaling: [], growth: [] },
    Ruler: { early: [], scaling: [], growth: [] },
    Magician: { early: [], scaling: [], growth: [] },
    Everyperson: { early: [], scaling: [], growth: [] },
  },
};
