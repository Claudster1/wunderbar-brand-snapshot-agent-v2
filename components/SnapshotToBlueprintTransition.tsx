// components/SnapshotToBlueprintTransition.tsx
// Transition component from Snapshot+™ to Blueprint+™

import { getTrackedCheckoutUrl } from "@/lib/checkoutUrls";

export function SnapshotToBlueprintTransition({
  brandName,
  primaryPillar,
}: {
  brandName: string;
  primaryPillar: string;
}) {
  return (
    <section className="upgrade-block">
      <h3>Activate what matters most for {brandName}</h3>
      <p>
        Your Snapshot+™ shows that <strong>{primaryPillar}</strong> is the most
        important area to address right now. WunderBrand Blueprint+™ turns this
        insight into a fully activated system your brand can actually use.
      </p>
      <a
        href={getTrackedCheckoutUrl({
          product: "blueprint-plus",
          medium: "results_cta",
          content: "snapshot_to_blueprint_plus",
        })}
        className="btn-primary"
      >
        Activate WunderBrand Blueprint+™
      </a>
    </section>
  );
}
