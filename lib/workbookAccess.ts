// lib/workbookAccess.ts
// Determines whether a workbook is editable based on tier and finalization state.

const REVIEW_WINDOW_DAYS = 14;

export interface WorkbookEditability {
  canEdit: boolean;
  reason: string;
  isFinalized: boolean;
  reviewDaysRemaining: number | null;
  reviewWindowExpired: boolean;
  tier: string;
}

/**
 * Blueprint+ → always editable (within their subscription window).
 * Blueprint  → editable during the 14-day review window, read-only after finalization.
 */
export function getWorkbookEditability({
  productTier,
  createdAt,
  finalizedAt,
}: {
  productTier: string;
  createdAt: string;
  finalizedAt: string | null;
}): WorkbookEditability {
  const tier = normalizeTier(productTier);

  if (tier === "blueprint_plus") {
    return {
      canEdit: true,
      reason: "Your Brand Workspace adapts as your brand grows — edit anytime.",
      isFinalized: false,
      reviewDaysRemaining: null,
      reviewWindowExpired: false,
      tier,
    };
  }

  if (finalizedAt) {
    return {
      canEdit: false,
      reason: "Your Blueprint has been finalized. Use your 90-day refresh to update your strategy, or upgrade to Blueprint+ for ongoing editing.",
      isFinalized: true,
      reviewDaysRemaining: 0,
      reviewWindowExpired: true,
      tier,
    };
  }

  const created = new Date(createdAt);
  const windowEnd = new Date(created.getTime() + REVIEW_WINDOW_DAYS * 86400000);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((windowEnd.getTime() - now.getTime()) / 86400000));

  if (daysRemaining <= 0) {
    return {
      canEdit: false,
      reason: "Your 14-day review window has ended. This workbook will be auto-finalized.",
      isFinalized: false,
      reviewDaysRemaining: 0,
      reviewWindowExpired: true,
      tier,
    };
  }

  return {
    canEdit: true,
    reason: `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining in your review window. Make adjustments before finalizing.`,
    isFinalized: false,
    reviewDaysRemaining: daysRemaining,
    reviewWindowExpired: false,
    tier,
  };
}

/**
 * Returns true if the review window has expired and the workbook should be
 * auto-finalized. Used by the GET endpoint to finalize lazily.
 */
export function shouldAutoFinalize({
  productTier,
  createdAt,
  finalizedAt,
}: {
  productTier: string;
  createdAt: string;
  finalizedAt: string | null;
}): boolean {
  if (finalizedAt) return false;
  if (normalizeTier(productTier) === "blueprint_plus") return false;

  const created = new Date(createdAt);
  const windowEnd = new Date(created.getTime() + REVIEW_WINDOW_DAYS * 86400000);
  return new Date() > windowEnd;
}

function normalizeTier(tier: string): string {
  if (tier === "blueprint-plus" || tier === "blueprint_plus") return "blueprint_plus";
  if (tier === "blueprint") return "blueprint";
  return tier;
}
