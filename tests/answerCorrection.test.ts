import { describe, expect, it } from "vitest";
import {
  ANSWER_UNDO_WINDOW_MS,
  buildFieldCorrectionAssistantText,
  buildFieldCorrectionPrompt,
  correctionChipHintForLabel,
} from "@/lib/intake/answerCorrection";
import { buildCapturedSummary } from "@/lib/intake/buildCapturedSummary";

describe("answerCorrection", () => {
  it("exposes an 8s undo window", () => {
    expect(ANSWER_UNDO_WINDOW_MS).toBe(8_000);
  });

  it("builds a correction prompt with prior value", () => {
    const text = buildFieldCorrectionPrompt("Geographic scope", "Nationally");
    expect(text).toMatch(/update \*\*Geographic scope\*\*/i);
    expect(text).toMatch(/Nationally/);
  });

  it("embeds chip hints for geographic edits", () => {
    expect(correctionChipHintForLabel("Geographic scope")).toMatch(/locally, regionally/i);
    const full = buildFieldCorrectionAssistantText("Geographic scope", "Locally");
    expect(full).toMatch(/locally, regionally/i);
  });
});

describe("buildCapturedSummary edit fields", () => {
  it("extracts geographic scope from Q&A pairs with an editable id", () => {
    const items = buildCapturedSummary([
      {
        role: "assistant",
        content: "Where do you mainly serve customers — locally, regionally, nationally, or globally?",
      },
      { role: "user", content: "Nationally" },
    ]);
    const geo = items.find((i) => i.id === "geographic");
    expect(geo?.label).toBe("Geographic scope");
    expect(geo?.value).toBe("Nationally");
  });
});
