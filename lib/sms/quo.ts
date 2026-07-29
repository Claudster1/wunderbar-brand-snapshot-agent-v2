// lib/sms/quo.ts
//
// Native sender for Quo (formerly OpenPhone) business SMS.
// Docs: https://www.quo.com/docs  —  POST https://api.quo.com/v1/messages
//
// Marketing/nurture SMS goes through Quo (opt-in only); transactional auth email
// stays on Resend and marketing email stays on ActiveCampaign. Keep those lanes
// separate.
//
// Config (Vercel + .env.local):
//   QUO_API_KEY      — API key from Quo (Settings → API). Sent raw in the
//                      Authorization header (no "Bearer" prefix).
//   QUO_FROM_NUMBER  — the sending Quo number in E.164 (e.g. +16575003620) OR a
//                      Quo phone number id (PN...). Required.
//   QUO_API_BASE     — optional override; defaults to https://api.quo.com/v1

import "server-only";

import { logger } from "@/lib/logger";

const DEFAULT_BASE = "https://api.quo.com/v1";

export interface SendSmsInput {
  /** Recipient in E.164 (e.g. +15555555555). */
  to: string;
  /** Message body (1–1600 chars). */
  content: string;
  /**
   * When true, the conversation is moved to the "Done" inbox view after send.
   * Leave false for outreach you want a human to reply to (default).
   */
  markDone?: boolean;
}

export interface SendSmsResult {
  ok: boolean;
  id?: string;
  status?: string;
  /** "quo" when the API was called, "none" when unconfigured, "console" in dev. */
  provider: "quo" | "none" | "console";
  error?: string;
}

const E164 = /^\+[1-9]\d{7,14}$/;

export function isE164(value: string): boolean {
  return E164.test(value.trim());
}

/**
 * Send an SMS via Quo. Fail-safe: never throws — returns {ok:false} on any
 * misconfig/error so callers can treat SMS as best-effort and never block the
 * primary flow (consent capture, checkout, etc.).
 */
export async function sendQuoSms(input: SendSmsInput): Promise<SendSmsResult> {
  const apiKey = process.env.QUO_API_KEY;
  const from = process.env.QUO_FROM_NUMBER;
  const base = process.env.QUO_API_BASE || DEFAULT_BASE;

  const to = input.to?.trim();
  const content = input.content?.trim();

  if (!to || !isE164(to)) {
    return { ok: false, provider: "none", error: "invalid_recipient" };
  }
  if (!content) {
    return { ok: false, provider: "none", error: "empty_content" };
  }

  if (!apiKey || !from) {
    // Unconfigured. In dev, log so the flow is testable without a Quo account.
    if (process.env.NODE_ENV !== "production") {
      logger.warn("[quo] QUO_API_KEY/QUO_FROM_NUMBER not set — logging SMS to console (dev only)", {
        to,
        content,
      });
      return { ok: true, provider: "console" };
    }
    logger.error("[quo] SMS provider not configured (QUO_API_KEY / QUO_FROM_NUMBER missing)");
    return { ok: false, provider: "none", error: "provider_not_configured" };
  }

  try {
    const res = await fetch(`${base}/messages`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        content: content.slice(0, 1600),
        ...(input.markDone ? { setInboxStatus: "done" } : {}),
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      data?: { id?: string; status?: string };
      message?: string;
      title?: string;
    };

    if (!res.ok) {
      const error = json.title || json.message || `http_${res.status}`;
      logger.error("[quo] Send failed", { status: res.status, error });
      return { ok: false, provider: "quo", error };
    }

    return { ok: true, provider: "quo", id: json.data?.id, status: json.data?.status };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error("[quo] Send threw", { error });
    return { ok: false, provider: "quo", error };
  }
}
