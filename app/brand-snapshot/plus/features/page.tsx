import type { Metadata } from "next";
import { ProductFeaturesBreakdown } from "@/components/marketing/ProductFeaturesBreakdown";
import { snapshotPlusFeatures } from "@/lib/marketing/productFeatures/snapshotPlusFeatures";

export const metadata: Metadata = {
  title: "WunderBrand Snapshot+™ Features | What's Included",
  description:
    "Full feature breakdown for WunderBrand Snapshot+™ — diagnostics, brand identity, messaging, visual direction, AI prompts, and your 90-day action plan.",
  openGraph: {
    title: "WunderBrand Snapshot+™ Features | What's Included",
    description:
      "See everything included in Snapshot+™ — pillar analysis, ICP, messaging, visuals, AI prompts, and action plan.",
    url: "https://app.wunderbrand.ai/brand-snapshot/plus/features",
  },
};

export default function SnapshotPlusFeaturesPage() {
  return <ProductFeaturesBreakdown data={snapshotPlusFeatures} />;
}
