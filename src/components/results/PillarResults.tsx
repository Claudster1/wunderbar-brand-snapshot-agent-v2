// components/results/PillarResults.tsx

import { PillarPanel } from "./PillarPanel";
import { PillarKey } from "@/types/pillars";
import { TooltipIcon } from "@/components/ui/Tooltip";

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
    <section className="space-y-5">
      {/* Score key: what the meter and bands mean */}
      <div className="bs-card rounded-xl bg-brand-bg p-4 mb-2 border-0">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-base sm:text-lg font-bold text-brand-navy">How to read your scores</span>
          <TooltipIcon
            content={
              <>
                Each pillar is scored 0–20. The bar runs from red (needs work) to green (strong). Your dot shows where you land. Use the band under each pillar to see what your score means and your biggest opportunity.
              </>
            }
          />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2.5 text-base sm:text-[1.05rem] text-brand-midnight leading-snug">
          <span>
            <strong className="font-bold tabular-nums text-[#ff3b30]">0–8</strong> Critical opportunity
          </span>
          <span>
            <strong className="font-bold tabular-nums text-[#ff9500]">9–12</strong> Needs focus
          </span>
          <span>
            <strong className="font-bold tabular-nums text-[#ca8a04]">13–16</strong> Developing
          </span>
          <span>
            <strong className="font-bold tabular-nums text-[#34c759]">17–20</strong> Strong
          </span>
        </div>
      </div>

      {Object.keys(pillarScores).map(pillar => (
        <PillarPanel
          key={pillar}
          pillar={pillar}
          score={pillarScores[pillar as PillarKey]}
          insight={pillarInsights[pillar as PillarKey]}
          expanded={true}
          isPrimary={pillar === primaryPillar}
          stage={stage}
          businessName={businessName}
        />
      ))}
    </section>
  );
}
