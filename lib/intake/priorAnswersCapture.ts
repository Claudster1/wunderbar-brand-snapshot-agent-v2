import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";

type IntakeTier = "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus";

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function bool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
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

  if (str(prior.audienceType)) {
    done.add("audience_type_classifier");
  }

  if (str(prior.userRoleContext)) {
    done.add("user_role_context");
  }

  if (str(prior.teamSize) || typeof prior.teamSize === "number") {
    done.add("team_size");
  }

  if (str(prior.industry)) {
    done.add("industry");
  }

  if (str(prior.geographicScope)) {
    done.add("geographic_scope");
  }

  if (str(prior.yearsInBusiness) || typeof prior.yearsInBusiness === "number") {
    done.add("years_in_business");
  }

  if (str(prior.offerClarity)) {
    done.add("offer_clarity");
  }

  if (str(prior.messagingClarity)) {
    done.add("messaging_clarity");
  }

  if (typeof prior.hasTestimonials === "boolean" || typeof prior.hasCaseStudies === "boolean") {
    done.add("credibility_proof");
  }

  if (str(prior.visualConfidence)) {
    done.add("visual_confidence");
  }

  const tl = prior.thoughtLeadershipActivity;
  if (tl && typeof tl === "object" && !Array.isArray(tl) && typeof (tl as { hasActivity?: unknown }).hasActivity === "boolean") {
    done.add("thought_leadership");
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

  // Broader channel lists answer "surfaces / mix" — not the primary discovery channel alone.
  const channels = prior.marketingChannels ?? prior.customerAcquisitionSource;
  if (hasNonEmptyArray(channels) || str(prior.customerAcquisitionSource)) {
    done.add("additional_marketing_surfaces");
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

  // Primary acquisition needs an explicit top channel or acquisition-source field — not marketingChannels alone.
  if (str(prior.topAcquisitionChannel) || hasNonEmptyArray(prior.customerAcquisitionSource) || str(prior.customerAcquisitionSource)) {
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

  // Competitive pressure = why buyers choose others. Competitor names / differentiation / challenge
  // are related narrative topics but must not skip the win-loss pressure capture on upgrade.
  if (
    str(prior.competitivePressurePoint) ||
    str(prior.competitivePressure) ||
    str(prior.winLossReason)
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
