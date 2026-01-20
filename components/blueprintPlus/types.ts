export type BlueprintEnrichmentInput = {
  primaryOffer?: string;
  primaryAudience?: string;
  secondaryAudience?: string;
  admiredCompetitor?: string;
  avoidedCompetitor?: string;
  artifactUrls?: string[];
};

export type EnrichmentCoverage = {
  percent: number;
  present: string[];
  missing: string[];
};
