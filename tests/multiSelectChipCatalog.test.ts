import { describe, expect, it } from "vitest";
import {
  ANNUAL_REVENUE_CHIPS,
  GEOGRAPHIC_SCOPE_CHIPS,
  PRIMARY_GOAL_CHIPS,
  YEARS_IN_BUSINESS_CHIPS,
  resolveSuggestedReplies,
} from "@/lib/intake/multiSelectChipCatalog";

describe("resolveSuggestedReplies", () => {
  it("returns primary goal chips for 6–12 month outcome questions", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText:
        "Which outcomes matter most for Acme in the next 6–12 months? Tap all that apply below.",
    });
    expect(chips).toEqual(PRIMARY_GOAL_CHIPS);
  });

  it("prefers goals chips over an unrelated pending capture key", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: "website_presence",
      lastAssistantText: "What are you hoping to achieve with your brand in the next 6–12 months?",
    });
    expect(chips).toEqual(PRIMARY_GOAL_CHIPS);
  });

  it("returns years-in-business chips for length questions", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText: "Roughly how long has Acme been operating? Tap a band below — or type an exact number.",
    });
    expect(chips).toEqual(YEARS_IN_BUSINESS_CHIPS);
  });

  it("returns geographic scope chips", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText: "What's the geographic reach of your business?",
    });
    expect(chips).toEqual(GEOGRAPHIC_SCOPE_CHIPS);
  });

  it("returns annual revenue band chips", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText: "Roughly where does annual revenue fall? A ballpark is fine — tap a band below.",
    });
    expect(chips).toEqual(ANNUAL_REVENUE_CHIPS);
  });

  it("falls back to capture chips when the question is not a narrative multi-select", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: "website_presence",
      lastAssistantText: "Do you have a website I can look at?",
    });
    expect(chips?.[0]).toMatch(/website|URL/i);
  });
});
