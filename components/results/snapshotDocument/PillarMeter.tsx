"use client";

import { useEffect, useState } from "react";
import { NAVY, scoreColor } from "./tokens";

export function PillarMeter({
  score,
  maxScore = 20,
  label,
}: {
  score: number;
  maxScore?: number;
  label: string;
}) {
  const percent = Math.max(0, Math.min(100, (score / maxScore) * 100));
  const color = scoreColor(percent);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setWidth(percent), 100);
    return () => window.clearTimeout(timer);
  }, [percent]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 900, color }}>
          {score}
          <span style={{ fontWeight: 700 }}>/{maxScore}</span>
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 5, background: "#E2E8F0", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 5,
            background: "linear-gradient(90deg, #EF4444 0%, #F97316 25%, #EAB308 50%, #4ADE80 75%, #16A34A 100%)",
            backgroundSize: `${100 / (width / 100 || 0.01)}% 100%`,
            width: `${width}%`,
            transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
  );
}
