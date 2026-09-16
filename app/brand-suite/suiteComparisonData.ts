export type Cell = "check" | "dash" | string;

export type CompareSection = {
  title: string;
  rows: { feature: string; cells: [Cell, Cell, Cell, Cell] }[];
};

export const COMPARE_SECTIONS: CompareSection[] = [
  {
    title: "Your WunderBrand Score™ & Diagnostics",
    rows: [
      { feature: "WunderBrand Score™ (0–100)", cells: ["check", "check", "check", "check"] },
      {
        feature: "Five-Pillar Diagnostic — Positioning, Messaging, Visibility, Credibility & Conversion",
        cells: ["check", "check", "check", "check"],
      },
      { feature: "Priority Diagnosis — Where to Focus First", cells: ["check", "check", "check", "check"] },
      { feature: "Brand Personality Profile", cells: ["check", "check", "check", "check"] },
      {
        feature: "Personalized Strategic Recommendations",
        cells: ["Foundational", "Expanded", "Execution-ready", "Advanced"],
      },
      { feature: "AI-Informed Industry Context", cells: ["dash", "check", "check", "check"] },
      { feature: "Brand Archetype Identification", cells: ["check", "check", "check", "check"] },
      { feature: "Brand Health Scorecard", cells: ["dash", "dash", "check", "check"] },
      { feature: "SWOT Analysis", cells: ["dash", "dash", "check", "check"] },
      {
        feature: "Diagnostic Refresh — Retake and Track Your Scores Over Time",
        cells: [
          "Always free",
          "$47/refresh",
          "1 free refresh (first 90 days); $97/refresh after",
          "Unlimited (first year)§",
        ],
      },
    ],
  },
  {
    title: "Detailed Analysis",
    rows: [
      { feature: "Pillar-by-Pillar Deep Dive", cells: ["dash", "check", "check", "check"] },
      { feature: "Before & After Examples — See the Difference Fixes Make", cells: ["dash", "check", "check", "check"] },
      { feature: "Step-by-Step Guides & Templates", cells: ["dash", "dash", "dash", "check"] },
    ],
  },
  {
    title: "Brand Identity & Personality",
    rows: [
      { feature: "Communication Guidelines", cells: ["dash", "check", "check", "check"] },
      { feature: "Voice & Tone Guide", cells: ["dash", "check", "check", "check"] },
      { feature: "Brand Archetype Activation Guide", cells: ["dash", "dash", "check", "check"] },
      { feature: "Brand Purpose & Promise", cells: ["dash", "dash", "check", "check"] },
      { feature: "Value Proposition Statement", cells: ["dash", "check", "check", "check"] },
      { feature: "Positioning Statement", cells: ["dash", "dash", "check", "check"] },
      { feature: "Differentiation Statement†", cells: ["dash", "dash", "check", "check"] },
      { feature: "Brand Growth & Expansion Strategy", cells: ["dash", "dash", "dash", "check"] },
      { feature: "Brand Rules & Terminology Guide", cells: ["dash", "dash", "check", "check"] },
      { feature: "Brand Values", cells: ["dash", "dash", "check", "check"] },
      {
        feature: "Founder & Personal Brand Alignment",
        cells: ["dash", "dash", "Foundational", "Advanced"],
      },
    ],
  },
  {
    title: "Understanding Your Customers",
    rows: [
      { feature: "Ideal Customer Profile", cells: ["dash", "check", "check", "check"] },
      { feature: "Buyer Personas (2–3 per Profile)", cells: ["dash", "dash", "check", "check"] },
      { feature: "Customer Journey", cells: ["dash", "dash", "check", "check"] },
      { feature: "Audience Segments", cells: ["dash", "dash", "dash", "check"] },
    ],
  },
  {
    title: "Messaging & Content Strategy",
    rows: [
      { feature: "Core Messages", cells: ["dash", "check", "check", "check"] },
      { feature: "Tagline & Slogan Recommendations", cells: ["dash", "check", "check", "check"] },
      { feature: "Content Strategy", cells: ["dash", "check", "check", "check"] },
      { feature: "Brand Story & Origin Narrative", cells: ["dash", "dash", "check", "check"] },
      { feature: "Company Descriptions", cells: ["dash", "dash", "check", "check"] },
      { feature: "Messaging Matrix", cells: ["dash", "dash", "dash", "check"] },
      { feature: "Campaign Architecture & Narrative Arcs", cells: ["dash", "dash", "dash", "check"] },
    ],
  },
  {
    title: "Visual Direction",
    rows: [
      { feature: "Brand Color Palette", cells: ["dash", "check", "check", "check"] },
      { feature: "Typography Direction", cells: ["dash", "check", "check", "check"] },
      { feature: "Imagery Mood & Style Direction", cells: ["dash", "check", "check", "check"] },
      { feature: "Visual Consistency Rules", cells: ["dash", "check", "check", "check"] },
      { feature: "Brand Imagery & Photography Direction", cells: ["dash", "dash", "check", "check"] },
      {
        feature:
          "Visual Operating System — platform-specific imagery, persona-based guidance, AI image prompts & before/after visual audit",
        cells: ["dash", "dash", "dash", "check"],
      },
    ],
  },
  {
    title: "AI-Informed Competitive Perspective",
    rows: [
      {
        feature: "Competitive Positioning Map†",
        cells: ["dash", "dash", "Map", "Map + movement plan"],
      },
      { feature: "Competitive Gaps & Vulnerability Playbook†", cells: ["dash", "dash", "check", "check"] },
      { feature: "Where to Focus & Why", cells: ["dash", "dash", "check", "check"] },
    ],
  },
  {
    title: "Sales & Pricing Enablement",
    rows: [
      { feature: "Value & Pricing Communication Framework", cells: ["dash", "dash", "check", "check"] },
      { feature: "Sales Conversation Guide & Objection Handling", cells: ["dash", "dash", "check", "check"] },
    ],
  },
  {
    title: "Visibility & Discovery",
    rows: [
      { feature: "Visibility & Discovery Strategy", cells: ["dash", "check", "check", "check"] },
      { feature: "AI Search Readiness", cells: ["dash", "check", "check", "check"] },
      { feature: "SEO Strategy†", cells: ["dash", "dash", "check", "check"] },
      { feature: "Email Marketing Strategy", cells: ["dash", "dash", "check", "check"] },
      { feature: "Social Media Strategy", cells: ["dash", "dash", "check", "check"] },
      { feature: "Conversion Strategy", cells: ["dash", "dash", "check", "check"] },
      { feature: "Credibility & Trust Signal Strategy", cells: ["dash", "dash", "check", "check"] },
      { feature: "Thought Leadership Positioning", cells: ["dash", "dash", "dash", "check"] },
      { feature: "AI Answer Engine (AEO) Strategy", cells: ["dash", "dash", "check", "check"] },
      { feature: "Content Calendar", cells: ["dash", "dash", "dash", "check"] },
    ],
  },
  {
    title: "AI Prompt Packs — Use AI On-Brand",
    rows: [
      { feature: "Foundational Prompt Pack", cells: ["dash", "8 prompts", "check", "check"] },
      { feature: "Execution Prompt Pack", cells: ["dash", "dash", "8 prompts", "check"] },
      {
        feature: "Advanced Prompt Library (Blueprint+™ exclusive)",
        cells: ["dash", "dash", "dash", "12 frameworks"],
      },
    ],
  },
  {
    title: "Documents & Deliverables",
    rows: [
      { feature: "Brand Direction Summary", cells: ["dash", "check", "dash", "dash"] },
      { feature: "Complete WunderBrand Blueprint™", cells: ["dash", "dash", "check", "check"] },
      { feature: "Executive Summary", cells: ["dash", "check", "check", "check"] },
      { feature: "Brand Messaging Playbook", cells: ["dash", "dash", "check", "check"] },
      { feature: "AI Prompt Library Document", cells: ["dash", "dash", "check", "check"] },
      { feature: "90-Day Brand Activation Plan", cells: ["dash", "dash", "dash", "check"] },
      { feature: "Digital Marketing Strategy", cells: ["dash", "dash", "dash", "check"] },
      { feature: "Competitive Intelligence Brief", cells: ["dash", "dash", "dash", "check"] },
      { feature: "Brand Standards Guide", cells: ["dash", "dash", "dash", "check"] },
    ],
  },
  {
    title: "Your Action Plan",
    rows: [
      { feature: "Priority Action Recommendations", cells: ["dash", "check", "check", "check"] },
      { feature: "Brand Consistency Guide", cells: ["dash", "dash", "check", "check"] },
      { feature: "Measurement & Improvement Guide", cells: ["dash", "dash", "check", "check"] },
    ],
  },
  {
    title: "Delivery & Support",
    rows: [
      { feature: "Online Results Dashboard & Downloadable PDF", cells: ["check", "check", "check", "check"] },
      {
        feature: "Interactive Brand Workbook‡",
        cells: ["dash", "dash", "14-day review window", "Always editable"],
      },
      {
        feature: "File Uploads During Diagnostic",
        cells: ["dash", "dash", "Up to 3 files (images, PDFs)", "Up to 10 files (images, PDFs, PPTX, DOCX)"],
      },
      { feature: "30-minute Strategy Activation Session", cells: ["dash", "dash", "dash", "check"] },
    ],
  },
];
