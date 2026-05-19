import { describe, expect, it, beforeEach } from "vitest";
import {
  clearResultsEmailGateUnlocked,
  readResultsEmailGateUnlocked,
  resultsEmailGateStorageKey,
  writeResultsEmailGateUnlocked,
} from "@/lib/results/resultsEmailGateStorage";

describe("resultsEmailGateStorage", () => {
  const reportId = "test-report-123";

  beforeEach(() => {
    clearResultsEmailGateUnlocked(reportId);
  });

  it("uses report-scoped session keys", () => {
    expect(resultsEmailGateStorageKey(reportId)).toBe("bs_results_unlock_test-report-123");
  });

  it("tracks unlock state per report in sessionStorage", () => {
    if (typeof sessionStorage === "undefined") {
      expect(readResultsEmailGateUnlocked(reportId)).toBe(false);
      return;
    }
    expect(readResultsEmailGateUnlocked(reportId)).toBe(false);
    writeResultsEmailGateUnlocked(reportId);
    expect(readResultsEmailGateUnlocked(reportId)).toBe(true);
    clearResultsEmailGateUnlocked(reportId);
    expect(readResultsEmailGateUnlocked(reportId)).toBe(false);
  });
});
