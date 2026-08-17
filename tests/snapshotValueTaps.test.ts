import { describe, expect, it } from "vitest";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import { resolveSuggestedReplies, resolveChipSelectionMode } from "@/lib/intake/multiSelectChipCatalog";
import { buildCaptureQuestion } from "@/lib/intake/buildCaptureQuestion";

describe("snapshot value taps (years + visual)", () => {
  it("years operating is a one-tap single-select with clear bands", () => {
    const prompt = buildCaptureQuestion("years_in_business", null);
    const chips = resolveSuggestedReplies({
      nextPendingKey: "years_in_business",
      lastAssistantText: prompt,
    });
    expect(resolveChipSelectionMode({ nextPendingKey: "years_in_business", lastAssistantText: prompt })).toBe(
      "single",
    );
    expect(chips).toEqual(getSuggestedRepliesForCapture("years_in_business"));
    expect(chips?.some((c) => /1[–-]3 years|Less than 1/i.test(c))).toBe(true);
  });

  it("visual confidence is a one-tap single-select", () => {
    const prompt = buildCaptureQuestion("visual_confidence", null);
    const chips = resolveSuggestedReplies({
      nextPendingKey: "visual_confidence",
      lastAssistantText: prompt,
    });
    expect(resolveChipSelectionMode({ nextPendingKey: "visual_confidence", lastAssistantText: prompt })).toBe(
      "single",
    );
    expect(chips).toEqual(getSuggestedRepliesForCapture("visual_confidence"));
    expect(chips?.[0]).toMatch(/Very confident/i);
  });
});
