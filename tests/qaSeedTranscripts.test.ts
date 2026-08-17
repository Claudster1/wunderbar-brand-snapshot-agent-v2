import { describe, expect, it } from "vitest";
import {
  getQaSeedTurns,
  isQaSeedAllowed,
  parseQaSeedParam,
} from "@/lib/intake/qaSeedTranscripts";

describe("qaSeedTranscripts", () => {
  it("parses seed ids", () => {
    expect(parseQaSeedParam("near-end")).toBe("near-end");
    expect(parseQaSeedParam("handoff")).toBe("handoff");
    expect(parseQaSeedParam("nope")).toBeNull();
  });

  it("allows localhost and vercel previews, blocks production app host", () => {
    expect(isQaSeedAllowed("localhost")).toBe(true);
    expect(isQaSeedAllowed("foo.vercel.app")).toBe(true);
    expect(isQaSeedAllowed("app.wunderbrand.ai")).toBe(false);
  });

  it("near-end ends on an unanswered previous-brand question", () => {
    const turns = getQaSeedTurns("near-end");
    expect(turns.length).toBeGreaterThan(20);
    expect(turns[turns.length - 1]?.role).toBe("assistant");
    expect(turns[turns.length - 1]?.text).toMatch(/formal brand strategy/i);
    expect(turns.filter((t) => t.role === "user").length).toBeGreaterThan(10);
  });

  it("handoff includes the final user answer", () => {
    const turns = getQaSeedTurns("handoff");
    expect(turns[turns.length - 1]?.role).toBe("user");
    expect(turns[turns.length - 1]?.text).toMatch(/on my own/i);
  });
});
