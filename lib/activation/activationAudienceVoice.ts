/**
 * Natural-language voice for Activation fallbacks.
 * Prefer how owners actually talk to clients/guests/patients — not slogan CTAs or B2B ops jargon.
 */

import {
  consumerVerticalCustomerNoun,
  consumerVerticalHints,
  inferConsumerVertical,
  type ConsumerVerticalId,
} from "@/lib/intake/consumerVertical";
import { isConsumerFacingBusinessType } from "@/lib/results/audienceFacingCopy";
import type { CaptureBusinessType } from "@/lib/intake/toneProfile";

export type ActivationAudienceVoice = {
  vertical: ConsumerVerticalId | null;
  consumer: boolean;
  /** Plain noun: clients, guests, patients, homeowners, shoppers */
  who: string;
  /** Short fallback when targetAudience is missing */
  audienceShortFallback: string;
  /** Primary next step in plain language */
  primaryCta: string;
  /** Soft secondary next step */
  secondaryCta: string;
  channelsLine: string;
  proofLine: string;
  /** Ordered social platforms for default plans */
  socialPlatforms: Array<{ name: string; reason: string }>;
  /** Ordered paid platforms for scaffolds */
  paidPlatforms: Array<"Meta" | "Google Ads" | "LinkedIn">;
};

function businessTypeFromDiagnostic(diagnosticData: Record<string, unknown>): string | null {
  const raw =
    (typeof diagnosticData.businessType === "string" && diagnosticData.businessType) ||
    (typeof diagnosticData.business_type === "string" && diagnosticData.business_type) ||
    null;
  return raw;
}

export function resolveActivationAudienceVoice(
  diagnosticData: Record<string, unknown>,
): ActivationAudienceVoice {
  const industry =
    typeof diagnosticData.industry === "string" ? diagnosticData.industry : null;
  const businessType = businessTypeFromDiagnostic(diagnosticData);
  const audienceType =
    typeof diagnosticData.audienceType === "string"
      ? diagnosticData.audienceType
      : typeof diagnosticData.audience_type === "string"
        ? diagnosticData.audience_type
        : null;
  const vertical = inferConsumerVertical({
    industry,
    businessType,
    audienceType,
    corpus: [industry, audienceType, businessType].filter(Boolean).join(" "),
  });
  const hints = consumerVerticalHints(vertical);
  const who = consumerVerticalCustomerNoun(vertical);
  const typeOk = businessType
    ? isConsumerFacingBusinessType(businessType as CaptureBusinessType | string | null)
    : false;
  const consumer =
    Boolean(vertical) ||
    typeOk ||
    /^b2c$/i.test(String(audienceType || "")) ||
    /\bmostly b2c\b/i.test(String(audienceType || ""));

  if (!consumer) {
    return {
      vertical: null,
      consumer: false,
      who: "buyers",
      audienceShortFallback: "decision-makers",
      primaryCta: "Book a 20-minute intro call",
      secondaryCta: "Reply with your questions",
      channelsLine: "LinkedIn, email, and your site",
      proofLine: "case studies and clear outcomes",
      socialPlatforms: [
        { name: "LinkedIn", reason: "Where buyers look for POV, proof, and referrals." },
        { name: "YouTube", reason: "Longer explainers when the offer needs a walkthrough." },
        { name: "X / Twitter", reason: "Fast testing of short POV lines." },
      ],
      paidPlatforms: ["LinkedIn", "Meta", "Google Ads"],
    };
  }

  switch (vertical) {
    case "beauty_wellness":
      return {
        vertical,
        consumer: true,
        who: "clients",
        audienceShortFallback: "local clients",
        primaryCta: "Book an appointment",
        secondaryCta: "Text us to schedule",
        channelsLine: hints.channels,
        proofLine: hints.proof,
        socialPlatforms: [
          {
            name: "Instagram",
            reason: "Show real work, day-to-day studio life, and how to book.",
          },
          {
            name: "Google Business / Maps",
            reason: "Reviews and “near me” discovery drive first visits.",
          },
          {
            name: "TikTok",
            reason: "Short clips of process and education when you have capacity to post.",
          },
        ],
        paidPlatforms: ["Meta", "Google Ads", "LinkedIn"],
      };
    case "hospitality":
      return {
        vertical,
        consumer: true,
        who: "guests",
        audienceShortFallback: "local guests",
        primaryCta: "Make a reservation",
        secondaryCta: "Order ahead or stop in",
        channelsLine: hints.channels,
        proofLine: hints.proof,
        socialPlatforms: [
          {
            name: "Instagram",
            reason: "Food, atmosphere, and what’s on this week — keep it visual and current.",
          },
          {
            name: "Google Business / Maps",
            reason: "Hours, menu links, and reviews for people searching nearby.",
          },
          {
            name: "TikTok",
            reason: "Short clips of service and specials when they feel natural to film.",
          },
        ],
        paidPlatforms: ["Meta", "Google Ads", "LinkedIn"],
      };
    case "home_services":
      return {
        vertical,
        consumer: true,
        who: "homeowners",
        audienceShortFallback: "local homeowners",
        primaryCta: "Call or request an estimate",
        secondaryCta: "Ask a question by text",
        channelsLine: hints.channels,
        proofLine: hints.proof,
        socialPlatforms: [
          {
            name: "Google Business / Maps",
            reason: "Reviews and map presence are how most homeowners find you.",
          },
          {
            name: "Facebook",
            reason: "Neighborhood reach, referrals, and simple service reminders.",
          },
          {
            name: "Instagram",
            reason: "Job photos and crew trust when you already shoot the work.",
          },
        ],
        paidPlatforms: ["Google Ads", "Meta", "LinkedIn"],
      };
    case "health_clinic":
      return {
        vertical,
        consumer: true,
        who: "patients",
        audienceShortFallback: "local patients",
        primaryCta: "Schedule an appointment",
        secondaryCta: "Call the front desk",
        channelsLine: hints.channels,
        proofLine: hints.proof,
        socialPlatforms: [
          {
            name: "Google Business / Maps",
            reason: "Reviews and directions for new patients searching nearby.",
          },
          {
            name: "Instagram",
            reason: "Team, office feel, and simple education — keep claims careful.",
          },
          {
            name: "Facebook",
            reason: "Reminders and community reach for families in your area.",
          },
        ],
        paidPlatforms: ["Google Ads", "Meta", "LinkedIn"],
      };
    case "fashion_retail":
      return {
        vertical,
        consumer: true,
        who: "shoppers",
        audienceShortFallback: "shoppers nearby",
        primaryCta: "Shop online or visit the store",
        secondaryCta: "Ask about fit or sizing",
        channelsLine: hints.channels,
        proofLine: hints.proof,
        socialPlatforms: [
          {
            name: "Instagram",
            reason: "Looks, new arrivals, and how to shop or visit.",
          },
          {
            name: "TikTok",
            reason: "Styling clips and drop moments when you post regularly.",
          },
          {
            name: "Google Business / Maps",
            reason: "Store discovery and hours if you have a location.",
          },
        ],
        paidPlatforms: ["Meta", "Google Ads", "LinkedIn"],
      };
    case "dtc_product":
      return {
        vertical,
        consumer: true,
        who: "shoppers",
        audienceShortFallback: "online shoppers",
        primaryCta: "Shop now",
        secondaryCta: "Read reviews before you buy",
        channelsLine: hints.channels,
        proofLine: hints.proof,
        socialPlatforms: [
          {
            name: "Instagram",
            reason: "Product moments, UGC, and a clear path to the product page.",
          },
          {
            name: "TikTok",
            reason: "Short demos and social proof when creative is easy to remake.",
          },
          {
            name: "YouTube",
            reason: "Longer how-tos when the product needs explanation.",
          },
        ],
        paidPlatforms: ["Meta", "Google Ads", "LinkedIn"],
      };
    case "consumer_professional":
      return {
        vertical,
        consumer: true,
        who: "clients",
        audienceShortFallback: "clients looking for advice",
        primaryCta: "Book a consult",
        secondaryCta: "Request a call back",
        channelsLine: hints.channels,
        proofLine: hints.proof,
        socialPlatforms: [
          {
            name: "Google Business / Maps",
            reason: "Reviews and local search for people ready to talk.",
          },
          {
            name: "LinkedIn",
            reason: "Education and referrals when your clients find you there.",
          },
          {
            name: "Facebook",
            reason: "Community reach when your clients already hang out there.",
          },
        ],
        paidPlatforms: ["Google Ads", "Meta", "LinkedIn"],
      };
    default:
      return {
        vertical: null,
        consumer: true,
        who: "customers",
        audienceShortFallback: "local customers",
        primaryCta: "Get in touch",
        secondaryCta: "Ask a question",
        channelsLine: hints.channels,
        proofLine: hints.proof,
        socialPlatforms: [
          {
            name: "Instagram",
            reason: "Show the work and make the next step obvious.",
          },
          {
            name: "Google Business / Maps",
            reason: "Reviews and discovery for people nearby.",
          },
          {
            name: "Facebook",
            reason: "Community reach when your customers already hang out there.",
          },
        ],
        paidPlatforms: ["Meta", "Google Ads", "LinkedIn"],
      };
  }
}
