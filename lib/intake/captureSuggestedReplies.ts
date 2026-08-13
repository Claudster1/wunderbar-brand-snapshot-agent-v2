import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";

const OTHER = "Something else (type below)";
const BETWEEN = "Between bands / not sure — describe below";

export type ChipSelectionMode = "single" | "multi";

/** True for mutually exclusive / banded captures — UI should auto-send on one tap. */
export function getChipSelectionModeForCapture(key: CaptureKey): ChipSelectionMode {
  switch (key) {
    case "social_platform_presence":
    case "additional_marketing_surfaces":
    case "marketing_channel_mix":
      return "multi";
    default:
      return "single";
  }
}

/** Chip options for forced server captures — keeps answers fast and parseable. */
export function getSuggestedRepliesForCapture(key: CaptureKey): string[] {
  switch (key) {
    case "business_type_classifier":
      return [
        "Services / consulting",
        "SaaS / software / app",
        "E‑commerce / DTC product",
        "Retail or in-person",
        "Physical product / wholesale",
        "Marketplace or platform",
        OTHER,
      ];
    case "audience_type_classifier":
      return ["Mostly B2B", "Mostly B2C", "Meaningful mix of both", "Nonprofit / community-focused", OTHER];
    case "website_presence":
      return ["Yes, here's the URL", "No website yet", "Social / marketplace only", "Coming soon"];
    case "social_platform_presence":
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
      return [
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
      return ["Under $500", "$500–$2k", "$2k–$10k", "$10k+", "Varies a lot", "Not sure", BETWEEN];
    case "conversion_rate_estimate":
      return ["I track it (~X%)", "I don't track this yet", "Rough guess", "Not sure"];
    case "primary_acquisition_channel":
      return [
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
      return ["Price", "Trust", "Clarity", "Speed", "Proof / credibility", "Fit", "Mix"];
    case "has_email_list":
      return ["Yes", "Small list", "Building one", "No"];
    case "has_lead_magnet":
      return ["Yes", "Not yet", "Planning one"];
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
