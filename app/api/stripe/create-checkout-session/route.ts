import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { logger } from "@/lib/logger";
import { getUpgradeCoupon } from "@/lib/upgradeCoupons";

export const runtime = "nodejs";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

// Maps Stripe price env vars back to ProductKey for upgrade lookup
function priceIdToProductKey(
  priceId: string
): "snapshot_plus" | "blueprint" | "blueprint_plus" | null {
  if (priceId === process.env.STRIPE_PRICE_SNAPSHOT_PLUS) return "snapshot_plus";
  if (priceId === process.env.STRIPE_PRICE_BLUEPRINT) return "blueprint";
  if (priceId === process.env.STRIPE_PRICE_BLUEPRINT_PLUS) return "blueprint_plus";
  return null;
}

export async function POST(req: NextRequest) {
  // ─── Security: Rate limit checkout creation ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "stripe-session", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { priceId, snapshotId, email, productKey: rawProductKey } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    // ─── Security: Only allow known Stripe price IDs ───
    const ALLOWED_PRICE_IDS = new Set(
      [
        process.env.STRIPE_PRICE_SNAPSHOT_PLUS,
        process.env.STRIPE_PRICE_BLUEPRINT,
        process.env.STRIPE_PRICE_BLUEPRINT_PLUS,
      ].filter(Boolean)
    );
    if (ALLOWED_PRICE_IDS.size > 0 && !ALLOWED_PRICE_IDS.has(priceId)) {
      logger.warn("[Checkout] Rejected unknown priceId", { priceId });
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // ─── Upgrade Credit: Check for prior purchases ───
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    let upgradeDescription: string | null = null;

    if (email) {
      const productKey = rawProductKey || priceIdToProductKey(priceId);
      if (productKey) {
        try {
          const upgrade = await getUpgradeCoupon(email, productKey);
          if (upgrade.couponId) {
            discounts = [{ coupon: upgrade.couponId }];
            upgradeDescription = upgrade.description;
            logger.info("[Checkout] Upgrade credit applied", {
              email,
              description: upgrade.description,
            });
          }
        } catch (err) {
          logger.warn("Upgrade coupon lookup failed", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
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
        ...(upgradeDescription ? { upgrade_credit: upgradeDescription } : {}),
      },
    };

    if (discounts.length > 0) {
      sessionParams.discounts = discounts;
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

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
            ...(upgradeDescription ? { upgrade_credit: upgradeDescription } : {}),
          },
        });
      } catch (acErr) {
        // Non-blocking — don't fail checkout if AC fails
        logger.warn("AC checkout_initiated event failed", {
          error: acErr instanceof Error ? acErr.message : String(acErr),
        });
      }
    }

    return NextResponse.json({
      url: session.url,
      upgradeApplied: discounts.length > 0,
      upgradeDescription,
    });
  } catch (err: any) {
    logger.error("Stripe Checkout error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
