import { describe, expect, it } from "vitest";
import {
  assistantAskedDedicatedSocialPlatformPresence,
  captureKeySatisfiedFromHistory,
  flexibleDirectCaptureComplete,
  socialPresenceImmediateRefusalAfterDedicatedPrompt,
  splitTerseEnumeration,
  type CaptureKey,
} from "../lib/intake/flexibleDirectCaptureComplete";

describe("splitTerseEnumeration", () => {
  it("splits on commas, and, or, slashes, plus", () => {
    expect(splitTerseEnumeration("a, b")).toEqual(["a", "b"]);
    expect(splitTerseEnumeration("x and y")).toEqual(["x", "y"]);
    expect(splitTerseEnumeration("foo or bar")).toEqual(["foo", "bar"]);
    expect(splitTerseEnumeration("seo / paid / email")).toEqual(["seo", "paid", "email"]);
    expect(splitTerseEnumeration("one + two")).toEqual(["one", "two"]);
  });
});

/** Minimal assistant stubs that only need to satisfy the “asked about this topic” detector. */
const LA = {
  business:
    "**How do you primarily get paid today** — mostly services/consulting, a physical or digital product, SaaS/subscription, retail, or something else?",
  businessConfirm: "Does that feel accurate, or would you describe your revenue model differently?",
  audience: "**Who do you mainly sell to** — mostly other businesses (B2B), mostly consumers (B2C), or a meaningful mix of both?",
  revenue: "Roughly what does the business generate month to month?",
  avgDeal: "About what is your average transaction value or deal size today?",
  conversion: "What is your approximate conversion or close rate today, if you track it?",
  channel:
    "**When a brand-new prospect first discovers you, where does that usually happen** — referral, organic search, social, paid ads, direct, events, or something else?",
  acquisitionForcedPrompt:
    "**When a brand-new prospect first discovers you, where does that usually happen** — referral, organic search, social, paid ads, direct, events, or something else? *(This is about discovery, not every channel you maintain.)*",
  budget: "What is your approximate monthly marketing budget today?",
  content: "How much time can your team realistically invest in content creation each week?",
  competitive:
    "When prospects choose a competitor over you, what reason comes up most often (for example: price, trust, clarity, speed, proof, or fit)?",
  emailList: "Do you have an email list you're sending to today?",
  leadMagnet: "Do you have any free download or guide in exchange for their email?",
  cta:
    "**Pick one primary place** you're grading — your main website **or** the profile you most often send people to. **How clear is the next step there** — pretty obvious, or still a little mixed?",
  channelMix:
    "**Across the marketing channels you actively run** (not only where new leads first discover you), where are you showing up for people lately — email, social, paid, or something else?",
  website: "Do you have a website URL to share today — even a simple landing page?",
  socialPlatforms: "Where does your brand show up on social today?",
  socialParaphrasePlatformsMatter:
    "**Quick question — which platforms actually matter for the brand socially right now**, even if you are pretty quiet?",
  otherSurfaces:
    "Beyond your website and social profiles, where else are you putting real time or budget — email, SEO, paid, or mostly referrals?",
  leadMagnetForcedPrompt:
    "**Do you have any free download, template, guide, or similar** that people get in exchange for their email? Lots of brands also mention email + social campaigns here — ignoring that for now.",
} as const;

describe("flexibleDirectCaptureComplete", () => {
  describe("business_type_classifier", () => {
    it("accepts narrative + model keywords", () => {
      expect(
        flexibleDirectCaptureComplete("business_type_classifier", LA.business, "B2B consulting for manufacturers"),
      ).toBe(true);
    });
    it("accepts terse multi-label list when asked how you get paid", () => {
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.business, "SaaS and consulting")).toBe(true);
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.business, "ecommerce, retail")).toBe(true);
    });
    it("rejects affirmation without model signal", () => {
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.businessConfirm, "yeah mostly accurate")).toBe(
        false,
      );
    });
    /**
     * Regression: previously these natural-language replies didn't hit the `answered` or
     * `audienceDescriptor` regexes and forced the assistant to re-ask the verbatim "Quick context
     * check before we go deeper…" prompt — the exact user-reported repeating loop.
     */
    it("accepts substantive natural-language replies to the open business-type question", () => {
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.business, "i do everything right now")).toBe(
        true,
      );
      expect(
        flexibleDirectCaptureComplete(
          "business_type_classifier",
          LA.business,
          "I help families plan their finances",
        ),
      ).toBe(true);
      expect(
        flexibleDirectCaptureComplete(
          "business_type_classifier",
          LA.business,
          "we make handmade soap for people who love natural skincare",
        ),
      ).toBe(true);
    });
    it("still rejects bare acks / single-word non-answers to the open question", () => {
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.business, "")).toBe(false);
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.business, "yes")).toBe(false);
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.business, "thanks")).toBe(false);
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.business, "idk")).toBe(true); // refusal short-circuit
    });
  });

  describe("audience_type_classifier", () => {
    it("accepts B2B/B2C/mix shorthand", () => {
      expect(flexibleDirectCaptureComplete("audience_type_classifier", LA.audience, "mostly B2B")).toBe(true);
      expect(flexibleDirectCaptureComplete("audience_type_classifier", LA.audience, "B2C")).toBe(true);
      expect(flexibleDirectCaptureComplete("audience_type_classifier", LA.audience, "hybrid / both")).toBe(true);
    });
    it("rejects bare ack without audience signal", () => {
      expect(flexibleDirectCaptureComplete("audience_type_classifier", LA.audience, "sounds good")).toBe(false);
    });
  });

  describe("monthly_revenue_range", () => {
    it("accepts money shorthand after revenue question", () => {
      expect(flexibleDirectCaptureComplete("monthly_revenue_range", LA.revenue, "about 25k")).toBe(true);
      expect(flexibleDirectCaptureComplete("monthly_revenue_range", LA.revenue, "pre-revenue still")).toBe(true);
    });
    it("rejects empty reply", () => {
      expect(flexibleDirectCaptureComplete("monthly_revenue_range", LA.revenue, "")).toBe(false);
    });
  });

  describe("website_presence", () => {
    it("accepts a URL after a website question", () => {
      expect(flexibleDirectCaptureComplete("website_presence", LA.website, "https://acme.com")).toBe(true);
      expect(flexibleDirectCaptureComplete("website_presence", LA.website, "acme.io")).toBe(true);
    });
    it("accepts explicit no-site answers", () => {
      expect(flexibleDirectCaptureComplete("website_presence", LA.website, "no website yet")).toBe(true);
      expect(flexibleDirectCaptureComplete("website_presence", LA.website, "instagram only")).toBe(true);
    });
  });

  describe("social_platform_presence", () => {
    it("accepts platform tokens or @handle", () => {
      expect(flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, "LinkedIn + IG")).toBe(
        true,
      );
      expect(flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, "@acmeco")).toBe(true);
      expect(flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, "not really active")).toBe(
        true,
      );
      expect(flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, "linked in only")).toBe(
        true,
      );
      expect(flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, "Mastodon")).toBe(true);
      expect(flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, "linkedin")).toBe(true);
      expect(flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, "no")).toBe(true);
    });

    it("accepts a long narrative reply that includes a platform mid-paragraph", () => {
      const long =
        "Thanks for asking — right now we are pretty heads-down on product. Our main public touchpoint is occasional thought leadership on LinkedIn because that is where buyers actually hang out for us. We are not doing Instagram reels or TikTok; it has just not been a priority this quarter versus shipping.";
      expect(flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, long)).toBe(true);
    });

    it("accepts a long low-activity answer without naming a platform", () => {
      const long =
        "Honestly we have been almost entirely outbound and partner intros. Posting is basically nonexistent — we might reshare something once in a blue moon but there is no steady social rhythm or follower play right now.";
      expect(flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, long)).toBe(true);
    });

    it("does not confuse acquisition-channel mix ('organic + paid social') with owned social surfaces", () => {
      expect(
        flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, "organic and paid social"),
      ).toBe(false);
    });

    it("still accepts terse 'social + platform' mixes", () => {
      expect(flexibleDirectCaptureComplete("social_platform_presence", LA.socialPlatforms, "social and tiktok")).toBe(
        true,
      );
    });

    it("accepts model paraphrases that ask which platforms matter without saying 'on social'", () => {
      expect(assistantAskedDedicatedSocialPlatformPresence(LA.socialParaphrasePlatformsMatter)).toBe(true);
      expect(
        flexibleDirectCaptureComplete(
          "social_platform_presence",
          LA.socialParaphrasePlatformsMatter,
          "Pretty much just LinkedIn.",
        ),
      ).toBe(true);
    });
  });

  describe("additional_marketing_surfaces", () => {
    it("accepts channel breadth answers", () => {
      expect(flexibleDirectCaptureComplete("additional_marketing_surfaces", LA.otherSurfaces, "seo and newsletter")).toBe(
        true,
      );
      expect(flexibleDirectCaptureComplete("additional_marketing_surfaces", LA.otherSurfaces, "mostly referrals")).toBe(
        true,
      );
    });
  });

  describe("primary_acquisition_channel & marketing_channel_mix", () => {
    it("accepts single channel token", () => {
      expect(flexibleDirectCaptureComplete("primary_acquisition_channel", LA.channel, "organic search")).toBe(true);
    });
    it("accepts multi-item channel lists (general enumeration rule)", () => {
      expect(flexibleDirectCaptureComplete("primary_acquisition_channel", LA.channel, "referrals, LinkedIn, cold email")).toBe(
        true,
      );
      expect(flexibleDirectCaptureComplete("marketing_channel_mix", LA.channelMix, "tiktok + newsletter + paid")).toBe(
        true,
      );
    });
  });

  describe("competitive_pressure_point", () => {
    it("accepts single loss-factor word", () => {
      expect(flexibleDirectCaptureComplete("competitive_pressure_point", LA.competitive, "trust")).toBe(true);
    });
    it("accepts multi-item loss-factor lists without narrative", () => {
      expect(flexibleDirectCaptureComplete("competitive_pressure_point", LA.competitive, "price and trust")).toBe(true);
      expect(flexibleDirectCaptureComplete("competitive_pressure_point", LA.competitive, "clarity / proof")).toBe(true);
      expect(flexibleDirectCaptureComplete("competitive_pressure_point", LA.competitive, "speed, brand, support")).toBe(
        true,
      );
    });
    it("rejects arbitrary two-word lists that are not loss factors", () => {
      expect(flexibleDirectCaptureComplete("competitive_pressure_point", LA.competitive, "widgets and gadgets")).toBe(
        false,
      );
    });
  });

  describe("has_clear_cta", () => {
    it("accepts multi-adjective clarity lists", () => {
      expect(flexibleDirectCaptureComplete("has_clear_cta", LA.cta, "mixed and confusing")).toBe(true);
    });
  });

  describe("cross-cutting negatives", () => {
    it("rejects meaningless ack only", () => {
      expect(flexibleDirectCaptureComplete("primary_acquisition_channel", LA.channel, "thanks")).toBe(false);
    });
    it("content: headcount is not capacity", () => {
      expect(
        flexibleDirectCaptureComplete("content_creation_capacity", LA.content, "we have 12 employees"),
      ).toBe(false);
    });
  });

  const smokeKeys: CaptureKey[] = [
    "average_transaction_value",
    "conversion_rate_estimate",
    "monthly_marketing_budget",
    "content_creation_capacity",
    "has_email_list",
    "has_lead_magnet",
  ];

  it.each(smokeKeys)("smoke: %s still accepts a typical terse answer", (key) => {
    const table: Record<CaptureKey, { la: string; lu: string }> = {
      business_type_classifier: { la: LA.business, lu: "local service business" },
      audience_type_classifier: { la: LA.audience, lu: "mostly B2B" },
      website_presence: { la: LA.website, lu: "https://example.com" },
      social_platform_presence: { la: LA.socialPlatforms, lu: "linkedin and instagram" },
      additional_marketing_surfaces: { la: LA.otherSurfaces, lu: "seo + events" },
      monthly_revenue_range: { la: LA.revenue, lu: "~10k" },
      average_transaction_value: { la: LA.avgDeal, lu: "$800 avg" },
      conversion_rate_estimate: { la: LA.conversion, lu: "don't track" },
      primary_acquisition_channel: { la: LA.channel, lu: "google" },
      monthly_marketing_budget: { la: LA.budget, lu: "500/mo" },
      content_creation_capacity: { la: LA.content, lu: "5 hours" },
      competitive_pressure_point: { la: LA.competitive, lu: "fit" },
      has_email_list: { la: LA.emailList, lu: "yep" },
      has_lead_magnet: { la: LA.leadMagnet, lu: "not yet" },
      has_clear_cta: { la: LA.cta, lu: "pretty clear" },
      marketing_channel_mix: { la: LA.channelMix, lu: "instagram" },
    };
    const { la, lu } = table[key];
    expect(flexibleDirectCaptureComplete(key, la, lu)).toBe(true);
  });
});

describe("assistantAskedDedicatedSocialPlatformPresence", () => {
  it("matches dedicated Snapshot social prompts", () => {
    expect(assistantAskedDedicatedSocialPlatformPresence(LA.socialPlatforms)).toBe(true);
  });
  it("does not treat acquisition channel, carousel channel-mix, or beyond-site prompts as dedicated social asks", () => {
    expect(assistantAskedDedicatedSocialPlatformPresence(LA.channel)).toBe(false);
    expect(assistantAskedDedicatedSocialPlatformPresence(LA.channelMix)).toBe(false);
    expect(assistantAskedDedicatedSocialPlatformPresence(LA.otherSurfaces)).toBe(false);
    expect(assistantAskedDedicatedSocialPlatformPresence(LA.acquisitionForcedPrompt)).toBe(false);
    expect(assistantAskedDedicatedSocialPlatformPresence(LA.leadMagnetForcedPrompt)).toBe(false);
    expect(assistantAskedDedicatedSocialPlatformPresence(LA.cta)).toBe(false);
  });
});

describe("captureKeySatisfiedFromHistory", () => {
  it("marks social_platform_presence complete when a thank-you assistant turn breaks latest la/lu pairing", () => {
    const messages = [
      { role: "assistant", content: LA.website },
      { role: "user", content: "https://northline.example" },
      { role: "assistant", content: LA.socialPlatforms },
      { role: "user", content: "Mostly LinkedIn and Instagram." },
      { role: "assistant", content: "Thanks — that helps. One more on channels." },
      { role: "user", content: "email newsletter monthly" },
    ];
    expect(captureKeySatisfiedFromHistory("social_platform_presence", messages)).toBe(true);
    expect(captureKeySatisfiedFromHistory("website_presence", messages)).toBe(true);
  });

  it("marks competitive_pressure complete when a model follow-up breaks last-user / last-assistant pairing", () => {
    const messages = [
      { role: "assistant", content: LA.otherSurfaces },
      { role: "user", content: "email nurture to funnel, seo/aeo, content" },
      { role: "assistant", content: LA.competitive },
      { role: "user", content: "proof" },
      { role: "assistant", content: "Thanks! What do you want ideal customers to think when they first discover you?" },
      { role: "user", content: "approachable experts" },
    ];
    expect(captureKeySatisfiedFromHistory("additional_marketing_surfaces", messages)).toBe(true);
    expect(captureKeySatisfiedFromHistory("competitive_pressure_point", messages)).toBe(true);
  });

  it("still requires a valid answer after the capture question", () => {
    const messages = [
      { role: "assistant", content: LA.competitive },
      { role: "user", content: "maybe" },
      { role: "assistant", content: "What is your favorite color?" },
    ];
    expect(captureKeySatisfiedFromHistory("competitive_pressure_point", messages)).toBe(false);
  });

  it("does not pair acquisition-channel Q&A with social_platform_presence", () => {
    const messages = [
      { role: "assistant", content: LA.channel },
      { role: "user", content: "Mostly LinkedIn and referrals." },
    ];
    expect(captureKeySatisfiedFromHistory("social_platform_presence", messages)).toBe(false);
  });

  it("does not pair carousel email/social/paid prompts with social_platform_presence", () => {
    const messages = [
      { role: "assistant", content: LA.channelMix },
      { role: "user", content: "LinkedIn plus some paid search." },
    ];
    expect(captureKeySatisfiedFromHistory("social_platform_presence", messages)).toBe(false);
  });

  it("does not pair beyond-site / socials-bridge prompts with social_platform_presence", () => {
    const messages = [
      { role: "assistant", content: LA.otherSurfaces },
      { role: "user", content: "Mostly TikTok snippets + weekly newsletter." },
    ];
    expect(captureKeySatisfiedFromHistory("social_platform_presence", messages)).toBe(false);
  });

  it("marks social_platform_presence complete on immediate refusal after a dedicated social ask", () => {
    const messages = [
      { role: "assistant", content: LA.socialPlatforms },
      { role: "user", content: "I'd prefer not to answer that." },
    ];
    // Universal refusal short-circuit in flexibleDirectCaptureComplete + the dedicated
    // socialPresenceImmediateRefusalAfterDedicatedPrompt path both mark the capture complete so we
    // don't re-ask after the user has declined.
    expect(captureKeySatisfiedFromHistory("social_platform_presence", messages)).toBe(true);
    expect(socialPresenceImmediateRefusalAfterDedicatedPrompt(messages)).toBe(true);
  });
});
