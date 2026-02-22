import { PillarKey } from "@/types/pillars";
import { ResultsState } from "@/src/types/results";

type CopyContext = {
  primaryPillar: string;
  tiePillars?: [string, string];
};

const pillarNudgeMap: Record<string, string> = {
  positioning: "define a market position the right customers choose instantly",
  messaging: "codify a messaging system that compounds trust at every touchpoint",
  visibility: "close the discovery gap where high-intent buyers are searching",
  credibility: "build the trust infrastructure that accelerates every conversion",
  conversion: "remove the structural friction between interest and revenue",
};

export function getUpgradeNudgeCopy({ primaryPillar, tiePillars }: CopyContext) {
  if (tiePillars) {
    return {
      headline: "Two pillars are competing for your attention \u2014 Snapshot+\u2122 resolves which one to tackle first",
      body: `Your diagnostic shows equal strategic leverage across ${tiePillars.join(
        " and "
      )}. Snapshot+\u2122 analyzes the downstream impact of each to determine which move creates the most cascading improvement.`,
      detail:
        "You\u2019ll receive a full strategic report with commercial impact analysis, before-and-after examples, a prioritized action plan, and 8 AI prompts calibrated to your brand.",
      note: "Priority is determined by system-wide impact, not surface-level scores.",
      ctaLabel: "Get your strategic roadmap with Snapshot+\u2122",
    };
  }

  return {
    headline: `Your highest-leverage move: ${pillarNudgeMap[primaryPillar] || primaryPillar}`,
    body: `Your diagnostic identified ${primaryPillar} as the pillar where focused investment will create the most cascading impact across your entire brand system.`,
    detail:
      "Snapshot+\u2122 transforms this score into a strategic roadmap \u2014 with commercial impact analysis, concrete before-and-after examples, a prioritized 30/60/90-day action plan, and 8 AI prompts calibrated to your brand.",
    note: "Priority is determined by system-wide impact and downstream effects.",
    ctaLabel: "Get your Snapshot+\u2122 strategy report",
  };
}

export function getUpgradeCopy(
  pillar: string,
  stage: "early" | "scaling",
  businessName: string
) {
  const name = businessName?.trim() || "your brand";
  const pillarMap: Record<string, string> = {
    positioning: "define a market position the right customers choose instantly",
    messaging: "build a messaging system that compounds trust at every touchpoint",
    visibility: "become discoverable where high-intent buyers are searching",
    credibility: "build the trust infrastructure that accelerates conversions",
    conversion: "close the gap between brand interest and revenue",
  };

  return {
    headline: `${name}\u2019s biggest opportunity: ${pillarMap[pillar]}`,
    body:
      stage === "early"
        ? `Snapshot+\u2122 transforms this diagnostic into a strategic roadmap \u2014 giving ${name} the clarity and frameworks to build this foundation correctly from the start, before costly patterns set in.`
        : `Snapshot+\u2122 turns this gap into a prioritized strategy \u2014 showing ${name} exactly what to fix, in what order, and why it matters before growth compounds the problem.`,
  };
}

export function getSnapshotPlusCTA(
  brandName: string,
  primaryPillar: PillarKey,
  stage: ResultsState["stage"]
) {
  const pillarLabel = primaryPillar[0].toUpperCase() + primaryPillar.slice(1);

  return {
    headline: `Strengthen ${brandName}\u2019s ${pillarLabel} with a strategic roadmap`,
    subcopy:
      stage === "early"
        ? `Get a prioritized strategy with specific actions, before-and-after examples, and an action plan calibrated to ${brandName}\u2019s stage and industry.`
        : `Turn this diagnostic into an implementation-ready system \u2014 with concrete recommendations, competitive context, and a 30/60/90-day action plan.`,
    button: "Get your Snapshot+\u2122 strategy report"
  };
}
