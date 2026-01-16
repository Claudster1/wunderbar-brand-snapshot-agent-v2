// src/pdf/components/ScoreGauge.tsx
// Semicircular gauge component for React-PDF

import { Svg, Path, Circle, Text } from "@react-pdf/renderer";

export function ScoreGauge({
  score,
  max = 100,
  label
}: {
  score: number;
  max?: number;
  label?: string;
}) {
  const normalizedScore = Math.min(Math.max(score, 0), max);
  const angle = (normalizedScore / max) * 180;

  return (
    <Svg width={200} height={120}>
      <Path
        d="M20 100 A80 80 0 0 1 180 100"
        stroke="#E5E7EB"
        strokeWidth={10}
        fill="none"
      />
      <Path
        d={`M20 100 A80 80 0 ${angle > 90 ? 1 : 0} 1 ${
          20 + 160 * Math.cos((Math.PI * (180 - angle)) / 180)
        } ${
          100 - 80 * Math.sin((Math.PI * angle) / 180)
        }`}
        stroke="#07B0F2"
        strokeWidth={10}
        fill="none"
      />
      <Circle cx={100} cy={100} r={4} fill="#021859" />
      <Text x={90} y={115} style={{ fontSize: 14 }}>
        {normalizedScore}
      </Text>
      {label && (
        <Text x={100} y={130} textAnchor="middle" style={{ fontSize: 10 }}>
          {label}
        </Text>
      )}
    </Svg>
  );
}
