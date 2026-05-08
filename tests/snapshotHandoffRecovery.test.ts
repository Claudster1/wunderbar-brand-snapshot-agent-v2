import { describe, expect, it } from "vitest";
import { snapshotAnswersRecordSchema } from "@/lib/snapshot/snapshotAnswersSchema";
import { conversationSuggestsIntakeComplete } from "@/lib/intake/assistantFinalHandoff";
import { intakeProgressDenominator } from "@/lib/chatTierConfig";

describe("snapshotAnswersRecordSchema (shared with /api/snapshot + complete-from-transcript)", () => {
  it("accepts a realistic extracted payload", () => {
    const answers = {
      userName: "Alex",
      businessName: "Acme Co",
      industry: "Consulting",
      businessType: "service_b2b",
      website: "https://acme.com",
      socials: ["linkedin"],
      competitorNames: [],
      currentCustomers: "SMBs",
      idealCustomers: "Growing SMBs",
      idealDiffersFromCurrent: false,
      additionalDistinctSegmentsNote: null,
      customerAcquisitionSource: ["referrals"],
      primaryGoals: ["growth"],
      biggestChallenge: "time",
      whatMakesYouDifferent: "speed",
      offerClarity: "somewhat clear",
      messagingClarity: "somewhat clear",
      missionStatement: null,
      visionStatement: null,
      coreValues: null,
      brandVoiceDescription: "direct",
      writingPreferences: null,
      hasBrandGuidelines: false,
      guidelineDetails: null,
      brandConsistency: "somewhat",
      hasTestimonials: false,
      hasCaseStudies: false,
      credibilityDetails: null,
      thoughtLeadershipActivity: null,
      hasEmailList: false,
      hasLeadMagnet: false,
      leadMagnetDetails: null,
      hasClearCTA: true,
      marketingChannels: ["linkedin"],
      visualConfidence: "somewhat confident",
      brandPersonalityWords: ["trusted"],
      archetypeSignals: {
        decisionStyle: "pragmatic",
        authoritySource: "experience",
        riskOrientation: "balanced",
        customerExpectation: "clarity",
      },
      yearsInBusiness: "3",
      brandOriginStory: null,
      teamSize: "5",
      revenueRange: "100k-500k",
      monthlyRevenueRange: "5k_20k",
      averageTransactionValue: "2k",
      conversionRateEstimate: "unknown",
      topAcquisitionChannel: "referral",
      monthlyMarketingBudget: "under_500",
      paidAdsBudgetBand: "none",
      paidAdsPrimaryObjective: null,
      contentCreationCapacity: "2_5_hours",
      previousBrandWork: "DIY",
      userRoleContext: "founder",
      servicesInterest: "not_now",
      expertConversation: false,
      contentOptIn: "no_thanks",
      implementationPrioritiesNow: null,
      implementationPrioritiesScaling: null,
      mentionedAssets: [],
    };
    const parsed = snapshotAnswersRecordSchema.safeParse(answers);
    expect(parsed.success).toBe(true);
  });

  it("rejects empty objects", () => {
    expect(snapshotAnswersRecordSchema.safeParse({}).success).toBe(false);
  });
});

describe("conversationSuggestsIntakeComplete", () => {
  it("is true when last assistant promises external results and enough user turns exist", () => {
    const messages = [
      { role: "assistant", text: "Hi — what's your name?" },
      { role: "user", text: "Alex" },
      { role: "user", text: "Acme" },
      { role: "user", text: "consulting" },
      {
        role: "assistant",
        text: "Your diagnostic is being finalized now. Tap See my results below the chat.",
      },
    ];
    expect(conversationSuggestsIntakeComplete(messages)).toBe(true);
  });

  it("is false with too few user messages", () => {
    const messages = [
      { role: "assistant", text: "Hi" },
      { role: "user", text: "Alex" },
      {
        role: "assistant",
        text: "Your diagnostic is being finalized now. See my results below.",
      },
    ];
    expect(conversationSuggestsIntakeComplete(messages)).toBe(false);
  });
});

describe("intakeProgressDenominator", () => {
  it("uses a shorter Snapshot denominator than Blueprint+", () => {
    expect(intakeProgressDenominator("snapshot")).toBeLessThan(intakeProgressDenominator("blueprint-plus"));
  });
});
