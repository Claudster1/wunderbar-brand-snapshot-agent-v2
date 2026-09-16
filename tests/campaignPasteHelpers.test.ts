import { describe, expect, it } from "vitest";
import { formatAdPlatformPaste, plainTextForCampaignPaste } from "@/lib/activation/campaignPasteHelpers";

describe("campaignPasteHelpers", () => {
  it("strips light markdown for clean ad paste", () => {
    expect(plainTextForCampaignPaste("## Subject\n\n**Bold** line\n- item")).toContain("Subject");
    expect(plainTextForCampaignPaste("## Subject\n\n**Bold** line\n- item")).toContain("Bold line");
    expect(plainTextForCampaignPaste("## Subject\n\n**Bold** line\n- item")).toContain("• item");
  });

  it("formats ad platform payloads", () => {
    expect(
      formatAdPlatformPaste({
        platform: "Meta",
        headline: "Clarity wins",
        primaryText: "Stop guessing.",
        cta: "Book a call",
      }),
    ).toBe(
      "Platform: Meta\nHeadline: Clarity wins\nPrimary text: Stop guessing.\nButton / next step: Book a call",
    );
  });
});
