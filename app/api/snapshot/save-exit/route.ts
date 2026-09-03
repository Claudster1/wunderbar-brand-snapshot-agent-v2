// app/api/snapshot/save-exit/route.ts
// Stores the user's email against their draft report, sends an immediate
// transactional resume email (Resend), and tags ActiveCampaign for Seq 9 nurture.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fireACEvent, trackActiveCampaignSiteEvent } from "@/lib/fireACEvent";
import { resolveOutboundAppBaseUrl } from "@/lib/server/runtimeBaseUrl";

function getSupabase() {
  return supabaseAdmin;
}

type SupabaseLikeError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

function describeError(err: unknown): string {
  if (!err) return "unknown error";
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const e = err as SupabaseLikeError;
    return [e.message, e.details, e.hint, e.code].filter(Boolean).join(" | ") || JSON.stringify(e);
  }
  return String(err);
}

export async function POST(req: Request) {
  // ─── Security: Rate limit ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = await apiGuard(req, { routeId: "save-exit", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    // ─── Security: Body size limit ───
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const body = await req.json();
    const { reportId, email } = body;

    // ─── Security: Verify Turnstile token (bot protection) ───
    const { verifyTurnstileToken } = await import("@/lib/security/turnstile");
    const turnstileResult = await verifyTurnstileToken(
      body.turnstileToken,
      req.headers.get("x-forwarded-for") || undefined
    );
    if (!turnstileResult.success) {
      logger.warn("[Save-Exit] Turnstile verification failed", { errorCodes: turnstileResult["error-codes"] });
      return NextResponse.json(
        { error: "Security verification failed. Please refresh and try again." },
        { status: 403 }
      );
    }

    const { isValidUUID, sanitizeString } = await import("@/lib/security/inputValidation");
    if (!isValidUUID(reportId)) {
      return NextResponse.json(
        { error: "Missing session. Refresh the page and try again." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Enhanced email validation (disposable domain + MX check)
    const { validateEmail } = await import("@/lib/security/emailValidation");
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.friendlyMessage, reason: emailCheck.reason },
        { status: 422 }
      );
    }

    const normalized = email.trim().toLowerCase();
    const BASE_URL = resolveOutboundAppBaseUrl(req);
    const resumeLink = `${BASE_URL}/?resume=${encodeURIComponent(reportId)}`;
    const firstName =
      typeof body.firstName === "string" || typeof body.userName === "string"
        ? sanitizeString(body.firstName || body.userName).slice(0, 80)
        : "";
    const tier =
      typeof body.tier === "string" && body.tier.trim()
        ? sanitizeString(body.tier).slice(0, 40)
        : "snapshot";

    // Update the draft report with the user's email.
    // Draft flow persists UUID in `id`; legacy/report flows may use `report_id`.
    const supabase = getSupabase();
    if (supabase) {
      const { withRetry } = await import("@/lib/supabase/withRetry");
      const { error: idError } = await withRetry<{ error: SupabaseLikeError | null }>(
        async () =>
          await supabase
            .from("brand_snapshot_reports")
            .update({ user_email: normalized })
            .eq("id", reportId),
        "save-exit-email-by-id",
      );
      if (idError) {
        const { error: legacyError } = await withRetry<{ error: SupabaseLikeError | null }>(
          async () =>
            await supabase
              .from("brand_snapshot_reports")
              .update({ user_email: normalized })
              .eq("report_id", reportId),
          "save-exit-email-by-report-id",
        );
        if (legacyError) {
          logger.warn("[Save-Exit] Draft email association skipped", {
            reportId,
            idError: describeError(idError),
            reportIdError: describeError(legacyError),
          });
        }
      }
    }

    // Immediate Resend email + AC field sync in parallel (AC nurture still +24h).
    const { setContactFields, getOrCreateContactId } = await import("@/lib/applyActiveCampaignTags");
    let resumeEmailSent = false;

    const sendImmediateEmail = async () => {
      try {
        const { sendResumeProgressEmail } = await import("@/lib/email/resumeProgressEmail");
        const emailResult = await sendResumeProgressEmail({
          to: normalized,
          resumeUrl: resumeLink,
          firstName,
        });
        resumeEmailSent = emailResult.ok;
        if (!emailResult.ok) {
          logger.warn("[Save-Exit] Transactional resume email failed", {
            provider: emailResult.provider,
            error: emailResult.error,
          });
        }
      } catch (emailErr) {
        logger.error("[Save-Exit] Transactional resume email threw", {
          error: describeError(emailErr),
        });
      }
    };

    const syncAcFields = async () => {
      try {
        if (firstName) {
          await getOrCreateContactId(normalized, { firstName });
        }
        await setContactFields({
          email: normalized,
          fields: {
            resume_link: resumeLink,
            report_id: reportId,
            product_key: tier,
            ...(firstName ? { first_name_custom: firstName } : {}),
          },
        });
      } catch (fieldErr) {
        logger.error("[Save-Exit] AC field sync failed", { error: describeError(fieldErr) });
      }
    };

    await Promise.all([sendImmediateEmail(), syncAcFields()]);

    // Fire AC site tracking / tags so nurture Sequence 9 can still run later.
    // Email timing for AC is on ActiveCampaign (Seq 9 Email 1 is +24 hours).
    let resumeEventSent = false;
    try {
      const { applyActiveCampaignTags } = await import("@/lib/applyActiveCampaignTags");
      // Always apply both Seq 9 triggers so AC +24h nurture remains a backup if Resend fails.
      const tags = ["snapshot:paused", "snapshot:resume-link-sent"] as const;
      await applyActiveCampaignTags({
        email: normalized,
        tags: [...tags],
      });
      const eventTracked = await trackActiveCampaignSiteEvent({
        email: normalized,
        eventName: "assessment_paused",
        eventData: resumeLink,
      });
      // Legacy JSON webhook (no-op unless ACTIVE_CAMPAIGN_WEBHOOK is configured).
      const webhookSent = await fireACEvent({
        email: normalized,
        eventName: "assessment_paused",
        tags: [...tags],
        fields: {
          first_name: firstName,
          resume_link: resumeLink,
          report_id: reportId,
          product_tier: tier,
        },
      });
      resumeEventSent = eventTracked || webhookSent;
      if (!resumeEventSent) {
        logger.warn("[Save-Exit] ActiveCampaign webhook did not accept event (missing env, non-2xx, or network)", {
          event: "assessment_paused",
          hasWebhookUrl: Boolean(
            process.env.ACTIVECAMPAIGN_WEBHOOK_URL || process.env.ACTIVE_CAMPAIGN_WEBHOOK,
          ),
        });
      }
    } catch (acErr) {
      logger.error("[Save-Exit] AC event failed", { error: describeError(acErr) });
    }

    return NextResponse.json({
      success: true,
      resumeUrl: resumeLink,
      /** Prefer resumeEmailSent on the client for copy; this is email OR AC for backward compat. */
      resumeEventSent: resumeEmailSent || resumeEventSent,
      resumeEmailSent,
    });
  } catch (err) {
    logger.error("[Save-Exit API] Error", { error: describeError(err) });
    return NextResponse.json(
      { error: "Failed to save progress." },
      { status: 500 }
    );
  }
}
