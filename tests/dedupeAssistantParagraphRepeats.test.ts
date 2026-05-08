import { describe, expect, it } from "vitest";
import { dedupeAssistantRepeatedParagraphChunks } from "@/lib/assistantCopy/dedupeAssistantParagraphRepeats";

describe("dedupeAssistantRepeatedParagraphChunks", () => {
  it("removes a second identical long paragraph", () => {
    const q =
      "**Where does your brand show up on social today?** Name the platforms that matter (or say *none / not really active yet*).";
    const input = `Thanks for that.\n\n${q}\n\n${q}`;
    expect(dedupeAssistantRepeatedParagraphChunks(input)).toBe(`Thanks for that.\n\n${q}`);
  });

  it("keeps distinct long paragraphs", () => {
    const a =
      "**Where does your brand show up on social today?** Name the platforms that matter (or say *none / not really active yet*).";
    const b =
      "**Outside your website and those socials, where else are you investing attention** — email to a list, SEO or content, paid ads, events, partnerships — or mostly referrals / word of mouth?";
    const input = `${a}\n\n${b}`;
    expect(dedupeAssistantRepeatedParagraphChunks(input)).toBe(input);
  });

  it("preserves trailing JSON after duplicate paragraphs", () => {
    const q =
      "**Where does your brand show up on social today?** Name the platforms that matter (or say *none / not really active yet*).";
    const json = '{"userName":"A","businessName":"B"}';
    const input = `${q}\n\n${q}\n\n${json}`;
    expect(dedupeAssistantRepeatedParagraphChunks(input)).toBe(`${q}\n\n${json}`);
  });
});
