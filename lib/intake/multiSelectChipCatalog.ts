/**
 * Chip catalogs for choice-style intake questions.
 * Shown under the composer; users can also type a free-text answer.
 */

import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";

export const OTHER_CHIP = "Something else (type below)";
export const BETWEEN_BANDS_CHIP = "Between bands / not sure — describe below";

/** Default chips for 6–12 month outcome / primary goals questions. */
export const PRIMARY_GOAL_CHIPS: string[] = [
  "Attract more qualified leads",
  "Build brand awareness and credibility",
  "Differentiate from look-alike competitors",
  "Improve conversion — turn interest into paying customers",
  "Launch or establish the brand properly",
  "Build authority and thought leadership in the space",
  OTHER_CHIP,
];

export const BRAND_PERSONALITY_CHIPS: string[] = [
  "Sharp and credible",
  "Approachable / no jargon",
  "Challenger / category-pushing",
  "Calm and steady",
  "Warm and human",
  "Premium / polished",
  OTHER_CHIP,
];

export const CONTENT_FORMAT_CHIPS: string[] = [
  "Short social posts / reels",
  "Long-form articles / LinkedIn",
  "Video / podcast",
  "Email newsletters",
  "Case studies / proof content",
  "Not creating much yet",
  OTHER_CHIP,
];

export const CUSTOMER_ACQUISITION_CHIPS: string[] = [
  "Referrals / word of mouth",
  "Google / organic search",
  "Social media",
  "Paid advertising",
  "Networking / events",
  "Partnerships",
  "Not sure",
  OTHER_CHIP,
];

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

export const PAID_ADS_OBJECTIVE_CHIPS: string[] = [
  "Generate more qualified leads",
  "Drive more sales/conversions",
  "Lower cost per lead/acquisition",
  "Improve ROAS",
  "Improve pipeline quality",
  "Build awareness first",
  OTHER_CHIP,
];

export const PREVIOUS_BRAND_WORK_CHIPS: string[] = [
  "First time thinking about brand strategy",
  "Some DIY work on my own",
  "Worked with a freelancer / consultant",
  "Worked with a branding or marketing agency",
  OTHER_CHIP,
];

export const USER_ROLE_CHIPS: string[] = [
  "I run the business day-to-day",
  "I lead strategy and growth",
  "I oversee marketing or brand",
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

export const DECISION_STYLE_CHIPS: string[] = [
  "I trust my instincts and move quickly",
  "I research thoroughly before acting",
  "I collaborate and seek alignment",
  "I rely on proven systems and expertise",
  OTHER_CHIP,
];

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

export const CUSTOMER_EXPECTATION_CHIPS: string[] = [
  "Innovation or fresh thinking",
  "Clear guidance and expertise",
  "Trust and reliability",
  "Connection and shared values",
  OTHER_CHIP,
];

type TopicRule = { test: RegExp; chips: string[] };

/**
 * Ordered topic detectors — first match wins.
 * More specific patterns should appear before broader ones.
 */
const TOPIC_RULES: TopicRule[] = [
  {
    test: /\b(6\s*[–-]\s*12\s*months|next (6|12) months|primary goals?|outcomes that matter|hoping to achieve|priorities for .{0,40}(brand|business|company))\b/i,
    chips: PRIMARY_GOAL_CHIPS,
  },
  {
    test: /\b(brand personality|if .{0,40} were a person|how would you describe (them|the brand)|personality words)\b/i,
    chips: BRAND_PERSONALITY_CHIPS,
  },
  {
    test: /\b(content formats?|types? of content|what (do you|kind of content) (create|publish)|audience engage)\b/i,
    chips: CONTENT_FORMAT_CHIPS,
  },
  {
    test: /\b(brand-?new prospect|first discovers you|discovers you|usually happen|top acquisition|primary acquisition)\b/i,
    chips: TOP_ACQUISITION_CHIPS,
  },
  {
    test: /\b(customers? come from|how (do|does) people (typically )?find|where do most of your customers|most new customers find)\b/i,
    chips: CUSTOMER_ACQUISITION_CHIPS,
  },
  {
    test: /\b(geographic (reach|scope)|serve customers locally|locally,? regionally|nationally,? or globally)\b/i,
    chips: GEOGRAPHIC_SCOPE_CHIPS,
  },
  {
    test: /\b(sell to other businesses|primarily sell to|directly to consumers|audience type|customers mostly (other companies|individual)|B2B \/ B2C|B2B or B2C|businesses,? (directly )?to consumers,? or both)\b/i,
    chips: AUDIENCE_TYPE_CHIPS,
  },
  {
    test: /\b(how long .{0,40}(operating|in business|been around)|years in business|roughly how long)\b/i,
    chips: YEARS_IN_BUSINESS_CHIPS,
  },
  {
    test: /\b(how big is (your|the) team|team size|how many people (are )?involved)\b/i,
    chips: TEAM_SIZE_CHIPS,
  },
  {
    test: /\b(show up on social|active on\??|platforms? (are you|you.?re) active|where does .{0,40} (show up|most visible)|social presence)\b/i,
    chips: SOCIAL_PLATFORM_CHIPS,
  },
  {
    test: /\b(marketing (channels?|levers?)|channels? (are you|you are) (actively )?using|pulling .{0,20}today)\b/i,
    chips: MARKETING_CHANNEL_CHIPS,
  },
  {
    test: /\b(visual (side|confidence)|how (confident|happy).{0,40}(look|logo|visual|brand looks))\b/i,
    chips: VISUAL_CONFIDENCE_CHIPS,
  },
  {
    test: /\b(annual revenue|revenue .{0,20}(fall|range|band)|ballpark .{0,30}revenue)\b/i,
    chips: ANNUAL_REVENUE_CHIPS,
  },
  {
    test: /\b(month to month|monthly (revenue|sales)|generate month)\b/i,
    chips: MONTHLY_REVENUE_CHIPS,
  },
  {
    test: /\b(monthly marketing budget|marketing budget today)\b/i,
    chips: MONTHLY_MARKETING_BUDGET_CHIPS,
  },
  {
    test: /\b(content creation|hours?.{0,20}(week|content)|dedicate .{0,20}content)\b/i,
    chips: CONTENT_CAPACITY_CHIPS,
  },
  {
    test: /\b(investing in paid ads|paid ads each month|paid media|ad spend)\b/i,
    chips: PAID_ADS_BUDGET_CHIPS,
  },
  {
    test: /\b(primary goal for paid|paid channels right now|goal for paid)\b/i,
    chips: PAID_ADS_OBJECTIVE_CHIPS,
  },
  {
    test: /\b(previous brand|brand strategy work|formal brand|worked with .{0,20}(agency|freelancer|consultant))\b/i,
    chips: PREVIOUS_BRAND_WORK_CHIPS,
  },
  {
    test: /\b(your role at|how do you think about your role|founder \/ co-founder|run the business day-to-day)\b/i,
    chips: USER_ROLE_CHIPS,
  },
  {
    test: /\b(beyond your diagnostic|managed marketing|hands-on support|anything else on your radar)\b/i,
    chips: SERVICES_INTEREST_CHIPS,
  },
  {
    test: /\b(schedule a (quick |free )?20-?minute|talk to someone|expert conversation|book your call)\b/i,
    chips: EXPERT_CONVERSATION_CHIPS,
  },
  {
    test: /\b(making decisions|decision style|what pattern fits you|when you decide)\b/i,
    chips: DECISION_STYLE_CHIPS,
  },
  {
    test: /\b(authority .{0,20}come from|where does .{0,40}authority|why do people trust)\b/i,
    chips: AUTHORITY_SOURCE_CHIPS,
  },
  {
    test: /\b(approach risk|think about risk|default posture|risk orientation)\b/i,
    chips: RISK_ORIENTATION_CHIPS,
  },
  {
    test: /\b(customers? most expect|hoping they.ll feel|what do .{0,30} expect when they (choose|say yes))\b/i,
    chips: CUSTOMER_EXPECTATION_CHIPS,
  },
  {
    test: /\b(average (transaction|deal)|deal size)\b/i,
    chips: getSuggestedRepliesForCapture("average_transaction_value"),
  },
  {
    test: /\b(conversion|close rate)\b/i,
    chips: getSuggestedRepliesForCapture("conversion_rate_estimate"),
  },
];

/**
 * Resolve chips for the current turn.
 * Prefer topic detected from the last assistant question (so narrative goals
 * aren't overridden by an unrelated pending capture key), then forced-capture catalog.
 */
export function resolveSuggestedReplies(params: {
  nextPendingKey: CaptureKey | null;
  lastAssistantText?: string | null;
}): string[] | null {
  const t = String(params.lastAssistantText || "");

  if (t.trim()) {
    for (const rule of TOPIC_RULES) {
      if (rule.test.test(t)) return rule.chips;
    }
  }

  if (params.nextPendingKey) {
    const fromCapture = getSuggestedRepliesForCapture(params.nextPendingKey);
    if (fromCapture.length > 0) return fromCapture;
  }

  return null;
}
