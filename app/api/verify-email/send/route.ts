// app/api/verify-email/send/route.ts
// Generates a 6-digit verification code, stores it in Supabase, and sends it via email.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateEmail } from "@/lib/security/emailValidation";
import { fireACEvent } from "@/lib/fireACEvent";
import {
  addContactToList,
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

    const { email, reportId, smsOptedIn, emailMarketingOptedIn, phoneMobile, honeypot, skipOtp } = await req.json();

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

    /**
     * skipOtp=true is the lead-capture-only path (Blueprint gate after we dropped the OTP step).
     * In that mode we:
     *   • record the email + SMS/marketing intent (handled below as before),
     *   • skip generating a 6-digit code, the DB write of code/expiry/verified, and the AC
     *     event that would email the code to the user.
     * This lets the same endpoint serve both legacy OTP (snapshot-plus, blueprint sensitive paths
     * that still want it) and the new no-OTP capture without forking SMS / marketing logic.
     */
    const wantsOtp = skipOtp !== true;
    if (wantsOtp) {
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
    } else if (supabaseAdmin) {
      // No-OTP path still needs to associate the email with the report row so downstream tagging
      // and the marketing-insights step can resolve the same email back from `user_email`.
      const { error: dbError } = await (supabaseAdmin as any)
        .from("brand_snapshot_reports")
        .update({ user_email: normalized })
        .eq("report_id", reportId);
      if (dbError) {
        logger.error("[Verify Email Send] Supabase update error (skipOtp)", {
          error: dbError instanceof Error ? dbError.message : String(dbError),
        });
        return NextResponse.json({ error: "Failed to save email." }, { status: 500 });
      }
    }

    // Subscribe contact to the canonical Brand Snapshot Leads list once we have a valid
    // email. Per-list membership is required for AC's deliverability dashboard, engagement
    // reports, and the engagement-decay automation. Marketing eligibility is still gated
    // by the `email:marketing-opted-in` / `-opted-out` tags downstream.
    const brandSnapshotListId = process.env.AC_LIST_BRAND_SNAPSHOT_LEADS;
    if (brandSnapshotListId) {
      await addContactToList({ email: normalized, listId: brandSnapshotListId }).catch((err) =>
        logger.warn("[Verify Email Send] AC list subscription failed", {
          error: err instanceof Error ? err.message : String(err),
        })
      );
    }

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
        // Double-opt-in mirror of /api/snapshot/lead-email + marketing-insights-preference.
        // Apply intent tag now; flip to opted-in only after the user clicks the link in
        // their AC welcome email (see /api/marketing/confirm).
        const { signMarketingConfirmationToken } = await import("@/lib/marketing/confirmationToken");
        const { buildMarketingConfirmationUrl } = await import("@/lib/marketing/buildConfirmationUrl");
        const confirmationToken = signMarketingConfirmationToken({
          email: normalized,
          reportId,
          source: "diagnostic_email_gate",
        });
        const doubleOptInEnabled = confirmationToken !== null;

        if (doubleOptInEnabled) {
          const confirmationLink = buildMarketingConfirmationUrl(confirmationToken);
          await applyActiveCampaignTags({
            email: normalized,
            tags: ["email:marketing-pending"],
          });
          await removeActiveCampaignTags({
            email: normalized,
            tags: ["email:marketing-opted-out"],
          });
          await setContactFields({
            email: normalized,
            fields: {
              email_marketing_opt_in_intent: "true",
              email_marketing_optin_source: "diagnostic_email_gate",
              marketing_confirmation_link: confirmationLink,
            },
          });
        } else {
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
        }
        await createCrmSyncLog({
          status: "success",
          eventType: "ac.consent.verify_email_send",
          payload: {
            email: normalized,
            report_id: reportId,
            email_marketing_opted_in: !doubleOptInEnabled,
            email_marketing_opt_in_intent: doubleOptInEnabled,
            source: "diagnostic_email_gate",
            double_opt_in: doubleOptInEnabled,
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
