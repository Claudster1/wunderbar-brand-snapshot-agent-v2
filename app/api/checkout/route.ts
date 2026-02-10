// app/api/checkout/route.ts
// General checkout endpoint — supports automatic upgrade credits.
import Stripe from "stripe";
import { PRICING } from "@/lib/pricing";
import { normalizeProductKey } from "@/lib/productIds";
import { getUpgradeCoupon } from "@/lib/upgradeCoupons";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: Request) {
  // ─── Security: Rate limit checkout creation ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "checkout", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { productKey, userId, email, metadata } = await req.json();
    const normalizedKey = normalizeProductKey(productKey);

    if (!normalizedKey) {
      return new Response("Invalid product", { status: 400 });
    }

    const product = PRICING[normalizedKey];
    if (!product) {
      return new Response("Invalid product", { status: 400 });
    }

    // ─── Upgrade Credit: Check for prior purchases ───
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    let upgradeDescription: string | null = null;

    if (email) {
      try {
        const upgrade = await getUpgradeCoupon(email, normalizedKey);
        if (upgrade.couponId) {
          discounts = [{ coupon: upgrade.couponId }];
          upgradeDescription = upgrade.description;
          console.log(
            `✅ Upgrade credit applied for ${email}: ${upgrade.description}`
          );
        }
      } catch (err) {
        console.warn("⚠️ Upgrade coupon lookup failed:", err);
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        product_key: normalizedKey,
        user_id: userId ?? "",
        ...(upgradeDescription ? { upgrade_credit: upgradeDescription } : {}),
        ...(metadata ?? {}),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    };

    if (discounts.length > 0) {
      sessionParams.discounts = discounts;
    }

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

    return Response.json({
      url: session.url,
      upgradeApplied: discounts.length > 0,
      upgradeDescription,
    });
  } catch (err: any) {
    console.error(err);
    return new Response("Unable to create checkout session", { status: 500 });
  }
}
