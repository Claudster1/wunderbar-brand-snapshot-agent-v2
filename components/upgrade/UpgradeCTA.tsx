import { getABVariant } from "@/lib/upgrade/ab";
import { resolveUpgradeCTA } from "@/lib/upgrade/ctaVariants";
import { trackUpgradeClick } from "@/lib/upgrade/track";

type Props = {
  context: {
    hasSnapshotPlus: boolean;
    hasBlueprint: boolean;
    primaryPillar: string;
  };
};

export function UpgradeCTA({ context }: Props) {
  const config = resolveUpgradeCTA(context);
  if (!config) return null;

  const variant = getABVariant(config.testId);
  const cta = variant === "A" ? config.variantA : config.variantB;

  return (
    <a
      href={cta.href}
      onClick={() =>
        trackUpgradeClick({
          testId: config.testId,
          variant,
          pillar: context.primaryPillar,
        })
      }
      className="inline-block mt-6 px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-blueHover transition"
    >
      {cta.label}
    </a>
  );
}
