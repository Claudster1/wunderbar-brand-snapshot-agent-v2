// src/dashboard/ResultsView.tsx
// Dashboard results view component

"use client";

import { pillarCopy, PillarKey } from "@/src/copy/pillars";
import { classifyStrength, getPrimaryPillar, PillarScore } from "@/src/scoring/scoringEngine";
import { Gauge } from "@/src/components/Gauge";
import { CoverageMeter } from "@/src/components/CoverageMeter";

export function ResultsView({
  brandName,
  pillarScores,
  coverageScore,
}: {
  brandName: string;
  pillarScores: PillarScore;
  coverageScore: number;
}) {
  const primary = getPrimaryPillar(pillarScores);
  const alignmentScore = Math.round(
    Object.values(pillarScores).reduce((a, b) => a + b, 0) /
      Object.keys(pillarScores).length
  );

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-8">
        <Gauge value={alignmentScore} />
        <CoverageMeter value={coverageScore} />
      </div>

      {Object.entries(pillarScores).map(([pillar, score]) => {
        const strength = classifyStrength(score);
        const copy = pillarCopy[pillar as PillarKey];
        const expanded = pillar === primary;

        return (
          <div key={pillar} className="border rounded-lg p-6">
            <h3 className="font-semibold text-lg">{copy.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {copy.whyItMatters}
            </p>

            {expanded && (
              <p className="mt-4">
                {copy.expanded[strength](brandName)}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}
