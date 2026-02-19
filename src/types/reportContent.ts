/**
 * Canonical report content types per tier.
 * Report view and PDF for each tier should consume the same shape.
 * Product name only: body copy does not reference lower-tier product names.
 */

/** Pillar score set (0–20 each). */
export interface PillarScores {
  positioning: number;
  messaging: number;
  visibility: number;
  credibility: number;
  conversion: number;
}

/** Pillar insights and recommendations (string per pillar). */
export type PillarStrings = Record<keyof PillarScores, string>;

/** Color palette item: swatch + hex# in report/PDF. */
export interface ColorPaletteItem {
  name: string;
  hex: string;
  role?: string;
  meaning?: string;
}

/** Brand persona: summary or full description. */
export type PersonaContent = string | { summary?: string; description?: string };

/** Brand archetype: name + summary. */
export type ArchetypeContent = string | { name?: string; summary?: string; description?: string };

/** Brand voice: summary and optional tone pillars. */
export interface VoiceContent {
  summary?: string;
  description?: string;
  pillars?: string[];
}

// ---------------------------------------------------------------------------
// Tier 1: WunderBrand Snapshot™
// ---------------------------------------------------------------------------

export interface BrandSnapshotReportContent {
  userName: string;
  businessName: string;
  industry?: string;
  website?: string | null;
  socials?: string[];
  brandAlignmentScore: number;
  pillarScores: PillarScores;
  pillarInsights: PillarStrings;
  recommendations: PillarStrings;
}

// ---------------------------------------------------------------------------
// Tier 2: WunderBrand Snapshot+™ (extends Snapshot)
// ---------------------------------------------------------------------------

export interface AeoRecommendations {
  keywordClarity?: string;
  messagingStructure?: string;
  visualOptimization?: string;
  performanceHeuristics?: string;
  prioritizationMatrix?: string;
  practicalActions?: string[];
  industryGuidance?: string;
}

export interface ValuePropositionStatement {
  statement: string;
  whereToUseIt: string;
  whyThisWorks: string;
}

export interface VoiceToneGuide {
  voiceSummary: string;
  voiceTraits: { trait: string; whatItMeans: string; example: string }[];
  toneVariations: {
    websiteAndMarketing: string;
    socialMedia: string;
    emailAndSales: string;
  };
  phrasesToUse: string[];
  phrasesToAvoid: string[];
  aiPromptInstruction: string;
}

export interface BrandSnapshotPlusReportContent extends BrandSnapshotReportContent {
  primaryPillar?: keyof PillarScores;
  contextCoverage?: number;
  persona?: PersonaContent;
  archetype?: ArchetypeContent;
  voice?: VoiceContent | string;
  colorPalette?: ColorPaletteItem[];
  brandOpportunities?: string;
  targetCustomers?: string;
  competitorNames?: string[];
  personalityWords?: string[];
  messagingGaps?: string;
  visibilityPlan?: string;
  visualIdentityNotes?: string;
  aeoRecommendations?: AeoRecommendations;
  roadmap_30?: string;
  roadmap_60?: string;
  roadmap_90?: string;
  opportunities_map?: string;
  aiPrompts?: string[] | Array<{ name: string; prompt: string }>;
  valuePropositionStatement?: ValuePropositionStatement;
  voiceToneGuide?: VoiceToneGuide;
}

// ---------------------------------------------------------------------------
// Tier 3: WunderBrand Blueprint™ (extends Snapshot+)
// ---------------------------------------------------------------------------

export interface ToneOfVoiceItem {
  name: string;
  detail: string;
}

export interface MessagingPillarItem {
  title: string;
  detail: string;
}

export interface BrandBlueprintReportContent extends BrandSnapshotPlusReportContent {
  brandEssence?: string;
  brandPromise?: string;
  differentiation?: string;
  persona?: PersonaContent;
  archetype?: ArchetypeContent;
  toneOfVoice?: ToneOfVoiceItem[];
  messagingPillars?: MessagingPillarItem[];
  colorPalette?: ColorPaletteItem[];
  aiPrompts?: Array<{ name: string; prompt: string }>;
}

// ---------------------------------------------------------------------------
// Tier 4: WunderBrand Blueprint+™ (extends Blueprint)
// ---------------------------------------------------------------------------

export interface BrandStoryContent {
  short?: string;
  long?: string;
}

export interface PositioningContent {
  statement?: string;
  differentiators?: Array<{ name: string; detail: string }>;
}

export interface JourneyStageContent {
  stage: string;
  goal: string;
  emotion: string;
  opportunities: string;
}

export interface ContentRoadmapItem {
  month: string;
  theme: string;
  messagingAngles?: string[];
  growthPriorities?: string[];
  aeoStrategies?: string[];
}

export interface VisualDirectionItem {
  category: string;
  description: string;
}

export interface BrandBlueprintPlusReportContent extends BrandBlueprintReportContent {
  brandStory?: BrandStoryContent;
  positioning?: PositioningContent;
  journey?: JourneyStageContent[];
  contentRoadmap?: ContentRoadmapItem[];
  visualDirection?: VisualDirectionItem[];
  personality?: string;
  decisionFilters?: string[];
  aiPrompts?: Array<{ name: string; prompt: string }>;
  additionalSections?: Array<{ title: string; content: string }>;
}
