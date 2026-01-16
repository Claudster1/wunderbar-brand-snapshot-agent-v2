// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { grantAccess } from "@/lib/grantAccess";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// IMPORTANT: Stripe needs the raw body for signature verification.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const productKey = session.metadata?.product_key;
      const userId = session.metadata?.user_id;

      if (!productKey) {
        console.warn("No product_key in session metadata");
        return NextResponse.json({ received: true });
      }

      // Grant access if userId is provided
      if (userId) {
        try {
          await grantAccess(userId, productKey as "snapshot_plus" | "blueprint" | "blueprint_plus");
        } catch (error) {
          console.error("Error granting access:", error);
          // Continue processing even if access grant fails
        }
      }

      // Also record the purchase in brand_snapshot_purchases for historical tracking
      const email =
        session.customer_details?.email ||
        (typeof session.customer === "object" && session.customer?.email
          ? session.customer.email
          : null);

      if (email) {
        // Map product key to SKU format for backward compatibility
        const skuMap: Record<string, string> = {
          snapshot_plus: "SNAPSHOT_PLUS",
          blueprint: "BLUEPRINT",
          blueprint_plus: "BLUEPRINT_PLUS",
        };
        const productSku = skuMap[productKey] || productKey.toUpperCase();

        const sb = supabaseServer();
        await sb.from("brand_snapshot_purchases").upsert(
          {
            user_email: email.toLowerCase(),
            stripe_checkout_session_id: session.id,
            stripe_customer_id:
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id ?? null,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
            product_sku: productSku,
            stripe_price_id: session.metadata?.stripe_price_id ?? null,
            amount_total: session.amount_total,
            currency: session.currency,
            status: "paid",
            fulfilled: false,
          },
          { onConflict: "stripe_checkout_session_id" }
        );
      }
    }

    // Optional: handle refunds to set status
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id ?? null;

      if (paymentIntent) {
        const sb = supabaseServer();
        await sb
          .from("brand_snapshot_purchases")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", paymentIntent);
      }
    }

    return NextResponse.json({ received: true });

    // Optional: handle refunds to set status
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent =
        typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id ?? null;

      if (paymentIntent) {
        const sb = supabaseServer();
        await sb
          .from("brand_snapshot_purchases")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", paymentIntent);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
