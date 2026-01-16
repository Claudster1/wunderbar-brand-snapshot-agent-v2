// src/components/results/ContextCoverageMeter.tsx
// Context Coverage Meter for results page

interface ContextCoverageMeterProps {
  coveragePercent: number; // 0-100
}

export function ContextCoverageMeter({ coveragePercent }: ContextCoverageMeterProps) {
  return (
    <section className="bg-gray-50 rounded-xl p-6">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-brand-navy">
          Context Coverage
        </span>
        <span className="text-sm text-gray-600">
          {coveragePercent}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full bg-brand-blue transition-all"
          style={{ width: `${coveragePercent}%` }}
        />
      </div>
      {coveragePercent < 80 && (
        <p className="text-xs text-gray-500 mt-2">
          Deeper inputs unlock sharper insights in Snapshot+™
        </p>
      )}
    </section>
  );
}
