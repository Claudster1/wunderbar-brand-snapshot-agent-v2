// src/components/Gauge.tsx
// SVG gauge component (UI)

export function Gauge({ value }: { value: number }) {
  const rotation = (value / 100) * 180;

  return (
    <svg viewBox="0 0 200 100" width="200">
      <path d="M10,100 A90,90 0 0 1 190,100" fill="none" stroke="#eee" strokeWidth="12"/>
      <path
        d="M10,100 A90,90 0 0 1 190,100"
        fill="none"
        stroke="url(#grad)"
        strokeWidth="12"
        strokeDasharray={`${rotation * 1.57} 999`}
      />
      <defs>
        <linearGradient id="grad">
          <stop offset="0%" stopColor="#22c55e"/>
          <stop offset="100%" stopColor="#eab308"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
