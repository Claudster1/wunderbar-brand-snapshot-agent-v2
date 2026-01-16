// components/dashboard/DashboardHistoryItem.tsx

import { trackEvent } from "@/lib/activeCampaignTracking";

type Props = {
  snapshotId: string;
  brandName: string;
  primaryPillar: string;
};

export function DashboardHistoryItem({
  snapshotId,
  brandName,
  primaryPillar,
}: Props) {
  return (
    <div className="rounded-xl border border-brand-border p-6 bg-white">
      <h4 className="text-lg font-semibold text-brand-navy">
        {brandName}
      </h4>

      <p className="text-sm text-brand-midnight mt-1">
        Primary focus area: <strong>{primaryPillar}</strong>
      </p>

      {/* Primary action */}
      <a
        href={`/results/${snapshotId}`}
        className="inline-block mt-4 btn-secondary"
      >
        View Results →
      </a>

      {/* Secondary CTA */}
      <div className="mt-3">
        <a
          href="/brand-snapshot-suite"
          onClick={() =>
            trackEvent("suite_explore_clicked", {
              source: "dashboard_history",
              snapshotId,
              primaryPillar,
            })
          }
          className="text-sm font-medium text-brand-blue hover:underline underline-offset-4"
        >
          Explore the Brand Snapshot Suite →
        </a>
      </div>
    </div>
  );
}
