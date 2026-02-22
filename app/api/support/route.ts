// app/api/support/route.ts
// Receives support requests collected by Wundy™ and stores them in Supabase.
// Sends a notification email to support@wunderbardigital.com.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";

const SUPPORT_EMAIL = "support@wunderbardigital.com";

function getSupabase() {
  return supabaseAdmin;
}

export type SupportRequest = {
  emailUsedForPurchase: string;
  companyName: string;
  productName:
    | "WunderBrand Snapshot™"
    | "WunderBrand Snapshot+™"
    | "WunderBrand Blueprint™"
    | "WunderBrand Blueprint+™";
  issueCategory: "access" | "download" | "payment" | "account";
  issueDescription?: string;
  purchaseTiming?: "today" | "yesterday" | "earlier";
  errorMessage?: string;
  userNotes?: string;
  userId?: string;
  stripeSessionId?: string;
  acContactId?: string;
};

export async function POST(req: Request) {
  // ─── Security: Rate limit ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "support", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body: SupportRequest = await req.json();

    const {
      emailUsedForPurchase,
      companyName,
      productName,
      issueCategory,
      issueDescription,
      purchaseTiming,
      errorMessage,
      userNotes,
      userId,
      stripeSessionId,
      acContactId,
    } = body;

    // Validate required fields
    if (!emailUsedForPurchase || !companyName || !productName || !issueCategory) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { sanitizeString, isValidEmail } = await import("@/lib/security/inputValidation");
    if (!isValidEmail(emailUsedForPurchase)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }
    const sanitizedEmail = sanitizeString(emailUsedForPurchase);
    const sanitizedCompanyName = sanitizeString(companyName);
    const sanitizedIssueDescription = issueDescription != null ? sanitizeString(issueDescription) : null;
    const sanitizedErrorMessage = errorMessage != null ? sanitizeString(errorMessage) : null;
    const sanitizedUserNotes = userNotes != null ? sanitizeString(userNotes) : null;

    const supabase = getSupabase();

    // Store in Supabase
    if (supabase) {
      const { error: dbError } = await supabase
        .from("support_requests")
        .insert({
          email: sanitizedEmail,
          company_name: sanitizedCompanyName,
          product_name: productName,
          issue_category: issueCategory,
          issue_description: sanitizedIssueDescription,
          purchase_timing: purchaseTiming || null,
          error_message: sanitizedErrorMessage,
          user_notes: sanitizedUserNotes,
          user_id: userId || null,
          stripe_session_id: stripeSessionId || null,
          ac_contact_id: acContactId || null,
          status: "new",
          source: "wundy_chat",
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        logger.error("[Support API] Supabase insert error", { error: dbError.message });
        // Don't fail the request — we still want to try email notification
      }
    } else {
      logger.warn("[Support API] Supabase not configured — skipping DB storage.");
    }

    // Send email notification via ActiveCampaign webhook (if available)
    // or log for manual monitoring
    const acWebhookUrl =
      process.env.ACTIVECAMPAIGN_SUPPORT_WEBHOOK_URL ||
      process.env.ACTIVECAMPAIGN_WEBHOOK_URL;

    if (acWebhookUrl) {
      try {
        await fetch(acWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: SUPPORT_EMAIL,
            fields: {
              support_customer_email: sanitizedEmail,
              support_company_name: sanitizedCompanyName,
              support_product: productName,
              support_category: issueCategory,
              support_description: sanitizedIssueDescription || "No description provided",
              support_source: "wundy_chat",
            },
            tags: [
              "support:new_request",
              `support:${issueCategory}`,
            ],
          }),
        });
      } catch (emailErr) {
        logger.error("[Support API] Email notification failed", { error: emailErr instanceof Error ? emailErr.message : String(emailErr) });
      }
    }

    // Send Slack notification (if webhook configured)
    const slackWebhook = process.env.SLACK_SUPPORT_WEBHOOK_URL;
    if (slackWebhook) {
      try {
        const urgencyEmoji =
          issueCategory === "payment"
            ? ":rotating_light:"
            : issueCategory === "access"
            ? ":key:"
            : ":ticket:";

        await fetch(slackWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `${urgencyEmoji} *New Support Request*`,
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: `${issueCategory === "payment" ? "🚨" : "🎫"} Support: ${issueCategory.toUpperCase()}`,
                },
              },
              {
                type: "section",
                fields: [
                  { type: "mrkdwn", text: `*Customer:*\n${sanitizedCompanyName}` },
                  { type: "mrkdwn", text: `*Email:*\n${sanitizedEmail}` },
                  { type: "mrkdwn", text: `*Product:*\n${productName}` },
                  { type: "mrkdwn", text: `*Category:*\n${issueCategory}` },
                ],
              },
              ...(sanitizedIssueDescription
                ? [
                    {
                      type: "section",
                      text: {
                        type: "mrkdwn",
                        text: `*Description:*\n${sanitizedIssueDescription}`,
                      },
                    },
                  ]
                : []),
              ...(sanitizedErrorMessage
                ? [
                    {
                      type: "section",
                      text: {
                        type: "mrkdwn",
                        text: `*Error:*\n\`${sanitizedErrorMessage}\``,
                      },
                    },
                  ]
                : []),
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: `Source: Wundy™ Chat | ${new Date().toISOString()}${userId ? ` | User: ${userId}` : ""}${stripeSessionId ? ` | Stripe: ${stripeSessionId}` : ""}`,
                  },
                ],
              },
            ],
          }),
        });
      } catch (slackErr) {
        logger.error("[Support API] Slack notification failed", { error: slackErr instanceof Error ? slackErr.message : String(slackErr) });
      }
    }

    // Log without PII — email and company name redacted for security
    logger.info("[Support Request]", {
      category: issueCategory.toUpperCase(),
      product: productName,
      emailProvided: Boolean(emailUsedForPurchase),
    });

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("[Support API] Error", { error: message });
    return NextResponse.json(
      { error: "Failed to submit support request." },
      { status: 500 }
    );
  }
}
