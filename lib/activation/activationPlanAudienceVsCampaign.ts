import type { ActivationPlanSection } from "@/lib/activation/activationPlanModel";

/** Foundation playbooks campaigns assume: segments/ICP, journey/funnel, competitive motion. */
export const ACTIVATION_AUDIENCE_JOURNEY_SECTION_IDS = [
  "audience-segments",
  "journey-orchestration",
  "competitive-motion-plan",
] as const;

export type ActivationTabFocus = "audience-journey" | "campaigns";

export function isActivationAudienceJourneySectionId(sectionId: string): boolean {
  return (ACTIVATION_AUDIENCE_JOURNEY_SECTION_IDS as readonly string[]).includes(sectionId);
}

export function parseActivationTabFocus(raw: string | string[] | undefined | null): ActivationTabFocus {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || !value.trim()) return "campaigns";
  const n = value.trim().toLowerCase().replace(/_/g, "-");
  if (
    n === "audience" ||
    n === "audience-journey" ||
    n === "foundation" ||
    n === "audiencejourney" ||
    n === "segments"
  ) {
    return "audience-journey";
  }
  return "campaigns";
}

export function filterActivationSectionsByTabFocus<T extends { id: string }>(
  sections: T[],
  focus: ActivationTabFocus,
): T[] {
  if (focus === "audience-journey") {
    return sections.filter((s) => isActivationAudienceJourneySectionId(s.id));
  }
  return sections.filter((s) => !isActivationAudienceJourneySectionId(s.id));
}

export function splitActivationSectionsByAudienceVsCampaign(sections: ActivationPlanSection[]): {
  audienceJourney: ActivationPlanSection[];
  campaigns: ActivationPlanSection[];
} {
  const audienceJourney = sections.filter((s) => isActivationAudienceJourneySectionId(s.id));
  const campaigns = sections.filter((s) => !isActivationAudienceJourneySectionId(s.id));
  return { audienceJourney, campaigns };
}
