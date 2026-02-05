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

// Backward-friendly name used by route templates.
// Pass through foundation + Blueprint content when provided (merged lower-tier data).
export function buildBlueprintPlus(data: any) {
  const base: Record<string, unknown> = {
    userName: data.userName,

    brandStory: data.brandStory ?? {
      short: data.brandStoryShort,
      long: data.brandStoryLong,
    },

    positioning: data.positioning ?? {
      statement: data.positioningStatement,
      differentiators: data.differentiators ?? [],
    },

    journey: data.journey ?? data.customerJourney ?? [],
    contentRoadmap: data.contentRoadmap ?? [],
    visualDirection: data.visualDirection ?? [],
    personality: data.personality,
    decisionFilters: data.decisionFilters ?? [],
    aiPrompts: data.aiPrompts ?? [],
    additionalSections: data.additionalSections ?? [],
  };

  // Foundation (Snapshot/Snapshot+)
  if (typeof data.brandAlignmentScore === "number") base.brandAlignmentScore = data.brandAlignmentScore;
  if (data.pillarScores && typeof data.pillarScores.positioning === "number") base.pillarScores = data.pillarScores;
  if (data.pillarInsights && typeof data.pillarInsights === "object") base.pillarInsights = data.pillarInsights;
  if (data.recommendations && typeof data.recommendations === "object") base.recommendations = data.recommendations;
  if (data.primaryPillar != null) base.primaryPillar = data.primaryPillar;
  if (typeof data.contextCoverage === "number") base.contextCoverage = data.contextCoverage;

  // Blueprint content
  if (data.brandEssence != null) base.brandEssence = data.brandEssence;
  if (data.brandPromise != null) base.brandPromise = data.brandPromise;
  if (data.differentiation != null) base.differentiation = data.differentiation;
  if (data.persona != null) base.persona = data.persona;
  if (data.archetype != null) base.archetype = data.archetype;
  if (Array.isArray(data.toneOfVoice)) base.toneOfVoice = data.toneOfVoice;
  if (Array.isArray(data.messagingPillars)) base.messagingPillars = data.messagingPillars;
  if (Array.isArray(data.colorPalette)) base.colorPalette = data.colorPalette;
  if (Array.isArray(data.aiPrompts)) base.aiPrompts = data.aiPrompts;

  return base;
}


