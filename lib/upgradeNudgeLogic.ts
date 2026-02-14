// lib/upgradeNudgeLogic.ts
// Logic for determining upgrade nudges based on snapshot data

import { ProductAccess } from "./productAccess";

export type UpgradeNudge = {
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
};

export function getUpgradeNudge(
  snapshot: {
    brand_alignment_score: number;
    primary_pillar: string;
    context_coverage: number;
  },
  access?: ProductAccess
): UpgradeNudge | null {
  // Snapshot+™ nudge (free → paid)
  if (snapshot.context_coverage < 70) {
    // Don't show if user already has Snapshot+ or higher
    if (access?.hasSnapshotPlus) {
      return null;
    }
    
    return {
      title: "Unlock a deeper WunderBrand Snapshot™",
      body: `Your results point to meaningful opportunity in ${snapshot.primary_pillar}. Snapshot+™ expands on this with deeper analysis, examples, and next-step clarity.`,
      ctaLabel: "See how to strengthen what matters most right now",
      href: "/snapshot-plus",
    };
  }

  // Blueprint™ nudge (Snapshot+™ → Blueprint™)
  if (snapshot.brand_alignment_score < 80) {
    // Don't show if user already has Blueprint or higher
    if (access?.hasBlueprint) {
      return null;
    }
    
    return {
      title: "Turn insight into execution",
      body: `You've identified where your brand needs clarity. WunderBrand Blueprint™ translates these insights into a complete, usable system.`,
      ctaLabel: "Explore WunderBrand Blueprint™ →",
      href: "/blueprint",
    };
  }

  // No nudge needed
  return null;
}

/**
 * Get personalized upgrade copy for each product tier based on primary pillar
 */
export function getUpgradeCopy(primaryPillar: string) {
  return {
    snapshot_plus:
      `Go deeper on your ${primaryPillar} foundation with WunderBrand Snapshot+™`,
    blueprint:
      `Activate your ${primaryPillar} strategy across your brand with WunderBrand Blueprint™`,
    blueprint_plus:
      `Scale your ${primaryPillar} system with WunderBrand Blueprint+™`
  };
}
