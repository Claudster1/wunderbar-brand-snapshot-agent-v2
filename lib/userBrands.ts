import { supabaseServer } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export interface UserBrand {
  id: string;
  user_email: string;
  brand_name: string;
  industry: string | null;
  website: string | null;
  latest_score: number | null;
  latest_report_id: string | null;
  latest_report_tier: string | null;
  has_snapshot_plus: boolean;
  has_blueprint: boolean;
  has_blueprint_plus: boolean;
  report_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Register or update a brand for a user.
 * Called automatically when a report is created or a purchase is made.
 * Uses upsert on (user_email, brand_name) to be idempotent.
 */
export async function registerBrand({
  email,
  brandName,
  industry,
  website,
  score,
  reportId,
  reportTier,
}: {
  email: string;
  brandName: string;
  industry?: string | null;
  website?: string | null;
  score?: number | null;
  reportId?: string | null;
  reportTier?: string | null;
}): Promise<void> {
  if (!email || !brandName) return;

  const supabase = supabaseServer();
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedBrand = brandName.trim();

  if (!normalizedBrand || normalizedBrand === "Unknown") return;

  try {
    // Check if brand exists
    const { data: existing } = await (supabase
      .from("user_brands" as any)
      .select("id, report_count, latest_score")
      .eq("user_email", normalizedEmail)
      .eq("brand_name", normalizedBrand)
      .maybeSingle() as any);

    if (existing) {
      // Update existing brand
      const updates: Record<string, unknown> = {
        report_count: (existing.report_count || 0) + 1,
        updated_at: new Date().toISOString(),
      };
      if (industry) updates.industry = industry;
      if (website) updates.website = website;
      if (score != null) updates.latest_score = score;
      if (reportId) updates.latest_report_id = reportId;
      if (reportTier) updates.latest_report_tier = reportTier;

      await (supabase
        .from("user_brands" as any) as any)
        .update(updates)
        .eq("id", existing.id);
    } else {
      // Insert new brand
      await (supabase
        .from("user_brands" as any) as any)
        .insert({
          user_email: normalizedEmail,
          brand_name: normalizedBrand,
          industry: industry || null,
          website: website || null,
          latest_score: score ?? null,
          latest_report_id: reportId || null,
          latest_report_tier: reportTier || null,
          report_count: 1,
        });
    }
  } catch (err) {
    logger.warn("[userBrands] registerBrand failed (non-blocking)", {
      error: err instanceof Error ? err.message : String(err),
      email: normalizedEmail,
      brandName: normalizedBrand,
    });
  }
}

/**
 * Grant product access for a specific brand.
 * Called from the Stripe webhook after purchase.
 */
export async function grantBrandAccess({
  email,
  brandName,
  productTier,
}: {
  email: string;
  brandName: string;
  productTier: "snapshot_plus" | "blueprint" | "blueprint_plus";
}): Promise<void> {
  if (!email || !brandName) return;

  const supabase = supabaseServer();
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedBrand = brandName.trim();

  const accessUpdate: Record<string, boolean> = {};
  switch (productTier) {
    case "snapshot_plus":
      accessUpdate.has_snapshot_plus = true;
      break;
    case "blueprint":
      accessUpdate.has_blueprint = true;
      accessUpdate.has_snapshot_plus = true;
      break;
    case "blueprint_plus":
      accessUpdate.has_blueprint_plus = true;
      accessUpdate.has_blueprint = true;
      accessUpdate.has_snapshot_plus = true;
      break;
  }

  try {
    // Ensure brand exists first
    await registerBrand({ email, brandName });

    await (supabase
      .from("user_brands" as any) as any)
      .update(accessUpdate)
      .eq("user_email", normalizedEmail)
      .eq("brand_name", normalizedBrand);
  } catch (err) {
    logger.warn("[userBrands] grantBrandAccess failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Get all brands for a user, ordered by most recently updated.
 */
export async function getUserBrands(email: string): Promise<UserBrand[]> {
  if (!email) return [];

  const supabase = supabaseServer();

  const { data, error } = await (supabase
    .from("user_brands" as any)
    .select("*")
    .eq("user_email", email.toLowerCase().trim())
    .order("updated_at", { ascending: false }) as any);

  if (error) {
    logger.warn("[userBrands] getUserBrands failed", { error: error.message });
    return [];
  }

  return (data || []) as UserBrand[];
}

/**
 * Get product access for a specific brand.
 */
export async function getBrandAccess(
  email: string,
  brandName: string,
): Promise<{ hasSnapshotPlus: boolean; hasBlueprint: boolean; hasBlueprintPlus: boolean }> {
  if (!email || !brandName) {
    return { hasSnapshotPlus: false, hasBlueprint: false, hasBlueprintPlus: false };
  }

  const supabase = supabaseServer();

  const { data } = await (supabase
    .from("user_brands" as any)
    .select("has_snapshot_plus, has_blueprint, has_blueprint_plus")
    .eq("user_email", email.toLowerCase().trim())
    .eq("brand_name", brandName.trim())
    .maybeSingle() as any);

  if (!data) {
    return { hasSnapshotPlus: false, hasBlueprint: false, hasBlueprintPlus: false };
  }

  return {
    hasSnapshotPlus: data.has_snapshot_plus === true,
    hasBlueprint: data.has_blueprint === true,
    hasBlueprintPlus: data.has_blueprint_plus === true,
  };
}
