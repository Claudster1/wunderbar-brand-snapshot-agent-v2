// src/types/snapshotPDF.ts
// Type definitions for Snapshot PDF generation

import { ContextCoverageResult } from "@/engine/contextCoverage";
import { PillarKey } from "@/types/pillars";

export interface SnapshotPDFSection {
  id: string;
  title: string;
  body: string[];
  emphasis?: "primary" | "secondary";
}

export interface SnapshotPlusPDFPayload {
  brandName: string;
  primaryPillar: PillarKey;
  stage: "early" | "scaling";
  context: ContextCoverageResult;
  pillarInsights: Record<PillarKey, string>;
  pillarRecommendations: Record<PillarKey, string[]>;
}

/**
 * Snapshot+™ PDF Document Structure
 * 
 * 1. Cover
 * 2. Executive Summary
 *    • Brand Alignment Score™ (SVG gauge)
 *    • Primary Pillar Focus
 *    • Context Coverage Meter
 * 3. Pillar Deep Dives (priority-ordered)
 *    • Primary (expanded)
 *    • Secondary (collapsed summaries)
 * 4. AEO + Visibility Strategy
 * 5. Conversion Clarity (Before → After)
 * 6. What We Could Go Deeper On (context gaps)
 * 7. Next Best Actions (5 steps)
 */
export interface SnapshotPlusPDFStructure {
  cover: {
    brandName: string;
    date: string;
  };
  executiveSummary: {
    brandAlignmentScore: number; // 0-100
    primaryPillar: PillarKey;
    contextCoverage: number; // 0-100
  };
  pillarDeepDives: {
    primary: {
      pillar: PillarKey;
      insight: string;
      recommendations: string[];
    };
    secondary: Array<{
      pillar: PillarKey;
      summary: string;
    }>;
  };
  aeoVisibilityStrategy: {
    strategy: string;
    recommendations: string[];
  };
  conversionClarity: {
    before: string;
    after: string;
  };
  contextGaps: {
    gaps: string[];
    opportunities: string[];
  };
  nextBestActions: string[]; // Exactly 5 steps
}
