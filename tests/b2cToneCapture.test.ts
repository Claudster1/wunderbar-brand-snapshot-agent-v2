import { describe, expect, it } from "vitest";
import { buildCaptureQuestion } from "@/lib/intake/buildCaptureQuestion";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import {
  inferBusinessTypeFromCorpus,
  lockedAudienceFromMessages,
  lockedBusinessTypeFromMessages,
  resolveToneProfile,
} from "@/lib/intake/toneProfile";

describe("toneProfile inference", () => {
  it("classifies restaurant / café as retail (not B2B consulting)", () => {
    expect(inferBusinessTypeFromCorpus("we run a neighborhood Italian restaurant")).toBe("retail");
    expect(inferBusinessTypeFromCorpus("cafe and bakery downtown")).toBe("retail");
  });

  it("classifies salon / beauty as local_service (not service_b2b)", () => {
    expect(inferBusinessTypeFromCorpus("I own a hair salon and spa")).toBe("local_service");
    expect(inferBusinessTypeFromCorpus("mobile barber and beauty studio")).toBe("local_service");
  });

  it("still classifies consulting agencies as service_b2b", () => {
    expect(inferBusinessTypeFromCorpus("B2B marketing consulting for SMBs")).toBe("service_b2b");
    expect(inferBusinessTypeFromCorpus("we're a branding agency for startups")).toBe("service_b2b");
  });

  it("resolves hospitality vs local vs b2b tone profiles", () => {
    expect(
      resolveToneProfile({
        businessType: "retail",
        audienceType: "B2C",
        userCorpus: "restaurant serving guests",
      }),
    ).toBe("b2c_hospitality");
    expect(
      resolveToneProfile({
        businessType: "local_service",
        audienceType: "B2C",
        userCorpus: "hair salon",
      }),
    ).toBe("b2c_local_service");
    expect(
      resolveToneProfile({
        businessType: "service_b2b",
        audienceType: "B2B",
        userCorpus: "consulting",
      }),
    ).toBe("b2b_professional");
  });
});

describe("B2C capture wording", () => {
  it("uses hospitality language for restaurant transcripts", () => {
    const messages = [
      { role: "user", content: "We run a busy neighborhood restaurant for local guests" },
      { role: "user", content: "Mostly B2C" },
    ];
    expect(buildCaptureQuestion("average_transaction_value", "retail", { messages })).toMatch(
      /typical ticket|average check/i,
    );
    expect(buildCaptureQuestion("competitive_pressure_point", "retail", { messages })).toMatch(/guests/i);
    expect(buildCaptureQuestion("thought_leadership", "retail", { messages })).not.toMatch(/LinkedIn POV/i);
    const social = getSuggestedRepliesForCapture("social_platform_presence", { messages });
    expect(social[0]).toBe("Instagram");
    expect(social).toContain("Google Business / Maps");
  });

  it("uses booking language for salon / local service", () => {
    const messages = [
      { role: "user", content: "I own a hair salon — mostly B2C clients booking appointments" },
      { role: "user", content: "Mostly B2C" },
    ];
    expect(buildCaptureQuestion("average_transaction_value", "local_service", { messages })).toMatch(
      /booking or service value/i,
    );
    expect(buildCaptureQuestion("conversion_rate_estimate", "local_service", { messages })).toMatch(/book/i);
    expect(buildCaptureQuestion("has_lead_magnet", "local_service", { messages })).toMatch(
      /discount|perk|tip/i,
    );
    expect(buildCaptureQuestion("business_type_classifier", "local_service", { messages })).toMatch(
      /local \/ personal services/i,
    );
    const industry = getSuggestedRepliesForCapture("industry", { messages });
    expect(industry).toContain("Hair / beauty / spa");
    expect(industry[0]).not.toBe("Professional services / consulting");
  });

  it("keeps B2B deal/pipeline language for consulting", () => {
    const messages = [
      { role: "user", content: "We're a B2B consulting firm helping other businesses" },
      { role: "user", content: "Mostly B2B" },
    ];
    expect(buildCaptureQuestion("average_transaction_value", "service_b2b", { messages })).toMatch(
      /deal or order size/i,
    );
    expect(buildCaptureQuestion("thought_leadership", "service_b2b", { messages })).toMatch(/LinkedIn POV/i);
    const social = getSuggestedRepliesForCapture("social_platform_presence", { messages });
    expect(social[0]).toBe("LinkedIn");
  });

  it("does not treat bare 'menu of services' as hospitality retail", () => {
    expect(inferBusinessTypeFromCorpus("we offer a menu of consulting services for SMBs")).toBe(
      "service_b2b",
    );
  });

  it("locks B2C audience from chip text for consumer tone", () => {
    const messages = [
      { role: "user", content: "Local / personal services" },
      { role: "user", content: "Mostly B2C" },
    ];
    expect(lockedAudienceFromMessages(messages)).toBe("B2C");
    expect(lockedBusinessTypeFromMessages(messages)).toBe("local_service");
    expect(
      resolveToneProfile({
        businessType: lockedBusinessTypeFromMessages(messages),
        audienceType: lockedAudienceFromMessages(messages),
        userCorpus: messages.map((m) => m.content).join(" "),
      }),
    ).toBe("b2c_local_service");
  });

  it("locks business consulting chip to service_b2b", () => {
    const messages = [{ role: "user", content: "Business consulting / agency" }];
    expect(lockedBusinessTypeFromMessages(messages)).toBe("service_b2b");
  });

  it("uses hybrid online+storefront wording for product shops", () => {
    const messages = [
      { role: "user", content: "E‑commerce / DTC product — Shopify plus a downtown boutique storefront" },
      { role: "user", content: "Mostly B2C" },
    ];
    expect(buildCaptureQuestion("average_transaction_value", "ecommerce", { messages })).toMatch(
      /online and storefront|in-store purchase/i,
    );
    expect(buildCaptureQuestion("primary_acquisition_channel", "ecommerce", { messages })).toMatch(
      /online, in-store/i,
    );
  });

  it("serves consumer personality chips for salon transcripts", async () => {
    const { getBrandPersonalityChipsForTone } = await import("@/lib/intake/captureSuggestedReplies");
    const chips = getBrandPersonalityChipsForTone("b2c_local_service");
    expect(chips[0]).toMatch(/Warm and welcoming/i);
    expect(chips.join(" ")).not.toMatch(/Challenger \/ category-pushing/i);
  });

  it("does not collapse both-audience to B2B when marketing focus is consumer", () => {
    expect(
      resolveToneProfile({
        businessType: "service_b2b",
        audienceType: "both",
        marketingAudienceFocus: "B2C",
        userCorpus: "Meaningful mix of both. Consumer / B2C side of marketing",
      }),
    ).toBe("b2c_local_service");
    expect(
      resolveToneProfile({
        businessType: "service_b2b",
        audienceType: "both",
        marketingAudienceFocus: "B2B",
        userCorpus: "Meaningful mix of both",
      }),
    ).toBe("b2b_professional");
    expect(
      resolveToneProfile({
        businessType: "local_service",
        audienceType: "both",
        userCorpus: "Meaningful mix of both — salon + a few corporate clients",
      }),
    ).toBe("b2c_local_service");
  });

  it("completes average transaction capture for hospitality wording", async () => {
    const { flexibleDirectCaptureComplete } = await import(
      "@/lib/intake/flexibleDirectCaptureComplete"
    );
    expect(
      flexibleDirectCaptureComplete(
        "average_transaction_value",
        "**About what is a typical ticket or average check today?** A rough estimate is fine.",
        "About $45",
      ),
    ).toBe(true);
  });
});
