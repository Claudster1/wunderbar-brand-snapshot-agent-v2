// src/pdf/components/ScoreGaugePDF.tsx
// PDF score gauge component for Brand Alignment Score (0-100)

import { ScoreGauge } from "./ScoreGauge";

interface ScoreGaugePDFProps {
  score: number; // 0-100 for Brand Alignment Score
}

export function ScoreGaugePDF({ score }: ScoreGaugePDFProps) {
  return <ScoreGauge value={score} />;
}
