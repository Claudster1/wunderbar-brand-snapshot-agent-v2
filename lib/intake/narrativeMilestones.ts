import type { IntakeMessage } from "@/lib/intake/buildIntakeTopicResume";
import { mergeMessagesWithPriorSynthetic } from "@/lib/intake/priorAnswersResume";

/** Narrative playbook sections (post-capture) — depth preserved, order enforced server-side. */
const SNAPSHOT_NARRATIVE_MILESTONES: { id: string; label: string; detect: RegExp }[] = [
  { id: "goals", label: "Goals", detect: /\b(6[–-]12 months|next year|hoping to achieve|primary goals?|priorities)\b/i },
  { id: "challenge", label: "Biggest challenge", detect: /\b(biggest challenge|magic wand|struggle|launching|scaling)\b/i },
  { id: "differentiation", label: "Differentiation", detect: /\b(different from|makes you different|unique|proprietary|stand out)\b/i },
  { id: "purpose", label: "Purpose / why", detect: /\b(why behind|deeper why|mission|passionate about|fortune 500)\b/i },
  { id: "offer_clarity", label: "Offer clarity", detect: /\b(how clear).*(offer|what you do)|first encounter\b/i },
  { id: "messaging_clarity", label: "Messaging clarity", detect: /\b(messaging|consistent|messaging clarity)\b/i },
  { id: "voice", label: "Brand voice", detect: /\b(voice|tone|approachable|how would you describe your brand)\b/i },
  { id: "topics", label: "Key topics", detect: /\b(topics?|themes?|talk about most|content pillars)\b/i },
  { id: "thought_leadership", label: "Thought leadership", detect: /\b(thought leadership|blog|speaking|publicly|known for)\b/i },
  { id: "credibility", label: "Credibility assets", detect: /\b(testimonial|case stud|credentials|proof|reviews)\b/i },
  { id: "visual", label: "Visual confidence", detect: /\b(visual|design|brand guidelines|logo)\b/i },
];

const PAID_EXTRA_MILESTONES: { id: string; label: string; detect: RegExp }[] = [
  { id: "email_list", label: "Email list", detect: /\b(email list|newsletter|mailing list|subscribers)\b/i },
  { id: "lead_magnet", label: "Lead magnet", detect: /\b(lead magnet|free download|opt-?in|gated)\b/i },
  { id: "cta", label: "CTA clarity", detect: /\b(call to action|cta|next step|landing)\b/i },
  { id: "channel_mix", label: "Marketing channels", detect: /\b(marketing channels|active channels|showing up for people)\b/i },
  { id: "implementation", label: "Implementation priorities", detect: /\b(next 2[–-]4 weeks|implementation|priorities now)\b/i },
];

export function getNarrativeMilestonesForTier(tier: string): { id: string; label: string; detect: RegExp }[] {
  const base = [...SNAPSHOT_NARRATIVE_MILESTONES];
  if (tier === "blueprint" || tier === "blueprint-plus") {
    return [...base, ...PAID_EXTRA_MILESTONES];
  }
  if (tier === "snapshot-plus") {
    return [
      ...base,
      { id: "revenue", label: "Revenue baseline", detect: /\b(monthly revenue|mrr|bring in|figures)\b/i },
      { id: "conversion", label: "Conversion", detect: /\b(conversion|close rate|win rate)\b/i },
    ];
  }
  return base;
}

const PRIOR_NARRATIVE_FIELD_HINTS: Record<string, RegExp> = {
  goals: /\bprimaryGoals\b/i,
  challenge: /\bbiggestChallenge\b/i,
  differentiation: /\bwhatMakesYouDifferent\b/i,
  purpose: /\bmissionStatement\b/i,
  offer_clarity: /\bofferClarity\b/i,
  messaging_clarity: /\bmessagingClarity\b/i,
  voice: /\bbrandVoiceDescription\b/i,
  topics: /\bkeyTopics|content pillars/i,
  thought_leadership: /\bthoughtLeadershipActivity\b/i,
  credibility: /\bhasTestimonials|hasCaseStudies|credibilityDetails\b/i,
  visual: /\bvisualConfidence\b/i,
  email_list: /\bhasEmailList\b/i,
  lead_magnet: /\bhasLeadMagnet\b/i,
  cta: /\bhasClearCTA\b/i,
  channel_mix: /\bmarketingChannels\b/i,
  revenue: /\bmonthlyRevenueRange|revenueRange\b/i,
  conversion: /\bconversionRateEstimate\b/i,
};

function priorJsonSatisfiesMilestone(prior: Record<string, unknown>, id: string): boolean {
  const raw = JSON.stringify(prior);
  const hint = PRIOR_NARRATIVE_FIELD_HINTS[id];
  if (!hint?.test(raw)) return false;
  if (id === "goals") return Array.isArray(prior.primaryGoals) && prior.primaryGoals.length > 0;
  if (id === "email_list") return typeof prior.hasEmailList === "boolean";
  if (id === "lead_magnet") return typeof prior.hasLeadMagnet === "boolean";
  if (id === "cta") return typeof prior.hasClearCTA === "boolean";
  if (id === "channel_mix") return Array.isArray(prior.marketingChannels) && prior.marketingChannels.length > 0;
  return true;
}

export function getNarrativeCompletionState(
  messages: IntakeMessage[],
  tier: string,
  priorAnswers?: Record<string, unknown> | null,
): { percent: number; pendingLabels: string[]; nextMilestoneLabel: string | null } {
  const milestones = getNarrativeMilestonesForTier(tier);
  const merged = mergeMessagesWithPriorSynthetic(messages, priorAnswers ?? undefined);
  const corpus = merged.map((m) => m.content || "").join("\n");
  const completed = milestones.filter(
    (m) =>
      m.detect.test(corpus) ||
      (priorAnswers && priorJsonSatisfiesMilestone(priorAnswers, m.id)),
  );
  const pending = milestones.filter((m) => !completed.includes(m));
  const percent =
    milestones.length === 0 ? 100 : Math.round((completed.length / milestones.length) * 100);
  return {
    percent,
    pendingLabels: pending.map((m) => m.label),
    nextMilestoneLabel: pending[0]?.label ?? null,
  };
}

export function buildNarrativeRoutingLines(
  messages: IntakeMessage[],
  tier: string,
  capturesComplete: boolean,
  priorAnswers?: Record<string, unknown> | null,
): string[] {
  if (!capturesComplete) return [];
  const { percent, pendingLabels, nextMilestoneLabel } = getNarrativeCompletionState(
    messages,
    tier,
    priorAnswers,
  );
  if (percent >= 100) {
    return [
      "NARRATIVE CHECKLIST: All core narrative topics appear covered.",
      "Proceed to FINAL HANDOFF (closing JSON) when the user has no further adds — do not reopen website/social/competitors/customers.",
    ];
  }
  return [
    `NARRATIVE CHECKLIST: ${percent}% of narrative topics touched in this thread.`,
    nextMilestoneLabel
      ? `Next narrative focus (one question only): ${nextMilestoneLabel}. Still pending: ${pendingLabels.slice(0, 5).join(", ")}.`
      : "Continue narrative sections in order; skip any topic already discussed.",
    "Do **not** re-ask required captures (website, social, etc.) — those are complete.",
  ];
}
