// GET /api/preview/pdf?type=snapshot|snapshot-plus|blueprint|blueprint-plus|brand-standards
// Generates a PDF with mock data for preview purposes.

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export const runtime = "nodejs";
export const maxDuration = 30;

// ─── Mock Data ───
const MOCK_PILLAR_SCORES = {
  positioning: 16,
  messaging: 15,
  visibility: 14,
  credibility: 13,
  conversion: 14,
};

const MOCK_PILLAR_INSIGHTS = {
  positioning: "Strong internal clarity on what you do and who you serve, but the external messaging doesn't fully reflect this confidence.",
  messaging: "Your core message is clear, but lacks the specificity and proof points needed to convert skeptical prospects.",
  visibility: "Active across multiple channels but without a cohesive strategy — efforts are scattered rather than compounding.",
  credibility: "Trust signals exist but are buried. Social proof, credentials, and case studies need more prominent placement.",
  conversion: "Functional conversion paths exist, but CTAs are generic and lack the urgency and personalization to drive action.",
};

const MOCK_RECOMMENDATIONS = {
  positioning: "Rewrite your homepage hero to lead with the transformation you deliver, not a feature list.",
  messaging: "Develop 3 messaging pillars with supporting proof points and use them consistently across all content.",
  visibility: "Choose one primary channel for 90 days and develop a content cadence that builds compound authority.",
  credibility: "Add 2-3 customer testimonials above the fold on your homepage and service pages.",
  conversion: "Rewrite your primary CTA to be specific and outcome-focused, e.g., 'Get Your Free Brand Diagnostic' instead of 'Contact Us'.",
};

const MOCK_SNAPSHOT_REPORT = {
  userName: "Jane Smith",
  businessName: "Acme Co",
  industry: "Professional Services",
  website: "https://acmeco.com",
  socials: ["LinkedIn", "Instagram"],
  brandAlignmentScore: 72,
  pillarScores: MOCK_PILLAR_SCORES,
  pillarInsights: MOCK_PILLAR_INSIGHTS,
  recommendations: MOCK_RECOMMENDATIONS,
};

const MOCK_SNAPSHOT_PLUS_REPORT = {
  ...MOCK_SNAPSHOT_REPORT,
  contextCoverage: 85,
  persona: "The Strategic Partner — You position yourself as a trusted advisor, not a vendor. Your brand communicates competence, reliability, and deep expertise.",
  archetype: { name: "The Sage", description: "Brands built on expertise, wisdom, and helping clients make better decisions.", summary: "The Sage archetype positions Acme Co as the definitive expert in their field." },
  voice: "Confident, clear, and approachable. You communicate complex ideas simply without talking down to your audience.",
  colorPalette: [
    { name: "Navy", hex: "#021859", meaning: "Trust & authority" },
    { name: "Sky Blue", hex: "#07B0F2", meaning: "Innovation & clarity" },
    { name: "Warm White", hex: "#F8FAFD", meaning: "Clean & modern" },
  ],
  roadmap_30: "Audit homepage messaging and rewrite hero section with clear positioning statement.",
  roadmap_60: "Develop content pillar strategy and publish 4 authority pieces on LinkedIn.",
  roadmap_90: "Implement credibility wall on homepage and launch email nurture sequence.",
  opportunities_map: "Primary opportunity: Convert existing website traffic with stronger CTAs and social proof.",
  pillarDeepDives: {
    positioning: { score: 16, insight: "Strong foundation", recommendation: "Sharpen competitive differentiation." },
    messaging: { score: 15, insight: "Inconsistent tone", recommendation: "Develop brand voice guidelines." },
    visibility: { score: 14, insight: "Scattered presence", recommendation: "Focus on compound channels." },
    credibility: { score: 13, insight: "Proof points hidden", recommendation: "Surface trust signals." },
    conversion: { score: 14, insight: "Generic CTAs", recommendation: "Personalize conversion paths." },
  },
  aeoRecommendations: "Optimize your FAQ section with natural language answers. Structure service pages for AI snippet extraction. Ensure your Google Business Profile is fully completed.",
  targetAudience: "B2B service businesses with 10-50 employees looking to scale through better brand positioning.",
  competitors: "BrandCo, StrategyFirst, GrowthLab",
  brandPersonality: "Professional yet approachable. Confident without being arrogant. Data-informed but human-first.",
  visualIdentityNotes: "Current visual identity is clean but lacks distinction. Consider a bolder color accent and more photography featuring real team members.",
  aiPrompts: [
    { name: "LinkedIn Thought Leadership", prompt: "Write a LinkedIn post from the perspective of Acme Co's founder about [TOPIC]. Use a confident, approachable tone. Include a specific example or data point. End with a question to drive engagement." },
    { name: "Email Subject Line", prompt: "Generate 5 email subject lines for Acme Co promoting [SERVICE]. Focus on the transformation delivered, not features. Keep under 50 characters." },
    { name: "Case Study Outline", prompt: "Create an outline for a case study about how Acme Co helped [CLIENT TYPE] achieve [RESULT]. Include sections for challenge, approach, results, and client quote." },
  ],
};

const MOCK_BLUEPRINT_DATA = {
  userName: "Jane Smith",
  businessName: "Acme Co",
  brandAlignmentScore: 72,
  pillarScores: MOCK_PILLAR_SCORES,
  pillarInsights: MOCK_PILLAR_INSIGHTS,
  recommendations: MOCK_RECOMMENDATIONS,
  primaryPillar: "credibility",
  contextCoverage: 85,
  brandEssence: "Acme Co helps ambitious B2B service businesses build brands that attract premium clients — through strategic clarity, authentic messaging, and systems that scale.",
  brandPromise: "We promise to deliver measurable brand clarity within 90 days, giving you the confidence and tools to show up consistently in every interaction.",
  differentiation: "Unlike agencies that deliver generic templates, Acme Co builds brand systems from diagnostic data — every recommendation is specific to your gaps and opportunities.",
  archetype: { summary: "The Sage — Brands built on expertise, wisdom, and evidence-based strategy." },
  persona: { summary: "The Strategic Partner — Trusted advisor positioning that communicates competence and deep expertise." },
  toneOfVoice: [
    { name: "Confident", detail: "Lead with conviction. Avoid hedging language like 'we think' or 'maybe'. State your expertise clearly." },
    { name: "Approachable", detail: "Use conversational language. Avoid jargon. Write like you're advising a smart friend over coffee." },
    { name: "Strategic", detail: "Always connect tactics to outcomes. Every recommendation should answer 'so what?' for the reader." },
  ],
  messagingPillars: [
    { title: "Expert Authority", detail: "Position every piece of content around your unique methodology and proven results." },
    { title: "Client Transformation", detail: "Lead with the outcome your clients achieve, not the process you follow." },
    { title: "Systematic Growth", detail: "Emphasize that brand growth is repeatable and measurable, not random." },
  ],
  colorPalette: [
    { name: "Navy", hex: "#021859", meaning: "Trust & authority" },
    { name: "Sky Blue", hex: "#07B0F2", meaning: "Innovation" },
    { name: "Warm White", hex: "#F8FAFD", meaning: "Clarity" },
  ],
  aiPrompts: [
    { name: "LinkedIn Post", prompt: "Write a LinkedIn thought leadership post for Acme Co about [TOPIC]..." },
    { name: "Email Nurture", prompt: "Draft a 3-email nurture sequence for new leads who downloaded [LEAD MAGNET]..." },
    { name: "Website Copy", prompt: "Rewrite this homepage hero section for Acme Co with clear positioning..." },
  ],
};

const MOCK_BLUEPRINT_PLUS_DATA = {
  ...MOCK_BLUEPRINT_DATA,
  brandStory: {
    long: "Acme Co was founded with a simple belief: every B2B service business deserves a brand that works as hard as they do. After watching dozens of talented founders struggle with inconsistent messaging and scattered marketing, we built a diagnostic-first approach that turns brand confusion into brand clarity — in 90 days or less.",
    short: "We help B2B service businesses build brands that attract premium clients through strategic clarity and authentic messaging.",
  },
  positioning: {
    statement: "For B2B service businesses who are tired of blending in, Acme Co is the brand strategy partner that delivers measurable clarity through data-driven diagnostics — unlike generic agencies that recycle the same playbook for every client.",
    differentiators: [
      { name: "Diagnostic-First Approach", detail: "Every strategy starts with data, not assumptions. We score your brand across 5 pillars before writing a single word." },
      { name: "90-Day Clarity Guarantee", detail: "We commit to measurable brand improvement within 90 days, tracked through our proprietary WunderBrand Score." },
    ],
  },
  journey: [
    { stage: "Awareness", goal: "Discover Acme Co through thought leadership", emotion: "Curious", opportunities: "LinkedIn content, SEO articles, podcast appearances" },
    { stage: "Consideration", goal: "Understand the diagnostic approach", emotion: "Intrigued", opportunities: "Free Snapshot, case studies, comparison guides" },
    { stage: "Decision", goal: "Choose Acme Co as brand partner", emotion: "Confident", opportunities: "Strategy call, Blueprint preview, testimonials" },
  ],
  contentRoadmap: [
    { month: "Month 1-3", theme: "Establishing authority through diagnostic insights and case studies" },
    { month: "Month 4-6", theme: "Deepening trust with methodology breakdowns and client transformations" },
    { month: "Month 7-9", theme: "Expanding reach through partnerships and guest contributions" },
    { month: "Month 10-12", theme: "Scaling with systems, templates, and community building" },
  ],
  visualDirection: [
    { category: "Photography", description: "Real team members in professional but relaxed settings. Avoid stock photography." },
    { category: "Typography", description: "Clean sans-serif for headers (Inter), readable serif for body copy. Hierarchy through weight, not size." },
    { category: "Color Usage", description: "Navy as primary, Sky Blue as accent for CTAs and highlights. White space is your friend." },
  ],
  personality: "Professional yet approachable. We're the advisor who gives you the truth — clearly and kindly — then helps you act on it.",
  decisionFilters: [
    "Does this reinforce our expert authority?",
    "Would our ideal client find this valuable?",
    "Is this consistent with our brand voice?",
    "Does this move someone closer to a decision?",
  ],
  aiPrompts: [
    ...MOCK_BLUEPRINT_DATA.aiPrompts,
    { name: "Case Study", prompt: "Write a detailed case study for Acme Co about [CLIENT]..." },
    { name: "Social Strategy", prompt: "Create a 30-day social media content plan for Acme Co..." },
  ],
};

const MOCK_WORKBOOK_DATA = {
  business_name: "Acme Co",
  positioning_statement: "For B2B service businesses who are tired of blending in, Acme Co is the brand strategy partner that delivers measurable clarity through data-driven diagnostics.",
  unique_value_proposition: "We turn brand confusion into brand clarity in 90 days using a proprietary 5-pillar diagnostic that reveals exactly where your brand is strong and where it's leaking revenue.",
  competitive_differentiation: "Unlike agencies that deliver generic templates, every Acme Co recommendation is generated from your actual diagnostic data — making it specific, actionable, and measurable.",
  elevator_pitch_30s: "We help B2B service businesses stop blending in. Using a proprietary brand diagnostic, we identify exactly where your brand is strong and where it's losing clients — then give you a clear plan to fix it in 90 days.",
  elevator_pitch_60s: "Most B2B service businesses know they have a brand problem but can't pinpoint what it is. Their messaging is scattered, their positioning is vague, and they're losing deals to competitors who aren't necessarily better — just clearer. Acme Co solves this with a diagnostic-first approach. We score your brand across five key pillars, identify the specific gaps, and deliver a strategic blueprint with exact next steps. Our clients typically see measurable improvement in brand clarity within 90 days.",
  elevator_pitch_email: "Hi — I'm the founder of Acme Co. We help B2B service businesses build brands that attract premium clients. Using our proprietary diagnostic, we pinpoint exactly where your brand messaging is strong and where it's costing you revenue — then deliver a clear, actionable plan. Would you be open to a quick conversation about your brand?",
  messaging_pillars: [
    { title: "Expert Authority", description: "Position every piece of content around your unique methodology and proven results.", proof_points: ["15+ years of brand strategy experience", "200+ brands diagnosed", "92% client satisfaction rate"] },
    { title: "Client Transformation", description: "Lead with the outcome your clients achieve, not the process you follow.", proof_points: ["Average 40% increase in qualified leads", "Clients report clearer messaging within 30 days", "87% of clients expand engagement"] },
    { title: "Systematic Growth", description: "Emphasize that brand growth is repeatable and measurable, not random.", proof_points: ["Proprietary 5-pillar scoring system", "90-day clarity guarantee", "Quarterly brand health monitoring"] },
  ],
  brand_voice_attributes: ["Confident", "Approachable", "Strategic", "Clear", "Evidence-based"],
  tone_guidelines: "Lead with conviction but stay human. Use data to support claims but tell stories to make them stick. Avoid jargon — if a smart 16-year-old wouldn't understand it, rewrite it. Match formality to context: LinkedIn is professional-casual, proposals are structured but warm, social is conversational.",
  voice_dos: ["Use active voice", "Lead with outcomes", "Include specific numbers", "Tell client stories"],
  voice_donts: ["Use hedging language", "Lead with features", "Use industry jargon", "Sound corporate or cold"],
  primary_audience: { description: "B2B service business founders and marketing leaders with 10-50 employees, $1M-$10M revenue, who know their brand needs work but don't know where to start.", pain_points: ["Inconsistent messaging across channels", "Losing deals to clearer competitors", "Can't articulate their differentiation"], decision_triggers: ["Losing a deal they should have won", "Hiring and realizing the brand story is unclear", "Preparing for a rebrand or market expansion"] },
  secondary_audience: { description: "Marketing agencies and consultants who want to add brand diagnostics to their service offering through white-label partnerships." },
  key_differentiators: [
    { differentiator: "Diagnostic-First Approach", competitive_advantage: "Every strategy starts with data, not assumptions", proof: "Proprietary WunderBrand Score across 5 pillars" },
    { differentiator: "90-Day Clarity Guarantee", competitive_advantage: "Measurable results, not vague promises", proof: "Tracked via quarterly brand health monitoring" },
    { differentiator: "AI-Augmented Strategy", competitive_advantage: "Human strategy + AI execution tools", proof: "Custom prompt libraries for each client" },
  ],
  brand_archetype: "The Sage",
  archetype_description: "The Sage archetype is driven by the desire to seek truth and share knowledge. Sage brands are recognized for their expertise, wisdom, and ability to help others make better decisions through evidence and insight.",
  archetype_application: "Apply the Sage archetype by leading every interaction with insight rather than salesmanship. Share original research, frameworks, and diagnostic findings freely. Position your team as educators first, service providers second. In content, always answer 'why' before 'how'.",
  brand_alignment_score: 72,
  primary_pillar: "credibility",
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "snapshot";

  try {
    let element: React.ReactElement;
    let filename: string;

    switch (type) {
      case "snapshot": {
        const { BrandSnapshotPDF } = await import("@/src/pdf/BrandSnapshotPDF");
        element = React.createElement(BrandSnapshotPDF, { report: MOCK_SNAPSHOT_REPORT as any });
        filename = "Acme_Co_WunderBrand_Snapshot.pdf";
        break;
      }
      case "snapshot-plus": {
        const { BrandSnapshotPlusPDF } = await import("@/src/pdf/BrandSnapshotPlusPDF");
        element = React.createElement(BrandSnapshotPlusPDF, { report: MOCK_SNAPSHOT_PLUS_REPORT as any });
        filename = "Acme_Co_WunderBrand_Snapshot_Plus.pdf";
        break;
      }
      case "blueprint": {
        const { BlueprintDocument } = await import("@/app/reports/BlueprintDocument");
        element = React.createElement(BlueprintDocument, { data: MOCK_BLUEPRINT_DATA as any });
        filename = "Acme_Co_WunderBrand_Blueprint.pdf";
        break;
      }
      case "blueprint-plus": {
        const { BlueprintPlusDocument } = await import("@/app/reports/BlueprintPlusDocument");
        element = React.createElement(BlueprintPlusDocument, { data: MOCK_BLUEPRINT_PLUS_DATA as any });
        filename = "Acme_Co_WunderBrand_Blueprint_Plus.pdf";
        break;
      }
      case "brand-standards": {
        const { BrandStandardsDocument } = await import("@/src/pdf/documents/BrandStandardsDocument");
        element = React.createElement(BrandStandardsDocument, { data: MOCK_WORKBOOK_DATA as any });
        filename = "Acme_Co_Brand_Standards_Guide.pdf";
        break;
      }
      default:
        return NextResponse.json({ error: `Unknown type: ${type}. Use: snapshot, snapshot-plus, blueprint, blueprint-plus, brand-standards` }, { status: 400 });
    }

    const buffer = await renderToBuffer(element);

    // Check if user wants inline viewing (default) or download
    const download = url.searchParams.get("download") === "1";
    const disposition = download ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[Preview PDF] Error:", err);
    return NextResponse.json(
      { error: "PDF generation failed.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
