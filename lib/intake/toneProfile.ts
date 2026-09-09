/**
 * Chat tone / wording profile derived from business archetype + audience.
 * Capture questions and chips branch on this; scoring fields stay the same.
 */

import { inferConsumerVertical } from "@/lib/intake/consumerVertical";

export type CaptureBusinessType =
  | "service_b2b"
  | "service_b2c"
  | "retail"
  | "ecommerce"
  | "saas"
  | "local_service";

export type AudienceKind = "B2B" | "B2C" | "both";

/** When audience is both, which side dominates day-to-day marketing voice. */
export type MarketingAudienceFocus = "B2B" | "B2C";

export type ToneProfileId =
  | "b2b_professional"
  | "b2c_local_service"
  | "b2c_hospitality"
  | "b2c_retail"
  | "b2c_professional"
  | "ecommerce"
  | "saas"
  | "neutral";

export type ToneContext = {
  businessType?: CaptureBusinessType | null;
  audienceType?: AudienceKind | null;
  /** When audience is both — which side drives most marketing language */
  marketingAudienceFocus?: MarketingAudienceFocus | null;
  /** Free-text industry / offer hints from the transcript */
  industryHint?: string | null;
  userCorpus?: string | null;
};

/** Explicit hospitality venues — avoid bare "menu/food/beverage" false positives. */
const HOSPITALITY_RE =
  /\b(restaurant|cafes?|café|coffee shop|bakery|bars?|bistro|food truck|catering|hospitality|hotels?|inns?|diners?|pizzeria|brewery|winery)\b/i;
const LOCAL_BEAUTY_RE =
  /\b(salon|hair|barber|beauty|spa|nails?|esthetic|medspa|med spa|massage|tattoo|pilates|yoga studio|dental|dentist|chiro|clinic|vet|grooming)\b/i;
const LOCAL_TRADES_RE =
  /\b(hvac|plumb|electric|roofing|landscap|contractor|trades?|cleaning|detailing|auto repair)\b/i;
const CONSUMER_PRO_RE =
  /\b(financial advisor|financial \/ advisory|wealth|insurance|tax prepar|bookkeep|cpa\b|consumer legal|family law|estate planning|real estate agent|realtor|mortgage|lending|credit repair|personal finance|consumer financial)\b/i;

/** Shared heuristic — salon/hospitality must not default to B2B consulting. */
export function inferBusinessTypeFromCorpus(userCorpus: string): CaptureBusinessType | null {
  const c = userCorpus.toLowerCase();
  if (!c.trim()) return null;

  // Prefer SaaS only when software-ish — exclude salon booking "app" chatter via beauty/local first later;
  // still avoid matching "appointment".
  if (
    /\b(saas|software as a service|subscription software|software product)\b/.test(c) ||
    (/\b(software|saas)\b/.test(c) && !LOCAL_BEAUTY_RE.test(c) && !HOSPITALITY_RE.test(c)) ||
    (/\b(mobile )?app\b/.test(c) &&
      /\b(saas|software|platform|startup|users|subscribers)\b/.test(c) &&
      !LOCAL_BEAUTY_RE.test(c))
  ) {
    return "saas";
  }
  if (/\be-?commerce|shopify|dtc|amazon seller|online store|product brand|dropship\b/.test(c)) {
    return "ecommerce";
  }
  // Hospitality venues → retail (foot traffic + local discovery)
  if (HOSPITALITY_RE.test(c)) {
    return "retail";
  }
  // Consumer finance / advisory / realtor etc. before B2B consulting
  if (CONSUMER_PRO_RE.test(c)) {
    return "service_b2c";
  }
  if (
    LOCAL_BEAUTY_RE.test(c) ||
    LOCAL_TRADES_RE.test(c) ||
    /\blocal service|home service|in-?home|mobile (barber|stylist|detail)\b/.test(c)
  ) {
    return "local_service";
  }
  if (/\bb2b|other businesses|business clients|enterprise|smbs?\b/.test(c)) {
    return "service_b2b";
  }
  if (/\bb2c|consumers|consumer clients|personal service|individual clients|guests|patients|shoppers\b/.test(c)) {
    return "service_b2c";
  }
  // Explicit consulting/agency AFTER local/hospitality/consumer-pro checks
  if (
    /\b(consulting|consultants?|agency|agencies|freelance|professional services|b2b coaching|executive coaching)\b/.test(
      c,
    )
  ) {
    return "service_b2b";
  }
  if (/\b(coaching|personal training|tutoring|lessons)\b/.test(c)) {
    return "service_b2c";
  }
  if (/\bretail|storefront|boutique\b/.test(c)) return "retail";
  return null;
}

export function inferAudienceTypeFromCorpus(userCorpus: string): AudienceKind | null {
  const c = userCorpus.toLowerCase();
  if (!c.trim()) return null;
  if (/\b(mostly )?b2b\b|other businesses|business clients|enterprise|smbs?\b/.test(c)) {
    if (/\b(mostly )?b2c\b|consumers|mix of both|meaningful mix\b/.test(c)) return "both";
    return "B2B";
  }
  if (/\b(mostly )?b2c\b|consumers|guests|patients|shoppers|homeowners|families\b/.test(c)) {
    return "B2C";
  }
  if (/\bmeaningful mix|mix of both|b2b and b2c\b/.test(c)) return "both";
  return null;
}

/** Prefer explicit chip answers when present in the transcript. */
export function lockedAudienceFromMessages(
  messages: Array<{ role: string; content: string }>,
): AudienceKind | null {
  const users = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join("\n");
  if (/\bmeaningful mix of both\b|\bmix of both\b|\bboth \/ meaningful mix\b/i.test(users)) {
    return "both";
  }
  if (/\bmostly b2b\b|\bother businesses \(b2b\)\b/i.test(users)) return "B2B";
  if (/\bmostly b2c\b|\bconsumers \(b2c\)\b/i.test(users)) return "B2C";
  return inferAudienceTypeFromCorpus(users);
}

export function lockedBusinessTypeFromMessages(
  messages: Array<{ role: string; content: string }>,
): CaptureBusinessType | null {
  const users = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join("\n");
  // Chip labels from business_type_classifier (prefer specific locks)
  if (/\blocal \/ personal services\b/i.test(users)) return "local_service";
  if (/\bbusiness consulting \/ agency\b/i.test(users)) return "service_b2b";
  if (/\bsaas\s*\/\s*software|saas \/ software \/ app\b/i.test(users)) return "saas";
  if (/\be-?commerce\s*\/\s*dtc|e‑commerce \/ dtc product\b/i.test(users)) return "ecommerce";
  if (/\bretail or in-person\b/i.test(users)) return "retail";
  if (/\bmarketplace or platform\b/i.test(users)) return "saas";
  if (/\bphysical product \/ wholesale\b/i.test(users)) return "ecommerce";
  // Legacy ambiguous "Services / consulting" — refine from corpus / audience
  if (/\bservices\s*\/\s*consulting\b/i.test(users)) {
    const refined = inferBusinessTypeFromCorpus(users);
    if (refined === "local_service" || refined === "service_b2c" || refined === "service_b2b") {
      return refined;
    }
    const aud = lockedAudienceFromMessages(messages);
    if (aud === "B2C") return "service_b2c";
    if (aud === "B2B") return "service_b2b";
  }
  return inferBusinessTypeFromCorpus(users);
}

/** Product brand that also sells from a physical storefront / showroom. */
export function isHybridProductRetail(corpus: string): boolean {
  const c = String(corpus || "").toLowerCase();
  if (!c.trim()) return false;
  const online =
    /\be-?commerce|shopify|online store|dtc|product brand|webshop|web shop|etsy\b/.test(c) ||
    /\be‑commerce\b/.test(c);
  const storefront =
    /\bstorefront|brick[\s-]?and[\s-]?mortar|in-?person (shop|store|retail)|retail (shop|store)|boutique|showroom|pop-?up\b/.test(
      c,
    );
  return online && storefront;
}

/** Chip / freeform answers for which side of a B2B+B2C mix drives marketing. */
export function inferMarketingAudienceFocusFromCorpus(
  userCorpus: string,
): MarketingAudienceFocus | null {
  const c = userCorpus.toLowerCase();
  if (!c.trim()) return null;
  if (
    /\b(consumer|b2c|guest|patient|shopper|local customer).{0,40}(side|marketing|dominat|mostly|mainly|primary)\b/.test(
      c,
    ) ||
    /\b(marketing|brand voice|day[- ]?to[- ]?day).{0,40}(mostly|mainly|primarily).{0,20}(consumer|b2c|guest|client)\b/.test(
      c,
    ) ||
    /\bmostly (the )?consumer (side|audience|marketing)\b/.test(c) ||
    /\bconsumer side (of (the )?mix|dominates|for marketing)\b/.test(c) ||
    /\bmarketing (is )?mostly (for )?(consumers?|guests?|clients?|b2c)\b/.test(c)
  ) {
    return "B2C";
  }
  if (
    /\b(business|b2b|enterprise|smb).{0,40}(side|marketing|dominat|mostly|mainly|primary)\b/.test(c) ||
    /\b(marketing|brand voice|day[- ]?to[- ]?day).{0,40}(mostly|mainly|primarily).{0,20}(business|b2b|enterprise)\b/.test(
      c,
    ) ||
    /\bmostly (the )?(b2b|business) (side|audience|marketing)\b/.test(c) ||
    /\bb2b side (of (the )?mix|dominates|for marketing)\b/.test(c) ||
    /\bmarketing (is )?mostly (for )?(businesses?|b2b|companies)\b/.test(c)
  ) {
    return "B2B";
  }
  // Exact chip labels
  if (/\bconsumer \/ b2c side (of marketing|dominates)\b/i.test(userCorpus)) return "B2C";
  if (/\bbusiness \/ b2b side (of marketing|dominates)\b/i.test(userCorpus)) return "B2B";
  if (/\babout equal — keep both in mind\b/i.test(userCorpus)) return null;
  return null;
}

export function lockedMarketingAudienceFocusFromMessages(
  messages: Array<{ role: string; content: string }>,
): MarketingAudienceFocus | null {
  const users = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join("\n");
  return inferMarketingAudienceFocusFromCorpus(users);
}

function toneFromAudienceFocus(
  focus: MarketingAudienceFocus | null | undefined,
  type: CaptureBusinessType | null,
  corpus: string,
): ToneProfileId | null {
  if (!focus) return null;
  if (focus === "B2C") {
    if (HOSPITALITY_RE.test(corpus)) return "b2c_hospitality";
    if (CONSUMER_PRO_RE.test(corpus)) return "b2c_professional";
    if (type === "ecommerce") return "ecommerce";
    if (type === "retail") return "b2c_retail";
    if (type === "local_service" || type === "service_b2c" || !type) return "b2c_local_service";
    return "b2c_local_service";
  }
  // B2B focus
  if (type === "saas") return "saas";
  return "b2b_professional";
}

export function resolveToneProfile(ctx: ToneContext = {}): ToneProfileId {
  const corpus = `${ctx.userCorpus || ""} ${ctx.industryHint || ""}`.trim();
  const type = ctx.businessType ?? (corpus ? inferBusinessTypeFromCorpus(corpus) : null);
  const audience =
    ctx.audienceType ?? (corpus ? inferAudienceTypeFromCorpus(corpus) : null);
  const focus =
    ctx.marketingAudienceFocus ??
    (audience === "both" && corpus ? inferMarketingAudienceFocusFromCorpus(corpus) : null);
  const vertical = inferConsumerVertical({
    businessType: type,
    industry: ctx.industryHint,
    audienceType: audience,
    corpus,
  });

  if (type === "saas" && audience !== "both") return "saas";
  if (type === "ecommerce" && audience !== "both") return "ecommerce";

  // Dual audience: branch by marketing focus, else by primary revenue model — never collapse to B2B by default
  if (audience === "both") {
    const fromFocus = toneFromAudienceFocus(focus, type, corpus);
    if (fromFocus) return fromFocus;
    if (HOSPITALITY_RE.test(corpus)) return "b2c_hospitality";
    if (vertical === "consumer_professional" || CONSUMER_PRO_RE.test(corpus)) {
      return "b2c_professional";
    }
    if (type === "local_service" || type === "service_b2c") return "b2c_local_service";
    if (type === "retail") return "b2c_retail";
    if (type === "ecommerce") return "ecommerce";
    if (type === "saas") return "saas";
    if (type === "service_b2b") return "b2b_professional";
    return "neutral";
  }

  // Hospitality venues get hospitality voice even when classified as retail
  if (HOSPITALITY_RE.test(corpus) || (type === "retail" && HOSPITALITY_RE.test(corpus))) {
    return "b2c_hospitality";
  }

  // Consumer finance / advisory — consult/trust voice (not Instagram-first salon copy)
  if (vertical === "consumer_professional" || CONSUMER_PRO_RE.test(corpus)) {
    return "b2c_professional";
  }

  if (type === "local_service" || type === "service_b2c") {
    return "b2c_local_service";
  }
  if (type === "retail") return "b2c_retail";
  if (type === "saas") return "saas";
  if (type === "ecommerce") return "ecommerce";

  if (type === "service_b2b" || audience === "B2B") return "b2b_professional";
  if (audience === "B2C") return "b2c_local_service";

  return "neutral";
}

export function isConsumerFacingTone(profile: ToneProfileId): boolean {
  return (
    profile === "b2c_local_service" ||
    profile === "b2c_hospitality" ||
    profile === "b2c_retail" ||
    profile === "b2c_professional" ||
    profile === "ecommerce"
  );
}

/** Customer noun for prompts: guests / clients / customers / buyers */
export function customerNoun(profile: ToneProfileId): string {
  switch (profile) {
    case "b2c_hospitality":
      return "guests";
    case "b2c_local_service":
    case "b2c_professional":
      return "clients";
    case "b2b_professional":
    case "saas":
      return "buyers";
    default:
      return "customers";
  }
}

export function toneFromMessages(
  messages: Array<{ role: string; content: string }>,
  businessType?: CaptureBusinessType | null,
  audienceType?: AudienceKind | null,
  marketingAudienceFocus?: MarketingAudienceFocus | null,
): ToneProfileId {
  const userCorpus = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join(" ");
  const lockedType = businessType ?? lockedBusinessTypeFromMessages(messages);
  const lockedAudience = audienceType ?? lockedAudienceFromMessages(messages);
  const lockedFocus =
    marketingAudienceFocus ?? lockedMarketingAudienceFocusFromMessages(messages);
  return resolveToneProfile({
    businessType: lockedType,
    audienceType: lockedAudience,
    marketingAudienceFocus: lockedFocus,
    userCorpus,
  });
}

/** Scoring / answers fallback when structured type is missing. */
export function inferBusinessTypeFromAnswersCorpus(answers: Record<string, unknown>): CaptureBusinessType {
  const corpus = [
    answers.businessName,
    answers.businessType,
    answers.business_type,
    answers.industry,
    answers.what_you_do,
    answers.businessDescription,
    answers.primaryRevenueModel,
    answers.response_1,
    answers.response_2,
    answers.response_3,
    answers.audienceType,
    answers.audience_type,
  ]
    .filter((x): x is string => typeof x === "string")
    .join(" ");
  return inferBusinessTypeFromCorpus(corpus) ?? "service_b2b";
}
