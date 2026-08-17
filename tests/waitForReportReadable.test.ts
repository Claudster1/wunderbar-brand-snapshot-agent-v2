import { describe, expect, it, vi } from "vitest";
import {
  snapshotGetIndicatesReportExists,
  waitForReportReadable,
} from "@/lib/intake/waitForReportReadable";

describe("snapshotGetIndicatesReportExists", () => {
  it("treats ok and auth gates as exists", () => {
    expect(snapshotGetIndicatesReportExists(200)).toBe(true);
    expect(snapshotGetIndicatesReportExists(401)).toBe(true);
    expect(snapshotGetIndicatesReportExists(403)).toBe(true);
    expect(snapshotGetIndicatesReportExists(404)).toBe(false);
    expect(snapshotGetIndicatesReportExists(500)).toBe(false);
  });
});

describe("waitForReportReadable", () => {
  it("returns true on first 403 (access-gated but saved)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 403, ok: false });
    await expect(
      waitForReportReadable("11111111-1111-4111-8111-111111111111", {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxAttempts: 3,
        baseDelayMs: 1,
      }),
    ).resolves.toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("retries 404 then succeeds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ status: 404, ok: false })
      .mockResolvedValueOnce({ status: 200, ok: true });
    await expect(
      waitForReportReadable("11111111-1111-4111-8111-111111111111", {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        maxAttempts: 5,
        baseDelayMs: 1,
      }),
    ).resolves.toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
