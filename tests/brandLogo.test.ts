import { describe, expect, it } from "vitest";
import {
  buildBrandAssetStoragePath,
  categorizeUploadedAsset,
  isHttpsImageUrl,
  isLikelyLogoFilename,
  mapSignedPreviewUrls,
  safeFileExtension,
  safeStorageSegment,
} from "@/lib/assets/brandAssetPaths";
import {
  ASSET_TIER_LIMITS,
  clampSignedUrlTtl,
  maxAssetsForTier,
} from "@/lib/assets/assetTierLimits";
import { isBlueprintLogoTier, isImageMimeType } from "@/lib/brandLogo";

describe("brandLogo helpers", () => {
  it("detects logo-like filenames", () => {
    expect(isLikelyLogoFilename("acme-logo.png")).toBe(true);
    expect(isLikelyLogoFilename("Brand_Wordmark.svg")).toBe(true);
    expect(isLikelyLogoFilename("primary-lockup.jpg")).toBe(true);
    expect(isLikelyLogoFilename("homepage-hero.png")).toBe(false);
    expect(isLikelyLogoFilename("pitch-deck.pdf")).toBe(false);
  });

  it("gates blueprint logo tiers", () => {
    expect(isBlueprintLogoTier("blueprint")).toBe(true);
    expect(isBlueprintLogoTier("blueprint-plus")).toBe(true);
    expect(isBlueprintLogoTier("snapshot")).toBe(false);
    expect(isBlueprintLogoTier("snapshot-plus")).toBe(false);
  });

  it("detects image mime types", () => {
    expect(isImageMimeType("image/png")).toBe(true);
    expect(isImageMimeType("application/pdf")).toBe(false);
  });
});

describe("assetTierLimits", () => {
  it("keeps upload caps aligned", () => {
    expect(ASSET_TIER_LIMITS.blueprint.maxFiles).toBe(3);
    expect(ASSET_TIER_LIMITS["blueprint-plus"].maxFiles).toBe(10);
    expect(maxAssetsForTier("blueprint")).toBe(3);
    expect(maxAssetsForTier("blueprint-plus")).toBe(10);
    expect(maxAssetsForTier("snapshot")).toBe(0);
  });

  it("clamps signed url ttl", () => {
    expect(clampSignedUrlTtl(30)).toBe(60);
    expect(clampSignedUrlTtl(900)).toBe(900);
    expect(clampSignedUrlTtl(99999)).toBe(3600);
    expect(clampSignedUrlTtl(Number.NaN)).toBe(60);
  });
});

describe("brandAssetPaths security", () => {
  it("strips path traversal from storage segments", () => {
    expect(safeStorageSegment("../../etc/passwd", "fallback")).toBe("passwd");
    expect(safeStorageSegment("a/b/c", "fallback")).toBe("c");
    expect(safeStorageSegment("", "direct")).toBe("direct");
    expect(safeStorageSegment("..", "direct")).toBe("direct");
  });

  it("derives extensions from MIME, not crafted filenames", () => {
    expect(safeFileExtension("image/png", "evil.php.png")).toBe("png");
    expect(safeFileExtension("image/jpeg", "x")).toBe("jpg");
    expect(safeFileExtension("application/octet-stream", "weird")).toBe("bin");
  });

  it("builds storage paths without traversal", () => {
    const path = buildBrandAssetStoragePath({
      email: "User@Example.com",
      sessionId: "../../../evil",
      fileId: "11111111-1111-4111-8111-111111111111",
      mimeType: "image/png",
      fileName: "logo.png",
    });
    expect(path).not.toContain("..");
    expect(path.startsWith("user@example.com/")).toBe(true);
    expect(path.endsWith(".png")).toBe(true);
  });

  it("categorizes logo images vs other assets", () => {
    expect(categorizeUploadedAsset("acme-logo.png", "image/png")).toBe("logo");
    expect(categorizeUploadedAsset("hero.png", "image/png")).toBe("image");
    expect(categorizeUploadedAsset("deck.pdf", "application/pdf")).toBe("document");
  });

  it("maps signed preview urls with path or index fallback", () => {
    const paths = ["a/logo.png", "b/hero.png"];
    const mapped = mapSignedPreviewUrls(paths, [
      { path: "a/logo.png", signedUrl: "https://cdn.example/a" },
      { path: null, signedUrl: "https://cdn.example/b" },
    ]);
    expect(mapped.get("a/logo.png")).toBe("https://cdn.example/a");
    expect(mapped.get("b/hero.png")).toBe("https://cdn.example/b");
  });

  it("rejects non-https image urls for PDF embedding", () => {
    expect(isHttpsImageUrl("https://x.supabase.co/storage/v1/object/sign/x")).toBe(true);
    expect(isHttpsImageUrl("http://insecure.example/logo.png")).toBe(false);
    expect(isHttpsImageUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpsImageUrl(null)).toBe(false);
  });
});
