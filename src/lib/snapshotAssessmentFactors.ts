// Maps Wundy™ / AssessmentInput-shaped answers into the 25 internal 0–5 factors
// used by calculateBrandSnapshotScores. Explicit numeric factor overrides win when present.

export type SnapshotFactorKey =
  | "marketClarity"
  | "targetCustomerDefinition"
  | "uniqueValue"
  | "marketDifferentiation"
  | "offerClarity"
  | "coreMessageStrength"
  | "websiteMessagingClarity"
  | "socialMessagingConsistency"
  | "storyClarity"
  | "benefitClarity"
  | "webPresence"
  | "socialPresence"
  | "seoHealth"
  | "contentVelocity"
  | "discoverability"
  | "proofPoints"
  | "reviews"
  | "socialProof"
  | "brandProfessionalism"
  | "websiteTrustSignals"
  | "ctaClarity"
  | "funnelStrength"
  | "leadCapture"
  | "offerMessaging"
  | "salesReadiness";

function clamp5(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, Math.round(n)));
}

function textStrength(s: unknown): number {
  if (typeof s !== "string") return 0;
  const w = s
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (w >= 22) return 5;
  if (w >= 12) return 4;
  if (w >= 6) return 3;
  if (w >= 2) return 2;
  if (w >= 1) return 1;
  return 0;
}

function hasNonEmptyString(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

/** Wundy enums: "very clear" | "somewhat clear" | "unclear" */
function triClarity(s: unknown): number {
  if (typeof s !== "string") return 0;
  const t = s.trim().toLowerCase();
  if (t.includes("very") && t.includes("clear")) return 5;
  if (t.includes("somewhat")) return 3;
  if (t.includes("unclear") || t.includes("not sure")) return 1;
  if (t.length > 0) return 2;
  return 0;
}

/** "strong" | "somewhat" | "inconsistent" */
function brandConsistencyScore(s: unknown): number {
  if (typeof s !== "string") return 0;
  const t = s.trim().toLowerCase();
  if (t.includes("strong")) return 5;
  if (t.includes("somewhat")) return 3;
  if (t.includes("inconsistent")) return 1;
  if (t.length > 0) return 2;
  return 0;
}

/** "very confident" | "somewhat confident" | "not confident" */
function visualConfidenceScore(s: unknown): number {
  if (typeof s !== "string") return 0;
  const t = s.trim().toLowerCase();
  if (t.includes("very") && t.includes("confident")) return 5;
  if (t.includes("somewhat")) return 3;
  if (t.includes("not confident")) return 1;
  if (t.length > 0) return 2;
  return 0;
}

export function hasRealWebsite(answers: Record<string, unknown>): boolean {
  const w = answers.website;
  if (typeof w !== "string") return false;
  const t = w.trim().toLowerCase();
  if (!t || t === "none" || t === "n/a" || t === "na" || t === "no") return false;
  return t.includes("http") || t.includes(".") || t.length >= 4;
}

function socialCount(answers: Record<string, unknown>): number {
  const s = answers.socials;
  if (!Array.isArray(s)) return 0;
  return s.filter((x) => typeof x === "string" && x.trim().length > 0).length;
}

function channelsLower(answers: Record<string, unknown>): string[] {
  const m = answers.marketingChannels;
  if (!Array.isArray(m)) return [];
  return m.map((x) => String(x).toLowerCase());
}

function channelSeoScore(channels: string[]): number {
  const hasSeo = channels.some((c) => c.includes("seo") && !c.includes("aeo"));
  const hasAeo = channels.some((c) => c.includes("aeo") || c.includes("answer engine"));
  if (hasSeo && hasAeo) return 5;
  if (hasAeo || hasSeo) return 4;
  if (channels.length >= 3) return 3;
  if (channels.length >= 1) return 2;
  return 1;
}

function contentVelocityFromCapacity(answers: Record<string, unknown>): number {
  const c = answers.contentCreationCapacity;
  if (typeof c !== "string") return 2;
  const t = c.toLowerCase();
  if (t.includes("10_plus") || t.includes("10+")) return 5;
  if (t.includes("5_10") || t.includes("5-10")) return 4;
  if (t.includes("2_5") || t.includes("2-5")) return 3;
  if (t.includes("under_2") || t.includes("under 2")) return 2;
  return 2;
}

function acquisitionCount(answers: Record<string, unknown>): number {
  const a = answers.customerAcquisitionSource;
  if (!Array.isArray(a)) return 0;
  return a.filter((x) => typeof x === "string" && x.trim().length > 0).length;
}

function competitorScore(answers: Record<string, unknown>): number {
  const c = answers.competitorNames;
  if (!Array.isArray(c)) return 1;
  const n = c.filter((x) => typeof x === "string" && x.trim().length > 0).length;
  if (n >= 3) return 5;
  if (n === 2) return 4;
  if (n === 1) return 3;
  return 1;
}

function primaryGoalsStrength(answers: Record<string, unknown>): number {
  const g = answers.primaryGoals;
  if (!Array.isArray(g)) return 0;
  const n = g.filter((x) => typeof x === "string" && x.trim().length > 0).length;
  return clamp5(n * 2);
}

function leadMagnetDetailBonus(answers: Record<string, unknown>): number {
  const d = answers.leadMagnetDetails;
  if (!d || typeof d !== "object") return 0;
  const o = d as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const summary = typeof o.summary === "string" ? o.summary.trim() : "";
  if (title.length >= 3 || summary.split(/\s+/).length >= 4) return 1;
  return 0;
}

/**
 * Derives 0–5 factor scores from structured assessment fields (Wundy JSON shape).
 */
export function deriveSnapshotFactorsFromAssessment(
  answers: Record<string, unknown>
): Record<SnapshotFactorKey, number> {
  const industry = textStrength(answers.industry);
  const geo = hasNonEmptyString(answers.geographicScope) ? 4 : 1;
  const aud = hasNonEmptyString(answers.audienceType) ? 4 : 1;
  const marketClarity = clamp5(Math.round((Math.max(industry, 1) + geo + aud) / 2.2));

  const cust = Math.max(textStrength(answers.currentCustomers), textStrength(answers.idealCustomers));
  const targetCustomerDefinition = clamp5(
    cust + (answers.idealDiffersFromCurrent === true ? 1 : 0)
  );

  const uniqueValue = Math.max(textStrength(answers.whatMakesYouDifferent), 1);
  const marketDifferentiation = competitorScore(answers);
  const offerClarityEnum = triClarity(answers.offerClarity);

  const messagingTri = triClarity(answers.messagingClarity);
  const consistency = brandConsistencyScore(answers.brandConsistency);
  const site = hasRealWebsite(answers);
  const socials = socialCount(answers);
  const channels = channelsLower(answers);

  const websiteMessagingClarity = site ? Math.max(consistency, 2) : 1;
  const socialMessagingConsistency = socials >= 1 ? Math.max(consistency, 2) : 1;
  const storyClarity = Math.max(
    textStrength(answers.missionStatement),
    textStrength(answers.brandOriginStory),
    textStrength(answers.visionStatement),
    1
  );
  const benefitClarity = Math.max(
    textStrength(answers.keyTopicsAndThemes),
    primaryGoalsStrength(answers),
    1
  );

  const webPresence = site ? 5 : 1;
  const socialPresence = socials === 0 ? 1 : socials === 1 ? 3 : 5;
  const seoHealth = channelSeoScore(channels);
  const contentVelocity = contentVelocityFromCapacity(answers);
  const discoverability = clamp5(1 + channels.length + Math.min(3, acquisitionCount(answers)));

  const testimonials = answers.hasTestimonials === true ? 4 : answers.hasTestimonials === false ? 1 : 2;
  const caseStudies = answers.hasCaseStudies === true ? 4 : answers.hasCaseStudies === false ? 1 : 2;
  const guidelines = answers.hasBrandGuidelines === true ? 1 : 0;
  const visual = visualConfidenceScore(answers.visualConfidence);
  const brandProfessionalism = clamp5(Math.round((visual + consistency + guidelines * 2 + (site ? 1 : 0)) / 2));

  const ctaKnown = answers.hasClearCTA === true ? 5 : answers.hasClearCTA === false ? 2 : 3;
  const emailList = answers.hasEmailList === true ? 2 : answers.hasEmailList === false ? 0 : 1;
  const magnet = answers.hasLeadMagnet === true ? 2 + leadMagnetDetailBonus(answers) : answers.hasLeadMagnet === false ? 0 : 1;
  const infra = emailList + magnet + (answers.hasClearCTA === true ? 2 : answers.hasClearCTA === false ? 0 : 1);

  return {
    marketClarity,
    targetCustomerDefinition,
    uniqueValue: clamp5(uniqueValue),
    marketDifferentiation,
    offerClarity: offerClarityEnum,

    coreMessageStrength: messagingTri,
    websiteMessagingClarity: clamp5(websiteMessagingClarity),
    socialMessagingConsistency: clamp5(socialMessagingConsistency),
    storyClarity: clamp5(storyClarity),
    benefitClarity: clamp5(benefitClarity),

    webPresence: clamp5(webPresence),
    socialPresence: clamp5(socialPresence),
    seoHealth: clamp5(seoHealth),
    contentVelocity: clamp5(contentVelocity),
    discoverability: clamp5(discoverability),

    proofPoints: clamp5(testimonials),
    reviews: clamp5(testimonials),
    socialProof: clamp5(caseStudies),
    brandProfessionalism: clamp5(brandProfessionalism),
    websiteTrustSignals: clamp5(site ? ctaKnown : 1),

    ctaClarity: clamp5(ctaKnown),
    funnelStrength: clamp5(Math.round((offerClarityEnum + messagingTri + infra) / 2.5)),
    leadCapture: clamp5(2 + infra),
    offerMessaging: offerClarityEnum,
    salesReadiness: clamp5(2 + Math.min(3, acquisitionCount(answers))),
  };
}

/** Use explicit numeric factor from answers when present; otherwise derived. */
export function resolveSnapshotFactor(
  answers: Record<string, unknown>,
  key: SnapshotFactorKey,
  derived: number
): number {
  if (Object.prototype.hasOwnProperty.call(answers, key)) {
    const v = answers[key];
    if (typeof v === "number") {
      if (!Number.isFinite(v)) return 0;
      return Math.min(5, Math.max(0, v));
    }
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) {
        return Math.min(5, Math.max(0, n));
      }
    }
  }
  return Math.min(5, Math.max(0, Math.round(derived)));
}
