// components/results/PillarSection.tsx
// Component for displaying a pillar section with progressive disclosure

import React from "react";

type Props = {
  pillarKey: string;
  pillar: any;
  isPrimary: boolean;
  children?: React.ReactNode;
};

export function PillarSection({
  pillarKey,
  pillar,
  isPrimary,
  children,
}: Props) {
  return (
    <div
      className={`rounded-xl border p-6 transition ${
        isPrimary ? "border-slate-900 bg-white" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold capitalize">
          {pillarKey}
        </h3>
        {children}
      </div>

      <p className="text-sm text-slate-700 mb-3">
        {pillar.summary}
      </p>

      {isPrimary && (
        <div className="mt-4 text-sm text-slate-800">
          {pillar.expandedInsight}
        </div>
      )}

      {!isPrimary && (
        <p className="text-xs text-slate-500 mt-2">
          Why this matters: {pillar.whyItMatters}
        </p>
      )}
    </div>
  );
}
