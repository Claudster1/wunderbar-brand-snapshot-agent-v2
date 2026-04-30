import Link from "next/link";

type ProductTier = "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";

type Props = {
  productTier: ProductTier;
  reportId: string;
  email?: string;
};

export function DownloadsTabContent({ productTier, reportId, email }: Props) {
  const emailParam = email ? `&email=${encodeURIComponent(email)}` : "";
  const snapshotHref = `/api/snapshot/pdf?id=${encodeURIComponent(reportId)}`;
  const snapshotPlusHref = `/api/snapshot-plus/pdf?id=${encodeURIComponent(reportId)}`;
  const blueprintDocHref = (type: string, tier: "blueprint" | "blueprint-plus") =>
    `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=${encodeURIComponent(type)}&tier=${tier}${emailParam}`;
  const scheduleXlsxHref = `/api/results/activation-schedule?reportId=${encodeURIComponent(reportId)}${emailParam}`;
  const baseBlueprintTier: "blueprint" | "blueprint-plus" =
    productTier === "blueprint_plus" ? "blueprint-plus" : "blueprint";
  const baseBlueprintLabel = productTier === "blueprint_plus" ? "WunderBrand Blueprint+™" : "WunderBrand Blueprint™";

  if (productTier === "snapshot" || productTier === "snapshot_plus") {
    return (
      <section className="space-y-6">
        <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
          <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-2">
            Downloads
          </p>
          <h2 className="bs-h3 mb-2">Foundation brief download</h2>
          <p className="bs-body-sm text-brand-muted max-w-3xl">
            Snapshot+ includes the foundation brief. Full document packs and schedule exports unlock in
            WunderBrand Blueprint™ and Blueprint+™.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <a href={productTier === "snapshot_plus" ? snapshotPlusHref : snapshotHref} className="btn-secondary">
              Download Foundation Brief
            </a>
            <Link href="/brand-blueprint" className="btn-primary">
              See What's Included
            </Link>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
        <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-2">
          Available Downloads
        </p>
        <h2 className="bs-h3 mb-2">Team-ready document set</h2>
        <p className="bs-body-sm text-brand-muted">
          Download role-specific artifacts for leadership, marketing, sales, and implementation handoff.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <a href={blueprintDocHref("complete", baseBlueprintTier)} className="btn-secondary">Complete {baseBlueprintLabel}</a>
          <a href={blueprintDocHref("executive", baseBlueprintTier)} className="btn-secondary">Executive Summary</a>
          <a href={blueprintDocHref("messaging", baseBlueprintTier)} className="btn-secondary">Brand Messaging Playbook</a>
          <a href={blueprintDocHref("prompts", baseBlueprintTier)} className="btn-secondary">AI Prompt Library</a>
          <a href={blueprintDocHref("voice-checklist", baseBlueprintTier)} className="btn-secondary">Voice Checklist</a>
          {productTier === "blueprint_plus" && (
            <>
              <a href={blueprintDocHref("activation", "blueprint-plus")} className="btn-secondary">90-Day Activation Plan</a>
              <a href={blueprintDocHref("digital", "blueprint-plus")} className="btn-secondary">Digital Marketing Strategy</a>
              <a href={blueprintDocHref("competitive", "blueprint-plus")} className="btn-secondary">Competitive Intelligence Brief</a>
              <a href={blueprintDocHref("battle-cards", "blueprint-plus")} className="btn-secondary">Sales Battle Cards</a>
              <a href={blueprintDocHref("standards", "blueprint-plus")} className="btn-secondary">Brand Standards Guide</a>
            </>
          )}
        </div>
      </section>
      {productTier === "blueprint_plus" && (
        <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
          <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-2">
            Role-Based Packs
          </p>
          <p className="bs-body-sm text-brand-muted mb-4">
            Quick role pack downloads for leadership, marketing, sales, and design handoff.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a href={blueprintDocHref("executive", "blueprint-plus")} className="btn-secondary">Leadership Pack</a>
            <a href={blueprintDocHref("messaging", "blueprint-plus")} className="btn-secondary">Marketing Pack</a>
            <a href={blueprintDocHref("battle-cards", "blueprint-plus")} className="btn-secondary">Sales Battle Cards</a>
            <a href={blueprintDocHref("standards", "blueprint-plus")} className="btn-secondary">Design Pack</a>
          </div>
        </section>
      )}
      <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
        <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-2">
          Activation Tools
        </p>
        <p className="bs-body-sm text-brand-muted mb-4">
          Export your activation schedule in spreadsheet format for team collaboration and weekly updates.
        </p>
        <a href={scheduleXlsxHref} className="btn-secondary">
          Download Activation Schedule (.xlsx)
        </a>
      </section>
    </section>
  );
}
