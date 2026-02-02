import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  applyActiveCampaignTags,
  removeActiveCampaignTags,
} from "@/lib/applyActiveCampaignTags";

// ❗ Stripe requires raw body for signature verification
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

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

        /**
         * 🔐 PRODUCT UNLOCK LOGIC
         * These metadata keys come from the Stripe product / price
         */
        const productTier =
          metadata.product_tier || metadata.product_key || metadata.product || "";
        const snapshotId = metadata.snapshot_id;

        if (!customerEmail || !productTier) {
          console.warn("⚠️ Missing email or product tier");
          break;
        }

        /**
         * TODO: Replace these with your real services
         */
        await unlockProductAccess({
          email: customerEmail,
          productTier,
          snapshotId,
        });

        await triggerActiveCampaign({
          email: customerEmail,
          productTier,
          snapshotId,
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

/* -------------------------------------------------------------------------- */
/*                            PLACEHOLDER SERVICES                              */
/* -------------------------------------------------------------------------- */

async function unlockProductAccess({
  email,
  productTier,
  snapshotId,
}: {
  email: string;
  productTier: string;
  snapshotId?: string;
}) {
  /**
   * Example:
   * - Update user record
   * - Unlock dashboard features
   * - Attach Blueprint / Snapshot+ permissions
   */
  console.log("🔓 Unlocking product", { email, productTier, snapshotId });
}

async function triggerActiveCampaign({
  email,
  productTier,
  snapshotId,
}: {
  email: string;
  productTier: string;
  snapshotId?: string;
}) {
  /**
   * Example:
   * - Apply AC tags
   * - Trigger upgrade automations
   */
  const normalizedTier = String(productTier).toLowerCase();
  if (normalizedTier.includes("snapshot")) {
    await applyActiveCampaignTags({
      email,
      tags: ["purchased:snapshot-plus"],
    });

    await removeActiveCampaignTags({
      email,
      tags: ["intent:upgrade-snapshot-plus"],
    });

    return;
  }

  console.log("📨 Triggering ActiveCampaign", {
    email,
    productTier,
    snapshotId,
  });
}
