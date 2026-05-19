const STORAGE_PREFIX = "bs_results_unlock_";

export function resultsEmailGateStorageKey(reportId: string): string {
  return `${STORAGE_PREFIX}${reportId}`;
}

export function readResultsEmailGateUnlocked(reportId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(resultsEmailGateStorageKey(reportId)) === "1";
  } catch {
    return false;
  }
}

export function writeResultsEmailGateUnlocked(reportId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(resultsEmailGateStorageKey(reportId), "1");
  } catch {
    /* ignore */
  }
}

export function clearResultsEmailGateUnlocked(reportId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(resultsEmailGateStorageKey(reportId));
  } catch {
    /* ignore */
  }
}
