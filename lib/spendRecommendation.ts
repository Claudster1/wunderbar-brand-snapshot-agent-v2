type BudgetBand =
  | "under_500"
  | "500_2000"
  | "2000_5000"
  | "5000_plus"
  | null;

type PaidAdsBudgetBand =
  | "none"
  | "under_1000"
  | "1000_3000"
  | "3000_10000"
  | "10000_plus"
  | null;

type Confidence = "high" | "medium" | "low";

export interface SpendScenario {
  label: "conservative" | "base" | "accelerated";
  monthlySpend: number;
  objectiveFit: string;
  expectedOutcome: string;
  allocation: Array<{ channel: string; percent: number; monthlySpend: number }>;
  unlockConditions: string[];
}

export interface SpendRecommendationContext {
  currentMonthlySpend: number;
  currentSpendBand: string;
  paidAdsMonthlySpend: number;
  paidAdsSpendBand: string;
  confidence: Confidence;
  assumptions: string[];
  budgetConstrainedPlan: {
    focus: string;
    allocation: Array<{ channel: string; percent: number; monthlySpend: number; rationale: string }>;
    nowActions: string[];
    efficiencyGuardrails: string[];
  };
  growthRoadmap: {
    goalFrame: string;
    phases: Array<{ phase: "30_days" | "60_days" | "90_days"; monthlySpend: number; milestone: string }>;
    scenarios: SpendScenario[];
  };
}

type InputLike = Record<string, unknown>;

function toText(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeBudgetBand(v: unknown): BudgetBand {
  const value = toText(v).toLowerCase();
  if (value === "under_500") return "under_500";
  if (value === "500_2000") return "500_2000";
  if (value === "2000_5000") return "2000_5000";
  if (value === "5000_plus") return "5000_plus";
  return null;
}

function normalizePaidAdsBudgetBand(v: unknown): PaidAdsBudgetBand {
  const value = toText(v).toLowerCase();
  if (value === "none") return "none";
  if (value === "under_1000") return "under_1000";
  if (value === "1000_3000") return "1000_3000";
  if (value === "3000_10000") return "3000_10000";
  if (value === "10000_plus") return "10000_plus";
  return null;
}

function monthlySpendFromBand(band: BudgetBand): number {
  switch (band) {
    case "under_500":
      return 350;
    case "500_2000":
      return 1250;
    case "2000_5000":
      return 3500;
    case "5000_plus":
      return 8000;
    default:
      return 1500;
  }
}

function paidSpendFromBand(band: PaidAdsBudgetBand): number {
  switch (band) {
    case "none":
      return 0;
    case "under_1000":
      return 700;
    case "1000_3000":
      return 2000;
    case "3000_10000":
      return 6500;
    case "10000_plus":
      return 12000;
    default:
      return 0;
  }
}

function channelMix(input: InputLike): Array<{ channel: string; percent: number; rationale: string }> {
  const channels = Array.isArray(input.marketingChannels)
    ? input.marketingChannels.map((c) => toText(c).toLowerCase())
    : [];
  const hasPaidSignal =
    toText(input.topAcquisitionChannel).toLowerCase() === "paid_ads" ||
    channels.some((c) => c.includes("paid") || c.includes("ads"));

  const base: Array<{ channel: string; percent: number; rationale: string }> = [
    {
      channel: "owned_content",
      percent: 35,
      rationale: "Compounds discoverability and lowers dependency on paid reach over time.",
    },
    {
      channel: "email_nurture",
      percent: 30,
      rationale: "Converts existing demand efficiently when messaging and proof are clear.",
    },
    {
      channel: hasPaidSignal ? "paid_media" : "organic_social",
      percent: 35,
      rationale: hasPaidSignal
        ? "Creates controllable demand while testing message-market fit."
        : "Builds authority with lower cash burn before scale.",
    },
  ];
  return base;
}

function inferConfidence(input: InputLike): Confidence {
  const signals = [
    toText(input.monthlyMarketingBudget),
    toText(input.monthlyRevenueRange) || toText(input.revenueRange),
    toText(input.averageTransactionValue),
    toText(input.conversionRateEstimate),
    toText(input.topAcquisitionChannel),
  ];
  const count = signals.filter(Boolean).length;
  if (count >= 4) return "high";
  if (count >= 2) return "medium";
  return "low";
}

function allocationForSpend(
  monthlySpend: number,
  mix: Array<{ channel: string; percent: number; rationale: string }>,
) {
  return mix.map((m) => ({
    channel: m.channel,
    percent: m.percent,
    monthlySpend: Math.round((monthlySpend * m.percent) / 100),
  }));
}

function primaryGoal(input: InputLike): string {
  const goals = Array.isArray(input.primaryGoals) ? input.primaryGoals.map((g) => toText(g).toLowerCase()) : [];
  if (goals.some((g) => g.includes("lead"))) return "increase qualified lead volume";
  if (goals.some((g) => g.includes("sale") || g.includes("revenue"))) return "increase conversion-driven revenue";
  if (goals.some((g) => g.includes("awareness") || g.includes("visibility"))) return "increase category visibility";
  return "improve demand quality and conversion efficiency";
}

export function buildSpendRecommendationContext(input: InputLike): SpendRecommendationContext {
  const budgetBand = normalizeBudgetBand(input.monthlyMarketingBudget);
  const paidBand = normalizePaidAdsBudgetBand(input.paidAdsBudgetBand);
  const currentMonthlySpend = monthlySpendFromBand(budgetBand);
  const paidAdsMonthlySpend = paidSpendFromBand(paidBand);
  const confidence = inferConfidence(input);
  const mix = channelMix(input);
  const goal = primaryGoal(input);

  const conservativeSpend = Math.round(currentMonthlySpend * 1.0);
  const baseSpend = Math.round(currentMonthlySpend * 1.45);
  const acceleratedSpend = Math.round(currentMonthlySpend * 2.1);

  return {
    currentMonthlySpend,
    currentSpendBand: budgetBand ?? "estimated",
    paidAdsMonthlySpend,
    paidAdsSpendBand: paidBand ?? "not_specified",
    confidence,
    assumptions: [
      "Performance ranges assume stable offer quality and landing-page clarity.",
      "Scale recommendations are gated by conversion efficiency, not traffic volume alone.",
      "If attribution or funnel tracking is weak, budget increases should wait until instrumentation is fixed.",
    ],
    budgetConstrainedPlan: {
      focus: `Use current budget to ${goal} before adding channel complexity.`,
      allocation: mix.map((m) => ({
        channel: m.channel,
        percent: m.percent,
        monthlySpend: Math.round((currentMonthlySpend * m.percent) / 100),
        rationale: m.rationale,
      })),
      nowActions: [
        "Prioritize one conversion path per channel with a clear, stage-specific CTA.",
        "Run weekly creative/message tests on the weakest conversion step.",
        "Reallocate spend monthly toward channels with strongest qualified-intent signals.",
      ],
      efficiencyGuardrails: [
        "Do not increase total spend unless conversion rates improve for two consecutive weeks.",
        "Pause low-intent campaigns when downstream pipeline quality drops.",
        "Maintain at least 20% of budget for testing new messaging angles.",
      ],
    },
    growthRoadmap: {
      goalFrame: `Roadmap to ${goal} with controlled risk and stage-gated investment.`,
      phases: [
        {
          phase: "30_days",
          monthlySpend: conservativeSpend,
          milestone: "Stabilize measurement, CTA clarity, and baseline channel efficiency.",
        },
        {
          phase: "60_days",
          monthlySpend: baseSpend,
          milestone: "Scale best-performing channel pair and expand winning message variants.",
        },
        {
          phase: "90_days",
          monthlySpend: acceleratedSpend,
          milestone: "Add incremental channels only after core funnel efficiency is proven.",
        },
      ],
      scenarios: [
        {
          label: "conservative",
          monthlySpend: conservativeSpend,
          objectiveFit: "Efficiency-first",
          expectedOutcome: "Improve cost efficiency and lead quality while reducing wasted spend.",
          allocation: allocationForSpend(conservativeSpend, mix),
          unlockConditions: [
            "Tracking confidence is medium+",
            "Primary CTA path is instrumented end-to-end",
          ],
        },
        {
          label: "base",
          monthlySpend: baseSpend,
          objectiveFit: "Balanced growth + efficiency",
          expectedOutcome: "Increase qualified pipeline with controlled CAC/CPL movement.",
          allocation: allocationForSpend(baseSpend, mix),
          unlockConditions: [
            "Conservative scenario KPIs hold for at least 2 cycles",
            "Creative testing cadence is operational weekly",
          ],
        },
        {
          label: "accelerated",
          monthlySpend: acceleratedSpend,
          objectiveFit: "Growth-led scale",
          expectedOutcome: "Expand reach and conversion volume with higher testing intensity.",
          allocation: allocationForSpend(acceleratedSpend, mix),
          unlockConditions: [
            "Base scenario maintains efficiency within target range",
            "Sales or nurture capacity can absorb additional demand",
          ],
        },
      ],
    },
  };
}
