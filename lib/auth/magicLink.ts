// lib/auth/magicLink.ts
//
// Passwordless magic-link tokens. A short-lived, HMAC-signed token that encodes
// the email being verified plus an optional post-login redirect path. Clicking
// the link hits /api/auth/magic-link/verify, which validates the token and
// issues the verified-email session cookie (lib/auth/session.ts).
//
// Same HMAC-SHA256 / base64url construction as the session + tier tokens, with a
// distinct purpose tag so a magic-link token can never double as a session token.

import "server-only";

import crypto from "crypto";

const PURPOSE = "wb-magic-link-v1";

// Short window: long enough to switch to the inbox, short enough to bound leaks.
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

function getSecret(): string | null {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.TIER_TOKEN_SECRET ||
    "";
  if (!secret) {
    if (process.env.NODE_ENV === "production") return null;
    return "dev-verified-session-secret";
  }
  return secret;
}

function sign(payloadB64: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(`${PURPOSE}.${payloadB64}`).digest("base64url");
}

interface MagicLinkPayload {
  email: string;
  /** Optional relative redirect path after login (must start with "/"). */
  redirect?: string;
  ts: number;
}

/** Only allow same-site relative redirects — never an absolute/off-site URL. */
export function sanitizeRedirect(redirect: string | null | undefined): string | undefined {
  if (!redirect || typeof redirect !== "string") return undefined;
  // Must be a root-relative path, not a protocol-relative or absolute URL.
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return undefined;
  return redirect.slice(0, 512);
}

export function createMagicLinkToken(email: string, redirect?: string): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const payload: MagicLinkPayload = {
    email: email.trim().toLowerCase(),
    ts: Date.now(),
  };
  const safeRedirect = sanitizeRedirect(redirect);
  if (safeRedirect) payload.redirect = safeRedirect;

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

export interface MagicLinkVerifyResult {
  valid: boolean;
  email?: string;
  redirect?: string;
  reason?: "no_secret" | "malformed" | "invalid_signature" | "expired" | "decode_error";
}

export function verifyMagicLinkToken(token: string | null | undefined): MagicLinkVerifyResult {
  if (!token || !token.includes(".")) return { valid: false, reason: "malformed" };

  const secret = getSecret();
  if (!secret) return { valid: false, reason: "no_secret" };

  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return { valid: false, reason: "malformed" };

  const expectedSig = sign(payloadB64, secret);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, reason: "invalid_signature" };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString()) as MagicLinkPayload;
    if (!payload.email || typeof payload.ts !== "number") {
      return { valid: false, reason: "decode_error" };
    }
    if (Date.now() - payload.ts > MAGIC_LINK_TTL_MS) {
      return { valid: false, reason: "expired" };
    }
    return { valid: true, email: payload.email, redirect: sanitizeRedirect(payload.redirect) };
  } catch {
    return { valid: false, reason: "decode_error" };
  }
}
