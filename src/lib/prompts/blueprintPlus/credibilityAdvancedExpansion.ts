import type { BlueprintPlusPromptPack } from "./types";

export const credibilityAdvancedExpansion: BlueprintPlusPromptPack = {
  pillar: "Credibility",
  expansionType: "Channel",
  description: "Strengthens trust as brand surfaces multiply.",
  prompts: [
    {
      id: "cred-proof-map",
      title: "Proof Placement Strategy",
      purpose: "Use proof intentionally",
      prompt: `
Map where credibility proof should appear across brand surfaces.

Define:
• What proof belongs where
• What feels forced
• What builds trust quietly

Avoid overuse.
      `.trim(),
    },
  ],
};
