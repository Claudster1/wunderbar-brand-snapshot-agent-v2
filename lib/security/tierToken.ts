// lib/security/tierToken.ts
// Generates and validates HMAC-signed tokens to prove a user purchased a paid tier.
// The token is created after Stripe checkout and passed to the chat page via URL.

import crypto from "crypto";

const TOKEN_SECRET =
  process.env.TIER_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "dev-tier-token-secret";

// Tokens are valid for 24 hours (generous window for users to start their diagnostic)
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Normalize Stripe / URL / metadata product keys into the chat URL tier slug
 * (`snapshot-plus`, `blueprint`, `blueprint-plus`). Underscores and refresh SKUs
 * map to the parent paid chat experience.
 */
export function normalizeAccessTier(tier: string | null | undefined): string {
  if (!tier) return "";
  const n = String(tier).toLowerCase().trim().replace(/_/g, "-");
  if (!n || n === "snapshot" || n === "brand-snapshot") return "snapshot";
  if (n === "snapshot-plus" || n.startsWith("snapshot-plus-")) return "snapshot-plus";
  if (n === "blueprint-plus" || n.startsWith("blueprint-plus-")) return "blueprint-plus";
  if (n === "blueprint" || n === "blueprint-refresh" || n.startsWith("blueprint-refresh")) {
    return "blueprint";
  }
  return n;
}

/**
 * Create a signed tier-access token.
 * Payload: tier + email + timestamp, signed with HMAC-SHA256.
 * Format: base64url(JSON) + "." + base64url(signature)
 *
 * Always stores the hyphenated chat tier so success-page `?tier=` matches.
 */
export function createTierToken(tier: string, email: string): string {
  const normalizedTier = normalizeAccessTier(tier) || tier;
  const payload = JSON.stringify({
    tier: normalizedTier,
    email: email.toLowerCase(),
    ts: Date.now(),
  });

  const payloadB64 = Buffer.from(payload).toString("base64url");
  const sig = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${sig}`;
}

export interface TierTokenResult {
  valid: boolean;
  tier?: string;
  email?: string;
  reason?: string;
}

/**
 * Validate a signed tier-access token.
 */
export function validateTierToken(token: string): TierTokenResult {
  if (!token || !token.includes(".")) {
    return { valid: false, reason: "malformed" };
  }

  const [payloadB64, sig] = token.split(".");

  // Verify signature
  const expectedSig = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payloadB64)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return { valid: false, reason: "invalid_signature" };
  }

  // Decode payload
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

    // Check expiry
    if (Date.now() - payload.ts > TOKEN_TTL_MS) {
      return { valid: false, reason: "expired" };
    }

    return {
      valid: true,
      tier: normalizeAccessTier(payload.tier) || payload.tier,
      email: payload.email,
    };
  } catch {
    return { valid: false, reason: "decode_error" };
  }
}
