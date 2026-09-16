// Server-only primary logo resolution against Supabase Storage.
import "server-only";

import { supabaseServer } from "@/lib/supabase";
import { clampSignedUrlTtl } from "@/lib/assets/assetTierLimits";
import type { BlueprintLogoTier, PrimaryBrandLogo } from "@/lib/brandLogo";

/**
 * Returns a short-lived signed URL for the user's primary logo image, if any.
 * Preference: newest asset_category === "logo" image. No random-image fallback.
 */
export async function getPrimaryBrandLogo(
  email: string,
  tier: BlueprintLogoTier,
  expiresInSeconds = 3600
): Promise<PrimaryBrandLogo | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return null;

  const ttl = clampSignedUrlTtl(expiresInSeconds);

  const sb = supabaseServer();
  const { data, error } = await sb
    .from("brand_asset_uploads")
    .select("id, file_name, file_type, storage_path")
    .eq("user_email", normalized)
    .eq("tier", tier)
    .eq("asset_category", "logo")
    .like("file_type", "image/%")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data?.length) return null;

  const logo = data[0] as {
    id: string;
    file_name: string;
    file_type: string;
    storage_path: string;
  };

  if (!logo.storage_path || logo.storage_path.includes("..")) return null;

  const { data: signed, error: signError } = await sb.storage
    .from("brand-assets")
    .createSignedUrl(logo.storage_path, ttl);

  if (signError || !signed?.signedUrl) return null;

  return {
    id: logo.id,
    fileName: logo.file_name,
    fileType: logo.file_type,
    signedUrl: signed.signedUrl,
  };
}

/** Demote other logo-category assets so only one primary logo exists per user+tier. */
export async function clearOtherPrimaryLogos(
  email: string,
  tier: BlueprintLogoTier,
  keepAssetId: string
): Promise<void> {
  const sb = supabaseServer();
  await (sb.from("brand_asset_uploads") as any)
    .update({ asset_category: "image" })
    .eq("user_email", email.trim().toLowerCase())
    .eq("tier", tier)
    .eq("asset_category", "logo")
    .neq("id", keepAssetId);
}
