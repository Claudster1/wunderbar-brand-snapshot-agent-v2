/**
 * Canonical business-type label normalizer — shared by snapshot API, PDF, and results UI.
 * Prefer this over local copies so aliases stay in sync.
 */

import type { CaptureBusinessType } from "@/lib/intake/toneProfile";

export type CanonicalBusinessType = CaptureBusinessType;

/**
 * Map free-text / enum-ish labels onto CaptureBusinessType.
 * Returns null when unrecognized (callers may fall back to corpus inference or "general").
 */
export function normalizeBusinessTypeLabel(raw: unknown): CanonicalBusinessType | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim().toLowerCase().replace(/‑/g, "-");
  if (!value) return null;

  // Most specific first
  if (
    value.includes("local_service") ||
    value.includes("local service") ||
    value.includes("local / personal") ||
    value.includes("personal services")
  ) {
    return "local_service";
  }
  if (
    value.includes("service_b2b") ||
    value.includes("b2b service") ||
    value.includes("business consulting") ||
    value.includes("consulting / agency")
  ) {
    return "service_b2b";
  }
  if (value.includes("service_b2c") || value.includes("b2c service")) {
    return "service_b2c";
  }
  // ecommerce before retail — "e-commerce / retail" should not become retail alone
  if (
    value.includes("ecommerce") ||
    value.includes("e-commerce") ||
    value.includes("product brand") ||
    value.includes("dtc") ||
    value.includes("shopify")
  ) {
    return "ecommerce";
  }
  if (value.includes("saas") || value.includes("software") || /\bapp\b/.test(value)) {
    return "saas";
  }
  if (value.includes("retail") || value.includes("in-person") || value.includes("storefront")) {
    return "retail";
  }
  // Legacy ambiguous chip — do not invent B2B vs local here
  if (value.includes("services / consulting") || value === "services/consulting") {
    return null;
  }
  return null;
}

/** PDF / locked-preview teaser path — unknown → "general". */
export function normalizeBusinessTypeOrGeneral(raw: unknown): CanonicalBusinessType | "general" {
  return normalizeBusinessTypeLabel(raw) ?? "general";
}
