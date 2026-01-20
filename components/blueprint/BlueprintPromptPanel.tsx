"use client";

import { PromptCard } from "../blueprintPlus/PromptCard";
import { blueprintPromptMap } from "@/lib/blueprint/prompts";

export function BlueprintPromptPanel() {
  return (
    <section className="space-y-10">
      {Object.entries(blueprintPromptMap).map(([pillar, prompts]) => (
        <div key={pillar}>
          <h2 className="text-2xl font-semibold text-brand-navy mb-2">
            {pillar}
          </h2>
          <p className="text-sm text-brand-midnight mb-6 max-w-2xl">
            These prompts activate and extend the insights uncovered in your
            Snapshot+™ report for this pillar.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
