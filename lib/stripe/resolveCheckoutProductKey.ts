// lib/stripe/resolveCheckoutProductKey.ts
// Resolve product_key from Checkout Session metadata or line-item price IDs.

import type Stripe from "stripe";
import type { ProductKey } from "@/lib/pricing";

const METADATA_PRODUCT_KEYS = ["product_key", "product_tier", "product"] as const;

export function normalizeStripeProductKey(raw: string): ProductKey | null {
  const lower = String(raw).toLowerCase().trim().replace(/-/g, "_");
  if (!lower) return null;
  if (lower === "snapshot_plus_refresh") return "snapshot_plus_refresh";
  if (lower === "blueprint_refresh") return "blueprint_refresh";
  if (lower === "snapshot_plus" || lower.includes("snapshot_plus") || lower === "snapshot+") {
    return "snapshot_plus";
  }
  if (lower === "blueprint_plus" || lower.includes("blueprint_plus") || lower.includes("blueprint+")) {
    return "blueprint_plus";
  }
  if (lower === "blueprint") return "blueprint";
  if (lower.includes("snapshot") && !lower.includes("blueprint")) return "snapshot_plus";
  return null;
}

export function productKeyFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): ProductKey | null {
  if (!metadata) return null;
  const raw = METADATA_PRODUCT_KEYS.map((k) => metadata[k]).find(Boolean) ?? "";
  return normalizeStripeProductKey(String(raw));
}

/** Map a Stripe Price id to our ProductKey using env-configured price IDs. */
export function productKeyFromStripePriceId(priceId: string | null | undefined): ProductKey | null {
  if (!priceId) return null;
  const pairs: Array<[string | undefined, ProductKey]> = [
    [process.env.STRIPE_PRICE_SNAPSHOT_PLUS, "snapshot_plus"],
    [process.env.STRIPE_PRICE_BLUEPRINT, "blueprint"],
    [process.env.STRIPE_PRICE_BLUEPRINT_PLUS, "blueprint_plus"],
    [process.env.STRIPE_PRICE_SNAPSHOT_PLUS_REFRESH, "snapshot_plus_refresh"],
    [process.env.STRIPE_PRICE_BLUEPRINT_REFRESH, "blueprint_refresh"],
  ];
  for (const [envId, key] of pairs) {
    if (envId && envId === priceId) return key;
  }
  return null;
}

export function productKeyFromCheckoutLineItems(
  session: Pick<Stripe.Checkout.Session, "line_items">,
): ProductKey | null {
  const items = session.line_items?.data;
  if (!items?.length) return null;
  for (const item of items) {
    const price = item.price;
    const priceId = typeof price === "string" ? price : price?.id;
    const key = productKeyFromStripePriceId(priceId);
    if (key) return key;
  }
  return null;
}
