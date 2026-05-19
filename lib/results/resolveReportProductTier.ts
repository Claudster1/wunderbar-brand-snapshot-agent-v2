import { normalizeProductTierString, type ProductTier } from "@/components/results/tabConfig";

/** Tier as stored on reports (`_meta.tier`, `product_tier`). */
export type StoredProductTier = "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";

function tierFromString(raw: string): StoredProductTier | null {
  const n = raw.trim().toLowerCase().replace(/-/g, "_");
  if (n === "blueprint_plus") return "blueprint_plus";
  if (n === "blueprint") return "blueprint";
  if (n === "snapshot_plus") return "snapshot_plus";
  if (n === "snapshot") return "snapshot";
  return null;
}

/**
 * Resolve the product tier for a single report from persisted metadata only.
 * Does not use account-level entitlements — users see content for the report they ran.
 */
export function resolveStoredProductTier(report: Record<string, unknown>): StoredProductTier {
  const metaTier = (report.full_report as { _meta?: { tier?: string } } | undefined)?._meta?.tier;
  if (typeof metaTier === "string") {
    const fromMeta = tierFromString(metaTier);
    if (fromMeta) return fromMeta;
  }

  const productTier = typeof report.product_tier === "string" ? report.product_tier : "";
  const fromColumn = tierFromString(productTier);
  if (fromColumn) return fromColumn;

  const nestedTier =
    fullReportProductTier(report) ?? tierFromString(typeof report.tier === "string" ? report.tier : "");
  if (nestedTier) return nestedTier;

  return "snapshot";
}

function fullReportProductTier(report: Record<string, unknown>): StoredProductTier | null {
  const fullReport = report.full_report;
  if (!fullReport || typeof fullReport !== "object" || Array.isArray(fullReport)) return null;
  const pt = (fullReport as { product_tier?: unknown }).product_tier;
  return typeof pt === "string" ? tierFromString(pt) : null;
}

export function storedTierToTabTier(t: StoredProductTier): ProductTier {
  if (t === "snapshot_plus") return "snapshot-plus";
  if (t === "blueprint_plus") return "blueprint-plus";
  if (t === "blueprint") return "blueprint";
  return "snapshot";
}

export function resolveReportTabTier(report: Record<string, unknown>): ProductTier {
  return storedTierToTabTier(resolveStoredProductTier(report));
}

/** Normalize intake/chat tier strings to storage `_meta.tier` values. */
export function normalizeIntakeTierForStorage(raw: unknown): StoredProductTier {
  if (typeof raw !== "string" || !raw.trim()) return "snapshot";
  return tierFromString(raw) ?? "snapshot";
}

/** `product_tier` string for full_report (hyphenated, matches DownloadsTab). */
export function storedTierToProductTierField(t: StoredProductTier): ProductTier {
  return storedTierToTabTier(t);
}

export function isPaidReportTier(t: StoredProductTier): boolean {
  return t !== "snapshot";
}
