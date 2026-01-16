// lib/scoring.ts
import { PillarKey, BrandStage } from "./pillars";

interface StageDetectionInput {
  yearsInBusiness?: number;
  marketingChannels?: string[];
}

interface PillarScoringInput {
  offerClarity?: "very clear" | "somewhat clear" | "unclear";
  targetCustomers?: string;
  competitorNames?: string[];
  messagingClarity?: "very clear" | "somewhat clear" | "unclear";
  brandVoiceDescription?: string;
  website?: string | null;
  socials?: string[];
  marketingChannels?: string[];
  hasBrandGuidelines?: boolean;
  brandConsistency?: "strong" | "somewhat" | "inconsistent";
  visualConfidence?: "very confident" | "somewhat confident" | "not confident";
}

export function detectStage(input: StageDetectionInput): BrandStage {
  if (
    (input.yearsInBusiness ?? 0) < 2 ||
    (input.marketingChannels?.length ?? 0) <= 1
  ) {
    return "early";
  }

  if (
    (input.yearsInBusiness ?? 0) >= 2 &&
    (input.yearsInBusiness ?? 0) < 6
  ) {
    return "scaling";
  }

  return "established";
}

export function scorePillars(input: PillarScoringInput): Record<PillarKey, number> {
  const scores: Record<PillarKey, number> = {
    positioning: 0,
    messaging: 0,
    visibility: 0,
    credibility: 0,
    conversion: 0,
  };

  // Positioning
  if (input.offerClarity === "very clear") scores.positioning += 6;
  if (input.targetCustomers) scores.positioning += 6;
  if ((input.competitorNames?.length ?? 0) > 0) scores.positioning += 4;

  // Messaging
  if (input.messagingClarity === "very clear") scores.messaging += 8;
  if (input.brandVoiceDescription) scores.messaging += 6;

  // Visibility (SEO + AEO)
  if (input.website) scores.visibility += 5;
  if ((input.socials?.length ?? 0) > 0) scores.visibility += 5;
  if (input.marketingChannels?.includes("AEO")) scores.visibility += 6;

  // Credibility
  if (input.hasBrandGuidelines) scores.credibility += 6;
  if (input.brandConsistency === "strong") scores.credibility += 6;
  if (input.visualConfidence === "very confident")
    scores.credibility += 6;

  // Conversion
  if (input.offerClarity !== "unclear") scores.conversion += 6;
  if (input.messagingClarity !== "unclear") scores.conversion += 6;
  if (input.visualConfidence !== "not confident")
    scores.conversion += 4;

  return scores;
}
