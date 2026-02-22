// lib/getUserProductAccess.ts
// Product access checking — supports both global (legacy) and per-brand lookups

import { supabaseServer } from "./supabase";
import { ProductAccess } from "./productAccess";

/**
 * Get product access for a user.
 * When brandName is provided, checks brand-scoped access first and falls
 * back to global user_purchases access. This allows existing purchases
 * to keep working while new per-brand purchases are properly scoped.
 */
export async function getUserProductAccess(
  userEmail: string,
  brandName?: string,
): Promise<ProductAccess> {
  const supabase = supabaseServer();
  const normalizedEmail = userEmail.toLowerCase();

  // 1. Try brand-scoped access first (from user_brands table)
  if (brandName) {
    const { data: brandAccess } = await (supabase
      .from("user_brands" as any)
      .select("has_snapshot_plus, has_blueprint, has_blueprint_plus")
      .eq("user_email", normalizedEmail)
      .ilike("brand_name", brandName.trim())
      .maybeSingle() as any);

    if (brandAccess) {
      const hasAny = brandAccess.has_snapshot_plus || brandAccess.has_blueprint || brandAccess.has_blueprint_plus;
      if (hasAny) {
        return {
          hasSnapshotPlus: brandAccess.has_snapshot_plus === true,
          hasBlueprint: brandAccess.has_blueprint === true,
          hasBlueprintPlus: brandAccess.has_blueprint_plus === true,
        };
      }
    }
  }

  // 2. Fall back to global user_purchases (legacy)
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .single();

  if (userError || !user) {
    return {
      hasSnapshotPlus: false,
      hasBlueprint: false,
      hasBlueprintPlus: false,
    };
  }

  const userId = (user as { id: string }).id;

  const { data, error } = await supabase
    .from("user_purchases")
    .select("has_brand_snapshot_plus, has_blueprint, has_blueprint_plus")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return {
      hasSnapshotPlus: false,
      hasBlueprint: false,
      hasBlueprintPlus: false,
    };
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
