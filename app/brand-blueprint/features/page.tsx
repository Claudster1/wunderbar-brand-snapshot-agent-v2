import type { Metadata } from "next";
import { ProductFeaturesBreakdown } from "@/components/marketing/ProductFeaturesBreakdown";
import { blueprintFeatures } from "@/lib/marketing/productFeatures/blueprintFeatures";

export const metadata: Metadata = {
  title: "WunderBrand Blueprint™ Features | What's Included",
  description:
    "Full feature breakdown for WunderBrand Blueprint™ — diagnostics, identity, audience, messaging, sales enablement, competitive intelligence, and deliverables.",
  openGraph: {
    title: "WunderBrand Blueprint™ Features | What's Included",
    description:
      "See everything included in Blueprint™ — complete brand strategy, competitive intelligence, AI prompts, and action plans.",
    url: "https://app.wunderbrand.ai/brand-blueprint/features",
  },
};

export default function BlueprintFeaturesPage() {
  return <ProductFeaturesBreakdown data={blueprintFeatures} />;
}
