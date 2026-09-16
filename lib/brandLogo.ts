// Client-safe brand logo helpers (no server-only imports).

import { isLikelyLogoFilename } from "@/lib/assets/brandAssetPaths";
import { clampSignedUrlTtl } from "@/lib/assets/assetTierLimits";

export { isLikelyLogoFilename };
export { clampSignedUrlTtl };

export const BLUEPRINT_LOGO_TIERS = ["blueprint", "blueprint-plus"] as const;
export type BlueprintLogoTier = (typeof BLUEPRINT_LOGO_TIERS)[number];

export function isBlueprintLogoTier(tier: string | null | undefined): tier is BlueprintLogoTier {
  return tier === "blueprint" || tier === "blueprint-plus";
}

export function isImageMimeType(mimeType: string | null | undefined): boolean {
  return typeof mimeType === "string" && mimeType.startsWith("image/");
}

export type PrimaryBrandLogo = {
  id: string;
  fileName: string;
  fileType: string;
  signedUrl: string;
};
