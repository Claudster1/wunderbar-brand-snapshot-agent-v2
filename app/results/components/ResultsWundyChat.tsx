"use client";

import WundyChat from "@/components/wundy/WundyChat";

type ProductTier = "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";

type Props = {
  reportId: string;
  productTier: ProductTier;
};

export function ResultsWundyChat({ reportId, productTier }: Props) {
  if (productTier === "snapshot") {
    return <WundyChat mode="general" />;
  }

  const tier =
    productTier === "snapshot_plus"
      ? "snapshot-plus"
      : productTier === "blueprint"
        ? "blueprint"
        : "blueprint-plus";

  return <WundyChat mode="report" reportId={reportId} tier={tier} />;
}
