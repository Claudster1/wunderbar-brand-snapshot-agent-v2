// app/api/verify-email/send/route.ts
// Generates a 6-digit verification code, stores it in Supabase, and sends it via email.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateEmail } from "@/lib/security/emailValidation";
import { fireACEvent } from "@/lib/fireACEvent";
import {
  applyActiveCampaignTags,
  removeActiveCampaignTags,
  setContactFields,
} from "@/lib/applyActiveCampaignTags";
import { createCrmSyncLog } from "@/lib/crm/inbound";

function generateCode(): string {
  // Cryptographically random 6-digit code
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

function normalizePhoneToE164(input: unknown): string {
  if (typeof input !== "string") return "";
  const cleaned = input.trim().replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) {
    return /^\+[1-9]\d{7,14}$/.test(cleaned) ? cleaned : "";
  }
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
}

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "verify-email-send", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    // ─── Security: Body size limit ───
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const { email, reportId, smsOptedIn, emailMarketingOptedIn, phoneMobile, honeypot } = await req.json();

    // Honeypot — silently drop bot-shaped submissions. Same pattern as /api/snapshot/lead-email.
    if (typeof honeypot === "string" && honeypot.length > 0) {
      logger.warn("[Verify Email Send] Honeypot tripped — dropping submission silently");
      return NextResponse.json({ success: true });
    }

    if (!email || !reportId) {
      return NextResponse.json({ error: "Email and reportId are required" }, { status: 400 });
    }

    // Full email validation (format + disposable + MX)
    const validation = await validateEmail(email);
    if (!validation.valid) {
      logger.warn("[Verify Email Send] Validation failed", { reason: validation.reason });
      return NextResponse.json(
        { error: validation.friendlyMessage },
        { status: 422 }
      );
    }

    const normalized = email.trim().toLowerCase();
    const normalizedPhoneMobile = normalizePhoneToE164(phoneMobile);
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Store verification code in the report record
    if (supabaseAdmin) {
      const { error: dbError } = await (supabaseAdmin as any)
        .from("brand_snapshot_reports")
        .update({
          user_email: normalized,
          email_verification_code: code,
          email_verification_expires: expiresAt,
          email_verified: false,
        })
        .eq("report_id", reportId);
      if (dbError) {
        logger.error("[Verify Email Send] Supabase update error", { error: dbError instanceof Error ? dbError.message : String(dbError) });
        return NextResponse.json({ error: "Failed to save verification code." }, { status: 500 });
      }
    }

    // Send verification email via ActiveCampaign
    await fireACEvent({
      email: normalized,
      eventName: "email_verification",
      tags: ["snapshot:email-verification"],
      fields: {
        verification_code: code,
        report_id: reportId,
      },
    });

    if (smsOptedIn === true) {
      try {
        await applyActiveCampaignTags({
          email: normalized,
          tags: ["sms:opted-in"],
        });
        await removeActiveCampaignTags({
          email: normalized,
          tags: ["sms:opted-out"],
        });
        await setContactFields({
          email: normalized,
          fields: {
            sms_opted_in: "true",
            sms_optin_source: "diagnostic_email_gate",
            ...(normalizedPhoneMobile ? { phone_mobile: normalizedPhoneMobile } : {}),
          },
        });
        await createCrmSyncLog({
          status: "success",
          eventType: "ac.consent.verify_email_send",
          payload: {
            email: normalized,
            report_id: reportId,
            sms_opted_in: true,
            source: "diagnostic_email_gate",
          },
        });
      } catch (smsErr) {
        // Non-blocking: verification should succeed even if AC sync fails.
        await createCrmSyncLog({
          status: "failed",
          eventType: "ac.consent.verify_email_send",
          errorMessage: smsErr instanceof Error ? smsErr.message : String(smsErr),
          payload: {
            email: normalized,
            report_id: reportId,
            sms_opted_in: true,
            source: "diagnostic_email_gate",
          },
        });
        logger.warn("[Verify Email Send] SMS opt-in sync failed", {
          error: smsErr instanceof Error ? smsErr.message : String(smsErr),
        });
      }
    }

    if (emailMarketingOptedIn === true) {
      try {
        await applyActiveCampaignTags({
          email: normalized,
          tags: ["email:marketing-opted-in"],
        });
        await removeActiveCampaignTags({
          email: normalized,
          tags: ["email:marketing-opted-out"],
        });
        await setContactFields({
          email: normalized,
          fields: {
            email_marketing_opted_in: "true",
            email_marketing_optin_source: "diagnostic_email_gate",
          },
        });
        await createCrmSyncLog({
          status: "success",
          eventType: "ac.consent.verify_email_send",
          payload: {
            email: normalized,
            report_id: reportId,
            email_marketing_opted_in: true,
            source: "diagnostic_email_gate",
          },
        });
      } catch (emailOptInErr) {
        // Non-blocking: verification should succeed even if AC sync fails.
        await createCrmSyncLog({
          status: "failed",
          eventType: "ac.consent.verify_email_send",
          errorMessage: emailOptInErr instanceof Error ? emailOptInErr.message : String(emailOptInErr),
          payload: {
            email: normalized,
            report_id: reportId,
            email_marketing_opted_in: true,
            source: "diagnostic_email_gate",
          },
        });
        logger.warn("[Verify Email Send] Email marketing opt-in sync failed", {
          error: emailOptInErr instanceof Error ? emailOptInErr.message : String(emailOptInErr),
        });
      }
    }

    return NextResponse.json({ success: true, message: "Verification code sent" });
  } catch (err) {
    logger.error("[Verify Email Send] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
