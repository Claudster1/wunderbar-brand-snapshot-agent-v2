// lib/upgradeCoupons.ts
// Determines the correct Stripe coupon to apply when a customer upgrades from a lower tier.
// Prior purchases are looked up in the brand_snapshot_purchases table.

import { supabaseServer } from "@/lib/supabaseServer";
import type { ProductKey } from "@/lib/pricing";

/**
 * Tier hierarchy (higher number = higher tier)
 */
const TIER_RANK: Record<string, number> = {
  snapshot_plus: 1,
  blueprint: 2,
  blueprint_plus: 3,
  snapshot_plus_refresh: 0,
  blueprint_refresh: 0,
};

/**
 * Coupon mapping: given the set of prior purchased tiers, returns the
 * environment variable name for the Stripe coupon to apply.
 *
 * Upgrade paths and credits:
 *   Snapshot+ ($497) → Blueprint ($997):    $497 credit  → pays $500
 *   Snapshot+ ($497) → Blueprint+ ($1,997): $497 credit  → pays $1,500
 *   Blueprint ($997) → Blueprint+ ($1,997): $997 credit  → pays $1,000
 *   Snapshot+ + Blueprint → Blueprint+:     $1,494 credit → pays $503
 */
function getCouponEnvKey(
  priorPurchases: Set<ProductKey>,
  targetProduct: ProductKey
): string | null {
  // No upgrade if buying same or lower tier
  const targetRank = TIER_RANK[targetProduct];
  const hasHigherOrEqual = [...priorPurchases].some(
    (p) => TIER_RANK[p] >= targetRank
  );
  if (hasHigherOrEqual) return null;

  // Upgrading to Blueprint+
  if (targetProduct === "blueprint_plus") {
    const hasSnapshotPlus = priorPurchases.has("snapshot_plus");
    const hasBlueprint = priorPurchases.has("blueprint");

    if (hasSnapshotPlus && hasBlueprint) {
      return "STRIPE_COUPON_FULL_SUITE_CREDIT"; // $1,494 credit
    }
    if (hasBlueprint) {
      return "STRIPE_COUPON_BLUEPRINT_CREDIT"; // $997 credit
    }
    if (hasSnapshotPlus) {
      return "STRIPE_COUPON_SNAPSHOT_PLUS_CREDIT"; // $497 credit
    }
  }

  // Upgrading to Blueprint
  if (targetProduct === "blueprint") {
    if (priorPurchases.has("snapshot_plus")) {
      return "STRIPE_COUPON_SNAPSHOT_PLUS_CREDIT"; // $497 credit
    }
  }

  return null;
}

/**
 * Look up a customer's prior paid purchases by email.
 * Returns the set of ProductKeys they've already purchased.
 */
async function getPriorPurchases(email: string): Promise<Set<ProductKey>> {
  const supabase = supabaseServer();
  const purchases = new Set<ProductKey>();

  const { data, error } = await supabase
    .from("brand_snapshot_purchases")
    .select("product_sku, status")
    .eq("user_email", email.toLowerCase())
    .eq("status", "paid")
    .limit(50);

  if (error) {
    console.error("[upgradeCoupons] Supabase lookup failed:", error);
    return purchases;
  }

  const SKU_TO_KEY: Record<string, ProductKey> = {
    SNAPSHOT_PLUS: "snapshot_plus",
    BLUEPRINT: "blueprint",
    BLUEPRINT_PLUS: "blueprint_plus",
  };

  for (const row of data ?? []) {
    const key = SKU_TO_KEY[row.product_sku];
    if (key) purchases.add(key);
  }

  return purchases;
}

export interface UpgradeCouponResult {
  /** Stripe coupon ID to apply, or null if no upgrade credit */
  couponId: string | null;
  /** Human-readable description for logging / metadata */
  description: string | null;
  /** The prior products the customer already purchased */
  priorProducts: ProductKey[];
}

/**
 * Determine the upgrade coupon to apply for a checkout session.
 *
 * @param email    - Customer's email address
 * @param targetProduct - The product they're buying
 * @returns UpgradeCouponResult with the coupon ID (if applicable)
 */
export async function getUpgradeCoupon(
  email: string,
  targetProduct: ProductKey
): Promise<UpgradeCouponResult> {
  if (!email) {
    return { couponId: null, description: null, priorProducts: [] };
  }

  const priorPurchases = await getPriorPurchases(email);

  if (priorPurchases.size === 0) {
    return { couponId: null, description: null, priorProducts: [] };
  }

  const envKey = getCouponEnvKey(priorPurchases, targetProduct);

  if (!envKey) {
    return {
      couponId: null,
      description: null,
      priorProducts: [...priorPurchases],
    };
  }

  const couponId = process.env[envKey];

  if (!couponId) {
    console.warn(
      `[upgradeCoupons] Env var ${envKey} not set — upgrade credit will not be applied`
    );
    return {
      couponId: null,
      description: `Missing env: ${envKey}`,
      priorProducts: [...priorPurchases],
    };
  }

  const priorNames = [...priorPurchases]
    .map((p) => {
      const names: Record<string, string> = {
        snapshot_plus: "WunderBrand Snapshot+™",
        blueprint: "WunderBrand Blueprint™",
        blueprint_plus: "WunderBrand Blueprint+™",
        snapshot_plus_refresh: "WunderBrand Snapshot+™ Refresh",
        blueprint_refresh: "WunderBrand Blueprint™ Refresh",
      };
      return names[p];
    })
    .join(" + ");

  return {
    couponId,
    description: `Upgrade credit from ${priorNames}`,
    priorProducts: [...priorPurchases],
  };
}
