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
    expect(parseQaSeedParam("salon")).toBe("near-end-salon");
    expect(parseQaSeedParam("restaurant")).toBe("near-end-restaurant");
    expect(parseQaSeedParam("fashion")).toBe("near-end-fashion");
    expect(parseQaSeedParam("finance")).toBe("near-end-consumer-finance");
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

  it("salon seed uses client language, not prospects / LinkedIn POV", () => {
    const turns = getQaSeedTurns("near-end-salon");
    const joined = turns.map((t) => t.text).join("\n");
    expect(joined).toMatch(/Luna Hair Studio/);
    expect(joined).toMatch(/brand-new client/i);
    expect(joined).not.toMatch(/prospects choose/i);
    expect(joined).not.toMatch(/LinkedIn POV/i);
    expect(turns[turns.length - 1]?.role).toBe("assistant");
  });

  it("restaurant seed uses guest / hospitality language", () => {
    const turns = getQaSeedTurns("near-end-restaurant");
    const joined = turns.map((t) => t.text).join("\n");
    expect(joined).toMatch(/Harbor Kitchen/);
    expect(joined).toMatch(/brand-new guest/i);
    expect(joined).toMatch(/menu or experience/i);
    expect(joined).not.toMatch(/LinkedIn POV/i);
  });

  it("fashion seed uses boutique / shopper language, not booking consult copy", () => {
    const turns = getQaSeedTurns("near-end-fashion");
    const joined = turns.map((t) => t.text).join("\n");
    expect(joined).toMatch(/Thread & Tide/);
    expect(joined).toMatch(/Fashion \/ apparel/);
    expect(joined).toMatch(/shoppers|Instagram/i);
    expect(joined).not.toMatch(/book a consult|LinkedIn POV/i);
  });

  it("consumer-finance seed uses consult/trust language, not Instagram-first", () => {
    const turns = getQaSeedTurns("near-end-consumer-finance");
    const joined = turns.map((t) => t.text).join("\n");
    expect(joined).toMatch(/Northshore Wealth/);
    expect(joined).toMatch(/Consumer financial/);
    expect(joined).toMatch(/consult|credentials|Google, LinkedIn/i);
    expect(joined).not.toMatch(/Instagram, Google, TikTok/i);
    expect(joined).not.toMatch(/LinkedIn POV/i);
  });
});
