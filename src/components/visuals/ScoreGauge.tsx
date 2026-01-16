// src/components/visuals/ScoreGauge.tsx
// Semicircular score gauge component

import { scoreToColor, scoreToAngle } from "@/lib/visuals/scoreGauge";

export function ScoreGauge({ score }: { score: number }) {
  const angle = scoreToAngle(score);
  const color = scoreToColor(score);

  return (
    <svg width="180" height="100" viewBox="0 0 180 100">
      <path
        d="M10 90 A80 80 0 0 1 170 90"
        stroke="#E5E7EB"
        strokeWidth="10"
        fill="none"
      />
      <path
        d="M10 90 A80 80 0 0 1 170 90"
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeDasharray={`${angle * 1.4} 300`}
      />
      <text
        x="90"
        y="75"
        textAnchor="middle"
        fontSize="18"
        fontWeight="600"
      >
        {score}/20
      </text>
    </svg>
  );
}
