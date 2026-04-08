import type { ActivationPlanSection } from "@/lib/activation/activationPlanModel";

export type ActivationPlanPhaseMeta = {
  id: string;
  title: string;
  hint: string;
  sectionIds: readonly string[];
};

/** Groups channel playbooks so the Activation table reads as a funnel, not a flat list. */
export const ACTIVATION_PLAN_PHASES: readonly ActivationPlanPhaseMeta[] = [
  {
    id: "foundation",
    title: "Foundation — who you’re talking to",
    hint: "Align segments, journey stages, and competitive motion before media spend.",
    sectionIds: ["audience-segments", "journey-orchestration", "competitive-motion-plan"],
  },
  {
    id: "demand",
    title: "Demand — capture and convert",
    hint: "Offers, lifecycle email, search, and paid — each row should ladder to one primary next step.",
    sectionIds: ["lead-magnet-planning", "email-lifecycle", "seo-aeo", "paid-ads"],
  },
  {
    id: "authority",
    title: "Authority — trust and visibility",
    hint: "Organic POV and PR-style reach to support everything above.",
    sectionIds: ["thought-leadership", "pr-plan"],
  },
  {
    id: "ship",
    title: "Execution — ship it",
    hint: "90-day sequencing, owners, and exports.",
    sectionIds: ["execution-roadmap"],
  },
] as const;

export function groupActivationPlanSections(sections: ActivationPlanSection[]): Array<
  ActivationPlanPhaseMeta & { sections: ActivationPlanSection[] }
> {
  const byId = new Map(sections.map((s) => [s.id, s]));
  const seen = new Set<string>();
  const groups: Array<ActivationPlanPhaseMeta & { sections: ActivationPlanSection[] }> = [];

  for (const phase of ACTIVATION_PLAN_PHASES) {
    const phaseSections: ActivationPlanSection[] = [];
    for (const id of phase.sectionIds) {
      const s = byId.get(id);
      if (s) {
        phaseSections.push(s);
        seen.add(id);
      }
    }
    if (phaseSections.length > 0) {
      groups.push({ ...phase, sections: phaseSections });
    }
  }

  const remainder = sections.filter((s) => !seen.has(s.id));
  if (remainder.length > 0) {
    groups.push({
      id: "other",
      title: "Additional plans",
      hint: "Extra playbooks from your tier.",
      sectionIds: remainder.map((s) => s.id),
      sections: remainder,
    });
  }

  return groups;
}

/** True when report channel copy suggests a lead magnet / gated offer is part of the recommended motion. */
export function campaignRecommendsLeadMagnet(diagnosticData: Record<string, unknown>): boolean {
  const cp = (diagnosticData.channelPlans as Record<string, string> | undefined) ?? {};
  const lm = typeof cp["lead-magnet"] === "string" ? cp["lead-magnet"].trim() : "";
  if (lm.length >= 60) return true;

  const email = typeof cp.email === "string" ? cp.email.toLowerCase() : "";
  if (email.length < 120) return false;
  return /\b(lead magnet|lead-magnet|downloadable|opt-?in|gated|content upgrade|resource|checklist|playbook|template pack|mini-?guide|webinar|whitepaper|e-?book|free tool|assessment|calculator|worksheet)\b/.test(
    email,
  );
}
