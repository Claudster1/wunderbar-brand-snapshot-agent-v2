// components/snapshot/StrategicContext.tsx

"use client";

import { useState } from "react";

export function StrategicContext({
  onUpdate,
  businessName,
}: {
  onUpdate?: (context: string) => void;
  businessName?: string;
}) {
  const [context, setContext] = useState("");

  return (
    <section id="strategic-context" className="border rounded-lg p-6 bg-slate-50">
      <h3 className="text-lg font-semibold mb-2">
        Increase Insight Depth with Strategic Context
      </h3>

      <p className="text-sm text-slate-600 mb-4">
        Your Snapshot+™ insights are generated using the information provided
        during your WunderBrand Snapshot™.
      </p>

      <p className="text-sm text-slate-600 mb-4">
        Adding strategic context helps sharpen insight depth — no rework required.
        This allows us to surface deeper, more tailored opportunities specific to{" "}
        {businessName || "your business"} without changing anything already captured.
      </p>

      <textarea
        value={context}
        onChange={(e) => {
          setContext(e.target.value);
          onUpdate?.(e.target.value);
        }}
        placeholder="Examples: Market positioning notes, competitive landscape, target audience details, brand evolution goals, recent changes, strategic priorities..."
        rows={6}
        className="w-full border rounded px-3 py-2 text-sm"
      />

      <p className="text-xs text-slate-500 mt-2">
        This information will be used to provide more tailored recommendations
        in your Snapshot+™ report.
      </p>
    </section>
  );
}
