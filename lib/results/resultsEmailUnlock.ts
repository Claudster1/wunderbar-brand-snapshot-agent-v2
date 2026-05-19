/**
 * Snapshot results email gate: unlock only after capture on the results page
 * (not merely because intake stored user_email on the report row).
 */

export function isResultsEmailUnlocked(report: Record<string, unknown>): boolean {
  const fullReport = report.full_report;
  if (!fullReport || typeof fullReport !== "object" || Array.isArray(fullReport)) {
    return false;
  }
  const fr = fullReport as Record<string, unknown>;
  if (fr.results_email_unlocked === true) return true;
  if (fr.email_verified === true) return true;
  return false;
}

export function mergeResultsEmailUnlock(fullReport: unknown): Record<string, unknown> {
  const base =
    fullReport && typeof fullReport === "object" && !Array.isArray(fullReport)
      ? { ...(fullReport as Record<string, unknown>) }
      : {};
  return {
    ...base,
    results_email_unlocked: true,
    email_verified: true,
    results_email_captured_at: new Date().toISOString(),
  };
}
