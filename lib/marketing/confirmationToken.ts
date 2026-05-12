// lib/marketing/confirmationToken.ts
// Signed, expiring tokens for email-confirmation links in marketing welcome emails.
//
// Design notes:
//   • HMAC-SHA256 over a JSON payload (NOT JWT — fewer moving parts, no parser deps).
//   • Token format is `<base64url(payload)>.<base64url(signature)>` which fits cleanly into a URL.
//   • The secret is read from MARKETING_CONFIRM_SECRET. If it's missing, sign/verify
//     return null and callers MUST fall back to the legacy direct-opt-in behavior so
//     production isn't broken by an unset env var.
//   • Tokens carry email + reportId + expiresAt. Email is the source of truth for which
//     AC contact to flip; reportId is for audit/log correlation only.

import crypto from "crypto";

const SECRET_ENV = "MARKETING_CONFIRM_SECRET";
// 14-day expiry is long enough for users who don't check inbox immediately but short
// enough that stale tokens get pruned. ActiveCampaign welcome emails typically open
// within 24h, so this is generous.
const DEFAULT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export interface MarketingConfirmationPayload {
  email: string;
  reportId: string;
  expiresAt: number; // Unix ms
  /** Snapshot the chosen preference so we can re-apply tags at confirm time. */
  contentOptIn?: string;
  /** Where the intent was captured (analytics only). */
  source?: string;
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(s: string): Buffer {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4 !== 0) s += "=";
  return Buffer.from(s, "base64");
}

function getSecret(): string | null {
  const s = process.env[SECRET_ENV];
  if (!s || s.length < 16) return null;
  return s;
}

export function isMarketingConfirmationConfigured(): boolean {
  return getSecret() !== null;
}

export function signMarketingConfirmationToken(
  payload: Omit<MarketingConfirmationPayload, "expiresAt"> & { ttlMs?: number },
): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const full: MarketingConfirmationPayload = {
    email: payload.email.trim().toLowerCase(),
    reportId: payload.reportId,
    expiresAt: Date.now() + (payload.ttlMs ?? DEFAULT_TTL_MS),
    ...(payload.contentOptIn ? { contentOptIn: payload.contentOptIn } : {}),
    ...(payload.source ? { source: payload.source } : {}),
  };
  const body = base64UrlEncode(Buffer.from(JSON.stringify(full), "utf8"));
  const sig = base64UrlEncode(crypto.createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyMarketingConfirmationToken(token: string): MarketingConfirmationPayload | null {
  const secret = getSecret();
  if (!secret) return null;
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".", 2);
  if (!body || !sig) return null;
  const expected = base64UrlEncode(crypto.createHmac("sha256", secret).update(body).digest());
  // Constant-time compare to avoid timing oracles on the signature.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(base64UrlDecode(body).toString("utf8")) as MarketingConfirmationPayload;
    if (!parsed.email || !parsed.reportId || !parsed.expiresAt) return null;
    if (Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}
