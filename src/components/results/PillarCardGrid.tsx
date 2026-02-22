import { PillarCardCompact } from "@/src/components/results/PillarCardCompact";
import { TooltipIcon } from "@/components/ui/Tooltip";
import type { PillarKey } from "@/src/types/pillars";

const PILLAR_ORDER: { key: PillarKey; label: string }[] = [
  { key: "positioning", label: "Positioning" },
  { key: "messaging", label: "Messaging" },
  { key: "visibility", label: "Visibility" },
  { key: "credibility", label: "Credibility" },
  { key: "conversion", label: "Conversion" },
];

interface PillarCardGridProps {
  pillarScores: Record<PillarKey, number>;
  pillarInsights: Record<PillarKey, string>;
}

function getPrimaryPillarKey(scores: Record<PillarKey, number>): PillarKey {
  let lowest: PillarKey = "positioning";
  let lowestScore = Infinity;
  for (const key of Object.keys(scores) as PillarKey[]) {
    if (scores[key] < lowestScore) {
      lowestScore = scores[key];
      lowest = key;
    }
  }
  return lowest;
}

export function PillarCardGrid({
  pillarScores,
  pillarInsights,
}: PillarCardGridProps) {
  const primaryOpportunity = getPrimaryPillarKey(pillarScores);

  return (
    <section className="space-y-4 pt-6 border-t border-brand-border">
      <div className="flex items-center gap-2">
        <h2 className="bs-h2 mb-0">
          Pillar-by-pillar analysis
        </h2>
        <TooltipIcon
          content={
            <>
              Each pillar is scored 0–20 based on the inputs you provided. The pillar marked as your primary opportunity is where focused improvement will create the most cascading impact across your brand.
            </>
          }
        />
      </div>
      <p className="bs-body-sm text-brand-muted max-w-2xl">
        Your brand is evaluated across five interdependent pillars. Improving one often lifts the others — start with your primary opportunity for maximum leverage.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {PILLAR_ORDER.map(({ key, label }) => (
          <PillarCardCompact
            key={key}
            pillar={key}
            pillarLabel={label}
            score={pillarScores[key] ?? 0}
            insight={pillarInsights[key] ?? ""}
            isPrimaryOpportunity={key === primaryOpportunity}
          />
        ))}
      </div>
    </section>
  );
}
