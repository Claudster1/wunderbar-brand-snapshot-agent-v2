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

export function getUpgradeCTA({
  pillar,
  stage,
}: {
  pillar: string;
  stage: "early" | "scaling";
}) {
  const base = {
    Positioning: {
      early: "Clarify your positioning before you scale further.",
      scaling: "Tighten positioning to support growth.",
    },
    Messaging: {
      early: "Turn clarity into confident messaging.",
      scaling: "Align messaging across channels.",
    },
    Visibility: {
      early: "Build visibility where it matters most.",
      scaling: "Expand visibility with intent.",
    },
    Credibility: {
      early: "Strengthen trust signals early.",
      scaling: "Reinforce credibility at scale.",
    },
    Conversion: {
      early: "Remove friction from your conversion path.",
      scaling: "Optimize conversion with precision.",
    },
  } as const;

  const key = pillar.charAt(0).toUpperCase() + pillar.slice(1);
  return base[key as keyof typeof base]?.[stage] ?? "";
}
