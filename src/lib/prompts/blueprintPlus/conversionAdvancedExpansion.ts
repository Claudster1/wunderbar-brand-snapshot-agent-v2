import type { BlueprintPlusPromptPack } from "./types";

export const conversionAdvancedExpansion: BlueprintPlusPromptPack = {
  pillar: "Conversion",
  expansionType: "Campaign",
  description: "Optimizes conversion without pressure or gimmicks.",
  prompts: [
    {
      id: "conv-funnel-align",
      title: "Funnel Alignment Check",
      purpose: "Ensure clarity at every stage",
      prompt: `
Review the full conversion funnel.

For each stage:
• What the customer should feel
• What clarity they need
• What stops them from moving forward

Recommend fixes that reduce friction, not add urgency.
      `.trim(),
    },
  ],
};
