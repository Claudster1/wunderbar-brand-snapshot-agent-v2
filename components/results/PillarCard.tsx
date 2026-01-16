// components/results/PillarCard.tsx
import { useState } from "react";
import { ScoreGauge } from "./ScoreGauge";
import { stageModifier, archetypeModifier } from "@/src/lib/pillars/pillarModifiers";
import { PILLAR_COPY, PillarKey } from "@/src/lib/pillars/pillarCopy";
import { BrandStage, ArchetypeKey } from "@/src/lib/pillars/types";
import { PrimaryCTA } from "./PrimaryCTA";

interface Props {
  pillar: PillarKey;
  score: number;
  businessName: string;
  brandStage: BrandStage;
  archetype: ArchetypeKey;
  isPrimary?: boolean;
}

export function PillarCard({
  pillar,
  score,
  businessName,
  brandStage,
  archetype,
  isPrimary = false,
}: Props) {
  const [open, setOpen] = useState(isPrimary);
  const copy = PILLAR_COPY[pillar];

  return (
    <div
      className={`rounded-xl border p-6 transition ${
        isPrimary
          ? "border-brand-blue bg-blue-50"
          : "border-brand-border bg-white"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 text-left"
      >
        <ScoreGauge score={score} size={64} />

        <div className="flex-1">
          <div className="uppercase text-xs tracking-wide text-slate-500">
            {copy.label}
            {isPrimary && " — Primary Opportunity"}
          </div>

          <h3 className="text-lg font-semibold text-brand-navy">
            {copy.headline(businessName)}
          </h3>

          {!open && (
            <p className="mt-2 text-sm text-slate-600">
              {copy.whyItMatters(businessName)}
            </p>
          )}
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-sm leading-relaxed">
            {copy.body(businessName)}
          </p>

          <p className="text-sm text-slate-600">
            {copy.whyItMatters(businessName)}
          </p>

          <p className="text-xs text-slate-500">
            {stageModifier(brandStage)} {archetypeModifier(archetype)}
          </p>

          {isPrimary && (
            <PrimaryCTA pillar={pillar} />
          )}
        </div>
      )}
    </div>
  );
}
