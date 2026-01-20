import type { BlueprintPlusPromptPack } from "./types";

export const positioningAudienceExpansion: BlueprintPlusPromptPack = {
  pillar: "Positioning",
  expansionType: "Audience",
  description:
    "Adapts your core positioning for different buyer types without losing brand clarity.",
  prompts: [
    {
      id: "pos-aud-translate",
      title: "Positioning Translation by Audience",
      purpose: "Maintain clarity across buyer segments",
      prompt: `
You are a senior brand strategist.

Using the brand’s core positioning, adapt it for each audience segment below
WITHOUT changing the core promise.

For each audience:
• Rewrite the positioning in their language
• Preserve the same strategic meaning
• Avoid dumbing it down

Output:
• Original positioning (unchanged)
• Audience-adapted versions with rationale
      `.trim(),
    },
    {
      id: "pos-aud-risk",
      title: "Audience Confusion Risk Check",
      purpose: "Prevent dilution while scaling",
      prompt: `
Analyze whether adapting positioning for multiple audiences introduces risk.

Answer:
• Where confusion might occur
• Which messages must remain fixed
• Which can flex safely

Be strict. Protect brand integrity.
      `.trim(),
    },
  ],
};
