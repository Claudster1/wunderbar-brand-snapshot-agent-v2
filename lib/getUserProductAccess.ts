// lib/getUserProductAccess.ts
// Function to get user's product access from database

import { supabaseServer } from "./supabase";
import { ProductAccess } from "./productAccess";

export async function getUserProductAccess(userEmail: string): Promise<ProductAccess> {
  const supabase = supabaseServer();
  
  // First, get user_id from users table
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", userEmail.toLowerCase())
    .single();

  if (userError || !user) {
    // Return default (no access) if user not found
    return {
      hasSnapshotPlus: false,
      hasBlueprint: false,
      hasBlueprintPlus: false,
    };
  }

  // Then get product access
  const { data, error } = await supabase
    .from("user_purchases")
    .select("has_brand_snapshot_plus, has_blueprint, has_blueprint_plus")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    // Return default (no access) if purchase record not found
    return {
      hasSnapshotPlus: false,
      hasBlueprint: false,
      hasBlueprintPlus: false,
    };
  }

  return {
    hasSnapshotPlus: data.has_brand_snapshot_plus === true,
    hasBlueprint: data.has_blueprint === true,
    hasBlueprintPlus: data.has_blueprint_plus === true,
  };
}
