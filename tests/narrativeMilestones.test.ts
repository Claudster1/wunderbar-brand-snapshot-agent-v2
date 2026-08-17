import { describe, expect, it } from "vitest";
import {
  buildNarrativeRoutingLines,
  getNarrativeCompletionState,
} from "@/lib/intake/narrativeMilestones";

describe("narrativeMilestones", () => {
  it("returns routing lines when captures are complete but narrative is not", () => {
    const messages = [
      { role: "user", content: "We help SMBs" },
      { role: "assistant", content: "Tell me about goals" },
    ];
    const state = getNarrativeCompletionState(messages, "snapshot");
    expect(state.percent).toBeLessThan(100);
    const lines = buildNarrativeRoutingLines(messages, "snapshot", true);
    expect(lines.some((l) => /NARRATIVE CHECKLIST/i.test(l))).toBe(true);
  });

  it("does not mark milestones complete from assistant text alone", () => {
    const messages = [
      {
        role: "user" as const,
        content: "We help SMBs with marketing strategy.",
      },
      {
        role: "assistant" as const,
        content:
          "**If your brand were a person in a room, how would you describe them?** Do testimonials matter?",
      },
    ];
    const state = getNarrativeCompletionState(messages, "snapshot");
    expect(state.pendingLabels).toContain("Brand voice");
  });

  it("does not count milestone keywords in an unanswered final assistant turn", () => {
    const userCorpus = [
      "primary goals for the next 6-12 months",
      "biggest challenge is trust",
      "what makes us different from agencies",
    ].join(" ");
    const messages = [
      { role: "user" as const, content: userCorpus },
      {
        role: "assistant" as const,
        content:
          "Great to hear that! **If your brand were a person in a room, how would you describe them?**",
      },
    ];
    const state = getNarrativeCompletionState(messages, "snapshot");
    expect(state.pendingLabels).toContain("Brand voice");
    expect(state.percent).toBeLessThan(100);
  });

  it("signals wrap-up when narrative topics are covered", () => {
    const text = [
      "primary goals for the next 6-12 months",
      "biggest challenge is trust",
      "what makes us different from agencies",
      "brand personality is approachable / no jargon",
    ].join(" ");
    const messages = [{ role: "user", content: text }];
    const state = getNarrativeCompletionState(messages, "snapshot");
    expect(state.percent).toBeGreaterThanOrEqual(80);
    const lines = buildNarrativeRoutingLines(messages, "snapshot", true);
    expect(lines.some((l) => /FINAL HANDOFF|NARRATIVE CHECKLIST/i.test(l))).toBe(true);
  });
});
