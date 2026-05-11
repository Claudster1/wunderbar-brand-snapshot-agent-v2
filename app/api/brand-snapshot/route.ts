// app/api/brand-snapshot/route.ts
// Assessment conversation + report save endpoint.
// Uses multi-provider AI abstraction with automatic fallback.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { wundySystemPrompt } from "@/src/prompts/wundySystemPrompt";
import { wundySnapshotTierFragment } from "@/src/prompts/wundySnapshotTierFragment";
import { wundyUpgradeContinuationFragment } from "@/src/prompts/wundyUpgradeContinuationFragment";
import { wundyEarlyStageBuildModeFragment } from "@/src/prompts/wundyEarlyStageBuildModeFragment";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";
import { completeWithFallback, type ChatMessage } from "@/lib/ai";
import { CAPTURE_REFUSAL_PATTERN } from "@/lib/intake/captureRefusal";
import {
  assistantAskedDedicatedSocialPlatformPresence,
  captureKeySatisfiedFromHistory,
  flexibleDirectCaptureComplete,
  isBareAffirmOrDeny,
  socialPresenceImmediateRefusalAfterDedicatedPrompt,
  type CaptureKey,
} from "@/lib/intake/flexibleDirectCaptureComplete";
import { dedupeAssistantRepeatedParagraphChunks } from "@/lib/assistantCopy/dedupeAssistantParagraphRepeats";
import { sanitizeTierAssistantReply } from "@/lib/assistantCopy/sanitizeTierAssistantReply";
import type { ChatTier } from "@/lib/chatTierConfig";

type BusinessType =
  | "service_b2b"
  | "service_b2c"
  | "retail"
  | "ecommerce"
  | "saas"
  | "local_service";

function computeBrandAlignmentFromPillars(
  pillarScores: Record<string, unknown> | null | undefined,
): number | null {
  if (!pillarScores || typeof pillarScores !== "object") return null;
  const keys = ["positioning", "messaging", "visibility", "credibility", "conversion"] as const;
  const values = keys.map((key) => {
    const raw = Number((pillarScores as Record<string, unknown>)[key] ?? 0);
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.min(20, Math.round(raw)));
  });
  return values.reduce((sum, v) => sum + v, 0);
}

function getSupabaseClient() {
  return supabaseAdmin;
}

function inferBusinessTypeFromHistory(
  messages: Array<{ role: string; content: string }>
): BusinessType | null {
  const userCorpus = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join(" ")
    .toLowerCase();

  if (!userCorpus) return null;
  if (/\bsaas|software|app|subscription|platform\b/.test(userCorpus)) return "saas";
  if (/\be-?commerce|shopify|dtc|amazon|online store|product brand\b/.test(userCorpus)) return "ecommerce";
  if (/\bretail|storefront|boutique|restaurant|cafe|food|beverage\b/.test(userCorpus)) return "retail";
  if (/\blocal service|clinic|dental|medical|legal|salon|studio|contractor|trades?\b/.test(userCorpus)) return "local_service";
  if (/\bb2b|other businesses|business clients|enterprise\b/.test(userCorpus)) return "service_b2b";
  if (/\bb2c|consumers|consumer clients|personal service\b/.test(userCorpus)) return "service_b2c";
  if (/\b(consulting|consultants?|agency|agencies|freelance|contractors?|professional services|coaching)\b/.test(userCorpus))
    return "service_b2b";
  if (/\b(homeowners|patients|families|shoppers|guests)\b/.test(userCorpus)) return "service_b2c";
  if (/\b(etsy|amazon seller|shopify|dtc|dropship)\b/.test(userCorpus)) return "ecommerce";
  if (/\b(hvac|plumb|electric|roofing|landscap)\b/.test(userCorpus)) return "local_service";
  return null;
}

function getBusinessTypeRoutingNotes(type: BusinessType | null): string {
  switch (type) {
    case "service_b2b":
      return "Prioritize B2B track: LinkedIn/email attention channels, deal-size and sales-cycle capture, consultation/proposal conversion language.";
    case "service_b2c":
      return "Prioritize B2C service track: social proof and referral patterns, booking/call conversion path, trust and process clarity signals.";
    case "retail":
      return "Prioritize retail track: local search/GBP behavior, foot-traffic + repeat purchase dynamics, in-store + local channel emphasis.";
    case "ecommerce":
      return "Prioritize e-commerce track: product discovery channels, add-to-cart/checkout/retention funnel, AOV and repeat purchase levers.";
    case "saas":
      return "Prioritize SaaS track: acquisition-to-activation flow, trial/freemium conversion, retention/churn and expansion signals.";
    case "local_service":
      return "Prioritize local service track: local discovery channels, review/trust signals, booking-to-show-rate conversion path.";
    default:
      return "Business type not confidently inferred yet: ask the Business Type Classifier early and lock one primary revenue model before proceeding.";
  }
}

function hasSignal(messages: Array<{ role: string; content: string }>, pattern: RegExp): boolean {
  const corpus = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join(" ");
  return pattern.test(corpus);
}

/** Last N user turns only — reduces false completes from old answers (e.g. “10%” in another context). */
function recentUserCorpus(messages: Array<{ role: string; content: string }>, lastN: number): string {
  const users = messages.filter((m) => m.role === "user").slice(-lastN);
  return users.map((m) => m.content || "").join("\n");
}

function hasRecentUserSignal(
  messages: Array<{ role: string; content: string }>,
  pattern: RegExp,
  lastN = 5,
): boolean {
  return pattern.test(recentUserCorpus(messages, lastN));
}

function lastUserText(messages: Array<{ role: string; content: string }>): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return String(messages[i].content || "").trim();
  }
  return "";
}

function lastAssistantText(messages: Array<{ role: string; content: string }>): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") return String(messages[i].content || "").trim();
  }
  return "";
}

/**
 * US-first colloquial / shorthand for typed chat (fragments, coast-to-coast phrasing).
 * Paired with recent-user + topic gates so we don’t over-trigger on unrelated “no idea” lines.
 * Extend from real transcripts; regex will never catch everything.
 */
const US_PRE_REVENUE_OR_MONEY =
  "pre-?money|side (hustle|gig)|main gig|moonlighting|haven'?t monetized|not monetized|bootstrapp?(ed|ing)?|ramen profitable|making (peanuts|zilch|bupkis|squat|nada)|pennies so far|not much money-?wise|riding on savings";

const US_CHANNEL_SHORTHAND =
  "mostly \\big\\b|\\binsta\\b|the gram|\\bfb\\b|face(book)?|\\byt\\b|youtube|pinterest|snap(chat)?|word of mouth|\\bwom\\b|through (my |our )?network|friends (and|&) family|guerrilla|grassroots|cold outreach|warm intros?";

const US_CONVERSION_UNCERTAINTY =
  "no (idea|clue) (on )?(conversion|close|that|this|rates?|our funnel|win rate)|\\b(conversion|close|funnel|win rate)\\b.{0,50}\\bno (idea|clue)\\b|\\bno (idea|clue)\\b.{0,50}\\b(conversion|close|funnel)\\b|couldn'?t tell you|couldn'?t say|haven'?t looked|never measured|never really tracked|wild guess|total guess|beats me|\\bidk\\b|\\bdunno\\b|who knows|clueless|shot in the dark|your guess is as good";

const REVENUE_MONEY_OR_RANGE = new RegExp(
  [
    "\\b(no|zero|minimal) revenue\\b",
    "not generating (much )?revenue",
    "pre-?revenue",
    US_PRE_REVENUE_OR_MONEY,
    "\\bmrr\\b|\\barr\\b",
    "monthly (sales|income|take-?home)",
    "per month|\\/mo(nth)?\\b",
    "ballpark|roughly|approximately",
    "around \\$|~\\$",
    "\\$\\d[\\d,.]*\\s*(k|m)?\\b",
    "six-?figures|seven-?figures|five-?figures",
    "low (six|seven)|mid six|high six",
    "breaking even|cash-?flow positive",
    "\\b\\d+k\\s+(per|a)\\s+month\\b",
  ].join("|"),
  "i",
);

const REVENUE_TOPIC =
  /\b(revenue|mrr|arr|sales|income|month|monthly|business|figures|generate|bring in|earn|take-?home|company|quarter|ballpark|roughly|approximately)\b|~\$/i;

const DEAL_OR_TRANSACTION_CONTEXT =
  /\b(deal|order|hour|project|client|invoice|retainer|package|ticket|engagement|sale|booking|quote|proposal|session|aov)\b/i;

const CONVERSION_RATE_SIGNAL = new RegExp(
  [
    "\\b(conversion|close|win|qual|funnel|pipeline|leads?|sql|mql|bookings?)\\b.{0,80}\\b(\\d{1,2}\\s*%|\\d+\\s*percent|one in)",
    "\\b(\\d{1,2}\\s*%|\\d+\\s*percent)\\b.{0,80}\\b(conversion|close|win|funnel|lead|pipeline|sql|mql)\\b",
    "one (in|out of) (every )?\\d+",
    "haven'?t measured|no data on|we don'?t track|not tracking|n\\/a on conversions",
    "\\bqual rate|win rate\\b.{0,40}\\d|\\d.{0,40}\\b(win rate|qual rate)\\b",
    "\\b(conversion|close) rate\\b",
    "\\bi don'?t track (this|it)|do not track\\b",
    US_CONVERSION_UNCERTAINTY,
  ].join("|"),
  "i",
);

const ON_TOPIC_ASSISTANT_HINTS: Record<CaptureKey, RegExp> = {
  business_type_classifier:
    /\b(who|sell|selling|revenue|paid|clients|customers|business|model|launch|accurate|describe|get paid|primarily|reality|tailor)\b/i,
  website_presence: /\b(website|url|domain|site|landing|\.com|web address|online)\b/i,
  social_platform_presence:
    /\b(social|instagram|linkedin|tiktok|platform|handle|@|youtube|facebook|threads|not active|none)\b/i,
  additional_marketing_surfaces:
    /\b(email|seo|paid|events|referrals|channels|newsletter|content|surfaces|beyond|outside|word of mouth)\b/i,
  monthly_revenue_range:
    /\b(revenue|mrr|arr|month|range|\$|ballpark|generate|bring|figures|roughly|month to month|numbers)\b/i,
  average_transaction_value:
    /\b(transaction|deal|order|ticket|hourly|project|invoice|aov|size|estimate|typical)\b/i,
  conversion_rate_estimate:
    /\b(conversion|close|win|rate|percent|track|funnel|pipeline|measure|don'?t track)\b/i,
  primary_acquisition_channel:
    /\b(channel|find you|discover|referral|search|social|paid|organic|leads?|source|customers|traffic)\b/i,
  monthly_marketing_budget: /\b(marketing|budget|spend|ads?|paid|monthly|ballpark|\$)\b/i,
  content_creation_capacity: /\b(content|hours|week|time|create|writing|video|capacity)\b/i,
  competitive_pressure_point:
    /\b(compet|prospect|lose|win|price|trust|clarity|proof|pressure|choose|instead|tilt)\b/i,
  has_email_list: /\b(email|list|newsletter|subscribers|mailing|sending to)\b/i,
  has_lead_magnet: /\b(lead|magnet|download|opt-?in|free|template|guide|gated|exchange)\b/i,
  has_clear_cta: /\b(cta|call to action|next step|landing|site|profile|clear|button|mixed)\b/i,
  marketing_channel_mix:
    /\b(channel|marketing|social|seo|email|paid|referrals|events|youtube|linkedin|instagram|tiktok|showing up)\b/i,
};

type IntakeTier = "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus";

const CONTINUATION_REPORT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function loadPriorSnapshotAnswersForContinuation(
  reportId: string,
): Promise<Record<string, unknown> | null> {
  if (!CONTINUATION_REPORT_UUID_RE.test(reportId) || !supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("brand_snapshot_reports")
    .select("full_report")
    .or(`report_id.eq.${reportId},id.eq.${reportId}`)
    .maybeSingle();
  if (error || !data?.full_report || typeof data.full_report !== "object") return null;
  const answers = (data.full_report as { answers?: unknown }).answers;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return null;
  return answers as Record<string, unknown>;
}

function serializeAnswersForContinuationPrompt(answers: Record<string, unknown>): string {
  const max = 14_000;
  try {
    const s = JSON.stringify(answers);
    return s.length <= max ? s : `${s.slice(0, max)}…[truncated]`;
  } catch {
    return "{}";
  }
}

function normalizeIntakeTier(raw: unknown): IntakeTier {
  if (typeof raw !== "string") return "snapshot";
  const tier = raw.trim().toLowerCase().replace(/_/g, "-");
  if (tier === "snapshot-plus") return "snapshot-plus";
  if (tier === "blueprint") return "blueprint";
  if (tier === "blueprint-plus") return "blueprint-plus";
  return "snapshot";
}

function isActivationPlanningTier(raw: unknown): boolean {
  const tier = normalizeIntakeTier(raw);
  return tier === "blueprint" || tier === "blueprint-plus";
}

/** Snapshot / Snapshot+ — grounds Visibility + channel scoring without duplicating full Blueprint mix. */
const SNAPSHOT_DIGITAL_BASELINE: CaptureKey[] = [
  "website_presence",
  "social_platform_presence",
  "additional_marketing_surfaces",
];

function shouldIncludeCaptureForTier(capture: CaptureKey, tier: IntakeTier): boolean {
  const core: CaptureKey[] = [
    "business_type_classifier",
    "primary_acquisition_channel",
    "competitive_pressure_point",
  ];

  const advanced: CaptureKey[] = [
    "monthly_revenue_range",
    "average_transaction_value",
    "conversion_rate_estimate",
    "content_creation_capacity",
  ];

  const blueprintConversion: CaptureKey[] = [
    "monthly_marketing_budget",
    "has_email_list",
    "has_lead_magnet",
    "has_clear_cta",
    "marketing_channel_mix",
  ];

  if (tier === "snapshot") {
    return core.includes(capture) || SNAPSHOT_DIGITAL_BASELINE.includes(capture);
  }
  if (tier === "snapshot-plus") {
    return core.includes(capture) || advanced.includes(capture) || SNAPSHOT_DIGITAL_BASELINE.includes(capture);
  }
  if (tier === "blueprint" || tier === "blueprint-plus") {
    return core.includes(capture) || advanced.includes(capture) || blueprintConversion.includes(capture);
  }
  return false;
}

type CaptureState = {
  key: CaptureKey;
  label: string;
  completed: boolean;
};

/**
 * Cap how much chat history we send to the model each turn.
 * Routing guards, prior-answer primer, and detectors carry forward what matters; the model just needs
 * recent context to continue naturally. Keeps prompt size (and time-to-first-token) bounded as chats grow.
 */
const MAX_TRANSCRIPT_MESSAGES = 24;

function buildModelTranscriptWindow(
  messages: Array<{ role: string; content: string }>,
): Array<{ role: string; content: string }> {
  if (!Array.isArray(messages) || messages.length <= MAX_TRANSCRIPT_MESSAGES) {
    return messages ?? [];
  }
  /** The very first user message is typically the user's name; preserving it keeps salutations consistent. */
  const firstUserIdx = messages.findIndex((m) => m?.role === "user");
  const tail = messages.slice(-MAX_TRANSCRIPT_MESSAGES);
  if (firstUserIdx === -1) return tail;
  const firstUser = messages[firstUserIdx];
  if (!firstUser) return tail;
  return tail.some((m) => m === firstUser) ? tail : [firstUser, ...tail];
}

/** Plain-language hint for the model only — keep internal `label` for logs/debug. */
function modelFacingCaptureHint(key: CaptureKey): string {
  switch (key) {
    case "business_type_classifier":
      return "how you primarily get paid and who you sell to";
    case "website_presence":
      return "whether you have a live website URL (or are not on the web yet)";
    case "social_platform_presence":
      return "which social platforms you actively use (or that you are not really on social yet)";
    case "additional_marketing_surfaces":
      return "other marketing surfaces beyond the site and socials — email, SEO, paid, events, or mostly referrals";
    case "monthly_revenue_range":
      return "roughly what the business brings in month to month";
    case "average_transaction_value":
      return "a typical deal, order, or transaction size";
    case "conversion_rate_estimate":
      return "how you think about conversion or close rates — or if you do not track that yet";
    case "primary_acquisition_channel":
      return "where most new customers find you today";
    case "monthly_marketing_budget":
      return "what you are comfortable spending on marketing each month";
    case "content_creation_capacity":
      return "how much time you can realistically put into content each week";
    case "competitive_pressure_point":
      return "what usually tilts prospects toward a competitor instead of you";
    case "has_email_list":
      return "whether you are emailing a list today — even a small list counts";
    case "has_lead_magnet":
      return "whether you offer something simple and free (guide, checklist, template, etc.) when someone shares their email — or not yet";
    case "has_clear_cta":
      return "how clear the main next step feels when someone lands on your site or profile";
    case "marketing_channel_mix":
      return "which channels you are actively using to show up for people";
    default:
      return "one more detail to tailor your plan";
  }
}

const REFUSAL_PATTERN = CAPTURE_REFUSAL_PATTERN;

function getCaptureStates(
  messages: Array<{ role: string; content: string }>,
  options?: { includeBudgetCapture?: boolean; tier?: IntakeTier },
): CaptureState[] {
  const tier = options?.tier ?? "snapshot";
  const includeBudgetCapture = options?.includeBudgetCapture === true;
  const inferredType = inferBusinessTypeFromHistory(messages);
  const userCorpus = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join(" ");
  const lu = lastUserText(messages);
  const la = lastAssistantText(messages);
  const bareEmailListAnswer =
    isBareAffirmOrDeny(lu) &&
    /\bemail list|newsletter|mailing list|simple yes or no|sending to today\b/i.test(la);
  const bareLeadMagnetAnswer =
    isBareAffirmOrDeny(lu) &&
    /\blead magnet|free download|template|guide|checklist|exchange for their email|gated content|opt-?in\b/i.test(
      la,
    );

  const refused = (topicPattern: RegExp) =>
    topicPattern.test(userCorpus) && REFUSAL_PATTERN.test(userCorpus);

  const revenueLooseOk =
    hasRecentUserSignal(messages, REVENUE_MONEY_OR_RANGE, 5) &&
    hasRecentUserSignal(messages, REVENUE_TOPIC, 5);

  const avgTxnLooseOk =
    hasRecentUserSignal(
      messages,
      /\b(hourly|day rate|per hour|per project|project (fee|rate|size)|deal size|ticket size|average order|aov|typical (invoice|engagement|project)|~\$|\$\d[\d,.]*\b|smaller jobs|larger deals|varies a lot|depends on the (client|project)|retainer|package (is|starts at)|couple (hundred|grand)|few grand|few hundred bucks|north of|south of)\b/i,
      5,
    ) && hasRecentUserSignal(messages, DEAL_OR_TRANSACTION_CONTEXT, 5);

  const marketingBudgetLooseOk =
    hasRecentUserSignal(
      messages,
      /\b(zero|no) marketing spend|nothing on ads|tight budget|small budget|experimental budget|~\$|\$\d[\d,.]*\s*(per|\/)?\s*month on marketing|spend about|all-?in (around|is|about)\b/i,
      5,
    ) && hasRecentUserSignal(messages, /\b(marketing|ads?|spend|budget|paid media)\b/i, 5);

  const captures: CaptureState[] = [
    {
      key: "business_type_classifier",
      label: "business type classifier",
      completed:
        inferredType !== null ||
        hasSignal(messages, /\bservice_b2b|service_b2c|local_service|ecommerce|retail|saas\b/i) ||
        hasSignal(messages, /\bit sounds like you're|based on what you shared.*business\b/i) ||
        // Pre-revenue / early answers still answer "who you sell to / how you get paid" — don't leave capture stuck.
        hasSignal(
          messages,
          new RegExp(
            [
              "\\b(just )?launching|pre[- ]?revenue",
              US_PRE_REVENUE_OR_MONEY,
              "no clients?\\b.*\\byet\\b|no customers?\\b.*\\byet\\b|no clients? yet|no customers? yet|not selling yet",
              "haven'?t (landed|sold|had) (a )?(paying )?(client|customer|sale)|early[- ]stage|starting out|still building|working on (my|our) first",
              "don'?t have (any )?(paying )?clients|we (get paid|make money|earn|charge)|who (we |i )(sell|serve) to|primarily selling|selling (mostly|mainly) to",
              "revenue (is|comes|will)|business (model|type)|\\bb2b\\b|\\bb2c\\b|consumers|businesses|founders|freelance|consulting|agency|\\bsaas\\b|e-?commerce|product|services?\\b",
            ].join("|"),
            "i",
          ),
        ) ||
        refused(/\bhow you (get paid|make money)|who you.*sell|business model|primary revenue\b/i) ||
        flexibleDirectCaptureComplete("business_type_classifier", la, lu),
    },
    {
      key: "website_presence",
      label: "website or primary online home",
      completed:
        hasSignal(
          messages,
          /\b(https?:\/\/|www\.)\S+|[a-z0-9][-a-z0-9]{0,48}\.(com|io|ai|co|org|net|app|dev|us|uk|shop)(\b|[/.?#])/i,
        ) ||
        hasRecentUserSignal(
          messages,
          /\b(https?:\/\/|www\.)\S+|[a-z0-9][-a-z0-9]{0,48}\.(com|io|ai|co|org|net|app|dev|us|uk)(\b|[/.?#])/i,
          6,
        ) ||
        hasRecentUserSignal(
          messages,
          /\b(no website|no site yet|don'?t have (a )?(website|site)|not live yet|instagram only|facebook only|linkedin only|linktr\.ee|etsy (only|shop)|marketplace only|coming soon page|not on the web)\b/i,
          6,
        ) ||
        refused(/\b(website|url|domain|your site|web address)\b/i) ||
        flexibleDirectCaptureComplete("website_presence", la, lu) ||
        captureKeySatisfiedFromHistory("website_presence", messages),
    },
    {
      key: "social_platform_presence",
      label: "social platform presence",
      completed:
        socialPresenceImmediateRefusalAfterDedicatedPrompt(messages) ||
        flexibleDirectCaptureComplete("social_platform_presence", la, lu) ||
        captureKeySatisfiedFromHistory("social_platform_presence", messages),
    },
    {
      key: "additional_marketing_surfaces",
      label: "additional marketing channels beyond site/social",
      completed:
        hasSignal(
          messages,
          /\b(we (also )?run|invest in|focus on|double down).*\b(seo\b|paid ads?|email|newsletter|events|podcast|pr\b)/i,
        ) ||
        hasRecentUserSignal(
          messages,
          /\b(seo|content (marketing|blog)|paid (social|search|ads?)|google ads|meta ads|newsletter|email (list|marketing)|webinars?|events?|partnerships?|podcast|pr\b)\b/i,
          6,
        ) ||
        hasRecentUserSignal(
          messages,
          /\b(mostly referrals|word of mouth|no paid|not doing paid|nothing else|that'?s (pretty much |basically )?it|just organic|only referrals)\b/i,
          6,
        ) ||
        refused(/\b(other channels|marketing surfaces|beyond your site|outside your)\b/i) ||
        flexibleDirectCaptureComplete("additional_marketing_surfaces", la, lu) ||
        captureKeySatisfiedFromHistory("additional_marketing_surfaces", messages),
    },
    {
      key: "monthly_revenue_range",
      label: "monthly revenue baseline range",
      completed:
        hasSignal(
          messages,
          /\bunder \$?5k|\$?5k\s*[–-]\s*\$?20k|\$?20k\s*[–-]\s*\$?50k|\$?50k\s*[–-]\s*\$?150k|\$?150k\+|monthly revenue\b/i,
        ) ||
        revenueLooseOk ||
        refused(/\bmonthly revenue|month to month|transaction volume|how much you bring in\b/i) ||
        flexibleDirectCaptureComplete("monthly_revenue_range", la, lu),
    },
    {
      key: "average_transaction_value",
      label: "average transaction/deal value",
      completed:
        hasSignal(messages, /\baverage (transaction|deal|order) (value|size)\b/i) ||
        avgTxnLooseOk ||
        refused(/\baverage (transaction|deal|order) (value|size)|typical deal\b/i) ||
        flexibleDirectCaptureComplete("average_transaction_value", la, lu) ||
        captureKeySatisfiedFromHistory("average_transaction_value", messages),
    },
    {
      key: "conversion_rate_estimate",
      label: "conversion/close rate (or explicit 'I don't track this')",
      completed:
        hasSignal(messages, /\bconversion rate|close rate|i don't track this|do not track\b/i) ||
        hasRecentUserSignal(messages, CONVERSION_RATE_SIGNAL, 5) ||
        refused(/\bconversion rate|close rate|win rate\b/i) ||
        flexibleDirectCaptureComplete("conversion_rate_estimate", la, lu),
    },
    {
      key: "primary_acquisition_channel",
      label: "primary acquisition channel",
      completed:
        hasSignal(messages, /\breferral|organic search|social media|paid advertising|direct|events\b/i) ||
        hasRecentUserSignal(
          messages,
          /\b(word of mouth|wom|mostly referrals|google|organic|seo|sem|search ads?|linkedin|instagram|tiktok|facebook|meta|youtube|twitter|threads|\bx\b|cold (email|outreach|dm)|outbound|inbound|partnerships?|affiliates?|marketplaces?|pr\b|podcast|newsletter|community|webinars?|trade shows?|conferences?|content marketing|thought leadership)\b/i,
          5,
        ) ||
        refused(/\bacquisition channel|where (customers|clients) find you|lead source\b/i) ||
        flexibleDirectCaptureComplete("primary_acquisition_channel", la, lu),
    },
    {
      key: "monthly_marketing_budget",
      label: "monthly marketing budget",
      completed:
        hasSignal(
          messages,
          /\bunder \$?500|\$?500\s*[–-]\s*\$?2,?000|\$?2,?000\s*[–-]\s*\$?5,?000|\$?5,?000\+|marketing budget\b/i,
        ) ||
        marketingBudgetLooseOk ||
        refused(/\bmarketing budget|budget range|ad spend\b/i) ||
        flexibleDirectCaptureComplete("monthly_marketing_budget", la, lu),
    },
    {
      key: "content_creation_capacity",
      label: "weekly content creation capacity",
      completed:
        hasSignal(messages, /\bunder 2 hours|2[–-]5 hours|5[–-]10 hours|10\+ hours|content creation\b/i) ||
        hasRecentUserSignal(
          messages,
          /\b(almost none|basically none|minimal|a few hours|couple hours|1\s*[-–]?\s*2 hours|part-?time|full-?time|we don'?t really create|outsourc(e|ed) content|agency handles content)\b/i,
          5,
        ) ||
        refused(/\bcontent creation|hours per week|time for content\b/i) ||
        flexibleDirectCaptureComplete("content_creation_capacity", la, lu),
    },
    {
      key: "competitive_pressure_point",
      label: "competitive pressure point",
      completed:
        hasRecentUserSignal(
          messages,
          /\bwhere .*lose deals|lose to competitors|competitive pressure|prospects choose.*instead|win[- ]?loss|why buyers choose competitors\b/i,
          5,
        ) ||
        hasRecentUserSignal(
          messages,
          /\b(they|competitors?|other (vendors|shops|brands)|buyers?|prospects?).*\b(price|cheaper|pricing|trust|brand|awareness|faster|speed|features|reputation|bigger|more established|credibility|experience|relationship|incumbent|legacy)\b/i,
          5,
        ) ||
        hasRecentUserSignal(
          messages,
          /\b(usually|often|a lot of the time) (lose|lost) (to|against)|picked the other (guy|company|firm)|went with (a )?competitor|undercut on|can'?t compete on|gets? beat on (price|trust|speed)|kinda (lose|losing) (on |to )?|always the bridesmaid\b/i,
          5,
        ) ||
        refused(/\bcompetitor|competitive pressure|lose deals|win[- ]?loss|why (they|customers) pick\b/i) ||
        flexibleDirectCaptureComplete("competitive_pressure_point", la, lu) ||
        captureKeySatisfiedFromHistory("competitive_pressure_point", messages),
    },
    {
      key: "has_email_list",
      label: "email list status",
      completed:
        bareEmailListAnswer ||
        hasSignal(
          messages,
          /\bemail list|newsletter list|mailing list|we (have|don't have|do not have) an email list|no email list|not yet|starting|building (a )?list|small list\b/i,
        ) ||
        hasRecentUserSignal(
          messages,
          /\b(mailchimp|klaviyo|hubspot|convertkit|beehiiv|substack|constant contact|activecampaign|sendgrid|drip|flodesk)\b|\b\d{2,6}\s+(subscribers|contacts on (our )?list)\b|\b(yes|yeah|yep),?\s*(we have|there is|there's)\b.*\b(list|newsletter|subscribers)\b|\b(nope|no),?\s*(we )?(don'?t|do not) (have )?(an? )?(email )?list\b/i,
          5,
        ) ||
        refused(/\bemail list|newsletter|mailing list\b/i) ||
        flexibleDirectCaptureComplete("has_email_list", la, lu),
    },
    {
      key: "has_lead_magnet",
      label: "free offer / lead capture status",
      completed:
        bareLeadMagnetAnswer ||
        hasSignal(
          messages,
          /\blead magnet|lead capture|opt-?in|downloadable guide|free checklist|gated content|lead form|free resource|not yet|don't have|do not have|haven't|no we don't|nothing yet|we're not|we are not|skipped|no,? not really\b/i,
        ) ||
        hasRecentUserSignal(
          messages,
          /\b(freebie|whitepaper|white paper|case study (download|pdf)|webinar replay|template pack|free tool|free audit|free trial signup|quiz results|resource library)\b/i,
          5,
        ) ||
        refused(/\blead magnet|lead capture|opt-?in|free (download|resource|offer)\b/i) ||
        flexibleDirectCaptureComplete("has_lead_magnet", la, lu),
    },
    {
      key: "has_clear_cta",
      label: "primary CTA clarity",
      completed:
        hasSignal(
          messages,
          /\bclear cta|call to action|book a call|get started|schedule (a )?demo|request a quote|next step is clear|next step|a bit mixed|still figuring|not sure yet\b/i,
        ) ||
        hasRecentUserSignal(
          messages,
          /\b(pretty clear|fairly obvious|one main (button|cta)|too many (buttons|choices|ctas)|confus|unclear|muddy|visitors (get )?lost|not sure what to click|kinda messy|sorta clear|sort of a mess|meh,? it'?s fine|could be clearer)\b/i,
          5,
        ) ||
        refused(/\bcall to action|cta|next step|main action on (the )?site\b/i) ||
        flexibleDirectCaptureComplete("has_clear_cta", la, lu),
    },
    {
      key: "marketing_channel_mix",
      label: "active marketing channels",
      completed:
        hasSignal(
          messages,
          /\bmarketing channels|active channels|we use (email|social|paid ads|seo|search|events|referrals|youtube|linkedin|instagram)\b/i,
        ) ||
        hasRecentUserSignal(
          messages,
          new RegExp(
            [
              "\\b(we'?re on|mostly|primarily|heavy on|double down on|invest in)\\s+(tiktok|instagram|linkedin|youtube|facebook|meta|google|twitter|threads|reddit|podcasts?|email|newsletter|seo|ppc|paid search|events?|pr\\b|influencers?)\\b",
              "\\b(multi-?channel|omnichannel|channel mix is)\\b",
              US_CHANNEL_SHORTHAND,
            ].join("|"),
            "i",
          ),
          5,
        ) ||
        refused(/\bmarketing channels|active channels|which channels\b/i) ||
        flexibleDirectCaptureComplete("marketing_channel_mix", la, lu),
    },
  ];

  return captures.filter((capture) => {
    if (capture.key === "monthly_marketing_budget" && !includeBudgetCapture) return false;
    return shouldIncludeCaptureForTier(capture.key, tier);
  });
}

/** Treat stuck keys as completed for one turn so routing advances (anti-loop). */
function getEffectiveCaptureStates(
  messages: Array<{ role: string; content: string }>,
  options?: { includeBudgetCapture?: boolean; tier?: IntakeTier },
  softSkipKeys?: ReadonlySet<CaptureKey>,
): CaptureState[] {
  return getCaptureStates(messages, options).map((c) =>
    softSkipKeys?.has(c.key) ? { ...c, completed: true } : c,
  );
}

function getNextPendingCapture(
  messages: Array<{ role: string; content: string }>,
  options?: { includeBudgetCapture?: boolean; tier?: IntakeTier },
  softSkipKeys?: ReadonlySet<CaptureKey>,
): CaptureState | null {
  return getEffectiveCaptureStates(messages, options, softSkipKeys).find((x) => !x.completed) ?? null;
}

/** Align forced prompt vs assistant text for repeat detection (approved wording uses **bold**; models often omit markers). */
function stripChatMarkdownBold(s: string): string {
  return s.replace(/\*\*([^*]+)\*\*/g, "$1");
}

function normalizedCapturePromptSlice(s: string): string {
  return stripChatMarkdownBold(s).replace(/\s+/g, " ").trim();
}

/** Assistant turns that reused the same forced capture line (verbatim or distinctive prefix). */
function forcedPromptRepeatCount(
  messages: Array<{ role: string; content: string }>,
  forcedPrompt: string,
): number {
  const t = forcedPrompt.trim();
  if (!t) return 0;
  const tNorm = normalizedCapturePromptSlice(t);
  const assistants = messages.filter((m) => m.role === "assistant");
  const exact = assistants.filter((m) => {
    const c = (m.content || "").trim();
    return c === t || normalizedCapturePromptSlice(c) === tNorm;
  }).length;
  if (exact >= 2) return exact;
  const needle = tNorm.slice(0, Math.min(96, tNorm.length));
  if (needle.length < 28) return exact;
  return Math.max(
    exact,
    assistants.filter((m) => normalizedCapturePromptSlice(m.content || "").includes(needle)).length,
  );
}

/**
 * Soft-skip when the same capture has already been asked once. Previously required `>= 2`, which
 * meant users had to see the question twice (and reply twice) before the system gave up. That was
 * the visible "repeating question" loop. Now: if the forced prompt has appeared *or* the model has
 * already paraphrased the same capture topic, we treat the next pending check as soft-skipped so
 * the conversation moves on. The downstream transcript extract still pulls whatever the user said.
 */
function shouldSoftSkipDueToForcedPromptLoop(
  messages: Array<{ role: string; content: string }>,
  forcedPrompt: string,
  pendingKey?: CaptureKey,
): boolean {
  const verbatim = forcedPromptRepeatCount(messages, forcedPrompt);
  if (verbatim >= 1) return true;
  if (!pendingKey) return false;
  const paraphraseCount = messages
    .filter((m) => m.role === "assistant")
    .reduce(
      (n, m) => (responseRequestsExpectedCapture(m.content || "", pendingKey) ? n + 1 : n),
      0,
    );
  return paraphraseCount >= 1;
}

function buildCaptureQuestion(
  key: CaptureKey,
  inferredType: BusinessType | null
): string {
  const businessTypeLabel = (type: BusinessType) => {
    switch (type) {
      case "service_b2b":
        return "B2B service";
      case "service_b2c":
        return "B2C service";
      case "retail":
        return "retail";
      case "ecommerce":
        return "e-commerce/product";
      case "saas":
        return "SaaS/software";
      case "local_service":
        return "local service";
      default:
        return "business";
    }
  };

  const typeHint =
    inferredType === null
      ? ""
      : `\nBusiness model context locked: ${inferredType.replace(/_/g, " ")}.`;

  switch (key) {
    case "business_type_classifier":
      return inferredType
        ? `Quick gut check so I can tailor this to your reality: it sounds like you're primarily running a ${businessTypeLabel(
            inferredType,
          )} business. **Does that feel accurate, or would you describe your revenue model differently?**`
        : "Quick context check before we go deeper: **in one sentence, how do you primarily get paid, and who are you mainly selling to?**";
    case "website_presence":
      return "**Do you have a website URL to share today** — even a simple landing page or store link? If you are not on the web yet, just say so; that is useful too.";
    case "social_platform_presence":
      return "**Where does your brand show up on social today?** Name the platforms that matter (or say *none / not really active yet*).";
    case "additional_marketing_surfaces":
      return "**Outside your website and those socials, where else are you investing attention** — email to a list, SEO or content, paid ads, events, partnerships — or mostly referrals / word of mouth?";
    case "monthly_revenue_range":
      return "**Roughly what does the business generate month to month?** A range is perfect — it keeps your impact framing grounded in real numbers.";
    case "average_transaction_value":
      return "**About what is your average transaction value or deal size today?** A rough estimate is absolutely fine.";
    case "conversion_rate_estimate":
      return "**What is your approximate conversion or close rate today, if you track it?** If not, totally okay — just say you don't track it yet.";
    case "primary_acquisition_channel":
      return "**Where do most new customers find you right now** — referral, organic search, social, paid ads, direct, events, or something else? Whatever comes to mind first is fine.";
    case "monthly_marketing_budget":
      return "**What is your approximate monthly marketing budget today?** Ballpark is perfect — this just helps prioritize what is realistic for you.";
    case "content_creation_capacity":
      return "**How much time can your team realistically invest in content creation each week?** Even a rough range works — no need to overthink it.";
    case "competitive_pressure_point":
      return "**When prospects choose a competitor over you, what reason comes up most often** — price, trust, clarity, speed, proof, or fit?";
    case "has_email_list":
      return `One gentle logistics question — **do you have an email list you're sending to today** (even a small one is perfect)? A simple yes or no is totally enough. If you're just starting, that's okay too — your diagnostic can include a friendly path forward.`;
    case "has_lead_magnet":
      return `Lots of strong brands don't use a "lead magnet" yet — totally normal. **Do you have any free download, template, guide, or similar that people get in exchange for their email?** If the answer is no, that's useful too: say something like "not yet" or "we don't," and your plan can include a short list of ideas we'll weave into the email and social campaigns we draft for you.`;
    case "has_clear_cta":
      return `When someone lands on your site or main profile, **how clear does the next step feel** — pretty obvious (like one main button or action), or still a little mixed? Whatever you share is the right answer.`;
    case "marketing_channel_mix":
      return "**Where are you showing up for people lately** — email, social, SEO or search, paid ads, referrals, events, YouTube, or something else? Name whatever fits; \"mostly one channel\" is a great answer too.";
    default:
      return `Great context so far. **Let's grab one more input** so your recommendations stay precise.${typeHint}`;
  }
}

function capturePromptPatternForKey(key: CaptureKey): RegExp {
  switch (key) {
    case "business_type_classifier":
      /**
       * Was previously over-broad ("thank you for sharing", "next question", "based on what you")
       * which marked unrelated transitional assistant turns as "asking the business-type capture",
       * letting the force-prompt step skip and causing the user-reported repeating loop. Now
       * limited to phrasing that actually concerns revenue model / who you sell to.
       */
      return /\b(primary revenue|how you generate revenue|how do you get paid|primarily get paid|it sounds like you'?re primarily|business model|launching|pre[- ]?launch|no clients yet|selling to|revenue model|describe (?:your|the) revenue|does that feel accurate)\b/i;
    case "website_presence":
      return /\b(website|url|domain|landing|site to share|web address|\.com|not on the web)\b/i;
    case "social_platform_presence":
      return /\b(social|instagram|linkedin|tiktok|platform|handle|@|not active|none yet|show up)\b/i;
    case "additional_marketing_surfaces":
      return /\b(outside|beyond|channels|email|seo|paid|events|referrals|word of mouth|marketing surfaces|investing attention)\b/i;
    case "monthly_revenue_range":
      return /\b(monthly revenue|month to month|mrr|arr|under \$?5k|\$?5k|\$?20k|\$?50k|\$?150k|ballpark|roughly|range|generate|bring in|figures)\b/i;
    case "average_transaction_value":
      return /\b(average (transaction|deal|order)|deal size|ticket|hourly|project fee|typical (invoice|project)|order value)\b/i;
    case "conversion_rate_estimate":
      return /\b(conversion rate|close rate|win rate|don't track|do not track|percentage|percent|track|no idea|no clue|idk|guess|haven'?t looked)\b/i;
    case "primary_acquisition_channel":
      return /\b(acquisition channel|qualified opportunities|referral|organic|search|social|paid|events|linkedin|instagram|tiktok|youtube|google|outbound|inbound|where .*find you|how (people|customers) (find|discover)|ig|insta|word of mouth|network)\b/i;
    case "monthly_marketing_budget":
      return /\b(monthly marketing budget|marketing spend|ad spend|under \$?500|\$?2,?000|\$?5,?000|budget)\b/i;
    case "content_creation_capacity":
      return /\b(content creation|hours per week|under 2 hours|2[–-]5 hours|5[–-]10 hours|10\+ hours|time.*content|how much time)\b/i;
    case "competitive_pressure_point":
      return /\b(lose deals|competitive|competitor|prospects choose|price|trust|clarity|proof|fit|why buyers|tilts? toward|compared to)\b/i;
    case "has_email_list":
      return /\b(email list|newsletter|mailing list|subscribers|mailchimp|klaviyo|list today|yes or no)\b/i;
    case "has_lead_magnet":
      return /\b(lead magnet|lead capture|opt-?in|gated|downloadable|free (download|resource|offer)|not yet|don't have)\b/i;
    case "has_clear_cta":
      return /\b(cta|call to action|next step|landing|site|profile|clear|mixed|confus)\b/i;
    case "marketing_channel_mix":
      return /\b(marketing channels|active channels|showing up|email|social|seo|search|paid|referrals|events|youtube|linkedin|instagram|tiktok|channels you)\b/i;
    default:
      return /\?/;
  }
}

function responseRequestsExpectedCapture(content: string, key: CaptureKey): boolean {
  return capturePromptPatternForKey(key).test(content);
}

/**
 * If the model asked a substantive follow-up that still touches the pending capture theme,
 * do not replace with verbatim capture text (avoids repeat loops and off-topic rambles passing).
 */
function assistantReplyLooksOnTopicForCapture(content: string, key: CaptureKey): boolean {
  const t = content.trim();
  if (t.length < 55 || !/\?/.test(t)) return false;
  return ON_TOPIC_ASSISTANT_HINTS[key].test(t);
}

function shouldForceCapturePrompt(finalContent: string, forcedPrompt: string, pendingKey: CaptureKey): boolean {
  if (responseRequestsExpectedCapture(finalContent, pendingKey)) return false;
  if (assistantReplyLooksOnTopicForCapture(finalContent, pendingKey)) return false;
  if (finalContent.trim() === forcedPrompt.trim()) return false;
  if (normalizedCapturePromptSlice(finalContent) === normalizedCapturePromptSlice(forcedPrompt)) return false;
  return true;
}

/** Observability for regex drift — extend `assistantAskedDedicatedSocialPlatformPresence` using logged `outboundPreview`. */
function maybeWarnSocialDedicatedPromptDetectorGap(
  pendingKey: CaptureKey | undefined,
  outboundReply: string,
  replacedWithApprovedWording: boolean,
): void {
  if (!pendingKey || pendingKey !== "social_platform_presence") return;
  if (assistantAskedDedicatedSocialPlatformPresence(outboundReply)) return;

  logger.warn(
    "[brand-snapshot intake] social_platform_presence pending but outbound reply did not match dedicated-social prompt heuristics",
    {
      intakeEvent: "social_presence_prompt_detector_gap",
      replacedWithApprovedWording,
      outboundPreview: normalizedCapturePromptSlice(outboundReply).slice(0, 360),
      outboundLength: outboundReply.length,
    },
  );
}

function normalizeBusinessTypeLabel(raw: unknown): BusinessType | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (value.includes("service_b2b") || value.includes("b2b service")) return "service_b2b";
  if (value.includes("service_b2c") || value.includes("b2c service")) return "service_b2c";
  if (value.includes("retail")) return "retail";
  if (value.includes("ecommerce") || value.includes("e-commerce") || value.includes("product brand")) return "ecommerce";
  if (value.includes("saas") || value.includes("software") || value.includes("app")) return "saas";
  if (value.includes("local_service") || value.includes("local service")) return "local_service";
  return null;
}

function inferBusinessTypeFromAnswers(answers: Record<string, unknown>): BusinessType {
  const corpus = [
    answers.businessName,
    answers.industry,
    answers.what_you_do,
    answers.businessDescription,
    answers.response_1,
    answers.response_2,
    answers.response_3,
  ]
    .filter((x): x is string => typeof x === "string")
    .join(" ")
    .toLowerCase();

  if (/\bsaas|software|app|subscription|platform\b/.test(corpus)) return "saas";
  if (/\be-?commerce|shopify|amazon|dtc|product\b/.test(corpus)) return "ecommerce";
  if (/\bretail|storefront|restaurant|boutique|food|beverage\b/.test(corpus)) return "retail";
  if (/\blocal|dental|medical|legal|salon|studio|clinic|contractor|trade\b/.test(corpus)) return "local_service";
  if (/\bb2c|consumer|clients|customers\b/.test(corpus)) return "service_b2c";
  return "service_b2b";
}

function normalizeStoredAnswers(raw: unknown): Record<string, unknown> {
  const answers =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? ({ ...(raw as Record<string, unknown>) } as Record<string, unknown>)
      : {};

  const explicitType =
    normalizeBusinessTypeLabel(answers.businessType) ||
    normalizeBusinessTypeLabel(answers.business_type) ||
    normalizeBusinessTypeLabel(answers.primaryRevenueModel);
  answers.businessType = explicitType || inferBusinessTypeFromAnswers(answers);

  if (typeof answers.monthlyRevenueRange !== "string" && typeof answers.monthly_revenue_range === "string") {
    answers.monthlyRevenueRange = answers.monthly_revenue_range;
  }
  if (typeof answers.averageTransactionValue !== "string" && typeof answers.average_transaction_value === "string") {
    answers.averageTransactionValue = answers.average_transaction_value;
  }
  if (typeof answers.conversionRateEstimate !== "string" && typeof answers.conversion_rate_estimate === "string") {
    answers.conversionRateEstimate = answers.conversion_rate_estimate;
  }
  if (typeof answers.monthlyMarketingBudget !== "string" && typeof answers.monthly_marketing_budget === "string") {
    answers.monthlyMarketingBudget = answers.monthly_marketing_budget;
  }
  if (typeof answers.contentCreationCapacity !== "string" && typeof answers.content_creation_capacity === "string") {
    answers.contentCreationCapacity = answers.content_creation_capacity;
  }

  if (!answers.leadMagnetDetails && answers.lead_magnet_details && typeof answers.lead_magnet_details === "object") {
    answers.leadMagnetDetails = answers.lead_magnet_details;
  }

  return answers;
}

function buildDeterministicRoutingGuard(
  messages: Array<{ role: string; content: string }>,
  options?: { includeBudgetCapture?: boolean; tier?: IntakeTier },
  softSkipKeys?: ReadonlySet<CaptureKey>,
): string {
  const tier = options?.tier ?? "snapshot";
  const includeBudgetCapture = options?.includeBudgetCapture === true;
  const inferredType = inferBusinessTypeFromHistory(messages);
  const captureStates = getEffectiveCaptureStates(messages, { includeBudgetCapture, tier }, softSkipKeys);
  const pending = captureStates.filter((x) => !x.completed);
  const nextCapture = pending[0]?.label ?? "none";
  const completionPercent = Math.round(
    (captureStates.filter((x) => x.completed).length / captureStates.length) * 100,
  );

  return [
    "DETERMINISTIC ROUTING GUARD (SERVER ENFORCED):",
    `- ${getBusinessTypeRoutingNotes(inferredType)}`,
    "- Ask one question at a time, and prioritize missing required captures before wrap-up.",
    `- Step-state completion: ${completionPercent}%`,
    `- Next required capture (strict order): ${nextCapture}.`,
    `- Pending required captures right now: ${pending.length ? pending.map((x) => x.label).join(", ") : "none"}.`,
    `- Tier capture policy: ${tier}.`,
    ...(softSkipKeys && softSkipKeys.size > 0
      ? [
          `- Anti-loop: server advanced past stuck capture key(s): ${[...softSkipKeys].join(", ")} — do not re-ask them this turn.`,
        ]
      : []),
    `- Step-state map (json): ${JSON.stringify(
      captureStates.reduce<Record<string, boolean>>((acc, c) => {
        acc[c.key] = c.completed;
        return acc;
      }, {}),
    )}`,
    "- Do not skip required captures unless user explicitly refuses; if they refuse, record null and proceed.",
    includeBudgetCapture
      ? "- Activation planning tier detected: monthly marketing budget capture is required."
      : "- Non-activation tier detected: do NOT ask budget questions (monthlyMarketingBudget, paidAdsBudgetBand, paidAdsPrimaryObjective). Keep these as null.",
    ...(tier === "snapshot" || tier === "snapshot-plus"
      ? [
          "- Snapshot-tier depth: when website / social / broader marketing-surface captures are pending, complete them before wrap-up — they anchor the WunderBrand Score™ (especially Visibility). Hold revenue, conversion, list/lead-magnet detail, and full activation-style channel mix for Snapshot+™ / Blueprint™; mention upgrades only after pending captures are handled, never as a substitute.",
        ]
      : []),
  ].join("\n");
}

export async function POST(req: Request) {
  // ─── Security: Rate limit + request size ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AI_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "brand-snapshot", rateLimit: AI_RATE_LIMIT, maxBodySize: 200_000 });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    
    // Check if this is a report save request (has brand_alignment_score)
    if (body.brand_alignment_score !== undefined || body.brandAlignmentScore !== undefined) {
      // This is a report save request
      const {
        user_email,
        user_name,
        brand_alignment_score,
        pillar_scores,
        pillar_insights,
        recommendations,
        website_notes,
        full_report,
        // Also support camelCase variants
        email,
        userName,
        brandAlignmentScore,
        pillarScores,
        pillarInsights,
        websiteNotes,
        fullReport,
      } = body;

      // Normalize field names (support both snake_case and camelCase)
      const finalEmail = user_email || email;
      const finalUserName = user_name || userName;
      const computedScore = computeBrandAlignmentFromPillars(
        (pillar_scores || pillarScores) as Record<string, unknown> | null | undefined,
      );
      const finalBrandAlignmentScore =
        computedScore ??
        (typeof brand_alignment_score === "number"
          ? brand_alignment_score
          : typeof brandAlignmentScore === "number"
            ? brandAlignmentScore
            : null);
      const finalPillarScores = pillar_scores || pillarScores;
      const finalPillarInsights = pillar_insights || pillarInsights;
      const finalRecommendations = recommendations || {};
      const finalWebsiteNotes = website_notes || websiteNotes;
      const incomingFullReport = full_report || fullReport || {};
      const normalizedAnswers = normalizeStoredAnswers(
        (incomingFullReport as Record<string, unknown>)?.answers,
      );
      const finalFullReport =
        incomingFullReport && typeof incomingFullReport === "object"
          ? {
              ...(incomingFullReport as Record<string, unknown>),
              answers: normalizedAnswers,
            }
          : { answers: normalizedAnswers };

      if (!finalEmail) {
        return NextResponse.json(
          { error: "Missing required field: user_email or email" },
          { status: 400 }
        );
      }

      if (!finalBrandAlignmentScore || !finalPillarScores) {
        return NextResponse.json(
          { error: "Missing required fields: brand_alignment_score and pillar_scores" },
          { status: 400 }
        );
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        return NextResponse.json(
          { error: "Database not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." },
          { status: 500 }
        );
      }

      const reportId = randomUUID();

      const { data, error } = await supabase
        .from("brand_snapshot_reports")
        .insert([
          {
            report_id: reportId,
            user_name: finalUserName ?? null,
            email: finalEmail,
            brand_alignment_score: finalBrandAlignmentScore,
            pillar_scores: finalPillarScores,
            pillar_insights: finalPillarInsights || {},
            recommendations: finalRecommendations,
            website_notes: finalWebsiteNotes ?? null,
            full_report: finalFullReport,
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error("Insert error", { error: error.message });
        return NextResponse.json(
          { error: "Database insert failed", details: error.message },
          { status: 500 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return NextResponse.json(
        {
          success: true,
          report_id: reportId,
          redirectUrl: `${baseUrl}/report/${reportId}`,
        },
        { status: 200 }
      );
    }

    // Otherwise, treat as chat/conversation request
    const { messages, productTier, continuationReportId: continuationReportIdRaw } = body || {};
    const continuationReportId =
      typeof continuationReportIdRaw === "string" ? continuationReportIdRaw.trim() : "";

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing or invalid 'messages' array." },
        { status: 400 }
      );
    }

    const intakeTier = normalizeIntakeTier(productTier);
    const includeBudgetCapture = isActivationPlanningTier(productTier);
    const inferredType = inferBusinessTypeFromHistory(messages);
    const captureOpts = { includeBudgetCapture, tier: intakeTier };

    const useUpgradeContinuation =
      intakeTier !== "snapshot" &&
      continuationReportId.length > 0 &&
      CONTINUATION_REPORT_UUID_RE.test(continuationReportId);

    let continuationAnswersPrimer: string | null = null;
    if (useUpgradeContinuation) {
      const prior = await loadPriorSnapshotAnswersForContinuation(continuationReportId);
      if (prior && Object.keys(prior).length > 0) {
        continuationAnswersPrimer = [
          "PRIOR WUNDERBRAND SNAPSHOT™ INTAKE (structured JSON — authoritative; merge into final output, do not re-ask unless missing/ambiguous):",
          serializeAnswersForContinuationPrompt(prior),
        ].join("\n\n");
      }
    }

    const rawPending = getNextPendingCapture(messages, captureOpts);
    const rawForced = rawPending ? buildCaptureQuestion(rawPending.key, inferredType) : null;
    const softSkipKeys = new Set<CaptureKey>();
    if (
      rawPending &&
      rawForced &&
      shouldSoftSkipDueToForcedPromptLoop(messages, rawForced, rawPending.key)
    ) {
      softSkipKeys.add(rawPending.key);
    }

    const nextPendingCapture = getNextPendingCapture(messages, captureOpts, softSkipKeys);
    const forcedCapturePrompt = nextPendingCapture
      ? buildCaptureQuestion(nextPendingCapture.key, inferredType)
      : null;

    const routingGuard = buildDeterministicRoutingGuard(messages, captureOpts, softSkipKeys);
    const antiLoopSystem =
      softSkipKeys.size > 0
        ? [
            "ANTI-LOOP CONTROL (mandatory): The same required intake question was already asked twice. The user's reply may not have registered in automation.",
            "Do not repeat that question. Optionally acknowledge in one short sentence, then ask ONLY the next single topic from the routing guard — or continue normally if no captures remain.",
          ].join(" ")
        : null;

    const hasChatAssetUploads = isActivationPlanningTier(productTier);
    const externalVoiceAndUploadGuard = [
      'EXTERNAL VOICE (mandatory): When addressing the user about what WunderBrand Snapshot™ delivers, say **diagnostic** — never "report". Natural phrasing: your diagnostic, the diagnostic, your diagnostic results. Do not read internal JSON field names aloud.',
      hasChatAssetUploads
        ? "FILE UPLOADS (Blueprint / Blueprint+ only): In-chat optional uploads use a paperclip-style control beside the message field (and the expandable asset panel). Q42 applies. Only mention the paperclip when guiding through Q42 on these tiers."
        : "FILE UPLOADS (Snapshot / Snapshot+): There is **no** in-chat file attachment on this tier. Never mention a paperclip, attaching files, or uploading brand materials in this chat. Skip Q42 entirely. If they described having guidelines or decks, thank them — their typed answers are enough.",
    ].join("\n\n");

    const aiMessages: ChatMessage[] = [
      { role: "system", content: wundySystemPrompt },
      {
        role: "system" as const,
        content: `CURRENT PRODUCT TIER: ${intakeTier}. Strictly follow tier capabilities for this turn.`,
      },
      ...(intakeTier === "snapshot"
        ? [{ role: "system" as const, content: wundySnapshotTierFragment }]
        : []),
      { role: "system" as const, content: wundyEarlyStageBuildModeFragment },
      ...(useUpgradeContinuation
        ? [{ role: "system" as const, content: wundyUpgradeContinuationFragment }]
        : []),
      ...(continuationAnswersPrimer
        ? [{ role: "system" as const, content: continuationAnswersPrimer }]
        : []),
      { role: "system", content: routingGuard },
      { role: "system", content: externalVoiceAndUploadGuard },
      ...(antiLoopSystem ? [{ role: "system" as const, content: antiLoopSystem }] : []),
      ...(!includeBudgetCapture
        ? [
            {
              role: "system" as const,
              content:
                "TIER GUARDRAIL: This user is not in an activation-planning tier. Do not ask about monthly marketing budget, paid ads budget, or paid ads objective. If those fields are needed in final JSON, set them to null and continue.",
            },
          ]
        : []),
      ...(forcedCapturePrompt && nextPendingCapture
        ? [
            {
              role: "system" as const,
              content: [
                "NEXT REQUIRED CAPTURE (this turn — single question only):",
                `This turn we're gently checking in on: ${modelFacingCaptureHint(nextPendingCapture.key)}.`,
                "Use the approved wording below verbatim, OR add at most one short warm sentence before it.",
                "Do not ask any other conversion, budget, or channel question in this same reply — including paraphrases of email list, free download/lead capture, CTA clarity, or marketing channels.",
                "",
                "Approved wording:",
                forcedCapturePrompt,
              ].join("\n"),
            },
          ]
        : []),
      ...buildModelTranscriptWindow(messages).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await completeWithFallback("assessment_chat", {
      messages: aiMessages,
    });

    const fallbackMessage =
      "Sorry, I had trouble creating your WunderBrand Snapshot™. Please try again.";
    let finalContent = completion.content || fallbackMessage;
    let replacedSocialCaptureWithApprovedWording = false;

    // Hard guard: if required capture is still pending but model drifted, force the expected question.
    if (
      nextPendingCapture &&
      forcedCapturePrompt &&
      shouldForceCapturePrompt(finalContent, forcedCapturePrompt, nextPendingCapture.key)
    ) {
      finalContent = forcedCapturePrompt;
      replacedSocialCaptureWithApprovedWording = nextPendingCapture.key === "social_platform_presence";
    }

    finalContent = dedupeAssistantRepeatedParagraphChunks(finalContent);

    finalContent = sanitizeTierAssistantReply(finalContent, {
      hasInChatUploads: hasChatAssetUploads,
      intakeTier: intakeTier as ChatTier,
    });

    maybeWarnSocialDedicatedPromptDetectorGap(
      nextPendingCapture?.key,
      finalContent,
      replacedSocialCaptureWithApprovedWording,
    );

    return NextResponse.json({
      content: finalContent,
      _ai: { provider: completion.provider, model: completion.model },
    });
  } catch (err: any) {
    logger.error("[WunderBrand Snapshot™ API] error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      {
        error:
          err?.message ||
          "There was an issue reaching the WunderBrand Snapshot™ specialist. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
