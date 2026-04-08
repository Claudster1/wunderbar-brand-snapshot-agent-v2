"use client";

import Link from "next/link";
import type { PillarKey } from "@/src/types/pillars";
import { trackEvent } from "@/lib/analytics";
import { trackUpgradeClick } from "@/lib/adTracking";
import { fireACEvent } from "@/lib/fireACEvent";

type BudgetBand =
  | "under_500"
  | "500_2000"
  | "2000_5000"
  | "5000_plus";

type Props = {
  businessType?: string | null;
  monthlyMarketingBudget?: string | null;
  primaryPillar: PillarKey;
  reportId?: string;
  email?: string;
};

function normalizeBusinessType(input?: string | null): string {
  if (!input) return "general";
  const v = String(input).toLowerCase();
  if (v.includes("service_b2b")) return "service_b2b";
  if (v.includes("service_b2c")) return "service_b2c";
  if (v.includes("retail")) return "retail";
  if (v.includes("ecommerce")) return "ecommerce";
  if (v.includes("saas") || v.includes("software")) return "saas";
  if (v.includes("local_service")) return "local_service";
  return "general";
}

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

function recommendationByBusinessType(type: string): string {
  switch (type) {
    case "service_b2b":
      return "LinkedIn thought leadership, email nurturing, and case-study-driven conversion assets";
    case "service_b2c":
      return "social proof content, local search visibility, and booking-focused conversion paths";
    case "retail":
      return "local search/GBP visibility, repeat-purchase retention, and in-store demand content";
    case "ecommerce":
      return "high-intent product content, conversion optimization, and retention/repeat-purchase flows";
    case "saas":
      return "product education content, activation-focused onboarding, and conversion path optimization";
    case "local_service":
      return "Google Business/local SEO, trust-signal content, and booking/show-rate optimization";
    default:
      return "the channels and content formats most aligned to your buyer behavior and conversion path";
  }
}

function pillarRisk(primaryPillar: PillarKey): string {
  switch (primaryPillar) {
    case "positioning":
      return "attracting attention from lower-fit buyers";
    case "messaging":
      return "losing response at first contact";
    case "visibility":
      return "being under-discovered where buyers are already searching";
    case "credibility":
      return "losing trust at the decision point";
    case "conversion":
      return "leakage between interest and action";
    default:
      return "conversion inefficiency";
  }
}

export function MarketingSpendEfficiencySignal({
  businessType,
  monthlyMarketingBudget,
  primaryPillar,
  reportId,
  email,
}: Props) {
  const type = normalizeBusinessType(businessType);
  const budgetBand = toBudgetBand(monthlyMarketingBudget);
  const hasBudget = Boolean(budgetBand);
  const allocation = recommendationByBusinessType(type);
  const risk = pillarRisk(primaryPillar);
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
            highest-leverage allocation usually prioritizes {allocation}. Snapshot+ shows exactly
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
          href="/snapshot-plus?source=spend_efficiency_signal"
          onClick={onCtaClick}
          className="inline-flex mt-4 text-sm font-bold text-brand-blue hover:underline"
        >
          See Your Full Results — $497
        </Link>
      </div>
    </section>
  );
}

