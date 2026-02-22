import { BrandStage, ArchetypeKey } from "./types";

export function stageModifier(stage: BrandStage): string {
  switch (stage) {
    case "early":
      return "At this stage, every point of clarity creates disproportionate leverage — the brands that define their position early spend less to acquire customers later.";
    case "growing":
      return "Growth amplifies inconsistency — the gap between what your brand promises and how it's experienced widens with every new touchpoint, making alignment the highest-leverage investment right now.";
    case "scaling":
      return "At scale, brand precision protects margin — even small misalignments across channels compound into measurable revenue leakage and diluted market position.";
  }
}

export function archetypeModifier(archetype: ArchetypeKey): string {
  switch (archetype) {
    case "Visionary":
      return "Your brand's strength is making the future feel inevitable — the risk is moving so far ahead that your audience can't see the bridge from where they are to where you're taking them.";
    case "Guide":
      return "Your brand earns authority by making complexity navigable — the strongest move is turning your expertise into structured frameworks your audience can act on immediately.";
    case "Builder":
      return "Your brand's credibility lives in tangible results and operational excellence — every proof point, case study, and process you surface strengthens the case for choosing you.";
    case "Challenger":
      return "Your brand creates energy by reframing the category conversation — the key is ensuring that disruption is always paired with a credible alternative, not just a critique.";
    case "Authority":
      return "Your brand leads through depth and demonstrated mastery — the most powerful move is translating that expertise into accessible, decisive guidance that makes your audience more confident.";
  }
}
