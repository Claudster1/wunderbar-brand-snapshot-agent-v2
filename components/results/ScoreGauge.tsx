// components/results/ScoreGauge.tsx
// Circular score gauge component for web UI

interface ScoreGaugeProps {
  score: number; // 0–20
  size?: number;
}

export function ScoreGauge({ score, size = 64 }: ScoreGaugeProps) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 20) * circumference;
  const percent = (score / 20) * 100;

  const strokeColor =
    percent >= 80
      ? "#16A34A" // green
      : percent >= 60
      ? "#84CC16" // yellow-green
      : percent >= 40
      ? "#F59E0B" // amber
      : "#D97706"; // muted warning

  return (
    <div className="flex-shrink-0 relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={6}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={6}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      {/* Score text overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ width: size, height: size }}
      >
        <span className="text-sm font-semibold text-brand-navy">
          {score}/20
        </span>
      </div>
    </div>
  );
}
