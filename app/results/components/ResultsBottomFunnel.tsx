"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HumanAssistCTA } from "@/app/results/components/HumanAssistCTA";
import type { ProductTier } from "@/components/results/tabConfig";
import { PRICING } from "@/lib/pricing";
import { WUNDERBAR_SUITE_RESULTS_FUNNEL_URL } from "@/lib/wunderbarExternalUrls";
import { RESULTS_CTA_COPY } from "@/content/resultsCtaCopy";
import { getOrAssignVariant } from "@/lib/abTesting";
import { fireACEvent } from "@/lib/activeCampaign";

type Props = {
  tabTier: ProductTier;
  reportId: string;
  hasSnapshotPlusAccess: boolean;
  userEmail?: string;
  businessName: string;
  businessType: string | null;
  primaryPillar: string;
  brandAlignmentScore: number;
  stage: string;
};

export function ResultsBottomFunnel({
  tabTier: _tabTier,
  reportId,
  hasSnapshotPlusAccess,
  userEmail,
  businessName,
  businessType,
  primaryPillar,
  brandAlignmentScore,
  stage,
}: Props) {
  const snapshotPlusPrice = PRICING.snapshot_plus.price;
  const [variant, setVariant] = useState<"A" | "B">("A");

  useEffect(() => {
    setVariant(getOrAssignVariant<"A" | "B">("results_cta_variant", ["A", "B"]));
  }, []);

  const copy = RESULTS_CTA_COPY[variant];

  const onSuiteExploreClick = () => {
    fireACEvent({
      email: userEmail,
      eventName: "suite_explore_cta_clicked",
      tags: ["snapshot:explore-suite"],
      fields: { primary_pillar: primaryPillar, brand_stage: stage, cta_variant: variant },
    });
  };

  const expertProps = {
    source: "results_page" as const,
    reportId,
    email: userEmail,
    businessName,
    businessType,
    primaryPillar,
    brandAlignmentScore,
  };

  return (
    <section
      id="next-steps"
      className="results-bottom-funnel scroll-mt-28"
      aria-labelledby="results-bottom-funnel-heading"
    >
      <div className="results-bottom-funnel-inner">
        {!hasSnapshotPlusAccess ? (
          <>
            <header className="results-bottom-funnel-intro">
              <p className="results-bottom-funnel-eyebrow">Recommended Next Step</p>
              <h2 id="results-bottom-funnel-heading" className="results-bottom-funnel-title">
                See How to Build on Your Snapshot™
              </h2>
              <p className="results-bottom-funnel-lead">
                {copy.body} Snapshot+™ starts at ${snapshotPlusPrice.toLocaleString()}.
              </p>
            </header>

            <article className="results-bottom-funnel-card results-bottom-funnel-card--featured">
              <div className="results-bottom-funnel-actions">
                <a
                  href={WUNDERBAR_SUITE_RESULTS_FUNNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onSuiteExploreClick}
                  className="wb-cta wb-cta--solid wb-cta--block"
                >
                  {copy.primaryCta}
                </a>
              </div>
              <p className="results-bottom-funnel-quiet">
                Prefer to talk it through?{" "}
                <a
                  href={`https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=results_funnel&utm_campaign=product_comparison&utm_content=talk_expert${reportId ? `&wb_report_id=${encodeURIComponent(reportId)}` : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    fireACEvent({
                      email: userEmail,
                      eventName: "snapshot_human_assist_clicked",
                      tags: ["snapshot:human-assist-clicked"],
                      fields: {
                        report_id: reportId,
                        source: "results_bottom_funnel_quiet",
                        primary_pillar: primaryPillar,
                      },
                    });
                  }}
                >
                  Talk to an Expert
                </a>
              </p>
            </article>
          </>
        ) : (
          <>
            <header className="results-bottom-funnel-intro">
              <p className="results-bottom-funnel-eyebrow">Your Suite</p>
              <h2 id="results-bottom-funnel-heading" className="results-bottom-funnel-title">
                Activate What You’ve Built
              </h2>
              <p className="results-bottom-funnel-lead">
                Download deliverables, refine in the workbook, or talk with our team when you want
                hands-on support.
              </p>
            </header>
            <div className="results-bottom-funnel-layout">
              <article className="results-bottom-funnel-card">
                <Link
                  href={`/results?reportId=${encodeURIComponent(reportId)}&tab=downloads`}
                  className="wb-cta wb-cta--solid wb-cta--block"
                >
                  Go to Downloads
                </Link>
              </article>
              <aside className="results-bottom-funnel-aside">
                <HumanAssistCTA {...expertProps} compact />
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
