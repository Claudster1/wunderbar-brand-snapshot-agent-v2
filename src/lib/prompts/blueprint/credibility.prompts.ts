// src/lib/prompts/blueprint/credibility.prompts.ts

import type { BlueprintPromptPack } from "../types";

export const credibilityPromptPack: BlueprintPromptPack = {
  pillar: "Credibility",
  description:
    "Builds trust through consistency, proof, and professional presence.",
  prompts: [
    {
      id: "cred-signals",
      title: "Trust Signal Audit",
      purpose: "Identify credibility gaps",
      prompt: `
Audit the brand for credibility signals.

Evaluate:
• Visual consistency
• Language confidence
• Proof elements (social proof, authority)

List:
1. Signals that are strong
2. Signals that are missing
3. Priority fixes
      `.trim(),
    },
    {
      id: "cred-voice",
      title: "Voice Alignment Check",
      purpose: "Ensure brand sounds intentional",
      prompt: `
Assess whether the brand’s tone reinforces trust.

Output:
• 3 tone attributes to emphasize
• 3 to avoid
• Example rewrite of a weak sentence into a credible one
      `.trim(),
    },
  ],
};
