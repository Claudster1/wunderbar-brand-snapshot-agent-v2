// src/lib/prompts/blueprint/conversion.prompts.ts

import type { BlueprintPromptPack } from "../types";

export const conversionPromptPack: BlueprintPromptPack = {
  pillar: "Conversion",
  description:
    "Aligns messaging, structure, and intent to drive confident action.",
  prompts: [
    {
      id: "conv-path",
      title: "Conversion Path Mapping",
      purpose: "Remove friction from decision-making",
      prompt: `
Map the ideal conversion journey for this brand.

Define:
• Entry point
• Decision moment
• Action trigger

Identify where clarity drops and how to fix it.
      `.trim(),
    },
    {
      id: "conv-cta",
      title: "CTA Language Optimization",
      purpose: "Make next steps obvious",
      prompt: `
Rewrite this brand’s primary CTA using:
• Clear outcome
• Reduced pressure
• Confidence-building language

Provide 3 variations with different tones.
      `.trim(),
    },
  ],
};
