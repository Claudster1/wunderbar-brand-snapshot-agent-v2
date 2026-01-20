// src/lib/prompts/blueprint/positioning.prompts.ts

import type { BlueprintPromptPack } from "../types";

export const positioningPromptPack: BlueprintPromptPack = {
  pillar: "Positioning",
  description:
    "Clarifies what your brand stands for, who it’s for, and why it wins — in language you can actually use.",
  prompts: [
    {
      id: "pos-core",
      title: "Core Positioning Statement",
      purpose: "Define a clear, defensible positioning foundation",
      prompt: `
You are a senior brand strategist.

Using the following context:
- Business overview
- Target audience
- Competitive landscape
- Primary customer problem

Create a concise positioning statement that clearly answers:
• Who this brand is for
• What problem it solves
• Why it’s meaningfully different

Avoid generic language. If this could apply to a competitor, rewrite it.

Output:
1. One-sentence positioning statement
2. One paragraph explaining why this position is defensible
      `.trim(),
    },
    {
      id: "pos-market",
      title: "Market Category Framing",
      purpose: "Clarify how the brand should be mentally categorized",
      prompt: `
Based on the brand’s positioning, determine the most effective market category framing.

Answer:
• Should the brand lead, reframe, or niche-down its category?
• What mental shortcut should customers use to understand this brand?

Provide:
1. Recommended category framing
2. One-sentence explanation customers would intuitively grasp
      `.trim(),
    },
    {
      id: "pos-contrast",
      title: "Competitive Contrast Map",
      purpose: "Make differentiation obvious, not implied",
      prompt: `
Create a contrast-based comparison between this brand and its closest competitors.

For each competitor:
• Identify one strength they emphasize
• Explain how this brand intentionally differs

Output in plain language, not tables.
Focus on strategic contrast, not feature lists.
      `.trim(),
    },
  ],
};
