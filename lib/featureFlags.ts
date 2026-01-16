// lib/featureFlags.ts

export type SuiteCTAVariant = "clarity" | "strategy";

export function assignVariant(key: string): string {
  if (typeof window === "undefined") return "A";

  const stored = localStorage.getItem(key);
  if (stored) return stored;

  const variant = Math.random() > 0.5 ? "A" : "B";
  localStorage.setItem(key, variant);
  return variant;
}

export function showSecondarySuiteCTA(): boolean {
  if (typeof window === "undefined") return true;

  const key = "suite_cta_variant";

  let variant = localStorage.getItem(key);

  if (!variant) {
    variant = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(key, variant);
  }

  return variant === "B"; // B = CTA shown
}

export function getSuiteCTAVariant(): SuiteCTAVariant {
  if (typeof window === "undefined") return "clarity";

  const key = "suite_cta_copy_variant";
  let variant = localStorage.getItem(key) as SuiteCTAVariant | null;

  if (!variant) {
    variant = Math.random() < 0.5 ? "clarity" : "strategy";
    localStorage.setItem(key, variant);
  }

  return variant;
}

export function shouldShowSuiteCTA(): boolean {
  if (typeof window === "undefined") return true;

  const hasPurchased = localStorage.getItem("has_paid_plan") === "true";
  return !hasPurchased;
}

/**
 * Get A/B test variant for upgrade CTA
 * Returns "A" or "B" and persists the variant in localStorage
 */
export function getUpgradeCTAVariant(): "A" | "B" {
  if (typeof window === "undefined") return "A";

  const stored = localStorage.getItem("upgrade_cta_variant");
  if (stored === "A" || stored === "B") return stored;

  const variant = Math.random() < 0.5 ? "A" : "B";
  localStorage.setItem("upgrade_cta_variant", variant);
  return variant;
}
