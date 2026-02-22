import { ContextCoverageResult } from "@/src/engine/contextCoverage";

export function getContextSummaryCopy(
  coverage: ContextCoverageResult
): string {
  if (coverage.confidenceLevel === "high") {
    return "This report is grounded in comprehensive brand context — the insights and recommendations are highly specific to your business, stage, and competitive environment.";
  }

  if (coverage.confidenceLevel === "medium") {
    return "This report reflects solid brand context with a few areas where richer inputs would sharpen specificity. The strategic direction is reliable; adding depth to the thinner areas would make recommendations more precise.";
  }

  return "This report provides directional strategic guidance based on the context available. The patterns identified are meaningful, but enriching your inputs would significantly increase the precision and actionability of every recommendation.";
}

export function shouldSuggestRefinement(
  coverage: ContextCoverageResult
): boolean {
  return coverage.confidenceLevel !== "high";
}

export function getRefinementCTA(
  primaryPillar: string,
  brandName: string
): string {
  return `Sharpen ${brandName}\u2019s ${primaryPillar} analysis with deeper context`;
}
