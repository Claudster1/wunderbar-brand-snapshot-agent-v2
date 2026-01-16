// components/results/ContextCoverageMeter.tsx
// Simple context coverage meter component

type Props = {
  value: number; // 0–100
};

export function ContextCoverageMeter({ value }: Props) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>Context Coverage</span>
        <span>{value}%</span>
      </div>

      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-slate-700 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
