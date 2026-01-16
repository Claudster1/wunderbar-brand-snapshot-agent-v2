// src/lib/blueprint/blueprintActivation.ts
// Blueprint activation section builder

import { BlueprintActivationInput } from "@/types/blueprint";
import { blueprintActivationCopy } from "@/src/content/blueprintActivation.copy";

export interface BlueprintActivationSection {
  pillar: string;
  title: string;
  body: string[];
  isPrimary: boolean;
}

export function buildBlueprintActivationSections(
  input: BlueprintActivationInput
): BlueprintActivationSection[] {
  const { brandName, stage, primaryPillar, resolvedPillars, archetype } = input;

  return resolvedPillars.map((pillar) => {
    const copy = blueprintActivationCopy[pillar];

    const stageModifier =
      stage === "early"
        ? "At this stage, focus and alignment matter more than scale."
        : "At this stage, consistency and repeatability unlock growth.";

    return {
      pillar,
      title:
        pillar === primaryPillar
          ? `${copy.headline} — Primary Focus`
          : copy.headline,
      body: [
        copy.value.replace("your brand", brandName),
        stageModifier,
        copy.outcome,
        `This work aligns with your ${archetype} archetype.`,
      ],
      isPrimary: pillar === primaryPillar,
    };
  });
}
