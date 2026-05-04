import { describe, expect, it } from "vitest";
import {
  flexibleDirectCaptureComplete,
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
    "Quick check: in one sentence, how do you primarily get paid and who are you mainly selling to?",
  businessConfirm: "Does that feel accurate, or would you describe your revenue model differently?",
  revenue: "Roughly what does the business generate month to month?",
  avgDeal: "About what is your average transaction value or deal size today?",
  conversion: "What is your approximate conversion or close rate today, if you track it?",
  channel: "Where do most new customers find you right now?",
  budget: "What is your approximate monthly marketing budget today?",
  content: "How much time can your team realistically invest in content creation each week?",
  competitive:
    "When prospects choose a competitor over you, what reason comes up most often (for example: price, trust, clarity, speed, proof, or fit)?",
  emailList: "Do you have an email list you're sending to today?",
  leadMagnet: "Do you have any free download or guide in exchange for their email?",
  cta: "How clear does the next step feel on your site or main profile?",
  channelMix: "Where are you showing up for people lately — email, social, paid, or something else?",
} as const;

describe("flexibleDirectCaptureComplete", () => {
  describe("business_type_classifier", () => {
    it("accepts narrative + model keywords", () => {
      expect(
        flexibleDirectCaptureComplete("business_type_classifier", LA.business, "B2B consulting for manufacturers"),
      ).toBe(true);
    });
    it("accepts terse multi-label list when asked how you get paid", () => {
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.business, "B2B and SaaS")).toBe(true);
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.business, "ecommerce, retail")).toBe(true);
    });
    it("rejects affirmation without model signal", () => {
      expect(flexibleDirectCaptureComplete("business_type_classifier", LA.businessConfirm, "yeah mostly accurate")).toBe(
        false,
      );
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
