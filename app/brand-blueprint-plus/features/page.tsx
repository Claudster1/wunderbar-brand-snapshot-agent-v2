import type { Metadata } from "next";
import { ProductFeaturesBreakdown } from "@/components/marketing/ProductFeaturesBreakdown";
import { blueprintPlusFeatures } from "@/lib/marketing/productFeatures/blueprintPlusFeatures";

export const metadata: Metadata = {
  title: "WunderBrand Blueprint+™ Features | What's Included",
  description:
    "Full feature breakdown for WunderBrand Blueprint+™ — implementation guides, templates, advanced competitive strategy, and a live Strategy Activation Session.",
  openGraph: {
    title: "WunderBrand Blueprint+™ Features | What's Included",
    description:
      "See everything included in Blueprint+™ — full strategy, templates, 90-day plan, and Strategy Activation Session.",
    url: "https://app.wunderbrand.ai/brand-blueprint-plus/features",
  },
};

export default function BlueprintPlusFeaturesPage() {
  return <ProductFeaturesBreakdown data={blueprintPlusFeatures} />;
}
