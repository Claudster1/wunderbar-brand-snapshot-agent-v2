// app/api/support/route.ts
// Receives support requests collected by Wundy and stores them in Supabase.
// Sends a notification email to support@wunderbardigital.com.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPPORT_EMAIL = "support@wunderbardigital.com";

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export type SupportRequest = {
  emailUsedForPurchase: string;
  companyName: string;
  productName:
    | "Brand Snapshot"
    | "Brand Snapshot+"
    | "Brand Blueprint"
    | "Brand Blueprint+";
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

    const supabase = getSupabase();

    // Store in Supabase
    if (supabase) {
      const { error: dbError } = await supabase
        .from("support_requests")
        .insert({
          email: emailUsedForPurchase,
          company_name: companyName,
          product_name: productName,
          issue_category: issueCategory,
          issue_description: issueDescription || null,
          purchase_timing: purchaseTiming || null,
          error_message: errorMessage || null,
          user_notes: userNotes || null,
          user_id: userId || null,
          stripe_session_id: stripeSessionId || null,
          ac_contact_id: acContactId || null,
          status: "new",
          source: "wundy_chat",
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error("[Support API] Supabase insert error:", dbError.message);
        // Don't fail the request — we still want to try email notification
      }
    } else {
      console.warn("[Support API] Supabase not configured — skipping DB storage.");
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
              support_customer_email: emailUsedForPurchase,
              support_company_name: companyName,
              support_product: productName,
              support_category: issueCategory,
              support_description: issueDescription || "No description provided",
              support_source: "wundy_chat",
            },
            tags: [
              "support:new_request",
              `support:${issueCategory}`,
            ],
          }),
        });
      } catch (emailErr) {
        console.error("[Support API] Email notification failed:", emailErr);
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
                  { type: "mrkdwn", text: `*Customer:*\n${companyName}` },
                  { type: "mrkdwn", text: `*Email:*\n${emailUsedForPurchase}` },
                  { type: "mrkdwn", text: `*Product:*\n${productName}` },
                  { type: "mrkdwn", text: `*Category:*\n${issueCategory}` },
                ],
              },
              ...(issueDescription
                ? [
                    {
                      type: "section",
                      text: {
                        type: "mrkdwn",
                        text: `*Description:*\n${issueDescription}`,
                      },
                    },
                  ]
                : []),
              ...(errorMessage
                ? [
                    {
                      type: "section",
                      text: {
                        type: "mrkdwn",
                        text: `*Error:*\n\`${errorMessage}\``,
                      },
                    },
                  ]
                : []),
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: `Source: Wundy Chat | ${new Date().toISOString()}${userId ? ` | User: ${userId}` : ""}${stripeSessionId ? ` | Stripe: ${stripeSessionId}` : ""}`,
                  },
                ],
              },
            ],
          }),
        });
      } catch (slackErr) {
        console.error("[Support API] Slack notification failed:", slackErr);
      }
    }

    // Log without PII — email and company name redacted for security
    console.log(
      `[Support Request] ${issueCategory.toUpperCase()} | ${productName} | ${emailUsedForPurchase ? "email-provided" : "no-email"}`
    );

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Support API] Error:", message);
    return NextResponse.json(
      { error: "Failed to submit support request." },
      { status: 500 }
    );
  }
}
