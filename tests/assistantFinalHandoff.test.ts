import { describe, expect, it } from "vitest";
import {
  assistantPromisedExternalResultsEntry,
  isAssistantFinalHandoffWithoutJsonBlock,
} from "../lib/intake/assistantFinalHandoff";

describe("isAssistantFinalHandoffWithoutJsonBlock", () => {
  it("matches current system-prompt closing copy (no JSON)", () => {
    const text =
      "Thank you for your insights, Claudine. Your WunderBrand Snapshot™ is being finalized now. You'll be redirected to your results page automatically in a moment.";
    expect(isAssistantFinalHandoffWithoutJsonBlock(text)).toBe(true);
  });

  it("matches “see my results” wording", () => {
    expect(
      isAssistantFinalHandoffWithoutJsonBlock(
        "All set — tap **See my results** below the chat to open your results page.",
      ),
    ).toBe(true);
  });

  it("matches “open the full diagnostic” wording", () => {
    expect(
      isAssistantFinalHandoffWithoutJsonBlock(
        "All set — open the full diagnostic button under the chat for scores.",
      ),
    ).toBe(true);
  });

  it("replies containing JSON are not treated as jsonless handoff", () => {
    expect(
      isAssistantFinalHandoffWithoutJsonBlock('Thanks! {"userName":"x","businessName":"y","industry":"z"}'),
    ).toBe(false);
  });

  it("matches wrap-up copy when the model omits JSON (completed-all / finalize variants)", () => {
    expect(
      isAssistantFinalHandoffWithoutJsonBlock(
        "It seems we've completed all the necessary questions for your diagnostic. I'll finalize your diagnostic now so you can access your insights.",
      ),
    ).toBe(true);
    expect(
      isAssistantFinalHandoffWithoutJsonBlock(
        "Thank you! Your diagnostic will be available shortly — you won't see scores inside this chat.",
      ),
    ).toBe(true);
  });

  it("does not treat a stray brace as scoring JSON", () => {
    expect(
      isAssistantFinalHandoffWithoutJsonBlock(
        "Your diagnostic is being finalized now — use **Open full diagnostic** below. (Example token: {abc})",
      ),
    ).toBe(true);
  });

  it("rejects random mid-conversation text", () => {
    expect(isAssistantFinalHandoffWithoutJsonBlock("What makes you different from competitors?")).toBe(false);
  });
});

describe("assistantPromisedExternalResultsEntry", () => {
  it("is true for finalized + see my results phrasing", () => {
    const text =
      "Your diagnostic is being finalized now. Tap See my results below the chat to open your results page.";
    expect(assistantPromisedExternalResultsEntry(text)).toBe(true);
  });
});
