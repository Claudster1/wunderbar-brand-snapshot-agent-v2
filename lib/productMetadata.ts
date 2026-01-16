// lib/productMetadata.ts
// Product metadata and feature definitions

export type ProductKey = "snapshot_plus" | "blueprint" | "blueprint_plus";

export type ProductTier = "standard" | "advanced";

export type ProductUnlock = 
  | "orchestration"
  | "prompt_packs"
  | "scale"
  | "aeo"
  | "messaging_matrix"
  | "campaign_architecture";

export interface ProductMetadata {
  product_key: ProductKey;
  tier: ProductTier;
  unlocks: ProductUnlock[];
}

export const productMetadata: Record<ProductKey, ProductMetadata> = {
  snapshot_plus: {
    product_key: "snapshot_plus",
    tier: "standard",
    unlocks: ["aeo"],
  },
  blueprint: {
    product_key: "blueprint",
    tier: "standard",
    unlocks: ["prompt_packs", "aeo"],
  },
  blueprint_plus: {
    product_key: "blueprint_plus",
    tier: "advanced",
    unlocks: ["orchestration", "prompt_packs", "scale"],
  },
};

/**
 * Get product metadata by product key
 */
export function getProductMetadata(
  productKey: ProductKey
): ProductMetadata | undefined {
  return productMetadata[productKey];
}

/**
 * Check if a product unlocks a specific feature
 */
export function hasUnlock(
  productKey: ProductKey,
  unlock: ProductUnlock
): boolean {
  const metadata = productMetadata[productKey];
  return metadata?.unlocks.includes(unlock) ?? false;
}
