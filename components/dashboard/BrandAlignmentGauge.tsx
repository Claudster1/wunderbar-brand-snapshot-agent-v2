// components/dashboard/BrandAlignmentGauge.tsx
"use client";

import { useEffect, useState } from "react";

interface BrandAlignmentGaugeProps {
  score: number;
}

export function BrandAlignmentGauge({ score }: BrandAlignmentGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, score);
      setAnimatedScore(Math.round(current));

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedScore(score);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return "Excellent Alignment";
    if (score >= 60) return "Strong Foundation";
    if (score >= 40) return "Developing Brand";
    return "Needs Focus";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#22c55e"; // green
    if (score >= 60) return "#07B0F2"; // blue
    if (score >= 40) return "#facc15"; // yellow
    return "#f97373"; // red
  };

  // Circular gauge
  const circumference = 2 * Math.PI * 85; // r=85
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="85"
            stroke="#E0E3EA"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="96"
            cy="96"
            r="85"
            stroke={getScoreColor(score)}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center px-4 py-2">
          <div className="max-w-[9.5rem] text-center">
            <div className="text-4xl font-bold leading-none text-[#021859]">
              {animatedScore}
            </div>
            <div className="mt-2 text-sm leading-snug text-slate-600">
              {getScoreLabel(score)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
