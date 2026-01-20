// src/lib/prompts/blueprint/selectPromptPacks.ts
// Utility function to resolve blueprint prompt packs based on context

import { getPromptPacksForContext } from './getPromptPacks';
import type { PillarKey } from '@/src/lib/pillars/pillarCopy';

// Re-export for convenience
export { getPromptPacksForContext };

/**
 * Resolve blueprint prompt packs from snapshot data
 */
export function resolveBlueprintPromptPacks({
  primaryPillar,
}: {
  primaryPillar: PillarKey | string;
}) {
  return getPromptPacksForContext({
    pillar: primaryPillar as string,
  });
}
