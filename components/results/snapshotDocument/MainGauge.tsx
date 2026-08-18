"use client";

import { useEffect, useState } from "react";
import { GOOD_GREEN, GREEN, NAVY, ORANGE, RED_S, SUB, WHITE, YELLOW } from "./tokens";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1200, 1);
      setDisplay(Math.round((1 - Math.pow(1 - progress, 3)) * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
}

export function MainGauge({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, score));
  const [animatedScore, setAnimatedScore] = useState(0);
  const width = 280;
  const strokeWidth = 24;
  const radius = 90;
  const centerX = width / 2;
  const centerY = radius + strokeWidth / 2 + 22;
  const svgHeight = centerY + 8;

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1400, 1);
      setAnimatedScore((1 - Math.pow(1 - progress, 3)) * safeScore);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [safeScore]);

  const point = (degrees: number, pointRadius: number) => {
    const radians = (degrees * Math.PI) / 180;
    return {
      x: Math.round((centerX + pointRadius * Math.cos(radians)) * 100) / 100,
      y: Math.round((centerY - pointRadius * Math.sin(radians)) * 100) / 100,
    };
  };
  const stops: [number, number[]][] = [
    [0, [239, 68, 68]],
    [0.25, [249, 115, 22]],
    [0.45, [234, 179, 8]],
    [0.65, [74, 222, 128]],
    [1, [22, 128, 61]],
  ];
  const getColor = (value: number) => {
    let index = 0;
    for (let candidate = 1; candidate < stops.length; candidate += 1) {
      if (value <= stops[candidate][0]) {
        index = candidate - 1;
        break;
      }
    }
    if (value >= 1) index = stops.length - 2;
    const [startAt, startColor] = stops[index];
    const [endAt, endColor] = stops[index + 1];
    const fraction = (value - startAt) / (endAt - startAt);
    return `rgb(${Math.round(startColor[0] + (endColor[0] - startColor[0]) * fraction)},${Math.round(startColor[1] + (endColor[1] - startColor[1]) * fraction)},${Math.round(startColor[2] + (endColor[2] - startColor[2]) * fraction)})`;
  };
  const segments = Array.from({ length: 60 }, (_, index) => {
    const firstAngle = 180 - (index / 60) * 180;
    const secondAngle = 180 - ((index + 1) / 60) * 180;
    const first = point(firstAngle, radius);
    const second = point(secondAngle, radius);
    return {
      path: `M${first.x.toFixed(2)},${first.y.toFixed(2)} A${radius},${radius} 0 0 0 ${second.x.toFixed(2)},${second.y.toFixed(2)}`,
      color: getColor((index + 0.5) / 60),
    };
  });
  const needleAngle = 180 - (animatedScore / 100) * 180;
  const needleTip = point(needleAngle, radius);
  const needleBaseOne = point(needleAngle + 90, 2.5);
  const needleBaseTwo = point(needleAngle - 90, 2.5);
  const needleTail = point(needleAngle + 180, 14);
  const ranges = [
    { label: "Critical", min: 0, max: 19, color: RED_S },
    { label: "Weak", min: 20, max: 39, color: ORANGE },
    { label: "Fair", min: 40, max: 59, color: YELLOW },
    { label: "Good", min: 60, max: 79, color: GOOD_GREEN },
    { label: "Strong", min: 80, max: 100, color: GREEN },
  ];

  return (
    <div data-snapshot-gauge-row style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width={width} height={svgHeight} viewBox={`0 0 ${width} ${svgHeight}`} aria-label={`WunderBrand Score ${safeScore} out of 100`}>
          {segments.map((segment, index) => (
            <path key={index} d={segment.path} fill="none" stroke={segment.color} strokeWidth={strokeWidth} />
          ))}
          <circle cx={point(180, radius).x} cy={point(180, radius).y} r={strokeWidth / 2} fill={getColor(0)} />
          <circle cx={point(0, radius).x} cy={point(0, radius).y} r={strokeWidth / 2} fill={getColor(1)} />
          {[0, 20, 40, 60, 80, 100].map((tick) => {
            const labelPoint = point(180 - (tick / 100) * 180, radius + strokeWidth / 2 + 14);
            return <text key={tick} x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" fill="#94A3B8" fontSize="10" fontFamily="Lato, sans-serif" fontWeight="700">{tick}</text>;
          })}
          <polygon points={`${needleTip.x},${needleTip.y} ${needleBaseOne.x},${needleBaseOne.y} ${needleTail.x},${needleTail.y} ${needleBaseTwo.x},${needleBaseTwo.y}`} fill={NAVY} />
          <circle cx={centerX} cy={centerY} r={5} fill={NAVY} />
          <circle cx={centerX} cy={centerY} r={2} fill={WHITE} />
        </svg>
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <div style={{ fontSize: 50, fontWeight: 900, color: NAVY, lineHeight: 1 }}>
            <AnimatedNumber value={safeScore} />
          </div>
          <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>out of 100</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {ranges.map((range) => {
          const active = safeScore >= range.min && safeScore <= range.max;
          return (
            <div key={range.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 5, background: active ? `${range.color}12` : "transparent", border: active ? `2px solid ${range.color}35` : "2px solid transparent" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: range.color }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: active ? range.color : SUB, minWidth: 56 }}>{range.label}</span>
              <span style={{ fontSize: 14, color: SUB, opacity: 0.55 }}>{range.min}–{range.max}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
