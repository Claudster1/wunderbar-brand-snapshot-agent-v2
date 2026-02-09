import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  applyActiveCampaignTags,
  removeActiveCampaignTags,
} from "@/lib/applyActiveCampaignTags";
import { grantAccess } from "@/lib/grantAccess";
import { recordStripePurchase } from "@/lib/recordStripePurchase";

// ❗ Stripe requires raw body for signature verification
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type ProductKey = "snapshot_plus" | "blueprint" | "blueprint_plus";

const METADATA_PRODUCT_KEYS = ["product_key", "product_tier", "product"];

function normalizeProductKey(raw: string): ProductKey | null {
  const lower = String(raw).toLowerCase().trim();
  if (lower === "snapshot_plus" || lower.includes("snapshot")) return "snapshot_plus";
  if (lower === "blueprint_plus" || lower.includes("blueprint+")) return "blueprint_plus";
  if (lower === "blueprint") return "blueprint";
  return null;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    console.error("❌ Stripe webhook signature verification failed:", msg);
    // SECURITY: Don't leak internal error details to the client
    return new NextResponse("Webhook signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerEmail = session.customer_details?.email;
        const metadata = session.metadata || {};

        const rawProduct =
          METADATA_PRODUCT_KEYS.map((k) => metadata[k]).find(Boolean) ?? "";
        const productKey = normalizeProductKey(rawProduct);
        const snapshotId = metadata.snapshot_id as string | undefined;
        const userId = metadata.user_id as string | undefined;

        if (!customerEmail || !productKey) {
          console.warn("⚠️ Stripe webhook: missing email or product", {
            email: !!customerEmail,
            productKey: rawProduct,
          });
          break;
        }

        await recordStripePurchase({
          email: customerEmail,
          sessionId: session.id,
          productKey,
          amountTotal: session.amount_total ?? undefined,
          currency: session.currency ?? undefined,
          reportId: snapshotId,
        });

        if (userId) {
          try {
            await grantAccess(userId, productKey);
          } catch (e) {
            console.warn("⚠️ grantAccess failed (user_purchases may not exist)", e);
          }
        }

        await triggerActiveCampaign({
          email: customerEmail,
          productKey,
          reportId: snapshotId,
        });

        break;
      }

      case "payment_intent.succeeded": {
        // Optional: keep for logging / reconciliation
        break;
      }

      case "checkout.session.expired": {
        // ─── Checkout Abandonment Recovery ───
        // Fires when a Stripe Checkout session expires without completing payment.
        // Triggers an ActiveCampaign event + tag so an abandonment recovery email can be sent.
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        const abandonedEmail = expiredSession.customer_details?.email || expiredSession.customer_email;
        const abandonedMeta = expiredSession.metadata || {};
        const abandonedProduct =
          METADATA_PRODUCT_KEYS.map((k) => abandonedMeta[k]).find(Boolean) ?? "";
        const abandonedProductKey = normalizeProductKey(abandonedProduct);

        if (abandonedEmail) {
          console.log(`🛒 Checkout abandoned: ${abandonedEmail} (${abandonedProduct})`);
          try {
            const productName = abandonedProductKey
              ? PRODUCT_DISPLAY_NAMES[abandonedProductKey]
              : "Brand Snapshot Suite";

            await applyActiveCampaignTags({
              email: abandonedEmail,
              tags: [
                "checkout:abandoned",
                ...(abandonedProductKey ? [`checkout:abandoned:${abandonedProductKey}`] : []),
              ],
            });

            // Fire event for AC automation trigger
            const { fireACEvent } = await import("@/lib/fireACEvent");
            await fireACEvent({
              email: abandonedEmail,
              eventName: "checkout_abandoned",
              fields: {
                abandoned_product: productName,
                abandoned_product_key: abandonedProductKey ?? "",
              },
            });
          } catch (acErr) {
            console.error("⚠️ AC abandoned checkout tagging failed:", acErr);
          }
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    console.error("❌ Webhook processing error:", msg);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}

const PRODUCT_DISPLAY_NAMES: Record<ProductKey, string> = {
  snapshot_plus: "Brand Snapshot+™",
  blueprint: "Brand Blueprint™",
  blueprint_plus: "Brand Blueprint+™",
};

/**
 * Nurture + onboarding flow:
 *
 * Purchase → immediately:
 *   1. Tag "purchased:{product}" + next-tier intent tag
 *   2. Remove previous-tier intent tag
 *   3. Tag "onboarding:{product}" to trigger welcome/onboarding email sequence
 *   4. Fire "report_ready" event so AC can send the "your report is ready" email
 *   5. Blueprint+ only: tag "session:pending" so AC can send session reminder
 *
 * Nurture escalation:
 *   - Snapshot+  → exit Snapshot+ nurture → enter Blueprint nurture
 *   - Blueprint  → exit Blueprint nurture → enter Blueprint+ nurture
 *   - Blueprint+ → exit Blueprint+ nurture → enter "other services" (Managed Marketing, AI Consulting)
 */
async function triggerActiveCampaign({
  email,
  productKey,
  reportId,
}: {
  email: string;
  productKey: ProductKey;
  reportId?: string;
}) {
  const applyTags: string[] = [];
  const removeTags: string[] = [];

  // --- Purchase + Nurture escalation tags ---
  switch (productKey) {
    case "snapshot_plus":
      applyTags.push("purchased:snapshot-plus", "intent:upgrade-blueprint");
      removeTags.push("intent:upgrade-snapshot-plus");
      break;
    case "blueprint":
      applyTags.push("purchased:blueprint", "intent:upgrade-blueprint-plus");
      removeTags.push("intent:upgrade-blueprint");
      break;
    case "blueprint_plus":
      applyTags.push("purchased:blueprint-plus", "nurture:other-services");
      removeTags.push("intent:upgrade-blueprint-plus");
      break;
  }

  // --- Onboarding tag (triggers welcome sequence in AC) ---
  applyTags.push(`onboarding:${productKey.replace("_", "-")}`);

  // --- Blueprint+ Strategy Activation Session reminder ---
  if (productKey === "blueprint_plus") {
    applyTags.push("session:pending");
  }

  // Remove old tags first, then apply new ones
  if (removeTags.length) {
    await removeActiveCampaignTags({ email, tags: removeTags });
  }
  if (applyTags.length) {
    await applyActiveCampaignTags({ email, tags: applyTags });
  }

  // --- Fire "report_ready" event (AC automation sends email with report link) ---
  const BASE_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://app.brandsnapshot.ai";
  const reportLink = reportId
    ? `${BASE_URL}/report/${reportId}`
    : `${BASE_URL}/access`;

  const AC_WEBHOOK_URL =
    process.env.ACTIVECAMPAIGN_WEBHOOK_URL ??
    process.env.NEXT_PUBLIC_ACTIVECAMPAIGN_WEBHOOK_URL;

  if (AC_WEBHOOK_URL) {
    try {
      await fetch(AC_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "report_ready",
          email,
          tags: [`report:${productKey.replace("_", "-")}-ready`],
          fields: {
            product_name: PRODUCT_DISPLAY_NAMES[productKey],
            report_link: reportLink,
            report_id: reportId || "",
          },
        }),
      });
    } catch (err) {
      console.error("[Stripe Webhook] report_ready AC event failed:", err);
    }
  }

  // --- Slack notification for the team ---
  const slackWebhook = process.env.SLACK_SALES_WEBHOOK_URL;
  if (slackWebhook) {
    try {
      await fetch(slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `:tada: *New Purchase* — ${PRODUCT_DISPLAY_NAMES[productKey]}`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `🎉 New Purchase: ${PRODUCT_DISPLAY_NAMES[productKey]}`,
              },
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Customer:*\n${email}` },
                {
                  type: "mrkdwn",
                  text: `*Product:*\n${PRODUCT_DISPLAY_NAMES[productKey]}`,
                },
              ],
            },
            ...(productKey === "blueprint_plus"
              ? [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: ":calendar: Strategy Activation Session included — watch for booking.",
                    },
                  },
                ]
              : []),
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `${new Date().toISOString()}`,
                },
              ],
            },
          ],
        }),
      });
    } catch {
      // Non-critical — don't fail the webhook
    }
  }
}
