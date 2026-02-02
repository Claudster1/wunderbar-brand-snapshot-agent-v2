import type { ProductKey } from "@/lib/pricing";

export type ProductId =
  | "brand_snapshot"
  | "brand_snapshot_plus"
  | "brand_blueprint"
  | "brand_blueprint_plus";

const PRODUCT_ID_TO_KEY: Record<
  Exclude<ProductId, "brand_snapshot">,
  ProductKey
> = {
  brand_snapshot_plus: "snapshot_plus",
  brand_blueprint: "blueprint",
  brand_blueprint_plus: "blueprint_plus",
};

export function normalizeProductKey(productId: string): ProductKey | null {
  if (productId === "brand_snapshot") {
    return null; // Free product, no checkout
  }

  if (productId in PRODUCT_ID_TO_KEY) {
    return PRODUCT_ID_TO_KEY[productId as Exclude<ProductId, "brand_snapshot">];
  }

  if (
    productId === "snapshot_plus" ||
    productId === "blueprint" ||
    productId === "blueprint_plus"
  ) {
    return productId;
  }

  return null;
}
