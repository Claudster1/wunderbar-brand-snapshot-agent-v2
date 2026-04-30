"use client";

import WundyChat from "@/components/wundy/WundyChat";
import type { ProductTier } from "@/components/results/tabConfig";

type Props = {
  reportId: string;
  productTier: ProductTier;
};

export function ResultsWundyChat({ reportId, productTier }: Props) {
  if (productTier === "snapshot") {
    return <WundyChat mode="general" />;
  }

  if (!reportId?.trim()) {
    return <WundyChat mode="general" />;
  }

  const tier =
    productTier === "snapshot-plus"
      ? "snapshot-plus"
      : productTier === "blueprint"
        ? "blueprint"
        : "blueprint-plus";

  return <WundyChat mode="report" reportId={reportId} tier={tier} />;
}
