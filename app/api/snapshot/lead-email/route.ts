// POST /api/snapshot/lead-email
// Early funnel capture: associate email with the in-progress draft + optional marketing opt-in.
// Does not send OTP — verification still runs at completion.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fireACEvent } from "@/lib/fireACEvent";
import { applyActiveCampaignTags, removeActiveCampaignTags, setContactFields } from "@/lib/applyActiveCampaignTags";
import { createCrmSyncLog } from "@/lib/crm/inbound";

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
  const guard = apiGuard(req, { routeId: "snapshot-lead-email", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const body = await req.json();
    const { reportId, email, marketingOptIn, firstName: rawFirstName, productTier: rawTier } = body as {
      reportId?: string;
      email?: string;
      marketingOptIn?: boolean;
      firstName?: string;
      productTier?: string;
    };

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

    const byId = await supabase
      .from("brand_snapshot_reports")
      .update({ user_email: normalized, updated_at: new Date().toISOString() })
      .eq("id", reportId);

    if (byId.error) {
      const byReportId = await supabase
        .from("brand_snapshot_reports")
        .update({ user_email: normalized, updated_at: new Date().toISOString() })
        .eq("report_id", reportId);
      if (byReportId.error) {
        logger.warn("[Lead Email] Row update skipped", {
          reportId,
          idError: describeError(byId.error),
          reportIdError: describeError(byReportId.error),
        });
        return NextResponse.json({ error: "Could not link email to this session." }, { status: 404 });
      }
    }

    const BASE_URL =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://app.wunderbrand.ai";
    const resumeLink = `${BASE_URL}/?resume=${encodeURIComponent(reportId)}`;

    const { sanitizeString } = await import("@/lib/security/inputValidation");
    const firstName =
      typeof rawFirstName === "string" && rawFirstName.trim() ? sanitizeString(rawFirstName).slice(0, 80) : "";
    const productTier =
      typeof rawTier === "string" && rawTier.trim() ? sanitizeString(rawTier).slice(0, 40) : "snapshot";

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
        const { setContactFields, getOrCreateContactId, applyActiveCampaignTags } = await import(
          "@/lib/applyActiveCampaignTags"
        );
        await getOrCreateContactId(normalized, firstName ? { firstName } : undefined);
        await setContactFields({
          email: normalized,
          fields: {
            resume_link: resumeLink,
            report_id: reportId,
            product_key: productTier,
            ...(firstName ? { first_name_custom: firstName } : {}),
          },
        });
        await applyActiveCampaignTags({
          email: normalized,
          tags: ["snapshot:lead-email-captured"],
        });
      } catch (apiErr) {
        logger.warn("[Lead Email] ActiveCampaign API sync failed", { error: describeError(apiErr) });
      }
    }

    if (marketingOptIn === true) {
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
            email_marketing_optin_source: "diagnostic_lead_capture",
          },
        });
        await createCrmSyncLog({
          status: "success",
          eventType: "ac.consent.lead_email",
          payload: {
            email: normalized,
            report_id: reportId,
            email_marketing_opted_in: true,
            source: "diagnostic_lead_capture",
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

    return NextResponse.json({ success: true, email: normalized });
  } catch (err) {
    logger.error("[Lead Email API]", { error: describeError(err) });
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
