// src/types/upgrade.ts
// Upgrade recommendation type definitions

import { PillarKey } from "@/types/pillars";

export interface UpgradeSignals {
  shouldRecommendSnapshotPlus: boolean;
  reason: string; // references primary pillar + stage
  unresolvedPillars: PillarKey[];
}
