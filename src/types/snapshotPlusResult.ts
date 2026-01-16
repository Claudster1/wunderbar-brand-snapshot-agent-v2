// src/types/snapshotPlusResult.ts
// Type definitions for Snapshot+ results

import { PillarKey } from "@/src/lib/pillars/pillarCopy";
import { BrandStage, ArchetypeKey } from "@/src/lib/pillars/types";

export interface SnapshotPlusResult {
  resolvedPillars: PillarKey[]; // e.g. ["positioning", "messaging"]
  primaryPillar: PillarKey;
  brandStage: BrandStage;
  archetype: ArchetypeKey;
}
