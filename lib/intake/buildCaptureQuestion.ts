import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";
import {
  customerNoun,
  isConsumerFacingTone,
  isHybridProductRetail,
  resolveToneProfile,
  toneFromMessages,
  type CaptureBusinessType,
  type ToneProfileId,
} from "@/lib/intake/toneProfile";
import { buildWebsitePresenceCaptureQuestion } from "@/lib/intake/websitePresenceCapture";

export type { CaptureBusinessType };

type CaptureQuestionOptions = {
  messages?: Array<{ role: string; content: string }>;
  toneProfile?: ToneProfileId | null;
  audienceType?: "B2B" | "B2C" | "both" | null;
};

function resolveTone(
  inferredType: CaptureBusinessType | null,
  options?: CaptureQuestionOptions,
): ToneProfileId {
  if (options?.toneProfile) return options.toneProfile;
  if (options?.messages?.length) {
    return toneFromMessages(options.messages, inferredType, options.audienceType);
  }
  return resolveToneProfile({
    businessType: inferredType,
    audienceType: options?.audienceType,
  });
}

function userCorpusFromOptions(options?: CaptureQuestionOptions): string {
  return (options?.messages ?? [])
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join(" ");
}

/** Canonical forced-capture prompts — chips must resolve from this wording + capture key. */
export function buildCaptureQuestion(
  key: CaptureKey,
  inferredType: CaptureBusinessType | null,
  options?: CaptureQuestionOptions,
): string {
  const tone = resolveTone(inferredType, options);
  const consumer = isConsumerFacingTone(tone);
  const who = customerNoun(tone);
  const corpus = userCorpusFromOptions(options);
  const hybridShop = isHybridProductRetail(corpus);

  /** Revenue / offer shape only — avoids baking B2B/B2C into the business-type step. */
  const revenueOnlyLabel = (type: CaptureBusinessType) => {
    switch (type) {
      case "service_b2b":
        return "business consulting / agency";
      case "service_b2c":
        return "consumer services";
      case "retail":
        return "retail / in-person";
      case "ecommerce":
        return hybridShop ? "product retail (online + storefront)" : "e-commerce or product-led";
      case "saas":
        return "SaaS / software";
      case "local_service":
        return "local / personal services";
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
        : "**How do you primarily get paid today** — local/personal services, business consulting, a product (online or in-person), SaaS/subscription, or something else? A short phrase is enough **(we'll ask who you sell to next).**";
    case "audience_type_classifier":
      return "**Who do you mainly sell to** — mostly other businesses (B2B), mostly consumers (B2C), or a meaningful mix of both?";
    case "marketing_audience_focus":
      return "**You sell to both businesses and consumers — which side does most of your marketing speak to today?** That keeps the diagnostic voice on the side you actually invest in.";
    case "user_role_context":
      return "**How do you think about your role here?** Tap below — or type your own.";
    case "team_size":
      return "**How big is your team today** — including you?";
    case "industry": {
      if (inferredType === "local_service" || inferredType === "service_b2c") {
        return "**What kind of business is this?** Salon or spa, clinic, home services, advisory, fitness — whatever fits.";
      }
      if (inferredType === "retail") {
        return "**What kind of business is this?** Restaurant, boutique, shop, or similar — whatever fits.";
      }
      if (inferredType === "ecommerce") {
        return "**What kind of product brand is this?** Fashion, food & beverage, home/lifestyle, or something else.";
      }
      if (inferredType === "saas") {
        return "**What space is the product in?** SaaS, marketplace/platform, or adjacent — a simple category is perfect.";
      }
      return consumer
        ? "**What kind of business is this?** Hair salon, restaurant, retail shop, wellness, home services — whatever fits."
        : "**What industry or space is the business in?** A simple category is perfect.";
    }
    case "geographic_scope":
      return consumer
        ? "**Where do you mainly serve people** — your neighborhood or city, a wider region, nationally, or online everywhere?"
        : "**Where do you mainly serve customers** — locally, regionally, nationally, or globally?";
    case "years_in_business":
      return "**Roughly how long have you been operating?**";
    case "offer_clarity":
      if (tone === "b2c_hospitality") {
        return "**How clear is your menu or experience to someone discovering you for the first time?**";
      }
      if (tone === "b2c_professional") {
        return "**How clear is what you help with to someone encountering you for the first time?**";
      }
      if (tone === "b2c_local_service") {
        return "**How clear are your services to someone encountering you for the first time?**";
      }
      return "**How clear is your offer to someone encountering you for the first time?**";
    case "messaging_clarity":
      return "**How clear and consistent does your messaging feel across channels today?**";
    case "credibility_proof":
      return consumer
        ? tone === "b2c_professional"
          ? "**What client proof do you have today?** Tap all that apply — reviews, testimonials, outcome stories, or neither yet."
          : "**What customer proof do you have today?** Tap all that apply — reviews, testimonials, before/after or success stories, or neither yet."
        : "**What customer proof do you have today?** Tap all that apply — testimonials/reviews, case studies, or neither yet.";
    case "visual_confidence":
      return "**How confident do you feel about how the brand looks visually?**";
    case "thought_leadership":
      if (tone === "b2c_professional") {
        return "**Are you sharing plain-language education or guidance publicly yet** — short posts, email tips, a simple guide, or not really?";
      }
      if (consumer) {
        return "**Are you sharing tips, behind-the-scenes, or expertise publicly yet** — social posts, short videos, a blog, or not really?";
      }
      return "**Are you doing any thought leadership publicly yet** — blog, speaking, LinkedIn POV, or similar?";
    case "website_presence":
      return buildWebsitePresenceCaptureQuestion(options?.messages);
    case "social_platform_presence":
      if (hybridShop) {
        return "**Where does your brand show up today?** Name the platforms that matter for both online shoppers and in-store visitors (Instagram, Google, site, etc.) — or say *none / not really active yet*.";
      }
      if (tone === "b2c_professional") {
        return "**Where do people find you online today?** Name what matters (Google, LinkedIn, site, email) — or say *none / not really active yet*.";
      }
      return consumer
        ? "**Where does your brand show up on social today?** Name the platforms that matter (Instagram, Google, TikTok, etc.) — or say *none / not really active yet*."
        : "**Where does your brand show up on social today?** Name the platforms that matter (or say *none / not really active yet*).";
    case "additional_marketing_surfaces":
      if (tone === "b2c_professional") {
        return "**Beyond your website and profiles, where else are you putting time or budget** — email nurture, Google/local listings, referral partners, paid ads, or mostly word of mouth?";
      }
      return consumer
        ? "**Beyond your website and social, where else are you putting time or budget** — email, Google/local listings, paid ads, events, or mostly word of mouth?"
        : "**Beyond your website and social, where else are you putting time or budget** — email, SEO, paid, events, or mostly referrals?";
    case "monthly_revenue_range":
      return "**Roughly what does the business generate month to month?** A range is perfect.";
    case "average_transaction_value":
      if (hybridShop) {
        return "**About what is a typical order or in-store purchase today?** A rough average across online and storefront is fine.";
      }
      if (tone === "b2c_hospitality") {
        return "**About what is a typical ticket or average check today?** A rough estimate is fine.";
      }
      if (tone === "b2c_professional") {
        return "**About what is a typical engagement or consult value today?** A rough estimate is fine.";
      }
      if (tone === "b2c_local_service") {
        return "**About what is a typical booking or service value today?** A rough estimate is fine.";
      }
      if (tone === "ecommerce" || tone === "b2c_retail") {
        return "**About what is your average order value today?** A rough estimate is fine.";
      }
      return "**About what is your average deal or order size today?** A rough estimate is fine.";
    case "conversion_rate_estimate":
      if (hybridShop) {
        return "**Of the people who find you online or walk in, roughly what share buy — or do you not track that yet?**";
      }
      if (tone === "b2c_hospitality") {
        return "**Of the people who find you or inquire, roughly what share actually visit or book — or do you not track that yet?**";
      }
      if (tone === "b2c_professional") {
        return "**Of the people who inquire, roughly what share book a consult — or do you not track that yet?**";
      }
      if (tone === "b2c_local_service") {
        return "**Of the people who inquire or message you, roughly what share book — or do you not track that yet?**";
      }
      if (consumer) {
        return "**What's your approximate conversion rate from interest to purchase — or do you not track that yet?**";
      }
      return "**What's your approximate conversion or close rate — or do you not track that yet?**";
    case "primary_acquisition_channel": {
      if (hybridShop) {
        return "**When a brand-new customer first discovers you, where does that usually happen** — online, in-store, or a mix?";
      }
      const discoverer =
        who === "guests"
          ? "guest"
          : who === "clients"
            ? "client"
            : who === "buyers"
              ? "prospect"
              : "customer";
      return `**When a brand-new ${discoverer} first discovers you, where does that usually happen?**`;
    }
    case "monthly_marketing_budget":
      return "**What's your approximate monthly marketing budget today?** Ballpark is perfect.";
    case "content_creation_capacity":
      return "**How much time can your team put into content each week?** A rough range works.";
    case "competitive_pressure_point":
      if (consumer) {
        return `**When ${who} choose a competitor over you, what reason comes up most often?**`;
      }
      return "**When prospects choose a competitor over you, what reason comes up most often?**";
    case "has_email_list":
      return "**Do you have an email list you're sending to today** — even a small one?";
    case "has_lead_magnet":
      if (tone === "b2c_professional") {
        return "**Do you offer anything free in exchange for an email** — a checklist, guide, or clarity tool — or not yet?";
      }
      if (consumer) {
        return "**Do you offer anything free in exchange for an email** — a discount, waitlist perk, tip sheet, or not yet?";
      }
      return "**Do you offer a free download, guide, or template in exchange for email — or not yet?**";
    case "has_clear_cta":
      if (hybridShop) {
        return "**On your site and in-store (or primary profiles), how clear is the next step** — shop, visit, buy — or still a bit mixed?";
      }
      if (tone === "b2c_hospitality") {
        return "**On your main website, Google listing, or primary profile, how clear is the next step** — reserve, order, visit — or still a bit mixed?";
      }
      if (tone === "b2c_professional") {
        return "**On your main website or primary profile, how clear is the next step** — book a consult, request a review — or still a bit mixed?";
      }
      if (tone === "b2c_local_service") {
        return "**On your main website or primary profile, how clear is the next step** — book, call, or message — or still a bit mixed?";
      }
      return "**On your main website or primary profile, how clear is the next step** — pretty obvious, or still a bit mixed?";
    case "marketing_channel_mix":
      return "**Which marketing channels are you actively running right now?** Tap all that apply — or say mostly one channel.";
    default:
      return `Great context so far. **Let's grab one more input** so your recommendations stay precise.${typeHint}`;
  }
}
