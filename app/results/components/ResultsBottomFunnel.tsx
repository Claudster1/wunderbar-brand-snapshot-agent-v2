"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ReportTierUpgradeCTAs } from "@/components/results/ReportTierUpgradeCTAs";
import { HumanAssistCTA } from "@/app/results/components/HumanAssistCTA";
import type { ProductTier } from "@/components/results/tabConfig";
import { PRICING } from "@/lib/pricing";
import { WUNDERBAR_SUITE_COMPARE_URL } from "@/lib/wunderbarExternalUrls";
import { RESULTS_CTA_COPY } from "@/content/resultsCtaCopy";
import { getOrAssignVariant } from "@/lib/abTesting";
import { fireACEvent } from "@/lib/activeCampaign";
import { trackUpgradeClick } from "@/lib/adTracking";

const WUNDERBAR_HOME =
  "https://www.wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=results_funnel&utm_campaign=brand_continuity&utm_content=home";

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
  tabTier,
  reportId,
  hasSnapshotPlusAccess,
  userEmail,
  businessName,
  businessType,
  primaryPillar,
  brandAlignmentScore,
  stage,
}: Props) {
  const downloadsHref = `/results?reportId=${encodeURIComponent(reportId)}&tab=downloads`;
  const snapshotPlusPrice = PRICING.snapshot_plus.price;
  const [variant, setVariant] = useState<"A" | "B">("A");

  useEffect(() => {
    setVariant(getOrAssignVariant<"A" | "B">("results_cta_variant", ["A", "B"]));
  }, []);

  const copy = RESULTS_CTA_COPY[variant];

  const onSnapshotPlusClick = () => {
    fireACEvent({
      email: userEmail,
      eventName: "snapshot_upgrade_cta_clicked",
      tags: ["snapshot:clicked-upgrade"],
      fields: { primary_pillar: primaryPillar, brand_stage: stage, cta_variant: variant },
    });
    trackUpgradeClick({ fromTier: "snapshot", toTier: "snapshot-plus", value: 497 });
    const q =
      reportId && /^[0-9a-f-]{36}$/i.test(reportId.trim())
        ? `?baseReportId=${encodeURIComponent(reportId.trim())}`
        : "";
    window.location.href = `/snapshot-plus${q}`;
  };

  return (
    <section
      id="next-steps"
      className="results-bottom-funnel scroll-mt-28"
      aria-labelledby="results-bottom-funnel-heading"
    >
      <div className="results-bottom-funnel-inner">
        <header className="results-bottom-funnel-intro">
          <p className="results-bottom-funnel-eyebrow">Wunderbar Digital</p>
          <h2 id="results-bottom-funnel-heading" className="results-bottom-funnel-title">
            {hasSnapshotPlusAccess
              ? "Activate what you’ve built"
              : "Turn this diagnostic into a system your brand can run"}
          </h2>
          <p className="results-bottom-funnel-lead">
            {hasSnapshotPlusAccess
              ? "Your suite is live in this workspace — download deliverables, refine in the workbook, or talk with our team when you want hands-on support."
              : `Your score shows where leverage lives. Snapshot+ adds strategic depth, messaging frameworks, and an AI prompt pack — from $${snapshotPlusPrice.toLocaleString()}.`}
          </p>
          <a
            href={WUNDERBAR_HOME}
            target="_blank"
            rel="noopener noreferrer"
            className="results-bottom-funnel-brand-link"
          >
            wunderbardigital.com
            <span aria-hidden> →</span>
          </a>
        </header>

        <div className="results-bottom-funnel-grid">
          {!hasSnapshotPlusAccess ? (
            <article className="results-bottom-funnel-card results-bottom-funnel-card--featured">
              <p className="results-bottom-funnel-card-kicker">Recommended next step</p>
              <h3 className="results-bottom-funnel-card-title">{PRICING.snapshot_plus.label}</h3>
              <p className="results-bottom-funnel-card-body">{copy.body}</p>
              <div className="results-bottom-funnel-actions">
                <button type="button" onClick={onSnapshotPlusClick} className="results-bottom-funnel-btn-primary">
                  {copy.primaryCta}
                </button>
                <Link href="/brand-snapshot-suite" className="results-bottom-funnel-btn-ghost">
                  {copy.secondaryCta}
                </Link>
              </div>
            </article>
          ) : null}

          <article className="results-bottom-funnel-card">
            <p className="results-bottom-funnel-card-kicker">Upgrade paths</p>
            <h3 className="results-bottom-funnel-card-title">Go deeper in the suite</h3>
            <p className="results-bottom-funnel-card-body">
              Compare tiers, download assets, or move into Blueprint when you want standards, activation, and
              execution deliverables.
            </p>
            <div className="results-bottom-funnel-embed">
              <ReportTierUpgradeCTAs
                tier={tabTier}
                utmSource="results_page"
                downloadsHref={downloadsHref}
                suppressSnapshotPlusPrimary={tabTier === "snapshot" || !hasSnapshotPlusAccess}
              />
            </div>
            <Link
              href={WUNDERBAR_SUITE_COMPARE_URL}
              className="results-bottom-funnel-text-cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              Compare the full WunderBrand Suite™ on wunderbardigital.com
            </Link>
          </article>

          <article className="results-bottom-funnel-card results-bottom-funnel-card--expert">
            <div className="results-bottom-funnel-embed results-bottom-funnel-embed--expert">
              <HumanAssistCTA
                source="results_page"
                reportId={reportId}
                email={userEmail}
                businessName={businessName}
                businessType={businessType}
                primaryPillar={primaryPillar}
                brandAlignmentScore={brandAlignmentScore}
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
