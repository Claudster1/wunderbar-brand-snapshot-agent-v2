import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";

type IntakeTier = "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus";

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function bool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function hasTruthyString(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

function hasNonEmptyArray(v: unknown): boolean {
  return Array.isArray(v) && v.length > 0;
}

/** Which required captures are already satisfied by prior structured intake JSON. */
export function getPriorSatisfiedCaptureKeys(
  prior: Record<string, unknown>,
  tier: IntakeTier,
): Set<CaptureKey> {
  const done = new Set<CaptureKey>();

  if (str(prior.businessType)) {
    done.add("business_type_classifier");
  }

  const website = prior.website;
  if (website === null || website === false) {
    done.add("website_presence");
  } else if (hasTruthyString(website)) {
    done.add("website_presence");
  }

  const socials = prior.socials;
  if (socials === null || (Array.isArray(socials) && socials.length === 0)) {
    done.add("social_platform_presence");
  } else if (hasNonEmptyArray(socials)) {
    done.add("social_platform_presence");
  }

  const channels = prior.marketingChannels ?? prior.customerAcquisitionSource;
  if (hasNonEmptyArray(channels) || str(prior.customerAcquisitionSource)) {
    done.add("additional_marketing_surfaces");
    done.add("primary_acquisition_channel");
    if (tier !== "snapshot") {
      done.add("marketing_channel_mix");
    }
  }

  if (str(prior.monthlyRevenueRange) || str(prior.revenueRange)) {
    done.add("monthly_revenue_range");
  }

  if (str(prior.averageTransactionValue) || typeof prior.averageTransactionValue === "number") {
    done.add("average_transaction_value");
  }

  if (str(prior.conversionRateEstimate) || typeof prior.conversionRateEstimate === "number") {
    done.add("conversion_rate_estimate");
  }

  if (str(prior.topAcquisitionChannel) || hasNonEmptyArray(prior.customerAcquisitionSource)) {
    done.add("primary_acquisition_channel");
  }

  if (
    str(prior.monthlyMarketingBudget) ||
    str(prior.paidAdsBudgetBand) ||
    prior.monthlyMarketingBudget === null
  ) {
    done.add("monthly_marketing_budget");
  }

  if (str(prior.contentCreationCapacity)) {
    done.add("content_creation_capacity");
  }

  if (
    hasNonEmptyArray(prior.competitorNames) ||
    str(prior.whatMakesYouDifferent) ||
    str(prior.biggestChallenge)
  ) {
    done.add("competitive_pressure_point");
  }

  const hasList = bool(prior.hasEmailList);
  if (hasList !== null) {
    done.add("has_email_list");
  }

  const hasMagnet = bool(prior.hasLeadMagnet);
  if (hasMagnet !== null) {
    done.add("has_lead_magnet");
  }

  const hasCta = bool(prior.hasClearCTA);
  if (hasCta !== null || str(prior.offerClarity)) {
    done.add("has_clear_cta");
  }

  if (hasNonEmptyArray(prior.marketingChannels) && tier !== "snapshot") {
    done.add("marketing_channel_mix");
  }

  return done;
}

export function applyPriorAnswersToCaptureStates<T extends { key: CaptureKey; completed: boolean }>(
  states: T[],
  prior: Record<string, unknown> | null | undefined,
  tier: IntakeTier,
): T[] {
  if (!prior || Object.keys(prior).length === 0) return states;
  const satisfied = getPriorSatisfiedCaptureKeys(prior, tier);
  return states.map((s) => (satisfied.has(s.key) ? { ...s, completed: true } : s));
}
