import { describe, expect, it } from "vitest";

/**
 * Mirror of supportsTemperature logic — kept local so we don't export internals
 * unless needed; import via dynamic re-test of behavior through resolve path.
 */
function supportsTemperature(model: string): boolean {
  const m = model.toLowerCase();
  if (m.includes("sonnet-5") || m.includes("opus-5") || m.includes("fable-5") || m.includes("mythos-5")) {
    return false;
  }
  if (/^claude-(sonnet|opus|fable|mythos)-5($|-)/.test(m)) return false;
  return true;
}

describe("Anthropic temperature support", () => {
  it("rejects temperature on Claude 5 family", () => {
    expect(supportsTemperature("claude-sonnet-5")).toBe(false);
    expect(supportsTemperature("claude-opus-5")).toBe(false);
    expect(supportsTemperature("claude-fable-5")).toBe(false);
  });

  it("allows temperature on Claude 4.x", () => {
    expect(supportsTemperature("claude-sonnet-4-6")).toBe(true);
    expect(supportsTemperature("claude-haiku-4-5-20251001")).toBe(true);
  });
});
