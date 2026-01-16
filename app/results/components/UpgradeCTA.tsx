// app/results/components/UpgradeCTA.tsx

type Props = {
  primaryPillar: string;
  coverageGap: boolean;
};

export function UpgradeCTA({ primaryPillar, coverageGap }: Props) {
  if (!coverageGap) return null;

  return (
    <div className="mt-6 p-5 border rounded-lg bg-blue-50">
      <p className="font-medium">
        Want deeper clarity in {primaryPillar}?
      </p>
      <p className="text-sm mt-1">
        Snapshot+™ unlocks a more complete strategic analysis.
      </p>

      <a
        href="/upgrade/snapshot-plus"
        className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded"
      >
        See how to strengthen what matters most right now
      </a>
    </div>
  );
}
