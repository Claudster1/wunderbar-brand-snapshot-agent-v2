// src/lib/prompts/blueprint/getPromptPacks.ts
// Utility function to filter prompt packs based on context

import { BLUEPRINT_PROMPT_PACKS } from './promptPacks';
import type { Pillar, Archetype, BrandStage } from './promptPacks';

export function getPromptPacksForContext({
  pillar,
  archetype,
  stage,
  level,
}: {
  pillar: Pillar;
  archetype: Archetype;
  stage: BrandStage;
  level: 'blueprint' | 'blueprint_plus';
}) {
  return BLUEPRINT_PROMPT_PACKS.filter(
    (pack) =>
      pack.pillar === pillar &&
      pack.level === level &&
      pack.archetypes.includes(archetype) &&
      pack.stages.includes(stage)
  );
}
