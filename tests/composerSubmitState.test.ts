import { describe, expect, it } from "vitest";
import {
  composerCanSubmit,
  composerSendTitle,
  composerShowsAffordanceHint,
} from "@/lib/intake/composerSubmitState";

const AFFORDANCE = new Set(["Something else (type below)", "Yes, here's the URL"]);

describe("composerSubmitState", () => {
  it("does not enable Send for affordance chip alone", () => {
    expect(
      composerCanSubmit({
        busy: false,
        inputTrimmed: "",
        selectedPills: ["Something else (type below)"],
        affordanceChips: AFFORDANCE,
      }),
    ).toBe(false);
  });

  it("enables Send when user types after affordance chip", () => {
    expect(
      composerCanSubmit({
        busy: false,
        inputTrimmed: "fractional CMO",
        selectedPills: ["Something else (type below)"],
        affordanceChips: AFFORDANCE,
      }),
    ).toBe(true);
  });

  it("enables Send for a normal chip selection", () => {
    expect(
      composerCanSubmit({
        busy: false,
        inputTrimmed: "",
        selectedPills: ["Nationally"],
        affordanceChips: AFFORDANCE,
      }),
    ).toBe(true);
  });

  it("titles Send to type-below when affordance is selected empty", () => {
    expect(
      composerSendTitle({
        busy: false,
        canSubmit: false,
        inputTrimmed: "",
        selectedPills: ["Something else (type below)"],
        affordanceChips: AFFORDANCE,
      }),
    ).toMatch(/Type your answer/i);
  });

  it("shows affordance hint only when empty + affordance selected", () => {
    expect(
      composerShowsAffordanceHint({
        inputTrimmed: "",
        selectedPills: ["Something else (type below)"],
        affordanceChips: AFFORDANCE,
      }),
    ).toBe(true);
    expect(
      composerShowsAffordanceHint({
        inputTrimmed: "hello",
        selectedPills: ["Something else (type below)"],
        affordanceChips: AFFORDANCE,
      }),
    ).toBe(false);
  });
});
