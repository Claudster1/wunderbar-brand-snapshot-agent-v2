// lib/abTest.ts
// A/B testing utilities

export type CTAVariant = "A" | "B";
export type CTAPresence = "single" | "dual";

export function getOrAssignVariant<T extends string>(
  key: string,
  variants: T[]
): T {
  if (typeof window === "undefined") return variants[0];

  const existing = localStorage.getItem(key) as T | null;
  if (existing && variants.includes(existing)) return existing;

  const assigned = variants[Math.floor(Math.random() * variants.length)];
  localStorage.setItem(key, assigned);
  return assigned;
}

/**
 * Get A/B test variant for upgrade CTA
 * Returns "A" or "B" and persists the variant in localStorage
 */
export function getUpgradeCTAVariant(): CTAVariant {
  if (typeof window === "undefined") return "A";

  return getOrAssignVariant<CTAVariant>("upgrade_cta_variant", ["A", "B"]);
}

export function getABVariant(testId: string): CTAVariant {
  if (typeof window === "undefined") return "A";

  const key = `ab_${testId}`;
  return getOrAssignVariant<CTAVariant>(key, ["A", "B"]);
}

export { getResultsCTAVariant } from "@/lib/getResultsCTAVariant";
