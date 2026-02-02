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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

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
  } catch (err: any) {
    console.error("❌ Stripe webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
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
        });

        break;
      }

      case "payment_intent.succeeded": {
        // Optional: keep for logging / reconciliation
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}

/**
 * Nurture flow:
 * - Purchase Snapshot+ → exit Snapshot+ nurture, enter Blueprint nurture (intent:upgrade-blueprint).
 * - Purchase Blueprint → exit Blueprint nurture, enter Blueprint+ nurture (intent:upgrade-blueprint-plus).
 * - Purchase Blueprint+ → exit Blueprint+ nurture, enter "other services" nurture (managed marketing, AI consulting).
 */
async function triggerActiveCampaign({
  email,
  productKey,
}: {
  email: string;
  productKey: ProductKey;
}) {
  const applyTags: string[] = [];
  const removeTags: string[] = [];

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

  if (removeTags.length) {
    await removeActiveCampaignTags({ email, tags: removeTags });
  }
  if (applyTags.length) {
    await applyActiveCampaignTags({ email, tags: applyTags });
  }
}
