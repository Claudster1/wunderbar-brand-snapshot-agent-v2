// src/pdf/snapshotPlusSections.ts
// Main PDF section builder for Snapshot+

import { SnapshotPDFSection, SnapshotPlusPDFPayload } from "@/types/snapshotPDF";
import { buildContextConfidenceSection } from "./sections/contextConfidence";
import { buildPillarSection } from "./sections/pillarSectionBuilder";

export { SnapshotPDFSection, SnapshotPlusPDFPayload };

export function buildSnapshotPlusPDF(payload: SnapshotPlusPDFPayload) {
  const {
    brandName,
    primaryPillar,
    stage,
    context,
    pillarInsights,
    pillarRecommendations,
  } = payload;

  const sections: SnapshotPDFSection[] = [];

  // Context first
  sections.push(buildContextConfidenceSection(context));

  // Pillars (primary expanded, others secondary)
  (Object.keys(pillarInsights) as Array<keyof typeof pillarInsights>).forEach(
    (pillar) => {
      sections.push(
        buildPillarSection({
          pillar,
          brandName,
          isPrimary: pillar === primaryPillar,
          insight: pillarInsights[pillar],
          recommendations: pillarRecommendations[pillar],
          stage,
        })
      );
    }
  );

  return sections;
}
