"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { trackUpgradeNudgeClick } from "@/lib/trackUpgradeNudgeClick";
import { getUpgradeNudgeCopy } from "@/lib/upgrade/ctaCopy";

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

  const copy = getUpgradeNudgeCopy({ primaryPillar });

  return (
    <div className="mt-8 border border-brand-blue bg-blue-50 p-6 rounded-lg">
      <h3 className="font-semibold mb-2">{copy.headline}</h3>

      <p className="text-sm mb-3">{copy.body}</p>

      <p className="text-sm mb-4">{copy.detail}</p>

      <p className="text-xs text-slate-600 mb-4">{copy.note}</p>

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
        {copy.ctaLabel}
      </a>
    </div>
  );
}
