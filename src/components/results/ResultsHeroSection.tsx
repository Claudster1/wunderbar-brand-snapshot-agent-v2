// Two-column hero: gauge + rating (left) | recommendation card (right) — matches sample layout

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

export function ResultsHeroSection({
  score,
  primaryPillar,
  hasSnapshotPlus,
  userRoleContext,
}: ResultsHeroSectionProps) {
  const rating = getOverallScoreRating(score);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr,minmax(280px,360px)] gap-6 lg:gap-8 items-start">
      {/* Left: Gauge + score + rating + metadata */}
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
          <ScoreGauge value={score} />
        </div>
        <p className="bs-body-sm font-bold text-brand-navy mt-1">
          Rating: {rating}
        </p>
        <p className="bs-small text-brand-muted mt-1">
          {userRoleContext
            ? `Built to support you in ${rolePhrase(userRoleContext)}.`
            : "Your overall alignment across five pillars."}
        </p>
      </div>

      {/* Right: Recommendation card (sample-style) */}
      {!hasSnapshotPlus && (
        <div className="lg:sticky lg:top-6">
          <RecommendationCard primaryPillar={primaryPillar} />
        </div>
      )}
    </section>
  );
}
