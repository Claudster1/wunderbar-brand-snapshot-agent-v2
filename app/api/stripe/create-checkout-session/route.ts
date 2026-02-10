import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

export async function POST(req: NextRequest) {
  // ─── Security: Rate limit checkout creation ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "stripe-session", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { priceId, snapshotId, email } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Klarna/Afterpay enabled — must also be enabled in Stripe Dashboard → Settings → Payment Methods
      payment_method_types: ["card", "klarna", "afterpay_clearpay"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${baseUrl}/checkout/success?product=snapshot-plus&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel?product=snapshot-plus`,
      metadata: {
        snapshot_id: snapshotId ?? "",
      },
    });

    // Fire AC event to track checkout initiation (for abandonment recovery)
    if (email) {
      try {
        const { fireACEvent } = await import("@/lib/fireACEvent");
        await fireACEvent({
          email,
          eventName: "checkout_initiated",
          tags: ["checkout:initiated"],
          fields: {
            checkout_product: priceId,
            checkout_session_id: session.id,
          },
        });
      } catch (acErr) {
        // Non-blocking — don't fail checkout if AC fails
        console.warn("⚠️ AC checkout_initiated event failed:", acErr);
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout error:", err);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
