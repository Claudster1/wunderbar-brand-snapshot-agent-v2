import { describe, expect, it } from "vitest";
import {
  consumerVerticalCustomerNoun,
  consumerVerticalHints,
  inferConsumerVertical,
} from "@/lib/intake/consumerVertical";
import { audienceLanguageLockFragment } from "@/src/prompts/fragments/audienceLanguageLock";
import { snapshotPlusEnginePrompt } from "@/src/prompts/snapshotPlusEnginePrompt";
import { blueprintEnginePrompt } from "@/src/prompts/blueprintEnginePrompt";
import { blueprintPlusReportPrompt } from "@/src/prompts/blueprintPlusReportPrompt";
import { scoringEnginePrompt } from "@/src/prompts/scoringEnginePrompt";

describe("consumerVertical", () => {
  it("classifies major consumer packs", () => {
    expect(inferConsumerVertical({ industry: "Hair / beauty / spa" })).toBe("beauty_wellness");
    expect(inferConsumerVertical({ industry: "Restaurant / café / food" })).toBe("hospitality");
    expect(inferConsumerVertical({ industry: "Fashion / apparel / boutique" })).toBe("fashion_retail");
    expect(inferConsumerVertical({ industry: "Consumer financial / advisory" })).toBe(
      "consumer_professional",
    );
    expect(inferConsumerVertical({ industry: "dental clinic for families" })).toBe("health_clinic");
    expect(inferConsumerVertical({ industry: "HVAC and plumbing" })).toBe("home_services");
    expect(inferConsumerVertical({ businessType: "ecommerce", industry: "skincare" })).toBe(
      "dtc_product",
    );
    expect(
      inferConsumerVertical({ businessType: "ecommerce", industry: "beauty / personal care products" }),
    ).toBe("dtc_product");
    expect(
      inferConsumerVertical({ industry: "Fitness / yoga / wellness studio" }),
    ).toBe("beauty_wellness");
  });

  it("maps nouns and channel hints by vertical", () => {
    expect(consumerVerticalCustomerNoun("hospitality")).toBe("guests");
    expect(consumerVerticalCustomerNoun("consumer_professional")).toBe("clients");
    expect(consumerVerticalHints("fashion_retail").cta).toMatch(/shop/i);
    expect(consumerVerticalHints("consumer_professional").channels).not.toMatch(/Instagram-first/i);
    expect(consumerVerticalHints("consumer_professional").proof).toMatch(/credential/i);
  });
});

describe("paid-tier audience language lock", () => {
  it("embeds the shared lock in scoring and paid engines", () => {
    expect(audienceLanguageLockFragment).toMatch(/fashion_retail|consumer_professional/i);
    expect(audienceLanguageLockFragment).toContain("NEVER default to:");
    expect(audienceLanguageLockFragment).toContain("prospects");

    for (const prompt of [
      scoringEnginePrompt,
      snapshotPlusEnginePrompt,
      blueprintEnginePrompt,
      blueprintPlusReportPrompt,
    ]) {
      expect(prompt).toContain("AUDIENCE LANGUAGE LOCK");
      expect(prompt).toContain("consumer_professional");
      expect(prompt).toContain("fashion_retail");
    }
  });
});
