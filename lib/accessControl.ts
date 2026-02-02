// lib/accessControl.ts
// Re-export access control functions for convenience

export type { ProductAccess } from "./productAccess";
export {
  canAccessBlueprintPlus,
  canAccessBlueprint,
  canAccessSnapshotPlus
} from "./productAccess";
