"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { trackUpgradeNudgeClick } from "@/lib/trackUpgradeNudgeClick";

export function UpgradeNudge({
  primaryPillar,
  hasSnapshotPlus,
}: {
  primaryPillar: string;
  hasSnapshotPlus: boolean;
}) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      trackEvent("UPGRADE_ABANDONED", {
        target: "Snapshot+",
      });
    }, 60000);

    return () => clearTimeout(timeoutId);
  }, []);

  if (hasSnapshotPlus) return null;

  return (
    <div className="mt-8 border border-brand-blue bg-blue-50 p-6 rounded-lg">
      <h3 className="font-semibold mb-2">
        Want deeper clarity on {primaryPillar}?
      </h3>

      <p className="text-sm mb-4">
        Snapshot+™ expands this area with detailed insights, examples, and
        prioritized actions tailored to your brand.
      </p>

      <a
        href={`/snapshot-plus?focus=${primaryPillar}`}
        onClick={() => {
          trackEvent("UPGRADE_CLICKED", {
            target: "Snapshot+",
            primaryPillar,
          });
          trackUpgradeNudgeClick(primaryPillar);
        }}
        className="inline-block text-sm text-white bg-brand-blue px-4 py-2 rounded"
      >
        Unlock Snapshot+™ →
      </a>
    </div>
  );
}
