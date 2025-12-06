// components/SnapshotScore.tsx
// Component to display Brand Alignment Score with gauge

"use client";

interface SnapshotScoreProps {
  score: number;
}

export function SnapshotScore({ score }: SnapshotScoreProps) {
  const getScoreLabel = (score: number): string => {
    if (score >= 80) return "Excellent Alignment";
    if (score >= 60) return "Strong Foundation";
    if (score >= 40) return "Developing Brand";
    return "Needs Focus";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#22c55e"; // green
    if (score >= 60) return "#07b0f2"; // blue
    if (score >= 40) return "#facc15"; // yellow
    return "#f97373"; // red
  };

  // Calculate gauge circumference and offset
  const circumference = 2 * Math.PI * 85; // r=85
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="mt-8 mb-10">
      <h2 className="text-xl font-semibold text-brand-navy mb-4">
        Brand Alignment Score™
      </h2>
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Circular Gauge */}
          <svg
            className="transform -rotate-90"
            width="200"
            height="200"
            viewBox="0 0 200 200"
          >
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            {/* Fill */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={getScoreColor(score)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: "stroke-dashoffset 0.6s ease",
              }}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: "#f97373", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "#facc15", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#22c55e", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-brand-navy">{score}</div>
            <div className="text-sm text-slate-600 mt-1">{getScoreLabel(score)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

