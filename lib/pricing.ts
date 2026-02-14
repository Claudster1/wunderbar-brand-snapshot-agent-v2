// lib/pricing.ts
// Product pricing configuration

export type ProductKey = "snapshot_plus" | "blueprint" | "blueprint_plus" | "snapshot_plus_refresh" | "blueprint_refresh";

export interface ProductPricing {
  price: number;
  stripePriceId: string;
  label: string;
}

export const PRICING: Record<ProductKey, ProductPricing> = {
  snapshot_plus: {
    price: 497,
    stripePriceId: process.env.STRIPE_PRICE_SNAPSHOT_PLUS!,
    label: "WunderBrand Snapshot+™"
  },
  blueprint: {
    price: 997,
    stripePriceId: process.env.STRIPE_PRICE_BLUEPRINT!,
    label: "WunderBrand Blueprint™"
  },
  blueprint_plus: {
    price: 1997,
    stripePriceId: process.env.STRIPE_PRICE_BLUEPRINT_PLUS!,
    label: "WunderBrand Blueprint+™"
  },
  snapshot_plus_refresh: {
    price: 47,
    stripePriceId: process.env.STRIPE_PRICE_SNAPSHOT_PLUS_REFRESH!,
    label: "WunderBrand Snapshot+™ Quarterly Refresh"
  },
  blueprint_refresh: {
    price: 97,
    stripePriceId: process.env.STRIPE_PRICE_BLUEPRINT_REFRESH!,
    label: "WunderBrand Blueprint™ Quarterly Refresh"
  }
};

/** Whether a product key is a quarterly refresh (not a full-tier purchase) */
export function isRefreshProduct(key: ProductKey): boolean {
  return key === "snapshot_plus_refresh" || key === "blueprint_refresh";
}

/** Map a refresh product to its parent tier */
export function getRefreshParentTier(key: ProductKey): ProductKey | null {
  if (key === "snapshot_plus_refresh") return "snapshot_plus";
  if (key === "blueprint_refresh") return "blueprint";
  return null;
}

/**
 * Get pricing information for a product
 */
export function getPricing(productKey: ProductKey): ProductPricing {
  return PRICING[productKey];
}

/**
 * Get Stripe price ID for a product
 */
export function getStripePriceId(productKey: ProductKey): string {
  return PRICING[productKey].stripePriceId;
}

/**
 * Format price as currency string
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
