// src/pdf/components/ScoreGaugePDF.tsx
// PDF score gauge component for WunderBrand Score™ (0-100)

import { ScoreGauge } from "./ScoreGauge";

interface ScoreGaugePDFProps {
  score: number; // 0-100 for WunderBrand Score™
}

export function ScoreGaugePDF({ score }: ScoreGaugePDFProps) {
  return <ScoreGauge score={score} />;
}
