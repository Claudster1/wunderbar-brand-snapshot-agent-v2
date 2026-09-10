import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";
import {
  isConsumerFacingTone,
  resolveToneProfile,
  toneFromMessages,
  type CaptureBusinessType,
  type ToneProfileId,
} from "@/lib/intake/toneProfile";
import { getWebsitePresenceSuggestedReplies } from "@/lib/intake/websitePresenceCapture";

const OTHER = "Something else (type below)";
const BETWEEN = "Between bands / not sure — describe below";

export type ChipSelectionMode = "single" | "multi";

export type CaptureChipOptions = {
  messages?: Array<{ role: string; content: string }>;
  toneProfile?: ToneProfileId | null;
  businessType?: CaptureBusinessType | null;
  audienceType?: "B2B" | "B2C" | "both" | null;
};

/** True for mutually exclusive / banded captures — UI should auto-send on one tap. */
export function getChipSelectionModeForCapture(key: CaptureKey): ChipSelectionMode {
  switch (key) {
    case "social_platform_presence":
    case "additional_marketing_surfaces":
    case "marketing_channel_mix":
    case "credibility_proof":
      return "multi";
    default:
      return "single";
  }
}

function resolveTone(options?: CaptureChipOptions): ToneProfileId {
  if (options?.toneProfile) return options.toneProfile;
  if (options?.messages?.length) {
    return toneFromMessages(options.messages, options.businessType, options.audienceType);
  }
  return resolveToneProfile({
    businessType: options?.businessType,
    audienceType: options?.audienceType,
  });
}

export function getPrimaryGoalChipsForTone(tone: ToneProfileId): string[] {
  if (tone === "b2c_professional") {
    return [
      "More consult bookings",
      "Stronger trust / credibility",
      "Clearer offer / who I help",
      "Better Google / referral visibility",
      "More consistent brand look",
      "Grow revenue without more explain-loops",
      OTHER,
    ];
  }
  if (isConsumerFacingTone(tone)) {
    const hospitality = tone === "b2c_hospitality";
    const retail = tone === "b2c_retail" || tone === "ecommerce";
    return [
      hospitality
        ? "More guests / foot traffic"
        : retail
          ? "More shoppers / sales"
          : "More bookings / appointments",
      "More repeat customers",
      "Stronger local awareness",
      "Better reviews & reputation",
      "Clearer offer / services",
      "More consistent brand look",
      "Grow revenue without burning out",
      OTHER,
    ];
  }
  return [
    "Attract more qualified leads",
    "Build brand awareness and credibility",
    "Differentiate from look-alike competitors",
    "Improve conversion — turn interest into paying customers",
    "Launch or establish the brand properly",
    "Build authority and thought leadership in the space",
    OTHER,
  ];
}

export function getPaidAdsObjectiveChipsForTone(tone: ToneProfileId): string[] {
  if (isConsumerFacingTone(tone)) {
    return [
      "Get more bookings / visits",
      "Drive more sales/conversions",
      "Lower cost per booking/acquisition",
      "Improve ROAS",
      "Build local awareness first",
      "Promote an offer or event",
      OTHER,
    ];
  }
  return [
    "Generate more qualified leads",
    "Drive more sales/conversions",
    "Lower cost per lead/acquisition",
    "Improve ROAS",
    "Improve pipeline quality",
    "Build awareness first",
    OTHER,
  ];
}

export function getContentFormatChipsForTone(tone: ToneProfileId): string[] {
  if (isConsumerFacingTone(tone)) {
    return [
      "Short social posts / reels",
      "Stories / behind-the-scenes",
      "Short video / TikTok / Reels",
      "Email / SMS to customers",
      "Before/after or proof posts",
      "Not creating much yet",
      OTHER,
    ];
  }
  return [
    "Short social posts / reels",
    "Long-form articles / LinkedIn",
    "Video / podcast",
    "Email newsletters",
    "Case studies / proof content",
    "Not creating much yet",
    OTHER,
  ];
}

export function getCustomerAcquisitionChipsForTone(tone: ToneProfileId): string[] {
  if (tone === "b2c_professional") {
    return [
      "Word of mouth / referrals",
      "Google / Maps search",
      "Partner referrals",
      "Email / content",
      "Paid advertising",
      "Events / networking",
      "Not sure",
      OTHER,
    ];
  }
  if (isConsumerFacingTone(tone)) {
    return [
      "Word of mouth / referrals",
      "Google / Maps search",
      "Social media",
      "Walk-ins / foot traffic",
      "Paid advertising",
      "Partnerships / local events",
      "Not sure",
      OTHER,
    ];
  }
  return [
    "Referrals / word of mouth",
    "Google / organic search",
    "Social media",
    "Paid advertising",
    "Networking / events",
    "Partnerships",
    "Not sure",
    OTHER,
  ];
}

export function getBrandPersonalityChipsForTone(tone: ToneProfileId): string[] {
  if (tone === "b2c_hospitality") {
    return [
      "Warm and welcoming",
      "Relaxed / unfussy",
      "Stylish and polished",
      "Neighborhood favorite",
      "Bold and memorable",
      "Generous hospitality",
      OTHER,
    ];
  }
  if (tone === "b2c_professional") {
    return [
      "Clear and calm",
      "Trusted / steady",
      "Approachable / no jargon",
      "Protective / thorough",
      "Premium / polished",
      "Warm and human",
      OTHER,
    ];
  }
  if (isConsumerFacingTone(tone)) {
    return [
      "Warm and welcoming",
      "Friendly / approachable",
      "Stylish and polished",
      "Calm and unfussy",
      "Trusted local go-to",
      "Bold and memorable",
      OTHER,
    ];
  }
  return [
    "Sharp and credible",
    "Approachable / no jargon",
    "Challenger / category-pushing",
    "Calm and steady",
    "Warm and human",
    "Premium / polished",
    OTHER,
  ];
}

export function getDecisionStyleChipsForTone(tone: ToneProfileId): string[] {
  if (isConsumerFacingTone(tone)) {
    return [
      "I trust my gut and try things quickly",
      "I research before I change prices, offers, or promos",
      "I talk it through with my team / partner",
      "I stick with what has worked before",
      OTHER,
    ];
  }
  return [
    "I trust my instincts and move quickly",
    "I research thoroughly before acting",
    "I collaborate and seek alignment",
    "I rely on proven systems and expertise",
    OTHER,
  ];
}

export function getCustomerExpectationChipsForTone(tone: ToneProfileId): string[] {
  if (tone === "b2c_hospitality") {
    return [
      "A great visit / experience",
      "Clear menu and easy next step",
      "Warm hospitality they can feel",
      "Consistency every time",
      OTHER,
    ];
  }
  if (tone === "b2c_professional") {
    return [
      "Clear guidance and expertise",
      "Trust and reliability",
      "A calm, jargon-light consult",
      "An obvious next step",
      OTHER,
    ];
  }
  if (isConsumerFacingTone(tone)) {
    return [
      "A smooth booking / next step",
      "Clear guidance and expertise",
      "Trust and reliability",
      "A warm, personal experience",
      OTHER,
    ];
  }
  return [
    "Innovation or fresh thinking",
    "Clear guidance and expertise",
    "Trust and reliability",
    "Connection and shared values",
    OTHER,
  ];
}

/** Chip options for forced server captures — keeps answers fast and parseable. */
export function getSuggestedRepliesForCapture(
  key: CaptureKey,
  options?: CaptureChipOptions,
): string[] {
  const tone = resolveTone(options);
  const consumer = isConsumerFacingTone(tone);

  switch (key) {
    case "business_type_classifier":
      return [
        "Local / personal services",
        "Business consulting / agency",
        "SaaS / software / app",
        "E‑commerce / DTC product",
        "Retail or in-person",
        "Physical product / wholesale",
        "Marketplace or platform",
        OTHER,
      ];
    case "audience_type_classifier":
      return ["Mostly B2B", "Mostly B2C", "Meaningful mix of both", "Nonprofit / community-focused", OTHER];
    case "marketing_audience_focus":
      return [
        "Consumer / B2C side of marketing",
        "Business / B2B side of marketing",
        "About equal — keep both in mind",
        OTHER,
      ];
    case "user_role_context":
      return [
        "I run the business day-to-day",
        "I lead strategy and growth",
        "I lead marketing / brand in-house",
        "I'm a founder / co-founder",
        OTHER,
      ];
    case "team_size":
      return ["Just me", "2–5 people", "6–15 people", "16–50 people", "50+ people", OTHER];
    case "industry":
      if (consumer) {
        return [
          "Hair / beauty / spa",
          "Restaurant / café / food",
          "Fashion / apparel / boutique",
          "Health / wellness / clinic",
          "Home / local services",
          "Consumer financial / advisory",
          "Retail shop",
          "E‑commerce / product",
          OTHER,
        ];
      }
      return [
        "Professional services / consulting",
        "Marketing agency / freelance (not in-house)",
        "Creative / design studio (not in-house)",
        "SaaS / software",
        "E‑commerce / retail",
        "Health / wellness",
        "Home / local services",
        "Education / coaching",
        OTHER,
      ];
    case "geographic_scope":
      return [
        "Locally (city or metro)",
        "Regionally (state or multi-state)",
        "Nationally",
        "Globally",
        OTHER,
      ];
    case "years_in_business":
      return [
        "Less than 1 year",
        "1–3 years",
        "3–5 years",
        "5–10 years",
        "10+ years",
        "Not launched yet",
        OTHER,
      ];
    case "offer_clarity":
    case "messaging_clarity":
      return ["Very clear", "Somewhat clear", "Unclear / still figuring it out"];
    case "credibility_proof":
      return consumer
        ? ["Reviews (Google / Yelp / etc.)", "Testimonials", "Before/after or success stories", "Neither yet", OTHER]
        : ["Testimonials / reviews", "Case studies / success stories", "Neither yet", OTHER];
    case "visual_confidence":
      return ["Very confident", "Somewhat confident", "Not confident", OTHER];
    case "thought_leadership":
      return consumer
        ? ["Yes — regularly on social", "A little / informal", "Not yet", "Planning to start"]
        : ["Yes — actively", "A little / informal", "Not yet", "Planning to start"];
    case "website_presence":
      return getWebsitePresenceSuggestedReplies(options?.messages);
    case "social_platform_presence":
      if (tone === "b2c_professional") {
        return [
          "Google Business / Maps",
          "LinkedIn",
          "Email / newsletter",
          "Instagram",
          "Facebook",
          "YouTube",
          "Not really active yet",
          OTHER,
        ];
      }
      if (consumer) {
        return [
          "Instagram",
          "Google Business / Maps",
          "Facebook",
          "TikTok",
          "YouTube",
          "LinkedIn",
          "Not really active yet",
          OTHER,
        ];
      }
      return [
        "LinkedIn",
        "Instagram",
        "Facebook",
        "TikTok",
        "YouTube",
        "Not really active yet",
        OTHER,
      ];
    case "additional_marketing_surfaces":
      return tone === "b2c_professional"
        ? [
            "Email nurture",
            "Google / local SEO",
            "Referral partners",
            "Paid ads",
            "Events / speaking",
            "Mostly word of mouth",
            "Nothing else yet",
            OTHER,
          ]
        : consumer
          ? [
              "Email / newsletter",
              "Google / local SEO",
              "Paid ads",
              "Word of mouth / referrals",
              "Events / partnerships",
              "Mostly word of mouth",
              "Nothing else yet",
              OTHER,
            ]
          : [
              "Email / newsletter",
              "SEO",
              "Paid ads",
              "Referrals / word of mouth",
              "Events",
              "Mostly referrals",
              "Nothing else yet",
              OTHER,
            ];
    case "monthly_revenue_range":
      return [
        "Under $5k/mo",
        "$5k–$20k",
        "$20k–$50k",
        "$50k–$150k",
        "$150k+",
        "Pre-revenue / just launching",
        "Prefer not to say",
        BETWEEN,
      ];
    case "average_transaction_value":
      if (
        tone === "b2c_hospitality" ||
        tone === "b2c_local_service" ||
        tone === "b2c_retail" ||
        tone === "b2c_professional"
      ) {
        return ["Under $50", "$50–$150", "$150–$500", "$500–$2k", "$2k+", "Varies a lot", "Not sure", BETWEEN];
      }
      return ["Under $500", "$500–$2k", "$2k–$10k", "$10k+", "Varies a lot", "Not sure", BETWEEN];
    case "conversion_rate_estimate":
      return ["I track it (~X%)", "I don't track this yet", "Rough guess", "Not sure"];
    case "primary_acquisition_channel":
      return tone === "b2c_professional"
        ? [
            "Word of mouth / referrals",
            "Google / Maps search",
            "Partner referrals",
            "Email / content",
            "Paid ads",
            "Direct / repeat",
            "Mix of channels",
            OTHER,
          ]
        : consumer
          ? [
              "Word of mouth / referrals",
              "Google / Maps search",
              "Social (Instagram / TikTok / etc.)",
              "Walk-ins / foot traffic",
              "Paid ads",
              "Direct / repeat",
              "Mix of channels",
              OTHER,
            ]
          : [
              "Referrals / word of mouth",
              "Organic search",
              "Social",
              "Paid ads",
              "Direct / repeat",
              "Events / partnerships",
              "Mix of channels",
              OTHER,
            ];
    case "monthly_marketing_budget":
      return ["Under $500", "$500–$2k", "$2k–$5k", "$5k+", "$0 / not spending yet", BETWEEN];
    case "content_creation_capacity":
      return ["Under 2 hrs/week", "2–5 hrs/week", "5–10 hrs/week", "10+ hrs/week", "Minimal right now"];
    case "competitive_pressure_point":
      return consumer
        ? tone === "b2c_professional"
          ? ["Trust / credentials", "Clarity of offer", "Price", "Availability", "Fit / rapport", "Mix"]
          : ["Price", "Convenience / location", "Trust / reviews", "Clarity of offer", "Speed / availability", "Fit / vibe", "Mix"]
        : ["Price", "Trust", "Clarity", "Speed", "Proof / credibility", "Fit", "Mix"];
    case "has_email_list":
      return ["Yes", "Small list", "Building one", "No"];
    case "has_lead_magnet":
      return consumer
        ? tone === "b2c_professional"
          ? ["Yes — guide / checklist", "Not yet", "Planning one"]
          : ["Yes — discount / perk / tip", "Not yet", "Planning one"]
        : ["Yes", "Not yet", "Planning one"];
    case "has_clear_cta":
      return ["Pretty clear", "Somewhat clear", "Still figuring it out", "Mixed / confusing"];
    case "marketing_channel_mix":
      return [
        "Email",
        "Social",
        "SEO",
        "Paid",
        "Referrals",
        "Events",
        "Mostly one channel",
        OTHER,
      ];
    default:
      return [];
  }
}
