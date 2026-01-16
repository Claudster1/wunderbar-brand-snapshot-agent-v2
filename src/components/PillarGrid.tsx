// src/components/PillarGrid.tsx
// Grid component for displaying all pillars

"use client";

import { pillarCopy, PillarKey } from "@/src/copy/pillars";
import { classifyStrength, PillarScore } from "@/src/scoring/scoringEngine";

interface PillarGridProps {
  pillars: PillarScore;
  brandName?: string;
}

export function PillarGrid({ pillars, brandName = "" }: PillarGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(pillars).map(([pillar, score]) => {
        const strength = classifyStrength(score);
        const copy = pillarCopy[pillar as PillarKey];

        return (
          <div
            key={pillar}
            className="border border-brand-border rounded-lg p-6 bg-white"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-brand-navy">{copy.title}</h4>
              <span className="text-sm font-medium text-brand-midnight">
                {score}/20
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              {copy.whyItMatters}
            </p>

            {brandName && (
              <p className="text-sm text-brand-midnight">
                {copy.expanded[strength](brandName)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
