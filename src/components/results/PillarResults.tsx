// components/results/PillarResults.tsx

import { PillarPanel } from "./PillarPanel";
import { PillarKey } from "@/types/pillars";

interface Props {
  pillarScores: Record<PillarKey, number>;
  pillarInsights: Record<PillarKey, string>;
  primaryPillar: PillarKey;
  stage: "early" | "scaling" | "growing";
  businessName: string;
}

export function PillarResults({
  pillarScores,
  pillarInsights,
  primaryPillar,
  stage,
  businessName,
}: Props) {
  return (
    <section className="space-y-4">
      {Object.keys(pillarScores).map(pillar => (
        <PillarPanel
          key={pillar}
          pillar={pillar}
          score={pillarScores[pillar as PillarKey]}
          insight={pillarInsights[pillar as PillarKey]}
          expanded={pillar === primaryPillar}
          stage={stage}
          businessName={businessName}
        />
      ))}
    </section>
  );
}
