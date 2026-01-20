import type { BlueprintPrompt, BlueprintPromptPack } from "../blueprint/promptPacks";

export type BlueprintPlusPromptPack = {
  pillar: string;
  expansionType: "Audience" | "Campaign" | "Channel";
  description: string;
  prompts: BlueprintPrompt[];
};
