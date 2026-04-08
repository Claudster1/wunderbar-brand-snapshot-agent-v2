"use client";

import LockedSignalCard from "./LockedSignalCard";
import LockedArchetypeIndicator from "./LockedArchetypeIndicator";
import RevenueImpactStatement from "./RevenueImpactStatement";
import WhatThisMeans from "./WhatThisMeans";
import type { ProductTier } from "./ResultsTabNav";

interface DiagnosticData {
  businessName: string;
  productTier: ProductTier;
  wunderBrandScore: number;
  primaryPillar: string;
  upstreamPillar?: string;
  competitiveVulnerability?: {
    severity: "low" | "medium" | "high";
    summary: string;
    implication: string;
    recommendation: string;
  };
  marketingSpendEfficiency?: {
    severity: "low" | "medium" | "high";
    summary: string;
    implication: string;
    recommendation: string;
  };
  revenueImpactStatement?: string;
  topOpportunity?: string;
  synthesisPoints: Array<{ label: string; content: string }>;
  pillarDependencyExplanation?: string;
}

const UPGRADE_URL = "https://wunderbardigital.com/wunderbrand-suite";
const EXPERT_URL = "https://calendly.com/wunderbardigital/expert-call";

interface FoundationExtrasProps {
  slot: "signals" | "archetypeLocked" | "revenueImpact" | "synthesis";
  data: DiagnosticData;
}

export default function FoundationExtras({ slot, data }: FoundationExtrasProps) {
  const isFree = data.productTier === "snapshot";
  const isBlueprintPlus = data.productTier === "blueprint-plus";

  if (slot === "signals") {
    return (
      <div style={{ marginTop: 24, marginBottom: 8 }}>
        <LockedSignalCard
          signalName="Competitive Vulnerability Signal"
          isLocked={isFree}
          lockedLabel="Identified"
          lockedDescription="Based on your diagnostic patterns, a competitive vulnerability was flagged. This signal indicates where competitors may be gaining ground in categories directly relevant to your brand position."
          upgradeProductUrl={UPGRADE_URL}
          severity={data.competitiveVulnerability?.severity}
          summary={data.competitiveVulnerability?.summary}
          implication={data.competitiveVulnerability?.implication}
          recommendation={data.competitiveVulnerability?.recommendation}
        />
        <LockedSignalCard
          signalName="Marketing Spend Efficiency Signal"
          isLocked={isFree}
          lockedLabel="Identified"
          lockedDescription="Your diagnostic surfaced a signal about how effectively your current brand positioning is supporting your marketing ROI. This is the relationship between brand clarity and what you are spending to generate demand."
          upgradeProductUrl={UPGRADE_URL}
          severity={data.marketingSpendEfficiency?.severity}
          summary={data.marketingSpendEfficiency?.summary}
          implication={data.marketingSpendEfficiency?.implication}
          recommendation={data.marketingSpendEfficiency?.recommendation}
        />
      </div>
    );
  }

  if (slot === "archetypeLocked") {
    if (!isFree) return null;
    return <LockedArchetypeIndicator upgradeProductUrl={UPGRADE_URL} talkToExpertUrl={EXPERT_URL} />;
  }

  if (slot === "revenueImpact") {
    if (isFree) return null;
    if (!data.revenueImpactStatement || !data.topOpportunity) return null;
    return (
      <RevenueImpactStatement
        businessName={data.businessName}
        primaryPillar={data.primaryPillar}
        wunderBrandScore={data.wunderBrandScore}
        impactStatement={data.revenueImpactStatement}
        topOpportunity={data.topOpportunity}
      />
    );
  }

  if (slot === "synthesis") {
    return (
      <WhatThisMeans
        businessName={data.businessName}
        synthesisPoints={data.synthesisPoints}
        pillarDependency={
          isBlueprintPlus && data.upstreamPillar && data.pillarDependencyExplanation
            ? {
                primaryPillar: data.primaryPillar,
                upstreamPillar: data.upstreamPillar,
                explanation: data.pillarDependencyExplanation,
              }
            : undefined
        }
        productTier={data.productTier}
        upgradeProductUrl={isFree ? UPGRADE_URL : undefined}
        talkToExpertUrl={EXPERT_URL}
      />
    );
  }

  return null;
}
