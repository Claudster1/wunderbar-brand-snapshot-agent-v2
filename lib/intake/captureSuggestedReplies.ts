import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";

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
        "Let me describe it differently",
      ];
    case "audience_type_classifier":
      return ["Mostly B2B", "Mostly B2C", "Meaningful mix of both", "Nonprofit / community-focused", "I'll describe my customers"];
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
        "Other",
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
      ];
    case "monthly_revenue_range":
      return ["Under $5k/mo", "$5k–$20k", "$20k–$50k", "$50k+", "Pre-revenue / just launching", "Prefer not to say"];
    case "average_transaction_value":
      return ["Under $500", "$500–$2k", "$2k–$10k", "$10k+", "Varies a lot", "Not sure"];
    case "conversion_rate_estimate":
      return ["I track it (~X%)", "I don't track this yet", "Rough guess", "Not sure"];
    case "primary_acquisition_channel":
      return [
        "Referrals",
        "Organic search",
        "Social",
        "Paid ads",
        "Direct / repeat",
        "Events / partnerships",
        "Mix of channels",
      ];
    case "monthly_marketing_budget":
      return ["Under $500", "$500–$2k", "$2k–$5k", "$5k+", "$0 / not spending yet"];
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
      ];
    default:
      return [];
  }
}
