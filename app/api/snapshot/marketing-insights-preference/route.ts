// POST /api/snapshot/marketing-insights-preference
// After the user has saved/verified email: record granular content opt-in for ActiveCampaign.
// Does not replace lead-email row creation — requires user_email already on the report.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  applyActiveCampaignTags,
  removeActiveCampaignTags,
  setContactFields,
} from "@/lib/applyActiveCampaignTags";
import { createCrmSyncLog } from "@/lib/crm/inbound";
import { parseSnapshotContentOptIn } from "@/lib/snapshot/snapshotContentOptIn";

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
  const guard = apiGuard(req, { routeId: "snapshot-marketing-insights-preference", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const body = await req.json();
    const { reportId, email: rawEmail, turnstileToken } = body as {
      reportId?: string;
      email?: string;
      turnstileToken?: string;
      contentOptIn?: string;
    };
    const contentOptIn = parseSnapshotContentOptIn(body.contentOptIn);

    const { verifyTurnstileToken } = await import("@/lib/security/turnstile");
    const turnstileResult = await verifyTurnstileToken(
      turnstileToken,
      req.headers.get("x-forwarded-for") || undefined,
    );
    if (!turnstileResult.success) {
      logger.warn("[Marketing insights preference] Turnstile failed", {
        errorCodes: turnstileResult["error-codes"],
      });
      return NextResponse.json(
        { error: "Security verification failed. Please refresh and try again." },
        { status: 403 },
      );
    }

    if (!reportId || typeof reportId !== "string" || !rawEmail || !String(rawEmail).includes("@")) {
      return NextResponse.json({ error: "Report and a valid email are required." }, { status: 400 });
    }
    if (!contentOptIn) {
      return NextResponse.json({ error: "A valid content preference is required." }, { status: 400 });
    }

    const { validateEmail } = await import("@/lib/security/emailValidation");
    const emailCheck = await validateEmail(rawEmail);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.friendlyMessage, reason: emailCheck.reason },
        { status: 422 },
      );
    }

    const normalized = rawEmail.trim().toLowerCase();
    const supabase = supabaseAdmin;
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    let row: { user_email?: string | null } | null = null;
    const byReportId = await supabase
      .from("brand_snapshot_reports")
      .select("user_email")
      .eq("report_id", reportId)
      .maybeSingle();
    if (!byReportId.error && byReportId.data) {
      row = byReportId.data;
    } else {
      const byId = await supabase
        .from("brand_snapshot_reports")
        .select("user_email")
        .eq("id", reportId)
        .maybeSingle();
      if (!byId.error && byId.data) row = byId.data;
    }

    if (!row) {
      logger.warn("[Marketing insights preference] Report lookup failed", { reportId });
      return NextResponse.json({ error: "Could not find this diagnostic." }, { status: 404 });
    }

    const storedEmail = typeof row.user_email === "string" ? row.user_email.trim().toLowerCase() : "";
    if (!storedEmail || storedEmail !== normalized) {
      return NextResponse.json(
        { error: "Email does not match this diagnostic. Use the same address you just saved." },
        { status: 403 },
      );
    }

    const hasAcApi =
      Boolean(process.env.ACTIVE_CAMPAIGN_API_URL) && Boolean(process.env.ACTIVE_CAMPAIGN_API_KEY);

    if (contentOptIn === "no_thanks") {
      if (hasAcApi) {
        try {
          await removeActiveCampaignTags({
            email: normalized,
            tags: ["email:marketing-opted-in"],
          });
          await applyActiveCampaignTags({
            email: normalized,
            tags: ["email:marketing-opted-out"],
          });
          await setContactFields({
            email: normalized,
            fields: {
              email_marketing_opted_in: "false",
              email_marketing_optin_source: "diagnostic_post_email",
              content_opt_in_choice: "no_thanks",
            },
          });
          await createCrmSyncLog({
            status: "success",
            eventType: "ac.consent.marketing_insights",
            payload: {
              email: normalized,
              report_id: reportId,
              content_opt_in: "no_thanks",
              source: "diagnostic_post_email",
            },
          });
        } catch (optErr) {
          logger.warn("[Marketing insights preference] AC opt-out sync failed", {
            error: optErr instanceof Error ? optErr.message : String(optErr),
          });
        }
      }
      return NextResponse.json({ success: true, contentOptIn: "no_thanks" });
    }

    if (hasAcApi) {
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
            email_marketing_optin_source: "diagnostic_post_email",
            content_opt_in_choice: contentOptIn,
          },
        });

        if (contentOptIn === "marketing_trends" || contentOptIn === "both") {
          await applyActiveCampaignTags({ email: normalized, tags: ["email:content-opt-marketing-trends"] });
        }
        if (contentOptIn === "ai_updates" || contentOptIn === "both") {
          await applyActiveCampaignTags({ email: normalized, tags: ["email:content-opt-ai-updates"] });
        }

        await createCrmSyncLog({
          status: "success",
          eventType: "ac.consent.marketing_insights",
          payload: {
            email: normalized,
            report_id: reportId,
            content_opt_in: contentOptIn,
            source: "diagnostic_post_email",
          },
        });
      } catch (optErr) {
        await createCrmSyncLog({
          status: "failed",
          eventType: "ac.consent.marketing_insights",
          errorMessage: optErr instanceof Error ? optErr.message : String(optErr),
          payload: { email: normalized, report_id: reportId },
        });
        logger.warn("[Marketing insights preference] AC opt-in sync failed", {
          error: optErr instanceof Error ? optErr.message : String(optErr),
        });
      }
    }

    return NextResponse.json({ success: true, contentOptIn });
  } catch (err) {
    logger.error("[Marketing insights preference API]", { error: describeError(err) });
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
