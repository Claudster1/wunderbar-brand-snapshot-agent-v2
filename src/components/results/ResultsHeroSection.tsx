import { ScoreGauge } from "@/src/components/ScoreGauge";
import { getOverallScoreRating } from "@/src/lib/results/scoreRating";
import { RecommendationCard } from "@/src/components/results/RecommendationCard";
import { TooltipIcon } from "@/components/ui/Tooltip";
import { UserRoleContext } from "@/src/types/snapshot";
import { rolePhrase } from "@/src/lib/roleLanguage";

interface ResultsHeroSectionProps {
  score: number;
  primaryPillar: string;
  hasSnapshotPlus: boolean;
  userRoleContext?: UserRoleContext;
}

function getScoreInterpretation(score: number): string {
  if (score >= 80)
    return "Your brand demonstrates strong alignment across pillars — the focus now is refinement, consistency at scale, and protecting the competitive advantage you've built.";
  if (score >= 60)
    return "Your brand has a solid foundation with clear areas for strategic improvement — targeted investment in 1–2 pillars will create cascading impact across the system.";
  if (score >= 40)
    return "Your brand has identifiable strengths to build on, but material gaps in alignment are limiting growth — a focused, pillar-by-pillar approach will unlock the most value.";
  return "Your brand has significant foundational work ahead — the good news is that clarity at this stage creates disproportionate returns on every dollar and hour invested.";
}

export function ResultsHeroSection({
  score,
  primaryPillar,
  hasSnapshotPlus,
  userRoleContext,
}: ResultsHeroSectionProps) {
  const rating = getOverallScoreRating(score);
  const interpretation = getScoreInterpretation(score);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr,minmax(280px,360px)] gap-6 lg:gap-8 items-start">
      {/* Left: Gauge + score + rating + interpretation */}
      <div className="bs-card rounded-xl p-5 sm:p-6 flex flex-col items-center text-center lg:items-center lg:text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <h1 className="bs-h2 mb-0">
            WunderBrand Score™
          </h1>
          <TooltipIcon
            content={
              <>
                Your overall alignment across all five pillars. 0–100 scale: higher means your brand is clearer and more consistent. The needle shows where you land.
              </>
            }
          />
        </div>
        <div className="flex justify-center my-2 min-h-0 w-full">
          <ScoreGauge value={score} showLegend />
        </div>
        <p className="bs-body-sm font-bold text-brand-navy mt-1">
          {rating}
        </p>
        <p className="bs-body-sm text-brand-midnight mt-3 leading-relaxed max-w-lg">
          {interpretation}
        </p>
        {userRoleContext && (
          <p className="bs-small text-brand-muted mt-2">
            Calibrated for your role in {rolePhrase(userRoleContext)}.
          </p>
        )}
      </div>

      {/* Right: Recommendation card */}
      {!hasSnapshotPlus && (
        <div className="lg:sticky lg:top-6">
          <RecommendationCard primaryPillar={primaryPillar} />
        </div>
      )}
    </section>
  );
}
