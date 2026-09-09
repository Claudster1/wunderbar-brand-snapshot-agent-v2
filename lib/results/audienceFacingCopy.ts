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
  inferConsumerVertical,
} from "@/lib/intake/consumerVertical";

export function canonicalResultsBusinessType(
  raw?: string | null,
): CanonicalBusinessType | "general" {
  return normalizeBusinessTypeOrGeneral(raw);
}

export function isConsumerFacingBusinessType(raw?: string | null): boolean {
  const t = canonicalResultsBusinessType(raw);
  return t === "local_service" || t === "service_b2c" || t === "retail" || t === "ecommerce";
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
): string {
  const consumer = isConsumerFacingBusinessType(businessType);
  switch (primaryPillar) {
    case "positioning":
      return consumer
        ? "attracting people who aren't the right fit"
        : "attracting attention from lower-fit buyers";
    case "messaging":
      return consumer
        ? "losing interest at first contact"
        : "losing response at first contact";
    case "visibility":
      return consumer
        ? "being hard to find where people already search locally and online"
        : "being under-discovered where buyers are already searching";
    case "credibility":
      return consumer
        ? "losing trust right before someone books or buys"
        : "losing trust at the decision point";
    case "conversion":
      return consumer
        ? "leakage between interest and booking or purchase"
        : "leakage between interest and action";
    default:
      return consumer ? "wasted attention before action" : "conversion inefficiency";
  }
}

export function resultsRevenueProxyStatement(
  primaryPillar: string,
  businessType?: string | null,
): string {
  const consumer = isConsumerFacingBusinessType(businessType);
  const who = resultsCustomerNoun(businessType);

  if (consumer) {
    const map: Record<string, string> = {
      positioning: `Your Positioning score suggests you're attracting some of the wrong ${who}. The likely cost shows up as price shopping, no-shows, and more explaining before someone books or buys.`,
      messaging: `Your Messaging score suggests first-contact leakage. The likely cost shows up as lower replies, weaker booking intent, and more back-and-forth to explain what you offer.`,
      visibility: `Your Visibility score suggests missed local or online demand. The likely cost shows up as people finding competitors first on Google, Maps, or social.`,
      credibility: `Your Credibility score suggests trust friction near the decision. The likely cost shows up as hesitation before booking, fewer reviews converting, and lost ${who} to more established alternatives.`,
      conversion: `Your Conversion score suggests friction between interest and action. The likely cost shows up as drop-off before booking, checkout, visit, or reply.`,
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
): { label: string; multiplier: number } {
  const consumer = isConsumerFacingBusinessType(businessType);
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
