// POST /api/refresh-checkout — Create a Stripe checkout for a quarterly refresh
// Verifies the customer has a prior purchase at the parent tier before allowing refresh.
// Blueprint+ customers get free refreshes (redirected to retake, no checkout needed).

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRICING, getRefreshParentTier } from "@/lib/pricing";
import { supabaseServer } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

type RefreshKey = "snapshot_plus_refresh" | "blueprint_refresh";

const VALID_REFRESH_KEYS: Set<string> = new Set([
  "snapshot_plus_refresh",
  "blueprint_refresh",
]);

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "refresh-checkout", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { refreshKey, email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!refreshKey || !VALID_REFRESH_KEYS.has(refreshKey)) {
      return NextResponse.json({ error: "Invalid refresh product." }, { status: 400 });
    }

    const typedKey = refreshKey as RefreshKey;
    const parentTier = getRefreshParentTier(typedKey);

    if (!parentTier) {
      return NextResponse.json({ error: "Invalid refresh product." }, { status: 400 });
    }

    // ─── Verify prior purchase at parent tier ───
    const supabase = supabaseServer();
    const parentSku = parentTier === "snapshot_plus" ? "SNAPSHOT_PLUS" : "BLUEPRINT";

    const { data: purchases } = await supabase
      .from("brand_snapshot_purchases")
      .select("id")
      .eq("user_email", email.toLowerCase())
      .eq("status", "paid")
      .in("product_sku", [parentSku, "BLUEPRINT_PLUS"])
      .limit(1);

    if (!purchases || purchases.length === 0) {
      return NextResponse.json(
        { error: `You need an active ${PRICING[parentTier].label} purchase to buy a refresh.` },
        { status: 403 }
      );
    }

    // ─── Check if customer has Blueprint+ (free refreshes) ───
    const { data: bpPlusPurchases } = await supabase
      .from("brand_snapshot_purchases")
      .select("id")
      .eq("user_email", email.toLowerCase())
      .eq("status", "paid")
      .eq("product_sku", "BLUEPRINT_PLUS")
      .limit(1);

    if (bpPlusPurchases && bpPlusPurchases.length > 0) {
      // Blueprint+ customers get free refreshes — no checkout needed
      return NextResponse.json({
        freeRefresh: true,
        message: "As a Blueprint+ customer, your quarterly refreshes are free. Start a new assessment anytime.",
        redirectUrl: "/",
      });
    }

    // ─── Create Stripe checkout session ───
    const product = PRICING[typedKey];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://app.wunderbrand.ai";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      customer_email: email,
      success_url: `${baseUrl}/checkout/success?product=${typedKey.replace(/_/g, "-")}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard`,
      metadata: {
        product_key: typedKey,
        is_refresh: "true",
        parent_tier: parentTier,
      },
    });

    logger.info("[Refresh Checkout] Session created", { product: typedKey, email });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[Refresh Checkout] Error", { error: msg });
    return NextResponse.json({ error: "Unable to create checkout session." }, { status: 500 });
  }
}
