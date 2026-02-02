// Score breakdown section: section title + grid of compact pillar cards (sample-style)

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

export function PillarCardGrid({
  pillarScores,
  pillarInsights,
}: PillarCardGridProps) {
  return (
    <section className="space-y-4 pt-6 border-t border-brand-border">
      <div className="flex items-center gap-2">
        <h2 className="bs-h2 mb-0">
          Score breakdown
        </h2>
        <TooltipIcon
          content={
            <>
              Each pillar is scored 0–20. Strong (green) = strength; Critical opportunity (red) = biggest leverage. Use these to prioritize next steps.
            </>
          }
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PILLAR_ORDER.map(({ key, label }) => (
          <PillarCardCompact
            key={key}
            pillar={key}
            pillarLabel={label}
            score={pillarScores[key] ?? 0}
            insight={pillarInsights[key] ?? ""}
          />
        ))}
      </div>
    </section>
  );
}
