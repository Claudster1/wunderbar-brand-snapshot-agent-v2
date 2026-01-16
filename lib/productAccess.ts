// lib/productAccess.ts
// Product access checking utilities

export type ProductAccess = {
  hasSnapshotPlus: boolean;
  hasBlueprint: boolean;
  hasBlueprintPlus: boolean;
};

export function canAccessBlueprintPlus(
  access: ProductAccess
): boolean {
  return access.hasBlueprintPlus === true;
}

export function canAccessBlueprint(
  access: ProductAccess
): boolean {
  return access.hasBlueprint === true || access.hasBlueprintPlus === true;
}

export function canAccessSnapshotPlus(
  access: ProductAccess
): boolean {
  return access.hasSnapshotPlus === true || 
         access.hasBlueprint === true || 
         access.hasBlueprintPlus === true;
}

/**
 * Get available upgrade options based on current access
 * Returns an array of product keys that the user can upgrade to
 */
export function getUpgradeOptions(access: ProductAccess): ("snapshot_plus" | "blueprint" | "blueprint_plus")[] {
  if (!access.hasSnapshotPlus) {
    return ["snapshot_plus"];
  }

  if (access.hasSnapshotPlus && !access.hasBlueprint) {
    return ["blueprint"];
  }

  if (access.hasBlueprint && !access.hasBlueprintPlus) {
    return ["blueprint_plus"];
  }

  return [];
}
