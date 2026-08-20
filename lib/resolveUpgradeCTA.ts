import { getTrackedCheckoutUrl } from "@/lib/checkoutUrls";

export type UpgradeContext = {
  hasSnapshotPlus: boolean;
  hasBlueprint: boolean;
  primaryPillar: string;
};

export function resolveUpgradeCTA(ctx: UpgradeContext) {
  if (ctx.hasBlueprint) return null;

  if (!ctx.hasSnapshotPlus) {
    const href = getTrackedCheckoutUrl({
      product: "snapshot-plus",
      medium: "results_cta",
      content: "resolve_upgrade_snapshot_plus",
    });
    return {
      testId: "snapshot_to_plus",
      variantA: {
        label: "Go deeper on your brand →",
        href,
      },
      variantB: {
        label: `See how to strengthen ${ctx.primaryPillar} →`,
        href,
      },
    };
  }

  const href = getTrackedCheckoutUrl({
    product: "blueprint",
    medium: "results_cta",
    content: "resolve_upgrade_blueprint",
  });
  return {
    testId: "plus_to_blueprint",
    variantA: {
      label: "Activate your WunderBrand Blueprint™ →",
      href,
    },
    variantB: {
      label: `Resolve ${ctx.primaryPillar} fully →`,
      href,
    },
  };
}
