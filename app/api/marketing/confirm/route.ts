// app/api/marketing/confirm/route.ts
// GET endpoint for the marketing-confirmation link in welcome emails.
//
// Flow:
//   1. User clicks the link in their AC welcome email.
//   2. We verify the signed token (HMAC, 14-day TTL by default).
//   3. We flip the AC contact from `email:marketing-pending` to `email:marketing-opted-in`
//      and set `email_marketing_confirmed=true` so AC marketing automations can filter on it.
//   4. We redirect to /marketing/confirmed for a friendly thank-you page.
//
// Idempotent — confirming twice just re-applies the same tag set.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { verifyMarketingConfirmationToken } from "@/lib/marketing/confirmationToken";
import { applyActiveCampaignTags, removeActiveCampaignTags, setContactFields } from "@/lib/applyActiveCampaignTags";
import { createCrmSyncLog } from "@/lib/crm/inbound";

export const dynamic = "force-dynamic";

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

function redirectTo(path: string, status: "ok" | "invalid" | "expired" | "error") {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://app.wunderbrand.ai";
  const url = new URL(path, base);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url.toString(), { status: 302 });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return redirectTo("/marketing/confirmed", "invalid");
    }

    const payload = verifyMarketingConfirmationToken(token);
    if (!payload) {
      logger.warn("[Marketing Confirm] Invalid or expired token");
      return redirectTo("/marketing/confirmed", "expired");
    }

    const hasAcApi =
      Boolean(process.env.ACTIVE_CAMPAIGN_API_URL) && Boolean(process.env.ACTIVE_CAMPAIGN_API_KEY);

    if (!hasAcApi) {
      // No AC creds — we still want to land the user on the thank-you page so the link works
      // even in environments without AC configured (preview deploys, local).
      logger.warn("[Marketing Confirm] ActiveCampaign not configured; landing page only");
      return redirectTo("/marketing/confirmed", "ok");
    }

    try {
      await applyActiveCampaignTags({
        email: payload.email,
        tags: ["email:marketing-opted-in"],
      });
      await removeActiveCampaignTags({
        email: payload.email,
        tags: ["email:marketing-pending", "email:marketing-opted-out"],
      });
      await setContactFields({
        email: payload.email,
        fields: {
          email_marketing_confirmed: "true",
          email_marketing_confirmed_at: new Date().toISOString(),
          ...(payload.contentOptIn ? { content_opt_in_choice: payload.contentOptIn } : {}),
        },
      });
      await createCrmSyncLog({
        status: "success",
        eventType: "ac.consent.marketing_confirm",
        payload: {
          email: payload.email,
          report_id: payload.reportId,
          source: payload.source ?? "marketing_welcome_link",
          content_opt_in: payload.contentOptIn ?? null,
        },
      });
    } catch (err) {
      logger.error("[Marketing Confirm] AC sync failed", { error: describeError(err) });
      await createCrmSyncLog({
        status: "failed",
        eventType: "ac.consent.marketing_confirm",
        errorMessage: describeError(err),
        payload: { email: payload.email, report_id: payload.reportId },
      });
      // Still redirect to the thank-you page — the user did their part. We can retry the AC
      // sync in a background job if desired; failing the link click would be worse UX.
      return redirectTo("/marketing/confirmed", "error");
    }

    return redirectTo("/marketing/confirmed", "ok");
  } catch (err) {
    logger.error("[Marketing Confirm API]", { error: describeError(err) });
    return redirectTo("/marketing/confirmed", "error");
  }
}
