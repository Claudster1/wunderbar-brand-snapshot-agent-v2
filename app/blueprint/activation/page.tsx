import { PrimaryCTA } from "@/components/cta/PrimaryCTA";
import { PromptPackPanel } from "@/components/blueprint/PromptPackPanel";

export default function BlueprintActivationPage({ data }: any) {
  const { brandName, primaryPillar, resolvedPillars } = data;

  return (
    <main className="max-w-6xl mx-auto px-8 py-20">
      <h1 className="text-4xl font-semibold text-brand-navy mb-4">
        Your Blueprint™ is Ready
      </h1>

      <p className="text-lg text-slate-700 max-w-3xl mb-12">
        Blueprint™ transforms the clarity you gained in Snapshot+™ into a fully
        usable brand system — built specifically for {brandName}.
      </p>

      {/* Primary Pillar Callout */}
      <section className="border border-brand-blue/30 rounded-xl p-8 mb-16 bg-brand-blue/5">
        <h2 className="text-2xl font-semibold mb-2">
          Focus Area: {primaryPillar}
        </h2>

        <p className="text-slate-700 max-w-3xl">
          This Blueprint™ is anchored around your strongest opportunity area —
          where the greatest gains in clarity, confidence, and performance can occur.
        </p>
      </section>

      {/* Pillar Resolution Map */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-6">
          How Blueprint™ Builds on Your Snapshot+™
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {resolvedPillars.map((pillar: any) => (
            <div
              key={pillar.name}
              className="border border-slate-200 rounded-lg p-6"
            >
              <h3 className="font-semibold mb-2">{pillar.name}</h3>

              <p className="text-sm text-slate-600">
                Snapshot+™ identified clarity opportunities here.
              </p>

              <p className="text-sm mt-2">
                Blueprint™ translates this into structured language, positioning,
                and reusable guidance your team can apply immediately.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Prompt Packs */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-6">
          Your Brand Prompt Library
        </h2>

        <p className="text-slate-700 max-w-3xl mb-8">
          These prompts are custom-generated from your Blueprint™ — designed to
          help you create consistent messaging across channels, tools, and teams.
        </p>

        <PromptPackPanel />
      </section>

      {/* CTA */}
      <section className="mt-24 text-center">
        <PrimaryCTA href="/dashboard">Go to Dashboard →</PrimaryCTA>
      </section>
    </main>
  );
}
