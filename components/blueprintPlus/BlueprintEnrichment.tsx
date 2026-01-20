import { useState } from "react";
import type { BlueprintEnrichmentInput } from "./types";

type Props = {
  onSubmit: (data: BlueprintEnrichmentInput) => void;
  onSkip: () => void;
};

export function BlueprintEnrichment({ onSubmit, onSkip }: Props) {
  const [form, setForm] = useState<BlueprintEnrichmentInput>({
    artifactUrls: [],
  });

  const update = (key: keyof BlueprintEnrichmentInput, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-8">
      <header>
        <h2 className="text-2xl font-semibold">
          Refine Your Blueprint+™
        </h2>
        <p className="text-slate-600 mt-2">
          We’ve already analyzed your live brand presence. You can add optional
          context below to make your Blueprint even more precise.
        </p>
      </header>

      {/* Focus & priorities */}
      <div className="card">
        <h3 className="font-medium mb-2">Focus & priorities (optional)</h3>
        <input
          className="input"
          placeholder="Primary offer to prioritize"
          onChange={(e) => update("primaryOffer", e.target.value)}
        />
        <input
          className="input mt-2"
          placeholder="Primary audience segment"
          onChange={(e) => update("primaryAudience", e.target.value)}
        />
        <input
          className="input mt-2"
          placeholder="Secondary audience (optional)"
          onChange={(e) => update("secondaryAudience", e.target.value)}
        />
      </div>

      {/* Competitive context */}
      <div className="card">
        <h3 className="font-medium mb-2">Competitive context (optional)</h3>
        <input
          className="input"
          placeholder="Competitor you admire"
          onChange={(e) => update("admiredCompetitor", e.target.value)}
        />
        <input
          className="input mt-2"
          placeholder="Competitor you want to differentiate from"
          onChange={(e) => update("avoidedCompetitor", e.target.value)}
        />
      </div>

      {/* Artifacts */}
      <div className="card">
        <h3 className="font-medium mb-2">Brand artifacts (optional)</h3>
        <textarea
          className="input"
          placeholder="Paste links to brand guidelines, pitch deck, sales page, etc."
          onChange={(e) =>
            update(
              "artifactUrls",
              e.target.value.split("\n").filter(Boolean)
            )
          }
        />
      </div>

      <div className="flex justify-between pt-4">
        <button className="text-sm text-slate-500" onClick={onSkip}>
          Skip for now
        </button>
        <button
          className="btn-primary"
          onClick={() => onSubmit(form)}
        >
          Generate My Blueprint+™
        </button>
      </div>
    </section>
  );
}
