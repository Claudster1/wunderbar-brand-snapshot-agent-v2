// components/results/SnapshotUpgradeCTA.tsx

import { getUpgradeCopy } from "@/src/lib/upgrade/ctaCopy";
import { PillarKey } from "@/types/pillars";

interface Props {
  primaryPillar: PillarKey;
  stage: "early" | "scaling" | "growing";
  businessName: string;
}

export function SnapshotUpgradeCTA({
  primaryPillar,
  stage,
  businessName,
}: Props) {
  // Convert "growing" to "scaling" for the copy function
  const copyStage = stage === "growing" ? "scaling" : stage;
  const copy = getUpgradeCopy(primaryPillar, copyStage, businessName);

  return (
    <section className="bg-brand-navy text-white rounded-2xl p-10 text-center space-y-4">
      <h2 className="text-2xl font-semibold">
        Continue Strengthening Your Brand with Snapshot+™
      </h2>
      <p className="max-w-xl mx-auto">{copy.body}</p>

      <a
        href="/snapshot-plus"
        className="inline-block mt-4 px-8 py-4 bg-brand-blue rounded-md font-semibold"
      >
        Take it further with Snapshot+™ →
      </a>
    </section>
  );
}
