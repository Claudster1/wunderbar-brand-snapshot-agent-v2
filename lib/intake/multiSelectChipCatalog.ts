/**
 * Chip catalogs for choice-style intake questions.
 * Shown under the composer; users can also type a free-text answer.
 */

import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";
import {
  getBrandPersonalityChipsForTone,
  getChipSelectionModeForCapture,
  getContentFormatChipsForTone,
  getCustomerAcquisitionChipsForTone,
  getCustomerExpectationChipsForTone,
  getDecisionStyleChipsForTone,
  getPaidAdsObjectiveChipsForTone,
  getPrimaryGoalChipsForTone,
  getSuggestedRepliesForCapture,
  type ChipSelectionMode,
} from "@/lib/intake/captureSuggestedReplies";
import { toneFromMessages, type ToneProfileId } from "@/lib/intake/toneProfile";

export type { ChipSelectionMode };

export const OTHER_CHIP = "Something else (type below)";
export const BETWEEN_BANDS_CHIP = "Between bands / not sure — describe below";

/** Default chips for 6–12 month outcome / primary goals questions (B2B-leaning fallback). */
export const PRIMARY_GOAL_CHIPS: string[] = getPrimaryGoalChipsForTone("b2b_professional");

export const BRAND_PERSONALITY_CHIPS: string[] = getBrandPersonalityChipsForTone("b2b_professional");

export const CONTENT_FORMAT_CHIPS: string[] = getContentFormatChipsForTone("b2b_professional");

export const CUSTOMER_ACQUISITION_CHIPS: string[] = getCustomerAcquisitionChipsForTone("b2b_professional");

export const GEOGRAPHIC_SCOPE_CHIPS: string[] = [
  "Locally (city or metro)",
  "Regionally (state or multi-state)",
  "Nationally",
  "Globally",
  OTHER_CHIP,
];

export const AUDIENCE_TYPE_CHIPS: string[] = [
  "Other businesses (B2B)",
  "Consumers (B2C)",
  "Both / meaningful mix",
  OTHER_CHIP,
];

export const YEARS_IN_BUSINESS_CHIPS: string[] = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
  "Not launched yet",
  OTHER_CHIP,
];

export const TEAM_SIZE_CHIPS: string[] = [
  "Just me",
  "2–5 people",
  "6–15 people",
  "16–50 people",
  "50+ people",
  OTHER_CHIP,
];

export const SOCIAL_PLATFORM_CHIPS: string[] = [
  "LinkedIn",
  "Instagram",
  "Facebook",
  "TikTok",
  "YouTube",
  "Not really active yet",
  OTHER_CHIP,
];

export const MARKETING_CHANNEL_CHIPS: string[] = [
  "SEO / organic search",
  "Email marketing",
  "Social media",
  "Paid ads",
  "Content / blogging",
  "Partnerships / events",
  "None currently",
  OTHER_CHIP,
];

export const VISUAL_CONFIDENCE_CHIPS: string[] = [
  "Very confident",
  "Somewhat confident",
  "Not confident",
  OTHER_CHIP,
];

export const ANNUAL_REVENUE_CHIPS: string[] = [
  "Pre-revenue",
  "Under $100K",
  "$100K – $500K",
  "$500K – $1M",
  "$1M – $5M",
  "$5M+",
  BETWEEN_BANDS_CHIP,
];

export const MONTHLY_REVENUE_CHIPS: string[] = [
  "Under $5k/mo",
  "$5k–$20k",
  "$20k–$50k",
  "$50k–$150k",
  "$150k+",
  "Pre-revenue / just launching",
  "Prefer not to say",
];

export const TOP_ACQUISITION_CHIPS: string[] = [
  "Referrals / word of mouth",
  "Organic search",
  "Social",
  "Paid ads",
  "Direct / repeat",
  "Events / partnerships",
  "Mix of channels",
  OTHER_CHIP,
];

export const MONTHLY_MARKETING_BUDGET_CHIPS: string[] = [
  "Under $500",
  "$500 – $2,000",
  "$2,000 – $5,000",
  "$5,000+",
  "$0 / not spending yet",
  BETWEEN_BANDS_CHIP,
];

export const CONTENT_CAPACITY_CHIPS: string[] = [
  "Under 2 hours/week",
  "2–5 hours/week",
  "5–10 hours/week",
  "10+ hours/week",
  "Minimal right now",
];

export const PAID_ADS_BUDGET_CHIPS: string[] = [
  "Not running paid ads right now",
  "Under $1,000/month",
  "$1,000 – $3,000/month",
  "$3,000 – $10,000/month",
  "$10,000+/month",
  BETWEEN_BANDS_CHIP,
];

export const PAID_ADS_OBJECTIVE_CHIPS: string[] = getPaidAdsObjectiveChipsForTone("b2b_professional");

export const PREVIOUS_BRAND_WORK_CHIPS: string[] = [
  "First time thinking about brand strategy",
  "Some DIY work on my own",
  "Worked with a freelancer / consultant",
  "Worked with a branding or marketing agency",
  OTHER_CHIP,
];

export const USER_ROLE_CHIPS: string[] = getSuggestedRepliesForCapture("user_role_context") ?? [
  "I run the business day-to-day",
  "I lead strategy and growth",
  "In-house marketing / brand",
  "I'm a founder / co-founder",
  OTHER_CHIP,
];

export const SERVICES_INTEREST_CHIPS: string[] = [
  "Help executing marketing (Managed Marketing)",
  "Strategic guidance / consulting",
  "Both — explore options",
  "Not right now — just the diagnostic",
];

export const EXPERT_CONVERSATION_CHIPS: string[] = [
  "Yes, I'd like to talk to someone",
  "Maybe later — include the link in my diagnostic",
];

export const DECISION_STYLE_CHIPS: string[] = getDecisionStyleChipsForTone("b2b_professional");

export const AUTHORITY_SOURCE_CHIPS: string[] = [
  "Personal experience or story",
  "Expertise and credentials",
  "Results and outcomes",
  "Community, relationships, or mission",
  OTHER_CHIP,
];

export const RISK_ORIENTATION_CHIPS: string[] = [
  "Bold and willing to challenge norms",
  "Calculated and strategic",
  "Cautious and steady",
  "Values-driven over growth-driven",
  OTHER_CHIP,
];

export const CUSTOMER_EXPECTATION_CHIPS: string[] = getCustomerExpectationChipsForTone("b2b_professional");

type TopicRule = {
  test: RegExp;
  mode: ChipSelectionMode;
  /** Static chips (tone-invariant). */
  chips?: string[];
  /** Resolve from capture catalog with tone. */
  captureKey?: CaptureKey;
  /** Custom tone-aware factory. */
  chipFactory?: (tone: ToneProfileId) => string[];
};

function chipsForRule(
  rule: TopicRule,
  tone: ToneProfileId,
  messages?: Array<{ role: string; content: string }>,
): string[] {
  if (rule.chipFactory) return rule.chipFactory(tone);
  if (rule.captureKey) {
    return getSuggestedRepliesForCapture(rule.captureKey, { messages, toneProfile: tone });
  }
  return rule.chips ?? [];
}

/**
 * Ordered topic detectors — first match wins.
 * More specific patterns should appear before broader ones.
 */
const TOPIC_RULES: TopicRule[] = [
  {
    test: /\b(6\s*[–-]\s*12\s*months|next (6|12) months|primary goals?|outcomes that matter|hoping to achieve|priorities for .{0,40}(brand|business|company)|more bookings|more guests|foot traffic)\b/i,
    chipFactory: getPrimaryGoalChipsForTone,
    mode: "multi",
  },
  {
    test: /\b(brand personality|if .{0,60} were a person|how would you describe (them|the brand)|personality words|person in a room|walked into the room)\b/i,
    chipFactory: getBrandPersonalityChipsForTone,
    mode: "multi",
  },
  {
    test: /\b(consistency of your brand|across (different )?touchpoints|cohesive wherever|somewhat consistent|bit scattered|feel cohesive)\b/i,
    chips: ["Cohesive wherever it shows up", "Somewhat consistent", "Still a bit scattered", OTHER_CHIP],
    mode: "single",
  },
  {
    test: /\b(content formats?|types? of content|what (do you|kind of content) (create|publish)|what formats|formats?.{0,40}audience|audience engages?)\b/i,
    chipFactory: getContentFormatChipsForTone,
    mode: "multi",
  },
  {
    test: /\b(brand-?new (prospect|guest|client|customer)|first discovers you|discovers you|usually happen|top acquisition|primary acquisition)\b/i,
    captureKey: "primary_acquisition_channel",
    mode: "single",
  },
  {
    test: /\b(customers? come from|how (do|does) people (typically )?find|where do most of your customers|most new customers find)\b/i,
    chipFactory: getCustomerAcquisitionChipsForTone,
    mode: "multi",
  },
  {
    test: /\b(industry or space|what industry|industry is the company|kind of business is this|line of business|what space is the business|hair salon|restaurant|not your marketing job)\b/i,
    captureKey: "industry",
    mode: "single",
  },
  {
    test: /\b(how clear is your offer|how clear is your menu|how clear are your services|offer to someone encountering|encountering you for the first time)\b/i,
    captureKey: "offer_clarity",
    mode: "single",
  },
  {
    test: /\b(messaging feel across|how clear and consistent does your messaging)\b/i,
    captureKey: "messaging_clarity",
    mode: "single",
  },
  {
    test: /\b(customer proof|testimonials?\/reviews|case studies,? or neither|reviews \(google|before\/after)\b/i,
    captureKey: "credibility_proof",
    mode: "multi",
  },
  {
    test: /\b(thought leadership|linkedin pov|blog, speaking|behind-the-scenes|sharing tips)\b/i,
    captureKey: "thought_leadership",
    mode: "single",
  },
  {
    test: /\b(do you have a website|website url to share|landing page or store|not on the web yet|paste (your website )?url|message box (below|and)|type url below)\b/i,
    captureKey: "website_presence",
    mode: "single",
  },
  {
    test: /\b(beyond your website and social|where else are you putting time or budget)\b/i,
    captureKey: "additional_marketing_surfaces",
    mode: "multi",
  },
  {
    test: /\b(email list you.re sending|mailing list|list you.re sending to today)\b/i,
    captureKey: "has_email_list",
    mode: "single",
  },
  {
    test: /\b(free download|lead magnet|guide, or template|discount, waitlist perk|tip sheet)\b/i,
    captureKey: "has_lead_magnet",
    mode: "single",
  },
  {
    test: /\b(how clear is the next step|pretty obvious, or still a bit mixed|reserve, order, visit|book, call, or message)\b/i,
    captureKey: "has_clear_cta",
    mode: "single",
  },
  {
    test: /\b(average deal or order size|average order value|typical ticket|average check|typical booking or service value)\b/i,
    captureKey: "average_transaction_value",
    mode: "single",
  },
  {
    test: /\b(conversion or close rate|approximate conversion|what share (actually )?(visit|book)|inquire or message you)\b/i,
    captureKey: "conversion_rate_estimate",
    mode: "single",
  },
  {
    test: /\b(choose a competitor over you|prospects choose a competitor|guests choose a competitor|clients choose a competitor)\b/i,
    captureKey: "competitive_pressure_point",
    mode: "single",
  },
  {
    test: /\b(paid ads? (primary )?objective|what are you optimizing|pipeline quality|more bookings \/ visits|primary goal for paid|goal for paid)\b/i,
    chipFactory: getPaidAdsObjectiveChipsForTone,
    mode: "single",
  },
  {
    test: /\b(primarily get paid|how you earn revenue|services\/consulting, a physical)\b/i,
    captureKey: "business_type_classifier",
    mode: "single",
  },
  {
    test: /\b(geographic (reach|scope)|serve customers locally|serve people|locally,? regionally|nationally,? or globally|mainly serve customers|where do you (mainly )?do business|where .{0,40}(do business|operate|based))\b/i,
    captureKey: "geographic_scope",
    mode: "single",
  },
  {
    test: /\b(sell to other businesses|primarily sell to|mainly sell to|directly to consumers|audience type|customers mostly (other companies|individual)|B2B \/ B2C|B2B or B2C|businesses,? (directly )?to consumers,? or both)\b/i,
    captureKey: "audience_type_classifier",
    mode: "single",
  },
  {
    test: /\b(sell to both businesses and consumers|which side does most of your marketing|consumer \/ b2c side|business \/ b2b side|keep both in mind)\b/i,
    captureKey: "marketing_audience_focus",
    mode: "single",
  },
  {
    test: /\b(how long .{0,40}(operating|in business|been around)|years in business|roughly how long)\b/i,
    captureKey: "years_in_business",
    mode: "single",
  },
  {
    test: /\b(how big is (your|the) team|team size|how many people (are )?involved)\b/i,
    captureKey: "team_size",
    mode: "single",
  },
  {
    // Require an ask about platforms — bare "social presence" in bridge copy must not steal chips.
    test: /\b(where does .{0,60} show up on social|show up on social today|name the platforms that matter|platforms that matter|which (social )?platforms?|social (media )?platforms?\b.{0,50}(active|matter|today|using))\b/i,
    captureKey: "social_platform_presence",
    mode: "multi",
  },
  {
    test: /\b(makes you different|competitive advantage|what sets you apart|stand out from|look-?alike competitors|differentiation|unique (value|edge|positioning))\b/i,
    chips: [
      "Specialized expertise / niche focus",
      "Service quality or experience",
      "Unique process, IP, or methodology",
      "Speed / responsiveness",
      "Price or value packaging",
      "Personal brand / relationships",
      OTHER_CHIP,
    ],
    mode: "multi",
  },
  {
    test: /\b(marketing (channels?|levers?)|channels? (are you|you are) (actively )?(using|running)|pulling .{0,20}today)\b/i,
    captureKey: "marketing_channel_mix",
    mode: "multi",
  },
  {
    test: /\b(visual (side|confidence)|how (confident|happy).{0,40}(look|logo|visual|brand looks))\b/i,
    captureKey: "visual_confidence",
    mode: "single",
  },
  {
    test: /\b(annual revenue|revenue .{0,20}(fall|range|band)|ballpark .{0,30}revenue)\b/i,
    chips: ANNUAL_REVENUE_CHIPS,
    mode: "single",
  },
  {
    test: /\b(month to month|monthly (revenue|sales)|generate month)\b/i,
    captureKey: "monthly_revenue_range",
    mode: "single",
  },
  {
    test: /\b(monthly marketing budget|marketing budget today)\b/i,
    captureKey: "monthly_marketing_budget",
    mode: "single",
  },
  {
    test: /\b(content creation|hours?.{0,20}(week|content)|dedicate .{0,20}content|time .{0,40}content each week)\b/i,
    captureKey: "content_creation_capacity",
    mode: "single",
  },
  {
    test: /\b(investing in paid ads|paid ads each month|paid media|ad spend)\b/i,
    chips: PAID_ADS_BUDGET_CHIPS,
    mode: "single",
  },
  {
    test: /\b(previous brand|brand strategy work|formal brand|worked with .{0,20}(agency|freelancer|consultant))\b/i,
    chips: PREVIOUS_BRAND_WORK_CHIPS,
    mode: "single",
  },
  {
    test: /\b(your role at|how do you think about your role|founder \/ co-founder|run the business day-to-day)\b/i,
    captureKey: "user_role_context",
    mode: "single",
  },
  {
    test: /\b(beyond your diagnostic|managed marketing|hands-on support|anything else on your radar)\b/i,
    chips: SERVICES_INTEREST_CHIPS,
    mode: "single",
  },
  {
    test: /\b(schedule a (quick |free )?20-?minute|talk to someone|expert conversation|book your call)\b/i,
    chips: EXPERT_CONVERSATION_CHIPS,
    mode: "single",
  },
  {
    test: /\b(make decisions|making decisions|decision style|which pattern fits|what pattern fits you|when you decide|try a new offer|ship a feature)\b/i,
    chipFactory: getDecisionStyleChipsForTone,
    mode: "single",
  },
  {
    test: /\b(authority .{0,20}come from|where does .{0,40}authority|why do people trust)\b/i,
    chips: AUTHORITY_SOURCE_CHIPS,
    mode: "single",
  },
  {
    test: /\b(approach risk|think about risk|default posture|risk orientation)\b/i,
    chips: RISK_ORIENTATION_CHIPS,
    mode: "single",
  },
  {
    test: /\b(customers? most expect|guests? most expect|clients? most expect|hoping they.ll feel|what do .{0,30} expect when they (choose|say yes|book|visit))\b/i,
    chipFactory: getCustomerExpectationChipsForTone,
    mode: "single",
  },
];

/**
 * When bridge copy mentions a prior topic and the real ask comes later, prefer the
 * match that appears latest in the assistant message (last-match wins).
 */
function lastMatchingTopicRule(
  text: string,
): TopicRule | null {
  let best: { rule: TopicRule; index: number } | null = null;
  for (const rule of TOPIC_RULES) {
    const flags = rule.test.flags.includes("g") ? rule.test.flags : `${rule.test.flags}g`;
    const re = new RegExp(rule.test.source, flags);
    let m: RegExpExecArray | null;
    let lastIdx = -1;
    while ((m = re.exec(text)) !== null) {
      lastIdx = m.index;
      if (!re.global) break;
    }
    if (lastIdx >= 0 && (!best || lastIdx >= best.index)) {
      best = { rule, index: lastIdx };
    }
  }
  return best?.rule ?? null;
}

/**
 * Resolve chips for the current turn.
 * Prefer topic detected from the assistant question on screen — that text is the
 * source of truth. Fall back to the pending capture catalog when topic detect misses.
 * Never let a stale nextPendingKey override a clear on-screen topic match.
 */
export function resolveSuggestedReplies(params: {
  nextPendingKey: CaptureKey | null;
  lastAssistantText?: string | null;
  messages?: Array<{ role: string; content?: string | null }>;
}): string[] | null {
  const t = String(params.lastAssistantText || "");
  const normalizedMessages = (params.messages ?? []).map((m) => ({
    role: m.role,
    content: String(m.content || ""),
  }));
  const tone = toneFromMessages(normalizedMessages);

  if (t.trim()) {
    const matched = lastMatchingTopicRule(t);
    if (matched) return chipsForRule(matched, tone, normalizedMessages);
  }

  if (params.nextPendingKey) {
    const fromCapture = getSuggestedRepliesForCapture(params.nextPendingKey, {
      messages: normalizedMessages,
      toneProfile: tone,
    });
    if (fromCapture.length > 0) return fromCapture;
  }

  return null;
}

/** single = one-tap send; multi = select several then Send. */
export function resolveChipSelectionMode(params: {
  nextPendingKey: CaptureKey | null;
  lastAssistantText?: string | null;
}): ChipSelectionMode {
  const t = String(params.lastAssistantText || "");

  if (t.trim()) {
    const matched = lastMatchingTopicRule(t);
    if (matched) return matched.mode;
  }

  if (params.nextPendingKey) {
    return getChipSelectionModeForCapture(params.nextPendingKey);
  }

  return "multi";
}
