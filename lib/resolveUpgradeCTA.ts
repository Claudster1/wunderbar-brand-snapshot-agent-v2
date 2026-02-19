export type UpgradeContext = {
  hasSnapshotPlus: boolean;
  hasBlueprint: boolean;
  primaryPillar: string;
};

export function resolveUpgradeCTA(ctx: UpgradeContext) {
  if (ctx.hasBlueprint) return null;

  if (!ctx.hasSnapshotPlus) {
    return {
      testId: "snapshot_to_plus",
      variantA: {
        label: "Go deeper on your brand →",
        href: "/snapshot-plus",
      },
      variantB: {
        label: `See how to strengthen ${ctx.primaryPillar} →`,
        href: "/snapshot-plus",
      },
    };
  }

  return {
    testId: "plus_to_blueprint",
    variantA: {
      label: "Activate your WunderBrand Blueprint™ →",
      href: "/blueprint",
    },
    variantB: {
      label: `Resolve ${ctx.primaryPillar} fully →`,
      href: "/blueprint",
    },
  };
}
