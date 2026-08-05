import { describe, expect, it } from "vitest";
import { estimateCostUsd, ratesForModel } from "@/lib/ai/pricing";

describe("ai pricing", () => {
  it("uses known rates for gpt-4o-mini", () => {
    expect(ratesForModel("gpt-4o-mini").inputPerMillionUsd).toBe(0.15);
  });

  it("estimates cost from tokens", () => {
    // 1M input @ $0.15 + 1M output @ $0.60 = $0.75
    expect(
      estimateCostUsd({
        model: "gpt-4o-mini",
        inputTokens: 1_000_000,
        outputTokens: 1_000_000,
      }),
    ).toBe(0.75);
  });

  it("returns null when no tokens", () => {
    expect(estimateCostUsd({ model: "gpt-4o-mini", inputTokens: 0, outputTokens: 0 })).toBeNull();
  });
});
