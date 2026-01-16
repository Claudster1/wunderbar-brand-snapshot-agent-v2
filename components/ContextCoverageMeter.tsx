// components/ContextCoverageMeter.tsx
// Context coverage meter component

export function ContextCoverageMeter({ percent }: { percent: number }) {
  return (
    <section className="card">
      <h4 className="font-medium mb-2">Context Coverage</h4>
      <div className="meter">
        <div className="meter-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-muted mt-2">
        Additional context unlocks deeper insight and more specific recommendations.
      </p>
    </section>
  );
}
