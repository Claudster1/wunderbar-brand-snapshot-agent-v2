import { pillarPromptPacks } from "./blueprintPromptPacks";
import { blueprintPlusPromptPacks } from "./blueprintPlusPromptPacks";

export function getPromptPack(pillar: string, isPlus: boolean) {
  return isPlus
    ? [
        ...pillarPromptPacks[pillar],
        ...blueprintPlusPromptPacks[pillar],
      ]
    : pillarPromptPacks[pillar];
}
