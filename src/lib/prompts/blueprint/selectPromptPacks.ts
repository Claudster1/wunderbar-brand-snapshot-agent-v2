// src/lib/prompts/blueprint/selectPromptPacks.ts
// Utility function to resolve blueprint prompt packs based on context

import { getPromptPacksForContext } from './getPromptPacks';
import type { Pillar, Archetype, BrandStage as PromptPackStage } from './promptPacks';
import type { BrandStage as SnapshotStage, ArchetypeKey } from '@/src/lib/pillars/types';
import type { PillarKey } from '@/src/lib/pillars/pillarCopy';

// Re-export for convenience
export { getPromptPacksForContext };

/**
 * Map snapshot stage to prompt pack stage
 */
function mapStage(stage: SnapshotStage): PromptPackStage {
  const stageMap: Record<SnapshotStage, PromptPackStage> = {
    early: 'early',
    growing: 'scaling', // Map "growing" to "scaling" for prompt packs
    scaling: 'scaling',
  };
  return stageMap[stage] || 'scaling';
}

/**
 * Map snapshot archetype to prompt pack archetype
 * Note: "Builder" maps to "Creator" as they're similar
 */
function mapArchetype(archetype: ArchetypeKey): Archetype {
  const archetypeMap: Record<ArchetypeKey, Archetype> = {
    Visionary: 'Visionary',
    Guide: 'Guide',
    Authority: 'Authority',
    Builder: 'Creator', // Map "Builder" to "Creator"
    Challenger: 'Challenger',
  };
  return archetypeMap[archetype] || 'Visionary';
}

/**
 * Type guard to check if value is a SnapshotStage
 */
function isSnapshotStage(stage: any): stage is SnapshotStage {
  return ['early', 'growing', 'scaling'].includes(stage);
}

/**
 * Type guard to check if value is an ArchetypeKey
 */
function isArchetypeKey(archetype: any): archetype is ArchetypeKey {
  return ['Visionary', 'Guide', 'Authority', 'Builder', 'Challenger'].includes(archetype);
}

/**
 * Resolve blueprint prompt packs from snapshot data
 * Handles type conversion between snapshot types and prompt pack types
 */
export function resolveBlueprintPromptPacks({
  primaryPillar,
  archetype,
  stage,
  level,
}: {
  primaryPillar: PillarKey | Pillar;
  archetype: ArchetypeKey | Archetype;
  stage: SnapshotStage | PromptPackStage;
  level: 'blueprint' | 'blueprint_plus';
}) {
  // Convert types if needed
  const promptPackPillar = primaryPillar as Pillar;
  const promptPackArchetype = isArchetypeKey(archetype)
    ? mapArchetype(archetype)
    : (archetype as Archetype);
  const promptPackStage = isSnapshotStage(stage)
    ? mapStage(stage)
    : (stage as PromptPackStage);

  return getPromptPacksForContext({
    pillar: promptPackPillar,
    archetype: promptPackArchetype,
    stage: promptPackStage,
    level,
  });
}
