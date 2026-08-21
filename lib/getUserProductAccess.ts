// lib/getUserProductAccess.ts
// Product access checking — supports both global (legacy) and per-brand lookups

import { supabaseServer } from "./supabase";
import { ProductAccess } from "./productAccess";

const NO_ACCESS: ProductAccess = {
  hasSnapshotPlus: false,
  hasBlueprint: false,
  hasBlueprintPlus: false,
};

/**
 * Get product access for a user.
 *
 * When `brandName` is provided, returns **only** brand-scoped access from
 * `user_brands` — no global fallback. That keeps one purchase locked to one brand.
 *
 * When `brandName` is omitted, falls back to legacy account-wide `user_purchases`
 * (dashboard / admin callers that are not brand-specific).
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

  if (userError || !user) {
    return NO_ACCESS;
  }

  const userId = (user as { id: string }).id;

  const { data, error } = await supabase
    .from("user_purchases")
    .select("has_brand_snapshot_plus, has_blueprint, has_blueprint_plus")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return NO_ACCESS;
  }

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
