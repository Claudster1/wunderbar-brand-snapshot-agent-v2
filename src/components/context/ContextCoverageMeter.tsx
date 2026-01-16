// src/components/context/ContextCoverageMeter.tsx
// Visual meter component for displaying context coverage percentage

export function ContextCoverageMeter({ percent }: { percent: number }) {
  return (
    <div className="mt-6">
      <div className="flex justify-between text-sm mb-1">
        <span>Context Coverage</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className="h-2 rounded bg-brand-blue"
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent < 80 && (
        <p className="text-xs text-gray-500 mt-2">
          Deeper inputs unlock sharper insights in Snapshot+™
        </p>
      )}
    </div>
  );
}
