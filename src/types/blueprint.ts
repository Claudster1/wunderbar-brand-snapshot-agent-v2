// src/types/blueprint.ts
// Blueprint type definitions

import { PillarKey } from "@/types/pillars";

export interface BlueprintActivationInput {
  brandName: string;
  stage: "early" | "scaling";
  primaryPillar: PillarKey;
  resolvedPillars: PillarKey[];
  archetype: string;
}
