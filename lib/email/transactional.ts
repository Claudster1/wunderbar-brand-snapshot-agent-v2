// lib/email/transactional.ts
//
// Transactional email is deliberately SEPARATE from marketing email
// (ActiveCampaign). Auth codes / magic links are time-sensitive and belong on a
// dedicated transactional stream so they inbox in seconds instead of landing in
// Promotions/Spam. Marketing (nurture, campaigns) stays on ActiveCampaign.
//
// The sender is behind a small interface so the provider can be swapped
// (Resend -> Postmark/SES) via config, without touching auth code.

import "server-only";

import { logger } from "@/lib/logger";

export interface TransactionalEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendResult {
  ok: boolean;
  id?: string;
  /** Provider used, or "console" in dev when no provider is configured. */
  provider: "resend" | "console" | "none";
  error?: string;
}

function fromAddress(): string {
  // e.g. "WunderBrand <auth@mail.wunderbrand.ai>"
  return (
    process.env.TRANSACTIONAL_EMAIL_FROM ||
    process.env.EMAIL_FROM ||
    "Wunderbar Digital <auth@mail.wunderbardigital.com>"
  );
}

/**
 * Send a transactional email. Provider is chosen from env:
 *  - RESEND_API_KEY set  -> Resend
 *  - otherwise, non-prod -> logged to console (so local dev works with no config)
 *  - otherwise, prod     -> hard error (fail loud; auth email must be deliverable)
 */
export async function sendTransactionalEmail(msg: TransactionalEmail): Promise<SendResult> {
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      const { data, error } = await resend.emails.send({
        from: fromAddress(),
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      });
      if (error) {
        logger.error("[transactional] Resend error", { error: error.message });
        return { ok: false, provider: "resend", error: error.message };
      }
      return { ok: true, provider: "resend", id: data?.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("[transactional] Resend send failed", { error: message });
      return { ok: false, provider: "resend", error: message };
    }
  }

  // No provider configured.
  if (process.env.NODE_ENV !== "production") {
    logger.warn("[transactional] No RESEND_API_KEY set — logging email to console (dev only)", {
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
    });
    return { ok: true, provider: "console" };
  }

  logger.error("[transactional] No transactional email provider configured in production");
  return { ok: false, provider: "none", error: "email_provider_not_configured" };
}
