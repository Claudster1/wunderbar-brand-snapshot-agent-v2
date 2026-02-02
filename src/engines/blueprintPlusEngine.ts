// src/engines/blueprintPlusEngine.ts
// Blueprint+™ engine placeholder.

import { BlueprintEnrichmentInput } from "@/lib/enrichment/types";
import { detectBrandStage, applyEnrichmentToInsights } from "@/lib/enrichment/merge";

export type BlueprintPlusInput = Record<string, any>;
export type BlueprintPlusResult = Record<string, any>;

export type SnapshotStageInput = {
  website?: string;
  marketingChannels?: string[];
  hasBrandGuidelines?: boolean;
};

export function generateBlueprintPlusReport(
  input: BlueprintPlusInput
): BlueprintPlusResult {
  return { ...input };
}

export function buildEnrichedBlueprintInsights<T extends object>({
  snapshotInput,
  baseInsights,
  blueprintEnrichment,
}: {
  snapshotInput: SnapshotStageInput;
  baseInsights: T;
  blueprintEnrichment?: BlueprintEnrichmentInput;
}): {
  stage: ReturnType<typeof detectBrandStage>;
  enrichedInsights: T & {
    enrichmentCoverage: ReturnType<typeof applyEnrichmentToInsights<T>>["enrichmentCoverage"];
  };
} {
  const stage = detectBrandStage(snapshotInput);

  const enrichedInsights = applyEnrichmentToInsights(
    baseInsights,
    blueprintEnrichment
  );

  return {
    stage,
    enrichedInsights: enrichedInsights as T & {
      enrichmentCoverage: ReturnType<typeof applyEnrichmentToInsights<T>>["enrichmentCoverage"];
    },
  };
}

// Backward-friendly name used by route templates
export function buildBlueprintPlus(data: any) {
  return {
    userName: data.userName,

    brandStory: {
      short: data.brandStoryShort,
      long: data.brandStoryLong,
    },

    positioning: {
      statement: data.positioningStatement,
      differentiators: data.differentiators,
    },

    journey: data.customerJourney,

    contentRoadmap: data.contentRoadmap,

    visualDirection: data.visualDirection,

    personality: data.personality,

    decisionFilters: data.decisionFilters,

    aiPrompts: data.aiPrompts,

    additionalSections: data.additionalSections || [],
  };
}


