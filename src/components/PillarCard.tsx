// src/components/PillarCard.tsx
// Simple pillar card component

interface PillarProps {
  title: string;
  score: number;
  summary: string;
}

export function PillarCard({ title, score, summary }: PillarProps) {
  return (
    <div className="border border-brand-border rounded-xl p-6 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-brand-navy">{title}</h4>
        <span className="text-sm font-semibold text-brand-blue">{score}/20</span>
      </div>

      <p className="text-sm text-brand-midnight leading-relaxed">
        {summary}
      </p>

      <p className="mt-4 text-xs text-brand-midnight/70">
        This pillar contributes directly to your overall Brand Alignment Score™.
      </p>
    </div>
  );
}
