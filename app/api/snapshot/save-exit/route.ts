// app/api/snapshot/save-exit/route.ts
// Stores the user's email against their draft report and triggers
// an ActiveCampaign event to send them a resume link.

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
    const resumeLink = `${BASE_URL}/?resume=${reportId}`;

    // Update the draft report with the user's email.
    // Draft flow persists UUID in `id`; legacy/report flows may use `report_id`.
    const supabase = getSupabase();
    if (supabase && reportId) {
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

    // Set contact fields for personalized resume email
    const { setContactFields, getOrCreateContactId } = await import("@/lib/applyActiveCampaignTags");
    const firstName = body.firstName || body.userName || "";
    const tier = body.tier || "snapshot";

    try {
      if (firstName) {
        await getOrCreateContactId(normalized, { firstName });
      }
      await setContactFields({
        email: normalized,
        fields: {
          resume_link: resumeLink,
          report_id: reportId || "",
          product_key: tier,
          ...(firstName ? { first_name_custom: firstName } : {}),
        },
      });
    } catch (fieldErr) {
      logger.error("[Save-Exit] AC field sync failed", { error: describeError(fieldErr) });
    }

    // Immediate transactional resume email (Resend) — users expect this within minutes.
    // ActiveCampaign Sequence 9 still handles nurture follow-ups (+24h / +4d / +10d).
    let resumeEmailSent = false;
    try {
      const { sendResumeProgressEmail } = await import("@/lib/email/resumeProgressEmail");
      const emailResult = await sendResumeProgressEmail({
        to: normalized,
        resumeUrl: resumeLink,
        firstName: typeof firstName === "string" ? firstName : "",
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

    // Fire AC site tracking / tags so nurture Sequence 9 can still run later.
    // Email timing for AC is on ActiveCampaign (Seq 9 Email 1 is +24 hours).
    let resumeEventSent = false;
    try {
      // Apply the trigger tags via the Contacts API and record the event via Event
      // Tracking so the resume automation fires without the legacy ACTIVE_CAMPAIGN_WEBHOOK.
      const { applyActiveCampaignTags } = await import("@/lib/applyActiveCampaignTags");
      await applyActiveCampaignTags({
        email: normalized,
        tags: ["snapshot:paused", "snapshot:resume-link-sent"],
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
        tags: ["snapshot:paused", "snapshot:resume-link-sent"],
        fields: {
          first_name: firstName,
          resume_link: resumeLink,
          report_id: reportId || "",
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
      /** True when the immediate Resend email OR the AC event queue succeeded. */
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
