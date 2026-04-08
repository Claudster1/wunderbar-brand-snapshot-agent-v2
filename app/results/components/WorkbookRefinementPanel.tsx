import Link from "next/link";

type ProductTier = "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";

type Props = {
  productTier: ProductTier;
  reportId: string;
};

export function WorkbookRefinementPanel({ productTier, reportId }: Props) {
  const hasEditAccess = productTier === "blueprint" || productTier === "blueprint_plus";

  return (
    <section className="space-y-6">
      <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
          Diagnostic Truth (Locked)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "WunderBrand Score™",
            "Pillar scores",
            "Brand Archetype",
            "Competitive Vulnerability Signal",
            "Marketing Spend Efficiency Signal",
          ].map((item) => (
            <p key={item} className="bs-small text-brand-midnight">
              • {item}
            </p>
          ))}
        </div>
      </section>

      <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
          Editable Activation Content
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Positioning statement",
            "Messaging pillars and rationale",
            "Voice attributes and language bank",
            "Channel plans and notes",
            "Content schedule",
            "Content drafts",
            "Prompt outputs",
          ].map((item) => (
            <p key={item} className="bs-small text-brand-midnight">
              • {item}
            </p>
          ))}
        </div>
      </section>

      <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
          Regeneration Controls
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-secondary" disabled={!hasEditAccess}>
            Recompute contributing factors
          </button>
          <button type="button" className="btn-secondary" disabled={!hasEditAccess}>
            Regenerate content drafts
          </button>
          <button type="button" className="btn-secondary" disabled={!hasEditAccess}>
            Refresh schedule from priorities
          </button>
        </div>
        {!hasEditAccess && (
          <p className="bs-small text-brand-muted mt-3">
            Editing controls unlock in WunderBrand Blueprint™.
          </p>
        )}
      </section>

      <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
          Open Workbook
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/workbook?reportId=${encodeURIComponent(reportId)}`} className="btn-primary">
            Open Workbook
          </Link>
          {!hasEditAccess && (
            <Link href="/brand-blueprint" className="btn-secondary">
              See What's Included
            </Link>
          )}
        </div>
      </section>
    </section>
  );
}
