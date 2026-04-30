export type WorkbookSectionId =
  | "positioning-statement"
  | "strategic-offer-context"
  | "messaging-framework"
  | "voice-attributes"
  | "brand-story"
  | "audience-profile"
  | "persona-atlas"
  | "buyer-journey-map"
  | "competitive-landscape-matrix"
  | "icp-conversion-intelligence"
  | "channel-notes"
  | "mood-board"
  | "action-plan"
  | "performance-optimization"
  | "prompt-outputs";

export interface WorkbookSection {
  id: WorkbookSectionId;
  label: string;
  description: string;
  placeholder: string;
  inputTemplate?: string;
  pillar?: string;
  availableFrom: "snapshot-plus" | "blueprint" | "blueprint-plus";
}

export const WORKBOOK_SECTIONS: WorkbookSection[] = [
  {
    id: "positioning-statement",
    label: "Positioning Statement",
    description:
      "Your finalized brand positioning — the single sentence every brand decision traces back to.",
    placeholder:
      "Paste your positioning statement here. Use the F1 prompt output as a starting point, or write it from scratch.",
    pillar: "Positioning",
    availableFrom: "snapshot-plus",
  },
  {
    id: "strategic-offer-context",
    label: "Strategic offer & portfolio",
    description:
      "What you sell (product, service, or program), the buyer job it serves, scope boundaries, and how channels should reinforce the same offer—Blueprint methodology slice for go-to-market (GTM) and Activation.",
    placeholder:
      "Primary offer name and one-line pitch. Job statement (When…, I want to…, so I can…). Pains relieved, outcomes, in-scope vs out-of-scope, leading signals to review, and channel alignment notes. Pull phrasing from the Strategy tab strategic offer panel and your Blueprint positioning context.",
    pillar: "Positioning",
    availableFrom: "blueprint",
  },
  {
    id: "messaging-framework",
    label: "Messaging Framework",
    description:
      "Your brand promise, narrative, and three message pillars with proof points.",
    placeholder:
      "Paste your core messaging framework here. Use the F3 prompt output as a starting point.",
    pillar: "Messaging",
    availableFrom: "snapshot-plus",
  },
  {
    id: "voice-attributes",
    label: "Voice & Tone Guidelines",
    description:
      "Your four voice attributes, do/don't pairs, and channel tone adaptations.",
    placeholder:
      "Paste your brand voice guidelines here. Use the F5 prompt output as a starting point.",
    pillar: "Messaging",
    availableFrom: "snapshot-plus",
  },
  {
    id: "brand-story",
    label: "Brand Story",
    description:
      "Your elevator pitch, origin narrative, and boilerplate at multiple lengths.",
    placeholder:
      "Paste your brand story variants here. Use the F6 prompt output as a starting point.",
    pillar: "Positioning",
    availableFrom: "snapshot-plus",
  },
  {
    id: "audience-profile",
    label: "Audience Profile",
    description:
      "Your target audience definition, personas, and decision-maker mapping.",
    placeholder:
      "Describe your target audience and personas here. Use A1 or A10 prompt outputs as a starting point.",
    availableFrom: "blueprint",
  },
  {
    id: "persona-atlas",
    label: "Persona Atlas",
    description:
      "Structured buyer persona reference aligned with your deliverable: jobs to be done, objections, goals, roles, and channel-ready lines.",
    placeholder:
      "Capture each priority persona with: role/title, company profile, job to be done (JTBD), top objections, success metrics, and preferred channels. Mirror or extend the interactive Persona Atlas in Foundation and Strategy.",
    inputTemplate:
      "Persona: VP Marketing - Series B SaaS\n" +
      "Role: Economic buyer\n" +
      "Primary job to be done (JTBD): Build predictable pipeline without rising customer acquisition cost (CAC)\n" +
      "Core Frustration: Channel efforts are fragmented and hard to attribute\n" +
      "Primary Motivation: Hit growth targets with clearer performance visibility\n" +
      "Key Objections: Implementation risk, internal bandwidth, unclear ROI timeline\n" +
      "Preferred Channels: LinkedIn, Search, Email\n" +
      "Messaging Angle: Evidence-backed roadmap that aligns strategy and execution\n" +
      "Sample Headline: Reduce channel waste and improve qualified pipeline in 90 days\n" +
      "Sample call to action (CTA): Review my priority rollout plan\n\n" +
      "Persona: Head of Demand Gen - Mid-Market B2B\n" +
      "Role: Champion\n" +
      "Primary job to be done (JTBD): Increase conversion from existing traffic and campaigns\n" +
      "Core Frustration: Strong content output but weak mid-funnel conversion\n" +
      "Primary Motivation: Improve lead quality and campaign efficiency\n" +
      "Key Objections: Lack of proof assets, unclear sequencing, team misalignment\n" +
      "Preferred Channels: Email, Paid Social, Landing Pages\n" +
      "Messaging Angle: Practical playbooks and proof frameworks for immediate lift",
    availableFrom: "blueprint",
  },
  {
    id: "buyer-journey-map",
    label: "Buyer Journey Map",
    description:
      "Stage-by-stage map of buyer questions, touchpoints, proof assets, and conversion triggers.",
    placeholder:
      "Document journey stages (awareness to decision), buyer questions, objections, touchpoints, content assets, and stage-exit calls to action (CTAs).",
    inputTemplate:
      "Stage: Awareness\n" +
      "Primary Question: Is this a messaging problem or a channel execution problem?\n" +
      "Buyer Mindset: Looking for clarity on root cause and urgency\n" +
      "Key Objections: We have tried similar initiatives before\n" +
      "Touchpoints: LinkedIn post, thought-leadership article, webinar snippet\n" +
      "Content Types: Insight article, diagnostic checklist\n" +
      "Messaging Focus: Clarify the hidden cost of fragmented messaging\n" +
      "Stage-exit call to action (CTA): Run the brand diagnostic\n" +
      "Conversion Metric: Qualified diagnostic completions\n\n" +
      "Stage: Consideration\n" +
      "Primary Question: What approach will actually improve conversion quality?\n" +
      "Buyer Mindset: Comparing methods and risk levels\n" +
      "Key Objections: Concern about adoption effort and cross-team alignment\n" +
      "Touchpoints: Case study page, email nurture, comparison guide\n" +
      "Content Types: Case study, framework explainer\n" +
      "Messaging Focus: Show measurable outcomes with clear implementation steps\n" +
      "Stage-exit call to action (CTA): Review a sample 90-day plan\n" +
      "Conversion Metric: Strategy call bookings",
    availableFrom: "blueprint",
  },
  {
    id: "competitive-landscape-matrix",
    label: "Competitive Landscape Matrix",
    description:
      "Competitor positioning and your counter-positioning narrative for sales and marketing alignment.",
    placeholder:
      "For each competitor include: their core claim, ideal customer profile (ICP) overlap, strengths, weaknesses, where you win, and your displacement narrative.",
    inputTemplate:
      "Competitor: Competitor A\n" +
      "Their Headline Claim: AI-powered growth engine for modern teams\n" +
      "Primary ideal customer profile (ICP) overlap: VP Marketing at B2B SaaS (50-500 employees)\n" +
      "Strengths: Strong category visibility, polished outbound narrative\n" +
      "Weaknesses: Generic positioning, low implementation depth, weak proof specificity\n" +
      "Where We Win: More tailored strategic sequencing and stronger proof architecture\n" +
      "Displacement Narrative: We convert strategy into owner-ready execution that improves channel performance within 90 days\n" +
      "Traps to Avoid: Avoid broad 'all-in-one' claims that mirror their messaging\n\n" +
      "Competitor: Competitor B\n" +
      "Their Headline Claim: Fast brand refresh for growth-stage teams\n" +
      "Primary ideal customer profile (ICP) overlap: Founder-led teams preparing to scale go-to-market (GTM)\n" +
      "Strengths: Speed and visual polish\n" +
      "Weaknesses: Limited depth in journey mapping and conversion systems\n" +
      "Where We Win: Better linkage between messaging, activation, and measurable outcomes\n" +
      "Displacement Narrative: We deliver both strategic clarity and execution governance, not surface-level refresh work",
    availableFrom: "blueprint",
  },
  {
    id: "icp-conversion-intelligence",
    label: "ICP Conversion Intelligence Framework",
    description:
      "Ideal customer profile (ICP) tier conversion mechanics that bridge Messaging Framework to channel activation execution.",
    placeholder:
      "Capture ideal customer profile (ICP) conversion profile, hook performance, channel mechanics, multi-touch sequence, content matrix, and behavioral triggers per ICP tier.",
    inputTemplate:
      "ICP Tier: Primary ICP\n" +
      "Buying Cycle Length: 30-60 days\n" +
      "Primary Conversion Barrier: Unsure this can be implemented with current team capacity\n" +
      "Decision Trigger: Sees role-specific 90-day sequence with concrete proof\n" +
      "Conversion Behavior Pattern: Consumes one authority asset + one proof asset before booking\n" +
      "Hook Types That Convert: Data-led insight, peer social proof, contrarian diagnosis\n" +
      "Hook Types To Avoid: Generic hype claims, abstract inspiration without proof\n" +
      "Channel mechanics: Email (120-220 words, one call to action (CTA)); LinkedIn (insight+proof post); Search (answer-first page)\n" +
      "Critical touch: Case-study proof page view + CTA click\n" +
      "Sales Handoff Trigger: Return visit to services/pricing within 7 days\n" +
      "Matrix Cell Ref: primary-icp:consideration:case-study-proof-page\n" +
      "Behavioral Signal -> Action: Case-study download -> trigger objection-aware nurture email\n\n" +
      "ICP Tier: Secondary ICP\n" +
      "Buying Cycle Length: 45-90 days\n" +
      "Primary Conversion Barrier: Needs internal consensus and implementation confidence\n" +
      "Decision Trigger: Sees low-risk rollout and internal alignment path\n" +
      "Conversion Behavior Pattern: Shares resources internally before sales engagement",
    availableFrom: "blueprint-plus",
  },
  {
    id: "channel-notes",
    label: "Channel Notes",
    description:
      "Your channel-specific strategy notes: what to say, where, and how often.",
    placeholder:
      "Add channel strategy notes here. Use Activation tab channel plans and E-series outputs as source material.",
    availableFrom: "blueprint",
  },
  {
    id: "mood-board",
    label: "Mood Board Reference Images",
    description:
      "Trusted image URLs (stock, portfolio, or internal) that show the visual mood you want designers and vendors to match. Shown on Brand Standards and merged into brand standards PDFs.",
    placeholder:
      "Add HTTPS links to reference stills. Optional caption and rationale help your team understand why each image is on-brand.",
    availableFrom: "blueprint",
  },
  {
    id: "action-plan",
    label: "Action Plan",
    description:
      "Your 90-day prioritized brand action plan: phases, tasks, and owners.",
    placeholder:
      "Paste your action plan here. Use F8 output or your activation schedule as a starting point.",
    availableFrom: "blueprint",
  },
  {
    id: "performance-optimization",
    label: "Performance & Optimization",
    description:
      "Your monthly/quarterly performance review loop: what worked, what missed, and what to adjust next.",
    placeholder:
      "Paste your latest channel and funnel performance summary here. Use this section to log decisions and next 30-day optimizations.",
    inputTemplate:
      "Review period: [Month / Quarter]\n" +
      "Reviewer: [Name]\n" +
      "Business goal this period: [Primary outcome]\n\n" +
      "Channel snapshot\n" +
      "Email: [Open rate, CTR, conversion notes]\n" +
      "Social: [Reach, engagement quality, CTA performance]\n" +
      "Paid: [Spend, CPL/CAC, top and weak creatives]\n" +
      "SEO / Website: [Traffic quality, top pages, conversion rate]\n\n" +
      "Top wins (max 3)\n" +
      "1) [What worked]\n" +
      "2) [What worked]\n" +
      "3) [What worked]\n\n" +
      "Top misses / risks (max 3)\n" +
      "1) [What underperformed]\n" +
      "2) [What underperformed]\n" +
      "3) [What underperformed]\n\n" +
      "Optimization decisions\n" +
      "- Keep: [What stays as-is]\n" +
      "- Improve: [What to change]\n" +
      "- Pause: [What to stop]\n\n" +
      "Next 30-day priority actions\n" +
      "1) [Action] | Owner: [Name] | Due: [Date] | KPI: [Metric]\n" +
      "2) [Action] | Owner: [Name] | Due: [Date] | KPI: [Metric]\n" +
      "3) [Action] | Owner: [Name] | Due: [Date] | KPI: [Metric]",
    availableFrom: "blueprint",
  },
  {
    id: "prompt-outputs",
    label: "Saved Prompt Outputs",
    description:
      "A running log of your best AI prompt outputs — organized and reusable.",
    placeholder:
      "Paste and label prompt outputs here. Format: [Prompt ID + Name] followed by the output.",
    availableFrom: "snapshot-plus",
  },
];

export function isWorkbookSectionId(value: string | undefined | null): value is WorkbookSectionId {
  if (!value) return false;
  return WORKBOOK_SECTIONS.some((s) => s.id === value);
}

export interface WorkbookVersion {
  versionId: string;
  savedAt: string;
  label?: string;
  sectionSnapshots: Record<WorkbookSectionId, string>;
}

export interface WorkbookState {
  sectionContent: Record<WorkbookSectionId, string>;
  lastSavedAt?: string;
  versions: WorkbookVersion[];
}
