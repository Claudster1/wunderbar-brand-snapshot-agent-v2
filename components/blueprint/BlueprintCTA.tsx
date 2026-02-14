// components/blueprint/BlueprintCTA.tsx
// Blueprint CTA component for primary pillar

import { PillarKey } from "@/types/pillars";

export function BlueprintCTA({
  brandName,
  primaryPillar,
}: {
  brandName: string;
  primaryPillar: PillarKey;
}) {
  return (
    <div className="mt-8 rounded-xl bg-brand-navy text-white p-8">
      <h2 className="text-2xl font-semibold mb-3">
        Ready to activate what you've uncovered?
      </h2>

      <p className="mb-6">
        Blueprint™ builds directly on your Snapshot+™ insights — especially
        around <strong>{primaryPillar}</strong> — and turns them into a usable,
        repeatable brand system for {brandName}.
      </p>

      <a
        href="/blueprint"
        className="inline-block px-6 py-3 bg-brand-blue rounded-md font-semibold"
      >
        Explore WunderBrand Blueprint™ →
      </a>
    </div>
  );
}
