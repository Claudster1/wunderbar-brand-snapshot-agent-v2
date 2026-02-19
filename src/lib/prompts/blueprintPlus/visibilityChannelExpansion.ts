import type { BlueprintPlusPromptPack } from "./types";

export const visibilityChannelExpansion: BlueprintPlusPromptPack = {
  pillar: "Visibility",
  expansionType: "Channel",
  description:
    "Tailors brand visibility for each channel without losing coherence.",
  prompts: [
    {
      id: "vis-channel-map",
      title: "Channel Role Definition",
      purpose: "Clarify what each channel is for",
      prompt: `
Define the strategic role of each channel below:

• Website
• Blog
• AI answers (AEO)
• LinkedIn
• Instagram (if applicable)

For each:
• Primary job
• Content style
• What NOT to do there
      `.trim(),
    },
    {
      id: "vis-aeo-expand",
      title: "AEO Authority Expansion",
      purpose: "Increase AI citation likelihood",
      prompt: `
Expand the brand’s AEO strategy.

Output:
• Questions AI should answer using this brand
• Ideal answer structures
• Authority signals to emphasize

Assume AI assistants are the audience.
      `.trim(),
    },
  ],
};
