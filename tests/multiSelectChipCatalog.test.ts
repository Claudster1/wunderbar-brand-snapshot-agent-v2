import { describe, expect, it } from "vitest";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import {
  ANNUAL_REVENUE_CHIPS,
  resolveSuggestedReplies,
} from "@/lib/intake/multiSelectChipCatalog";

describe("resolveSuggestedReplies", () => {
  it("returns primary goal chips for 6–12 month outcome questions", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText:
        "Which outcomes matter most for Acme in the next 6–12 months? Tap all that apply below.",
    });
    expect(chips?.[0]).toMatch(/qualified leads|Attract/i);
  });

  it("prefers pending capture chips over an unrelated topic in lastAssistantText", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: "website_presence",
      lastAssistantText: "What are you hoping to achieve with your brand in the next 6–12 months?",
    });
    expect(chips?.[0]).toMatch(/website|URL/i);
  });

  it("returns years-in-business chips for length questions", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText: "Roughly how long has Acme been operating? Tap a band below — or type an exact number.",
    });
    expect(chips).toEqual(getSuggestedRepliesForCapture("years_in_business"));
  });

  it("returns geographic scope chips", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText: "What's the geographic reach of your business?",
    });
    expect(chips).toEqual(getSuggestedRepliesForCapture("geographic_scope"));
  });

  it("returns annual revenue band chips", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText: "Roughly where does annual revenue fall? A ballpark is fine — tap a band below.",
    });
    expect(chips).toEqual(ANNUAL_REVENUE_CHIPS);
  });

  it("returns competitive-pressure chips for competitor-reason questions", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: null,
      lastAssistantText:
        "When prospects choose a competitor over you, what reason comes up most often — price, trust, clarity, speed, proof, or fit?",
    });
    expect(chips).toEqual(getSuggestedRepliesForCapture("competitive_pressure_point"));
    expect(chips).toContain("Price");
    expect(chips).not.toContain("LinkedIn");
  });

  it("does not keep social chips when the outgoing question is competitive pressure", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: "competitive_pressure_point",
      lastAssistantText:
        "When prospects choose a competitor over you, what reason comes up most often — price, trust, clarity, speed, proof, or fit?",
    });
    expect(chips).toEqual(getSuggestedRepliesForCapture("competitive_pressure_point"));
  });

  it("falls back to capture chips when the question is not a narrative multi-select", () => {
    const chips = resolveSuggestedReplies({
      nextPendingKey: "website_presence",
      lastAssistantText: "Do you have a website I can look at?",
    });
    expect(chips?.[0]).toMatch(/website|URL/i);
  });
});
