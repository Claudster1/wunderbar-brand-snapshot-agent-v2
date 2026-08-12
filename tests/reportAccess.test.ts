import { describe, expect, it } from "vitest";
import { checkReportAccess, isSampleReportId } from "@/lib/reportAccess";

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
