import { describe, it, expect, vi, beforeEach } from "vitest";

const completeWithFallbackMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/security/apiGuard", () => ({
  apiGuard: vi.fn(() => ({ passed: true as const, clientIp: "127.0.0.1" })),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/lib/ai", () => ({
  completeWithFallback: completeWithFallbackMock,
}));

import { POST } from "@/app/api/snapshot/complete-from-transcript/route";

function postJson(body: unknown) {
  return new Request("http://localhost/api/snapshot/complete-from-transcript", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Four turns with enough total transcript characters for the 120-byte gate. */
function longTurns() {
  const filler =
    "We run a boutique consulting practice focused on positioning for B2B SaaS teams in the Pacific Northwest. ";
  return [
    { role: "assistant", text: "Hi — what is your name and the name of your business?" },
    { role: "user", text: "I am Jordan and we are Northline Advisory." },
    { role: "assistant", text: "Tell me more about who you serve and how clients find you." },
    { role: "user", text: `${filler}${filler}${filler}` },
  ];
}

const validAnswersPayload = {
  userName: "Jordan",
  businessName: "Northline Advisory",
  industry: "Consulting",
  businessType: "service_b2b",
  website: "https://northline.example",
  socials: ["linkedin"],
  competitorNames: [],
  currentCustomers: "SMBs",
  idealCustomers: "Series A SaaS",
  idealDiffersFromCurrent: false,
  additionalDistinctSegmentsNote: null,
  customerAcquisitionSource: ["referrals"],
  primaryGoals: ["clarity"],
  biggestChallenge: "time",
  whatMakesYouDifferent: "depth",
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
  hasTestimonials: true,
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
  yearsInBusiness: "5",
  brandOriginStory: null,
  teamSize: "4",
  revenueRange: "100k-500k",
  monthlyRevenueRange: "5k_20k",
  averageTransactionValue: "5k",
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

describe("POST /api/snapshot/complete-from-transcript (mocked AI)", () => {
  beforeEach(() => {
    completeWithFallbackMock.mockReset();
  });

  it("returns 400 when messages is missing or not an array of length >= 4", async () => {
    let res = await POST(postJson({}));
    expect(res.status).toBe(400);
    let data = (await res.json()) as { error: string };
    expect(data.error).toContain("Not enough conversation");

    res = await POST(postJson({ messages: "not-array" }));
    expect(res.status).toBe(400);

    res = await POST(postJson({ messages: [{ role: "user", text: "a" }] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when the JSON body is invalid (treated as empty body)", async () => {
    const res = await POST(
      new Request("http://localhost/api/snapshot/complete-from-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not-valid-json",
      }),
    );
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toContain("Not enough conversation");
  });

  it("returns 400 when transcript is shorter than 120 characters", async () => {
    const short = [
      { role: "assistant", text: "Hi" },
      { role: "user", text: "A" },
      { role: "assistant", text: "Hi" },
      { role: "user", text: "B" },
    ];
    const res = await POST(postJson({ messages: short }));
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe("Transcript too short.");
  });

  it("returns 422 when the model returns no extractable JSON", async () => {
    completeWithFallbackMock.mockResolvedValue({ content: "Thanks — all set!", provider: "x", model: "y" });
    const res = await POST(postJson({ messages: longTurns() }));
    expect(res.status).toBe(422);
    const data = (await res.json()) as { error: string };
    expect(data.error).toMatch(/Could not extract structured answers/i);
  });

  it("returns 422 when JSON parses but fails snapshotAnswersRecordSchema", async () => {
    completeWithFallbackMock.mockResolvedValue({
      content: JSON.stringify({ onlyOne: "x", two: "y" }),
      provider: "x",
      model: "y",
    });
    const res = await POST(postJson({ messages: longTurns() }));
    expect(res.status).toBe(422);
    const data = (await res.json()) as { error: string };
    expect(data.error.length).toBeGreaterThan(0);
  });

  it("returns 200 with answers when stub returns valid JSON (raw object)", async () => {
    completeWithFallbackMock.mockResolvedValue({
      content: JSON.stringify(validAnswersPayload),
      provider: "stub",
      model: "stub",
    });
    const res = await POST(postJson({ messages: longTurns(), productTier: "snapshot" }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { answers: Record<string, unknown> };
    expect(data.answers.userName).toBe("Jordan");
    expect(data.answers.businessName).toBe("Northline Advisory");
    expect(completeWithFallbackMock).toHaveBeenCalledWith(
      "snapshot_transcript_extract",
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({ role: "user", content: expect.stringContaining("snapshot") }),
        ]),
      }),
    );
  });

  it("extracts JSON from a markdown fence wrapper", async () => {
    const fenced = "```json\n" + JSON.stringify(validAnswersPayload) + "\n```";
    completeWithFallbackMock.mockResolvedValue({
      content: "Here you go:\n" + fenced,
      provider: "stub",
      model: "stub",
    });
    const res = await POST(postJson({ messages: longTurns() }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { answers: Record<string, unknown> };
    expect(data.answers.industry).toBe("Consulting");
  });

  it("extracts JSON when wrapped in prose with leading and trailing text", async () => {
    const inner = JSON.stringify(validAnswersPayload);
    completeWithFallbackMock.mockResolvedValue({
      content: `Sure — ${inner}\n\nLet me know if you need edits.`,
      provider: "stub",
      model: "stub",
    });
    const res = await POST(postJson({ messages: longTurns() }));
    expect(res.status).toBe(200);
  });

  it("returns 500 when completeWithFallback throws", async () => {
    completeWithFallbackMock.mockRejectedValue(new Error("provider unavailable"));
    const res = await POST(postJson({ messages: longTurns() }));
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error: string };
    expect(data.error).toMatch(/Failed to complete from transcript/i);
  });
});
