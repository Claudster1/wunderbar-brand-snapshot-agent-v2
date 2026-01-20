// app/blueprint-plus/page.tsx
// Blueprint+™ prompt pack page

import { advancedPromptPacks } from "@/blueprintPlus/advancedPromptPacks";
import { PromptPackGrid } from "@/components/blueprintPlus/PromptPackGrid";

export default function BlueprintPlusPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-brand-navy">
          Blueprint+™ Activation
        </h1>
        <p className="mt-3 text-brand-midnight max-w-3xl">
          Blueprint+™ expands your brand system with advanced prompt packs that
          deepen activation across audience, campaign, and channel.
        </p>
      </header>

      <PromptPackGrid packs={advancedPromptPacks} />
    </main>
  );
}