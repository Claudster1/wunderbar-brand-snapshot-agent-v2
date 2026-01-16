/* =========================================================
   POST-STRIPE STRATEGY + FEATURE IMPLEMENTATION
   Applies Snapshot+™, Blueprint™, Blueprint+™ logic
   ========================================================= */

import { BrandStage } from "./pillarContent";

/* =========================
   1. REPORT STATE MODEL
   ========================= */

export type UserStage = "early" | "growth" | "scaling";

export type UserPlan = 
  | "free" 
  | "snapshot_plus" 
  | "blueprint" 
  | "blueprint_plus";

export type PillarKey =
  | "positioning"
  | "messaging"
  | "visibility"
  | "credibility"
  | "conversion";

export interface BrandSnapshotResult {
  reportId: string;
  businessName: string;
  brandAlignmentScore: number;
  stage: UserStage;
  primaryPillar: PillarKey;
  pillarScores: Record<PillarKey, number>;
  contextCoverage: number; // 0–100
}

/* =========================
   2. STAGE DETECTION LOGIC
   ========================= */

export function detectStage(input: {
  yearsInBusiness?: number;
  teamSize?: number;
  monthlyRevenue?: number;
}): UserStage {
  if (
    (input.yearsInBusiness ?? 0) < 2 ||
    (input.monthlyRevenue ?? 0) < 10000
  ) {
    return "early";
  }

  if ((input.monthlyRevenue ?? 0) < 75000) {
    return "growth";
  }

  return "scaling";
}

/* =========================
   3. PRIMARY PILLAR DETECTION
   ========================= */

export function getPrimaryPillar(
  scores: Record<PillarKey, number>
): PillarKey {
  return Object.entries(scores).sort(
    ([, a], [, b]) => a - b
  )[0][0] as PillarKey;
}

/* =========================
   4. CONTEXT COVERAGE METER
   ========================= */

export function calculateContextCoverage(input: {
  website?: string;
  socials?: string[];
  competitors?: string[];
  brandGuidelines?: boolean;
}): number {
  let score = 0;
  if (input.website) score += 25;
  if ((input.socials?.length ?? 0) > 0) score += 25;
  if ((input.competitors?.length ?? 0) > 0) score += 25;
  if (input.brandGuidelines) score += 25;
  return score;
}

/* =========================
   5. PROGRESSIVE DISCLOSURE UI FLAGS
   ========================= */

export function getDisclosureState(
  pillar: PillarKey,
  primary: PillarKey
) {
  if (pillar === primary) return "expanded";
  if (pillar === "visibility" || pillar === "conversion")
    return "collapsed";
  return "minimal";
}

/* =========================
   6. CONFIDENCE-MODULATED COPY
   ========================= */

export function getToneByStage(stage: UserStage) {
  switch (stage) {
    case "early":
      return {
        emphasis: "clarity",
        language: "supportive",
      };
    case "growth":
      return {
        emphasis: "consistency",
        language: "directive",
      };
    case "scaling":
      return {
        emphasis: "optimization",
        language: "authoritative",
      };
  }
}

/* =========================
   7. SNAPSHOT+™ CTA TUNING
   ========================= */

export function getSnapshotPlusCTA(data: {
  businessName: string;
  primaryPillar: PillarKey;
  stage: UserStage;
}) {
  return `See how ${data.businessName} can strengthen ${
    data.primaryPillar
  } for a ${data.stage} brand`;
}

export function snapshotPlusCTA(
  brand: string,
  pillarTitle: string,
  stage: BrandStage
) {
  return `Go deeper on ${pillarTitle} and get a personalized strategy for ${brand} at the ${stage} stage.`;
}

/* =========================
   8. DASHBOARD VISUAL PRIORITY
   ========================= */

export function getGaugeStyle(
  pillar: PillarKey,
  primary: PillarKey
) {
  return {
    size: pillar === primary ? "xl" : "md",
    intensity: pillar === primary ? 1 : 0.6,
  };
}

/* =========================
   9. PAID-ONLY ENRICHMENT HINTS
   ========================= */

export function enrichmentHints(
  coverage: number
): string[] {
  if (coverage >= 75) return [];
  if (coverage >= 50)
    return ["Social profile analysis", "Competitor positioning"];
  return [
    "Website crawl",
    "Social handle analysis",
    "Offer clarity review",
  ];
}

/* =========================
   10. SNAPSHOT+™ PDF ENABLEMENT FLAG
   ========================= */

export function canGeneratePDF(plan: string) {
  return (
    plan === "snapshot_plus" ||
    plan === "blueprint" ||
    plan === "blueprint_plus"
  );
}

/* =========================
   11. BLUEPRINT™ PROMPT ACCESS
   ========================= */

export function canAccessBlueprint(plan: string | UserPlan): boolean {
  return plan === "blueprint" || plan === "blueprint_plus";
}

/**
 * Helper to check if user has blueprint access
 * Usage: hasBlueprintAccess(user.plan)
 */
export function hasBlueprintAccess(user: { plan: string | UserPlan }): boolean {
  return canAccessBlueprint(user.plan);
}

/* =========================
   12. STRIPE → FEATURE GATING MAP
   ========================= */

export const PLAN_FEATURES = {
  free: {
    pdf: false,
    enrichment: false,
    refinement: false,
  },
  snapshot_plus: {
    pdf: true,
    enrichment: true,
    refinement: true,
  },
  blueprint: {
    pdf: true,
    enrichment: true,
    refinement: true,
    prompts: true,
  },
  blueprint_plus: {
    pdf: true,
    enrichment: true,
    refinement: true,
    prompts: true,
    campaigns: true,
  },
};
