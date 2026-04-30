// lib/security/turnstile.ts
// Server-side Cloudflare Turnstile token verification.
// Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const ENABLE_IN_DEV =
  process.env.ENABLE_TURNSTILE_DEV === "true" ||
  process.env.NEXT_PUBLIC_ENABLE_TURNSTILE_DEV === "true";
const HAS_SITE_KEY = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const SHOULD_ENFORCE_TURNSTILE =
  process.env.NODE_ENV === "production" || (ENABLE_IN_DEV && HAS_SITE_KEY);

export interface TurnstileResult {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

/**
 * Verify a Turnstile token server-side.
 * Returns { success: true } if valid, { success: false } otherwise.
 *
 * In development (NODE_ENV !== 'production') with no TURNSTILE_SECRET_KEY,
 * verification is skipped. In production, missing key = fail.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string
): Promise<TurnstileResult> {
  // Keep Turnstile optional in local/dev by default.
  // This matches the client widget behavior and avoids false negatives in local QA.
  if (!SHOULD_ENFORCE_TURNSTILE) {
    return { success: true };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;

  // In enforced mode, missing key is always a hard failure.
  if (!secret) {
    console.error("[Turnstile] TURNSTILE_SECRET_KEY not set while enforcement is enabled — blocking request");
    return { success: false, "error-codes": ["missing-secret-key"] };
  }

  // Missing token = failed challenge
  if (!token) {
    return { success: false, "error-codes": ["missing-input-response"] };
  }

  try {
    const body: Record<string, string> = {
      secret,
      response: token,
    };
    if (remoteIp) body.remoteip = remoteIp;

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("[Turnstile] Verify endpoint returned", res.status);
      return { success: false, "error-codes": ["api-error"] };
    }

    const result: TurnstileResult = await res.json();
    return result;
  } catch (err) {
    console.error("[Turnstile] Verification network error:", err);
    // Fail closed: reject request on network/infra errors
    return { success: false, "error-codes": ["network-error"] };
  }
}
