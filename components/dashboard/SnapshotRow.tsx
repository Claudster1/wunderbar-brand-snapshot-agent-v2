// components/dashboard/SnapshotRow.tsx
// Component for displaying a single snapshot in the history list

import { getUpgradeNudge } from "@/lib/upgradeNudgeLogic";

interface SnapshotRowProps {
  snapshot: {
    id: string;
    brand_name?: string;
    brand_alignment_score?: number;
    primary_pillar?: string;
    context_coverage?: number;
    snapshot_stage?: string;
  };
}

export function SnapshotRow({ snapshot }: SnapshotRowProps) {
  const nudge = getUpgradeNudge({
    brand_alignment_score: snapshot.brand_alignment_score || 0,
    primary_pillar: snapshot.primary_pillar || "",
    context_coverage: snapshot.context_coverage || 0,
  });

  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{snapshot.brand_name}</h4>
          <p className="text-xs text-muted">
            WunderBrand Score™: {snapshot.brand_alignment_score}
          </p>
        </div>

        <a
          href={`/results/${snapshot.id}`}
          className="btn-secondary"
        >
          View Results
        </a>
      </div>

      {nudge && (
        <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4">
          <p className="text-sm font-medium">{nudge.title}</p>
          <p className="text-sm text-muted mt-1">{nudge.body}</p>

          <a
            href={nudge.href}
            className="inline-block mt-3 btn-primary"
          >
            {nudge.ctaLabel}
          </a>
        </div>
      )}
    </div>
  );
}
