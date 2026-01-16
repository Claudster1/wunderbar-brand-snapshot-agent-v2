// components/results/ContextOpportunity.tsx
// Component displaying context gaps where deeper information could unlock more value

export function ContextOpportunity({
  gaps,
}: {
  gaps: string[];
}) {
  if (!gaps.length) return null;

  return (
    <div className="rounded-lg border border-brand-blue/30 bg-brand-blue/5 p-5">
      <h4 className="font-semibold text-brand-navy mb-2">
        Where deeper context could unlock more value
      </h4>

      <p className="text-sm text-slate-700 mb-3">
        If you'd like even more precise recommendations, adding context around
        the areas below would allow us to go deeper:
      </p>

      <ul className="list-disc pl-5 text-sm text-slate-700">
        {gaps.map((gap) => (
          <li key={gap}>{gap}</li>
        ))}
      </ul>
    </div>
  );
}
