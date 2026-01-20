// src/pdf/components/ScoreGauge.tsx
// Circular gauge component for React-PDF

import { Svg, Circle, Path } from "@react-pdf/renderer";

export function ScoreGauge({
  value,
}: {
  value: number;
}) {
  const angle = (value / 100) * 180;

  return (
    <Svg width={120} height={70}>
      <Path
        d="M10 60 A50 50 0 0 1 110 60"
        stroke="#E6EAF2"
        strokeWidth={8}
        fill="none"
      />
      <Path
        d={`M10 60 A50 50 0 0 1 ${
          10 + 100 * Math.cos((Math.PI * (180 - angle)) / 180)
        } ${
          60 - 50 * Math.sin((Math.PI * angle) / 180)
        }`}
        stroke="#07B0F2"
        strokeWidth={8}
        fill="none"
      />
      <Circle cx={60} cy={60} r={4} fill="#07B0F2" />
    </Svg>
  );
}
