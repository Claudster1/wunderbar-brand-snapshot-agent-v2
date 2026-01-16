// lib/cta.ts
// CTA generation utilities

import { PillarKey } from "./pillars";

export { snapshotPlusCTA } from "@/src/utils/postStripeStrategy";

/**
 * Pillar-specific CTA copy
 * Maps each pillar to personalized call-to-action text
 */
export const CTA_BY_PILLAR: Record<PillarKey, string> = {
  positioning:
    "Clarify your positioning and make it obvious why customers should choose you over competitors.",
  messaging:
    "Strengthen your messaging so it consistently communicates value and builds trust.",
  visibility:
    "Improve your visibility so customers can find you when they're actively searching.",
  credibility:
    "Build credibility signals that reduce hesitation and accelerate buying decisions.",
  conversion:
    "Optimize your conversion paths to turn interest into action more effectively.",
};

export function getUpgradeCTA(pillar: string, brandName: string) {
  return `Strengthen ${brandName}'s ${pillar} foundation with Brand Snapshot+™`;
}
