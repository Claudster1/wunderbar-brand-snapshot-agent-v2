// lib/auth/session.ts
//
// Verified-email session for END USERS (customers), distinct from the admin
// Supabase Auth session. A session is issued only after a user proves control
// of their email via the OTP flow (see /api/verify-email/confirm).
//
// The session is a stateless, HMAC-signed token stored in an httpOnly cookie.
// It carries the verified email so server code can trust "who you are" without
// relying on the spoofable localStorage email (lib/persistEmail.ts) or an
// unverified `?email=` query param.
//
// Design mirrors lib/security/tierToken.ts (HMAC-SHA256, base64url) so we add no
// new dependencies. A purpose tag is folded into the signature so a session
// token can never be confused with a tier token even if the secrets coincide.

import "server-only";

import crypto from "crypto";

const PURPOSE = "wb-verified-session-v1";

// 30-day sessions — long enough for dashboard/return visits, short enough to bound leak windows.
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const VERIFIED_SESSION_COOKIE = "wb_vsession";

/**
 * Resolve the signing secret. Prefer a dedicated SESSION_SECRET; fall back to
 * existing secrets so non-prod works out of the box. In production a real
 * secret MUST be configured — otherwise session issuance/verification fails
 * closed (no accidental "dev-secret" sessions in prod).
 */
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
  return crypto
    .createHmac("sha256", secret)
    .update(`${PURPOSE}.${payloadB64}`)
    .digest("base64url");
}

export interface VerifiedSession {
  email: string;
  /** Issued-at (ms epoch). */
  ts: number;
}

/**
 * Create a signed verified-email session token.
 * Returns null if no secret is configured in production (fail closed).
 */
export function createSessionToken(email: string): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const payload = JSON.stringify({
    email: email.trim().toLowerCase(),
    ts: Date.now(),
  } satisfies VerifiedSession);

  const payloadB64 = Buffer.from(payload).toString("base64url");
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

export interface SessionVerifyResult {
  valid: boolean;
  email?: string;
  reason?: "no_secret" | "malformed" | "invalid_signature" | "expired" | "decode_error";
}

/**
 * Verify a session token and return the verified email.
 */
export function verifySessionToken(token: string | null | undefined): SessionVerifyResult {
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
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString()) as VerifiedSession;
    if (!payload.email || typeof payload.ts !== "number") {
      return { valid: false, reason: "decode_error" };
    }
    if (Date.now() - payload.ts > SESSION_TTL_MS) {
      return { valid: false, reason: "expired" };
    }
    return { valid: true, email: payload.email };
  } catch {
    return { valid: false, reason: "decode_error" };
  }
}

/** Cookie attributes for the verified-email session. */
export function sessionCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

/** Parse the verified-email session directly from a raw Cookie header. */
export function readSessionEmailFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${VERIFIED_SESSION_COOKIE}=`));
  if (!match) return null;
  const token = decodeURIComponent(match.slice(VERIFIED_SESSION_COOKIE.length + 1));
  const result = verifySessionToken(token);
  return result.valid ? result.email ?? null : null;
}
