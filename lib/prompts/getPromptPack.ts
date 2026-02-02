import { pillarPromptPacks } from "./blueprintPromptPacks";
import { blueprintPlusPromptPacks } from "./blueprintPlusPromptPacks";

type PillarKey = keyof typeof pillarPromptPacks;

export function getPromptPack(pillar: string, isPlus: boolean) {
  const key = pillar as PillarKey;
  return isPlus
    ? [
        ...pillarPromptPacks[key],
        ...blueprintPlusPromptPacks[key],
      ]
    : pillarPromptPacks[key];
}
