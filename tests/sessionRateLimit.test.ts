import { describe, expect, it } from "vitest";
import {
  checkRateLimit,
  pickSessionReportId,
  refreshReportSessionBudgets,
  sessionRateLimitId,
} from "@/lib/security/rateLimit";

describe("session rate limits (save-and-return)", () => {
  it("keys by report id when present", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(sessionRateLimitId(id, "1.2.3.4")).toBe(`report:${id}`);
    expect(sessionRateLimitId(null, "1.2.3.4")).toBe("ip:1.2.3.4");
  });

  it("picks report id from common body fields", () => {
    const id = "22222222-2222-4222-8222-222222222222";
    expect(pickSessionReportId({ reportId: id })).toBe(id);
    expect(pickSessionReportId({ continuationReportId: id })).toBe(id);
    expect(pickSessionReportId({ snapshotReportId: id })).toBe(id);
    expect(pickSessionReportId({})).toBeNull();
  });

  it("refreshReportSessionBudgets clears a depleted chat bucket", () => {
    const id = "33333333-3333-4333-8333-333333333333";
    const sessionId = `report:${id}`;
    const tight = { maxRequests: 1, windowSeconds: 3600 };

    expect(checkRateLimit(sessionId, "brand-snapshot", tight).allowed).toBe(true);
    expect(checkRateLimit(sessionId, "brand-snapshot", tight).allowed).toBe(false);

    refreshReportSessionBudgets(id);

    expect(checkRateLimit(sessionId, "brand-snapshot", tight).allowed).toBe(true);
  });
});
