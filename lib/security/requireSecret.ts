/**
 * Shared guard for webhook / cron auth secrets.
 *
 * When a secret env var is unset we must NOT silently allow the request in
 * production — that turns protected cron jobs and inbound webhooks into public,
 * unauthenticated endpoints. In local/dev we still fall back to allowing the
 * request so the flow is testable without configuring secrets.
 *
 * Usage:
 *   const secret = process.env.CRON_SECRET;
 *   if (!secret) return allowMissingSecret();
 */
export function allowMissingSecret(): boolean {
  return process.env.NODE_ENV !== "production";
}
