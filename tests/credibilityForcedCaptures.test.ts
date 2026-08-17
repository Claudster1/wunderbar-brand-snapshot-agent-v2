import { describe, expect, it } from "vitest";
import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import { flexibleDirectCaptureComplete } from "@/lib/intake/flexibleDirectCaptureComplete";

describe("credibility forced captures", () => {
  it("exposes chips for industry, geo, years, clarity, proof, visual, TL", () => {
    expect(getSuggestedRepliesForCapture("industry").length).toBeGreaterThan(3);
    expect(getSuggestedRepliesForCapture("geographic_scope")).toContain("Nationally");
    expect(getSuggestedRepliesForCapture("years_in_business")).toContain("1–3 years");
    expect(getSuggestedRepliesForCapture("offer_clarity")).toContain("Very clear");
    expect(getSuggestedRepliesForCapture("credibility_proof")).toContain("Neither yet");
    expect(getSuggestedRepliesForCapture("visual_confidence")).toContain("Somewhat confident");
    expect(getSuggestedRepliesForCapture("thought_leadership")).toContain("Not yet");
  });

  it("completes offer clarity and proof from chip answers", () => {
    expect(
      flexibleDirectCaptureComplete(
        "offer_clarity",
        "How clear is your offer to someone encountering you for the first time?",
        "Somewhat clear",
      ),
    ).toBe(true);
    expect(
      flexibleDirectCaptureComplete(
        "credibility_proof",
        "What customer proof do you have today? testimonials, case studies, or neither yet.",
        "Neither yet",
      ),
    ).toBe(true);
  });

  it("does not treat an offer-clarity answer as messaging clarity", () => {
    expect(
      flexibleDirectCaptureComplete(
        "messaging_clarity",
        "How clear is your offer to someone encountering you for the first time?",
        "Somewhat clear",
      ),
    ).toBe(false);
    expect(
      flexibleDirectCaptureComplete(
        "messaging_clarity",
        "How clear and consistent does your messaging feel across channels today?",
        "Somewhat clear",
      ),
    ).toBe(true);
  });
});
