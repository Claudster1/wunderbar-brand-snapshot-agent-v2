// src/components/PillarBreakdown.tsx
// Section component for displaying pillar breakdown

import { PillarGrid } from "./PillarGrid";
import { PillarScore } from "@/src/scoring/scoringEngine";

interface PillarBreakdownProps {
  pillarScores: PillarScore;
  brandName?: string;
}

export function PillarBreakdown({ pillarScores, brandName }: PillarBreakdownProps) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h3 className="text-2xl font-semibold text-brand-navy mb-4">
        What's Driving Your Brand Alignment Score™
      </h3>

      <p className="text-[15px] text-brand-midnight max-w-3xl mb-12">
        Each pillar below contributes directly to your Brand Alignment Score™.
        Strong brands tend to perform consistently across all five — while gaps
        in any one area can hold everything else back.
      </p>

      <PillarGrid pillars={pillarScores} brandName={brandName} />
    </section>
  );
}
