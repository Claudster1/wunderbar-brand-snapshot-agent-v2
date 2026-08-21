// POST /api/snapshot/lead-email
// Early funnel capture: associate email with the in-progress draft + optional marketing opt-in.
// Does not send OTP — verification still runs at completion.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fireACEvent, trackActiveCampaignSiteEvent } from "@/lib/fireACEvent";
import { applyActiveCampaignTags, createTag, removeActiveCampaignTags, setContactFields } from "@/lib/applyActiveCampaignTags";
import { createCrmSyncLog } from "@/lib/crm/inbound";
import { mergeResultsEmailUnlock } from "@/lib/results/resultsEmailUnlock";

function describeError(err: unknown): string {
  if (!err) return "unknown error";
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = await apiGuard(req, { routeId: "snapshot-lead-email", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const body = await req.json();
    const { reportId, email, marketingOptIn, firstName: rawFirstName, productTier: rawTier, honeypot } = body as {
      reportId?: string;
      email?: string;
      marketingOptIn?: boolean;
      firstName?: string;
      productTier?: string;
      honeypot?: string;
    };

    // Honeypot — humans never touch the hidden field, bots auto-fill it. Mirror the chat-form
    // pattern: respond 200 with a generic-looking shape so the bot has no useful signal,
    // but skip the AC sync + DB write entirely.
    if (typeof honeypot === "string" && honeypot.length > 0) {
      logger.warn("[Lead Email] Honeypot tripped — dropping submission silently");
      return NextResponse.json({ success: true, email: null });
    }

    const { verifyTurnstileToken } = await import("@/lib/security/turnstile");
    const turnstileResult = await verifyTurnstileToken(
      body.turnstileToken,
      req.headers.get("x-forwarded-for") || undefined,
    );
    if (!turnstileResult.success) {
      logger.warn("[Lead Email] Turnstile failed", { errorCodes: turnstileResult["error-codes"] });
      return NextResponse.json(
        { error: "Security verification failed. Please refresh and try again." },
        { status: 403 },
      );
    }

    if (!reportId || typeof reportId !== "string" || !email || !String(email).includes("@")) {
      return NextResponse.json({ error: "Report and a valid email are required." }, { status: 400 });
    }

    const { validateEmail } = await import("@/lib/security/emailValidation");
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.friendlyMessage, reason: emailCheck.reason },
        { status: 422 },
      );
    }

    const normalized = email.trim().toLowerCase();
    const supabase = supabaseAdmin;
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const db = supabase;
    async function loadFullReport(idColumn: "id" | "report_id"): Promise<Record<string, unknown> | null> {
      const { data } = await db
        .from("brand_snapshot_reports")
        .select("full_report")
        .eq(idColumn, reportId)
        .maybeSingle();
      const fr = (data as { full_report?: unknown } | null)?.full_report;
      return fr && typeof fr === "object" && !Array.isArray(fr) ? (fr as Record<string, unknown>) : null;
    }

    const existingFullReport =
      (await loadFullReport("report_id")) ?? (await loadFullReport("id"));

    const mergedFullReport = mergeResultsEmailUnlock(existingFullReport);
    const rowPatch = {
      user_email: normalized,
      full_report: mergedFullReport,
      updated_at: new Date().toISOString(),
    };

    // Public URLs use report_id. Supabase update with 0 matching rows returns error: null —
    // so we must `.select()` and confirm a row came back before treating the write as success.
    async function updateReportRow(): Promise<boolean> {
      const byReportId = await db
        .from("brand_snapshot_reports")
        .update(rowPatch)
        .eq("report_id", reportId)
        .select("report_id")
        .maybeSingle();
      if (!byReportId.error && byReportId.data) return true;

      const byId = await db
        .from("brand_snapshot_reports")
        .update(rowPatch)
        .eq("id", reportId)
        .select("id")
        .maybeSingle();
      if (!byId.error && byId.data) return true;

      logger.warn("[Lead Email] Row update matched zero rows", {
        reportId,
        reportIdError: describeError(byReportId.error),
        idError: describeError(byId.error),
      });
      return false;
    }

    if (!(await updateReportRow())) {
      return NextResponse.json({ error: "Could not link email to this session." }, { status: 404 });
    }

    const { resolveOutboundAppBaseUrl } = await import("@/lib/server/runtimeBaseUrl");
    const BASE_URL = resolveOutboundAppBaseUrl(req);
    const resumeLink = `${BASE_URL}/?resume=${encodeURIComponent(reportId)}`;
    const resultsUrl = `${BASE_URL}/results?reportId=${encodeURIComponent(reportId)}`;

    const { sanitizeString } = await import("@/lib/security/inputValidation");
    const firstName =
      typeof rawFirstName === "string" && rawFirstName.trim() ? sanitizeString(rawFirstName).slice(0, 80) : "";
    const productTier =
      typeof rawTier === "string" && rawTier.trim() ? sanitizeString(rawTier).slice(0, 40) : "snapshot";

    // Deliver the results to the user's inbox (transactional). THIS is the actual
    // "email me my results" delivery — previously the results page unlocked but no
    // email was ever sent, despite the UI promising delivery. Fire-and-forget so a
    // mail hiccup never blocks the capture/unlock.
    try {
      const { sendTransactionalEmail } = await import("@/lib/email/transactional");
      const { buildSnapshotReportEmail } = await import("@/lib/email/reportDeliveryEmail");
      const { withUtm } = await import("@/lib/utm");
      const productName =
        productTier === "snapshot-plus" ? "WunderBrand Snapshot+\u2122" : "WunderBrand Snapshot\u2122";
      const emailResultsUrl = withUtm(resultsUrl, {
        source: "wunderbrand_app",
        medium: "email",
        campaign: "results_delivery",
      });
      const { subject, html, text } = buildSnapshotReportEmail({
        resultsUrl: emailResultsUrl,
        productName,
        firstName,
      });
      const sendResult = await sendTransactionalEmail({ to: normalized, subject, html, text });
      if (!sendResult.ok) {
        logger.warn("[Lead Email] Results delivery email failed", {
          error: sendResult.error,
          provider: sendResult.provider,
        });
      }
    } catch (mailErr) {
      logger.warn("[Lead Email] Results delivery email threw", { error: describeError(mailErr) });
    }

    const hasAcWebhook =
      Boolean(process.env.ACTIVE_CAMPAIGN_WEBHOOK) ||
      Boolean(process.env.ACTIVECAMPAIGN_WEBHOOK_URL);
    const hasAcApi =
      Boolean(process.env.ACTIVE_CAMPAIGN_API_URL) && Boolean(process.env.ACTIVE_CAMPAIGN_API_KEY);

    try {
      if (hasAcWebhook) {
        await fireACEvent({
          email: normalized,
          eventName: "snapshot_lead_capture",
          tags: ["snapshot:lead-email-captured"],
          fields: {
            report_id: reportId,
            resume_link: resumeLink,
            product_key: productTier,
            marketing_opt_in: marketingOptIn === true ? "true" : "false",
            ...(firstName ? { first_name: firstName } : {}),
          },
        });
      }
    } catch (acErr) {
      logger.warn("[Lead Email] AC webhook event failed", { error: describeError(acErr) });
    }

    if (hasAcApi) {
      try {
        const { setContactFields, getOrCreateContactId, applyActiveCampaignTags, addContactToList } = await import(
          "@/lib/applyActiveCampaignTags"
        );
        await createTag("snapshot:lead-email-captured").catch((err) =>
          logger.warn("[Lead Email] AC create tag snapshot:lead-email-captured failed", { error: describeError(err) }),
        );
        await getOrCreateContactId(normalized, firstName ? { firstName } : undefined);
        await setContactFields({
          email: normalized,
          fields: {
            resume_link: resumeLink,
            report_link: resultsUrl,
            report_id: reportId,
            product_key: productTier,
            ...(firstName ? { first_name_custom: firstName } : {}),
          },
        });
        await applyActiveCampaignTags({
          email: normalized,
          tags: ["snapshot:lead-email-captured"],
        });

        // Subscribe to the canonical Brand Snapshot Leads list so the contact appears in
        // AC's per-list deliverability and engagement dashboards. Marketing send eligibility
        // is still gated by the `email:marketing-opted-in` / `-opted-out` tags downstream.
        const listId = process.env.AC_LIST_BRAND_SNAPSHOT_LEADS;
        if (listId) {
          await addContactToList({ email: normalized, listId }).catch((err) =>
            logger.warn("[Lead Email] AC list subscription failed", { error: describeError(err) })
          );
        }

        // Record the event via Event Tracking so an automation can trigger on it
        // without depending on the legacy ACTIVE_CAMPAIGN_WEBHOOK.
        await trackActiveCampaignSiteEvent({
          email: normalized,
          eventName: "snapshot_lead_capture",
          eventData: reportId,
        });
      } catch (apiErr) {
        logger.warn("[Lead Email] ActiveCampaign API sync failed", { error: describeError(apiErr) });
      }
    }

    if (marketingOptIn === true) {
      try {
        // Double-opt-in: stamp intent (`email:marketing-pending`) instead of flipping the
        // marketing-eligible tag directly. AC welcome automation should be triggered by
        // `email:marketing-pending` and include `{{marketing_confirmation_link}}` as the CTA.
        // /api/marketing/confirm flips the contact to `email:marketing-opted-in` on click.
        //
        // If MARKETING_CONFIRM_SECRET isn't set yet, signMarketingConfirmationToken returns
        // null and we fall back to the legacy direct opt-in behavior so production isn't
        // broken by a missing env var.
        const { signMarketingConfirmationToken } = await import("@/lib/marketing/confirmationToken");
        const { buildMarketingConfirmationUrl } = await import("@/lib/marketing/buildConfirmationUrl");
        const confirmationToken = signMarketingConfirmationToken({
          email: normalized,
          reportId,
          source: "diagnostic_lead_capture",
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
              email_marketing_optin_source: "diagnostic_lead_capture",
              marketing_confirmation_link: confirmationLink,
            },
          });
        } else {
          // Legacy direct-opt-in path (kept until MARKETING_CONFIRM_SECRET is configured).
          // Direct opt-in == confirmed consent, so enroll into Brand Education here too.
          await applyActiveCampaignTags({
            email: normalized,
            tags: ["email:marketing-opted-in", "nurture:brand-education"],
          });
          await removeActiveCampaignTags({
            email: normalized,
            tags: ["email:marketing-opted-out"],
          });
          await setContactFields({
            email: normalized,
            fields: {
              email_marketing_opted_in: "true",
              email_marketing_optin_source: "diagnostic_lead_capture",
            },
          });
        }
        await createCrmSyncLog({
          status: "success",
          eventType: "ac.consent.lead_email",
          payload: {
            email: normalized,
            report_id: reportId,
            email_marketing_opted_in: !doubleOptInEnabled,
            email_marketing_opt_in_intent: doubleOptInEnabled,
            source: "diagnostic_lead_capture",
            double_opt_in: doubleOptInEnabled,
          },
        });
      } catch (optErr) {
        await createCrmSyncLog({
          status: "failed",
          eventType: "ac.consent.lead_email",
          errorMessage: optErr instanceof Error ? optErr.message : String(optErr),
          payload: { email: normalized, report_id: reportId },
        });
        logger.warn("[Lead Email] Marketing opt-in sync failed", {
          error: optErr instanceof Error ? optErr.message : String(optErr),
        });
      }
    }

    // Results unlock proves inbox intent via Turnstile + email capture (and we email
    // the results link). Issue a verified session so Export / PDF works immediately —
    // otherwise setting user_email locks the PDF behind OTP the free Snapshot flow never runs.
    const response = NextResponse.json({ success: true, email: normalized });
    try {
      const {
        createSessionToken,
        sessionCookieOptions,
        VERIFIED_SESSION_COOKIE,
      } = await import("@/lib/auth/session");
      const sessionToken = createSessionToken(normalized);
      if (sessionToken) {
        response.cookies.set(VERIFIED_SESSION_COOKIE, sessionToken, sessionCookieOptions());
      }
    } catch (sessionErr) {
      logger.warn("[Lead Email] Session cookie not set", { error: describeError(sessionErr) });
    }
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (err) {
    logger.error("[Lead Email API]", { error: describeError(err) });
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
