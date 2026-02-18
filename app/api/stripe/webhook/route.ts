import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  applyActiveCampaignTags,
  removeActiveCampaignTags,
  setContactFields,
  getOrCreateContactId,
} from "@/lib/applyActiveCampaignTags";
import { grantAccess } from "@/lib/grantAccess";
import { recordStripePurchase } from "@/lib/recordStripePurchase";
import { createRefreshEntitlement } from "@/lib/refreshEntitlements";
import { logger } from "@/lib/logger";

// ❗ Stripe requires raw body for signature verification
export const runtime = "nodejs";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

type ProductKey = "snapshot_plus" | "blueprint" | "blueprint_plus" | "snapshot_plus_refresh" | "blueprint_refresh";

const METADATA_PRODUCT_KEYS = ["product_key", "product_tier", "product"];

function normalizeProductKey(raw: string): ProductKey | null {
  const lower = String(raw).toLowerCase().trim();
  // Check refresh products first (more specific match)
  if (lower === "snapshot_plus_refresh") return "snapshot_plus_refresh";
  if (lower === "blueprint_refresh") return "blueprint_refresh";
  // Then standard tiers
  if (lower === "snapshot_plus" || lower.includes("snapshot")) return "snapshot_plus";
  if (lower === "blueprint_plus" || lower.includes("blueprint+")) return "blueprint_plus";
  if (lower === "blueprint") return "blueprint";
  return null;
}

/** Map refresh products to their parent tier for access checks */
function getParentTier(key: ProductKey): "snapshot_plus" | "blueprint" | "blueprint_plus" {
  if (key === "snapshot_plus_refresh") return "snapshot_plus";
  if (key === "blueprint_refresh") return "blueprint";
  return key as "snapshot_plus" | "blueprint" | "blueprint_plus";
}

function isRefreshProduct(key: ProductKey): boolean {
  return key === "snapshot_plus_refresh" || key === "blueprint_refresh";
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();

    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    logger.error("[Stripe Webhook] Signature verification failed", { error: msg });
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
          logger.warn("[Stripe Webhook] Missing email or product", {
            hasEmail: !!customerEmail,
            rawProduct,
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

        // For refresh products, grant access at the parent tier level
        const accessTier = getParentTier(productKey);

        if (userId) {
          try {
            await grantAccess(userId, accessTier);
          } catch (e) {
            logger.warn("[Stripe Webhook] grantAccess failed", { error: e instanceof Error ? e.message : String(e) });
          }
        }

        // ─── Create refresh entitlement (brand-locked, time-limited) ───
        // Only for full-tier purchases (not refresh purchases themselves)
        if (!isRefreshProduct(productKey)) {
          try {
            const { supabaseServer: supabaseSrv } = await import("@/lib/supabase");
            const sb = supabaseSrv();
            // Look up the brand name from the most recent report
            const { data: reportRow } = await (sb
              .from("brand_snapshot_reports" as any)
              .select("brand_name")
              .eq("user_email", customerEmail.toLowerCase())
              .order("created_at", { ascending: false })
              .limit(1) as any);
            const brandName = reportRow?.[0]?.brand_name || metadata.brand_name || "Unknown";

            await createRefreshEntitlement({
              email: customerEmail,
              productTier: productKey as "snapshot_plus" | "blueprint" | "blueprint_plus",
              brandName,
              purchaseId: undefined, // filled by recordStripePurchase separately
            });
            logger.info("[Stripe Webhook] Refresh entitlement created", {
              email: customerEmail,
              tier: productKey,
              brandName,
            });
          } catch (entErr) {
            logger.error("[Stripe Webhook] Failed to create refresh entitlement", {
              error: entErr instanceof Error ? entErr.message : String(entErr),
            });
          }
        }

        // Extract customer name for AC personalization
        const customerName = session.customer_details?.name?.split(" ")[0] || "";

        if (isRefreshProduct(productKey)) {
          await triggerRefreshActiveCampaign({
            email: customerEmail,
            productKey,
            reportId: snapshotId,
            customerName,
          });
        } else {
          await triggerActiveCampaign({
            email: customerEmail,
            productKey: productKey as "snapshot_plus" | "blueprint" | "blueprint_plus",
            reportId: snapshotId,
            customerName,
            amountPaid: session.amount_total ?? undefined,
          });
        }

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
          logger.info("[Stripe Webhook] Checkout abandoned", { product: abandonedProduct });
          try {
            const productName = abandonedProductKey
              ? PRODUCT_DISPLAY_NAMES[abandonedProductKey]
              : "WunderBrand Suite™";
            const abandonedName = expiredSession.customer_details?.name?.split(" ")[0] || "";

            // Product page URLs for recovery emails
            const PRODUCT_URLS: Record<string, string> = {
              snapshot_plus: "https://wunderbardigital.com/wunderbrand-snapshot-plus",
              blueprint: "https://wunderbardigital.com/wunderbrand-blueprint",
              blueprint_plus: "https://wunderbardigital.com/wunderbrand-blueprint-plus",
            };
            const PRODUCT_PRICES: Record<string, string> = {
              snapshot_plus: "$497",
              blueprint: "$997",
              blueprint_plus: "$1,997",
            };

            await applyActiveCampaignTags({
              email: abandonedEmail,
              tags: [
                "checkout:abandoned",
                ...(abandonedProductKey ? [`checkout:abandoned:${abandonedProductKey}`] : []),
              ],
            });

            // Set contact fields for recovery email personalization
            const abandonedFields: Record<string, string> = {
              abandoned_product: productName,
              abandoned_product_key: abandonedProductKey ?? "",
              abandoned_product_url: abandonedProductKey ? (PRODUCT_URLS[abandonedProductKey] || "") : "",
              abandoned_product_price: abandonedProductKey ? (PRODUCT_PRICES[abandonedProductKey] || "") : "",
              abandoned_date: new Date().toISOString().split("T")[0],
            };
            if (abandonedName) abandonedFields.first_name_custom = abandonedName;

            await setContactFields({ email: abandonedEmail, fields: abandonedFields });
            if (abandonedName) {
              await getOrCreateContactId(abandonedEmail, { firstName: abandonedName });
            }

            // Fire event for AC automation trigger
            const { fireACEvent } = await import("@/lib/fireACEvent");
            await fireACEvent({
              email: abandonedEmail,
              eventName: "checkout_abandoned",
              fields: {
                first_name: abandonedName,
                abandoned_product: productName,
                abandoned_product_key: abandonedProductKey ?? "",
                abandoned_product_url: abandonedProductKey ? (PRODUCT_URLS[abandonedProductKey] || "") : "",
                abandoned_product_price: abandonedProductKey ? (PRODUCT_PRICES[abandonedProductKey] || "") : "",
              },
            });
          } catch (acErr) {
            logger.error("[Stripe Webhook] AC abandoned checkout tagging failed", { error: acErr instanceof Error ? acErr.message : String(acErr) });
          }
        }
        break;
      }

      default:
        logger.debug("[Stripe Webhook] Unhandled event type", { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    logger.error("[Stripe Webhook] Processing error", { error: msg });
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}

const PRODUCT_DISPLAY_NAMES: Record<ProductKey, string> = {
  snapshot_plus: "WunderBrand Snapshot+™",
  blueprint: "WunderBrand Blueprint™",
  blueprint_plus: "WunderBrand Blueprint+™",
  snapshot_plus_refresh: "WunderBrand Snapshot+™ Quarterly Refresh",
  blueprint_refresh: "WunderBrand Blueprint™ Quarterly Refresh",
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
  customerName,
  amountPaid,
}: {
  email: string;
  productKey: ProductKey;
  reportId?: string;
  customerName?: string;
  amountPaid?: number;
}) {
  const applyTags: string[] = [];
  const removeTags: string[] = [];

  // --- Purchase + Nurture escalation tags ---
  // Determine upgrade path: what product should they upgrade to next?
  let upgradeProductName = "";
  let upgradeProductUrl = "";
  let upgradePrice = "";

  switch (productKey) {
    case "snapshot_plus":
      applyTags.push("purchased:snapshot-plus", "intent:upgrade-blueprint");
      removeTags.push("intent:upgrade-snapshot-plus");
      upgradeProductName = "WunderBrand Blueprint™";
      upgradeProductUrl = "https://wunderbardigital.com/wunderbrand-blueprint";
      upgradePrice = "$997";
      break;
    case "blueprint":
      applyTags.push("purchased:blueprint", "intent:upgrade-blueprint-plus");
      removeTags.push("intent:upgrade-blueprint");
      upgradeProductName = "WunderBrand Blueprint+™";
      upgradeProductUrl = "https://wunderbardigital.com/wunderbrand-blueprint-plus";
      upgradePrice = "$1,997";
      break;
    case "blueprint_plus":
      applyTags.push("purchased:blueprint-plus", "nurture:other-services");
      removeTags.push("intent:upgrade-blueprint-plus");
      upgradeProductName = "Managed Marketing";
      upgradeProductUrl = "https://wunderbardigital.com/talk-to-an-expert";
      upgradePrice = "custom";
      break;
  }

  // --- Onboarding tag (triggers welcome sequence in AC) ---
  applyTags.push(`onboarding:${productKey.replace("_", "-")}`);

  // --- Blueprint+ Strategy Activation Session reminder ---
  if (productKey === "blueprint_plus") {
    applyTags.push("session:pending");
  }

  // --- Quarterly Refresh eligibility tag (AC uses this to trigger 90-day reminder) ---
  applyTags.push("refresh:eligible");

  // Remove old tags first, then apply new ones
  if (removeTags.length) {
    await removeActiveCampaignTags({ email, tags: removeTags });
  }
  if (applyTags.length) {
    await applyActiveCampaignTags({ email, tags: applyTags });
  }

  // --- Set custom fields on the contact for email personalization ---
  const BASE_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://app.wunderbrand.ai";
  const reportLink = reportId
    ? `${BASE_URL}/report/${reportId}`
    : `${BASE_URL}/access`;
  const npsTier = productKey;
  const npsLink = `${BASE_URL}/nps?tier=${npsTier}&reportId=${encodeURIComponent(reportId || "")}&email=${encodeURIComponent(email)}`;

  const contactFields: Record<string, string> = {
    product_purchased: PRODUCT_DISPLAY_NAMES[productKey],
    product_key: productKey,
    report_link: reportLink,
    report_id: reportId || "",
    dashboard_link: `${BASE_URL}/dashboard`,
    nps_survey_link: npsLink,
    purchase_date: new Date().toISOString().split("T")[0],
    refresh_price: productKey === "blueprint_plus" ? "free" : productKey === "blueprint" ? "$97" : "$47",
    refresh_type: productKey === "blueprint_plus" ? "free" : "paid",
    refresh_window_end: productKey === "blueprint_plus"
      ? new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0]
      : productKey === "blueprint"
        ? new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]
        : "",
    refresh_brand_name: "", // populated after entitlement creation
    upgrade_product_name: upgradeProductName,
    upgrade_product_url: upgradeProductUrl,
    upgrade_price: upgradePrice,
    services_url: "https://wunderbardigital.com/talk-to-an-expert",
  };
  if (customerName) contactFields.first_name_custom = customerName;
  if (amountPaid) contactFields.amount_paid = `$${(amountPaid / 100).toFixed(0)}`;

  try {
    // Sync first name on the contact record itself
    if (customerName) {
      await getOrCreateContactId(email, { firstName: customerName });
    }
    await setContactFields({ email, fields: contactFields });
  } catch (err) {
    logger.error("[Stripe Webhook] AC field sync failed", { error: err instanceof Error ? err.message : String(err) });
  }

  // --- Fire "report_ready" event (AC automation sends email with report link) ---
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
            first_name: customerName || "",
            product_name: PRODUCT_DISPLAY_NAMES[productKey],
            product_key: productKey,
            report_link: reportLink,
            report_id: reportId || "",
            nps_survey_link: npsLink,
            nps_tier: npsTier,
            purchase_date: new Date().toISOString().split("T")[0],
            amount_paid: amountPaid ? `$${(amountPaid / 100).toFixed(0)}` : "",
            refresh_price: productKey === "blueprint_plus" ? "free" : productKey === "blueprint" ? "$97" : "$47",
            refresh_type: productKey === "blueprint_plus" ? "free" : "paid",
            dashboard_link: `${BASE_URL}/dashboard`,
            upgrade_product_name: upgradeProductName,
            upgrade_product_url: upgradeProductUrl,
            upgrade_price: upgradePrice,
            services_url: "https://wunderbardigital.com/talk-to-an-expert",
          },
        }),
      });
    } catch (err) {
      logger.error("[Stripe Webhook] report_ready AC event failed", { error: err instanceof Error ? err.message : String(err) });
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

/**
 * Simplified AC tagging for quarterly refresh purchases.
 * Tags the customer so AC can trigger a "your updated report is ready" email.
 */
async function triggerRefreshActiveCampaign({
  email,
  productKey,
  reportId,
  customerName,
}: {
  email: string;
  productKey: ProductKey;
  reportId?: string;
  customerName?: string;
}) {
  const parentTier = getParentTier(productKey);

  await applyActiveCampaignTags({
    email,
    tags: [
      `purchased:${productKey.replace(/_/g, "-")}`,
      `refresh:${parentTier.replace(/_/g, "-")}-ready`,
    ],
  });

  const BASE_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://app.wunderbrand.ai";
  const reportLink = reportId
    ? `${BASE_URL}/report/${reportId}`
    : `${BASE_URL}/access`;

  // Sync contact fields
  try {
    if (customerName) {
      await getOrCreateContactId(email, { firstName: customerName });
    }
    await setContactFields({
      email,
      fields: {
        product_purchased: PRODUCT_DISPLAY_NAMES[productKey],
        product_key: productKey,
        report_link: reportLink,
        report_id: reportId || "",
        dashboard_link: `${BASE_URL}/dashboard`,
        purchase_date: new Date().toISOString().split("T")[0],
      },
    });
  } catch (err) {
    logger.error("[Stripe Webhook] refresh AC field sync failed", { error: err instanceof Error ? err.message : String(err) });
  }

  // Fire refresh-specific event for AC automation
  const AC_WEBHOOK_URL =
    process.env.ACTIVECAMPAIGN_WEBHOOK_URL ??
    process.env.NEXT_PUBLIC_ACTIVECAMPAIGN_WEBHOOK_URL;

  if (AC_WEBHOOK_URL) {
    try {
      await fetch(AC_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "refresh_report_ready",
          email,
          tags: [`refresh:${parentTier.replace(/_/g, "-")}-ready`],
          fields: {
            first_name: customerName || "",
            product_name: PRODUCT_DISPLAY_NAMES[productKey],
            parent_tier: PRODUCT_DISPLAY_NAMES[parentTier],
            report_link: reportLink,
            report_id: reportId || "",
            dashboard_link: `${BASE_URL}/dashboard`,
          },
        }),
      });
    } catch (err) {
      logger.error("[Stripe Webhook] refresh AC event failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
