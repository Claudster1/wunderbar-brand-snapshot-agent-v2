import { describe, expect, it } from "vitest";
import {
  CONTINUE_ANYWAY_CHIP,
  buildCompletenessNudgeChips,
  completenessNudgePrompt,
} from "@/lib/intake/completenessNudgeChips";
import {
  getChipSelectionModeForCapture,
} from "@/lib/intake/captureSuggestedReplies";
import { resolveChipSelectionMode } from "@/lib/intake/multiSelectChipCatalog";

describe("completenessNudgeChips", () => {
  it("builds chips for acquisition gap plus continue anyway", () => {
    const chips = buildCompletenessNudgeChips(["Primary acquisition channel"]);
    expect(chips).toContain("Referrals / word of mouth");
    expect(chips[chips.length - 1]).toBe(CONTINUE_ANYWAY_CHIP);
  });

  it("writes a short chip-first nudge prompt", () => {
    const text = completenessNudgePrompt(["Primary acquisition channel", "Business type"], false);
    expect(text).toMatch(/Primary acquisition channel/);
    expect(text).toMatch(/Continue anyway/);
    expect(text).not.toMatch(/^- /m);
  });
});

describe("chipSelectionMode", () => {
  it("marks banded captures as single-select", () => {
    expect(getChipSelectionModeForCapture("has_email_list")).toBe("single");
    expect(getChipSelectionModeForCapture("monthly_revenue_range")).toBe("single");
    expect(getChipSelectionModeForCapture("primary_acquisition_channel")).toBe("single");
  });

  it("marks social and channel mix as multi-select", () => {
    expect(getChipSelectionModeForCapture("social_platform_presence")).toBe("multi");
    expect(getChipSelectionModeForCapture("marketing_channel_mix")).toBe("multi");
  });

  it("resolves single mode from discovery question text", () => {
    expect(
      resolveChipSelectionMode({
        nextPendingKey: null,
        lastAssistantText: "When a brand-new prospect first discovers you, where does that usually happen?",
      }),
    ).toBe("single");
  });
});
