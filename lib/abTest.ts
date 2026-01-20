// lib/abTest.ts
// A/B testing utilities

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

export function getABVariant(testId: string): "A" | "B" {
  if (typeof window === "undefined") return "A";

  const key = `ab_${testId}`;
  const existing = localStorage.getItem(key);

  if (existing === "A" || existing === "B") return existing;

  const variant = Math.random() < 0.5 ? "A" : "B";
  localStorage.setItem(key, variant);
  return variant;
}
