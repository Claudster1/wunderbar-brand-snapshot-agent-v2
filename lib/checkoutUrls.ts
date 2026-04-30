export type CheckoutProduct = "snapshot-plus" | "blueprint" | "blueprint-plus";
export type CheckoutMedium = "report_cta" | "results_cta" | "landing_cta" | "modal_cta";

type CheckoutTrackingInput = {
  product: CheckoutProduct;
  medium: CheckoutMedium;
  content: string;
  source?: string;
  campaign?: string;
};

const DEFAULT_CAMPAIGN_BY_PRODUCT: Record<CheckoutProduct, string> = {
  "snapshot-plus": "snapshot_plus_upgrade",
  blueprint: "blueprint_upgrade",
  "blueprint-plus": "blueprint_plus_upgrade",
};

export function getTrackedCheckoutUrl({
  product,
  medium,
  content,
  source = "wunderbar_app",
  campaign,
}: CheckoutTrackingInput): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign ?? DEFAULT_CAMPAIGN_BY_PRODUCT[product],
    utm_content: content,
  });

  return `/checkout/${product}?${params.toString()}`;
}
