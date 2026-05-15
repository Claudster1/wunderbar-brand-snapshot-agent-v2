/**
 * Heuristic fallback when LLM transcript extraction fails or returns sparse JSON.
 * Fills minimum viable fields so scoring can proceed.
 */

import type { IntakeMessage } from "@/lib/intake/buildIntakeTopicResume";

type BusinessType =
  | "service_b2b"
  | "service_b2c"
  | "retail"
  | "ecommerce"
  | "saas"
  | "local_service";

function inferBusinessType(userCorpus: string): BusinessType {
  const c = userCorpus.toLowerCase();
  if (/\bsaas|software|app|subscription|platform\b/.test(c)) return "saas";
  if (/\be-?commerce|shopify|dtc|amazon|online store|product brand\b/.test(c)) return "ecommerce";
  if (/\bretail|storefront|boutique|restaurant\b/.test(c)) return "retail";
  if (/\blocal service|clinic|dental|contractor\b/.test(c)) return "local_service";
  if (/\bb2c|consumers\b/.test(c)) return "service_b2c";
  if (/\b(consulting|agency|agencies|marketing|b2b|smbs?|businesses)\b/.test(c)) return "service_b2b";
  return "service_b2b";
}

function firstUserLine(messages: IntakeMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  return (first?.content || "").trim();
}

function extractFirstName(line: string): string {
  const cleaned = line
    .replace(/^(hi[,!.]?\s*)?/i, "")
    .replace(/^(my name is|i'?\s*m|i am|call me)\s+/i, "")
    .trim();
  const word = cleaned.split(/\s+/)[0] || line;
  if (!word || word.length > 30) return "Founder";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function extractBusinessName(messages: IntakeMessage[]): string {
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    const t = m.content || "";
    const called = t.match(/called\s+([A-Z][A-Za-z0-9&.'\-\s]{2,60})/i);
    if (called?.[1]) return called[1].trim().replace(/\.$/, "");
    const running = t.match(/running a business called\s+([A-Z][A-Za-z0-9&.'\-\s]{2,60})/i);
    if (running?.[1]) return running[1].trim().replace(/\.$/, "");
  }
  const users = messages.filter((m) => m.role === "user").map((m) => m.content || "");
  for (const u of users.slice(1, 6)) {
    if (/^[A-Z][A-Za-z0-9&.'\-\s]{2,50}$/.test(u.trim()) && !/^(yes|no|ok|thanks)$/i.test(u.trim())) {
      return u.trim();
    }
  }
  return "Your Business";
}

function extractWebsite(users: string): string | null {
  const m = users.match(/\b(https?:\/\/[^\s]+|www\.[a-z0-9][-a-z0-9.]+(?:\/[^\s]*)?)/i);
  if (m?.[1]) return m[1].replace(/[.,;]+$/, "");
  const domain = users.match(/\b([a-z0-9][-a-z0-9]{0,48}\.(com|io|ai|co|org|net|app))\b/i);
  if (domain?.[1]) return `https://${domain[1]}`;
  return null;
}

function extractSocials(users: string): string[] {
  const platforms: string[] = [];
  const map: [RegExp, string][] = [
    [/\blinked\s*in|linkedin\b/i, "linkedin"],
    [/\bfacebook|fb\b/i, "facebook"],
    [/\binstagram|ig\b/i, "instagram"],
    [/\btiktok\b/i, "tiktok"],
    [/\byoutube|yt\b/i, "youtube"],
    [/\bthreads\b/i, "threads"],
    [/\btwitter|\bx\b/i, "x"],
  ];
  for (const [re, name] of map) {
    if (re.test(users)) platforms.push(name);
  }
  return [...new Set(platforms)];
}

function lastSubstantiveUserAnswer(messages: IntakeMessage[], pattern: RegExp): string {
  const users = messages.filter((m) => m.role === "user");
  for (let i = users.length - 1; i >= 0; i--) {
    const t = (users[i].content || "").trim();
    if (t.length >= 3 && pattern.test(t)) return t.slice(0, 500);
  }
  return "";
}

export function buildFallbackAnswersFromMessages(
  messages: IntakeMessage[],
): Record<string, unknown> {
  const users = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join("\n");
  const all = messages.map((m) => m.content || "").join("\n");
  const businessType = inferBusinessType(users);
  const website = extractWebsite(users);
  const socials = extractSocials(users);
  const preRevenue = /\b(just launch|no clients? yet|no customers? yet|pre-?revenue|not selling yet)\b/i.test(
    users,
  );

  const currentCustomers =
    lastSubstantiveUserAnswer(messages, /launch|no clients?|customers? today|serving|smbs?/i) ||
    "Early-stage; building first clients.";
  const idealCustomers =
    lastSubstantiveUserAnswer(messages, /ideal|would love|perfect fit|targeting|smbs?|startups?/i) ||
    currentCustomers;
  const biggestChallenge =
    lastSubstantiveUserAnswer(messages, /challenge|launching|scaling|struggle/i) || "Growing visibility and trust.";
  const differentiator =
    lastSubstantiveUserAnswer(messages, /proprietary|different|unique|ai|platform|makes you/i) ||
    "Distinct positioning in the market.";

  return {
    userName: extractFirstName(firstUserLine(messages)),
    businessName: extractBusinessName(messages),
    businessType,
    primaryRevenueDriver: null,
    industry: "Marketing and professional services",
    geographicScope: "national",
    audienceType: "B2B",
    website,
    socials,
    competitorNames: /\bagenc/i.test(all) ? ["Other marketing agencies"] : [],
    currentCustomers,
    idealCustomers,
    idealDiffersFromCurrent: currentCustomers !== idealCustomers,
    additionalDistinctSegmentsNote: null,
    customerAcquisitionSource: extractSocials(users).length ? ["social_media"] : ["referral"],
    primaryGoals: ["Build brand awareness", "Attract ideal clients"],
    biggestChallenge,
    whatMakesYouDifferent: differentiator,
    offerClarity: "somewhat clear",
    messagingClarity: "somewhat clear",
    missionStatement: lastSubstantiveUserAnswer(messages, /why|passion|mission|fortune 500/i) || null,
    visionStatement: null,
    coreValues: null,
    brandVoiceDescription:
      lastSubstantiveUserAnswer(messages, /voice|tone|approachable|expert/i) || "Professional and approachable",
    writingPreferences: null,
    hasBrandGuidelines: false,
    guidelineDetails: null,
    brandConsistency: "somewhat",
    hasTestimonials: false,
    hasCaseStudies: false,
    credibilityDetails: null,
    thoughtLeadershipActivity: {
      hasActivity: false,
      activities: [],
      expertTopics: lastSubstantiveUserAnswer(messages, /known for|first ai|ai-driven/i) || null,
      aspirations: null,
    },
    hasEmailList: /\bemail\b/i.test(users),
    hasLeadMagnet: false,
    leadMagnetDetails: null,
    hasClearCTA: true,
    marketingChannels: [...new Set([...socials, ...( /\bseo\b/i.test(users) ? ["seo"] : []), ...( /\bemail\b/i.test(users) ? ["email"] : [])])],
    visualConfidence: "somewhat confident",
    brandPersonalityWords: ["trusted", "expert"],
    archetypeSignals: {
      decisionStyle: "pragmatic",
      authoritySource: "expertise",
      riskOrientation: "balanced",
      customerExpectation: "clarity",
    },
    yearsInBusiness: preRevenue ? "0-1" : "1-3",
    brandOriginStory: null,
    teamSize: "1-5",
    revenueRange: preRevenue ? "pre-revenue" : "under 100k",
    monthlyRevenueRange: preRevenue ? "under_5k" : null,
    averageTransactionValue: null,
    conversionRateEstimate: null,
    topAcquisitionChannel: socials.includes("linkedin") ? "social_media" : "referral",
    monthlyMarketingBudget: null,
    paidAdsBudgetBand: "none",
    paidAdsPrimaryObjective: null,
    contentCreationCapacity: null,
    previousBrandWork: "DIY",
    userRoleContext: "founder",
    servicesInterest: "not_now",
    expertConversation: false,
    contentOptIn: null,
    implementationPrioritiesNow: null,
    implementationPrioritiesScaling: null,
    mentionedAssets: [],
  };
}

/** Merge LLM extract with fallback; fallback fills only null/empty gaps. */
export function mergeExtractedWithFallback(
  extracted: Record<string, unknown>,
  messages: IntakeMessage[],
): Record<string, unknown> {
  const fallback = buildFallbackAnswersFromMessages(messages);
  const out = { ...fallback, ...extracted };

  const fillIfEmpty = (key: string) => {
    const v = out[key];
    if (v === null || v === undefined || v === "") {
      out[key] = fallback[key];
    }
    if (Array.isArray(v) && v.length === 0 && Array.isArray(fallback[key])) {
      out[key] = fallback[key];
    }
  };

  for (const key of Object.keys(fallback)) {
    fillIfEmpty(key);
  }

  return out;
}
