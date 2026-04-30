"use client";

import Link from "next/link";
import type { PillarKey } from "@/src/types/pillars";
import { trackEvent } from "@/lib/analytics";
import { fireACEvent } from "@/lib/fireACEvent";
import { trackUpgradeClick } from "@/lib/adTracking";

type Props = {
  primaryPillar: PillarKey;
  monthlyRevenueRange?: string | null;
  annualRevenueRange?: string | null;
  averageTransactionValue?: string | null;
  conversionRateEstimate?: string | null;
  reportId?: string;
  email?: string;
};

function parseMoneyValue(input?: string | null): number | null {
  if (!input) return null;
  const cleaned = input.replace(/,/g, "").trim().toLowerCase();
  const match = cleaned.match(/(\d+(?:\.\d+)?)(k)?/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return match[2] ? value * 1000 : value;
}

function monthlyRevenueFromRange(
  monthlyRevenueRange?: string | null,
  annualRevenueRange?: string | null
): number | null {
  const monthlyMap: Record<string, number> = {
    under_5k: 2500,
    "5k_20k": 12500,
    "20k_50k": 35000,
    "50k_150k": 100000,
    "150k_plus": 175000,
  };
  if (monthlyRevenueRange && monthlyMap[monthlyRevenueRange]) {
    return monthlyMap[monthlyRevenueRange];
  }

  const annualMap: Record<string, number> = {
    "under 100k": 50000,
    "100k-500k": 300000,
    "500k-1M": 750000,
    "1M-5M": 3000000,
    "5M+": 7000000,
  };
  if (annualRevenueRange && annualMap[annualRevenueRange]) {
    return annualMap[annualRevenueRange] / 12;
  }

  return null;
}

function parseConversionRate(input?: string | null): number | null {
  if (!input) return null;
  const v = input.toLowerCase();
  if (v.includes("don't track") || v.includes("do not track")) return null;
  const match = v.match(/(\d+(?:\.\d+)?)\s*%?/);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 100) return null;
  return n / 100;
}

function upliftAssumption(primaryPillar: PillarKey): { label: string; multiplier: number } {
  switch (primaryPillar) {
    case "positioning":
      return { label: "5 percentage-point close-rate improvement", multiplier: 1.25 };
    case "messaging":
      return { label: "3 percentage-point close-rate improvement", multiplier: 1.15 };
    case "credibility":
      return { label: "4 percentage-point close-rate improvement", multiplier: 1.2 };
    case "conversion":
      return { label: "10% conversion-path efficiency gain", multiplier: 1.1 };
    case "visibility":
      return { label: "10% lift in qualified inbound opportunities", multiplier: 1.1 };
    default:
      return { label: "10% performance lift", multiplier: 1.1 };
  }
}

function proxyStatement(primaryPillar: PillarKey): string {
  const map: Record<PillarKey, string> = {
    positioning:
      "Your Positioning score suggests close-rate drag from lower-fit inquiries. The likely cost appears in longer sales cycles and additional conversations needed to close.",
    messaging:
      "Your Messaging score suggests first-contact leakage. The likely cost appears in lower click-through, weaker proposal conversion, and more explanation required to sell.",
    visibility:
      "Your Visibility score suggests missed inbound demand. The likely cost appears in lost discovery where buyers are actively searching.",
    credibility:
      "Your Credibility score suggests trust friction near the decision point. The likely cost appears in late-stage hesitation and fewer committed buyers.",
    conversion:
      "Your Conversion score suggests friction between interest and action. The likely cost appears in drop-off before booking, checkout, or direct response.",
  };
  return map[primaryPillar];
}

export function RevenueImpactStatement({
  primaryPillar,
  monthlyRevenueRange,
  annualRevenueRange,
  averageTransactionValue,
  conversionRateEstimate,
  reportId,
  email,
}: Props) {
  const monthlyRevenue = monthlyRevenueFromRange(monthlyRevenueRange, annualRevenueRange);
  const avgValue = parseMoneyValue(averageTransactionValue);
  const conversionRate = parseConversionRate(conversionRateEstimate);
  const assumption = upliftAssumption(primaryPillar);

  const canEstimate = Boolean(monthlyRevenue && avgValue && conversionRate);
  let estimateText = "";

  if (canEstimate) {
    const baselineClosed = (monthlyRevenue as number) / (avgValue as number);
    const improvedClosed = baselineClosed * assumption.multiplier;
    const incrementalClosed = Math.max(0, improvedClosed - baselineClosed);
    const incrementalRevenue = incrementalClosed * (avgValue as number);
    estimateText = `Based on your inputs, addressing ${primaryPillar} could represent approximately $${Math.round(
      incrementalRevenue
    ).toLocaleString()}/month in additional revenue at conservative estimates.`;
  }

  const onCtaClick = () => {
    trackEvent("UPGRADE_CLICKED", {
      target: "Snapshot+",
      source: "revenue_impact_statement",
      reportId,
      primaryPillar,
      hasEstimate: canEstimate,
    });
    fireACEvent({
      email,
      eventName: "snapshot_revenue_impact_cta_clicked",
      tags: ["snapshot:revenue-impact-clicked"],
      fields: {
        report_id: reportId ?? "",
        primary_pillar: primaryPillar,
        revenue_impact_mode: canEstimate ? "calculated" : "proxy",
      },
    });
    trackUpgradeClick({ fromTier: "snapshot", toTier: "snapshot-plus", value: 497 });
  };

  return (
    <section className="space-y-3 pt-6 border-t border-brand-border">
      <h2 className="bs-h2 mb-0">Revenue Impact Statement</h2>
      <div className="bs-card rounded-xl p-5 sm:p-6 border border-brand-blue/20 bg-brand-blue/5">
        {canEstimate ? (
          <>
            <p className="bs-body-sm text-brand-midnight mb-2">{estimateText}</p>
            <p className="bs-small text-brand-muted">
              Assumption disclosed: {assumption.label}. Actual results depend on implementation
              quality and market conditions.
            </p>
          </>
        ) : (
          <p className="bs-body-sm text-brand-midnight">{proxyStatement(primaryPillar)}</p>
        )}
        <Link
          href="/snapshot-plus?source=revenue_impact_statement"
          onClick={onCtaClick}
          className="inline-flex mt-4 text-sm font-bold text-brand-blue hover:underline"
        >
          See Your Full Results — $497
        </Link>
      </div>
    </section>
  );
}
