type Props = {
  recommendations: string[];
  primaryPillar: string;
};

function estimateTime(index: number): string {
  if (index === 0) return "4-6 hours";
  if (index === 1) return "6-8 hours";
  return "8-12 hours";
}

export function ExecutionStrategicPriorities({ recommendations, primaryPillar }: Props) {
  const priorities = recommendations.slice(0, 3);

  return (
    <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
      <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-2">
        Strategic Priorities
      </p>
      <h2 className="bs-h3 mb-2">What to do first</h2>
      <p className="bs-body-sm text-brand-muted max-w-3xl mb-4">
        Ranked priorities are pulled from your diagnostic outputs and ordered for implementation momentum.
      </p>
      <div className="space-y-3">
        {priorities.map((item, idx) => (
          <article key={`${idx}-${item.slice(0, 20)}`} className="rounded-lg border border-brand-border p-4">
            <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-1">
              Priority {idx + 1}
            </p>
            <p className="bs-body-sm text-brand-midnight">{item}</p>
            <p className="bs-small text-brand-muted mt-2">
              Pillar impact: {primaryPillar} · Estimated effort: {estimateTime(idx)}
            </p>
            {idx === 1 && (
              <p className="bs-small text-brand-muted mt-1">
                Sequence note: Priority 2 typically increases effectiveness of Priority 3.
              </p>
            )}
          </article>
        ))}
        {priorities.length === 0 && (
          <p className="bs-body-sm text-brand-muted">
            No priorities are available yet. Run or refresh your diagnostic to populate this section.
          </p>
        )}
      </div>
    </section>
  );
}
