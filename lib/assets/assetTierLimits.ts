/** Shared Blueprint / Blueprint+ asset upload limits (keep list + upload in sync). */

export const ASSET_TIER_LIMITS: Record<
  "blueprint" | "blueprint-plus",
  { maxFiles: number; allowedTypes: readonly string[] }
> = {
  blueprint: {
    maxFiles: 3,
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"],
  },
  "blueprint-plus": {
    maxFiles: 10,
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
};

export function maxAssetsForTier(tier: string): number {
  if (tier === "blueprint" || tier === "blueprint-plus") {
    return ASSET_TIER_LIMITS[tier].maxFiles;
  }
  return 0;
}

/** Clamp signed-URL TTL to a safe window (seconds). */
export function clampSignedUrlTtl(expiresInSeconds: number, min = 60, max = 3600): number {
  if (!Number.isFinite(expiresInSeconds)) return min;
  return Math.min(Math.max(Math.floor(expiresInSeconds), min), max);
}
