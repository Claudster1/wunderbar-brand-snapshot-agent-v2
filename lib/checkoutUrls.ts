export type CheckoutProduct = "snapshot-plus" | "blueprint" | "blueprint-plus";
export type CheckoutMedium = "report_cta" | "results_cta" | "landing_cta" | "modal_cta";

type CheckoutTrackingInput = {
  product: CheckoutProduct;
  medium: CheckoutMedium;
  content: string;
  source?: string;
  campaign?: string;
  /** Carry forward so Stripe metadata can unlock from an existing report */
  baseReportId?: string;
};

const DEFAULT_CAMPAIGN_BY_PRODUCT: Record<CheckoutProduct, string> = {
  "snapshot-plus": "snapshot_plus_upgrade",
  blueprint: "blueprint_upgrade",
  "blueprint-plus": "blueprint_plus_upgrade",
};

/**
 * In-app Stripe checkout entry for paid tiers.
 * Flow: `/checkout/[product]` → Stripe → `/checkout/success` → `/?tier=…` chat.
 *
 * Returns a **relative** path so it works on the current host (preview or prod).
 * For PDF / email absolute links, use `getAbsoluteTrackedCheckoutUrl` or the
 * marketing PDF URLs in `lib/wunderbarExternalUrls.ts`.
 */
export function getTrackedCheckoutUrl({
  product,
  medium,
  content,
  source = "wunderbar_app",
  campaign,
  baseReportId,
}: CheckoutTrackingInput): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign ?? DEFAULT_CAMPAIGN_BY_PRODUCT[product],
    utm_content: content,
  });

  if (baseReportId) {
    params.set("baseReportId", baseReportId);
  }

  return `/checkout/${product}?${params.toString()}`;
}

/**
 * Absolute checkout URL for the deployment that is generating the link.
 * Prefer VERCEL_URL so preview-generated PDFs/emails don't point at prod 404s
 * when `/checkout/[product]` is not yet live on production.
 */
export function getAbsoluteTrackedCheckoutUrl(input: CheckoutTrackingInput): string {
  const path = getTrackedCheckoutUrl(input);
  const vercelHost = process.env.VERCEL_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (vercelHost) {
    return `https://${vercelHost}${path}`;
  }
  const base =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")) ||
    "https://app.wunderbrand.ai";
  return `${base}${path}`;
}
