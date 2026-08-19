// lib/security/turnstile.ts
// Server-side Cloudflare Turnstile token verification.
// Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

import { isTurnstileEnforced } from "@/lib/security/turnstilePolicy";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

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
 * Skipped when Turnstile is not enforced (local/dev default, Vercel Preview).
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string
): Promise<TurnstileResult> {
  if (!isTurnstileEnforced()) {
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
