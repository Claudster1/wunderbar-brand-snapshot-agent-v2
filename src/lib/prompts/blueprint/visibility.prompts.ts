// src/lib/prompts/blueprint/visibility.prompts.ts

import type { BlueprintPromptPack } from "../types";

export const visibilityPromptPack: BlueprintPromptPack = {
  pillar: "Visibility",
  description:
    "Improves how the brand is found — across search engines, AI answers, and social discovery.",
  prompts: [
    {
      id: "vis-search",
      title: "Search Intent Mapping",
      purpose: "Align content to real discovery paths",
      prompt: `
You are a search strategist.

Identify:
• Top customer questions this brand should be discovered for
• Whether each is better suited for SEO or AEO
• Recommended content format for each

Focus on intent, not keywords alone.
      `.trim(),
    },
    {
      id: "vis-aeo",
      title: "AEO Authority Prompt",
      purpose: "Increase likelihood of AI recommendations",
      prompt: `
Structure content so AI systems (ChatGPT, Perplexity, etc.) can confidently reference this brand.

Output:
• Core brand facts AI should understand
• How to structure answers to be cited
• Trust signals that increase AI confidence

Avoid SEO clichés.
      `.trim(),
    },
    {
      id: "vis-social",
      title: "Social Visibility Strategy",
      purpose: "Clarify where and how to show up",
      prompt: `
Based on the brand’s audience and stage, recommend:
• 1–2 primary social platforms
• Content themes aligned to positioning
• Posting intent (education, authority, trust)

Explain why each choice matters.
      `.trim(),
    },
  ],
};
