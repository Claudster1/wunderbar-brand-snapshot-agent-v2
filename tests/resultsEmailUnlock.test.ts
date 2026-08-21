import { describe, expect, it } from "vitest";
import { isResultsEmailUnlocked, mergeResultsEmailUnlock } from "@/lib/results/resultsEmailUnlock";

describe("resultsEmailUnlock", () => {
  it("requires explicit unlock flag, not user_email alone", () => {
    expect(
      isResultsEmailUnlocked({
        user_email: "lead@example.com",
        full_report: { answers: {} },
      }),
    ).toBe(false);
  });

  it("unlocks when results_email_unlocked is set", () => {
    expect(
      isResultsEmailUnlocked({
        full_report: { results_email_unlocked: true },
      }),
    ).toBe(true);
  });

  it("unlocks when results_email_captured_at is stamped", () => {
    expect(
      isResultsEmailUnlocked({
        full_report: { results_email_captured_at: "2026-08-20T00:00:00.000Z" },
      }),
    ).toBe(true);
  });

  it("parses stringified full_report JSON", () => {
    expect(
      isResultsEmailUnlocked({
        full_report: JSON.stringify({ results_email_unlocked: true }),
      }),
    ).toBe(true);
  });

  it("mergeResultsEmailUnlock stamps flags", () => {
    const merged = mergeResultsEmailUnlock({ answers: { businessName: "Acme" } });
    expect(merged.results_email_unlocked).toBe(true);
    expect(merged.email_verified).toBe(true);
    expect(merged.answers).toEqual({ businessName: "Acme" });
  });
});
