// src/lib/upgradeLogic.ts

import { PillarKey } from "@/types/pillars";

export function getUpgradeRecommendation({
  primaryPillar,
  stage,
}: {
  primaryPillar: string;
  stage: "early" | "scaling";
}) {
  if (primaryPillar === "Positioning") {
    return {
      product: "Brand Blueprint™",
      message:
        stage === "early"
          ? "Lock in clear positioning before you scale."
          : "Align your positioning system across teams and channels.",
    };
  }

  if (primaryPillar === "Visibility") {
    return {
      product: "Brand Blueprint+™",
      message:
        "Turn clarity into discoverability across search and AI platforms.",
    };
  }

  return {
    product: "Brand Snapshot+™",
    message:
      "Translate insight into focused, prioritized brand improvements.",
  };
}

export function shouldSuggestBlueprint(
  contextCoverage: number,
  primaryPillar: PillarKey
) {
  return contextCoverage >= 60 && primaryPillar !== "visibility";
}
