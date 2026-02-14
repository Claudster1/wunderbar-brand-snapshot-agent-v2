// lib/recordStripePurchase.ts
// Record a completed Stripe Checkout in brand_snapshot_purchases

import { supabaseServer } from "@/lib/supabaseServer";
import { getStripePriceId } from "@/lib/pricing";
import type { ProductKey } from "@/lib/pricing";

const PRODUCT_SKU: Record<string, string> = {
  snapshot_plus: "SNAPSHOT_PLUS",
  blueprint: "BLUEPRINT",
  blueprint_plus: "BLUEPRINT_PLUS",
  snapshot_plus_refresh: "SNAPSHOT_PLUS_REFRESH",
  blueprint_refresh: "BLUEPRINT_REFRESH",
};

export async function recordStripePurchase({
  email,
  sessionId,
  productKey,
  amountTotal,
  currency,
  reportId,
}: {
  email: string;
  sessionId: string;
  productKey: ProductKey;
  amountTotal?: number;
  currency?: string;
  reportId?: string;
}): Promise<void> {
  const supabase = supabaseServer();
  const stripePriceId = getStripePriceId(productKey);
  const productSku = PRODUCT_SKU[productKey];

  const { error } = await supabase.from("brand_snapshot_purchases").insert({
    user_email: email.toLowerCase(),
    stripe_checkout_session_id: sessionId,
    product_sku: productSku,
    stripe_price_id: stripePriceId,
    amount_total: amountTotal ?? null,
    currency: currency ?? null,
    status: "paid",
    fulfilled: false,
    report_id: reportId ?? null,
  });

  if (error) {
    console.error("[recordStripePurchase] Insert failed:", error);
    throw error;
  }
}
