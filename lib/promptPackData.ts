export type PackId = "foundational" | "execution" | "advanced";

export type SectionId =
  | "positioning"
  | "messaging"
  | "voice-copy"
  | "email"
  | "social"
  | "website"
  | "content-seo"
  | "lead-gen"
  | "strategic-planning"
  | "persona-messaging"
  | "full-funnel"
  | "campaigns"
  | "advanced-strategy";

export interface PreFillField {
  placeholder: string;
  dataKey: string;
  availableFrom: "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus";
}

export interface Prompt {
  id: string;
  pack: PackId;
  packLabel: string;
  number: number;
  section: SectionId;
  category: string;
  name: string;
  howToUse: string;
  promptText: string;
  whyItMatters: string;
  preFillFields: PreFillField[];
}

export const PACK_META: Record<
  PackId,
  {
    label: string;
    shortLabel: string;
    count: number;
    description: string;
    color: string;
    availableFrom: "snapshot-plus" | "blueprint" | "blueprint-plus";
  }
> = {
  foundational: {
    label: "Foundational Prompt Pack",
    shortLabel: "Foundational",
    count: 8,
    description:
      "Brand platform building prompts for positioning, messaging, voice, and direction.",
    color: "#07B0F2",
    availableFrom: "snapshot-plus",
  },
  execution: {
    label: "Activation Prompt Pack",
    shortLabel: "Activation",
    count: 8,
    description:
      "Campaign, channel, and conversion prompts that keep activation aligned.",
    color: "#0EA472",
    availableFrom: "blueprint",
  },
  advanced: {
    label: "Advanced Prompt Library",
    shortLabel: "Advanced",
    count: 12,
    description:
      "Persona, funnel, and strategic operating prompts for advanced execution.",
    color: "#021859",
    availableFrom: "blueprint-plus",
  },
};

export const SECTION_META: Record<
  SectionId,
  {
    label: string;
    description: string;
    availableFrom: "snapshot-plus" | "blueprint" | "blueprint-plus";
  }
> = {
  positioning: {
    label: "Brand Positioning",
    description:
      "Define the strategic territory your brand owns and what makes you the right choice.",
    availableFrom: "snapshot-plus",
  },
  messaging: {
    label: "Messaging & Campaigns",
    description:
      "Build a messaging framework that keeps every touchpoint sounding like one brand.",
    availableFrom: "snapshot-plus",
  },
  "voice-copy": {
    label: "Voice & Copy",
    description:
      "Document your voice so anyone writing for your brand sounds consistent.",
    availableFrom: "snapshot-plus",
  },
  email: {
    label: "Email Marketing",
    description:
      "Design email sequences with a narrative arc, not disconnected sends.",
    availableFrom: "blueprint",
  },
  social: {
    label: "Social Media",
    description:
      "Build repeatable content systems that remove day-to-day decision fatigue.",
    availableFrom: "snapshot-plus",
  },
  website: {
    label: "Website Copy",
    description:
      "Audit and rewrite high-impact pages for positioning and voice alignment.",
    availableFrom: "blueprint",
  },
  "content-seo": {
    label: "Content & SEO",
    description:
      "Build long-form authority content that reinforces your positioning.",
    availableFrom: "blueprint",
  },
  "lead-gen": {
    label: "Lead Generation",
    description:
      "Create conversion assets that feel on-brand and move buyers forward.",
    availableFrom: "blueprint",
  },
  "strategic-planning": {
    label: "Strategic Planning",
    description:
      "Turn diagnostic results into a focused 90-day implementation roadmap.",
    availableFrom: "snapshot-plus",
  },
  "persona-messaging": {
    label: "Persona-Based Messaging",
    description:
      "Personalize by audience segment without fragmenting the brand voice.",
    availableFrom: "blueprint-plus",
  },
  "full-funnel": {
    label: "Full-Funnel Architecture",
    description:
      "Map messaging across awareness to retention for end-to-end consistency.",
    availableFrom: "blueprint-plus",
  },
  campaigns: {
    label: "Campaign Systems",
    description:
      "Design launch, quarterly, and advocacy campaigns as repeatable systems.",
    availableFrom: "blueprint-plus",
  },
  "advanced-strategy": {
    label: "Advanced Strategy",
    description:
      "Handle extension decisions, competitor moves, and reputation scenarios.",
    availableFrom: "blueprint-plus",
  },
};

const BRAND_NAME: PreFillField = {
  placeholder: "[BRAND NAME]",
  dataKey: "companyName",
  availableFrom: "snapshot",
};
const INDUSTRY: PreFillField = {
  placeholder: "[INDUSTRY]",
  dataKey: "industry",
  availableFrom: "snapshot",
};
const SCORE: PreFillField = {
  placeholder: "[SCORE]",
  dataKey: "wunderBrandScore",
  availableFrom: "snapshot",
};
const TARGET_AUDIENCE: PreFillField = {
  placeholder: "[TARGET AUDIENCE]",
  dataKey: "targetAudience",
  availableFrom: "snapshot",
};
const PRIMARY_ARCHETYPE: PreFillField = {
  placeholder: "[PRIMARY ARCHETYPE]",
  dataKey: "primaryArchetype",
  availableFrom: "snapshot-plus",
};
const SECONDARY_ARCHETYPE: PreFillField = {
  placeholder: "[SECONDARY ARCHETYPE]",
  dataKey: "secondaryArchetype",
  availableFrom: "blueprint-plus",
};
const TOP_STRENGTHS: PreFillField = {
  placeholder: "[TOP STRENGTHS]",
  dataKey: "topStrengths",
  availableFrom: "snapshot-plus",
};
const TOP_GAPS: PreFillField = {
  placeholder: "[TOP GAPS]",
  dataKey: "topGaps",
  availableFrom: "snapshot-plus",
};
const VOICE_ATTRIBUTES: PreFillField = {
  placeholder: "[VOICE ATTRIBUTES]",
  dataKey: "voiceAttributes",
  availableFrom: "snapshot-plus",
};
const PRIMARY_PILLAR: PreFillField = {
  placeholder: "[PRIMARY PILLAR]",
  dataKey: "primaryPillar",
  availableFrom: "snapshot",
};

function basePromptText(name: string): string {
  return `You are a brand strategist helping [BRAND NAME].

Use this context:
- Archetype: [PRIMARY ARCHETYPE] / [SECONDARY ARCHETYPE]
- Industry: [INDUSTRY]
- Audience: [TARGET AUDIENCE]
- Score: [SCORE]
- Top strengths: [TOP STRENGTHS]
- Top gaps: [TOP GAPS]

Deliver a complete ${name} output with practical steps, examples, and implementation guidance.`;
}

function mkPrompt(
  id: string,
  pack: PackId,
  number: number,
  section: SectionId,
  category: string,
  name: string,
): Prompt {
  const packLabel =
    pack === "foundational"
      ? "Foundational"
      : pack === "execution"
        ? "Activation"
        : "Advanced";
  return {
    id,
    pack,
    packLabel,
    number,
    section,
    category,
    name,
    howToUse:
      "Copy into ChatGPT, Claude, or your preferred AI tool. Pre-filled fields are already resolved from your diagnostic results.",
    promptText: basePromptText(name),
    whyItMatters:
      "This prompt translates your diagnostic insights into usable activation decisions for your team.",
    preFillFields: [
      BRAND_NAME,
      PRIMARY_ARCHETYPE,
      SECONDARY_ARCHETYPE,
      INDUSTRY,
      TARGET_AUDIENCE,
      SCORE,
      TOP_STRENGTHS,
      TOP_GAPS,
      VOICE_ATTRIBUTES,
      PRIMARY_PILLAR,
    ],
  };
}

export const PROMPTS: Prompt[] = [
  mkPrompt(
    "F1",
    "foundational",
    1,
    "positioning",
    "Positioning",
    "Brand Positioning Statement Builder",
  ),
  mkPrompt(
    "F2",
    "foundational",
    2,
    "positioning",
    "Positioning",
    "Competitive Differentiation Finder",
  ),
  mkPrompt(
    "F3",
    "foundational",
    3,
    "messaging",
    "Messaging",
    "Core Messaging Framework",
  ),
  mkPrompt(
    "F4",
    "foundational",
    4,
    "positioning",
    "Positioning",
    "Value Proposition Sharpener",
  ),
  mkPrompt(
    "F5",
    "foundational",
    5,
    "voice-copy",
    "Brand Voice",
    "Brand Voice Guidelines Builder",
  ),
  mkPrompt(
    "F6",
    "foundational",
    6,
    "voice-copy",
    "Brand Voice",
    "Elevator Pitch & Brand Story Generator",
  ),
  mkPrompt(
    "F7",
    "foundational",
    7,
    "social",
    "Content",
    "Brand-Aligned Content Idea Generator",
  ),
  mkPrompt(
    "F8",
    "foundational",
    8,
    "strategic-planning",
    "Strategy",
    "90-Day Brand Action Plan Builder",
  ),
  mkPrompt(
    "E1",
    "execution",
    1,
    "messaging",
    "Campaign",
    "Campaign Messaging System Builder",
  ),
  mkPrompt(
    "E2",
    "execution",
    2,
    "email",
    "Email",
    "Email Sequence Architect",
  ),
  mkPrompt(
    "E3",
    "execution",
    3,
    "social",
    "Social",
    "Social Media Content System",
  ),
  mkPrompt(
    "E4",
    "execution",
    4,
    "website",
    "Website",
    "Website Copy Alignment Auditor",
  ),
  mkPrompt(
    "E5",
    "execution",
    5,
    "messaging",
    "Consistency",
    "Brand Consistency Checker",
  ),
  mkPrompt(
    "E6",
    "execution",
    6,
    "voice-copy",
    "Sales Alignment",
    "Sales-to-Brand Voice Alignment Script",
  ),
  mkPrompt(
    "E7",
    "execution",
    7,
    "content-seo",
    "Content",
    "Blog & Long-Form Content Framework",
  ),
  mkPrompt(
    "E8",
    "execution",
    8,
    "lead-gen",
    "Conversion",
    "Lead Magnet & Conversion Asset Builder",
  ),
  mkPrompt(
    "A1",
    "advanced",
    1,
    "persona-messaging",
    "Persona",
    "Audience Persona Messaging Map",
  ),
  mkPrompt(
    "A2",
    "advanced",
    2,
    "persona-messaging",
    "Persona",
    "Stakeholder Communication Toolkit",
  ),
  mkPrompt(
    "A3",
    "advanced",
    3,
    "full-funnel",
    "Funnel",
    "Full-Funnel Messaging Architecture",
  ),
  mkPrompt(
    "A4",
    "advanced",
    4,
    "full-funnel",
    "Funnel",
    "Retargeting & Re-engagement Message Library",
  ),
  mkPrompt(
    "A5",
    "advanced",
    5,
    "campaigns",
    "Campaigns",
    "Product/Service Launch Campaign System",
  ),
  mkPrompt(
    "A6",
    "advanced",
    6,
    "campaigns",
    "Campaigns",
    "Quarterly Campaign Planning Framework",
  ),
  mkPrompt(
    "A7",
    "advanced",
    7,
    "advanced-strategy",
    "Strategy",
    "Brand Architecture & Extension Evaluator",
  ),
  mkPrompt(
    "A8",
    "advanced",
    8,
    "advanced-strategy",
    "Strategy",
    "Competitive Positioning War Room",
  ),
  mkPrompt(
    "A9",
    "advanced",
    9,
    "campaigns",
    "Campaigns",
    "Referral & Advocacy Campaign Builder",
  ),
  mkPrompt(
    "A10",
    "advanced",
    10,
    "persona-messaging",
    "Persona",
    "Decision-Maker vs. Influencer Messaging Split",
  ),
  mkPrompt(
    "A11",
    "advanced",
    11,
    "advanced-strategy",
    "Strategy",
    "Brand Crisis & Reputation Response Playbook",
  ),
  mkPrompt(
    "A12",
    "advanced",
    12,
    "campaigns",
    "Campaigns",
    "Annual Brand Strategy & Measurement Framework",
  ),
];

const TIER_RANK: Record<string, number> = {
  snapshot: 0,
  "snapshot-plus": 1,
  blueprint: 2,
  "blueprint-plus": 3,
};

export function getPromptsForSection(
  sectionId: SectionId,
  productTier: string,
  packFilter: PackId | "all" = "all",
): Prompt[] {
  const tierRank = TIER_RANK[productTier] ?? 0;
  return PROMPTS.filter((prompt) => {
    if (prompt.section !== sectionId) return false;
    if (packFilter !== "all" && prompt.pack !== packFilter) return false;
    const requiredRank = TIER_RANK[PACK_META[prompt.pack].availableFrom] ?? 0;
    return requiredRank <= tierRank;
  });
}

export function resolvePromptText(
  prompt: Prompt,
  diagnosticData: Record<string, unknown>,
  productTier: string,
): {
  resolvedText: string;
  preFilledCount: number;
  totalBracketedCount: number;
} {
  let resolvedText = prompt.promptText;
  let preFilledCount = 0;
  const tierRank = TIER_RANK[productTier] ?? 0;

  for (const field of prompt.preFillFields) {
    const fieldRank = TIER_RANK[field.availableFrom] ?? 0;
    if (fieldRank > tierRank) continue;

    const value = diagnosticData[field.dataKey];
    if (value === undefined || value === null || value === "") continue;

    const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
    if (resolvedText.includes(field.placeholder)) {
      resolvedText = resolvedText.replaceAll(field.placeholder, displayValue);
      preFilledCount += 1;
    }
  }

  const remainingBrackets = (resolvedText.match(/\[[^\]]+\]/g) ?? []).length;

  return {
    resolvedText,
    preFilledCount,
    totalBracketedCount: preFilledCount + remainingBrackets,
  };
}

/** Sections with AI prompt packs by tier — used in Workbook Prompt Library (separate from Activation plans). */
export const PROMPT_SECTIONS_BY_PRODUCT_TIER: Record<
  "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus",
  SectionId[]
> = {
  snapshot: [],
  "snapshot-plus": ["positioning", "messaging", "voice-copy", "social", "strategic-planning"],
  blueprint: [
    "positioning",
    "messaging",
    "voice-copy",
    "email",
    "social",
    "website",
    "content-seo",
    "lead-gen",
    "strategic-planning",
  ],
  "blueprint-plus": [
    "positioning",
    "messaging",
    "voice-copy",
    "email",
    "social",
    "website",
    "content-seo",
    "lead-gen",
    "strategic-planning",
    "persona-messaging",
    "full-funnel",
    "campaigns",
    "advanced-strategy",
  ],
};
