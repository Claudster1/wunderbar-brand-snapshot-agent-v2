import { describe, expect, it } from "vitest";
import {
  assistantPromisedExternalResultsEntry,
  isAssistantFinalHandoffWithoutJsonBlock,
} from "../lib/intake/assistantFinalHandoff";

describe("isAssistantFinalHandoffWithoutJsonBlock", () => {
  it("matches current system-prompt closing copy (no JSON)", () => {
    const text =
      "Thank you for your insights, Claudine. Your diagnostic is being finalized now. You won't see scores inside this chat — use the **Open full diagnostic** button below the chat (or complete the quick email step if it appears) to open your full results.";
    expect(isAssistantFinalHandoffWithoutJsonBlock(text)).toBe(true);
  });

  it("matches “open the full diagnostic” wording", () => {
    expect(
      isAssistantFinalHandoffWithoutJsonBlock(
        "All set — open the full diagnostic button under the chat for scores.",
      ),
    ).toBe(true);
  });

  it("replies containing JSON are not treated as jsonless handoff", () => {
    expect(isAssistantFinalHandoffWithoutJsonBlock('Thanks! {"userName":"x"}')).toBe(false);
  });

  it("rejects random mid-conversation text", () => {
    expect(isAssistantFinalHandoffWithoutJsonBlock("What makes you different from competitors?")).toBe(false);
  });
});

describe("assistantPromisedExternalResultsEntry", () => {
  it("is true for finalized + open full results phrasing", () => {
    const text =
      "Your diagnostic is being finalized now. Use the Open full diagnostic button below the chat to open your full results.";
    expect(assistantPromisedExternalResultsEntry(text)).toBe(true);
  });
});
