/**
 * Snapshot results email gate: unlock only after capture on the results page
 * (not merely because intake stored user_email on the report row).
 */

function asFullReport(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function isResultsEmailUnlocked(report: Record<string, unknown>): boolean {
  const fr = asFullReport(report.full_report);
  if (!fr) return false;
  if (fr.results_email_unlocked === true) return true;
  if (fr.email_verified === true) return true;
  if (typeof fr.results_email_captured_at === "string" && fr.results_email_captured_at.trim()) {
    return true;
  }
  return false;
}

export function mergeResultsEmailUnlock(fullReport: unknown): Record<string, unknown> {
  const base = asFullReport(fullReport) ?? {};
  return {
    ...base,
    results_email_unlocked: true,
    email_verified: true,
    results_email_captured_at: new Date().toISOString(),
  };
}
