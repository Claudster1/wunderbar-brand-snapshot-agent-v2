import Link from "next/link";
import { PrimaryCTA } from "@/components/cta/PrimaryCTA";
import { PromptPackPanel } from "@/components/blueprint/PromptPackPanel";

type SearchParams = { reportId?: string };
export default async function BlueprintActivationPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  // Data is typically passed via client navigation state or fetched by layout; use fallbacks for static/prerender
  await searchParams;
  const brandName = "your brand";
  const primaryPillar = "Credibility";
  const resolvedPillars: Array<{ name: string }> = [];

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

      {/* Upsell: Blueprint+ */}
      <section className="mt-16 rounded-xl border-2 border-brand-blue/30 bg-brand-blue/5 p-8 text-center">
        <h2 className="text-2xl font-semibold text-brand-navy mb-2">Ready for more?</h2>
        <p className="text-slate-700 max-w-2xl mx-auto mb-6">
          WunderBrand Blueprint+™ adds advanced strategy, execution playbooks, extended prompt libraries,
          and 12-month content roadmaps — so you can activate your brand at scale.
        </p>
        <Link
          href="/brand-blueprint-plus"
          className="inline-flex rounded-[10px] bg-[#07B0F2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#059BD8] no-underline"
        >
          Explore WunderBrand Blueprint+™ →
        </Link>
      </section>

      {/* CTA */}
      <section className="mt-24 text-center">
        <PrimaryCTA href="/dashboard">Go to Dashboard →</PrimaryCTA>
      </section>
    </main>
  );
}
