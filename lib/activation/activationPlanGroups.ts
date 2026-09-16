import type { ActivationPlanSection } from "@/lib/activation/activationPlanModel";
import {
  ACTIVATION_NAV_CHANNEL_IDS,
  ACTIVATION_NAV_CONTEXT_IDS,
  ACTIVATION_NAV_ROADMAP_ID,
} from "@/lib/activation/activationNavModel";

export type ActivationPlanPhaseMeta = {
  id: string;
  title: string;
  hint: string;
  sectionIds: readonly string[];
};

/**
 * Activation table groups — mirrors nav IA:
 * context → 90-day roadmap → channels
 */
export const ACTIVATION_PLAN_PHASES: readonly ActivationPlanPhaseMeta[] = [
  {
    id: "context",
    title: "Buyer journey & context",
    hint: "How buyers move toward a yes — plus audiences and competitive responses when your tier includes them.",
    sectionIds: ACTIVATION_NAV_CONTEXT_IDS,
  },
  {
    id: "plan",
    title: "90-day roadmap",
    hint: "What to do in what order — then open channel plans for copy and setups.",
    sectionIds: [ACTIVATION_NAV_ROADMAP_ID],
  },
  {
    id: "channels",
    title: "Channels",
    hint: "Channel plans with copy and setups you can run. Order follows your report priorities in Guided view.",
    sectionIds: ACTIVATION_NAV_CHANNEL_IDS,
  },
] as const;

export function groupActivationPlanSections(sections: ActivationPlanSection[]): Array<
  ActivationPlanPhaseMeta & { sections: ActivationPlanSection[] }
> {
  const phaseIdSets = ACTIVATION_PLAN_PHASES.map((phase) => ({
    phase,
    ids: new Set(phase.sectionIds),
  }));
  const seen = new Set<string>();
  const groups: Array<ActivationPlanPhaseMeta & { sections: ActivationPlanSection[] }> = [];

  for (const { phase, ids } of phaseIdSets) {
    // Preserve caller order (Guided ranking / nav sort) within each phase.
    const phaseSections = sections.filter((s) => ids.has(s.id));
    if (phaseSections.length > 0) {
      for (const s of phaseSections) seen.add(s.id);
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
