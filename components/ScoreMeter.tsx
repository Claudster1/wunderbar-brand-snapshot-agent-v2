// components/ScoreMeter.tsx
// Animated score meter with gradient and label

"use client";

import { useEffect, useState } from "react";

interface ScoreMeterProps {
  score: number;
}

export function ScoreMeter({ score }: ScoreMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [meterWidth, setMeterWidth] = useState(0);

  useEffect(() => {
    // Animate score number
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, score);
      setAnimatedScore(Math.round(current));
      setMeterWidth((current / 100) * 100);

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedScore(score);
        setMeterWidth((score / 100) * 100);
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
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-brand-blue to-brand-aqua";
    if (score >= 40) return "from-yellow-400 to-amber-500";
    return "from-red-400 to-rose-500";
  };

  return (
    <div className="animate-fade-in-up animation-delay-200 mb-12">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        {/* Score Number */}
        <div className="text-center mb-6">
          <div className="text-6xl md:text-7xl font-bold text-brand-navy mb-2">
            {animatedScore}
          </div>
          <div className="text-xl text-slate-600 font-medium">
            {getScoreLabel(score)}
          </div>
          <div className="text-sm text-slate-500 mt-1">Brand Alignment Score™</div>
        </div>

        {/* Animated Meter */}
        <div className="relative">
          <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getScoreColor(
                score
              )} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${meterWidth}%` }}
            />
          </div>
          {/* Meter Labels */}
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

