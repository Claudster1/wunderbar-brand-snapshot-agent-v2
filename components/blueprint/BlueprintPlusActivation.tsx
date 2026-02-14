// components/blueprint/BlueprintPlusActivation.tsx
// Component for displaying Blueprint+ activation prompts

"use client";

import { blueprintPlusPromptPacks } from "@/blueprintPlus/advancedPromptPacks";
import { canAccessBlueprintPlus, ProductAccess } from "@/lib/accessControl";
import type { BlueprintEnrichmentInput } from "@/lib/enrichment/types";
import type { ContextCoverage } from "@/lib/enrichment/coverage";
import { shouldShowSnapshotPlusUpgrade, getUpgradeCopy } from "@/lib/enrichment/upgrade";
import { BlueprintPlusLocked } from "./BlueprintPlusLocked";
import { PromptPackGrid } from "@/components/blueprintPlus/PromptPackGrid";

export function BlueprintPlusActivation({
  access,
  userRole,
  enrichmentData,
  coverage,
}: {
  access: ProductAccess;
  userRole?: string;
  enrichmentData?: BlueprintEnrichmentInput | null;
  coverage?: ContextCoverage;
}) {
  if (!canAccessBlueprintPlus(access)) {
    return <BlueprintPlusLocked userRole={userRole} />;
  }

  const hasSavedEnrichment = Boolean(enrichmentData);
  const hasSnapshotPlus = access.hasSnapshotPlus;
  const upgradeCopy = getUpgradeCopy("your brand", "your primary pillar");

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h2 className="text-3xl font-semibold text-brand-navy">
          Blueprint+™ Activation
        </h2>

        <p className="mt-3 text-brand-midnight leading-relaxed max-w-3xl">
          Your Blueprint+™ activates the strategic foundations identified in your
          WunderBrand Snapshot™ and Snapshot+™. Each prompt pack below is purpose-built
          to translate insight into action — across messaging, visibility,
          credibility, and conversion.
        </p>
      </header>

      {hasSavedEnrichment && (
        <div className="notice">
          You have saved Blueprint+™ context. You can resume refining it at any
          time.
        </div>
      )}

      <PromptPackGrid packs={blueprintPlusPromptPacks} />

      {coverage && shouldShowSnapshotPlusUpgrade(coverage, hasSnapshotPlus) && (
        <div className="mt-8 rounded-xl border p-6 bg-slate-50">
          <h3 className="text-lg font-semibold">
            {upgradeCopy.headline}
          </h3>
          <p className="mt-2">{upgradeCopy.body}</p>

          <a
            href="/snapshot-plus"
            className="inline-block mt-4 btn-primary"
          >
            {upgradeCopy.cta}
          </a>
        </div>
      )}
    </main>
  );
}
