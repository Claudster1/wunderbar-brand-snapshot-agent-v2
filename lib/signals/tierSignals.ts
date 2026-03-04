import { getPrimaryPillar } from "@/lib/pillars/getPrimaryPillar";

type Tier = "snapshot_plus" | "blueprint" | "blueprint_plus";

type Signals = {
  competitiveVulnerabilitySignal: string;
  marketingSpendEfficiencySignal: string;
  revenueImpactStatement: string;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parseMoney(input?: string | null): number | null {
  if (!input) return null;
  const match = input.replace(/,/g, "").match(/(\d+(?:\.\d+)?)(k)?/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return match[2] ? value * 1000 : value;
}

function parseConversionRate(input?: string | null): number | null {
  if (!input) return null;
  const v = input.toLowerCase();
  if (v.includes("don't track") || v.includes("do not track")) return null;
  const match = v.match(/(\d+(?:\.\d+)?)\s*%?/);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0 || n >= 100) return null;
  return n / 100;
}

function monthlyRevenueFromRanges(
  monthlyRange?: string | null,
  annualRange?: string | null,
): number | null {
  const monthlyMap: Record<string, number> = {
    under_5k: 2500,
    "5k_20k": 12500,
    "20k_50k": 35000,
    "50k_150k": 100000,
    "150k_plus": 175000,
  };
  if (monthlyRange && monthlyMap[monthlyRange]) return monthlyMap[monthlyRange];

  const annualMap: Record<string, number> = {
    "under 100k": 50000,
    "100k-500k": 300000,
    "500k-1M": 750000,
    "1M-5M": 3000000,
    "5M+": 7000000,
  };
  if (annualRange && annualMap[annualRange]) return annualMap[annualRange] / 12;
  return null;
}

function pillarRisk(primaryPillar: string): string {
  switch (primaryPillar) {
    case "positioning":
      return "attracting low-fit demand and losing differentiation at first impression";
    case "messaging":
      return "losing response due to unclear value communication";
    case "visibility":
      return "being under-discovered where high-intent buyers are searching";
    case "credibility":
      return "losing trust at the decision stage";
    case "conversion":
      return "leakage between buyer interest and committed action";
    default:
      return "conversion inefficiency";
  }
}

export function buildTierSignals(
  tier: Tier,
  input: Record<string, unknown>,
  reportContent: Record<string, unknown> = {},
): Signals {
  const pillarScores =
    (input.pillarScores as Record<string, number> | undefined) ??
    (reportContent.pillarScores as Record<string, number> | undefined) ??
    {};
  const primaryResult = getPrimaryPillar(pillarScores as any);
  const primaryPillar =
    primaryResult.type === "tie"
      ? primaryResult.pillars?.[0] ?? primaryResult.pillar
      : primaryResult.pillar;
  const primaryLabel = primaryPillar.charAt(0).toUpperCase() + primaryPillar.slice(1);

  const monthlyRevenueRange =
    asString(input.monthlyRevenueRange) ??
    asString(input.monthly_revenue_range) ??
    asString(reportContent.monthlyRevenueRange);
  const annualRevenueRange =
    asString(input.revenueRange) ??
    asString(reportContent.annualRevenueRange);
  const averageTransactionValue =
    asString(input.averageTransactionValue) ??
    asString(input.average_transaction_value) ??
    asString(reportContent.averageTransactionValue);
  const conversionRateEstimate =
    asString(input.conversionRateEstimate) ??
    asString(input.conversion_rate_estimate) ??
    asString(reportContent.conversionRateEstimate);
  const monthlyMarketingBudget =
    asString(input.monthlyMarketingBudget) ??
    asString(input.monthly_marketing_budget) ??
    asString(reportContent.monthlyMarketingBudget);
  const acquisitionChannel =
    asString(input.primaryAcquisitionChannel) ??
    asString(input.topAcquisitionChannel) ??
    asString(input.customerAcquisitionSource);
  const competitivePressure =
    asString(input.competitivePressurePoint) ??
    asString(input.competitive_pressure_point) ??
    asString(input.competitorPressurePoint) ??
    asString(input.biggestChallenge);

  const monthlyRevenue = monthlyRevenueFromRanges(monthlyRevenueRange, annualRevenueRange);
  const avgValue = parseMoney(averageTransactionValue);
  const conversionRate = parseConversionRate(conversionRateEstimate);
  const canEstimate = Boolean(monthlyRevenue && avgValue && conversionRate);
  const estimatedLift = canEstimate ? Math.round((monthlyRevenue as number) * 0.1) : null;

  if (tier === "snapshot_plus") {
    return {
      competitiveVulnerabilitySignal:
        `Your highest competitive exposure is in ${primaryLabel}. ` +
        `${competitivePressure ? `Current pressure point: ${competitivePressure}. ` : ""}` +
        `Competitors are most likely winning where your ${primaryLabel} signal is not translated into consistent buyer-facing evidence. ` +
        `Priority move: close one high-friction gap in this pillar within the next 30 days and track impact on qualified response rate.`,
      marketingSpendEfficiencySignal:
        `${monthlyMarketingBudget ? `At your current budget (${monthlyMarketingBudget}), ` : ""}` +
        `the main efficiency risk is ${pillarRisk(primaryPillar)}.` +
        `${acquisitionChannel ? ` Your acquisition dependency on ${acquisitionChannel} increases this risk if that channel underperforms.` : ""} ` +
        `Priority move: reallocate effort toward the weakest stage in your buyer path before increasing spend.`,
      revenueImpactStatement:
        canEstimate && estimatedLift
          ? `Based on your current inputs, improving ${primaryLabel} execution can directionally represent ~$${estimatedLift.toLocaleString()}/month in upside at conservative assumptions. ` +
            `Use this as a working decision range and validate against your next 60 days of conversion data.`
          : `Your ${primaryLabel} gap likely creates measurable revenue drag through slower conversion and higher trust-building cost. ` +
            `Next step: instrument one KPI tied to this pillar and track weekly change after corrective actions.`,
    };
  }

  if (tier === "blueprint") {
    return {
      competitiveVulnerabilitySignal:
        `Strategic vulnerability map: ${primaryLabel} is the most exploitable gap in your current market stance. ` +
        `Defensive priority is message clarity at high-intent touchpoints; offensive priority is differentiated proof sequencing against competitors. ` +
        `Recommended sequence: stabilize core narrative -> strengthen proof architecture -> deploy channel-specific differentiation.`,
      marketingSpendEfficiencySignal:
        `Spend allocation framework: prioritize investment where it shortens the path from intent to action, not where traffic is easiest to buy. ` +
        `${monthlyMarketingBudget ? `Current budget context (${monthlyMarketingBudget}) supports a staged reallocation model with monthly governance.` : "Use a staged reallocation model with monthly governance."} ` +
        `Decision rule: increase spend only after conversion-stage efficiency improves.`,
      revenueImpactStatement:
        canEstimate && estimatedLift
          ? `Business-case framing: a conservative ${primaryLabel} improvement path indicates directional upside of ~$${estimatedLift.toLocaleString()}/month, with highest sensitivity at conversion checkpoints. ` +
            `Track impact using one leading and one lagging KPI per month.`
          : `Business-case framing: unresolved ${primaryLabel} friction typically extends payback periods and suppresses conversion quality. ` +
            `Set a 90-day improvement thesis with explicit assumptions and review cadence.`,
    };
  }

  return {
    competitiveVulnerabilitySignal:
      `Competitive playbook: ${primaryLabel} is the primary exposure vector. ` +
      `Deploy defend/attack sequencing with trigger conditions (signal loss, response-rate compression, win-rate decline) and 30/60/90-day actions. ` +
      `Define owners, play-level KPIs, and escalation thresholds before rollout.`,
    marketingSpendEfficiencySignal:
      `ROI prioritization system: allocate spend by scenario (conservative/base/aggressive) and gate scale decisions on stage-level efficiency thresholds. ` +
      `${monthlyMarketingBudget ? `Starting budget reference: ${monthlyMarketingBudget}. ` : ""}` +
      `Operate a quarterly reallocation protocol with leading and lagging metric checkpoints.`,
    revenueImpactStatement:
      canEstimate && estimatedLift
        ? `12-month scenario framing: conservative upside baseline is ~$${estimatedLift.toLocaleString()}/month from ${primaryLabel} correction, with base/aggressive cases scaled by adoption and execution velocity. ` +
          `Include risk-of-inaction as missed value compounding by quarter.`
        : `12-month scenario framing: current ${primaryLabel} drag should be modeled as delayed conversion, lower win-rate efficiency, and higher cost-to-convince. ` +
          `Run conservative/base/aggressive cases with quarterly recalibration triggers.`,
  };
}
