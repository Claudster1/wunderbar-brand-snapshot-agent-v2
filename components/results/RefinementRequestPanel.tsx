// components/results/RefinementRequestPanel.tsx

"use client";

import { PillarKey } from "@/src/types/pillars";
import { refinementTiers } from "@/src/content/refinement.copy";

export function RefinementRequestPanel({
  reportId,
  uncoveredPillars
}: {
  reportId: string;
  uncoveredPillars: PillarKey[];
}) {
  return (
    <section className="border rounded-lg p-6 mt-10 bg-slate-50">
      <h3 className="text-xl font-semibold mb-2">
        Want more precision?
      </h3>

      <p className="text-sm text-slate-600 mb-4">
        You can enrich one or more areas with additional context to sharpen
        your Snapshot+™ recommendations.
      </p>

      <form action="/api/refinement-request" method="POST" id="refinement-form">
        <input type="hidden" name="reportId" value={reportId} />
        <input type="hidden" name="scope" value="pillar" id="scope-input" />

        <label className="block mb-2 font-medium">
          Which area would you like to enrich?
        </label>

        <select
          name="pillar"
          className="w-full border rounded p-2 mb-4"
          required
        >
          {uncoveredPillars.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium">
          What additional context would you like to add?
        </label>

        <textarea
          name="context"
          rows={4}
          className="w-full border rounded p-2 mb-4"
          placeholder="Examples: links, positioning notes, campaigns, audience details…"
          required
        />

        <button type="submit" className="btn-primary">
          Enrich This Pillar (${refinementTiers.single.price})
        </button>

        <button 
          type="button" 
          className="btn-secondary mt-2"
          onClick={() => {
            const form = document.getElementById("refinement-form") as HTMLFormElement;
            const scopeInput = document.getElementById("scope-input") as HTMLInputElement;
            scopeInput.value = "full";
            form.submit();
          }}
        >
          Refresh Entire Snapshot+™ (${refinementTiers.full.price})
        </button>
      </form>
    </section>
  );
}
