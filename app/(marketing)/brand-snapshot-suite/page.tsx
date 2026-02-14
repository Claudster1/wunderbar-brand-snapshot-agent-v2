// app/(marketing)/brand-snapshot-suite/page.tsx
import Link from "next/link";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingComparison } from "@/components/pricing/PricingComparison";
import { WundyStamp } from "@/components/wundy/WundyStamp";

export const metadata = {
  title: "WunderBrand Suite™ | Wunderbar Digital",
  description:
    "Choose the right level of brand clarity — from WunderBrand Snapshot™ to WunderBrand Snapshot+™, WunderBrand Blueprint™, and WunderBrand Blueprint+™.",
};

export default function BrandSnapshotSuitePage() {
  return (
    <main className="min-h-screen bg-white text-[#0C1526]">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#E0E3EA] px-4 py-2 text-xs font-semibold tracking-wide text-[#021859]">
            WunderBrand Suite™ <span className="text-[#07B0F2]">•</span> Powered by Wunderbar Digital
          </p>

          <h1 className="mt-6 text-4xl font-semibold leading-tight text-[#021859] md:text-5xl">
            Premium brand clarity — on your timeline
          </h1>

          <p className="mt-5 text-[17px] leading-relaxed text-[#0C1526]">
            Start with a fast diagnostic, then upgrade when you're ready.
            Each level turns insight into a more complete, more usable brand system — designed to support
            your marketing workflows <em>and</em> your AI tools.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/brand-snapshot"
              className="rounded-[10px] bg-[#07B0F2] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(7,176,242,0.25)] transition hover:bg-[#059BD8] no-underline"
            >
              Start WunderBrand Snapshot™ (Free) →
            </Link>

            <Link
              href="#plans"
              className="rounded-[10px] border border-[#E0E3EA] bg-white px-6 py-3 text-sm font-semibold text-[#021859] shadow-sm transition hover:bg-[#F5F7FB] no-underline"
            >
              View plans →
            </Link>
          </div>

          <div className="mt-10 flex justify-center">
            <WundyStamp />
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-6 md:grid-cols-4">
          <PricingCard
            badge="Free"
            title="WunderBrand Snapshot™"
            price="$0"
            description="A fast diagnostic that reveals your WunderBrand Score™ and pillar scores."
            features={[
              "WunderBrand Score™",
              "Pillar Scores (5 pillars)",
              "High-level insights",
              "Next-step recommendations (starter)",
            ]}
            ctaLabel="Start free →"
            ctaHref="/brand-snapshot"
            variant="base"
          />

          <PricingCard
            badge="Most popular"
            title="WunderBrand Snapshot+™"
            price="$497"
            priceNote="one-time"
            description="A personalized deep-dive report with prioritized clarity improvements and AI-ready prompts."
            features={[
              "Expanded pillar insights",
              "Prioritized recommendations",
              "AEO opportunities (starter)",
              "Prompt pack (lite)",
              "Downloadable PDF report",
            ]}
            ctaLabel="Get WunderBrand Snapshot+™ →"
            ctaAction="checkout"
            checkoutProductKey="snapshot_plus"
            variant="featured"
          />

          <PricingCard
            badge="Strategy system"
            title="WunderBrand Blueprint™"
            price="$997"
            priceNote="one-time"
            description="A complete brand foundation — messaging, narrative, voice, and direction."
            features={[
              "Positioning + messaging system",
              "Narrative + voice guide",
              "Channel-ready guidance",
              "AEO roadmap (standard)",
              "Prompt library (pro)",
              "Downloadable PDF deliverable",
            ]}
            ctaLabel="Get WunderBrand Blueprint™ →"
            ctaAction="checkout"
            checkoutProductKey="blueprint"
            variant="base"
          />

          <PricingCard
            badge="Most comprehensive"
            title="WunderBrand Blueprint+™"
            price="$1,997"
            priceNote="one-time"
            description="Your advanced strategic brand system — segmentation, matrices, campaign starters, and orchestration."
            features={[
              "Advanced audience segmentation",
              "Messaging matrix",
              "Thought leadership themes",
              "AEO roadmap (advanced)",
              "AI orchestration guidelines",
              "Prompt library (30+ prompts)",
              "Downloadable PDF deliverable",
            ]}
            ctaLabel="Get WunderBrand Blueprint+™ →"
            ctaAction="checkout"
            checkoutProductKey="blueprint_plus"
            variant="base"
          />
        </div>

        <div className="mt-10 rounded-2xl border border-[#E0E3EA] bg-[#F5F7FB] p-6">
          <h2 className="text-lg font-semibold text-[#021859]">
            Not sure where to start?
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#0C1526]">
            Start with WunderBrand Snapshot™. You'll see your WunderBrand Score™ first — then upgrade only if it feels worth it.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/brand-snapshot"
              className="rounded-[10px] bg-[#07B0F2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#059BD8] no-underline"
            >
              Start WunderBrand Snapshot™ →
            </Link>
            <Link
              href="/brand-snapshot#results-preview"
              className="rounded-[10px] border border-[#E0E3EA] bg-white px-6 py-3 text-sm font-semibold text-[#021859] hover:bg-[#F5F7FB] no-underline"
            >
              See what you'll get →
            </Link>
          </div>
        </div>
      </section>

      {/* COMPARISON + FAQ */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <PricingComparison />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <PricingFAQ />
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E0E3EA]">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-slate-600">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Wunderbar Digital. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-[#021859] no-underline">Privacy</Link>
              <Link href="/terms" className="hover:text-[#021859] no-underline">Terms</Link>
              <Link href="/brand-snapshot" className="hover:text-[#021859] no-underline">WunderBrand Snapshot™</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
