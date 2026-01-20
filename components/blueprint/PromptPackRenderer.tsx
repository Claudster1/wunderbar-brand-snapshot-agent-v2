// components/blueprint/PromptPackRenderer.tsx
// Component to render a prompt pack with its prompts

import { PromptPack } from '@/src/lib/prompts/blueprint/promptPacks';

export function PromptPackRenderer({ pack }: { pack: PromptPack }) {
  return (
    <section className="rounded-xl border border-brand-border bg-white p-6 space-y-4">
      <header>
        <h3 className="text-lg font-semibold text-brand-navy">
          {pack.title}
        </h3>
      </header>

      <ul className="space-y-3">
        {pack.prompts.map((prompt, idx) => (
          <li
            key={idx}
            className="rounded-md bg-brand-light p-4 text-sm font-mono"
          >
            {prompt}
          </li>
        ))}
      </ul>
    </section>
  );
}
