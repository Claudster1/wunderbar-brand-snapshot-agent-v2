import { describe, expect, it } from "vitest";
import {
  applyPriorAnswersToCaptureStates,
  getPriorSatisfiedCaptureKeys,
} from "@/lib/intake/priorAnswersCapture";
import { buildPriorAnswerResumeLines } from "@/lib/intake/priorAnswersResume";
import { mergePriorWithExtracted } from "@/lib/intake/mergePriorAnswers";

const samplePrior = {
  userName: "Alex",
  businessName: "Acme Agency",
  businessType: "service_b2b",
  website: "https://acme.com",
  socials: ["linkedin"],
  currentCustomers: "SMBs launching",
  idealCustomers: "SMBs and startups",
  competitorNames: ["Other agencies"],
  whatMakesYouDifferent: "AI-driven platform",
  biggestChallenge: "Trust at launch",
  hasEmailList: false,
  hasLeadMagnet: false,
  hasClearCTA: true,
  marketingChannels: ["linkedin", "referral"],
  monthlyRevenueRange: "under_5k",
};

describe("priorAnswersCapture", () => {
  it("marks snapshot baseline captures satisfied from prior JSON", () => {
    const keys = getPriorSatisfiedCaptureKeys(samplePrior, "snapshot");
    expect(keys.has("website_presence")).toBe(true);
    expect(keys.has("social_platform_presence")).toBe(true);
    expect(keys.has("business_type_classifier")).toBe(true);
    expect(keys.has("competitive_pressure_point")).toBe(true);
  });

  it("applies prior completion to capture state list", () => {
    const states = applyPriorAnswersToCaptureStates(
      [
        { key: "website_presence", label: "website", completed: false },
        { key: "monthly_revenue_range", label: "revenue", completed: false },
      ],
      samplePrior,
      "snapshot-plus",
    );
    expect(states.find((s) => s.key === "website_presence")?.completed).toBe(true);
    expect(states.find((s) => s.key === "monthly_revenue_range")?.completed).toBe(true);
  });

  it("builds resume lines that block re-asks", () => {
    const lines = buildPriorAnswerResumeLines(samplePrior);
    expect(lines.some((l) => /WEBSITE.*prior intake/i.test(l))).toBe(true);
    expect(lines.some((l) => /SOCIAL.*prior intake/i.test(l))).toBe(true);
  });

  it("merges prior with extracted without dropping prior fields", () => {
    const merged = mergePriorWithExtracted(samplePrior, {
      brandVoiceDescription: "Warm and expert",
    });
    expect(merged.website).toBe("https://acme.com");
    expect(merged.brandVoiceDescription).toBe("Warm and expert");
  });
});
