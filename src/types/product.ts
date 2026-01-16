// src/types/product.ts
// Product and tier type definitions

import { PillarKey } from "@/types/pillars";

export type ProductTier = "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";

export interface ProductInfo {
  product: string;
  resolves_pillars: PillarKey[];
  tier: ProductTier;
}
