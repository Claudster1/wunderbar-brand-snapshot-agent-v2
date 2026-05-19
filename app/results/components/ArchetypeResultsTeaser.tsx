import Link from "next/link";
import { PRICING } from "@/lib/pricing";

type Props = {
  likelyArchetype: string;
  archetypeIcon?: string;
  archetypeMeaning?: string | null;
};

export function ArchetypeResultsTeaser({ likelyArchetype, archetypeIcon, archetypeMeaning }: Props) {
  const upgradeLabel = PRICING.snapshot_plus.label;

  return (
    <section
      id="archetype"
      className="scroll-mt-28 rounded-2xl border border-brand-border bg-gradient-to-br from-[#f4f9ff] via-white to-white p-6 sm:p-8 shadow-[0_6px_24px_rgba(2,24,89,0.05)]"
    >
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-muted m-0 mb-4">
        Your brand archetype
      </p>
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-brand-blue/25 bg-white text-4xl shadow-sm"
          aria-hidden
        >
          {archetypeIcon || "✦"}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="bs-h2 m-0 mb-2 text-brand-navy">{likelyArchetype}</h2>
          {archetypeMeaning ? (
            <p className="bs-body-sm text-brand-midnight m-0 mb-4 leading-relaxed max-w-2xl">
              {archetypeMeaning}
            </p>
          ) : (
            <p className="bs-body-sm text-brand-muted m-0 mb-4 leading-relaxed max-w-2xl">
              Your answers map to a clear archetype pattern — a shorthand for how your brand shows up in
              market conversations.
            </p>
          )}
          <p className="bs-small text-brand-muted m-0">
            Channel fit, voice guidance, and activation playbooks for this archetype unlock in{" "}
            <span className="font-semibold text-brand-navy">{upgradeLabel}</span>.
          </p>
          <Link
            href="/snapshot-plus?source=archetype_results_teaser"
            className="inline-flex mt-4 text-sm font-bold text-brand-blue hover:underline underline-offset-2"
          >
            See archetype activation in {upgradeLabel} →
          </Link>
        </div>
      </div>
    </section>
  );
}
