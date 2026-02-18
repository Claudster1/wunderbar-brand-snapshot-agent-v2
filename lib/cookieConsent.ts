/**
 * lib/cookieConsent.ts
 *
 * Lightweight cookie consent utilities.
 * Consent is stored in a first-party cookie with localStorage as fallback.
 *
 * Categories:
 * - "essential"    — always allowed (session, auth, CSRF)
 * - "analytics"    — site analytics (AC site tracking, GA, Vercel)
 * - "marketing"    — ad pixels, retargeting (none currently, future-proof)
 */

export type ConsentCategory = "essential" | "analytics" | "marketing";

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const COOKIE_NAME = "wunderbar_consent";
const LS_KEY = "wunderbar_consent";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

function readFromCookie(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function readFromLocalStorage(): ConsentState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeToCookie(full: ConsentState): void {
  const value = encodeURIComponent(JSON.stringify(full));
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

function writeToLocalStorage(full: ConsentState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(full));
  } catch {
    // localStorage may be unavailable (private browsing, storage full)
  }
}

/** Read current consent. Tries cookie first, then localStorage fallback. */
export function getConsent(): ConsentState | null {
  const fromCookie = readFromCookie();
  if (fromCookie) return fromCookie;

  // Fallback: check localStorage in case the cookie was cleared
  const fromLS = readFromLocalStorage();
  if (fromLS) {
    // Re-write the cookie so it stays in sync
    writeToCookie(fromLS);
    return fromLS;
  }

  return null;
}

/** Write consent to both cookie and localStorage. */
export function setConsent(state: Omit<ConsentState, "timestamp">): ConsentState {
  const full: ConsentState = { ...state, timestamp: Date.now() };
  writeToCookie(full);
  writeToLocalStorage(full);
  return full;
}

/** Accept all categories. */
export function acceptAll(): ConsentState {
  return setConsent({ analytics: true, marketing: true });
}

/** Decline all non-essential categories. */
export function declineAll(): ConsentState {
  return setConsent({ analytics: false, marketing: false });
}

/** Check if a specific category has been consented to. */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === "essential") return true;
  const state = getConsent();
  if (!state) return false;
  return state[category] ?? false;
}
