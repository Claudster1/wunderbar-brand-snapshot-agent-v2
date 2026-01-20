export type BlueprintPlusPrompt = {
  title: string;
  prompt: string;
};

export type BlueprintPlusPromptPackMap = Record<string, BlueprintPlusPrompt[]>;
export type BlueprintPlusPromptPack = {
  id: string;
  pillar: string;
  title: string;
  prompts: BlueprintPlusPrompt[];
};

export const blueprintPlusPromptPacks: BlueprintPlusPromptPackMap = {
  positioning: [
    {
      title: "Category Ownership Strategy",
      prompt:
        "Define how this brand can own a specific category or subcategory in the market.",
    },
    {
      title: "Competitive Differentiation Matrix",
      prompt:
        "Create a differentiation map comparing this brand against key competitors.",
    },
  ],

  messaging: [
    {
      title: "Audience-Specific Message Variants",
      prompt:
        "Generate message variations tailored to different buyer personas.",
    },
  ],

  visibility: [
    {
      title: "AI Search Authority Expansion",
      prompt: "Design an AEO strategy that increases citation by AI assistants.",
    },
  ],

  credibility: [
    {
      title: "Thought Leadership Positioning",
      prompt: "Outline a thought leadership strategy that builds long-term trust.",
    },
  ],

  conversion: [
    {
      title: "Multi-Step Conversion System",
      prompt: "Design a conversion ecosystem beyond a single CTA.",
    },
  ],
};

export type AdvancedPromptPack = {
  pillar: string;
  title: string;
  prompts: string[];
};

const titleize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const BLUEPRINT_PLUS_PROMPT_PACKS: AdvancedPromptPack[] = Object.entries(
  blueprintPlusPromptPacks
).map(([pillar, prompts]) => ({
  pillar: titleize(pillar),
  title: `${titleize(pillar)} Expansion`,
  prompts: prompts.map((prompt) => prompt.prompt),
}));

export const BLUEPRINT_PLUS_PROMPT_PACKS_DETAILED: BlueprintPlusPromptPack[] =
  Object.entries(blueprintPlusPromptPacks).map(([pillar, prompts]) => ({
    id: pillar,
    pillar: titleize(pillar),
    title: `${titleize(pillar)} Expansion`,
    prompts,
  }));
