// src/types/brandSnapshot.ts
// TypeScript types for WunderBrand Snapshot™ JSON output

export interface ColorPaletteItem {
  name: string;
  hex: string;
  role: string; // "Primary" | "Secondary" | "Accent" | "Neutral"
  meaning: string; // NOT "what it communicates" - use "Meaning"
}

export interface SnapshotPlusOutline {
  page1: string; // Cover
  page2: string; // Executive Summary
  page3: string; // WunderBrand Score™ Deep Dive
  page4: string; // Positioning Deep Dive
  page5: string; // Messaging Deep Dive
  page6: string; // Visibility Deep Dive
  page7: string; // Credibility Deep Dive
  page8: string; // Conversion Deep Dive
  page9: string; // Brand Opportunities Map
  page10: string; // What to Do Next
}

export interface PillarScores {
  positioning: number; // 1-20
  messaging: number; // 1-20
  visibility: number; // 1-20
  credibility: number; // 1-20
  conversion: number; // 1-20
}

export interface PillarInsights {
  positioning: string;
  messaging: string;
  visibility: string;
  credibility: string;
  conversion: string;
}

export interface PillarRecommendations {
  positioning: string;
  messaging: string;
  visibility: string;
  credibility: string;
  conversion: string;
}

/**
 * Standard WunderBrand Snapshot™ JSON output
 */
export interface BrandSnapshotOutput {
  brandAlignmentScore: number; // 0-100
  pillarScores: PillarScores;
  pillarInsights: PillarInsights;
  recommendations: PillarRecommendations;
}

/**
 * Snapshot+™ Extended JSON output (for paid users)
 */
export interface SnapshotPlusOutput extends BrandSnapshotOutput {
  persona: string; // Brand persona description
  archetype: string; // Brand archetype (Hero, Sage, Explorer, Creator, etc.)
  brandPillars: string[]; // Content pillars (typically 5)
  colorPalette: ColorPaletteItem[];
  snapshotPlusOutline: SnapshotPlusOutline;
}

/**
 * Type guard to check if output is Snapshot+ format
 */
export function isSnapshotPlusOutput(
  output: BrandSnapshotOutput | SnapshotPlusOutput
): output is SnapshotPlusOutput {
  return 'persona' in output && 'archetype' in output && 'colorPalette' in output;
}

