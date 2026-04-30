import { describe, it, expect } from "vitest";
import { wunderBrandScoreFromPillars } from "../lib/wunderBrandScoreDisplay";

describe("wunderBrandScoreFromPillars", () => {
  it("sums pillars when all values are on the 0–20 scale", () => {
    expect(
      wunderBrandScoreFromPillars({
        brand_alignment_score: 99,
        pillar_scores: {
          positioning: 10,
          messaging: 10,
          visibility: 10,
          credibility: 10,
          conversion: 10,
        },
      })
    ).toBe(50);
  });

  it("falls back to brand_alignment_score when pillars are not 0–20 (legacy rows)", () => {
    expect(
      wunderBrandScoreFromPillars({
        brand_alignment_score: 58,
        pillar_scores: {
          positioning: 61,
          messaging: 10,
          visibility: 10,
          credibility: 10,
          conversion: 10,
        },
      })
    ).toBe(58);
  });
});
