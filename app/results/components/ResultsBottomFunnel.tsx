"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProductTier } from "@/components/results/tabConfig";
import { PRICING } from "@/lib/pricing";
import { WUNDERBAR_SUITE_RESULTS_FUNNEL_URL } from "@/lib/wunderbarExternalUrls";
import {
  RESULTS_CTA_COPY,
  RESULTS_TIER_UPSELL,
  type PaidUpsellTier,
} from "@/content/resultsCtaCopy";
import { getOrAssignVariant } from "@/lib/abTesting";
import { fireACEvent } from "@/lib/activeCampaign";
import { trackUpgradeClick } from "@/lib/adTracking";
import { getTrackedCheckoutUrl } from "@/lib/checkoutUrls";

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

function talkExpertHref(reportId: string): string {
  return `https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=results_funnel&utm_campaign=tier_upsell&utm_content=talk_expert${
    reportId ? `&wb_report_id=${encodeURIComponent(reportId)}` : ""
  }`;
}

export function ResultsBottomFunnel({
  tabTier,
  reportId,
  hasSnapshotPlusAccess: _hasSnapshotPlusAccess,
  userEmail,
  primaryPillar,
  stage,
}: Props) {
  const snapshotPlusPrice = PRICING.snapshot_plus.price;
  const [variant, setVariant] = useState<"A" | "B">("A");

  useEffect(() => {
    setVariant(getOrAssignVariant<"A" | "B">("results_cta_variant", ["A", "B"]));
  }, []);

  const copy = RESULTS_CTA_COPY[variant];
  const paidUpsellKey: PaidUpsellTier | null =
    tabTier === "snapshot-plus" || tabTier === "blueprint" || tabTier === "blueprint-plus"
      ? tabTier
      : null;
  const upsell = paidUpsellKey ? RESULTS_TIER_UPSELL[paidUpsellKey] : null;

  const onSuiteExploreClick = () => {
    fireACEvent({
      email: userEmail,
      eventName: "suite_explore_cta_clicked",
      tags: ["snapshot:explore-suite"],
      fields: { primary_pillar: primaryPillar, brand_stage: stage, cta_variant: variant },
    });
  };

  const onTierUpsellClick = () => {
    if (!upsell?.checkoutProduct) return;
    fireACEvent({
      email: userEmail,
      eventName: "tier_upsell_cta_clicked",
      tags: [`upgrade:${upsell.checkoutProduct}`],
      fields: {
        primary_pillar: primaryPillar,
        brand_stage: stage,
        from_tier: tabTier,
        to_product: upsell.checkoutProduct,
      },
    });
    trackUpgradeClick({
      fromTier: tabTier,
      toTier: upsell.checkoutProduct,
      value:
        upsell.checkoutProduct === "blueprint"
          ? PRICING.blueprint.price
          : PRICING.blueprint_plus.price,
    });
  };

  const primaryCheckoutHref =
    upsell?.checkoutProduct != null
      ? (() => {
          const url = getTrackedCheckoutUrl({
            product: upsell.checkoutProduct,
            medium: "results_cta",
            content: `results_bottom_funnel_${upsell.checkoutProduct}`,
            campaign: "tier_upsell",
          });
          const dest = new URL(url, "https://local.invalid");
          if (reportId && /^[0-9a-f-]{36}$/i.test(reportId.trim())) {
            dest.searchParams.set("baseReportId", reportId.trim());
          }
          return dest.pathname + dest.search;
        })()
      : null;

  const downloadsHref = `/results?reportId=${encodeURIComponent(reportId)}&tab=downloads`;

  return (
    <section
      id="next-steps"
      className="results-bottom-funnel scroll-mt-28"
      aria-labelledby="results-bottom-funnel-heading"
    >
      <div className="results-bottom-funnel-inner">
        {tabTier === "snapshot" || !upsell ? (
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
                  href={talkExpertHref(reportId)}
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
              <p className="results-bottom-funnel-eyebrow">{upsell.eyebrow}</p>
              <h2 id="results-bottom-funnel-heading" className="results-bottom-funnel-title">
                {upsell.headline}
              </h2>
              <p className="results-bottom-funnel-lead">{upsell.lead}</p>
            </header>

            <article className="results-bottom-funnel-card results-bottom-funnel-card--featured">
              <ul className="results-bottom-funnel-benefits">
                {upsell.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <div className="results-bottom-funnel-actions">
                {primaryCheckoutHref ? (
                  <a
                    href={primaryCheckoutHref}
                    onClick={onTierUpsellClick}
                    className="wb-cta wb-cta--solid wb-cta--block"
                  >
                    {upsell.primaryCta}
                  </a>
                ) : (
                  <a
                    href={talkExpertHref(reportId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wb-cta wb-cta--solid wb-cta--block"
                    onClick={() => {
                      fireACEvent({
                        email: userEmail,
                        eventName: "snapshot_human_assist_clicked",
                        tags: ["snapshot:human-assist-clicked"],
                        fields: {
                          report_id: reportId,
                          source: "results_bottom_funnel_blueprint_plus",
                          primary_pillar: primaryPillar,
                        },
                      });
                    }}
                  >
                    {upsell.primaryCta}
                  </a>
                )}
                <Link href={downloadsHref} className="wb-cta wb-cta--text results-bottom-funnel-text-cta">
                  Go to Downloads
                </Link>
              </div>
              {tabTier !== "blueprint-plus" ? (
                <p className="results-bottom-funnel-quiet">
                  Prefer to talk it through?{" "}
                  <a href={talkExpertHref(reportId)} target="_blank" rel="noopener noreferrer">
                    Talk to an Expert
                  </a>
                </p>
              ) : null}
            </article>
          </>
        )}
      </div>
    </section>
  );
}
