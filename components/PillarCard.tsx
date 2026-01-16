// components/PillarCard.tsx
// Pillar card component with progressive disclosure

interface PillarCardProps {
  pillar: string;
  score: number;
  isPrimary: boolean;
  insight: string;
  whyItMatters: string;
}

export function PillarCard({
  pillar,
  score,
  isPrimary,
  insight,
  whyItMatters
}: PillarCardProps) {
  return (
    <div className={`card ${isPrimary ? "border-accent" : ""}`}>
      <header className="flex justify-between items-center">
        <h3 className="font-medium">{pillar}</h3>
        <span className="pill-score">{score}/20</span>
      </header>

      {!isPrimary && (
        <p className="text-xs text-muted mt-1">
          Why this matters: {whyItMatters}
        </p>
      )}

      {isPrimary && (
        <div className="mt-4">
          <p>{insight}</p>
        </div>
      )}
    </div>
  );
}
