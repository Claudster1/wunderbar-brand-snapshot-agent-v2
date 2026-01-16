// app/results/components/CoverageMeter.tsx

export function CoverageMeter({ percent }: { percent: number }) {
  return (
    <div>
      <p>Context Coverage</p>
      <div className="meter">
        <div className="fill" style={{ width: `${percent}%` }} />
      </div>
      {percent < 80 && (
        <p>
          We could go deeper with more context. Snapshot+™ unlocks
          advanced enrichment.
        </p>
      )}
    </div>
  );
}
