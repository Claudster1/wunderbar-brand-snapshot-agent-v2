import type { IntakeMessage } from "@/lib/intake/buildIntakeTopicResume";
import { mergeMessagesWithPriorSynthetic } from "@/lib/intake/priorAnswersResume";

/**
 * Assistant bubbles the user has not answered yet can contain milestone keywords (e.g. "messaging",
 * "how clear… offer") and falsely mark topics complete. Strip trailing assistant message(s) before
 * scoring narrative coverage.
 */
function stripTrailingAssistantMessages(messages: IntakeMessage[]): IntakeMessage[] {
  let end = messages.length;
  while (end > 0 && messages[end - 1]?.role === "assistant") {
    end -= 1;
  }
  return end === messages.length ? messages : messages.slice(0, end);
}

type NarrativeMilestone = { id: string; label: string; detect: RegExp };

/** Narrative playbook sections — paid tiers keep the full set. */
const FULL_NARRATIVE_MILESTONES: NarrativeMilestone[] = [
  {
    id: "goals",
    label: "Goals",
    detect:
      /\b(6[–-]12 months|next (6|12) months|next year|hoping to achieve|primary goals?|goals for|outcomes that matter|priorities for|attract more qualified|build brand awareness|differentiate from look-?alike|improve conversion|launch or establish|build authority)\b/i,
  },
  {
    id: "challenge",
    label: "Biggest challenge",
    detect: /\b(biggest challenge|magic wand|struggle with|hardest part|getting consistent visibility|proving credibility)\b/i,
  },
  {
    id: "differentiation",
    label: "Differentiation",
    detect:
      /\b(different from|makes you different|competitive advantage|stand out|look-?alike|what sets you apart|unique (process|edge|methodology)|specialized expertise|fortune-?500)\b/i,
  },
  {
    id: "purpose",
    label: "Purpose / why",
    detect: /\b(why behind|deeper why|mission|passionate about|keeps you going|what keeps you)\b/i,
  },
  {
    id: "offer_clarity",
    label: "Offer clarity",
    detect: /\b(how clear).{0,40}(offer|what you do)|first encounter|somewhat clear|very clear|still figuring\b/i,
  },
  {
    id: "messaging_clarity",
    label: "Messaging clarity",
    detect:
      /\b(messaging (feel|clarity|consistency)|how clear and consistent does your messaging|consistency of your brand|across (different )?touchpoints|cohesive wherever|somewhat consistent|bit scattered|feel cohesive)\b/i,
  },
  {
    id: "voice",
    label: "Brand voice",
    detect:
      /\b(brand personality|person in a room|personality words|how would you describe (them|your brand)|sharp and credible|approachable|no jargon|challenger|calm and steady|warm and human|premium \/ polished)\b/i,
  },
  {
    id: "topics",
    label: "Key topics",
    detect: /\b(topics?|themes?|talk about most|content pillars|brand foundations|messaging clarity|go-to-market)\b/i,
  },
  {
    id: "thought_leadership",
    label: "Thought leadership",
    detect: /\b(thought leadership|blog|speaking|linkedin pov|publicly|known for|a little \/ informal)\b/i,
  },
  {
    id: "credibility",
    label: "Credibility assets",
    detect: /\b(testimonials?|case studies?|credentials|customer proof|reviews|social proof|neither yet)\b/i,
  },
  {
    id: "visual",
    label: "Visual confidence",
    detect: /\b(visual|design|brand guidelines|logo|somewhat confident|very confident|not confident)\b/i,
  },
];

/**
 * Free Snapshot — only narrative topics that aren't already forced captures.
 * Keeps the chat short enough to hold attention through results.
 */
const SNAPSHOT_CRITICAL_NARRATIVE: NarrativeMilestone[] = [
  FULL_NARRATIVE_MILESTONES[0]!, // goals
  FULL_NARRATIVE_MILESTONES[1]!, // challenge
  FULL_NARRATIVE_MILESTONES[2]!, // differentiation
  FULL_NARRATIVE_MILESTONES[6]!, // voice
];

const PAID_EXTRA_MILESTONES: NarrativeMilestone[] = [
  { id: "email_list", label: "Email list", detect: /\b(email list|newsletter|mailing list|subscribers)\b/i },
  { id: "lead_magnet", label: "Lead magnet", detect: /\b(lead magnet|free download|opt-?in|gated)\b/i },
  { id: "cta", label: "CTA clarity", detect: /\b(call to action|cta|next step|landing)\b/i },
  { id: "channel_mix", label: "Marketing channels", detect: /\b(marketing channels|active channels|showing up for people)\b/i },
  { id: "implementation", label: "Implementation priorities", detect: /\b(next 2[–-]4 weeks|implementation|priorities now)\b/i },
];

export function getNarrativeMilestonesForTier(tier: string): NarrativeMilestone[] {
  if (tier === "snapshot") {
    return [...SNAPSHOT_CRITICAL_NARRATIVE];
  }
  const base = [...FULL_NARRATIVE_MILESTONES];
  if (tier === "blueprint" || tier === "blueprint-plus") {
    return [...base, ...PAID_EXTRA_MILESTONES];
  }
  if (tier === "snapshot-plus") {
    return [
      ...base,
      { id: "revenue", label: "Revenue baseline", detect: /\b(monthly revenue|mrr|bring in|figures)\b/i },
      { id: "conversion", label: "Conversion", detect: /\b(conversion (or |\/ )?close rate|close rate|win rate|don'?t track this yet|rough guess)\b/i },
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

function isSkipOrEmpty(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return /^(skip|n\/?a|none|prefer not to say)\.?$/i.test(t);
}

/**
 * Milestone is done when:
 * - prior answers JSON already has the field, OR
 * - an assistant question matching `detect` was followed by a real user answer, OR
 * - a user answer alone matches `detect` (chip labels / free-text keywords).
 */
function milestoneSatisfiedInThread(
  messages: IntakeMessage[],
  milestone: NarrativeMilestone,
): boolean {
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg) continue;
    if (msg.role === "user") {
      const answer = String(msg.content || "");
      if (!isSkipOrEmpty(answer) && milestone.detect.test(answer)) return true;
      continue;
    }
    if (msg.role !== "assistant") continue;
    const question = String(msg.content || "");
    if (!milestone.detect.test(question)) continue;
    for (let j = i + 1; j < messages.length; j++) {
      const next = messages[j];
      if (!next) break;
      if (next.role === "assistant") break;
      if (next.role === "user") {
        if (!isSkipOrEmpty(String(next.content || ""))) return true;
        break;
      }
    }
  }
  return false;
}

export function getNarrativeCompletionState(
  messages: IntakeMessage[],
  tier: string,
  priorAnswers?: Record<string, unknown> | null,
): { percent: number; pendingLabels: string[]; nextMilestoneLabel: string | null } {
  const milestones = getNarrativeMilestonesForTier(tier);
  const merged = mergeMessagesWithPriorSynthetic(messages, priorAnswers ?? undefined);
  const mergedForMilestones = stripTrailingAssistantMessages(merged);

  const completed = milestones.filter(
    (m) =>
      milestoneSatisfiedInThread(mergedForMilestones, m) ||
      (priorAnswers ? priorJsonSatisfiesMilestone(priorAnswers, m.id) : false),
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

export function getNarrativeMilestoneCount(tier: string): number {
  return getNarrativeMilestonesForTier(tier).length;
}
