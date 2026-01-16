// lib/blueprintPrompts.ts
// Blueprint prompt packs for activation

export const blueprintPromptPacks: Record<
  string,
  { title: string; prompts: string[] }
> = {
  positioning: {
    title: "Positioning Activation Prompts",
    prompts: [
      "Define our core positioning in one sentence for a first-time visitor.",
      "Describe what differentiates us from competitors in plain language.",
      "Write a positioning statement for sales conversations.",
    ],
  },
  messaging: {
    title: "Messaging Activation Prompts",
    prompts: [
      "Rewrite our homepage headline for clarity and confidence.",
      "Create a short brand elevator pitch.",
    ],
  },
  visibility: {
    title: "Visibility Activation Prompts",
    prompts: [
      "Generate AEO-ready FAQ content that answers common questions about our business.",
      "Structure a pillar page for AI discovery that covers our core offering.",
    ],
  },
  credibility: {
    title: "Credibility Activation Prompts",
    prompts: [
      "Generate trust signals and proof points that reinforce our credibility.",
      "Create a testimonials framework that highlights customer success stories.",
    ],
  },
  conversion: {
    title: "Conversion Activation Prompts",
    prompts: [
      "Develop clear calls-to-action that guide visitors to the next step.",
      "Create a conversion-focused landing page structure.",
    ],
  },
};
