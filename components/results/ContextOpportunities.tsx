// components/results/ContextOpportunities.tsx
// Component displaying context gaps where deeper information could unlock more value

type Props = {
  gaps: string[];
};

export function ContextOpportunities({ gaps }: Props) {
  if (!gaps.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="font-medium text-slate-900 mb-2">
        Where deeper context could unlock more value
      </h3>

      <ul className="text-sm text-slate-700 space-y-1">
        {gaps.map((gap) => (
          <li key={gap}>• {gap}</li>
        ))}
      </ul>

      <p className="mt-3 text-slate-600">
        Adding context here strengthens precision across recommendations.
      </p>
    </div>
  );
}
