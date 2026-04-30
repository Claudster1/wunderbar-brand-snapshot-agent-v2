import { describe, it, expect } from "vitest";
import {
  BRAND_PILLAR_WEIGHTS,
  computeWeightedBrandAlignmentScore,
} from "../src/lib/pillarWeights";

describe("pillarWeights", () => {
  it("weights sum to 100", () => {
    const sum = Object.values(BRAND_PILLAR_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it("matches uniform pillars to linear scale (same as old sum when all equal)", () => {
    expect(computeWeightedBrandAlignmentScore({ positioning: 12, messaging: 12, visibility: 12, credibility: 12, conversion: 12 })).toBe(60);
    expect(computeWeightedBrandAlignmentScore({ positioning: 20, messaging: 20, visibility: 20, credibility: 20, conversion: 20 })).toBe(100);
    expect(computeWeightedBrandAlignmentScore({ positioning: 4, messaging: 4, visibility: 4, credibility: 4, conversion: 4 })).toBe(20);
  });

  it("emphasizes positioning over conversion when only one pillar is strong", () => {
    const posOnly = computeWeightedBrandAlignmentScore({
      positioning: 20,
      messaging: 0,
      visibility: 0,
      credibility: 0,
      conversion: 0,
    });
    const convOnly = computeWeightedBrandAlignmentScore({
      positioning: 0,
      messaging: 0,
      visibility: 0,
      credibility: 0,
      conversion: 20,
    });
    expect(posOnly).toBe(26);
    expect(convOnly).toBe(12);
    expect(posOnly).toBeGreaterThan(convOnly);
  });
});
