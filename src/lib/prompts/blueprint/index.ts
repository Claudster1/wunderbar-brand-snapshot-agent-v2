// src/lib/prompts/blueprint/index.ts

import { positioningPromptPack } from "./positioning.prompts";
import { messagingPromptPack } from "./messaging.prompts";
import { visibilityPromptPack } from "./visibility.prompts";
import { credibilityPromptPack } from "./credibility.prompts";
import { conversionPromptPack } from "./conversion.prompts";

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
} from "./promptPacks";

// Utility functions
export { formatPromptsForExport } from "./formatPrompts";
export { resolveBlueprintPromptPacks, getPromptPacksForContext } from "./selectPromptPacks";
