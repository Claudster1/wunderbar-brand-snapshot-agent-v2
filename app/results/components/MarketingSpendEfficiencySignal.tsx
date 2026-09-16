"use client";

import Link from "next/link";
import type { PillarKey } from "@/src/types/pillars";
import { trackEvent } from "@/lib/analytics";
import { trackUpgradeClick } from "@/lib/adTracking";
import { fireACEvent } from "@/lib/fireACEvent";
import { normalizeBusinessTypeOrGeneral } from "@/lib/intake/normalizeBusinessType";
import {
  resultsSpendAllocationHint,
  resultsSpendRiskLabel,
} from "@/lib/results/audienceFacingCopy";

type BudgetBand =
  | "under_500"
  | "500_2000"
  | "2000_5000"
  | "5000_plus";

type Props = {
  businessType?: string | null;
  industry?: string | null;
  monthlyMarketingBudget?: string | null;
  primaryPillar: PillarKey;
  reportId?: string;
  email?: string;
};

function budgetLabel(budget: string | null | undefined): string {
  switch (budget) {
    case "under_500":
      return "under $500/month";
    case "500_2000":
      return "$500-$2,000/month";
    case "2000_5000":
      return "$2,000-$5,000/month";
    case "5000_plus":
      return "$5,000+/month";
    default:
      return "your current budget";
  }
}

function toBudgetBand(value?: string | null): BudgetBand | undefined {
  if (
    value === "under_500" ||
    value === "500_2000" ||
    value === "2000_5000" ||
    value === "5000_plus"
  ) {
    return value;
  }
  return undefined;
}

export function MarketingSpendEfficiencySignal({
  businessType,
  industry,
  monthlyMarketingBudget,
  primaryPillar,
  reportId,
  email,
}: Props) {
  const type = normalizeBusinessTypeOrGeneral(businessType);
  const budgetBand = toBudgetBand(monthlyMarketingBudget);
  const hasBudget = Boolean(budgetBand);
  const allocation = resultsSpendAllocationHint(type, industry);
  const risk = resultsSpendRiskLabel(primaryPillar, type, industry);
  const onCtaClick = () => {
    trackEvent("UPGRADE_CLICKED", {
      target: "Snapshot+",
      source: "marketing_spend_efficiency_signal",
      reportId,
      primaryPillar,
      hasBudgetInput: hasBudget,
      businessType: type,
    });
    fireACEvent({
      email,
      eventName: "snapshot_spend_efficiency_cta_clicked",
      tags: ["snapshot:spend-efficiency-clicked"],
      fields: {
        report_id: reportId ?? "",
        primary_pillar: primaryPillar,
        business_type: type,
        monthly_marketing_budget: budgetBand ?? "unknown",
      },
    });
    trackUpgradeClick({ fromTier: "snapshot", toTier: "snapshot-plus", value: 497 });
  };

  return (
    <section className="space-y-3 pt-6 border-t border-brand-border">
      <h2 className="bs-h2 mb-0">Marketing Spend Efficiency Signal</h2>
      <div className="bs-card rounded-xl p-5 sm:p-6 border border-brand-blue/20 bg-brand-blue/5">
        {hasBudget ? (
          <p className="bs-body-sm text-brand-midnight">
            Based on your declared budget ({budgetLabel(budgetBand!)}), your current
            highest-risk inefficiency is <strong>{risk}</strong>. For your business model, the
            best allocation usually prioritizes {allocation}. Snapshot+ shows exactly
            where to focus first so spend works harder before scaling.
          </p>
        ) : (
          <p className="bs-body-sm text-brand-midnight">
            Your score pattern suggests potential spend inefficiency through <strong>{risk}</strong>.
            For your business model, stronger performance typically comes from prioritizing {allocation}
            before adding more channel complexity. Snapshot+ maps this into a clear activation order.
          </p>
        )}
        <Link
          href="/checkout/snapshot-plus?utm_source=wunderbrand_app&utm_medium=results_cta&utm_campaign=snapshot_plus_upgrade&utm_content=spend_efficiency_signal"
          onClick={onCtaClick}
          className="inline-flex mt-4 text-sm font-bold text-brand-blue hover:underline"
        >
          Upgrade to Snapshot+™ — $497
        </Link>
      </div>
    </section>
  );
}

