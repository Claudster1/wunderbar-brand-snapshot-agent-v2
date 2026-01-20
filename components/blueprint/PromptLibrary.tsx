// components/blueprint/PromptLibrary.tsx
// Component for browsing and filtering prompt packs by pillar

"use client";

import { useState } from 'react';
import { BLUEPRINT_PROMPT_PACKS } from '@/src/lib/prompts/blueprint/promptPacks';
import { PromptPackRenderer } from './PromptPackRenderer';

export function PromptLibrary() {
  const [pillar, setPillar] = useState<string | null>(null);

  const visible = pillar
    ? BLUEPRINT_PROMPT_PACKS.filter((p) => p.pillar === pillar)
    : BLUEPRINT_PROMPT_PACKS;

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {['positioning', 'messaging', 'visibility', 'credibility', 'conversion'].map(
          (p) => (
            <button
              key={p}
              onClick={() => setPillar(p)}
              className={`px-4 py-2 rounded-md border ${
                pillar === p
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-brand-navy border-brand-border hover:bg-brand-light'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          )
        )}
        <button
          onClick={() => setPillar(null)}
          className={`px-4 py-2 rounded-md border ${
            pillar === null
              ? 'bg-brand-blue text-white border-brand-blue'
              : 'bg-white text-brand-navy border-brand-border hover:bg-brand-light'
          }`}
        >
          All
        </button>
      </div>

      <div className="grid gap-6">
        {visible.map((pack) => (
          <PromptPackRenderer
            key={`${pack.pillar}-${pack.title}`}
            pack={pack}
          />
        ))}
      </div>
    </div>
  );
}
