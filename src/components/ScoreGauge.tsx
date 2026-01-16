// src/components/ScoreGauge.tsx
// SVG gauge component for displaying scores (0-100)

export function ScoreGauge({ value }: { value: number }) {
  const angle = (value / 100) * 180;
  return (
    <svg viewBox="0 0 200 100" width="100%">
      <path d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke="#E5E7EB" strokeWidth="12"/>
      <path
        d="M10 100 A90 90 0 0 1 190 100"
        fill="none"
        stroke="#16A34A"
        strokeWidth="12"
        strokeDasharray={`${angle * 2.5} 999`}
      />
      <text x="100" y="80" textAnchor="middle" fontSize="24" fontWeight="600">
        {value}
      </text>
    </svg>
  );
}
