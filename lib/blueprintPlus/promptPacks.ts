export type BlueprintPlusPrompt = {
  title: string;
  description: string;
  prompt: string;
};

export type BlueprintPlusPromptPack = {
  pillar: string;
  prompts: BlueprintPlusPrompt[];
};

export const blueprintPlusPromptPacks: BlueprintPlusPromptPack[] = [
  {
    pillar: "Positioning",
    prompts: [
      {
        title: "Category Ownership Strategy",
        description: "Clarify the category space this brand can lead.",
        prompt:
          "Define how this brand can own a specific category or subcategory in the market.",
      },
      {
        title: "Competitive Differentiation Matrix",
        description: "Map strategic differentiation against key competitors.",
        prompt:
          "Create a differentiation map comparing this brand against key competitors.",
      },
    ],
  },
  {
    pillar: "Messaging",
    prompts: [
      {
        title: "Audience-Specific Message Variants",
        description: "Adapt the core message for distinct buyer personas.",
        prompt:
          "Generate message variations tailored to different buyer personas.",
      },
    ],
  },
  {
    pillar: "Visibility",
    prompts: [
      {
        title: "AI Search Authority Expansion",
        description: "Increase AI discovery and citation readiness.",
        prompt: "Design an AEO strategy that increases citation by AI assistants.",
      },
    ],
  },
  {
    pillar: "Credibility",
    prompts: [
      {
        title: "Thought Leadership Positioning",
        description: "Build authority signals that compound trust over time.",
        prompt:
          "Outline a thought leadership strategy that builds long-term trust.",
      },
    ],
  },
  {
    pillar: "Conversion",
    prompts: [
      {
        title: "Multi-Step Conversion System",
        description: "Design a conversion path beyond a single CTA.",
        prompt: "Design a conversion ecosystem beyond a single CTA.",
      },
    ],
  },
];
