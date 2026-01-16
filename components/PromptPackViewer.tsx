"use client";

import { useState } from "react";
import { PillarPromptPack, BrandArchetype, BrandStage } from "@/src/lib/prompts/types";

interface Props {
  pack: PillarPromptPack;
  archetype: BrandArchetype;
  stage: BrandStage;
}

export function PromptPackViewer({ pack, archetype, stage }: Props) {
  const prompts = pack.archetypes[archetype]?.[stage] || [];
  const [expanded, setExpanded] = useState(false);

  if (!prompts.length) return null;

  return (
    <section className="border border-brand-border rounded-xl p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-brand-navy">
            {pack.pillar}
          </h2>
          <p className="text-sm text-brand-midnight mt-1">
            {pack.description}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-brand-blue font-medium"
        >
          {expanded ? "Hide prompts" : "View prompts"}
        </button>
      </header>

      {expanded && (
        <div className="mt-6 space-y-6">
          {prompts.map((p) => (
            <PromptCard key={p.id} prompt={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function PromptCard({ prompt }: { prompt: any }) {
  const copy = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
  };

  return (
    <div className="bg-brand-light rounded-lg p-5">
      <h3 className="font-medium text-brand-navy mb-1">
        {prompt.title}
      </h3>
      <p className="text-sm text-brand-midnight mb-3">
        {prompt.intent}
      </p>

      <pre className="text-sm whitespace-pre-wrap bg-white border rounded p-4">
        {prompt.prompt}
      </pre>

      <div className="mt-3 flex gap-4">
        <button
          onClick={copy}
          className="text-sm text-brand-blue font-medium"
        >
          Copy prompt
        </button>
      </div>
    </div>
  );
}
