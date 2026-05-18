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
          "**How clear and consistent does your messaging feel today?** Do testimonials or case studies matter for credibility?",
      },
    ];
    const state = getNarrativeCompletionState(messages, "snapshot");
    expect(state.pendingLabels).toContain("Messaging clarity");
    expect(state.pendingLabels).toContain("Credibility assets");
  });

  it("does not count milestone keywords in an unanswered final assistant turn", () => {
    const userCorpus = [
      "primary goals for the next 6-12 months",
      "biggest challenge is trust",
      "what makes us different from agencies",
      "deeper why we exist",
      "how clear our offer is on first encounter",
      "brand voice is approachable",
      "key topics we talk about",
      "thought leadership through our blog",
      "case studies and testimonials",
      "visual design and brand guidelines",
    ].join(" ");
    const messages = [
      { role: "user" as const, content: userCorpus },
      {
        role: "assistant" as const,
        content:
          "Great to hear that! **How clear and consistent does your messaging feel today? Do you feel confident that your message comes through clearly?**",
      },
    ];
    const state = getNarrativeCompletionState(messages, "snapshot");
    expect(state.pendingLabels).toContain("Messaging clarity");
    expect(state.percent).toBeLessThan(100);
  });

  it("signals wrap-up when narrative topics are covered", () => {
    const text = [
      "primary goals for the next 6-12 months",
      "biggest challenge is trust",
      "what makes us different from agencies",
      "deeper why we exist",
      "how clear our offer is on first encounter",
      "messaging consistency across channels",
      "brand voice is approachable",
      "key topics we talk about",
      "thought leadership through our blog",
      "case studies and testimonials",
      "visual design and brand guidelines",
    ].join(" ");
    const messages = [{ role: "user", content: text }];
    const state = getNarrativeCompletionState(messages, "snapshot");
    expect(state.percent).toBeGreaterThanOrEqual(80);
    const lines = buildNarrativeRoutingLines(messages, "snapshot", true);
    expect(lines.some((l) => /FINAL HANDOFF|NARRATIVE CHECKLIST/i.test(l))).toBe(true);
  });
});
