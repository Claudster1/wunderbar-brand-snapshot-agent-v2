/**
 * Interpret `/api/snapshot/get` status while waiting for a just-saved report.
 * 403/401 often mean the row exists but email/session gating applies — still safe to
 * send the user to `/results` (that page loads via server-side Supabase).
 */
export function snapshotGetIndicatesReportExists(status: number): boolean {
  return status === 200 || status === 401 || status === 403;
}

export type WaitForReportOptions = {
  maxAttempts?: number;
  /** Base delay; attempt n waits baseDelayMs * min(n, 5). */
  baseDelayMs?: number;
  fetchImpl?: typeof fetch;
};

/**
 * Poll until the report row is visible (or access-gated). Returns false only if
 * we keep getting hard misses (404/5xx) for the whole window.
 */
export async function waitForReportReadable(
  reportId: string,
  options: WaitForReportOptions = {},
): Promise<boolean> {
  const maxAttempts = options.maxAttempts ?? 16;
  const baseDelayMs = options.baseDelayMs ?? 400;
  const fetchImpl = options.fetchImpl ?? fetch;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetchImpl(`/api/snapshot/get?id=${encodeURIComponent(reportId)}`, {
        cache: "no-store",
      });
      if (snapshotGetIndicatesReportExists(res.status)) return true;
    } catch {
      /* retry */
    }
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, baseDelayMs * Math.min(i + 1, 5)));
    }
  }
  return false;
}
