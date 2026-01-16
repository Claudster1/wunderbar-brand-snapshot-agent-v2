// components/pillars/ResultsPage.tsx
"use client";

import { useState } from "react";
import { resolvePillarPriority } from "@/src/lib/pillars/pillarPriority";
import { PillarPanel } from "./PillarPanel";
import { BrandStage } from "@/lib/pillars";
import { PillarKey } from "@/lib/pillars";
import { getPillarPriority } from "@/lib/pillarFlow";

interface Report {
  businessName: string;
  pillarScores: Record<PillarKey, number>;
  stage: BrandStage;
  primaryPillar?: PillarKey;
}

interface Props {
  report: Report;
}

export function ResultsPage({ report }: Props) {
  const { primary, secondary } = resolvePillarPriority(report.pillarScores);
  const [expandedPillar, setExpandedPillar] = useState<PillarKey | null>(primary);

  // Create ordered list: primary first, then secondary
  const orderedPillars = [primary, ...secondary];

  // Transform ordered pillars into objects with key, score, and priority
  const pillars = orderedPillars.map((pillarKey) => ({
    key: pillarKey,
    score: report.pillarScores[pillarKey],
    priority: pillarKey === primary ? ("primary" as const) : ("secondary" as const),
  }));

  return (
    <section className="space-y-6">
      {pillars.map((pillar) => {
        const isExpanded = expandedPillar === pillar.key;
        const isPrimary = pillar.key === primary;

        return (
          <PillarPanel
            key={pillar.key}
            pillar={pillar}
            brandName={report.businessName}
            expanded={isExpanded}
            onToggle={() =>
              setExpandedPillar(isExpanded ? null : pillar.key)
            }
            stage={report.stage}
          />
        );
      })}
    </section>
  );
}
