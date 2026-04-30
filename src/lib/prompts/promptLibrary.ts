export type PromptTier = "snapshot_plus" | "blueprint" | "blueprint_plus";

export type PromptTemplate = {
  ref: string;
  title: string;
  tier: PromptTier;
  section: string;
  category: string;
  description: string;
  prerequisite?: string;
  template: string;
};

export type BrandPromptContext = Record<string, string | number | null | undefined>;

const VARIABLE_FALLBACKS: Record<string, string> = {
  brand_name: "[BRAND NAME]",
  primary_archetype: "[PRIMARY ARCHETYPE]",
  secondary_archetype: "[SECONDARY ARCHETYPE]",
  archetype_blend: "[DESCRIBE HOW THE TWO ARCHETYPES COMPLEMENT]",
  industry: "[INDUSTRY]",
  business_type: "[B2B / B2C / SERVICE / PRODUCT / LOCAL]",
  location: "[CITY/REGION OR 'National/Global']",
  target_audience: "[TARGET AUDIENCE]",
  top_strengths: "[TOP 2-3 STRENGTHS FROM REPORT]",
  top_gaps: "[TOP GAPS FROM REPORT]",
  recommendations: "[KEY RECOMMENDATIONS]",
  positioning_statement: "[POSITIONING STATEMENT]",
  voice_attributes: "[VOICE ATTRIBUTES]",
  message_pillars: "[3 KEY MESSAGES / MESSAGE PILLARS]",
  value_proposition: "[VALUE PROPOSITION]",
  brand_story: "[BRAND STORY]",
  competitors: "[TOP COMPETITORS]",
  current_content: "[CURRENT CONTENT ASSETS]",
  lead_magnet_channel_notes: "[PASTE SUMMARY OF YOUR LEAD MAGNET / CONVERSION PLAN FROM THE REPORT]",
};

const VARIABLE_DISPLAY_LABELS: Record<string, string> = {
  brand_name: "Brand Name",
  primary_archetype: "Primary Archetype",
  secondary_archetype: "Secondary Archetype",
  archetype_blend: "Archetype Blend",
  industry: "Industry",
  business_type: "Business Type",
  location: "Location",
  target_audience: "Target Audience",
  top_strengths: "Top Strengths",
  top_gaps: "Top Gaps",
  recommendations: "Recommendations",
  positioning_statement: "Positioning Statement",
  voice_attributes: "Voice Attributes",
  message_pillars: "Message Pillars",
  value_proposition: "Value Proposition",
  brand_story: "Brand Story",
  competitors: "Top Competitors",
  current_content: "Current Content",
  lead_magnet_channel_notes: "Lead magnet & conversion notes",
};

export function normalizeBusinessType(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes("b2b")) return "B2B";
  if (lower.includes("b2c")) return "B2C";
  if (lower.includes("local")) return "LOCAL";
  if (lower.includes("e-commerce") || lower.includes("ecommerce")) return "E-COMMERCE";
  return value.trim();
}

export function formatListValue(
  value: string[] | null | undefined,
  fallback: string
): string {
  if (!value || value.length === 0) return fallback;
  if (value.length === 1) return value[0];
  if (value.length === 2) return `${value[0]} and ${value[1]}`;
  return `${value.slice(0, -1).join(", ")}, and ${value[value.length - 1]}`;
}

function keyToBracketFallback(key: string): string {
  const mapped = VARIABLE_FALLBACKS[key];
  if (mapped) return mapped;
  return `[${key.toUpperCase().replace(/_/g, " ")}]`;
}

function toDisplayLabel(key: string): string {
  return VARIABLE_DISPLAY_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function hasValue(value: string | number | null | undefined): boolean {
  if (value == null) return false;
  if (typeof value === "number") return true;
  return String(value).trim().length > 0;
}

export function extractPromptVariables(template: string): string[] {
  const seen = new Set<string>();
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  for (const match of matches) {
    const key = String(match[1]);
    if (!seen.has(key)) seen.add(key);
  }
  return Array.from(seen);
}

export function getPromptHydrationMeta(
  template: string,
  context: BrandPromptContext
): {
  totalVariables: number;
  filledVariables: number;
  missingVariables: number;
  filledVariableKeys: string[];
  missingVariableKeys: string[];
  filledVariableLabels: string[];
  missingVariableLabels: string[];
} {
  const variables = extractPromptVariables(template);
  const filled = variables.filter((key) => hasValue(context[key]));
  const missing = variables.filter((key) => !hasValue(context[key]));
  return {
    totalVariables: variables.length,
    filledVariables: filled.length,
    missingVariables: missing.length,
    filledVariableKeys: filled,
    missingVariableKeys: missing,
    filledVariableLabels: filled.map(toDisplayLabel),
    missingVariableLabels: missing.map(toDisplayLabel),
  };
}

export function hydratePromptTemplate(
  template: string,
  context: BrandPromptContext
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, rawKey: string) => {
    const key = String(rawKey);
    const raw = context[key];
    if (raw == null) return keyToBracketFallback(key);
    if (typeof raw === "number") return String(raw);
    const cleaned = String(raw).trim();
    if (!cleaned) return keyToBracketFallback(key);
    if (key === "business_type") {
      return normalizeBusinessType(cleaned) ?? keyToBracketFallback(key);
    }
    return cleaned;
  });
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return "";
}

function pillarLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function archetypeBlend(primary: string, secondary: string): string {
  if (!primary || !secondary) return "";
  return `${primary} credibility with ${secondary} differentiation`;
}

function strengthsFromInsights(
  pillarInsights: Record<string, unknown>,
  pillarScores: Record<string, number>
): string {
  const scoreOrder = Object.entries(pillarScores)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key)
    .slice(0, 3);
  const insights = scoreOrder
    .map((key) => {
      const raw = pillarInsights[key];
      if (!raw || typeof raw !== "object") return "";
      const strength = (raw as { strength?: unknown }).strength;
      return typeof strength === "string" ? strength : "";
    })
    .filter(Boolean);
  return formatListValue(insights, "");
}

function gapsFromInsights(
  pillarInsights: Record<string, unknown>,
  pillarScores: Record<string, number>
): string {
  const scoreOrder = Object.entries(pillarScores)
    .sort((a, b) => a[1] - b[1])
    .map(([key]) => key)
    .slice(0, 3);
  const insights = scoreOrder
    .map((key) => {
      const raw = pillarInsights[key];
      if (!raw || typeof raw !== "object") return "";
      const opportunity = (raw as { opportunity?: unknown }).opportunity;
      return typeof opportunity === "string" ? opportunity : "";
    })
    .filter(Boolean);
  return formatListValue(insights, "");
}

export function buildBrandPromptContextFromResults({
  report,
  answers,
  businessName,
  likelyArchetype,
  pillarScores,
  recommendations,
}: {
  report: Record<string, unknown>;
  answers: Record<string, unknown>;
  businessName: string;
  likelyArchetype: string | null;
  pillarScores: Record<string, number>;
  recommendations: string[];
}): BrandPromptContext {
  const reportPillars = toStringArray((report as { message_pillars?: unknown }).message_pillars);
  const answerPillars = toStringArray((answers as { messagePillars?: unknown }).messagePillars);
  const messagePillars = reportPillars.length
    ? reportPillars
    : answerPillars.length
      ? answerPillars
      : recommendations.slice(0, 3);
  const reportInsights = ((report as { pillar_insights?: unknown }).pillar_insights ?? {}) as Record<string, unknown>;
  const secondaryArchetype = firstString(
    (report as { secondary_archetype?: unknown }).secondary_archetype,
    (answers as { secondaryArchetype?: unknown }).secondaryArchetype
  );
  const primaryArchetype = likelyArchetype ?? "";

  return {
    brand_name: businessName,
    primary_archetype: primaryArchetype,
    secondary_archetype: secondaryArchetype,
    archetype_blend: archetypeBlend(primaryArchetype, secondaryArchetype),
    industry: firstString(
      (answers as { industry?: unknown }).industry,
      (report as { industry?: unknown }).industry
    ),
    business_type: firstString(
      (answers as { businessType?: unknown }).businessType,
      (report as { business_type?: unknown }).business_type
    ),
    location: firstString(
      (answers as { location?: unknown }).location,
      (report as { location?: unknown }).location
    ),
    target_audience: firstString(
      (answers as { targetAudience?: unknown }).targetAudience,
      (report as { target_audience?: unknown }).target_audience
    ),
    top_strengths: strengthsFromInsights(reportInsights, pillarScores),
    top_gaps: gapsFromInsights(reportInsights, pillarScores),
    recommendations: formatListValue(recommendations.slice(0, 3), ""),
    positioning_statement: firstString(
      (report as { positioning_statement?: unknown }).positioning_statement,
      (answers as { positioningStatement?: unknown }).positioningStatement
    ),
    message_pillars: formatListValue(messagePillars, ""),
    competitors: firstString(
      (answers as { competitors?: unknown }).competitors,
      (report as { competitors?: unknown }).competitors
    ),
    current_content: firstString(
      (answers as { currentContent?: unknown }).currentContent,
      (report as { current_content?: unknown }).current_content
    ),
  };
}

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    ref: "V1",
    title: "Visibility & Discoverability Prompt",
    tier: "snapshot_plus",
    section: "Visibility",
    category: "SEO · Visibility",
    description:
      "Translate diagnostic visibility signals into immediate, plain-language actions.",
    template: `You are a brand strategist and discoverability advisor helping {{brand_name}} close the gap between their brand positioning and how their audience finds them online.

Brand context from diagnostic:
- Primary Archetype: {{primary_archetype}}
- Secondary Archetype: {{secondary_archetype}}
- Industry: {{industry}}
- Target Audience: {{target_audience}}
- Positioning Statement: {{positioning_statement}}
- Key Brand Strengths: {{top_strengths}}
- Primary Business Type: {{business_type}}

Your job is not to run an SEO audit. Your job is to help this brand understand where they are visible, where they are invisible, and where the fastest gains are, explained in plain language they can act on today.

Provide:
1) Search Language Translation
- 3-5 search phrases my audience uses that I should be showing up for
- The most common mistake brands like mine make when assuming they know what people search for
- One phrase I am likely over-optimizing for that is hurting more than helping

2) Visibility Quick Assessment
- The most likely strategic reason my current visibility performance is where it is
- Whether my visibility problem is content, language, or signal, and why
- The single platform/channel where a brand with my archetype and audience has highest leverage now

3) Homepage Quick Win
Write 3 specific homepage edits (headline, meta description, body copy) in {{primary_archetype}} voice.

4) First Content Move
Recommend one piece of content for the next 30 days that improves authority and search relevance.
Include topic/title, why it works, and best format for my archetype.

5) One Thing NOT to Do
Name the most common visibility mistake for my industry/archetype type.

Do not use SEO jargon without explanation. Make every recommendation actionable without a specialist.`,
  },
  {
    ref: "S1",
    title: "SEO Strategy Prompt",
    tier: "blueprint",
    section: "Visibility & Discoverability",
    category: "SEO",
    prerequisite: "F1 and F3 recommended",
    description:
      "Build a full SEO architecture anchored to positioning and message pillars.",
    template: `You are a senior SEO strategist and brand messaging expert helping {{brand_name}} build a search strategy anchored to brand positioning, not generic keyword volume.

Brand context from diagnostic:
- Primary Archetype: {{primary_archetype}}
- Secondary Archetype: {{secondary_archetype}}
- Industry: {{industry}}
- Location: {{location}}
- Target Audience: {{target_audience}}
- Positioning Statement: {{positioning_statement}}
- Message Pillars: {{message_pillars}}
- Top Competitors: {{competitors}}
- Primary Business Type: {{business_type}}

Build:
1) Keyword Strategy by intent
- Primary Cluster (5-8 terms): direct buyer intent aligned to positioning
- Secondary Cluster (5-8 terms): pain point / awareness intent
- Brand Authority Cluster (3-5 terms): thought leadership territory

2) Competitive Gap Analysis
- 3 territories competitors likely own and whether to compete or pivot adjacent
- 1 positioning-led white space
- 1 competitor weakness to exploit with content

3) On-Page Prioritization
Identify top 3 pages to optimize first and provide exact rewrites (headline, meta description, first paragraph) in {{primary_archetype}} voice.

4) Content Architecture
- 4-6 pillar pieces mapped to clusters
- 3 supporting pieces for first 90 days

5) Internal Linking Logic
- Which assets should link where
- Anchor text guidance
- One structural improvement with highest crawlability impact this month

6) This Week Quick Win
Write one specific change with exact copy and page target.

All recommendations must connect to positioning and message pillars.`,
  },
  {
    ref: "A0",
    title: "AEO / Answer Engine Optimization Prompt",
    tier: "blueprint",
    section: "Visibility & Discoverability",
    category: "AEO",
    prerequisite: "S1 recommended",
    description:
      "Build practical AI-era search citability strategy across answer engines.",
    template: `You are an answer engine optimization strategist and brand positioning expert helping {{brand_name}} become the brand AI tools surface as an authoritative answer.

Brand context from diagnostic:
- Primary Archetype: {{primary_archetype}}
- Secondary Archetype: {{secondary_archetype}}
- Industry: {{industry}}
- Target Audience: {{target_audience}}
- Positioning Statement: {{positioning_statement}}
- Message Pillars: {{message_pillars}}
- Current content: {{current_content}}
- Primary Business Type: {{business_type}}
- Geographic Market: {{location}}

Build:
1) Questions We Should Own
Identify 6-8 questions we should appear for in AI answers, with rationale and best content format for citability.

2) Content Restructuring for Citability
- 3 structural changes for existing/new content
- Plain-language difference between SEO and AEO content
- Rewrite one FAQ pair in {{primary_archetype}} voice using AEO structure

3) Schema and Technical Priorities
- Priority schema types
- One highest-leverage implementation
- About/team page E-E-A-T improvements

4) Authority Signal Checklist
- External signal priorities for this archetype/industry
- 90-day authority sprint
- One specific pitch angle

5) First AEO Piece
Write the first content piece with title, intro, 3-4 structured subheads, and 3 FAQ items in {{primary_archetype}} voice.

6) SEO + AEO Connection
Explain in 3-4 sentences where overlap is highest and one free action I can take today.`,
  },
  {
    ref: "AA1",
    title: "AEO Advanced: Thought Leadership & Authority System",
    tier: "blueprint_plus",
    section: "Advanced Brand Strategy",
    category: "AEO Advanced",
    prerequisite: "A0 strongly recommended",
    description:
      "Design long-horizon authority system: intellectual territory, frameworks, and sprint plan.",
    template: `You are a thought leadership strategist and answer engine optimization expert helping {{brand_name}} build a long-term authority system where their ideas become the sources AI tools cite.

Brand context from diagnostic:
- Primary Archetype: {{primary_archetype}}
- Secondary Archetype: {{secondary_archetype}}
- Industry: {{industry}}
- Target Audience: {{target_audience}}
- Positioning Statement: {{positioning_statement}}
- Message Pillars: {{message_pillars}}
- Key Brand Strengths: {{top_strengths}}
- Top Competitors: {{competitors}}
- Current content assets: {{current_content}}
- Primary Business Type: {{business_type}}
- Geographic Market: {{location}}

Build:
1) Intellectual Territory
- Core territory claim
- 3 adjacent sub-topics with authentic authority
- 1 claim competitors cannot credibly own
- 1 intellectual white space to lead first

2) Signature Framework Development
Create Option A/B/C (diagnostic, process, philosophy) with names, explanations, and channel fit. Recommend winner and why.

3) AEO Authority Architecture
- One anchor piece: title, H1-H3 structure, opening paragraph in {{primary_archetype}} voice, and 3 non-generic claims
- 4 supporting pieces and 2 FAQ pages
- Distribution strategy for high-authority external platforms

4) Quarterly Authority Sprint (90 days)
Month 1 foundation, month 2 depth, month 3 authority signals, plus one metric to evaluate.

5) Thought Leadership Voice Guide
- One-sentence voice definition
- 3 argument patterns, 3 mistakes to avoid
- Generic-vs-{{primary_archetype}} rewrite
- 5 opening sentence structures

6) Competitor Differentiation
- Dominant category narrative vs our counter-position
- One assumption to challenge publicly
- 1-2 sentence perspective contrast in {{primary_archetype}} voice.

Do not produce generic advice; every recommendation must be specific to this brand context.`,
  },
  {
    ref: "LM1",
    title: "Lead Magnet & Offer Builder (Campaign-Aligned)",
    tier: "blueprint_plus",
    section: "Activation",
    category: "Conversion · Offers",
    description:
      "When your recommended campaigns include a lead magnet or gated offer: shape the asset, landing copy, nurture hook, and CTA ladder in one pass.",
    prerequisite: "Lead Magnet Planning or email plan should reference an offer (auto-shown when detected).",
    template: `You are a conversion strategist and offer designer helping {{brand_name}} turn their recommended campaign motion into a concrete lead magnet or low-friction offer.

Brand context:
- Primary Archetype: {{primary_archetype}}
- Industry / category: {{industry}}
- Target audience: {{target_audience}}
- Positioning / promise: {{positioning_statement}}
- Message pillars: {{message_pillars}}
- Voice attributes: {{voice_attributes}}
- Top strengths to leverage: {{top_strengths}}
- Gaps to address: {{top_gaps}}
- Strategic priorities: {{recommendations}}

Lead magnet / conversion notes already in the report (use verbatim themes; do not invent fake metrics):
{{lead_magnet_channel_notes}}

Your job:
1) Offer diagnosis (5 bullets)
- What job the buyer is trying to do when they opt in
- Why this format fits {{primary_archetype}} voice and trust expectations
- The single outcome the asset must deliver in under 15 minutes
- What would make this offer feel "too salesy" for this audience — avoid it
- How this offer connects to the next step (call, trial, demo, purchase)

2) Working package (pick ONE primary offer; note 1 backup)
- Working title (specific, not generic)
- One-sentence promise
- Format (guide, checklist, template, mini-course, assessment, etc.) and why
- Table of contents / sections (bullets)
- "Quick win" the reader gets on page 1

3) Landing & form
- Above-the-fold headline + subhead (2 variants)
- 3 bullet proof points (no fake stats)
- Form fields: minimum viable vs optional enrichment
- Thank-you page: what happens next + one micro-commitment

4) Email / ad hooks (if campaigns promote this offer)
- 5 subject lines
- 2 short ad primary texts (50–90 chars) + 2 descriptions
- 1 LinkedIn post hook promoting the same offer by name

5) Nurture bridge
- 3-email outline after download: goal of each + CTA (tied to {{recommendations}})

6) Success checks
- 4 metrics to watch (opt-in rate, email CTR, meeting booked, etc.) — qualitative if no baselines

Write in plain language. If {{lead_magnet_channel_notes}} is sparse, infer carefully from pillars and audience and label assumptions explicitly.`,
  },
];

export const SNAPSHOT_PLUS_LOCKED_PROMPT_TITLES: string[] = [
  "Brand Positioning Statement Builder",
  "Value Proposition Sharpener",
  "Brand Voice Guidelines Builder",
  "Elevator Pitch & Brand Story Generator",
  "Brand-Aligned Content Idea Generator",
  "Brand Consistency Checker",
  "Visibility & Discoverability Prompt",
];
