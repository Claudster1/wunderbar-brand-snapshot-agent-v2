// src/lib/prompts/blueprint/messaging.prompts.ts

import type { BlueprintPromptPack } from "../types";

export const messagingPromptPack: BlueprintPromptPack = {
  pillar: "Messaging",
  description:
    "Creates consistent language your brand can reuse across pages, campaigns, and content.",
  prompts: [
    {
      id: "msg-core",
      title: "Core Message Architecture",
      purpose: "Establish message hierarchy",
      prompt: `
Act as a brand messaging strategist.

Using the brand’s positioning, create:
• One primary message
• Three supporting messages
• One proof point per message

Ensure:
• Each message has a distinct job
• No overlap or redundancy
• Language is clear, not clever

Output should be directly usable in marketing copy.
      `.trim(),
    },
    {
      id: "msg-homepage",
      title: "Homepage Message Flow",
      purpose: "Apply messaging to a real surface",
      prompt: `
Using the core messaging framework, map messaging to a homepage structure:

• Hero headline
• Subhead
• Value section headers
• CTA framing

Ensure the flow builds clarity progressively, not all at once.
      `.trim(),
    },
    {
      id: "msg-consistency",
      title: "Messaging Consistency Guardrails",
      purpose: "Prevent drift as content scales",
      prompt: `
Define 5 messaging guardrails this brand must follow.

For each:
• What to emphasize
• What to avoid
• Example of correct usage

Write these as internal guidance, not marketing copy.
      `.trim(),
    },
  ],
};
