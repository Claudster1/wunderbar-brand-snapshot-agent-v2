/**
 * Short, literal user replies that still answer the last assistant question on a capture topic.
 * Uses general rules for common chat patterns (e.g. comma / "and" lists mirroring option-style questions).
 */

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
  /\b(organic|seo|search|google|referral|referrals|social|linkedin|instagram|tiktok|facebook|fb|meta|youtube|yt|paid|ppc|sem|ads?|direct|email|events|wom|word of mouth|pr\b|newsletter|podcast|content|cold|outbound|inbound|partners|partner|marketplace|community|threads|pinterest|snapchat|reddit)\b/i.test(
    chunk,
  );

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
  if (t.length === 0 || t.length > SHORT_CAPTURE_REPLY_MAX) return false;
  if (MEANINGLESS_ACK_ONLY.test(t)) return false;

  switch (key) {
    case "business_type_classifier": {
      const asked =
        /\b(get paid|who (are you |do you )?(mainly )?selling|revenue model|business model|one sentence|describe your|gut check|feel accurate|primarily running|tailor this|how do you)\b/i.test(
          la,
        );
      const answered =
        /\b(b2b|b2c|saas|e-?commerce|ecommerce|retail|consult|consulting|agency|freelanc|product|local|service|software|app|subscription|shopify|amazon|coaching|contractor|clinic|restaurant|consumer|businesses|founders|dtc|dtc brand|marketplace|nonprofit|wholesale|manufactur)\b/i.test(
          t,
        );
      const listAnswer = asked && terseMultiItemAllMatch(t, 2, CHUNK_BUSINESS_MODEL);
      return (asked && answered) || listAnswer;
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
      const asked =
        /\b(social|instagram|linkedin|tiktok|platforms|show up|handles?|profiles?)\b/i.test(la);
      const answered =
        /\b(instagram|ig|linkedin|tiktok|facebook|fb|meta|youtube|yt|threads|twitter|\bx\b|pinterest|snapchat|reddit|bluesky|none|not really|not active|don'?t use|skip|n\/a)\b/i.test(t) ||
        /@[a-z0-9_]{2,}/i.test(t) ||
        terseMultiItemAllMatch(t, 2, CHUNK_CHANNEL);
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
