import Link from "next/link";

type Props = {
  likelyArchetype?: string | null;
};

function LockedCard({
  title,
  visibleLead,
  lockedCopy,
}: {
  title: string;
  visibleLead: string;
  lockedCopy: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-brand-border bg-white p-6 sm:p-7">
      <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-4">{title}</p>
      <p className="bs-body-sm text-brand-midnight">{visibleLead}</p>
      <div className="mt-3 rounded-lg border border-brand-border bg-slate-50/90 p-3 backdrop-blur">
        <p className="bs-small text-brand-muted blur-[1px] select-none">{lockedCopy}</p>
      </div>
      <p className="mt-2 text-xs font-semibold text-brand-blue">Locked preview</p>
    </article>
  );
}

export function FoundationLockedPreview({ likelyArchetype }: Props) {
  return (
    <section className="space-y-5 sm:space-y-6">
      <div>
        <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-4">
          Foundation Locked Preview
        </p>
        <h3 className="bs-h3">See what is identified in your diagnostic</h3>
        <p className="bs-body-sm text-brand-muted max-w-3xl">
          Your structure is visible so you can understand exactly what unlocks in paid products.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LockedCard
          title="Brand Archetype"
          visibleLead={`Archetype identified${likelyArchetype ? `: ${likelyArchetype}` : ""}.`}
          lockedCopy="Your archetype profile includes communication patterns, channel fit, and voice guidance for activation."
        />
        <LockedCard
          title="Contributing Factors"
          visibleLead="Contributing factors found across your pillar scores."
          lockedCopy="Contributing factors explain why each score moved and which change has highest leverage first."
        />
        <LockedCard
          title="Signal Layer"
          visibleLead="Competitive and efficiency signals were detected."
          lockedCopy="Signal severity, root cause, and action sequence are available in the unlocked results layer."
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/snapshot-plus" className="btn-primary">
          See What's Included
        </Link>
        <Link
          href="https://calendly.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          Talk to an Expert
        </Link>
      </div>
    </section>
  );
}
