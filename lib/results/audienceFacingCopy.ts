/**
 * Audience-facing copy helpers for free Snapshot results / PDF / pillar teasers.
 * Keeps B2C and local businesses from inheriting B2B sales-cycle language.
 */

import {
  normalizeBusinessTypeOrGeneral,
  type CanonicalBusinessType,
} from "@/lib/intake/normalizeBusinessType";
import {
  consumerVerticalCustomerNoun,
  consumerVerticalHints,
  inferConsumerVertical,
  type ConsumerVerticalId,
} from "@/lib/intake/consumerVertical";

export type ResultsAudienceContext = {
  businessType?: string | null;
  industry?: string | null;
};

export function canonicalResultsBusinessType(
  raw?: string | null,
): CanonicalBusinessType | "general" {
  return normalizeBusinessTypeOrGeneral(raw);
}

export function resolveResultsVertical(ctx: ResultsAudienceContext = {}): ConsumerVerticalId | null {
  return inferConsumerVertical({
    businessType: ctx.businessType,
    industry: ctx.industry,
  });
}

export function isConsumerFacingBusinessType(raw?: string | null): boolean {
  const t = canonicalResultsBusinessType(raw);
  return t === "local_service" || t === "service_b2c" || t === "retail" || t === "ecommerce";
}

export function isConsumerFacingResultsContext(ctx: ResultsAudienceContext = {}): boolean {
  if (isConsumerFacingBusinessType(ctx.businessType)) return true;
  return resolveResultsVertical(ctx) !== null;
}

/** Short noun for who they sell to — used in results microcopy. */
export function resultsCustomerNoun(
  raw?: string | null,
  industryHint?: string | null,
): string {
  const vertical = inferConsumerVertical({
    businessType: raw,
    industry: industryHint,
  });
  if (vertical) return consumerVerticalCustomerNoun(vertical);
  const t = canonicalResultsBusinessType(raw);
  switch (t) {
    case "retail":
      return "guests";
    case "local_service":
    case "service_b2c":
      return "clients";
    case "ecommerce":
      return "shoppers";
    case "service_b2b":
    case "saas":
      return "buyers";
    default:
      return "customers";
  }
}

export function resultsSpendRiskLabel(
  primaryPillar: string,
  businessType?: string | null,
  industry?: string | null,
): string {
  const ctx = { businessType, industry };
  const vertical = resolveResultsVertical(ctx);
  const consumer = isConsumerFacingResultsContext(ctx);

  if (vertical === "fashion_retail" || vertical === "dtc_product") {
    switch (primaryPillar) {
      case "positioning":
        return "attracting browsers who aren't your style of shopper";
      case "messaging":
        return "losing interest before style, fit, or offer lands";
      case "visibility":
        return "being hard to find where shoppers already discover brands";
      case "credibility":
        return "losing trust before cart, try-on, or checkout";
      case "conversion":
        return "leakage between browse interest and purchase";
      default:
        return "wasted attention before purchase";
    }
  }

  if (vertical === "consumer_professional") {
    switch (primaryPillar) {
      case "positioning":
        return "attracting inquiries that aren't a good fit for your practice";
      case "messaging":
        return "losing clarity (and trust) at first contact";
      case "visibility":
        return "being hard to find when people search for trusted advice";
      case "credibility":
        return "losing trust before someone books a consult";
      case "conversion":
        return "leakage between interest and booked consult";
      default:
        return "friction before people take the next trusted step";
    }
  }

  if (!consumer) {
    switch (primaryPillar) {
      case "positioning":
        return "attracting attention from lower-fit buyers";
      case "messaging":
        return "losing response at first contact";
      case "visibility":
        return "being under-discovered where buyers are already searching";
      case "credibility":
        return "losing trust at the decision point";
      case "conversion":
        return "leakage between interest and action";
      default:
        return "conversion inefficiency";
    }
  }

  switch (primaryPillar) {
    case "positioning":
      return "attracting people who aren't the right fit";
    case "messaging":
      return "losing interest at first contact";
    case "visibility":
      return "being hard to find where people already search locally and online";
    case "credibility":
      return "losing trust right before someone books or buys";
    case "conversion":
      return "leakage between interest and booking or purchase";
    default:
      return "wasted attention before action";
  }
}

export function resultsRevenueProxyStatement(
  primaryPillar: string,
  businessType?: string | null,
  industry?: string | null,
): string {
  const ctx = { businessType, industry };
  const vertical = resolveResultsVertical(ctx);
  const consumer = isConsumerFacingResultsContext(ctx);
  const who = resultsCustomerNoun(businessType, industry);
  const hints = consumerVerticalHints(vertical);

  if (vertical === "fashion_retail" || vertical === "dtc_product") {
    const map: Record<string, string> = {
      positioning: `Your Positioning score suggests you're attracting some of the wrong ${who}. The likely cost shows up as browsing without buying, more discounting, and a weaker style/story fit.`,
      messaging: `Your Messaging score suggests first-contact leakage. The likely cost shows up as weaker product story, unclear fit/offer, and more drop-off before cart.`,
      visibility: `Your Visibility score suggests missed discovery demand. The likely cost shows up as shoppers finding look-alike brands first on social, search, or marketplaces.`,
      credibility: `Your Credibility score suggests trust friction near purchase. The likely cost shows up as hesitation around quality, fit, returns, or social proof.`,
      conversion: `Your Conversion score suggests friction between interest and purchase. The likely cost shows up as drop-off before ${hints.cta}.`,
    };
    return map[primaryPillar] || map.conversion;
  }

  if (vertical === "consumer_professional") {
    const map: Record<string, string> = {
      positioning: `Your Positioning score suggests you're attracting some of the wrong ${who}. The likely cost shows up as unqualified consults, longer explain-loops, and weaker trust before engagement.`,
      messaging: `Your Messaging score suggests first-contact leakage. The likely cost shows up as confusion about what you do, who you help, and why you're a safe next step.`,
      visibility: `Your Visibility score suggests missed demand from people already searching for trusted advice. The likely cost shows up as competitors winning the Google/referral race.`,
      credibility: `Your Credibility score suggests trust friction near the decision. The likely cost shows up as hesitation before booking a consult — credentials and clarity aren't landing early enough.`,
      conversion: `Your Conversion score suggests friction between interest and action. The likely cost shows up as drop-off before ${hints.cta}.`,
    };
    return map[primaryPillar] || map.conversion;
  }

  if (consumer) {
    const action =
      vertical === "hospitality"
        ? "reserves or visits"
        : vertical === "home_services"
          ? "calls or books"
          : "books or buys";
    const map: Record<string, string> = {
      positioning: `Your Positioning score suggests you're attracting some of the wrong ${who}. The likely cost shows up as price shopping, no-shows, and more explaining before someone ${action}.`,
      messaging: `Your Messaging score suggests first-contact leakage. The likely cost shows up as lower replies, weaker intent, and more back-and-forth to explain what you offer.`,
      visibility: `Your Visibility score suggests missed local or online demand. The likely cost shows up as people finding competitors first via ${hints.channels}.`,
      credibility: `Your Credibility score suggests trust friction near the decision. The likely cost shows up as hesitation before action — ${hints.proof} isn't doing enough work.`,
      conversion: `Your Conversion score suggests friction between interest and action. The likely cost shows up as drop-off before ${hints.cta}.`,
    };
    return map[primaryPillar] || map.conversion;
  }

  const map: Record<string, string> = {
    positioning:
      "Your Positioning score suggests close-rate drag from lower-fit inquiries. The likely cost appears in longer buying cycles and additional conversations needed to close.",
    messaging:
      "Your Messaging score suggests first-contact leakage. The likely cost appears in lower click-through, weaker proposal conversion, and more explanation required to sell.",
    visibility:
      "Your Visibility score suggests missed inbound demand. The likely cost appears in lost discovery where buyers are actively searching.",
    credibility:
      "Your Credibility score suggests trust friction near the decision point. The likely cost appears in late-stage hesitation and fewer committed buyers.",
    conversion:
      "Your Conversion score suggests friction between interest and action. The likely cost appears in drop-off before booking, checkout, or direct response.",
  };
  return map[primaryPillar] || map.conversion;
}

export function resultsUpliftAssumption(
  primaryPillar: string,
  businessType?: string | null,
  industry?: string | null,
): { label: string; multiplier: number } {
  const ctx = { businessType, industry };
  const vertical = resolveResultsVertical(ctx);
  const consumer = isConsumerFacingResultsContext(ctx);

  if (vertical === "fashion_retail" || vertical === "dtc_product") {
    switch (primaryPillar) {
      case "positioning":
        return { label: "5 percentage-point lift in shopper fit", multiplier: 1.25 };
      case "messaging":
        return { label: "3 percentage-point lift in product-story clarity", multiplier: 1.15 };
      case "credibility":
        return { label: "4 percentage-point lift in purchase confidence", multiplier: 1.2 };
      case "conversion":
        return { label: "10% checkout / purchase-path efficiency gain", multiplier: 1.1 };
      case "visibility":
        return { label: "10% lift in qualified product discovery", multiplier: 1.1 };
      default:
        return { label: "10% performance lift", multiplier: 1.1 };
    }
  }

  if (vertical === "consumer_professional") {
    switch (primaryPillar) {
      case "positioning":
        return { label: "5 percentage-point lift in fit of new inquiries", multiplier: 1.25 };
      case "messaging":
        return { label: "3 percentage-point lift in consult intent", multiplier: 1.15 };
      case "credibility":
        return { label: "4 percentage-point lift in trust before booking", multiplier: 1.2 };
      case "conversion":
        return { label: "10% consult-booking path efficiency gain", multiplier: 1.1 };
      case "visibility":
        return { label: "10% lift in qualified discovery", multiplier: 1.1 };
      default:
        return { label: "10% performance lift", multiplier: 1.1 };
    }
  }

  if (consumer) {
    switch (primaryPillar) {
      case "positioning":
        return { label: "5 percentage-point lift in fit of new inquiries/bookings", multiplier: 1.25 };
      case "messaging":
        return { label: "3 percentage-point lift in reply/booking intent", multiplier: 1.15 };
      case "credibility":
        return { label: "4 percentage-point lift in booking/purchase confidence", multiplier: 1.2 };
      case "conversion":
        return { label: "10% conversion-path efficiency gain", multiplier: 1.1 };
      case "visibility":
        return { label: "10% lift in qualified discovery", multiplier: 1.1 };
      default:
        return { label: "10% performance lift", multiplier: 1.1 };
    }
  }

  switch (primaryPillar) {
    case "positioning":
      return { label: "5 percentage-point close-rate improvement", multiplier: 1.25 };
    case "messaging":
      return { label: "3 percentage-point close-rate improvement", multiplier: 1.15 };
    case "credibility":
      return { label: "4 percentage-point close-rate improvement", multiplier: 1.2 };
    case "conversion":
      return { label: "10% conversion-path efficiency gain", multiplier: 1.1 };
    case "visibility":
      return { label: "10% lift in qualified inbound opportunities", multiplier: 1.1 };
    default:
      return { label: "10% performance lift", multiplier: 1.1 };
  }
}

/** Spend-efficiency allocation line — vertical-aware when industry is known. */
export function resultsSpendAllocationHint(
  businessType?: string | null,
  industry?: string | null,
): string {
  const vertical = resolveResultsVertical({ businessType, industry });
  const hints = consumerVerticalHints(vertical);
  switch (vertical) {
    case "fashion_retail":
      return "product storytelling, social discovery, and purchase-path clarity (fit, returns, proof)";
    case "dtc_product":
      return "high-intent product content, checkout trust, and retention/email-SMS flows";
    case "consumer_professional":
      return "clarity-led content, credential proof, Google/referral visibility, and consult booking paths";
    case "beauty_wellness":
      return "Google Business/local SEO, review/trust signals, Instagram proof, and booking/show-rate optimization";
    case "hospitality":
      return "Maps/Instagram discovery, review proof, and reserve/order conversion paths";
    case "home_services":
      return "Google/reviews, trust-signal content, and estimate/booking conversion paths";
    case "health_clinic":
      return "local search, review proof, and appointment booking paths";
    default:
      break;
  }

  const type = canonicalResultsBusinessType(businessType);
  switch (type) {
    case "service_b2b":
      return "LinkedIn thought leadership, email nurturing, and case-study-driven conversion assets";
    case "service_b2c":
      return "social proof content, local search visibility, and booking-focused conversion paths";
    case "retail":
      return "local search/GBP visibility, repeat visits, and guest/shopper-facing demand content";
    case "ecommerce":
      return "high-intent product content, conversion optimization, and retention/repeat-purchase flows";
    case "saas":
      return "product education content, activation-focused onboarding, and conversion path optimization";
    case "local_service":
      return "Google Business/local SEO, review/trust signals, Instagram proof, and booking/show-rate optimization";
    default:
      return hints.channels.includes("channels where")
        ? "the channels and content formats most aligned to how your customers find and choose you"
        : `${hints.channels}, ${hints.proof}, and a clear ${hints.cta} path`;
  }
}
