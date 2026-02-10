// lib/pricing.ts
// Product pricing configuration

export type ProductKey = "snapshot_plus" | "blueprint" | "blueprint_plus";

export interface ProductPricing {
  price: number;
  stripePriceId: string;
  label: string;
}

export const PRICING: Record<ProductKey, ProductPricing> = {
  snapshot_plus: {
    price: 497,
    stripePriceId: process.env.STRIPE_PRICE_SNAPSHOT_PLUS!,
    label: "Brand Snapshot+™"
  },
  blueprint: {
    price: 997,
    stripePriceId: process.env.STRIPE_PRICE_BLUEPRINT!,
    label: "Brand Blueprint™"
  },
  blueprint_plus: {
    price: 1997,
    stripePriceId: process.env.STRIPE_PRICE_BLUEPRINT_PLUS!,
    label: "Brand Blueprint+™"
  }
};

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
