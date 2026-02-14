import type { ProductKey } from "@/lib/pricing";

export type ProductId =
  | "brand_snapshot"
  | "brand_snapshot_plus"
  | "brand_blueprint"
  | "brand_blueprint_plus"
  | "snapshot_plus_refresh"
  | "blueprint_refresh";

const PRODUCT_ID_TO_KEY: Record<string, ProductKey> = {
  brand_snapshot_plus: "snapshot_plus",
  brand_blueprint: "blueprint",
  brand_blueprint_plus: "blueprint_plus",
  snapshot_plus_refresh: "snapshot_plus_refresh",
  blueprint_refresh: "blueprint_refresh",
};

const VALID_KEYS: Set<string> = new Set([
  "snapshot_plus",
  "blueprint",
  "blueprint_plus",
  "snapshot_plus_refresh",
  "blueprint_refresh",
]);

export function normalizeProductKey(productId: string): ProductKey | null {
  if (productId === "brand_snapshot") {
    return null; // Free product, no checkout
  }

  if (productId in PRODUCT_ID_TO_KEY) {
    return PRODUCT_ID_TO_KEY[productId];
  }

  if (VALID_KEYS.has(productId)) {
    return productId as ProductKey;
  }

  return null;
}
