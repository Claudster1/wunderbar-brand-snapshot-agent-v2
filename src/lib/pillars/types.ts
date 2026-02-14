// src/lib/pillars/types.ts
// Type definitions for WunderBrand Snapshot™ context and pillars

import { PillarKey } from "./pillarCopy";

export type BrandStage = "early" | "growing" | "scaling";

export type ArchetypeKey =
  | "Visionary"
  | "Guide"
  | "Builder"
  | "Challenger"
  | "Authority";

export interface SnapshotContext {
  businessName: string;
  primaryPillar: PillarKey;
  brandStage: BrandStage;
  archetype: ArchetypeKey;
  pillarScores: Record<PillarKey, number>; // 0–20
}
