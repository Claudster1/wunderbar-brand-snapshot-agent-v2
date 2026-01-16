// src/dashboard/BlueprintActivation.tsx
// Blueprint activation component

"use client";

import { pillarCopy, PillarKey } from "@/src/copy/pillars";

export function BlueprintActivation({
  brandName,
  resolvedPillars,
}: {
  brandName: string;
  resolvedPillars: PillarKey[];
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">
        Blueprint™ Activation
      </h2>

      {resolvedPillars.map((pillar) => (
        <div key={pillar} className="border rounded-md p-5">
          <h3 className="font-semibold">
            Activating {pillarCopy[pillar].title}
          </h3>
          <p className="mt-2">
            This section activates the {pillarCopy[pillar].title} priorities identified in your Snapshot+™.
          </p>
        </div>
      ))}
    </section>
  );
}
