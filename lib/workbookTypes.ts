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
      "The one sentence every brand decision should come back to—how you stand out for the buyers you want.",
    placeholder:
      "Paste your positioning statement here. Use the F1 prompt output as a starting point, or write it from scratch.",
    pillar: "Positioning",
    availableFrom: "snapshot-plus",
  },
  {
    id: "strategic-offer-context",
    label: "What you sell",
    description:
      "Your main offer (product, service, or program), the buyer job it helps with, what’s in or out of scope, and how every channel should describe the same offer.",
    placeholder:
      "Primary offer name and one-line pitch. Job statement (When…, I want to…, so I can…). Pains relieved, outcomes, in-scope vs out-of-scope, leading signals to review, and channel alignment notes. Pull phrasing from the Strategy tab “What you sell” panel and your Blueprint positioning context.",
    pillar: "Positioning",
    availableFrom: "blueprint",
  },
  {
    id: "messaging-framework",
    label: "Core messages",
    description:
      "Your brand promise, short story, and three message themes with proof you can repeat across channels.",
    placeholder:
      "Paste your core messaging framework here. Use the F3 prompt output as a starting point.",
    pillar: "Messaging",
    availableFrom: "snapshot-plus",
  },
  {
    id: "voice-attributes",
    label: "Voice & Tone Guidelines",
    description:
      "How you sound: four voice traits, do/don’t examples, and how tone shifts by channel.",
    placeholder:
      "Paste your brand voice guidelines here. Use the F5 prompt output as a starting point.",
    pillar: "Messaging",
    availableFrom: "snapshot-plus",
  },
  {
    id: "brand-story",
    label: "Brand Story",
    description:
      "Your elevator pitch, origin story, and short/long boilerplate for different uses.",
    placeholder:
      "Paste your brand story variants here. Use the F6 prompt output as a starting point.",
    pillar: "Positioning",
    availableFrom: "snapshot-plus",
  },
  {
    id: "audience-profile",
    label: "Audience Profile",
    description:
      "Who you’re talking to: target audience, buyer roles, and how decisions get made.",
    placeholder:
      "Describe your target audience and personas here. Use A1 or A10 prompt outputs as a starting point.",
    availableFrom: "blueprint",
  },
  {
    id: "persona-atlas",
    label: "Buyer role profiles",
    description:
      "A reference for priority buyers: what they’re trying to accomplish, what stops them, goals, roles, and sample lines for each channel.",
    placeholder:
      "Capture each priority persona with: role/title, company profile, job to be done (JTBD), top objections, success metrics, and preferred channels. Mirror or extend the buyer profiles in Foundation and Strategy.",
    inputTemplate:
      "Persona: VP Marketing - Series B SaaS\n" +
      "Role: Budget owner\n" +
      "Primary job to be done (JTBD): Build predictable pipeline without rising customer acquisition cost (CAC)\n" +
      "Core Frustration: Channel efforts are fragmented and hard to attribute\n" +
      "Primary Motivation: Hit growth targets with clearer performance visibility\n" +
      "Key Objections: Implementation risk, internal bandwidth, unclear ROI timeline\n" +
      "Preferred Channels: LinkedIn, Search, Email\n" +
      "Messaging Angle: Evidence-backed roadmap that aligns strategy and execution\n" +
      "Sample Headline: Reduce channel waste and improve qualified pipeline in 90 days\n" +
      "Sample call to action (CTA): Review my priority rollout plan\n\n" +
      "Persona: Head of Demand Gen - Mid-Market B2B\n" +
      "Role: Internal champion\n" +
      "Primary job to be done (JTBD): Increase conversion from existing traffic and campaigns\n" +
      "Core Frustration: Strong content output but weak conversion in the middle of the buying process\n" +
      "Primary Motivation: Improve lead quality and campaign efficiency\n" +
      "Key Objections: Lack of proof assets, unclear sequencing, team misalignment\n" +
      "Preferred Channels: Email, Paid Social, Landing Pages\n" +
      "Messaging Angle: Practical plans and proof frameworks for immediate lift",
    availableFrom: "blueprint",
  },
  {
    id: "buyer-journey-map",
    label: "Buyer Journey Map",
    description:
      "Stage-by-stage map of buyer questions, where they hear from you, proof that builds trust, and what gets them to take the next step.",
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
    label: "Competitive Landscape",
    description:
      "What competitors claim, where you overlap, and how you answer when alternatives come up—so sales and marketing stay aligned.",
    placeholder:
      "For each competitor include: their core claim, ideal customer profile (ICP) overlap, strengths, weaknesses, where you win, and the line that explains why choose you instead.",
    inputTemplate:
      "Competitor: Competitor A\n" +
      "Their Headline Claim: AI-powered growth engine for modern teams\n" +
      "Primary ideal customer profile (ICP) overlap: VP Marketing at B2B SaaS (50-500 employees)\n" +
      "Strengths: Strong category visibility, polished outbound narrative\n" +
      "Weaknesses: Generic positioning, low implementation depth, weak proof specificity\n" +
      "Where We Win: More tailored strategic sequencing and stronger proof architecture\n" +
      "Why choose us instead: We convert strategy into work your team can run that improves channel performance within 90 days\n" +
      "Traps to Avoid: Avoid broad 'all-in-one' claims that mirror their messaging\n\n" +
      "Competitor: Competitor B\n" +
      "Their Headline Claim: Fast brand refresh for growth-stage teams\n" +
      "Primary ideal customer profile (ICP) overlap: Founder-led teams preparing to scale go-to-market (GTM)\n" +
      "Strengths: Speed and visual polish\n" +
      "Weaknesses: Limited depth in journey mapping and conversion systems\n" +
      "Where We Win: Better linkage between messaging, activation, and measurable outcomes\n" +
      "Why choose us instead: We deliver both strategic clarity and follow-through, not surface-level refresh work",
    availableFrom: "blueprint",
  },
  {
    id: "icp-conversion-intelligence",
    label: "How best-fit buyers convert",
    description:
      "How your best-fit buyers decide and convert—and how that connects your core messages to what you publish and send.",
    placeholder:
      "Capture conversion profile, what opens conversations, channel mechanics, follow-up order, content by stage, and signals that mean “ready to talk”—per ideal customer profile (ICP) tier.",
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
      "Channel-specific notes: what to say, where, and how often.",
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
