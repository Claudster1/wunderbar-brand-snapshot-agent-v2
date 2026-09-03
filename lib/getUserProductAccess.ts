// lib/getUserProductAccess.ts
// Product access checking — supports both global (legacy) and per-brand lookups

import { supabaseServer } from "./supabase";
import { ProductAccess } from "./productAccess";

const NO_ACCESS: ProductAccess = {
  hasSnapshotPlus: false,
  hasBlueprint: false,
  hasBlueprintPlus: false,
};

function accessFromSkus(skus: string[]): ProductAccess {
  const set = new Set(skus.map((s) => String(s || "").toUpperCase()));
  const hasBlueprintPlus = set.has("BLUEPRINT_PLUS");
  const hasBlueprint =
    hasBlueprintPlus || set.has("BLUEPRINT") || set.has("BLUEPRINT_REFRESH");
  const hasSnapshotPlus =
    hasBlueprint ||
    hasBlueprintPlus ||
    set.has("SNAPSHOT_PLUS") ||
    set.has("SNAPSHOT_PLUS_REFRESH");
  return { hasSnapshotPlus, hasBlueprint, hasBlueprintPlus };
}

/**
 * Get product access for a user.
 *
 * When `brandName` is provided, returns **only** brand-scoped access from
 * `user_brands` — no global fallback. That keeps one purchase locked to one brand.
 *
 * When `brandName` is omitted, checks legacy account-wide `user_purchases`, then
 * falls back to the purchase ledger (`brand_snapshot_purchases`) so returning
 * buyers still have access without `user_id` on the Checkout session.
 */
export async function getUserProductAccess(
  userEmail: string,
  brandName?: string,
): Promise<ProductAccess> {
  const supabase = supabaseServer();
  const normalizedEmail = userEmail.toLowerCase();

  // Brand-scoped: never fall back to global purchases for a different brand.
  if (brandName?.trim()) {
    const { data: brandAccess } = await (supabase
      .from("user_brands" as any)
      .select("has_snapshot_plus, has_blueprint, has_blueprint_plus")
      .eq("user_email", normalizedEmail)
      .ilike("brand_name", brandName.trim())
      .maybeSingle() as any);

    if (!brandAccess) return NO_ACCESS;

    return {
      hasSnapshotPlus: brandAccess.has_snapshot_plus === true,
      hasBlueprint: brandAccess.has_blueprint === true,
      hasBlueprintPlus: brandAccess.has_blueprint_plus === true,
    };
  }

  // Legacy global lookup (no brand context)
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .single();

  if (!userError && user) {
    const userId = (user as { id: string }).id;

    const { data, error } = await supabase
      .from("user_purchases")
      .select("has_brand_snapshot_plus, has_blueprint, has_blueprint_plus")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      const row = data as {
        has_brand_snapshot_plus?: boolean;
        has_blueprint?: boolean;
        has_blueprint_plus?: boolean;
      };
      return {
        hasSnapshotPlus: row.has_brand_snapshot_plus === true,
        hasBlueprint: row.has_blueprint === true,
        hasBlueprintPlus: row.has_blueprint_plus === true,
      };
    }
  }

  // Purchase ledger fallback (email-keyed; works when Checkout had no user_id)
  const { data: purchases } = await (supabase
    .from("brand_snapshot_purchases" as any)
    .select("product_sku")
    .eq("user_email", normalizedEmail)
    .eq("status", "paid") as any);

  if (!purchases?.length) return NO_ACCESS;
  return accessFromSkus(
    (purchases as Array<{ product_sku?: string }>).map((p) => p.product_sku || ""),
  );
}
