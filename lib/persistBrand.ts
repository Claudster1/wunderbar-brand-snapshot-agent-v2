const KEY = "wb_active_brand";

/**
 * Persist the active brand name in localStorage.
 * Called when a user completes a snapshot or selects a brand.
 */
export function persistBrandName(name: string): void {
  if (typeof window === "undefined" || !name) return;
  try {
    localStorage.setItem(KEY, name.trim());
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Get the currently active brand name from localStorage.
 */
export function getPersistedBrandName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Clear the active brand (e.g., when starting a new diagnostic).
 */
export function clearPersistedBrand(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
