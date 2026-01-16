// src/pdf/components/PrimaryPillar.tsx
// Primary pillar section component for PDF documents

import { SectionHeader } from "./SectionHeader";
import { Callout } from "./Callout";
import { InsightBlock } from "./InsightBlock";

export function PrimaryPillar({ pillar }: any) {
  return (
    <>
      <SectionHeader>
        Primary Focus Area: {pillar.name}
      </SectionHeader>

      <Callout>
        This pillar has the greatest impact on your overall Brand Alignment Score™
        and represents the clearest opportunity for near-term improvement.
      </Callout>

      <InsightBlock title="What We Observed">
        {pillar.insight}
      </InsightBlock>

      <InsightBlock title="Why This Matters">
        {pillar.whyItMatters}
      </InsightBlock>

      <InsightBlock title="Strategic Direction">
        {pillar.recommendation}
      </InsightBlock>
    </>
  );
}
