// lib/security/purchaseAccessLink.ts
// Long-lived signed link for post-purchase email → claim access + start diagnostic.
// Distinct purpose from magic-link / tier-token so one cannot substitute for another.

import "server-only";

import crypto from "crypto";
import { normalizeAccessTier } from "@/lib/security/tierToken";

const PURPOSE = "wb-purchase-access-v1";

/** Email access links stay valid long enough to start (and re-start) the diagnostic. */
export const PURCHASE_ACCESS_TTL_MS = 90 * 24 * 60 * 60 * 1000;

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

export type PurchaseAccessPayload = {
  email: string;
  /** Chat tier slug: snapshot-plus | blueprint | blueprint-plus */
  tier: string;
  brand?: string;
  firstName?: string;
  ts: number;
};

export function createPurchaseAccessToken(input: {
  email: string;
  tier: string;
  brand?: string | null;
  firstName?: string | null;
}): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const tier = normalizeAccessTier(input.tier);
  if (!tier || tier === "snapshot") return null;

  const payload: PurchaseAccessPayload = {
    email: input.email.trim().toLowerCase(),
    tier,
    ts: Date.now(),
  };
  const brand = input.brand?.trim();
  if (brand) payload.brand = brand.slice(0, 120);
  const firstName = input.firstName?.trim();
  if (firstName) payload.firstName = firstName.slice(0, 80);

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

export type PurchaseAccessVerifyResult =
  | { valid: true; email: string; tier: string; brand?: string; firstName?: string }
  | {
      valid: false;
      reason: "no_secret" | "malformed" | "invalid_signature" | "expired" | "decode_error" | "bad_tier";
    };

export function verifyPurchaseAccessToken(
  token: string | null | undefined,
): PurchaseAccessVerifyResult {
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
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString(),
    ) as PurchaseAccessPayload;
    if (!payload.email || typeof payload.ts !== "number" || !payload.tier) {
      return { valid: false, reason: "decode_error" };
    }
    if (Date.now() - payload.ts > PURCHASE_ACCESS_TTL_MS) {
      return { valid: false, reason: "expired" };
    }
    const tier = normalizeAccessTier(payload.tier);
    if (!tier || tier === "snapshot") return { valid: false, reason: "bad_tier" };
    return {
      valid: true,
      email: payload.email,
      tier,
      brand: payload.brand,
      firstName: payload.firstName,
    };
  } catch {
    return { valid: false, reason: "decode_error" };
  }
}

export function buildPurchaseAccessUrl(baseUrl: string, token: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/api/access/claim?token=${encodeURIComponent(token)}`;
}
