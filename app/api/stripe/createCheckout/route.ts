// app/api/stripe/createCheckout/route.ts
// Stripe checkout session creation endpoint

import Stripe from "stripe";
import { PRICING } from "@/lib/pricing";
import { normalizeProductKey } from "@/lib/productIds";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

export async function POST(req: Request) {
  // ─── Security: Rate limit checkout creation ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "stripe-checkout", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { productKey, userId, metadata } = await req.json();
    const normalizedKey = normalizeProductKey(productKey);

    if (!normalizedKey) {
      return new Response("Invalid product", { status: 400 });
    }

    const product = PRICING[normalizedKey];
    if (!product) {
      return new Response("Invalid product", { status: 400 });
    }

    // Enable Klarna/Afterpay for higher-priced tiers (Blueprint, Blueprint+)
    // These payment methods let customers pay in installments while we get paid in full upfront.
    // Note: Klarna/Afterpay must also be enabled in Stripe Dashboard → Settings → Payment Methods
    const paymentMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
      normalizedKey === "blueprint" || normalizedKey === "blueprint_plus"
        ? ["card", "klarna", "afterpay_clearpay"]
        : ["card", "klarna"];

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: paymentMethods,
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1
        }
      ],
      metadata: {
        product_key: normalizedKey,
        user_id: userId,
        ...(metadata ?? {}),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?product=${normalizedKey.replace("_", "-")}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel?product=${normalizedKey.replace("_", "-")}`
    });

    return Response.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return new Response("Unable to create checkout session", { status: 500 });
  }
}
