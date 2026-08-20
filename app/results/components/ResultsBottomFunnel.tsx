"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HumanAssistCTA } from "@/app/results/components/HumanAssistCTA";
import { ResultsSmsOptIn } from "@/app/results/components/ResultsSmsOptIn";
import type { ProductTier } from "@/components/results/tabConfig";
import { PRICING } from "@/lib/pricing";
import { WUNDERBAR_SUITE_COMPARE_URL } from "@/lib/wunderbarExternalUrls";
import { RESULTS_CTA_COPY } from "@/content/resultsCtaCopy";
import { getOrAssignVariant } from "@/lib/abTesting";
import { fireACEvent } from "@/lib/activeCampaign";
import { trackUpgradeClick } from "@/lib/adTracking";
import { getTrackedCheckoutUrl } from "@/lib/checkoutUrls";
import { getPersistedEmail } from "@/lib/persistEmail";
import {
  getEmailMarketingOptInPreference,
  getSmsOptInPreference,
} from "@/lib/smsConsent";

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
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    setVariant(getOrAssignVariant<"A" | "B">("results_cta_variant", ["A", "B"]));
  }, []);

  const copy = RESULTS_CTA_COPY[variant];

  const onSnapshotPlusClick = async () => {
    fireACEvent({
      email: userEmail,
      eventName: "snapshot_upgrade_cta_clicked",
      tags: ["snapshot:clicked-upgrade"],
      fields: { primary_pillar: primaryPillar, brand_stage: stage, cta_variant: variant },
    });
    trackUpgradeClick({ fromTier: "snapshot", toTier: "snapshot-plus", value: 497 });

    setCheckoutLoading(true);
    try {
      const email = userEmail || getPersistedEmail() || undefined;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productKey: "snapshot_plus",
          email,
          smsOptedIn: getSmsOptInPreference(),
          emailMarketingOptedIn: getEmailMarketingOptInPreference(),
          metadata: {
            ...(reportId && /^[0-9a-f-]{36}$/i.test(reportId.trim())
              ? { base_report_id: reportId.trim() }
              : {}),
            utm_source: "wunderbar_app",
            utm_medium: "results_funnel",
            utm_campaign: "snapshot_plus_upgrade",
            utm_content: "results_bottom_funnel",
          },
        }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("No checkout URL");
      window.location.href = data.url;
    } catch {
      const url = getTrackedCheckoutUrl({
        product: "snapshot-plus",
        medium: "results_cta",
        content: "results_bottom_funnel_fallback",
      });
      const dest = new URL(url, window.location.origin);
      if (reportId && /^[0-9a-f-]{36}$/i.test(reportId.trim())) {
        dest.searchParams.set("baseReportId", reportId.trim());
      }
      window.location.href = dest.pathname + dest.search;
    }
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
              <p className="results-bottom-funnel-eyebrow">Recommended next step</p>
              <h2 id="results-bottom-funnel-heading" className="results-bottom-funnel-title">
                {PRICING.snapshot_plus.label}
              </h2>
              <p className="results-bottom-funnel-lead">
                {`You’ve got your diagnostic. Snapshot+ expands on it with strategic depth, messaging frameworks, and an AI prompt pack — so you can grow and scale with clarity, from $${snapshotPlusPrice.toLocaleString()}.`}
              </p>
            </header>

            <div className="results-bottom-funnel-layout">
              <article className="results-bottom-funnel-card results-bottom-funnel-card--featured">
                <p className="results-bottom-funnel-card-body">{copy.body}</p>
                <div className="results-bottom-funnel-actions">
                  <button
                    type="button"
                    onClick={() => void onSnapshotPlusClick()}
                    disabled={checkoutLoading}
                    className="wb-cta wb-cta--solid wb-cta--block"
                  >
                    {checkoutLoading ? "Starting checkout…" : copy.primaryCta}
                  </button>
                  <Link href="/brand-snapshot-suite" className="wb-cta wb-cta--text results-bottom-funnel-text-cta">
                    {copy.secondaryCta}
                  </Link>
                </div>
                <ResultsSmsOptIn reportId={reportId} email={userEmail} />
              </article>

              <aside className="results-bottom-funnel-aside">
                <h3 className="results-bottom-funnel-aside-title">Prefer a guided walkthrough?</h3>
                <p className="results-bottom-funnel-aside-body">
                  Talk through your score and priority actions with our team.
                </p>
                <HumanAssistCTA {...expertProps} compact />
                <a
                  href={WUNDERBAR_SUITE_COMPARE_URL}
                  className="wb-cta wb-cta--text results-bottom-funnel-aside-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Compare the full Suite™
                </a>
              </aside>
            </div>
          </>
        ) : (
          <>
            <header className="results-bottom-funnel-intro">
              <p className="results-bottom-funnel-eyebrow">Your suite</p>
              <h2 id="results-bottom-funnel-heading" className="results-bottom-funnel-title">
                Activate what you’ve built
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
