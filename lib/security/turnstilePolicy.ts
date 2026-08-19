/**
 * Shared Turnstile enablement — keep client widget and server verify in sync.
 *
 * Enforce only on Vercel Production (and local when ENABLE_TURNSTILE_DEV=true).
 * Preview deployments often use hostnames not allowlisted in Cloudflare Turnstile,
 * which leaves the invisible widget without a token and blocks email unlock.
 */

export function isTurnstileEnforced(): boolean {
  const enableInDev =
    process.env.ENABLE_TURNSTILE_DEV === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_TURNSTILE_DEV === "true";
  const hasSiteKey = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  // Prefer Vercel env when present (build-time on Vercel).
  const vercelEnv = process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv === "preview" || vercelEnv === "development") {
    return enableInDev && hasSiteKey;
  }
  if (vercelEnv === "production") {
    return hasSiteKey;
  }

  // Local / unknown: production Node builds without VERCEL_ENV still enforce when key present.
  return process.env.NODE_ENV === "production" ? hasSiteKey : enableInDev && hasSiteKey;
}
