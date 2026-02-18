// POST /api/refresh-checkout — Create a Stripe checkout for a quarterly refresh
// Enforces:
//   1. Brand locking — refreshes must be for the same company
//   2. Free refresh limits — Blueprint gets 1 free within 90 days
//   3. Window expiration — Blueprint+ free refreshes end after 1 year
//   4. Blueprint+ within window → free redirect (no checkout)
//   5. All others → Stripe checkout at tier-appropriate price

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRICING, getRefreshParentTier } from "@/lib/pricing";
import { supabaseServer } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { checkRefreshEligibility, validateBrandMatch } from "@/lib/refreshEntitlements";

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
    const { refreshKey, email, brandName } = await req.json();

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

    // ─── Check refresh eligibility (brand lock + limits + window) ───
    const eligibility = await checkRefreshEligibility(email.toLowerCase());

    // Enforce brand lock: if the user has an entitlement, the brand must match
    if (eligibility.brandLocked && eligibility.brandName && brandName) {
      if (!validateBrandMatch(eligibility.brandName, brandName)) {
        return NextResponse.json(
          {
            error: "Brand mismatch",
            message: `Your refresh entitlement is for "${eligibility.brandName}". Refreshes and edits apply to the assessed brand only — one company, one brand.`,
            lockedBrand: eligibility.brandName,
          },
          { status: 403 }
        );
      }
    }

    // ─── Free refresh path (Blueprint within window + remaining, or Blueprint+ within year) ───
    if (eligibility.isFree) {
      return NextResponse.json({
        freeRefresh: true,
        message: eligibility.reason,
        redirectUrl: "/",
        brandName: eligibility.brandName,
        freeRemaining: eligibility.freeRemaining === Infinity ? "unlimited" : eligibility.freeRemaining,
        daysRemaining: eligibility.daysRemaining,
      });
    }

    // ─── Paid refresh → Stripe checkout ───
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
        brand_name: eligibility.brandName || brandName || "",
      },
    });

    logger.info("[Refresh Checkout] Paid session created", {
      product: typedKey,
      email,
      price: product.price,
      brandName: eligibility.brandName,
    });

    return NextResponse.json({
      url: session.url,
      paidPrice: eligibility.paidPrice,
      reason: eligibility.reason,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[Refresh Checkout] Error", { error: msg });
    return NextResponse.json({ error: "Unable to create checkout session." }, { status: 500 });
  }
}
