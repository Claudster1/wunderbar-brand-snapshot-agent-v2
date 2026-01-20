import type { ContextCoverage } from "@/lib/enrichment/coverage";
import { uncoveredPillars } from "@/lib/enrichment/coverage";

export function shouldShowSnapshotPlusUpgrade(
  coverage: ContextCoverage,
  hasPurchased: boolean
) {
  return !hasPurchased && uncoveredPillars(coverage).length > 0;
}

export function getUpgradeCopy(
  brandName: string,
  primaryPillar: string
) {
  return {
    headline: `Go deeper on ${primaryPillar}`,
    body: `Unlock deeper, more tailored insights for ${brandName} by adding more context. This is where the real clarity comes from.`,
    cta: "Unlock Snapshot+™",
  };
}
