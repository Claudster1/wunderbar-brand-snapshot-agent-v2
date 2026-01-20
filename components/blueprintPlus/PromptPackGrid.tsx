"use client";

import { PromptCard } from "./PromptCard";

type PromptPackGridProps = {
  packs: {
    id?: string;
    pillar?: string;
    title: string;
    description?: string;
    prompts: Array<{ title: string; prompt: string }>;
  }[];
};

export function PromptPackGrid({ packs }: PromptPackGridProps) {
  return (
    <section className="space-y-10">
      {packs.map((pack) => (
        <div key={pack.id ?? pack.title}>
          <h2 className="text-2xl font-semibold text-brand-navy mb-2">
            {pack.pillar ?? pack.title}
          </h2>
          {pack.description && (
            <p className="text-sm text-brand-midnight mb-6 max-w-2xl">
              {pack.description}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {pack.prompts.map((prompt, idx) => (
              <PromptCard
                key={`${pack.id ?? pack.title}-${idx}`}
                prompt={{
                  id: `${pack.id ?? pack.title}-${idx}`,
                  title: prompt.title,
                  description: "",
                  body: prompt.prompt,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
