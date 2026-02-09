// lib/persistEmail.ts
// Stores the user's email in localStorage so the dashboard can retrieve their reports.
// Called from multiple entry points: assessment completion, checkout success, access page.
//
// SECURITY: Email is obfuscated with base64 encoding to prevent casual inspection.
// This is NOT encryption — it's defense-in-depth against shoulder-surfing and
// casual localStorage inspection. For true security, use server-side sessions.

const KEY = "bs_u";

function obfuscate(value: string): string {
  try {
    return btoa(unescape(encodeURIComponent(value)));
  } catch {
    return value;
  }
}

function deobfuscate(encoded: string): string {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    // If decoding fails, it might be a plain-text value from before the migration
    return encoded;
  }
}

export function persistEmail(email: string | null | undefined) {
  if (!email || typeof window === "undefined") return;
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return;
  try {
    localStorage.setItem(KEY, obfuscate(normalized));
    // Clean up legacy key if it exists
    localStorage.removeItem("brand_snapshot_email");
  } catch {
    // localStorage unavailable (private browsing, storage full, etc.)
  }
}

export function getPersistedEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // Check new key first, then legacy key for migration
    const stored = localStorage.getItem(KEY);
    if (stored) return deobfuscate(stored);

    // Migration: read from old plain-text key
    const legacy = localStorage.getItem("brand_snapshot_email");
    if (legacy) {
      // Migrate to obfuscated storage
      localStorage.setItem(KEY, obfuscate(legacy));
      localStorage.removeItem("brand_snapshot_email");
      return legacy;
    }

    return null;
  } catch {
    return null;
  }
}

export function clearPersistedEmail() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem("brand_snapshot_email");
  } catch {
    // Ignore
  }
}
