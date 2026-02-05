// app/blueprint-plus/page.tsx
// Blueprint+™ prompt pack page

import Link from "next/link";
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

      {/* Services — Managed Marketing & AI Consulting (no product upsell) */}
      <section className="mt-24 rounded-xl border-2 border-brand-navy/10 bg-brand-blue/5 p-8 md:p-10">
        <h2 className="text-2xl font-semibold text-brand-navy mb-2">Work with us</h2>
        <p className="text-brand-midnight max-w-2xl mb-8">
          Put your brand system into action with our services:
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bs-card rounded-xl p-6 border border-brand-navy/10">
            <h3 className="text-lg font-semibold text-brand-navy mb-2">Managed Marketing</h3>
            <p className="text-brand-midnight text-sm mb-4">
              We run your marketing so you can focus on your business — strategy, content,
              campaigns, and performance aligned to your brand.
            </p>
            <Link
              href="https://wunderbardigital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue font-semibold text-sm hover:underline"
            >
              Learn more →
            </Link>
          </div>
          <div className="bs-card rounded-xl p-6 border border-brand-navy/10">
            <h3 className="text-lg font-semibold text-brand-navy mb-2">AI Consulting</h3>
            <p className="text-brand-midnight text-sm mb-4">
              We help you adopt AI confidently — from brand-safe prompts and workflows to
              AI strategy and implementation so your brand stays consistent at scale.
            </p>
            <Link
              href="https://wunderbardigital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue font-semibold text-sm hover:underline"
            >
              Learn more →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}