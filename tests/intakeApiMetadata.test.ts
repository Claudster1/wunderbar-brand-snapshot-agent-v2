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
    expect(meta.overallProgressPercent).toBeLessThan(30);
    expect(meta.intakeReadyForFinalize).toBe(false);
    expect(meta.suggestedReplies?.length).toBeGreaterThan(0);
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
      "why we exist",
      "voice is approachable",
      "topics we cover",
      "thought leadership blog",
      "case studies",
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
    expect(meta.capturedSummary.length).toBeGreaterThan(0);
  });
});
