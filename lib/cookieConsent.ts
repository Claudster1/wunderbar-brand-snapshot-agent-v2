/**
 * lib/cookieConsent.ts
 *
 * Lightweight cookie consent utilities.
 * Consent is stored in a first-party cookie (ironic but necessary).
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
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/** Read current consent from the cookie. Returns null if no consent has been given. */
export function getConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

/** Write consent to a first-party cookie. */
export function setConsent(state: Omit<ConsentState, "timestamp">): ConsentState {
  const full: ConsentState = { ...state, timestamp: Date.now() };
  const value = encodeURIComponent(JSON.stringify(full));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
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
