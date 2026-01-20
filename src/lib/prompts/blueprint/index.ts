// src/lib/prompts/blueprint/index.ts

export { positioningPromptPack } from "./positioning.prompts";
export { messagingPromptPack } from "./messaging.prompts";
export { visibilityPromptPack } from "./visibility.prompts";
export { credibilityPromptPack } from "./credibility.prompts";
export { conversionPromptPack } from "./conversion.prompts";
export { blueprintPlusAdvancedPrompts } from "./blueprintPlus.prompts";

export const blueprintPromptPacks = [
  positioningPromptPack,
  messagingPromptPack,
  visibilityPromptPack,
  credibilityPromptPack,
  conversionPromptPack,
];

// Flattened prompt pack structure
export {
  BLUEPRINT_PROMPT_PACKS,
  type PromptPack,
  type BrandStage,
  type Archetype,
  type Pillar,
} from "./promptPacks";

// Utility functions
export { getPromptPacksForContext } from "./getPromptPacks";
export { formatPromptsForExport } from "./formatPrompts";
export { resolveBlueprintPromptPacks, getPromptPacksForContext } from "./selectPromptPacks";
