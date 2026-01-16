// src/components/CoverageMeter.tsx
// Context Coverage meter component

export function CoverageMeter({ value }: { value: number }) {
  const color =
    value >= 80 ? "#22c55e" : value >= 50 ? "#eab308" : "#f97316";

  return (
    <div className="w-48">
      <div className="text-sm font-medium mb-1">
        Context Coverage
      </div>
      <div className="w-full h-3 bg-gray-200 rounded">
        <div
          className="h-3 rounded"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-xs mt-1 text-gray-600">
        Higher coverage enables more precise insights.
      </p>
    </div>
  );
}
