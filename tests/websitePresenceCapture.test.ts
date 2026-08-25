import { describe, expect, it } from "vitest";
import { flexibleDirectCaptureComplete } from "@/lib/intake/flexibleDirectCaptureComplete";
import { buildCaptureQuestion } from "@/lib/intake/buildCaptureQuestion";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import {
  assistantSuggestsCreatingWebsite,
  assistantWebsiteReplyLooksOnTopic,
  buildWebsitePresenceCaptureQuestion,
  textAffirmsWebsiteWithoutUrl,
  transcriptImpliesHasWebsite,
  websitePresenceUserSatisfiesCapture,
} from "@/lib/intake/websitePresenceCapture";

const LA_WEBSITE = buildCaptureQuestion("website_presence", null);

describe("websitePresenceCapture", () => {
  it("does not complete capture on bare yes or paste-URL chip", () => {
    expect(flexibleDirectCaptureComplete("website_presence", LA_WEBSITE, "yes")).toBe(false);
    expect(flexibleDirectCaptureComplete("website_presence", LA_WEBSITE, "Yes")).toBe(false);
    expect(
      flexibleDirectCaptureComplete("website_presence", LA_WEBSITE, "Yes — I'll paste the URL"),
    ).toBe(false);
    expect(textAffirmsWebsiteWithoutUrl("yes")).toBe(true);
    expect(textAffirmsWebsiteWithoutUrl("Yes — I'll paste the URL")).toBe(true);
    expect(websitePresenceUserSatisfiesCapture("yes")).toBe(false);
  });

  it("completes on URL, no-site, or skip-for-now", () => {
    expect(flexibleDirectCaptureComplete("website_presence", LA_WEBSITE, "https://acme.com")).toBe(
      true,
    );
    expect(flexibleDirectCaptureComplete("website_presence", LA_WEBSITE, "no website yet")).toBe(
      true,
    );
    expect(flexibleDirectCaptureComplete("website_presence", LA_WEBSITE, "Skip for now")).toBe(true);
  });

  it("switches forced prompt to URL follow-up after yes", () => {
    const messages = [
      { role: "assistant", content: LA_WEBSITE },
      { role: "user", content: "yes" },
    ];
    const followUp = buildWebsitePresenceCaptureQuestion(messages);
    expect(followUp).toMatch(/url/i);
    expect(followUp).not.toMatch(/do you have a website\?/i);
    expect(buildCaptureQuestion("website_presence", null, { messages })).toBe(followUp);
    expect(getSuggestedRepliesForCapture("website_presence", { messages })).toContain(
      "I'll paste the URL",
    );
  });

  it("flags create-a-site coaching as off-topic", () => {
    const bad =
      "That's exciting — would you like tips on how to create a website that converts visitors into customers?";
    expect(assistantSuggestsCreatingWebsite(bad)).toBe(true);
    expect(assistantWebsiteReplyLooksOnTopic(bad)).toBe(false);
    const good =
      "Got it — you have a site. **What's the URL?** Paste the link when you can.";
    expect(assistantWebsiteReplyLooksOnTopic(good)).toBe(true);
  });

  it("transcriptImpliesHasWebsite after affirm without URL", () => {
    const messages = [
      { role: "assistant", content: "Do you have a website?" },
      { role: "user", content: "yes" },
      { role: "assistant", content: "What's the URL?" },
      { role: "user", content: "skip for now" },
    ];
    expect(transcriptImpliesHasWebsite(messages)).toBe(true);
  });

  it("does not imply hasWebsite when they said no site", () => {
    const messages = [
      { role: "assistant", content: "Do you have a website?" },
      { role: "user", content: "no website yet" },
    ];
    expect(transcriptImpliesHasWebsite(messages)).toBe(false);
  });
});
