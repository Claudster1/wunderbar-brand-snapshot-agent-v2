// src/pdf/components/ScoreGauge.tsx
// Circular gauge component for React-PDF

import { Svg, Circle, Text, G } from "@react-pdf/renderer";

interface ScoreGaugeProps {
  score: number; // 0–100
  size?: number;
  emphasis?: "primary" | "secondary" | "tertiary";
}

export function ScoreGauge({
  score,
  size = 120,
  emphasis = "secondary",
}: ScoreGaugeProps) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const strokeWidth =
    emphasis === "primary" ? 10 : emphasis === "secondary" ? 8 : 6;

  const opacity =
    emphasis === "primary" ? 1 : emphasis === "secondary" ? 0.85 : 0.65;

  return (
    <Svg width={size} height={size}>
      <G transform={`translate(${size / 2}, ${size / 2})`}>
        {/* Background */}
        <Circle
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress */}
        <Circle
          r={radius}
          stroke="#07B0F2"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          fill="none"
          opacity={opacity}
          transform="rotate(-90)"
        />

        {/* Score */}
        <Text
          y={6}
          textAnchor="middle"
          fontSize={emphasis === "primary" ? 22 : 18}
          fontWeight="bold"
          fill="#021859"
        >
          {score}
        </Text>
      </G>
    </Svg>
  );
}
