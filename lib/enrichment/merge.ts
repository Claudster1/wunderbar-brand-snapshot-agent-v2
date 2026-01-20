import { BlueprintEnrichmentInput } from "@/lib/enrichment/types";
import { calculateEnrichmentCoverage } from "@/lib/enrichment/enrichmentCoverage";

export type BrandStage = "early" | "scaling" | "established";

export function detectBrandStage(input: {
  website?: string;
  marketingChannels?: string[];
  hasBrandGuidelines?: boolean;
}): BrandStage {
  if (input.hasBrandGuidelines && input.marketingChannels?.length) {
    return "established";
  }
  if (input.website || input.marketingChannels?.length) {
    return "scaling";
  }
  return "early";
}

export function applyEnrichmentToInsights<T extends object>(
  baseInsights: T,
  enrichment?: BlueprintEnrichmentInput
): T & { enrichmentCoverage: ReturnType<typeof calculateEnrichmentCoverage> } {
  return {
    ...baseInsights,
    enrichmentCoverage: calculateEnrichmentCoverage(enrichment),
  };
}
