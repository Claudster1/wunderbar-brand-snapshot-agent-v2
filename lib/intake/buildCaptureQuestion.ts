import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";
import { buildWebsitePresenceCaptureQuestion } from "@/lib/intake/websitePresenceCapture";

export type CaptureBusinessType =
  | "service_b2b"
  | "service_b2c"
  | "retail"
  | "ecommerce"
  | "saas"
  | "local_service";

type CaptureQuestionOptions = {
  messages?: Array<{ role: string; content: string }>;
};

/** Canonical forced-capture prompts — chips must resolve from this wording + capture key. */
export function buildCaptureQuestion(
  key: CaptureKey,
  inferredType: CaptureBusinessType | null,
  options?: CaptureQuestionOptions,
): string {
  /** Revenue / offer shape only — avoids baking B2B/B2C into the business-type step. */
  const revenueOnlyLabel = (type: CaptureBusinessType) => {
    switch (type) {
      case "service_b2b":
      case "service_b2c":
        return "services / consulting";
      case "retail":
        return "retail";
      case "ecommerce":
        return "e-commerce or product-led";
      case "saas":
        return "SaaS / software";
      case "local_service":
        return "local service";
      default:
        return "business";
    }
  };

  const typeHint =
    inferredType === null
      ? ""
      : `\nBusiness model context locked: ${inferredType.replace(/_/g, " ")}.`;

  switch (key) {
    case "business_type_classifier":
      return inferredType
        ? `Quick gut check on **how you earn revenue**: it sounds like you're primarily in a **${revenueOnlyLabel(
            inferredType,
          )}** business. **Does that match how you'd describe your offer, or would you describe it differently?**`
        : "**How do you primarily get paid today** — mostly services/consulting, a physical or digital product, SaaS/subscription, retail, or something else? A short phrase is enough **(we'll ask who you sell to next).**";
    case "audience_type_classifier":
      return "**Who do you mainly sell to** — mostly other businesses (B2B), mostly consumers (B2C), or a meaningful mix of both?";
    case "user_role_context":
      return "**How do you think about your role here?** Tap below — or type your own.";
    case "team_size":
      return "**How big is your team today** — including you?";
    case "industry":
      return "**What industry or space is the business in?** A simple category is perfect.";
    case "geographic_scope":
      return "**Where do you mainly serve customers** — locally, regionally, nationally, or globally?";
    case "years_in_business":
      return "**Roughly how long have you been operating?**";
    case "offer_clarity":
      return "**How clear is your offer to someone encountering you for the first time?**";
    case "messaging_clarity":
      return "**How clear and consistent does your messaging feel across channels today?**";
    case "credibility_proof":
      return "**What customer proof do you have today?** Tap all that apply — testimonials/reviews, case studies, or neither yet.";
    case "visual_confidence":
      return "**How confident do you feel about how the brand looks visually?**";
    case "thought_leadership":
      return "**Are you doing any thought leadership publicly yet** — blog, speaking, LinkedIn POV, or similar?";
    case "website_presence":
      return buildWebsitePresenceCaptureQuestion(options?.messages);
    case "social_platform_presence":
      return "**Where does your brand show up on social today?** Name the platforms that matter (or say *none / not really active yet*).";
    case "additional_marketing_surfaces":
      return "**Beyond your website and social, where else are you putting time or budget** — email, SEO, paid, events, or mostly referrals?";
    case "monthly_revenue_range":
      return "**Roughly what does the business generate month to month?** A range is perfect.";
    case "average_transaction_value":
      return "**About what is your average deal or order size today?** A rough estimate is fine.";
    case "conversion_rate_estimate":
      return "**What's your approximate conversion or close rate — or do you not track that yet?**";
    case "primary_acquisition_channel":
      return "**When a brand-new prospect first discovers you, where does that usually happen?**";
    case "monthly_marketing_budget":
      return "**What's your approximate monthly marketing budget today?** Ballpark is perfect.";
    case "content_creation_capacity":
      return "**How much time can your team put into content each week?** A rough range works.";
    case "competitive_pressure_point":
      return "**When prospects choose a competitor over you, what reason comes up most often?**";
    case "has_email_list":
      return "**Do you have an email list you're sending to today** — even a small one?";
    case "has_lead_magnet":
      return "**Do you offer a free download, guide, or template in exchange for email — or not yet?**";
    case "has_clear_cta":
      return "**On your main website or primary profile, how clear is the next step** — pretty obvious, or still a bit mixed?";
    case "marketing_channel_mix":
      return "**Which marketing channels are you actively running right now?** Tap all that apply — or say mostly one channel.";
    default:
      return `Great context so far. **Let's grab one more input** so your recommendations stay precise.${typeHint}`;
  }
}
