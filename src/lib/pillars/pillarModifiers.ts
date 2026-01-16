// src/lib/pillars/pillarModifiers.ts
// Stage and archetype-specific modifiers for pillar content

import { BrandStage, ArchetypeKey } from "./types";

export function stageModifier(stage: BrandStage): string {
  switch (stage) {
    case "early":
      return "At this stage, clarity matters more than scale.";
    case "growing":
      return "As momentum builds, consistency becomes the differentiator.";
    case "scaling":
      return "At scale, precision and alignment protect brand equity.";
  }
}

export function archetypeModifier(archetype: ArchetypeKey): string {
  switch (archetype) {
    case "Visionary":
      return "Your brand leads with ideas and future-forward thinking.";
    case "Guide":
      return "Your brand earns trust by helping others navigate complexity.";
    case "Builder":
      return "Your brand is grounded in execution and momentum.";
    case "Challenger":
      return "Your brand stands out by questioning the status quo.";
    case "Authority":
      return "Your brand leads through credibility and expertise.";
  }
}
