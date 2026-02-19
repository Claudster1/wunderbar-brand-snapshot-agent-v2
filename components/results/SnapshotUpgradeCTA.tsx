// components/results/SnapshotUpgradeCTA.tsx
// Upgrade CTA for Snapshot+ based on primary pillar

type Props = {
  primaryPillar: string;
  stage: "early" | "scaling" | "established";
};

export function SnapshotUpgradeCTA({ primaryPillar, stage }: Props) {
  return (
    <div className="rounded-xl border border-slate-900 bg-slate-900 p-8 text-white">
      <h3 className="text-xl font-semibold mb-2">
        Want deeper clarity around {primaryPillar}?
      </h3>

      <p className="text-sm text-slate-200 mb-4">
        Snapshot+™ expands this insight with strategic depth,
        prioritization, and next-step guidance tailored to your stage.
      </p>

      <a
        href="/snapshot-plus"
        className="inline-block rounded-md bg-white px-5 py-3 text-sm font-medium text-slate-900"
      >
        Take it further with Snapshot+™
      </a>
    </div>
  );
}
