// app/results/components/BrandSnapshotResults.tsx
// Brand Snapshot results page with structured layout

"use client";

import { useState } from "react";
import { ScoreGauge } from "@/src/components/ScoreGauge";
import { resolvePillarPriority } from "@/src/lib/pillars/pillarPriority";
import { PillarKey } from "@/types/pillars";
import { PillarPanel } from "@/components/pillars/PillarPanel";
import { getUpgradeCTA } from "@/lib/cta";

interface BrandSnapshotResultsProps {
  brandName: string;
  brandAlignmentScore: number; // 0-100
  pillarScores: Record<PillarKey, number>;
}

export function BrandSnapshotResults({
  brandName,
  brandAlignmentScore,
  pillarScores,
}: BrandSnapshotResultsProps) {
  const { primary, secondary } = resolvePillarPriority(pillarScores);
  const [expandedPillar, setExpandedPillar] = useState<PillarKey | null>(primary);

  // Calculate average score for display
  const averageScore = Math.round(
    Object.values(pillarScores).reduce((a, b) => a + b, 0) /
      Object.keys(pillarScores).length
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
      {/* 1. Brand Alignment Score™ (hero visual) */}
      <section className="text-center">
        <h1 className="text-3xl font-semibold text-brand-navy mb-4">
          Brand Alignment Score™
        </h1>
        <div className="flex justify-center mb-4">
          <ScoreGauge score={brandAlignmentScore} />
        </div>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Your brand's overall alignment across positioning, messaging, visibility,
          credibility, and conversion.
        </p>
      </section>

      {/* 2. Primary Pillar (auto-expanded) */}
      <section>
        <PillarPanel
          pillar={primary}
          score={pillarScores[primary]}
          defaultExpanded={true}
          emphasis="primary"
          onToggle={() => setExpandedPillar(expandedPillar === primary ? null : primary)}
        />
      </section>

      {/* 3. Secondary Pillars (collapsed) */}
      {secondary.length > 0 && (
        <section className="space-y-4">
          {secondary.map((pillar) => (
            <PillarPanel
              key={pillar}
              pillar={pillar}
              score={pillarScores[pillar]}
              defaultExpanded={false}
              emphasis="secondary"
              onToggle={() => setExpandedPillar(expandedPillar === pillar ? null : pillar)}
            />
          ))}
        </section>
      )}

      {/* 4. Snapshot+™ Primary CTA (pillar-specific) */}
      <section className="mt-12">
        <div className="rounded-xl bg-brand-navy text-white p-8">
          <h2 className="text-2xl font-semibold mb-3">
            {getUpgradeCTA(primary, brandName)}
          </h2>
          <p className="text-slate-200 mb-6 max-w-2xl">
            Snapshot+™ expands on your {primary} results with deeper analysis,
            examples, and prioritized actions tailored to {brandName}.
          </p>
          <a
            href="/snapshot-plus"
            className="inline-block px-6 py-3 bg-brand-blue text-white rounded-md font-semibold hover:bg-brand-blueHover transition"
          >
            See how to strengthen what matters most right now →
          </a>
        </div>
      </section>

      {/* 5. Secondary CTA (Explore the Brand Snapshot Suite™) */}
      <section className="text-center">
        <a
          href="/brand-suite"
          className="text-brand-blue hover:text-brand-blueHover font-medium underline"
        >
          Explore the Brand Snapshot Suite™ →
        </a>
      </section>
    </div>
  );
}
