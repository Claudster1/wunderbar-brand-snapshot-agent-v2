/**
 * Consumer vertical packs — coarse industry families for wording (not schema changes).
 * Used by results copy, chips, and tests; prompts mirror these via audienceLanguageLockFragment.
 */

import { normalizeBusinessTypeOrGeneral } from "@/lib/intake/normalizeBusinessType";

export type ConsumerVerticalId =
  | "beauty_wellness"
  | "hospitality"
  | "fashion_retail"
  | "home_services"
  | "consumer_professional"
  | "health_clinic"
  | "dtc_product";

const BEAUTY_RE =
  /\b(salon|hair|barber|beauty|spa|nails?|esthetic|medspa|med spa|massage|tattoo|grooming|lash|brow)\b/i;
const HOSPITALITY_RE =
  /\b(restaurant|cafes?|café|coffee shop|bakery|bars?|bistro|food truck|catering|hospitality|hotels?|inns?|diners?|pizzeria|brewery|winery)\b/i;
const FASHION_RE =
  /\b(fashion|apparel|clothing|boutique|streetwear|footwear|shoes|jewelry|jewellery|accessories|wardrobe|lookbook|athleisure)\b/i;
const HOME_SERVICES_RE =
  /\b(hvac|plumb|electric|roofing|landscap|contractor|trades?|cleaning|detailing|auto repair|handyman|pest control|moving|garage door)\b/i;
const CONSUMER_PRO_RE =
  /\b(financial advisor|financial \/ advisory|wealth|insurance|tax prepar|bookkeep|cpa\b|consumer legal|family law|estate planning|real estate agent|realtor|mortgage|lending|credit repair|personal finance|consumer financial)\b/i;
const HEALTH_CLINIC_RE =
  /\b(dental|dentist|chiropractic|chiro\b|physio|physical therap|veterinary|vet clinic|optometr|urgent care|outpatient|therapy practice|counseling|mental health|family clinic|medical clinic|health clinic)\b/i;
const DTC_RE =
  /\b(e-?commerce|shopify|dtc|amazon seller|online store|product brand|dropship|subscription box)\b/i;
const WELLNESS_STUDIO_RE =
  /\b(pilates|yoga studio|fitness studio|personal train|wellness studio|gym\b|fitness \/ yoga)\b/i;

export type ConsumerVerticalContext = {
  industry?: string | null;
  businessType?: string | null;
  audienceType?: string | null;
  corpus?: string | null;
};

export function inferConsumerVertical(ctx: ConsumerVerticalContext = {}): ConsumerVerticalId | null {
  const blob = [ctx.industry, ctx.businessType, ctx.audienceType, ctx.corpus]
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .join("\n");
  if (!blob.trim()) return null;

  const type = normalizeBusinessTypeOrGeneral(ctx.businessType);

  // Specific packs first — health before beauty so "dental clinic" / chiro don't misroute
  if (HOSPITALITY_RE.test(blob)) return "hospitality";
  if (HEALTH_CLINIC_RE.test(blob)) return "health_clinic";
  // Ecommerce beauty/CPG should stay product voice, not salon book/rebook
  if (type === "ecommerce") {
    if (FASHION_RE.test(blob)) return "fashion_retail";
    return "dtc_product";
  }
  if (BEAUTY_RE.test(blob) || WELLNESS_STUDIO_RE.test(blob)) return "beauty_wellness";
  if (CONSUMER_PRO_RE.test(blob)) return "consumer_professional";
  if (HOME_SERVICES_RE.test(blob)) return "home_services";
  if (FASHION_RE.test(blob)) return "fashion_retail";
  if (DTC_RE.test(blob)) return "dtc_product";

  // Type alone is too coarse for local_service / retail — require industry/corpus signals above.
  if (type === "ecommerce") return "dtc_product";

  return null;
}

export function consumerVerticalCustomerNoun(vertical: ConsumerVerticalId | null): string {
  switch (vertical) {
    case "hospitality":
      return "guests";
    case "beauty_wellness":
    case "consumer_professional":
      return "clients";
    case "health_clinic":
      return "patients";
    case "fashion_retail":
    case "dtc_product":
      return "shoppers";
    case "home_services":
      return "homeowners";
    default:
      return "customers";
  }
}

/** Short channel / proof hints for results UI and tests. */
export function consumerVerticalHints(vertical: ConsumerVerticalId | null): {
  channels: string;
  proof: string;
  cta: string;
} {
  switch (vertical) {
    case "beauty_wellness":
      return {
        channels: "Instagram, Google Business, and booking links",
        proof: "reviews and before/after proof",
        cta: "book / rebook",
      };
    case "hospitality":
      return {
        channels: "Google/Maps, Instagram, and reservation links",
        proof: "reviews and guest photos",
        cta: "reserve / order / visit",
      };
    case "fashion_retail":
      return {
        channels: "Instagram/TikTok, site, and (if relevant) store discovery",
        proof: "UGC, styling proof, and fit/returns clarity",
        cta: "shop / visit / try on",
      };
    case "home_services":
      return {
        channels: "Google/Maps, reviews, and referral loops",
        proof: "reviews, credentials, and job photos",
        cta: "call / book / get an estimate",
      };
    case "consumer_professional":
      return {
        channels: "Google, email nurture, and trusted referral partners",
        proof: "credentials, plain-language education, and client outcomes",
        cta: "book a consult / request a review",
      };
    case "health_clinic":
      return {
        channels: "Google/Maps, reviews, and appointment booking",
        proof: "reviews, outcomes, and care credentials",
        cta: "book / call",
      };
    case "dtc_product":
      return {
        channels: "site search/social discovery, email/SMS, and paid when it pays back",
        proof: "reviews, UGC, and checkout trust signals",
        cta: "add to cart / shop",
      };
    default:
      return {
        channels: "the channels where customers already look for you",
        proof: "reviews and clear proof",
        cta: "the primary next step",
      };
  }
}
