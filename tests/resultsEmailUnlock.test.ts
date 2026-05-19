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

  it("mergeResultsEmailUnlock stamps flags", () => {
    const merged = mergeResultsEmailUnlock({ answers: { businessName: "Acme" } });
    expect(merged.results_email_unlocked).toBe(true);
    expect(merged.email_verified).toBe(true);
    expect(merged.answers).toEqual({ businessName: "Acme" });
  });
});
