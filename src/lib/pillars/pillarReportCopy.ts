import type { PillarKey } from "./pillarCopy";
import {
  isConsumerFacingResultsContext,
  resolveResultsVertical,
} from "@/lib/results/audienceFacingCopy";
import type { ConsumerVerticalId } from "@/lib/intake/consumerVertical";

export type BrandStage = "early" | "scaling" | "growing";

export function getPillarStageCopy(
  pillar: PillarKey,
  businessName: string,
  stage: BrandStage
): string {
  const name = businessName;
  const copy: Record<PillarKey, Record<BrandStage, string>> = {
    positioning: {
      early: `${name}\u2019s positioning today determines acquisition cost for the next 2\u20133 years \u2014 brands that define their position early spend significantly less to attract the right customers.`,
      scaling: `As ${name} adds channels, team members, and campaigns, positioning inconsistency becomes a multiplier problem \u2014 every misalignment compounds across every touchpoint.`,
      growing: `At ${name}\u2019s scale, how the market understands your brand drives margin, retention, and competitive defensibility \u2014 sharpening positioning protects the premium you\u2019ve earned.`,
    },
    messaging: {
      early: `Getting ${name}\u2019s core narrative right now creates a compounding asset \u2014 each new touchpoint reinforces the last instead of diluting it.`,
      scaling: `Inconsistent messaging across ${name}\u2019s channels means each interaction starts from scratch rather than building on previous ones \u2014 the cumulative trust gap widens with every new campaign.`,
      growing: `At ${name}\u2019s size, messaging precision is a margin lever \u2014 the gap between \u2018they\u2019re good\u2019 and \u2018they\u2019re the obvious choice\u2019 is often one sentence, consistently deployed.`,
    },
    visibility: {
      early: `Making ${name} discoverable in the right 2\u20133 channels now creates the organic foundation that makes every future marketing dollar work harder.`,
      scaling: `If ${name} isn\u2019t appearing where high-intent buyers are searching, even strong positioning and messaging never get the chance to work \u2014 visibility is the prerequisite for every other pillar.`,
      growing: `As buying behavior shifts toward AI-powered discovery, ${name}\u2019s visibility strategy must evolve \u2014 the brands that appear in AI-generated answers will capture the next wave of organic growth.`,
    },
    credibility: {
      early: `Building ${name}\u2019s trust signals now means every future touchpoint starts from a position of credibility rather than having to earn it from zero.`,
      scaling: `As ${name}\u2019s visibility grows, credibility gaps get amplified \u2014 more people seeing an inconsistent trust story means more qualified deals lost to competitors who simply look more established.`,
      growing: `At scale, ${name}\u2019s credibility needs active maintenance \u2014 proof points that powered early growth may not resonate with the next tier of customers you\u2019re targeting.`,
    },
    conversion: {
      early: `For ${name}, conversion infrastructure isn\u2019t a luxury \u2014 it\u2019s the difference between growing through intention and growing through luck.`,
      scaling: `Every percentage point of conversion improvement at ${name}\u2019s traffic level has outsized revenue impact \u2014 this is where operational leverage lives.`,
      growing: `As ${name} scales, the audience already exists \u2014 the highest-ROI investment is removing every unnecessary barrier between intent and action.`,
    },
  };
  return copy[pillar][stage];
}

/**
 * Smooth left→right gradient for 0–20 pillar meters and WunderBrand Score™ semicircular gauge.
 * Hue still tracks bands (critical → strong), but green only takes over in the last ~15% so mid scores read amber/yellow.
 */
export const PILLAR_SCORE_METER_GRADIENT_STOPS: ReadonlyArray<{ pct: number; color: string }> = [
  { pct: 0, color: "#ff3b30" },
  { pct: 12, color: "#ff5e3a" },
  { pct: 24, color: "#ff7a2e" },
  { pct: 36, color: "#ff9500" },
  { pct: 46, color: "#ffa826" },
  { pct: 56, color: "#e6b008" },
  { pct: 66, color: "#eab308" },
  { pct: 76, color: "#f2cd32" },
  { pct: 82, color: "#e9d97c" },
  { pct: 89, color: "#8fd06a" },
  { pct: 96, color: "#34c759" },
  { pct: 100, color: "#2db84e" },
];

export const PILLAR_SCORE_METER_GRADIENT = `linear-gradient(to right, ${PILLAR_SCORE_METER_GRADIENT_STOPS.map((s) => `${s.color} ${s.pct}%`).join(", ")})`;

/** Pillar score 0–20: colors aligned with meter gradient / legend (readable text + UI accents). */
export function getPillarScoreVisual(score: number): {
  stroke: string;
  headline: string;
  softBg: string;
  softBorder: string;
} {
  const s = Math.min(20, Math.max(0, Math.round(Number(score) || 0)));
  if (s >= 17)
    return {
      stroke: "#34c759",
      headline: "#15803d",
      softBg: "rgba(52, 199, 89, 0.10)",
      softBorder: "rgba(52, 199, 89, 0.35)",
    };
  if (s >= 13)
    return {
      stroke: "#eab308",
      headline: "#a16207",
      softBg: "rgba(234, 179, 8, 0.12)",
      softBorder: "rgba(202, 138, 4, 0.38)",
    };
  if (s >= 9)
    return {
      stroke: "#ff9500",
      headline: "#c2410c",
      softBg: "rgba(255, 149, 0, 0.12)",
      softBorder: "rgba(249, 115, 22, 0.4)",
    };
  return {
    stroke: "#ff3b30",
    headline: "#b91c1c",
    softBg: "rgba(255, 59, 48, 0.10)",
    softBorder: "rgba(239, 68, 68, 0.4)",
  };
}

export function getScoreBand(score: number): { label: string; description: string } {
  if (score >= 17)
    return {
      label: "Strong",
      description: "This pillar is performing well \u2014 focus on refinement, consistency at scale, and protecting this advantage."
    };
  if (score >= 13)
    return {
      label: "Developing",
      description: "A solid base with clear room for strategic improvement \u2014 targeted investment here will compound across the system."
    };
  if (score >= 9)
    return {
      label: "Needs focus",
      description: "This pillar is constraining performance in other areas \u2014 improving it will create cascading impact across your brand."
    };
  return {
    label: "Critical opportunity",
    description: "This is where focused effort will create the most disproportionate improvement in overall brand performance."
  };
}

export const PILLAR_OPPORTUNITY: Record<PillarKey, string> = {
  positioning: "Define how the market understands you \u2014 so the right customers self-select and the wrong ones don\u2019t waste your time.",
  messaging: "Codify one consistent narrative across every touchpoint \u2014 so each interaction compounds trust instead of starting from zero.",
  visibility: "Close the discovery gap between where your best customers search and where your brand appears \u2014 including AI-powered platforms.",
  credibility: "Deploy trust signals where buying decisions happen \u2014 so customers choose with confidence instead of defaulting to safer alternatives.",
  conversion: "Remove the structural friction between interest and action \u2014 so the attention you generate becomes the revenue you deserve.",
};

export const PILLAR_OPPORTUNITY_EXPANDED: Record<PillarKey, string> = {
  positioning:
    "Write one sentence that answers \u2018who you serve, what you do, and why it matters\u2019 \u2014 then deploy it on your homepage hero, primary profile, email signature, and any pitch or booking page. When positioning is unclear, every downstream investment (messaging, campaigns, sales) underperforms. Test the statement with 3\u20135 ideal customers this week: if they can repeat it back accurately, you\u2019ve found your position.",
  messaging:
    "Define 3 messaging pillars \u2014 the strategic themes your brand always comes back to \u2014 and use them as the backbone of every piece of content, copy, and communication. Right now, your message likely shifts by channel and context, which prevents trust from compounding. Start by auditing your homepage, top social profile, and most-used email template: do they tell the same story?",
  visibility:
    "Audit the 5 highest-intent search queries your ideal customer uses when looking for what you offer. Then check: does your brand appear? If not, create one comprehensive, authoritative content piece for each query \u2014 structured so both search engines and AI assistants can surface it. The brands that invest in AEO (Answer Engine Optimization) now will own the discovery advantage for the next 3\u20135 years.",
  credibility:
    "Place your 3 strongest proof points where buying decisions actually happen: your homepage hero area, your pricing/services page, and the first follow-up email after an inquiry. Most brands bury proof on a testimonials page nobody visits. The fix is deployment, not collection \u2014 move your best evidence to the moments of highest buyer hesitation.",
  conversion:
    "Map the exact path from first visit to first conversion on your site. Count the clicks, choices, and distractions. Then reduce it to 3 steps maximum: arrive \u2192 understand the value \u2192 take one clear action. The most common conversion killer isn\u2019t missing features or wrong pricing \u2014 it\u2019s too many options competing for the same click.",
};

/** Consumer / local-facing opportunity copy (salon, retail, hospitality, ecommerce). */
export const PILLAR_OPPORTUNITY_CONSUMER: Record<PillarKey, string> = {
  positioning:
    "Make it obvious who you\u2019re for \u2014 so the right clients or guests self-select and you spend less time explaining.",
  messaging:
    "Keep one clear story across Google, Instagram, your site, and in-person \u2014 so every touch builds trust instead of resetting it.",
  visibility:
    "Show up where people already look \u2014 Maps, Google, Instagram, and local search \u2014 so discovery isn\u2019t left to chance.",
  credibility:
    "Put reviews and proof where decisions happen \u2014 profiles, booking pages, and first replies \u2014 so people choose with confidence.",
  conversion:
    "Make the next step obvious \u2014 book, call, visit, or buy \u2014 so interest turns into revenue instead of browsing.",
};

export const PILLAR_OPPORTUNITY_EXPANDED_CONSUMER: Record<PillarKey, string> = {
  positioning:
    "Write one plain sentence: who you serve, what you do, and why it feels different. Put it on your homepage, Google listing, and Instagram bio. Test it with 3 regular clients or guests this week \u2014 if they can repeat it back, you\u2019ve found your position.",
  messaging:
    "Pick 3 themes you always come back to (e.g. results, experience, ease) and use them on every post and page. Audit your homepage, Google description, and last 5 Instagram posts: do they tell the same story?",
  visibility:
    "List the 5 ways new people find a business like yours (Maps, Google, Instagram, referrals, walk-by). Check where you\u2019re weak, then strengthen one discovery channel for 30 days before adding another.",
  credibility:
    "Move your best reviews or before/after proof to the moments of hesitation: Google listing, booking page, and first reply after an inquiry. Collection helps; placement converts.",
  conversion:
    "Map the path from first touch to booked or purchased. Cut competing buttons and mixed CTAs down to one primary next step everywhere you show up online.",
};

const PILLAR_OPPORTUNITY_FASHION: Record<PillarKey, string> = {
  positioning:
    "Make your style POV obvious \u2014 so the right shoppers self-select and you spend less time competing on price alone.",
  messaging:
    "Keep one clear fashion story across site, social, and store \u2014 so every look builds desire instead of resetting the brand.",
  visibility:
    "Show up where shoppers discover style \u2014 Instagram/TikTok, search, and (if relevant) local store discovery.",
  credibility:
    "Put fit, quality, and social proof where hesitation happens \u2014 PDP, cart, and first follow-up.",
  conversion:
    "Make shop / visit / try-on obvious \u2014 so browse interest turns into purchase instead of abandoned carts.",
};

const PILLAR_OPPORTUNITY_EXPANDED_FASHION: Record<PillarKey, string> = {
  positioning:
    "Write one sentence: who you dress, what aesthetic you own, and why it feels different. Put it on your homepage hero, Instagram bio, and store signage. Test it with 3 ideal customers this week.",
  messaging:
    "Pick 3 themes (e.g. fit, fabric, lifestyle) and use them on every drop and post. Audit homepage, last 5 posts, and PDP copy: same story?",
  visibility:
    "List the 5 ways shoppers find brands like yours (social, search, marketplace, walk-by, referrals). Strengthen one discovery channel for 30 days before adding another.",
  credibility:
    "Move your best UGC, fit notes, and return policy clarity to PDP and cart. Proof placement beats more posts.",
  conversion:
    "Map browse \u2192 product \u2192 cart \u2192 purchase. Cut competing CTAs and make one primary action (shop / visit) dominant everywhere.",
};

const PILLAR_OPPORTUNITY_CONSUMER_PRO: Record<PillarKey, string> = {
  positioning:
    "Make it obvious who you help and what outcome you create \u2014 so the right clients self-select and trust starts earlier.",
  messaging:
    "Keep one clear, jargon-light story across Google, site, and first emails \u2014 so every touch builds confidence.",
  visibility:
    "Show up where people search for trusted advice \u2014 Google, referrals, and credentialed directories.",
  credibility:
    "Put credentials, clarity, and outcomes where hesitation happens \u2014 homepage, consult page, and first reply.",
  conversion:
    "Make book-a-consult the obvious next step \u2014 so interest turns into scheduled conversations, not endless FAQ loops.",
};

const PILLAR_OPPORTUNITY_EXPANDED_CONSUMER_PRO: Record<PillarKey, string> = {
  positioning:
    "Write one plain sentence: who you serve, what you help them decide or fix, and why you\u2019re a safe next step. Put it on your homepage and Google listing. Test it with 3 recent clients.",
  messaging:
    "Pick 3 themes (e.g. clarity, protection, peace of mind) and use them on every page and follow-up. Audit homepage, Google description, and last client email: same story?",
  visibility:
    "List the 5 ways new clients find advisors like you (Google, referrals, partners, content, events). Strengthen one for 30 days.",
  credibility:
    "Surface credentials, process clarity, and client outcomes on the consult page and first reply \u2014 not buried on an About page.",
  conversion:
    "Map inquiry \u2192 trust \u2192 booked consult. Remove mixed CTAs and make one primary booking action dominant.",
};

function opportunityMapsForVertical(
  vertical: ConsumerVerticalId | null,
): { short: Record<PillarKey, string>; expanded: Record<PillarKey, string> } | null {
  if (vertical === "fashion_retail" || vertical === "dtc_product") {
    return { short: PILLAR_OPPORTUNITY_FASHION, expanded: PILLAR_OPPORTUNITY_EXPANDED_FASHION };
  }
  if (vertical === "consumer_professional") {
    return { short: PILLAR_OPPORTUNITY_CONSUMER_PRO, expanded: PILLAR_OPPORTUNITY_EXPANDED_CONSUMER_PRO };
  }
  return null;
}

export function getPillarOpportunity(
  pillar: PillarKey,
  businessType?: string | null,
  industry?: string | null,
): string {
  const vertical = resolveResultsVertical({ businessType, industry });
  const maps = opportunityMapsForVertical(vertical);
  if (maps) return maps.short[pillar];
  return isConsumerFacingResultsContext({ businessType, industry })
    ? PILLAR_OPPORTUNITY_CONSUMER[pillar]
    : PILLAR_OPPORTUNITY[pillar];
}

export function getPillarOpportunityExpanded(
  pillar: PillarKey,
  businessType?: string | null,
  industry?: string | null,
): string {
  const vertical = resolveResultsVertical({ businessType, industry });
  const maps = opportunityMapsForVertical(vertical);
  if (maps) return maps.expanded[pillar];
  return isConsumerFacingResultsContext({ businessType, industry })
    ? PILLAR_OPPORTUNITY_EXPANDED_CONSUMER[pillar]
    : PILLAR_OPPORTUNITY_EXPANDED[pillar];
}
