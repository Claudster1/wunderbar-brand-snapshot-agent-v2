/**
 * Short, literal user replies that still answer the last assistant question on a capture topic.
 * Uses general rules for common chat patterns (e.g. comma / "and" lists mirroring option-style questions).
 */

import { CAPTURE_REFUSAL_PATTERN } from "@/lib/intake/captureRefusal";

export type CaptureKey =
  | "business_type_classifier"
  | "website_presence"
  | "social_platform_presence"
  | "additional_marketing_surfaces"
  | "monthly_revenue_range"
  | "average_transaction_value"
  | "conversion_rate_estimate"
  | "primary_acquisition_channel"
  | "monthly_marketing_budget"
  | "content_creation_capacity"
  | "competitive_pressure_point"
  | "has_email_list"
  | "has_lead_magnet"
  | "has_clear_cta"
  | "marketing_channel_mix";

const US_PRE_REVENUE_OR_MONEY =
  "pre-?money|side (hustle|gig)|main gig|moonlighting|haven'?t monetized|not monetized|bootstrapp?(ed|ing)?|ramen profitable|making (peanuts|zilch|bupkis|squat|nada)|pennies so far|not much money-?wise|riding on savings";

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

/** Terse replies still count when they clearly answer the last asked capture. */
const SHORT_CAPTURE_REPLY_MAX = 200;

/** Max length of one item when splitting "A, B and C" style answers. */
const ENUM_ITEM_MAX_LEN = 44;

const MEANINGLESS_ACK_ONLY = /^(ok+|k\.?|kk|thanks?!?|thank you|ty|got it|cool|sure|nice|great|perfect)\.?$/i;

/** Narrative answers are typical — skipping the global 200-char cap avoids false incomplete captures & repeat questions. */
const FLEXIBLE_CAPTURE_ALLOWS_LONG_REPLY: CaptureKey[] = [
  "social_platform_presence",
  "website_presence",
  "additional_marketing_surfaces",
];

/**
 * Splits user text into items when people answer option-style questions as lists
 * ("x and y", "x, y", "x / y", "x + y", "x or y") — general pattern, not question-specific.
 */
export function splitTerseEnumeration(lu: string): string[] {
  const t = lu.trim();
  if (!t) return [];
  return t
    .split(/\s*(?:,|\/|&|\+|\s+and\s+|\s+or\s+)\s*/i)
    .map((s) => s.trim().replace(/^[•\-–—]\s*/, ""))
    .filter((s) => s.length > 0 && s.length <= ENUM_ITEM_MAX_LEN);
}

function terseMultiItemAllMatch(lu: string, minItems: number, chunkTest: (chunk: string) => boolean): boolean {
  const chunks = splitTerseEnumeration(lu);
  return chunks.length >= minItems && chunks.every(chunkTest);
}

const CHUNK_COMPETITIVE_FACTOR = (chunk: string) =>
  /\b(price|pricing|cheaper|cost|trust|clarity|speed|proof|fit|reputation|features|support|brand|timing|awareness|quality|service|delivery|experience|credibility|visibility|warranty|onboarding|ux|ui|capacity)\b/i.test(
    chunk,
  );

const CHUNK_CHANNEL = (chunk: string) =>
  /\b(organic|seo|search|google|referral|referrals|social|linked\s*in|linkedin|instagram|tiktok|facebook|fb|meta|youtube|yt|paid|ppc|sem|ads?|direct|email|events|wom|word of mouth|pr\b|newsletter|podcast|content|cold|outbound|inbound|partners|partner|marketplace|community|threads|pinterest|snapchat|reddit|mastodon|discord|twitch|telegram|slack|medium|substack|behance|dribbble|github)\b/i.test(
    chunk,
  );

/** Named networks / surfaces — distinct from generic channel words like "organic" or "paid social". */
const SOCIAL_PLATFORM_TOKEN_RE =
  /\b(instagram|ig|linked\s*in|linkedin|tiktok|facebook|fb|meta|youtube|yt|threads|twitter|\bx\b|pinterest|snapchat|reddit|bluesky|mastodon|discord|twitch|medium|substack|be\s*real|whatsapp|telegram|behance|dribbble|github|slack|tik tok)\b/i;

function isOrganicPaidSocialBundlePhrase(chunk: string): boolean {
  return /^(organic|paid|native|programmatic)\s+social$/i.test(chunk.trim());
}

function chunkIsExplicitSocialPlatformName(chunk: string): boolean {
  if (isOrganicPaidSocialBundlePhrase(chunk)) return false;
  return SOCIAL_PLATFORM_TOKEN_RE.test(chunk.trim());
}

/**
 * Lists like "LinkedIn + Instagram" count; "organic and paid social" does not — those are acquisition
 * mix phrases where every terse chunk matches CHUNK_CHANNEL but names no owned profile.
 */
function socialPresenceTerseListSignal(t: string): boolean {
  const chunks = splitTerseEnumeration(t);
  if (chunks.length < 2) return false;
  const itemOk = (ch: string) => {
    const s = ch.trim();
    if (!s) return false;
    if (/^(social|socials?)$/i.test(s)) return true;
    return chunkIsExplicitSocialPlatformName(ch);
  };
  if (!chunks.every(itemOk)) return false;
  return chunks.some(chunkIsExplicitSocialPlatformName);
}

const SINGLE_TERSE_SOCIAL_PLATFORM_CHUNK = (chunk: string) => {
  const s = chunk.trim();
  if (!s) return false;
  if (/^(social|socials?)$/i.test(s)) return true;
  return chunkIsExplicitSocialPlatformName(chunk);
};

function socialPresenceAnswerSignal(t: string): boolean {
  return (
    SOCIAL_PLATFORM_TOKEN_RE.test(t) ||
    /\b(?:none\b|none yet|nowhere|nothing really|mostly nowhere|minimal (social )?presence|light (social )?presence|not much there|barely there online)\b|^no\.?$/i.test(
      t,
    ) ||
    /\b(nah|nope|not really|no social|not active|not actively|inactive|skipped social|haven'?t prioritized|barely post|hardly post|don'?t (really )?post|lurking|lurker|ghost (town|profiles?)|(don'?t|doesn'?t) have much of a social|no steady social(\s+rhythm)?|not a social (brand|shop)|we skip social|inactive on social|not really on social)\b/i.test(
      t,
    ) ||
    /\bbarely\b.{0,48}\bsocial\b|\bsocial\b.{0,48}\bbarely\b/i.test(t) ||
    /@[a-z0-9_]{2,}/i.test(t) ||
    socialPresenceTerseListSignal(t)
  );
}

/**
 * Carousel / breadth prompts that mention "social" alongside email+paid aren't the dedicated Snapshot
 * "where does the brand live on social" capture — pairing those with platform tokens would falsely
 * complete `social_platform_presence`.
 */
function isBreadthChannelMixCarouselPrompt(la: string): boolean {
  return (
    /\bwhere\b.{0,40}\bshow(ing)?\s+up\s+for people\b/i.test(la) ||
    /\bshowing up for people\b/i.test(la) ||
    /\bwhich\s+(marketing\s+)?channels\b.{0,100}\b(actively|running|using)\b/i.test(la) ||
    /\bemail\b.{0,120}\bsocial\b.{0,120}\bpaid\b/i.test(la) ||
    /\bemail\b.{0,120}\bpaid\b.{0,120}\bsocial\b/i.test(la) ||
    /\borganic\b.{0,90}\bpaid\b.{0,90}\bsocial\b/i.test(la) ||
    /\b(channel|marketing)\s+mix\b/i.test(la)
  );
}

/** "Where do customers find you?" style prompts — includes "…social, paid…" enumeration. */
function isAcquisitionCustomerDiscoveryPrompt(la: string): boolean {
  return (
    /\bwhere\b.{0,120}\b(customers|clients|buyers|prospects)\b.{0,60}\b(find you|finding you|discover|heard about|come from|learn about)\b/i.test(
      la,
    ) || /\b(most\s+new\s+customers|new\s+customers)\b.{0,40}\bfind\b/i.test(la)
  );
}

/** Lead magnet / gated-content prompts sometimes mention email + social campaigns; not social presence intake. */
function isLeadMagnetOrEmailGatePrompt(la: string): boolean {
  return (
    /\blead magnet\b/i.test(la) ||
    /\bopt-?in\b/i.test(la) ||
    /\bgated content\b/i.test(la) ||
    /\bin exchange for.{0,50}their email\b/i.test(la) ||
    /\bin exchange for.{0,50}email\b/i.test(la)
  );
}

/** CTA clarity on site/profile — `\bprofiles?\b` overlaps dedicated-social heuristics. */
function isSiteOrMainProfileNextStepPrompt(la: string): boolean {
  return /\bhow clear\b.{0,180}\b(your site|main profile|landing|next step|\bcta\b|call to action)\b/i.test(la);
}

function dedicatedSocialPresenceAskSignals(la: string): boolean {
  if (
    /\*\*where does your brand show up on social/i.test(la) ||
    /\bwhere does your brand show up on social\b/i.test(la) ||
    /\bbrand show up on social\b/i.test(la) ||
    /\bwhere\b.{0,54}\byour brand\b.{0,64}\b(on social|social)\b/i.test(la) ||
    /\bplatforms that matter\b/i.test(la) ||
    /\bname the platforms\b/i.test(la) ||
    (/\bor say\b.{0,80}\bnone\b/i.test(la) && /\bsocial\b/i.test(la)) ||
    (/\bnot really active yet\b/i.test(la) && /\bsocial\b/i.test(la))
  ) {
    return true;
  }

  const whichPlatformBreadth =
    /\b(which|what)\b.{0,56}\bplatforms\b/i.test(la) &&
    /\b(matter|use|post|posting|active|maintain|prioritize|focus|running|care)\b/i.test(la);

  const whichNetworks =
    /\b(which|what)\b.{0,44}\bnetworks?\b/i.test(la) &&
    /\b(you|your|brand|still|actually|really|mostly)\b/i.test(la);

  return (
    /\bsocial media\b/i.test(la) ||
    /\bsocial platforms?\b/i.test(la) ||
    /\bwhere\b.{0,100}\bsocial\b/i.test(la) ||
    /\bsocial\b.{0,40}\b(today|right now|these days|for the brand)\b/i.test(la) ||
    /\b(show up|showing up)\b.{0,48}\bon social\b/i.test(la) ||
    /\bon social\b.{0,36}\b(today|now|these days|\?)/i.test(la) ||
    /\b(those socials|your socials|other socials)\b/i.test(la) ||
    whichPlatformBreadth ||
    whichNetworks
  );
}

/**
 * Detects assistant turns that explicitly ask where the brand is on social / which profiles matter.
 * Narrow on purpose: a bare `\bsocial\b` inside acquisition ("organic, social, paid") or lead-magnet copy
 * is not this capture.
 */
export function assistantAskedDedicatedSocialPlatformPresence(la: string): boolean {
  const s = la.trim();
  if (!s || isBreadthChannelMixCarouselPrompt(la)) return false;
  /** Bridges into email/SEO/paid (`additional_marketing_surfaces`). */
  if (/\b(beyond|outside)\s+your\s+(website|site)\b/i.test(la)) return false;
  if (isAcquisitionCustomerDiscoveryPrompt(la)) return false;
  if (isLeadMagnetOrEmailGatePrompt(la)) return false;
  if (isSiteOrMainProfileNextStepPrompt(la)) return false;
  return dedicatedSocialPresenceAskSignals(la);
}

function socialPresenceUserReplyMatchesFlexibleCapture(lu: string): boolean {
  const t = lu.trim();
  if (!t) return false;
  return (
    socialPresenceAnswerSignal(t) ||
    (t.length <= 48 && terseMultiItemAllMatch(t, 1, SINGLE_TERSE_SOCIAL_PLATFORM_CHUNK))
  );
}

const CHUNK_BUSINESS_MODEL = (chunk: string) =>
  /\b(b2b|b2c|saas|e-?commerce|ecommerce|retail|consult|consulting|agency|freelanc|product|local|service|software|app|subscription|shopify|amazon|coaching|contractor|clinic|restaurant|consumer|businesses|founders|dtc|marketplace|nonprofit|wholesale|manufactur)\b/i.test(
    chunk,
  );

const CHUNK_CTA_CLARITY = (chunk: string) =>
  /\b(clear|obvious|confus|mixed|muddy|unclear|pretty|fairly|sort of|kind of|meh|messy|straightforward|simple|obfuscated|busy)\b/i.test(
    chunk,
  );

export function isBareAffirmOrDeny(text: string): boolean {
  const t = text.trim();
  if (t.length > 48) return false;
  const normalized = t.replace(/[""''`]/g, "").replace(/\s+/g, " ");
  if (/^[yn]\.?$/i.test(normalized)) return true;
  return /^(yes|yeah|yep|yup|no|nope|nah|naw|sure|not really|no thanks|no thank you|no gracias|sí|si|oui|non|ja|nein|vale|claro|да|нет)\.?$/i.test(
    normalized,
  );
}

/**
 * Marks a capture complete when the assistant just asked about this topic (la) and the user
 * answered in a short, substantive way (lu) — without requiring narrative phrasing.
 */
export function flexibleDirectCaptureComplete(key: CaptureKey, la: string, lu: string): boolean {
  if (!la || !lu) return false;
  const t = lu.trim();
  if (t.length === 0) return false;
  if (t.length > SHORT_CAPTURE_REPLY_MAX && !FLEXIBLE_CAPTURE_ALLOWS_LONG_REPLY.includes(key)) return false;
  if (MEANINGLESS_ACK_ONLY.test(t)) return false;

  switch (key) {
    case "business_type_classifier": {
      const asked =
        /\b(get paid|who (are you |do you )?(mainly )?selling|revenue model|business model|one sentence|describe your|gut check|feel accurate|primarily running|tailor this|how do you)\b/i.test(
          la,
        );
      /**
       * When Wundy proposed an inferred business model and the user briefly confirms, that closes the capture.
       * Without this, "yes / yep / sounds right" loops the model back into the same question.
       */
      const askedAsConfirmation =
        /\b(does that (feel|sound) (accurate|right)|is that (right|accurate)|primarily running a|sounds? like you'?re|describe (your|the) (revenue|business) model differently)\b/i.test(
          la,
        );
      const confirmedShort = askedAsConfirmation && isBareAffirmOrDeny(t);
      const answered =
        /\b(b2b|b2c|saas|e-?commerce|ecommerce|retail|consult|consulting|agency|freelanc|product|local|service|software|app|subscription|shopify|amazon|coaching|contractor|clinic|restaurant|consumer|businesses|founders|dtc|dtc brand|marketplace|nonprofit|wholesale|manufactur)\b/i.test(
          t,
        );
      /**
       * Plain audience descriptors ("smbs and startups", "small businesses", "founders") answer the
       * "who are you selling to" half of the prompt. Pair with business_type inference upstream so we
       * don't re-ask just because they led with their customer, not their model.
       */
      const audienceDescriptor =
        /\b(smbs?|smb|smbs|smb's|smbs'|startups?|scale[- ]?ups?|enterprises?|mid[- ]?market|small businesses?|mid[- ]?size(d)? businesses?|founders?|ceos?|owners?|operators?|marketers?|marketing (teams?|leads?)|teams?|brands?|agencies|individuals|professionals|consumers?|clients|customers)\b/i.test(
          t,
        );
      const listAnswer = asked && terseMultiItemAllMatch(t, 2, CHUNK_BUSINESS_MODEL);
      return (asked && (answered || audienceDescriptor)) || listAnswer || confirmedShort;
    }
    case "monthly_revenue_range": {
      const asked =
        /\b(month to month|monthly|bring in|generate|revenue|figures|mrr|arr|ballpark|how much.*business)\b/i.test(la);
      const answered =
        REVENUE_MONEY_OR_RANGE.test(t) ||
        /\$|€|£|\d{1,3}(,\d{3})+\b|\d+k\b|\d+\s*k\/mo|six-?figures|seven-?figures|pre-?revenue|not much|next to nothing/i.test(
          t,
        );
      return asked && answered;
    }
    case "average_transaction_value": {
      const asked =
        /\b(average|deal size|transaction|order value|ticket|rough estimate|ballpark).*\b(value|size|today)\b|\b(how much|what).*\b(deal|order|transaction|project|hour)\b/i.test(
          la,
        );
      const answered =
        /\$|€|£|~\s*\$|hourly|per hour|per project|aov|\d{1,3}(,\d{3})*|\d+k?\b|smaller|larger|varies|depends|retainer|package/i.test(
          t,
        );
      return asked && answered;
    }
    case "conversion_rate_estimate": {
      const asked = /\b(conversion|close rate|win rate|track it|do you track)\b/i.test(la);
      const answered =
        /\d\s*%|\d+\s*percent|one in \d|don'?t track|do not track|not tracking|no data|n\/a|roughly|approx|wild guess|haven'?t measured/i.test(
          t,
        );
      return asked && answered;
    }
    case "website_presence": {
      const asked =
        /\b(website|url|web address|domain|site to share|online home|\.com)\b/i.test(la) ||
        /\b(have (a )?website|do you have.*site)\b/i.test(la);
      const urlAnswer =
        /\b(https?:\/\/|www\.)\S+|[a-z0-9][-a-z0-9]{0,48}\.(com|io|ai|co|org|net|app|dev|us|uk|shop)\b/i.test(t);
      const noSite =
        /\b(no|nope|don'?t|do not) (have|got)|not yet|no website|no site|instagram only|facebook only|linkedin only|linktr|linktree|etsy only|marketplace only|coming soon|building (the )?site|not live\b/i.test(
          t,
        );
      return asked && (urlAnswer || noSite);
    }
    case "social_platform_presence": {
      const asked = assistantAskedDedicatedSocialPlatformPresence(la);
      const answered = socialPresenceUserReplyMatchesFlexibleCapture(lu);
      return asked && answered;
    }
    case "additional_marketing_surfaces": {
      const asked =
        /\b(outside|beyond|other channels|marketing surfaces|investing attention|else are you|beyond your (website|site))\b/i.test(
          la,
        );
      const answered =
        /\b(email|newsletter|seo|search|content|paid|ads?|ppc|events?|webinars?|partners|referrals|word of mouth|wom|podcast|pr\b|nothing else|not much|mostly|just|only organic)\b/i.test(
          t,
        ) || terseMultiItemAllMatch(t, 2, CHUNK_CHANNEL);
      return asked && answered;
    }
    case "primary_acquisition_channel": {
      const asked =
        /\b(where|find you|finding you|channel|coming from|most new|customers|clients|discovery|acquisition)\b/i.test(
          la,
        );
      const singleOrNarrative =
        /\b(organic|seo|search|google|referral|referrals|social|linkedin|instagram|tiktok|facebook|fb|meta|youtube|yt|paid|ppc|sem|ads?|direct|email|events|word of mouth|wom|content|pr\b|cold|outbound|inbound|partners|marketplace|community|podcast|newsletter|tik tok)\b/i.test(
          t,
        );
      const listAnswer = asked && terseMultiItemAllMatch(t, 2, CHUNK_CHANNEL);
      return asked && (singleOrNarrative || listAnswer);
    }
    case "monthly_marketing_budget": {
      const asked = /\b(marketing budget|spend on marketing|ad spend|monthly.*budget)\b/i.test(la);
      const answered =
        /\$|€|£|\d+k?\b|zero|none|nothing|minimal|tight|small|experimental|ballpark|under \d|about \d|~\d/i.test(
          t,
        );
      return asked && answered;
    }
    case "content_creation_capacity": {
      const asked = /\b(content creation|hours|per week|time.*content|invest in content)\b/i.test(la);
      const answered =
        /\b(few|couple|none|minimal|almost no|basically none|full[\s-]?time|part[\s-]?time|outsource|agency|we don'?t|not much time)\b/i.test(
          t,
        ) ||
        /\b\d{1,2}\s*(hours?|hrs?)\b/i.test(t) ||
        /\b\d+\s*[-–]\s*\d+\s*(hours?|hrs?)\b/i.test(t) ||
        /\b(10|under 2|2\s*[–-]\s*5|5\s*[–-]\s*10)\+?\s*(hours?|hrs?)?\b/i.test(t);
      return asked && answered;
    }
    case "competitive_pressure_point": {
      const asked =
        /\b(competitor|competition|choose (a )?competitor|over you|instead of you|why (they|people|buyers|prospects) (pick|choose)|pressure point|lose (deals|a deal)|comes up most often)\b/i.test(
          la,
        );
      if (!asked || t.length > 160) return false;
      const listAnswer = terseMultiItemAllMatch(t, 2, CHUNK_COMPETITIVE_FACTOR);
      const singleFactor =
        /\b(price|pricing|cheaper|trust|clarity|speed|proof|fit|reputation|features|support|brand|timing|awareness)\b/i.test(
          t,
        );
      return listAnswer || singleFactor;
    }
    case "has_email_list": {
      const asked = /\b(email list|newsletter|mailing list|sending to)\b/i.test(la);
      return (
        asked &&
        (isBareAffirmOrDeny(t) ||
          /\b(yes|yeah|yep|no|nope|nah|not yet|small|tiny|few hundred|building|starting|mailchimp|klaviyo|substack)\b/i.test(
            t,
          ))
      );
    }
    case "has_lead_magnet": {
      const asked =
        /\b(lead magnet|free download|template|guide|checklist|exchange for.*email|gated|opt-?in|free.*email)\b/i.test(
          la,
        );
      return (
        asked &&
        (isBareAffirmOrDeny(t) ||
          /\b(yes|yeah|no|nope|not yet|don'?t|pdf|webinar|quiz|freebie|nothing yet|haven'?t)\b/i.test(t))
      );
    }
    case "has_clear_cta": {
      const asked =
        /\b(next step|how clear|cta|call to action|landing|site|main profile|button|action)\b/i.test(la);
      const single =
        /\b(clear|obvious|confus|mixed|muddy|unclear|pretty|fairly|sort of|kind of|meh|one main|too many|obvious|straightforward)\b/i.test(
          t,
        );
      const listAnswer = asked && terseMultiItemAllMatch(t, 2, CHUNK_CTA_CLARITY);
      return asked && (single || listAnswer);
    }
    case "marketing_channel_mix": {
      const asked =
        /\b(showing up|channels|where.*lately|marketing channel|actively using|putting your marketing)\b/i.test(la);
      const single =
        /\b(email|social|seo|search|paid|referral|referrals|events|youtube|linkedin|instagram|tiktok|facebook|meta|google|newsletter|content|pr\b|podcast|tik tok|threads|pinterest|snapchat)\b/i.test(
          t,
        );
      const listAnswer = asked && terseMultiItemAllMatch(t, 2, CHUNK_CHANNEL);
      return asked && (single || listAnswer);
    }
    default:
      return false;
  }
}

/** User declines in the immediate turn after a dedicated social prompt — no global user corpus. */
export function socialPresenceImmediateRefusalAfterDedicatedPrompt(
  messages: Array<{ role: string; content: string }>,
): boolean {
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role !== "assistant") continue;
    const la = String(messages[i].content || "");
    if (!assistantAskedDedicatedSocialPlatformPresence(la)) continue;
    for (let j = i + 1; j < messages.length; j++) {
      if (messages[j].role === "assistant") break;
      if (messages[j].role !== "user") continue;
      const lu = String(messages[j].content || "").trim();
      if (lu && CAPTURE_REFUSAL_PATTERN.test(lu)) return true;
      break;
    }
  }
  return false;
}

/**
 * True when some assistant turn asked about `key` (per flexibleDirectCaptureComplete "asked" rules)
 * and the first following user turn satisfies flexibleDirectCaptureComplete for that key.
 *
 * The API route also pairs only the *latest* assistant + user messages; a model follow-up after a valid
 * answer (e.g. a thank-you + next question) breaks that pairing and leaves captures falsely incomplete,
 * which forces the same intake question again.
 */
export function captureKeySatisfiedFromHistory(
  key: CaptureKey,
  messages: Array<{ role: string; content: string }>,
): boolean {
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role !== "assistant") continue;
    const la = String(messages[i].content || "");
    for (let j = i + 1; j < messages.length; j++) {
      if (messages[j].role === "assistant") break;
      if (messages[j].role === "user") {
        const lu = String(messages[j].content || "").trim();
        if (flexibleDirectCaptureComplete(key, la, lu)) return true;
        break;
      }
    }
  }
  return false;
}
