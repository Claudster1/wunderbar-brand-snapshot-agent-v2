// src/pdf/sections/pillarSectionBuilder.ts
// Pillar section builder

import { SnapshotPDFSection } from "@/types/snapshotPDF";
import { PillarKey } from "@/types/pillars";

interface PillarSectionInput {
  pillar: PillarKey;
  brandName: string;
  isPrimary: boolean;
  insight: string;
  recommendations: string[];
  stage: "early" | "scaling";
}

export function buildPillarSection({
  pillar,
  brandName,
  isPrimary,
  insight,
  recommendations,
  stage,
}: PillarSectionInput): SnapshotPDFSection {
  const emphasis = isPrimary ? "primary" : "secondary";

  const stageModifier =
    stage === "early"
      ? "At this stage, focus and clarity matter more than volume."
      : "At this stage, alignment and consistency unlock scale.";

  return {
    id: `pillar-${pillar}`,
    title: `${capitalize(pillar)}${isPrimary ? " — Primary Focus Area" : ""}`,
    emphasis,
    body: [
      insight.replace("your brand", brandName),
      stageModifier,
      "Recommended next steps:",
      ...recommendations.map((r) => `• ${r}`),
    ],
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
