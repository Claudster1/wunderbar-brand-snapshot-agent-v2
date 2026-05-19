import Link from "next/link";
import { BrandArchetypeIcon, SectionGlyph } from "@/components/results/BrandIcons";
import { SUITE_SECTION_KICKER_CLASS } from "@/components/results/suiteBrandTokens";
import { PRICING } from "@/lib/pricing";

type Props = {
  likelyArchetype: string;
  archetypeMeaning?: string | null;
  hasSnapshotPlus?: boolean;
};

export function ResultsArchetypeSection({
  likelyArchetype,
  archetypeMeaning,
  hasSnapshotPlus = false,
}: Props) {
  const upgradeLabel = PRICING.snapshot_plus.label;

  return (
    <section
      id="brand-archetype"
      className="scroll-mt-28 rounded-2xl border border-brand-border/70 bg-gradient-to-br from-[#f4f9ff] via-white to-[#fafbff] p-6 sm:p-8 shadow-[0_8px_32px_rgba(2,24,89,0.06)]"
      aria-labelledby="brand-archetype-heading"
    >
      <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className={`${SUITE_SECTION_KICKER_CLASS} m-0 mb-2`}>Brand archetype</p>
          <h2 id="brand-archetype-heading" className="bs-h3 m-0 text-brand-navy tracking-tight">
            How your brand shows up
          </h2>
        </div>
        <div className="flex items-center gap-2 text-brand-muted">
          <SectionGlyph token="archetype" size={16} color="#07B0F2" />
          <span className="text-xs font-semibold uppercase tracking-[0.08em]">Snapshot signal</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        <div
          className="flex h-[96px] w-[96px] shrink-0 items-center justify-center rounded-2xl border border-brand-blue/25 bg-white shadow-[0_6px_24px_rgba(7,176,242,0.14)]"
          aria-hidden
        >
          <BrandArchetypeIcon archetype={likelyArchetype} size={60} color="#021859" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 mb-1 text-xs font-bold uppercase tracking-[0.1em] text-brand-blue">
            Your archetype
          </p>
          <h3 className="bs-h2 m-0 mb-3 text-brand-navy tracking-tight">{likelyArchetype}</h3>
          {archetypeMeaning ? (
            <p className="bs-body-sm text-brand-midnight m-0 mb-4 leading-relaxed max-w-2xl">
              {archetypeMeaning}
            </p>
          ) : (
            <p className="bs-body-sm text-brand-muted m-0 mb-4 leading-relaxed max-w-2xl">
              Your answers map to a clear archetype pattern — a shorthand for tone, trust, and how people
              experience your brand before they buy.
            </p>
          )}
          {!hasSnapshotPlus ? (
            <>
              <p className="bs-small text-brand-muted m-0">
                Channel fit, voice guidance, and activation playbooks for this archetype unlock in{" "}
                <span className="font-semibold text-brand-navy">{upgradeLabel}</span>.
              </p>
              <Link
                href="/snapshot-plus?source=archetype_results_overview"
                className="inline-flex mt-4 text-sm font-bold text-brand-blue hover:underline underline-offset-2"
              >
                See archetype activation in {upgradeLabel} →
              </Link>
            </>
          ) : (
            <p className="bs-small text-brand-muted m-0">
              Use Foundation and Activation tabs for voice, channel fit, and playbooks built around this
              pattern.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
