// components/pillars/PillarGauge.tsx
// Visual score gauge component for scores (supports both pillar scores 0-20 and brand alignment 0-100)

export function PillarGauge({ 
  score, 
  max = 20 
}: { 
  score: number;
  max?: number;
}) {
  const percent = (score / max) * 100;

  return (
    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full transition-all"
        style={{
          width: `${percent}%`,
          background:
            percent >= 80
              ? '#22c55e'
              : percent >= 60
              ? '#84cc16'
              : percent >= 40
              ? '#f59e0b'
              : '#ef4444',
        }}
      />
    </div>
  );
}
