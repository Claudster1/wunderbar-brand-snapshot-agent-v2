// lib/upgrade/ctaCopy.ts

import { PillarKey } from "@/types/pillars";
import { ResultsState } from "@/src/types/results";

export function getUpgradeCopy(
  pillar: string,
  stage: "early" | "scaling",
  businessName: string
) {
  const pillarMap: Record<string, string> = {
    positioning: "clarify how your brand is positioned",
    messaging: "sharpen your core messaging",
    visibility: "increase how your brand is discovered",
    credibility: "build stronger trust signals",
    conversion: "turn interest into action",
  };

  return {
    headline: `Ready to strengthen ${pillarMap[pillar]}?`,
    body:
      stage === "early"
        ? `Snapshot+™ gives ${businessName} a focused strategy to build this foundation correctly from the start.`
        : `Snapshot+™ helps ${businessName} correct this gap before it slows your next stage of growth.`,
  };
}

export function getSnapshotPlusCTA(
  brandName: string,
  primaryPillar: PillarKey,
  stage: ResultsState["stage"]
) {
  const pillarLabel = primaryPillar[0].toUpperCase() + primaryPillar.slice(1);

  return {
    headline: `Strengthen ${brandName}'s ${pillarLabel}`,
    subcopy:
      stage === "early"
        ? `Get a deeper, prioritized roadmap to build clarity and confidence.`
        : `Turn this insight into a structured system you can scale.`,
    button: "Unlock Snapshot+™"
  };
}
