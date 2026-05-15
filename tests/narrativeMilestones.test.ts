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
