import { BlueprintEnrichmentInput } from "@/lib/enrichment/types";
import { BrandStage } from "@/lib/scoring/scoreEngine";

type Props = {
  brandName: string;
  score: number;
  stage: BrandStage;
  enrichment?: BlueprintEnrichmentInput;
};

export function generatePositioningPillar({
  brandName,
  score,
  stage,
  enrichment,
}: Props) {
  const hasFocus = !!enrichment?.primaryOffer;
  const hasAudience = !!enrichment?.primaryAudience;

  return {
    title: "Positioning",
    score,
    summary: hasFocus
      ? `${brandName} has a clearly defined focus, allowing for sharper differentiation.`
      : `${brandName} shows early positioning signals, with an opportunity to sharpen focus.`,
    expanded: {
      insight:
        stage === "early"
          ? `Your positioning is forming. With clearer prioritization, ${brandName} can reduce confusion and accelerate traction.`
          : `Your positioning is established, but refinement will improve memorability and conversion.`,
      appliedContext: hasFocus || hasAudience
        ? [
            hasFocus && `Primary offer prioritized: ${enrichment?.primaryOffer}`,
            hasAudience &&
              `Primary audience emphasized: ${enrichment?.primaryAudience}`,
          ].filter(Boolean)
        : [],
      nextMove: hasFocus
        ? `Pressure-test this positioning across homepage, sales copy, and social bios.`
        : `Define a single primary offer and audience to anchor your positioning.`,
    },
  };
}
