import { describe, expect, it } from "vitest";
import { buildIntakeResponseMeta } from "@/lib/intake/buildIntakeResponseMeta";

describe("buildIntakeResponseMeta", () => {
  it("returns low progress when few captures are done", () => {
    const meta = buildIntakeResponseMeta({
      messages: [{ role: "user", content: "Acme Co" }],
      tier: "snapshot",
      captureStates: [
        { key: "business_type_classifier", label: "business type", completed: false },
        { key: "website_presence", label: "website", completed: false },
      ],
      nextPendingKey: "business_type_classifier",
    });
    expect(meta.captureCompletionPercent).toBe(0);
    expect(meta.overallProgressPercent).toBeLessThan(55);
    expect(meta.intakeReadyForFinalize).toBe(false);
    expect(meta.suggestedReplies?.length).toBeGreaterThan(0);
    expect(meta.chipSelectionMode).toBe("single");
  });

  it("marks ready when captures and narrative thresholds are met", () => {
    const corpus = [
      "Acme",
      "https://acme.com",
      "LinkedIn",
      "competitors are agencies",
      "SMBs launching",
      "goals for next year",
      "biggest challenge is trust",
      "different from others",
      "our mission and deeper why we exist",
      "how clear our offer is on first encounter",
      "messaging consistency across channels",
      "voice is approachable",
      "topics we cover",
      "thought leadership blog",
      "we have case studies and client testimonials",
      "visual brand",
    ];
    const messages = corpus.map((content) => ({ role: "user" as const, content }));
    const meta = buildIntakeResponseMeta({
      messages,
      tier: "snapshot",
      captureStates: [
        { key: "website_presence", label: "website", completed: true },
        { key: "social_platform_presence", label: "social", completed: true },
      ],
      nextPendingKey: null,
    });
    expect(meta.captureCompletionPercent).toBe(100);
    expect(meta.intakeReadyForFinalize).toBe(true);
    expect(meta.overallProgressPercent).toBe(97);
    expect(meta.questionsRemainingEstimate).toBe(0);
    expect(meta.capturedSummary.length).toBeGreaterThan(0);
  });

  it("does not offer finalize while the latest assistant message is still a question", () => {
    const corpus = [
      "Acme",
      "https://acme.com",
      "LinkedIn",
      "competitors are agencies",
      "SMBs launching",
      "goals for next year",
      "biggest challenge is trust",
      "different from others",
      "our mission and deeper why we exist",
      "how clear our offer is on first encounter",
      "messaging consistency across channels",
      "voice is approachable",
      "topics we cover",
      "thought leadership blog",
      "we have case studies and client testimonials",
      "visual brand",
    ];
    const messages = [
      ...corpus.map((content) => ({ role: "user" as const, content })),
      {
        role: "assistant" as const,
        content:
          "Great context. **How clear and consistent does your messaging feel today** — still confident it lands the same everywhere?",
      },
    ];
    const meta = buildIntakeResponseMeta({
      messages,
      tier: "snapshot",
      captureStates: [
        { key: "website_presence", label: "website", completed: true },
        { key: "social_platform_presence", label: "social", completed: true },
      ],
      nextPendingKey: null,
    });
    expect(meta.captureCompletionPercent).toBe(100);
    expect(meta.intakeReadyForFinalize).toBe(false);
  });

  it("resolves chips from outgoing text, not the previous assistant question in history", () => {
    const meta = buildIntakeResponseMeta({
      messages: [
        {
          role: "assistant",
          content:
            "Where does your brand show up on social today? Name the platforms that matter (or say none / not really active yet).",
        },
        {
          role: "user",
          content: "LinkedIn, Instagram, Facebook. but not active yet...just launching.",
        },
      ],
      tier: "snapshot",
      captureStates: [
        { key: "social_platform_presence", label: "social", completed: true },
        { key: "competitive_pressure_point", label: "competitive pressure", completed: false },
      ],
      nextPendingKey: "competitive_pressure_point",
      outgoingAssistantText:
        "When prospects choose a competitor over you, what reason comes up most often — price, trust, clarity, speed, proof, or fit?",
    });
    expect(meta.suggestedReplies).toContain("Price");
    expect(meta.suggestedReplies).toContain("Trust");
    expect(meta.suggestedReplies).not.toContain("LinkedIn");
    expect(meta.chipSelectionMode).toBe("single");
  });
});
