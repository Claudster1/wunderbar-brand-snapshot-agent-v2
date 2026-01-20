// src/lib/prompts/blueprint/getPromptPacks.ts
// Utility function to filter prompt packs based on context

import { BLUEPRINT_PROMPT_PACKS } from './promptPacks';
export function getPromptPacksForContext({
  pillar,
}: {
  pillar: string;
}) {
  return BLUEPRINT_PROMPT_PACKS.filter(
    (pack) => pack.pillar.toLowerCase() === pillar.toLowerCase()
  );
}
