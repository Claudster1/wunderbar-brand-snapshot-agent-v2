// src/components/context/ContextCoverageMeter.tsx
// Visual meter component for displaying context coverage

import { ContextCoverage } from "@/lib/context/contextCoverage";

export function ContextCoverageMeter({
  coverage,
}: {
  coverage: ContextCoverage;
}) {
  return (
    <div className="border rounded-xl p-6 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-brand-navy">Context Coverage</h4>
        <span className="text-sm text-slate-600">
          {coverage.completed}/{coverage.total}
        </span>
      </div>

      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-brand-blue transition-all"
          style={{ width: `${coverage.percentage}%` }}
        />
      </div>

      <p className="text-sm text-slate-600">
        {coverage.percentage}% of context captured
      </p>

      {coverage.missing.length > 0 && (
        <p className="text-xs text-slate-500 mt-2">
          More detail unlocks deeper insights.
        </p>
      )}
    </div>
  );
}
