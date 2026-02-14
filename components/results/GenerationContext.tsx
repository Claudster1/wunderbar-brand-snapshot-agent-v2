// components/results/GenerationContext.tsx
// Component explaining how the WunderBrand Snapshot™ report was generated

type Props = {
  coveragePercent?: number;
};

export function GenerationContext({ coveragePercent }: Props) {
  return (
    <div className="mt-10 rounded-xl border border-slate-200 p-6 text-sm">
      <h4 className="font-medium text-slate-900 mb-2">
        How this report was generated
      </h4>

      <p className="text-slate-700 mb-3">
        Your WunderBrand Snapshot™ is based entirely on the information you shared.
        Insights reflect current brand signals — not assumptions or guesses.
      </p>

      {typeof coveragePercent === "number" && (
        <p className="text-slate-600">
          Context coverage: <strong>{coveragePercent}%</strong>
        </p>
      )}

      <p className="text-xs text-slate-600 mt-4">
        You've already completed the hard part — your WunderBrand Snapshot™.
        Everything in your report reflects what you shared, and you can return anytime
        to explore deeper context or expand your strategy.
      </p>
    </div>
  );
}
