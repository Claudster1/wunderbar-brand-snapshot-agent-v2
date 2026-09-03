import { describe, expect, it } from "vitest";
import {
  authorizeReportPageRead,
  checkReportAccess,
  isSampleReportId,
} from "@/lib/reportAccess";
import { isResultsEmailUnlocked } from "@/lib/results/resultsEmailUnlock";

describe("checkReportAccess", () => {
  it("allows sample report ids", () => {
    expect(isSampleReportId("sample-service-b2b")).toBe(true);
    expect(checkReportAccess(null, "owner@x.com", "sample-service-b2b")).toEqual({
      hasAccess: true,
      reason: "sample",
    });
  });

  it("denies bare UUID when report has an owner", () => {
    expect(checkReportAccess(null, "owner@x.com", "abc-123")).toEqual({
      hasAccess: false,
      reason: "denied",
    });
  });

  it("allows verified owner", () => {
    expect(checkReportAccess("Owner@X.com", "owner@x.com", "abc-123")).toEqual({
      hasAccess: true,
      reason: "owner",
    });
  });

  it("denies mismatched email", () => {
    expect(checkReportAccess("other@x.com", "owner@x.com", "abc-123")).toEqual({
      hasAccess: false,
      reason: "denied",
    });
  });

  it("allows legacy rows with no owner email", () => {
    expect(checkReportAccess(null, null, "abc-123")).toEqual({
      hasAccess: true,
      reason: "no_owner",
    });
  });
});

describe("authorizeReportPageRead", () => {
  it("allows sample reports without a session cookie", async () => {
    await expect(
      authorizeReportPageRead({
        reportId: "sample-ecommerce",
        reportOwnerEmail: "owner@x.com",
        cookieHeader: null,
      }),
    ).resolves.toEqual({ hasAccess: true, reason: "sample" });
  });

  it("denies owned reports without a session or share token", async () => {
    await expect(
      authorizeReportPageRead({
        reportId: "abc-123",
        reportOwnerEmail: "owner@x.com",
        cookieHeader: null,
      }),
    ).resolves.toEqual({ hasAccess: false, reason: "denied" });
  });
});

describe("results page access matrix (logic)", () => {
  function resolveResultsGate(input: {
    storedTier: string;
    unlocked: boolean;
    hasAccess: boolean;
  }): "unlock_only" | "access_denied" | "full" {
    const showSnapshotLeadEmail = input.storedTier === "snapshot" && !input.unlocked;
    if (showSnapshotLeadEmail) return "unlock_only";
    if (!input.hasAccess) return "access_denied";
    return "full";
  }

  it("withholds free Snapshot body until email unlock even with a session", () => {
    expect(
      resolveResultsGate({ storedTier: "snapshot", unlocked: false, hasAccess: true }),
    ).toBe("unlock_only");
  });

  it("denies unlocked free Snapshot without session", () => {
    expect(
      resolveResultsGate({ storedTier: "snapshot", unlocked: true, hasAccess: false }),
    ).toBe("access_denied");
  });

  it("shows full free Snapshot when unlocked and authorized", () => {
    expect(
      resolveResultsGate({ storedTier: "snapshot", unlocked: true, hasAccess: true }),
    ).toBe("full");
  });

  it("denies paid reports without session", () => {
    expect(
      resolveResultsGate({ storedTier: "snapshot_plus", unlocked: true, hasAccess: false }),
    ).toBe("access_denied");
  });

  it("detects unlock flags used by the gate", () => {
    expect(isResultsEmailUnlocked({ full_report: { results_email_unlocked: true } })).toBe(true);
    expect(isResultsEmailUnlocked({ full_report: {} })).toBe(false);
  });
});
