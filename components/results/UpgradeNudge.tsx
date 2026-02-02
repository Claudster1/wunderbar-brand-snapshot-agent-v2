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
    <div className="mt-8 bs-card rounded-xl border-2 border-brand-blue bg-brand-light/80 p-6">
      <h3 className="bs-h4 mb-2">{copy.headline}</h3>

      <p className="bs-body-sm mb-3 text-brand-midnight">{copy.body}</p>

      <p className="bs-body-sm mb-4 text-brand-midnight">{copy.detail}</p>

      <p className="bs-small mb-4 text-brand-muted">{copy.note}</p>

      <a
        href={`/snapshot-plus?focus=${primaryPillar}`}
        onClick={() => {
          trackEvent("UPGRADE_CLICKED", {
            target: "Snapshot+",
            primaryPillar,
          });
          trackUpgradeNudgeClick(primaryPillar);
        }}
        className="btn-primary"
      >
        {copy.ctaLabel}
      </a>
    </div>
  );
}
