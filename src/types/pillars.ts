// src/types/pillars.ts
// Pillar type definitions

export type PillarKey =
  | "positioning"
  | "messaging"
  | "visibility"
  | "credibility"
  | "conversion";

export interface PillarPriority {
  primaryPillar: PillarKey;
  secondaryPillars: PillarKey[];
  tertiaryPillars: PillarKey[];
}

export interface PillarInsight {
  summary: string;
  whyItMatters: string;
  currentState: string;
  risksIfUnaddressed: string;
}

export type PillarInsights = Record<PillarKey, PillarInsight>;

export interface PillarRecommendation {
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface PillarRecommendationsData {
  priority: 'primary' | 'secondary' | 'tertiary';
  recommendations: PillarRecommendation[];
}

export type PillarRecommendations = Record<PillarKey, PillarRecommendationsData>;

export interface UIHints {
  autoExpandPillar: PillarKey;
  collapsedPillars: PillarKey[];
  showPrimaryBadge: boolean;
}
