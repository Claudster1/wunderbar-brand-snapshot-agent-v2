"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Section IDs for navigation
const SECTIONS = [
  { id: "positioning", label: "Brand Positioning", shortLabel: "Positioning", hint: "Define market position and point of view.", accent: "#0EA5E9" },
  { id: "pitches", label: "Brand Narrative", shortLabel: "Narrative", hint: "Shape your company description and reusable pitch copy.", accent: "#0284C7" },
  { id: "messaging", label: "Messaging Pillars", shortLabel: "Messaging", hint: "Build repeatable messages and proof points.", accent: "#2563EB" },
  { id: "voice", label: "Brand Voice & Tone", shortLabel: "Voice", hint: "Refine language rules and stylistic guardrails.", accent: "#7C3AED" },
  { id: "report-sections", label: "Campaign + Channel Copy", shortLabel: "Channel Copy", hint: "Edit email, social, and other execution-ready copy.", accent: "#0369A1" },
] as const;

type Workbook = Record<string, any>;

function SectionGlyph({ sectionId, color }: { sectionId: string; color: string }) {
  const common = { stroke: color, strokeWidth: 1.7, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (sectionId) {
    case "positioning":
      return (
        <svg viewBox="0 0 20 20" width={13} height={13} aria-hidden>
          <circle cx="10" cy="10" r="7" {...common} />
          <circle cx="10" cy="10" r="2.5" {...common} />
          <path d="M10 3v2M17 10h-2M10 17v-2M3 10h2" {...common} />
        </svg>
      );
    case "pitches":
      return (
        <svg viewBox="0 0 20 20" width={13} height={13} aria-hidden>
          <path d="M4 6h12v8H4z" {...common} />
          <path d="M4 8l6 4 6-4" {...common} />
        </svg>
      );
    case "messaging":
      return (
        <svg viewBox="0 0 20 20" width={13} height={13} aria-hidden>
          <path d="M3 4h14v9H8l-4 3v-3H3z" {...common} />
        </svg>
      );
    case "voice":
      return (
        <svg viewBox="0 0 20 20" width={13} height={13} aria-hidden>
          <path d="M10 4a3 3 0 013 3v3a3 3 0 11-6 0V7a3 3 0 013-3z" {...common} />
          <path d="M6 10a4 4 0 008 0M10 14v2" {...common} />
        </svg>
      );
    case "audience":
      return (
        <svg viewBox="0 0 20 20" width={13} height={13} aria-hidden>
          <circle cx="7" cy="7" r="2.2" {...common} />
          <circle cx="13" cy="8" r="2" {...common} />
          <path d="M3.5 15c.4-2.2 2-3.4 3.5-3.4h.1c1.5 0 3.1 1.2 3.5 3.4M11 15c.3-1.7 1.6-2.8 3-2.8" {...common} />
        </svg>
      );
    case "differentiators":
      return (
        <svg viewBox="0 0 20 20" width={13} height={13} aria-hidden>
          <path d="M10 3l2.1 4.3 4.7.7-3.4 3.3.8 4.7L10 13.7 5.8 16l.8-4.7L3.2 8l4.7-.7L10 3z" {...common} />
        </svg>
      );
    case "strategic":
      return (
        <svg viewBox="0 0 20 20" width={13} height={13} aria-hidden>
          <path d="M3 15h4V8H3zM8 15h4V5H8zM13 15h4v-3h-4z" {...common} />
        </svg>
      );
    case "report-sections":
      return (
        <svg viewBox="0 0 20 20" width={13} height={13} aria-hidden>
          <path d="M5 3h8l3 3v11H5z" {...common} />
          <path d="M13 3v3h3M8 9h5M8 12h5" {...common} />
        </svg>
      );
    case "archetype":
      return (
        <svg viewBox="0 0 20 20" width={13} height={13} aria-hidden>
          <path d="M10 3l5 3v5c0 3-2.1 4.8-5 6-2.9-1.2-5-3-5-6V6l5-3z" {...common} />
          <path d="M8.2 10.2l1.4 1.4 2.4-2.4" {...common} />
        </svg>
      );
    default:
      return null;
  }
}

function getSampleWorkbookStorageKey(reportId: string, email: string): string {
  return `wundy:sample-workbook:${reportId}:${email.toLowerCase()}`;
}

function createSampleWorkbook(reportId: string, email: string): Workbook {
  return {
    report_id: reportId || "sample-blueprint-plus",
    email: email || "sample@wunderbar.local",
    business_name: "Sample Brand",
    product_tier: "blueprint_plus",
    brand_alignment_score: 72,
    positioning_statement: "We help B2B teams align brand strategy with measurable growth outcomes.",
    unique_value_proposition: "Diagnostic-led strategy + implementation-ready outputs.",
    competitive_differentiation: "Proof-first brand systems calibrated for B2B buying journeys.",
    elevator_pitch_30s: "We help B2B brands turn strategy into clear market momentum.",
    elevator_pitch_60s: "We diagnose positioning, messaging, visibility, credibility, and conversion to build a brand system your team can execute consistently.",
    elevator_pitch_email: "Sharing a short intro to our approach: we combine brand diagnostics with practical implementation plans.",
    messaging_pillars: [
      { title: "Clarity", description: "Say the same core value with less friction." },
      { title: "Proof", description: "Pair every claim with concrete evidence." },
    ],
    brand_voice_attributes: ["Confident", "Clear", "Supportive"],
    tone_guidelines: "Use direct language, avoid hype, lead with outcomes.",
    primary_audience: { description: "B2B founders and marketing leaders." },
    secondary_audience: { description: "Sales and customer success leaders." },
    key_differentiators: [{ differentiator: "Strategy depth with execution clarity." }],
    brand_archetype: "The Sage",
    archetype_description: "Expert guidance with structured clarity.",
    archetype_application: "Apply across messaging, sales narratives, and educational content.",
    custom_sections: {
      strategic: {
        swot_overview: "Sample SWOT summary for workbook editing.",
        swot_strengths: "Strategic clarity\nHigh-quality process",
        swot_weaknesses: "Inconsistent proof placement\nChannel message drift",
        swot_opportunities: "Category authority content\nAEO optimization",
        swot_threats: "Specialized competitors entering category",
      },
      archetype_outputs: {
        messaging_translation: "Use a teaching-led tone: lead with insight, then practical next steps. Keep language confident, specific, and calm.",
        visual_translation: "Prioritize clean layouts, restrained color use, and data-forward visuals that signal clarity and credibility over hype.",
        content_translation: "Focus on educational frameworks, myth-vs-fact breakdowns, and proof-backed playbooks that help buyers make better decisions.",
      },
      report_sections: {
        company_description:
          "Sample Brand helps growth-stage teams clarify strategy and execute with consistent, proof-backed messaging across channels.",
        executive_summary:
          "Sample Brand has a strong strategic foundation but needs tighter cross-channel consistency to turn clarity into sustained pipeline momentum.",
        score_analysis:
          "Current score reflects solid positioning and message quality, with the biggest upside in proof visibility and conversion flow consistency.",
        pillar_results:
          "Positioning and messaging are directionally strong; visibility, credibility, and conversion improve when proof-backed language is applied consistently.",
        strategic_signals:
          "The highest-leverage signal is proof placement: when evidence appears earlier in the buyer journey, trust and conversion efficiency rise together.",
        competitive_positioning:
          "Sample Brand differentiates through a diagnostic-led approach that translates strategy into practical execution for B2B teams.",
        journey_map:
          "Journey stages should align around one narrative: clear problem framing at awareness, proof in consideration, and low-friction CTA at decision.",
        seo_aeo:
          "Prioritize high-intent queries around brand strategy diagnostics and implementation, then reinforce with answer-focused proof snippets.",
        conversion_strategy:
          "Use one primary CTA per page, paired with immediate proof and a lower-friction secondary option for earlier-stage buyers.",
        implementation_action_plan: buildImplementationActionPlan({
          report_id: reportId,
          email,
          business_name: "Sample Brand",
          primary_pillar: "credibility",
          messaging_pillars: [
            { title: "Clarity" },
            { title: "Proof" },
            { title: "Differentiation" },
          ],
        }),
        email_framework: buildEmailCampaignDraft({
          report_id: reportId,
          email,
          business_name: "Sample Brand",
          positioning_statement: "We help B2B teams align strategy with measurable growth outcomes.",
          unique_value_proposition: "Diagnostic-led strategy + implementation-ready outputs.",
          primary_audience: { description: "B2B founders and marketing leaders." },
          brand_voice_attributes: ["Confident", "Clear", "Supportive"],
          messaging_pillars: [
            { title: "Clarity", description: "Say the same core value with less friction." },
            { title: "Proof", description: "Pair every claim with concrete evidence." },
            { title: "Differentiation", description: "Show what makes your approach hard to replace." },
          ],
        }),
        social_strategy: buildSocialCampaignDraft({
          report_id: reportId,
          email,
          business_name: "Sample Brand",
          brand_voice_attributes: ["Confident", "Clear", "Supportive"],
          messaging_pillars: [
            { title: "Clarity" },
            { title: "Proof" },
            { title: "Differentiation" },
            { title: "Execution" },
          ],
        }),
        content_type_channel_plan: buildContentTypeChannelPlan({
          report_id: reportId,
          email,
          business_name: "Sample Brand",
          primary_audience: { description: "B2B founders and marketing leaders." },
          competitive_differentiation: "Proof-first brand systems calibrated for B2B buying journeys.",
          custom_sections: {
            report_sections: {
              journey_map: "Awareness, consideration, decision, retention.",
              seo_aeo: "Prioritize answer-first and high-intent discovery queries.",
            },
          },
        }),
      },
    },
  };
}

function getSampleMessagingPillars(wb?: Workbook): Array<{ title: string; description: string; proof_points?: string[] }> {
  const business = String(wb?.business_name || "the brand");
  const uvp = String(wb?.unique_value_proposition || "").trim();
  const positioning = String(wb?.positioning_statement || "").trim();
  const differentiation = String(wb?.competitive_differentiation || "").trim();
  return [
    {
      title: "Core Value Narrative",
      description:
        uvp || `${business} communicates value in clear, practical language leaders can act on quickly.`,
      proof_points: ["Use one core promise per asset", "Lead with decision-ready outcomes"],
    },
    {
      title: "Positioning Narrative",
      description:
        positioning || `${business} should anchor every message in a strong strategic position for the right audience.`,
      proof_points: ["Cite concrete case outcomes", "Pair every promise with proof"],
    },
    {
      title: "Differentiation Narrative",
      description:
        differentiation || `${business} should consistently reinforce what makes the brand distinct and hard to replace.`,
      proof_points: ["Define channel-specific usage", "Provide reusable message patterns"],
    },
  ];
}

function buildEmailCampaignDraft(wb: Workbook): string {
  const business = String(wb?.business_name || "Your brand").trim();
  const audience =
    String(wb?.primary_audience?.description || "").trim() ||
    "your best-fit buyers";
  const uvp = String(wb?.unique_value_proposition || "").trim();
  const positioning = String(wb?.positioning_statement || "").trim();
  const voiceTraits = Array.isArray(wb?.brand_voice_attributes)
    ? wb.brand_voice_attributes.map((v: any) => String(v).trim()).filter(Boolean)
    : [];
  const traitText = voiceTraits.length > 0 ? voiceTraits.join(", ") : "clear, confident, practical";
  const pillars = Array.isArray(wb?.messaging_pillars) ? wb.messaging_pillars.slice(0, 3) : [];
  const pillarLine =
    pillars.length > 0
      ? pillars
          .map((p: any, idx: number) => `${idx + 1}) ${String(p?.title || `Pillar ${idx + 1}`).trim()}: ${String(p?.description || "").trim()}`)
          .join("\n")
      : "1) Value: Clarify outcomes.\n2) Proof: Add credibility markers.\n3) Differentiation: Show why this is distinct.";
  const competitiveAngle =
    String(wb?.custom_sections?.report_sections?.competitive_positioning || "").trim() ||
    String(wb?.competitive_differentiation || "").trim() ||
    "Lead with what makes this brand meaningfully different from alternatives.";

  return `Campaign Voice: ${traitText}

Audience: ${audience}
Positioning anchor: ${positioning || `${business} delivers clear, implementation-ready outcomes.`}
Core value: ${uvp || "A practical, outcome-driven approach with clear next steps."}
Competitive angle: ${competitiveAngle}

Content Type + Funnel Alignment
- Email 1 (Awareness): Educational insight + quick diagnostic checklist.
- Email 2 (Consideration): Proof story + framework breakdown + objection reframing.
- Email 3 (Decision): Offer framing + next-step CTA with urgency rooted in outcomes.

Email 1 - Welcome / Problem Framing
Subject: A clearer path to [desired outcome]
Preview text: A simple framework to reduce friction and build momentum.
Body:
Hi [First Name],

Many teams know what they want to achieve but still struggle with message consistency across channels. ${business} helps teams turn strategy into execution-ready language they can actually use.

In this first note, start by naming one friction point your audience feels every week, then connect it to one practical shift they can make right now.

CTA: Reply with your biggest messaging bottleneck and we will send a tailored recommendation.

Email 2 - Nurture / Proof + Education
Subject: What top-performing teams do differently
Preview text: Three practical moves to improve consistency and conversion.
Body:
Hi [First Name],

Here are three message pillars your team can apply immediately:
${pillarLine}

Each pillar should appear in your website copy, sales language, email, and social content so buyers hear one coherent story.

CTA: Download the one-page messaging playbook and align your next campaign.

Email 3 - Conversion / Offer + Next Step
Subject: Ready to turn this into execution?
Preview text: A focused activation plan for your next 30 days.
Body:
Hi [First Name],

If you are ready to close the gap between strategy and implementation, the next step is to apply these pillars to one priority campaign and one priority page this week.

${business} can help you operationalize this across your channels with clear sequencing, proof placement, and conversion-focused copy.

CTA: Book your strategy activation session and leave with a 30-day implementation plan.`;
}

function buildSocialCampaignDraft(wb: Workbook): string {
  const business = String(wb?.business_name || "Your brand").trim();
  const voiceTraits = Array.isArray(wb?.brand_voice_attributes)
    ? wb.brand_voice_attributes.map((v: any) => String(v).trim()).filter(Boolean)
    : [];
  const traitText = voiceTraits.length > 0 ? voiceTraits.join(", ") : "clear, credible, practical";
  const pillars = Array.isArray(wb?.messaging_pillars) ? wb.messaging_pillars.slice(0, 4) : [];
  const pillarA = String(pillars[0]?.title || "Core Value");
  const pillarB = String(pillars[1]?.title || "Proof");
  const pillarC = String(pillars[2]?.title || "Differentiation");
  const pillarD = String(pillars[3]?.title || "Execution");
  const competitiveAngle =
    String(wb?.custom_sections?.report_sections?.competitive_positioning || "").trim() ||
    String(wb?.competitive_differentiation || "").trim() ||
    "Differentiate clearly against generic alternatives.";

  return `Weekly Social Campaign (7 posts)
Brand voice: ${traitText}
Primary goal: Build trust, reinforce positioning, and drive action.
Competitive angle: ${competitiveAngle}

Post 1 (LinkedIn) - POV / Insight (Thought leadership)
Hook: Most brands do not have a strategy problem. They have an execution consistency problem.
Body: ${business} helps teams convert strategy into repeatable messaging so buyers hear one clear story across website, sales, email, and social.
CTA: Comment "PLAYBOOK" and we will send a practical framework.
Visual direction: Clean stat card with one key insight.

Post 2 (Instagram) - Carousel Education (Framework content)
Hook: 3 signs your messaging is leaking momentum
Body: Slide 1 intro, slides 2-4 each cover one gap tied to ${pillarA}, ${pillarB}, and ${pillarC}, final slide gives one fix.
CTA: Save this post for your next campaign planning session.
Visual direction: Branded carousel, high contrast headings, concise body lines.

Post 3 (LinkedIn) - Proof Story (Case study snippet)
Hook: What changed when one team unified messaging
Body: Share a short before/after narrative tied to ${pillarB}. Focus on outcome metrics, confidence gains, and faster campaign execution.
CTA: DM "CASE" for the breakdown template.
Visual direction: Before/after split graphic with one proof metric.

Post 4 (X / Threads) - Quick Take (Contrarian angle)
Hook: Consistency beats volume.
Body: One strong weekly message repeated with proof will outperform seven disconnected posts.
CTA: Share if your team is simplifying this quarter.
Visual direction: Bold text card with minimal icon treatment.

Post 5 (LinkedIn) - Framework (How-to post)
Hook: A simple weekly message operating system
Body: Monday insight, Wednesday proof, Friday conversion prompt. Map each to ${pillarD} and keep CTA friction low.
CTA: Want the template? Comment "SYSTEM".
Visual direction: Timeline diagram.

Post 6 (Instagram Reel / Short Video) - Founder POV (Authority clip)
Hook: The #1 copy mistake most teams make
Body: 30-45s explanation with one practical fix and one line teams can use today.
CTA: Follow for weekly implementation prompts.
Visual direction: Direct-to-camera with branded captions.

Post 7 (LinkedIn + Instagram) - Conversion Prompt (Offer post)
Hook: Ready to operationalize your brand playbook?
Body: If your team wants channel-ready copy (not just strategy docs), start with one campaign and one conversion page this week.
CTA: Book your strategy activation session.
Visual direction: CTA graphic with calendar prompt and trust marker.`;
}

function buildContentTypeChannelPlan(wb: Workbook): string {
  const audience =
    String(wb?.primary_audience?.description || "").trim() ||
    "Primary buyer persona";
  const competitiveAngle =
    String(wb?.custom_sections?.report_sections?.competitive_positioning || "").trim() ||
    String(wb?.competitive_differentiation || "").trim() ||
    "Emphasize what differentiates this brand from generic alternatives.";
  const searchIntent =
    String(wb?.custom_sections?.report_sections?.seo_aeo || "").trim() ||
    "Prioritize high-intent search and answer-style discovery content.";
  const journeyMap =
    String(wb?.custom_sections?.report_sections?.journey_map || "").trim() ||
    "Awareness → Consideration → Decision → Retention";

  return `Audience focus: ${audience}
Competitive angle to weave into every asset: ${competitiveAngle}

Where this audience looks for content
- Search (SEO/AEO): comparison, pricing, and implementation queries.
- LinkedIn: POV, frameworks, and proof-led case snippets.
- Email: nurture, objection handling, and conversion prompts.

Content Type by Funnel Stage
- Awareness: Insight posts, educational carousels, answer-first SEO pages, short authority videos.
- Consideration: Case studies, comparison posts, objection-reframe emails, tactical guides.
- Decision: Offer pages, conversion emails, ROI/proof summaries, implementation plan CTA posts.
- Retention/Expansion: playbook updates, wins recap emails, advanced strategy content.

30-day channel cadence starter
- LinkedIn: 3 posts/week (1 POV, 1 proof, 1 framework).
- Instagram: 2 posts/week (1 carousel, 1 short video).
- Email: 1 nurture email/week plus behavior-based follow-ups.
- Search content: 1 high-intent page or brief/week.

Execution guardrails
- Every asset must map to one funnel stage, one CTA, and one proof point.
- Keep voice aligned to brand traits while adapting format by channel.
- Use journey checkpoints from this map: ${journeyMap}
- Review performance weekly and reallocate toward highest-converting content types.`;
}

function buildImplementationActionPlan(wb: Workbook): string {
  const business = String(wb?.business_name || "Your brand").trim();
  const primaryPillar = String(wb?.primary_pillar || "messaging").trim();
  const pillars = Array.isArray(wb?.messaging_pillars) ? wb.messaging_pillars : [];
  const topPillars = pillars.slice(0, 3).map((p: any) => String(p?.title || "").trim()).filter(Boolean);

  return `30-Day Sprint (Foundation)
- Finalize company description, positioning statement, and top 3 messaging pillars.
- Publish updated homepage hero + one conversion page with proof-backed copy.
- Launch one lead capture path + one direct high-intent CTA.
- KPI target: message consistency score + baseline conversion lift.

60-Day Sprint (Execution)
- Launch 3-email nurture sequence using approved voice and proof points.
- Publish one week of social posts tied to top pillars: ${topPillars.join(", ") || "Core Value, Proof, Differentiation"}.
- Align sales intro language with the same positioning narrative.
- KPI target: email engagement + qualified conversations.

90-Day Sprint (Optimization)
- Audit channel performance and refine underperforming copy blocks.
- Expand best-performing pillar into a repeatable monthly campaign theme.
- Document playbook guardrails so internal and external teams stay aligned.
- KPI target: conversion efficiency + retention/upsell signal quality.

Priority emphasis: ${primaryPillar || "messaging"}.
Owner recommendation: Assign one owner for messaging quality and one owner for channel execution.`;
}

function normalizeWorkbookMessagingPillars(wb: Workbook): Workbook {
  const existing = Array.isArray(wb?.messaging_pillars) ? wb.messaging_pillars : [];
  const scoringPillars = new Set(["positioning", "messaging", "visibility", "credibility", "conversion"]);
  const onlyGenericScoringPillars =
    existing.length > 0 &&
    existing.every((p: any) => scoringPillars.has(String(p?.title || "").trim().toLowerCase()));

  // Keep all real pillars returned by results; only replace when empty or generic scaffold data.
  if (existing.length === 0 || onlyGenericScoringPillars) {
    return { ...wb, messaging_pillars: getSampleMessagingPillars(wb) };
  }
  return wb;
}

function WorkbookContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId") || "preview";
  const isSampleMode =
    reportId === "preview" || reportId.startsWith("sample-") || reportId.startsWith("preview-");
  const email = searchParams.get("email") || (isSampleMode ? "preview@wunderbar.ai" : "");

  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("positioning");
  const [refining, setRefining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editability, setEditability] = useState<{
    canEdit: boolean;
    reason: string;
    isFinalized: boolean;
    reviewDaysRemaining: number | null;
    reviewWindowExpired: boolean;
    tier: string;
  } | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const [isShortViewport, setIsShortViewport] = useState(false);
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const [hoveredMobileNavId, setHoveredMobileNavId] = useState<string | null>(null);
  const [focusedNavId, setFocusedNavId] = useState<string | null>(null);
  const [focusedMobileNavId, setFocusedMobileNavId] = useState<string | null>(null);
  const [hoveredActionRailBtn, setHoveredActionRailBtn] = useState(false);
  const [focusedActionRailBtn, setFocusedActionRailBtn] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [sectionIn, setSectionIn] = useState(true);
  const [showStrategyNotes, setShowStrategyNotes] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [generatingChannelDrafts, setGeneratingChannelDrafts] = useState(false);
  const [refinePreview, setRefinePreview] = useState<{
    field: string;
    original: string;
    refined: string;
    apply: (refined: string) => Promise<void>;
  } | null>(null);
  const [applyingRefinePreview, setApplyingRefinePreview] = useState(false);
  const readOnly = editability ? !editability.canEdit : false;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1100px)");
    const apply = () => setIsNarrowViewport(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-height: 780px)");
    const apply = () => setIsShortViewport(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setSectionIn(true);
      return;
    }
    setSectionIn(false);
    const frame = window.requestAnimationFrame(() => setSectionIn(true));
    return () => window.cancelAnimationFrame(frame);
  }, [activeSection, prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPrefersReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const persistSampleWorkbook = useCallback((nextWorkbook: Workbook) => {
    if (typeof window === "undefined" || !reportId || !email) return;
    try {
      const key = getSampleWorkbookStorageKey(reportId, email);
      window.localStorage.setItem(key, JSON.stringify(nextWorkbook));
    } catch {
      // Ignore storage failures in sample mode.
    }
  }, [reportId, email]);

  // ─── Fetch workbook ───
  useEffect(() => {
    if (!reportId || !email) {
      setError("Missing reportId or email in URL.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/workbook?reportId=${encodeURIComponent(reportId)}&email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!res.ok) {
          if (isSampleMode) {
            let sampleWorkbook = createSampleWorkbook(reportId, email);
            try {
              const cached = window.localStorage.getItem(getSampleWorkbookStorageKey(reportId, email));
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && typeof parsed === "object") sampleWorkbook = parsed;
              }
            } catch {
              // Ignore bad cache payloads.
            }
            setWorkbook(normalizeWorkbookMessagingPillars(sampleWorkbook));
            setEditability({
              canEdit: true,
              reason: "Sample workbook mode",
              isFinalized: false,
              reviewDaysRemaining: null,
              reviewWindowExpired: false,
              tier: "blueprint_plus",
            });
            return;
          }
          setError(data.error || "Failed to load workbook.");
          return;
        }
        if (!data?.workbook || typeof data.workbook !== "object") {
          if (isSampleMode) {
            const sampleWorkbook = createSampleWorkbook(reportId, email);
            setWorkbook(normalizeWorkbookMessagingPillars(sampleWorkbook));
            setEditability({
              canEdit: true,
              reason: "Sample workbook mode",
              isFinalized: false,
              reviewDaysRemaining: null,
              reviewWindowExpired: false,
              tier: "blueprint_plus",
            });
          } else {
            setError("Workbook data is unavailable.");
          }
          return;
        }
        if (isSampleMode) {
          let mergedWorkbook = data.workbook;
          try {
            const cached = window.localStorage.getItem(getSampleWorkbookStorageKey(reportId, email));
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed && typeof parsed === "object") mergedWorkbook = parsed;
            }
          } catch {
            // Ignore bad cache payloads.
          }
          setWorkbook(normalizeWorkbookMessagingPillars(mergedWorkbook));
        } else {
          const normalized = normalizeWorkbookMessagingPillars(data.workbook);
          setWorkbook(normalized);

          // One-time migration-on-read: persist normalized messaging pillars
          // so legacy workbooks stop showing generic scoring-pillar content.
          const originalPillars = Array.isArray(data.workbook?.messaging_pillars)
            ? data.workbook.messaging_pillars
            : [];
          const normalizedPillars = Array.isArray(normalized?.messaging_pillars)
            ? normalized.messaging_pillars
            : [];
          if (JSON.stringify(originalPillars) !== JSON.stringify(normalizedPillars)) {
            fetch("/api/workbook", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reportId,
                email,
                updates: { messaging_pillars: normalizedPillars },
              }),
            }).catch(() => {
              // Non-blocking migration persistence.
            });
          }
        }
        if (data.editability) setEditability(data.editability);
      } catch {
        if (isSampleMode) {
          let sampleWorkbook = createSampleWorkbook(reportId, email);
          try {
            const cached = window.localStorage.getItem(getSampleWorkbookStorageKey(reportId, email));
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed && typeof parsed === "object") sampleWorkbook = parsed;
            }
          } catch {
            // Ignore bad cache payloads.
          }
          setWorkbook(normalizeWorkbookMessagingPillars(sampleWorkbook));
          setEditability({
            canEdit: true,
            reason: "Sample workbook mode",
            isFinalized: false,
            reviewDaysRemaining: null,
            reviewWindowExpired: false,
            tier: "blueprint_plus",
          });
        } else {
          setError("Failed to connect.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [reportId, email, isSampleMode]);

  // ─── Finalize workbook ───
  const handleFinalize = useCallback(async () => {
    if (!reportId || !email || finalizing) return;
    if (!window.confirm("Are you sure you want to finalize? Your workbook will become read-only and your final PDFs will be generated.")) return;
    setFinalizing(true);
    try {
      const res = await fetch("/api/blueprint/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, email }),
      });
      if (res.ok) {
        setEditability((prev) => prev ? { ...prev, canEdit: false, isFinalized: true, reviewDaysRemaining: 0, reason: "Your Blueprint has been finalized." } : prev);
        setSaveStatus("Finalized");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch { /* silent */ } finally {
      setFinalizing(false);
    }
  }, [reportId, email, finalizing]);

  // ─── Save a field ───
  const saveField = useCallback(
    async (field: string, value: unknown) => {
      if (!workbook) return;

      if (isSampleMode) {
        setWorkbook((prev) => {
          if (!prev) return prev;
          const nextWorkbook = { ...prev, [field]: value };
          persistSampleWorkbook(nextWorkbook);
          return nextWorkbook;
        });
        setSaveStatus("Saved locally");
        setTimeout(() => setSaveStatus(null), 1500);
        return;
      }

      setSaving(true);
      setSaveStatus(null);
      try {
        const res = await fetch("/api/workbook", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, email, updates: { [field]: value } }),
        });
        if (res.ok) {
          setWorkbook((prev) => (prev ? { ...prev, [field]: value } : prev));
          setSaveStatus("Saved");
          setTimeout(() => setSaveStatus(null), 2000);
        } else {
          setSaveStatus("Save failed");
        }
      } catch {
        setSaveStatus("Save failed");
      } finally {
        setSaving(false);
      }
    },
    [workbook, reportId, email, isSampleMode, persistSampleWorkbook]
  );

  const saveCustomSectionField = useCallback(
    async (field: string, value: string) => {
      const current = workbook?.custom_sections || {};
      const strategic = current.strategic || {};
      const updates = {
        ...current,
        strategic: {
          ...strategic,
          [field]: value,
        },
      };
      await saveField("custom_sections", updates);
    },
    [workbook, saveField]
  );

  const saveArchetypeOutputField = useCallback(
    async (field: string, value: string) => {
      const current = workbook?.custom_sections || {};
      const archetypeOutputs = current.archetype_outputs || {};
      const updates = {
        ...current,
        archetype_outputs: {
          ...archetypeOutputs,
          [field]: value,
        },
      };
      await saveField("custom_sections", updates);
    },
    [workbook, saveField]
  );

  const handleGenerateChannelDrafts = useCallback(async () => {
    if (!workbook || readOnly || generatingChannelDrafts) return;
    const current = workbook.custom_sections || {};
    const reportSections = current.report_sections || {};
    const nextReportSections = {
      ...reportSections,
      email_framework: buildEmailCampaignDraft(workbook),
      social_strategy: buildSocialCampaignDraft(workbook),
      content_type_channel_plan:
        String(reportSections.content_type_channel_plan || "").trim() || buildContentTypeChannelPlan(workbook),
      implementation_action_plan:
        String(reportSections.implementation_action_plan || "").trim() || buildImplementationActionPlan(workbook),
    };

    try {
      setGeneratingChannelDrafts(true);
      await saveField("custom_sections", {
        ...current,
        report_sections: nextReportSections,
      });
      setSaveStatus("Channel drafts + action plan generated");
      setTimeout(() => setSaveStatus(null), 2500);
    } finally {
      setGeneratingChannelDrafts(false);
    }
  }, [workbook, readOnly, generatingChannelDrafts, saveField]);

  const recomputeSectionsFromWorkbook = useCallback((wb: Workbook) => {
    const strategic = wb.custom_sections?.strategic || {};
    const reportSections = wb.custom_sections?.report_sections || {};
    const swotSummaryParts = [
      strategic.swot_strengths ? `Strengths: ${String(strategic.swot_strengths).split("\n")[0]}` : "",
      strategic.swot_weaknesses ? `Weaknesses: ${String(strategic.swot_weaknesses).split("\n")[0]}` : "",
      strategic.swot_opportunities ? `Opportunities: ${String(strategic.swot_opportunities).split("\n")[0]}` : "",
      strategic.swot_threats ? `Threats: ${String(strategic.swot_threats).split("\n")[0]}` : "",
    ].filter(Boolean).join(" | ");

    return {
      ...reportSections,
      executive_summary:
        reportSections.executive_summary ||
        `${wb.business_name || "This brand"} currently scores ${wb.brand_alignment_score || 0}/100. Priority focus: ${wb.primary_pillar || "positioning"}.`,
      score_analysis:
        reportSections.score_analysis ||
        `Current alignment score is ${wb.brand_alignment_score || 0}. Improve consistency across messaging, proof, and conversion pathways to increase score.`,
      pillar_results:
        reportSections.pillar_results ||
        `Core pillars updated from workbook inputs: positioning, messaging, audience clarity, voice, and differentiators.`,
      strategic_signals:
        reportSections.strategic_signals ||
        (swotSummaryParts || "Strategic signals updated based on workbook edits."),
      competitive_positioning:
        reportSections.competitive_positioning ||
        (wb.competitive_differentiation || "Competitive positioning narrative updated from workbook."),
      journey_map:
        reportSections.journey_map ||
        `Journey messaging should map to awareness, consideration, decision, onboarding, retention, and advocacy with consistent CTA logic.`,
      seo_aeo:
        reportSections.seo_aeo ||
        `SEO/AEO strategy should prioritize high-intent queries aligned to the strongest messaging pillars.`,
      conversion_strategy:
        reportSections.conversion_strategy ||
        `Conversion strategy should lead with clear value, proof, and one primary CTA per page.`,
      email_framework:
        reportSections.email_framework ||
        buildEmailCampaignDraft(wb),
      social_strategy:
        reportSections.social_strategy ||
        buildSocialCampaignDraft(wb),
      content_type_channel_plan:
        reportSections.content_type_channel_plan ||
        buildContentTypeChannelPlan(wb),
      implementation_action_plan:
        reportSections.implementation_action_plan ||
        buildImplementationActionPlan(wb),
    };
  }, []);

  const handleRecompute = useCallback(async () => {
    if (!workbook || recomputing) return;
    setRecomputing(true);
    setSaveStatus(null);

    try {
      if (isSampleMode) {
        const recomputed = recomputeSectionsFromWorkbook(workbook);
        const current = workbook.custom_sections || {};
        setWorkbook((prev) => {
          if (!prev) return prev;
          const nextWorkbook = {
            ...prev,
            custom_sections: {
              ...current,
              report_sections: recomputed,
              recomputed_at: new Date().toISOString(),
            },
          };
          persistSampleWorkbook(nextWorkbook);
          return nextWorkbook;
        });
        setSaveStatus("Results recomputed");
        setTimeout(() => setSaveStatus(null), 4000);
        return;
      }

      const res = await fetch("/api/workbook/recompute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveStatus(data.error || "Recompute failed");
        return;
      }
      if (data.workbook) setWorkbook(data.workbook);
      setSaveStatus("Results recomputed");
      setTimeout(() => setSaveStatus(null), 4000);
    } catch {
      setSaveStatus("Recompute failed");
    } finally {
      setRecomputing(false);
    }
  }, [workbook, recomputing, isSampleMode, recomputeSectionsFromWorkbook, reportId, email, persistSampleWorkbook]);

  // ─── AI Refine ───
  const requestRefine = useCallback(
    async (section: string, content: string, context?: string): Promise<string | null> => {
      if (!workbook) return null;
      const trimmed = content.trim();
      if (!trimmed || trimmed.length < 5) return null;
      const archetypeName = String(workbook.brand_archetype || "").trim();
      const voiceTraits = Array.isArray(workbook.brand_voice_attributes)
        ? workbook.brand_voice_attributes.map((v: any) => String(v).trim()).filter(Boolean)
        : [];
      const globalLens = [
        archetypeName ? `Archetype: ${archetypeName}` : "",
        voiceTraits.length > 0 ? `Voice traits: ${voiceTraits.join(", ")}` : "",
        "Constraint: Keep copy aligned to this archetype and voice across all channels.",
      ]
        .filter(Boolean)
        .join(" | ");
      const mergedContext = [context, globalLens].filter(Boolean).join("\n");

      try {
        const res = await fetch("/api/workbook/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section,
            content: trimmed,
            context: mergedContext,
            businessName: workbook.business_name,
            archetypeName: workbook.brand_archetype || "",
            voiceTraits: Array.isArray(workbook.brand_voice_attributes) ? workbook.brand_voice_attributes : [],
            reportId,
            email,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSaveStatus(data?.error || "Refine failed");
          setTimeout(() => setSaveStatus(null), 3000);
          return null;
        }
        if (!data?.refined || typeof data.refined !== "string") {
          setSaveStatus("Refine failed");
          setTimeout(() => setSaveStatus(null), 3000);
          return null;
        }
        return data.refined.trim();
      } catch {
        setSaveStatus("Refine failed");
        setTimeout(() => setSaveStatus(null), 3000);
        return null;
      }
    },
    [workbook, reportId, email]
  );

  const refineField = useCallback(
    async (field: string, currentContent?: string) => {
      if (!workbook) return;
      const current = typeof currentContent === "string" ? currentContent : workbook[field];
      if (typeof current !== "string") return;
      setRefining(field);
      try {
        const refined = await requestRefine(field, current);
        if (!refined) return;
        if (refined.trim() === current.trim()) {
          setSaveStatus("No changes suggested");
          setTimeout(() => setSaveStatus(null), 2200);
          return;
        }
        setRefinePreview({
          field,
          original: current,
          refined,
          apply: async (next) => {
            await saveField(field, next);
          },
        });
      } finally {
        setRefining(null);
      }
    },
    [workbook, requestRefine, saveField]
  );

  const refineWithApply = useCallback(
    async (
      field: string,
      section: string,
      content: string,
      apply: (refined: string) => Promise<void>,
      context?: string
    ) => {
      setRefining(field);
      try {
        const refined = await requestRefine(section, content, context);
        if (!refined) return;
        if (refined.trim() === content.trim()) {
          setSaveStatus("No changes suggested");
          setTimeout(() => setSaveStatus(null), 2200);
          return;
        }
        setRefinePreview({
          field,
          original: content,
          refined,
          apply,
        });
      } finally {
        setRefining(null);
      }
    },
    [requestRefine]
  );

  const visibleSections = SECTIONS;
  useEffect(() => {
    if (!visibleSections.some((s) => s.id === activeSection)) {
      setActiveSection(visibleSections[0]?.id || "positioning");
    }
  }, [activeSection]);

  // ─── Loading / Error states ───
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading your Brand Workbook...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <p style={{ ...styles.loadingText, color: "#DC2626" }}>{error}</p>
        <a href="/dashboard" style={styles.backLink}>← Back to Dashboard</a>
      </div>
    );
  }

  if (!workbook) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Preparing your Brand Workbook...</p>
      </div>
    );
  }

  const isBlueprint = editability?.tier === "blueprint";
  const isBlueprintPlus = editability?.tier === "blueprint_plus";
  const strategyActivationHref =
    `https://calendly.com/wunderbardigital/brand-strategy-activation` +
    `?utm_source=wunderbrand_app&utm_medium=workbook_action_rail&utm_campaign=strategy_activation` +
    `&utm_content=blueprint_plus_workbook` +
    `&reportId=${encodeURIComponent(reportId)}` +
    `&email=${encodeURIComponent(email || "unknown")}`;
  const updatedReportHref = isSampleMode
    ? isBlueprintPlus
      ? "/preview/blueprint-plus"
      : "/preview/blueprint"
    : `/report/${encodeURIComponent(reportId)}`;
  const fullPdfHref = isSampleMode
    ? `/api/preview/pdf?type=${isBlueprintPlus ? "blueprint-plus" : "blueprint"}`
    : `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=complete&tier=${
        isBlueprintPlus ? "blueprint-plus" : "blueprint"
      }&email=${encodeURIComponent(email)}`;
  const brandStandardsDraftHref = isSampleMode
    ? "/api/preview/pdf?type=brand-standards"
    : `/api/workbook/export?reportId=${reportId}&email=${encodeURIComponent(email)}`;
  const deliverableLinks = isSampleMode
    ? [
        { label: "Executive Summary", href: "/api/preview/pdf?type=blueprint" },
        { label: "One-Page Messaging", href: "/api/preview/pdf?type=blueprint" },
        { label: "Prompt Guide", href: "/api/preview/pdf?type=prompts" },
        { label: "Voice Checklist", href: "/api/preview/pdf?type=voice-checklist" },
        { label: "Brand Standards", href: "/api/preview/pdf?type=brand-standards" },
        ...(isBlueprintPlus
          ? [
              { label: "90-Day Activation Plan", href: "/api/preview/pdf?type=activation" },
              { label: "Digital Marketing Strategy", href: "/api/preview/pdf?type=digital" },
              { label: "Competitive Intelligence Brief", href: "/api/preview/pdf?type=competitive" },
            ]
          : []),
      ]
    : [
        { label: "Executive Summary", href: `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=executive&tier=${isBlueprintPlus ? "blueprint-plus" : "blueprint"}&email=${encodeURIComponent(email)}` },
        { label: "One-Page Messaging", href: `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=messaging&tier=${isBlueprintPlus ? "blueprint-plus" : "blueprint"}&email=${encodeURIComponent(email)}` },
        { label: "Prompt Guide", href: `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=prompts&tier=${isBlueprintPlus ? "blueprint-plus" : "blueprint"}&email=${encodeURIComponent(email)}` },
        { label: "Voice Checklist", href: `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=voice-checklist&tier=${isBlueprintPlus ? "blueprint-plus" : "blueprint"}&email=${encodeURIComponent(email)}` },
        { label: "Brand Standards", href: `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=standards&tier=blueprint-plus&email=${encodeURIComponent(email)}` },
        ...(isBlueprintPlus
          ? [
              { label: "90-Day Activation Plan", href: `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=activation&tier=blueprint-plus&email=${encodeURIComponent(email)}` },
              { label: "Digital Marketing Strategy", href: `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=digital&tier=blueprint-plus&email=${encodeURIComponent(email)}` },
              { label: "Competitive Intelligence Brief", href: `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=competitive&tier=blueprint-plus&email=${encodeURIComponent(email)}` },
            ]
          : []),
      ];
  const activeSectionIndex = visibleSections.findIndex((s) => s.id === activeSection);
  const normalizedActiveSectionIndex = activeSectionIndex >= 0 ? activeSectionIndex : 0;
  const navProgressPct = Math.max(
    0,
    ((normalizedActiveSectionIndex + 1) / Math.max(visibleSections.length, 1)) * 100
  );
  const activeSectionMeta = visibleSections[normalizedActiveSectionIndex] || visibleSections[0] || SECTIONS[0];
  const sectionDeliverableLabelsMap: Record<string, string[]> = {
    positioning: ["Executive Summary"],
    pitches: ["Executive Summary"],
    messaging: ["One-Page Messaging", "Prompt Guide"],
    voice: ["Voice Checklist", "Prompt Guide"],
    "report-sections": [
      "Executive Summary",
      "One-Page Messaging",
      "Brand Standards",
      "90-Day Activation Plan",
      "Digital Marketing Strategy",
      "Competitive Intelligence Brief",
    ],
  };
  const sectionDeliverables = deliverableLinks
    .filter((item) => (item.label === "Brand Standards" ? isBlueprintPlus : true))
    .filter((item) => (sectionDeliverableLabelsMap[activeSection] || []).includes(item.label));
  const deliverableByLabel = new Map(deliverableLinks.map((item) => [item.label, item]));
  const deliverableUseByLabel: Record<string, string> = {
    "Complete Report": "Master reference for cross-team alignment",
    "Executive Summary": "Board and leadership updates",
    "90-Day Activation Plan": "Weekly execution and ownership plan",
    "One-Page Messaging": "Campaign briefs and sales enablement",
    "Prompt Guide": "AI-assisted drafting and iteration",
    "Digital Marketing Strategy": "Channel planning and optimization",
    "Competitive Intelligence Brief": "Objection handling and win strategy",
    "Brand Standards": "Design and brand governance",
    "Brand Standards Draft": "In-progress design handoff review",
    "Voice Checklist": "Daily writing and review guardrails",
  };
  const attachUse = (docs: Array<{ label: string; href: string }>) =>
    docs.map((doc) => ({
      ...doc,
      use: deliverableUseByLabel[doc.label] || "Team-ready handoff asset",
    }));
  const stakeholderDeliverableGroups = [
    {
      role: "Leadership",
      docs: attachUse([
        { label: "Complete Report", href: fullPdfHref },
        deliverableByLabel.get("Executive Summary"),
        deliverableByLabel.get("90-Day Activation Plan"),
      ].filter(Boolean) as Array<{ label: string; href: string }>),
    },
    {
      role: "Marketing",
      docs: attachUse([
        deliverableByLabel.get("One-Page Messaging"),
        deliverableByLabel.get("Prompt Guide"),
        deliverableByLabel.get("Digital Marketing Strategy"),
      ].filter(Boolean) as Array<{ label: string; href: string }>),
    },
    {
      role: "Sales",
      docs: attachUse([
        deliverableByLabel.get("Competitive Intelligence Brief"),
        deliverableByLabel.get("One-Page Messaging"),
      ].filter(Boolean) as Array<{ label: string; href: string }>),
    },
    {
      role: "Design & Implementation",
      docs: attachUse([
        deliverableByLabel.get("Brand Standards"),
        { label: "Brand Standards Draft", href: brandStandardsDraftHref },
        deliverableByLabel.get("Voice Checklist"),
      ].filter(Boolean) as Array<{ label: string; href: string }>),
    },
  ].filter((group) => group.docs.length > 0);

  const activeSectionShellStyle: React.CSSProperties = {
    ...styles.sectionShell,
    borderTop: `3px solid ${activeSectionMeta.accent}`,
    opacity: sectionIn ? 1 : 0,
    transform: prefersReducedMotion ? "none" : sectionIn ? "translateY(0px)" : "translateY(6px)",
    transition: prefersReducedMotion ? "none" : "opacity 0.22s ease, transform 0.22s ease",
  };
  const readinessItems = [
    {
      label: "Positioning statement finalized",
      done: String(workbook.positioning_statement || "").trim().length >= 30,
    },
    {
      label: "Unique value proposition finalized",
      done: String(workbook.unique_value_proposition || "").trim().length >= 25,
    },
    {
      label: "At least 3 messaging pillars completed",
      done:
        Array.isArray(workbook.messaging_pillars) &&
        workbook.messaging_pillars.filter((p: any) => String(p?.description || "").trim().length >= 20).length >= 3,
    },
    {
      label: "Tone guidelines ready",
      done: String(workbook.tone_guidelines || "").trim().length >= 40,
    },
    {
      label: "Email campaign copy drafted",
      done: String(workbook.custom_sections?.report_sections?.email_framework || "").trim().length >= 60,
    },
    {
      label: "Social campaign copy drafted",
      done: String(workbook.custom_sections?.report_sections?.social_strategy || "").trim().length >= 60,
    },
  ];
  const readinessDone = readinessItems.filter((i) => i.done).length;
  const readinessPct = Math.round((readinessDone / readinessItems.length) * 100);

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      {!isNarrowViewport && (
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <p style={styles.sidebarEyebrow}>
            {isBlueprintPlus ? "WunderBrand Blueprint+™" : "WunderBrand Blueprint™"}
          </p>
          <h2 style={styles.sidebarTitle}>{String(workbook.business_name || "Your Brand")}</h2>
          <p style={styles.sidebarBusiness}>Implementation Workbook</p>
          <div style={styles.progressMetaRow}>
            <span style={styles.progressMetaLabel}>Progress</span>
            <span style={styles.progressMetaValue}>
              {normalizedActiveSectionIndex + 1}/{visibleSections.length}
            </span>
          </div>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${navProgressPct}%`,
                background: `linear-gradient(90deg, ${activeSectionMeta.accent} 0%, #021859 100%)`,
              }}
            />
          </div>
          {isBlueprintPlus && (
            <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#10B981", background: "rgba(16,185,129,0.12)", padding: "3px 8px", borderRadius: 4 }}>
              Brand Workspace
            </span>
          )}
        </div>
        <nav style={styles.sidebarNav}>
          {visibleSections.map((s, idx) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              aria-current={activeSection === s.id ? "page" : undefined}
              aria-selected={activeSection === s.id}
              aria-label={`Step ${idx + 1}: ${s.label}`}
              aria-controls="workbook-active-section"
              onMouseEnter={() => setHoveredNavId(s.id)}
              onMouseLeave={() => setHoveredNavId(null)}
              onFocus={() => setFocusedNavId(s.id)}
              onBlur={() => setFocusedNavId(null)}
              style={{
                ...styles.navBtn,
                ...(activeSection === s.id
                  ? {
                      ...styles.navBtnActive,
                      borderColor: `${s.accent}55`,
                      boxShadow: `inset 3px 0 0 ${s.accent}, 0 8px 20px ${s.accent}22`,
                    }
                  : {}),
                ...(hoveredNavId === s.id && activeSection !== s.id ? styles.navBtnHover : {}),
                ...(focusedNavId === s.id ? styles.navBtnFocus : {}),
              }}
            >
              <span style={{ ...styles.navGlyph, background: `${s.accent}18`, color: s.accent }}>
                <SectionGlyph sectionId={s.id} color={s.accent} />
              </span>
              <span style={{ ...styles.navBtnEyebrow, color: s.accent }}>Step {idx + 1}</span>
              <span style={styles.navBtnLabel}>{s.label}</span>
              <span style={styles.navBtnHint}>{s.hint}</span>
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.sidebarFooterHint}>Actions and downloads are in the top bar.</div>
          <a href="/dashboard" style={styles.backLink}>← Back to Dashboard</a>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <main
        style={{
          ...styles.main,
          ...(isNarrowViewport ? styles.mainNarrow : {}),
          ...(isNarrowViewport && isShortViewport ? styles.mainNarrowShort : {}),
        }}
      >
        {isNarrowViewport && (
          <div style={styles.mobileNavShell}>
            <div style={styles.mobileNavTopRow}>
              <div style={styles.mobileNavTitle}>Workbook Sections</div>
              <div style={styles.mobileProgressValue}>
                {normalizedActiveSectionIndex + 1}/{visibleSections.length}
              </div>
            </div>
            <div style={styles.mobileProgressText}>
              Step {normalizedActiveSectionIndex + 1} of {visibleSections.length}
            </div>
            <div style={styles.mobileProgressTrack}>
              <div
                style={{
                  ...styles.mobileProgressFill,
                  width: `${navProgressPct}%`,
                  background: `linear-gradient(90deg, ${activeSectionMeta.accent} 0%, #021859 100%)`,
                }}
              />
            </div>
            <div style={styles.mobileNavScroller}>
              {visibleSections.map((s, idx) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  aria-current={activeSection === s.id ? "page" : undefined}
                  aria-selected={activeSection === s.id}
                  aria-label={`Step ${idx + 1}: ${s.label}`}
                  aria-controls="workbook-active-section"
                  onMouseEnter={() => setHoveredMobileNavId(s.id)}
                  onMouseLeave={() => setHoveredMobileNavId(null)}
                  onFocus={() => setFocusedMobileNavId(s.id)}
                  onBlur={() => setFocusedMobileNavId(null)}
                  style={{
                    ...styles.mobileNavChip,
                    ...(isShortViewport ? styles.mobileNavChipCompact : {}),
                    ...(activeSection === s.id
                      ? {
                          ...styles.mobileNavChipActive,
                          borderColor: `${s.accent}66`,
                          background: `${s.accent}15`,
                          color: s.accent,
                        }
                      : {}),
                    ...(hoveredMobileNavId === s.id && activeSection !== s.id ? styles.mobileNavChipHover : {}),
                    ...(focusedMobileNavId === s.id ? styles.mobileNavChipFocus : {}),
                  }}
                >
                  <span style={{ ...styles.mobileNavChipGlyph, background: `${s.accent}18`, color: s.accent }}>
                    <SectionGlyph sectionId={s.id} color={s.accent} />
                  </span>
                  {idx + 1}. {isNarrowViewport ? s.shortLabel : s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {!readOnly && (
          <div
            style={{
              ...styles.actionRail,
              ...(isShortViewport && isNarrowViewport ? styles.actionRailCompact : {}),
              ...(isNarrowViewport ? styles.actionRailNarrow : {}),
              borderColor: `${activeSectionMeta.accent}3A`,
              boxShadow: `0 10px 24px ${activeSectionMeta.accent}1E`,
              background: `linear-gradient(90deg, #FFFFFF 0%, ${activeSectionMeta.accent}10 100%)`,
            }}
          >
            <div>
              <div style={{ ...styles.actionRailTitle, color: activeSectionMeta.accent }}>Editing Mode</div>
              <div style={styles.actionRailHint}>
                Save changes in each field, then run recompute to refresh playbook narratives.
              </div>
              <div style={styles.actionRailSubhint}>
                Focus here: channel-ready copy and deliverables. Optional strategy notes are secondary. Diagnosis fields stay locked.
              </div>
            </div>
            <div style={{ ...styles.actionRailActions, ...(isNarrowViewport ? styles.actionRailActionsNarrow : {}) }}>
              <a
                href={updatedReportHref}
                onMouseEnter={() => setHoveredActionRailBtn(true)}
                onMouseLeave={() => setHoveredActionRailBtn(false)}
                onFocus={() => setFocusedActionRailBtn(true)}
                onBlur={() => setFocusedActionRailBtn(false)}
                style={{
                  ...styles.actionRailBtn,
                  ...(isNarrowViewport ? styles.actionRailBtnNarrow : {}),
                  ...(hoveredActionRailBtn ? styles.actionRailBtnHover : {}),
                  ...(focusedActionRailBtn ? styles.actionRailBtnFocus : {}),
                  textDecoration: "none",
                }}
              >
                View Updated Playbook
              </a>
              <a
                href={fullPdfHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.actionRailTertiaryBtn, ...(isNarrowViewport ? styles.actionRailBtnNarrow : {}) }}
              >
                Download Full PDF
              </a>
              <button
                type="button"
                onClick={() => setShowAdvancedTools((v) => !v)}
                style={{
                  ...styles.actionRailTertiaryBtn,
                  ...(isNarrowViewport ? styles.actionRailBtnNarrow : {}),
                  cursor: "pointer",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                }}
              >
                {showAdvancedTools ? "Hide More Tools" : "More Tools"}
              </button>
            </div>
          </div>
        )}
        {showAdvancedTools && (
          <div style={styles.sectionToolsShell}>
            <div style={styles.sectionToolsTitle}>Advanced Tools</div>
            <div style={styles.sectionToolsList}>
              <button
                type="button"
                onClick={handleRecompute}
                disabled={recomputing}
                aria-busy={recomputing}
                style={{
                  ...styles.sectionToolChip,
                  border: "none",
                  cursor: recomputing ? "default" : "pointer",
                  opacity: recomputing ? 0.7 : 1,
                }}
              >
                {recomputing ? "Recomputing..." : "Recompute Results"}
              </button>
              <a href={`/?resume=${encodeURIComponent(reportId)}`} style={styles.sectionToolChip}>
                Re-run With Edited Answers
              </a>
              <a
                href={`/api/workbook/export?reportId=${reportId}&email=${encodeURIComponent(email)}`}
                style={styles.sectionToolChip}
              >
                {readOnly ? "Download Brand Standards PDF" : "Download Brand Standards Draft PDF"}
              </a>
              {isBlueprint && !readOnly && !editability?.isFinalized && (
                <button
                  type="button"
                  onClick={handleFinalize}
                  disabled={finalizing}
                  aria-busy={finalizing}
                  style={{
                    ...styles.sectionToolChip,
                    border: "none",
                    cursor: finalizing ? "default" : "pointer",
                    opacity: finalizing ? 0.7 : 1,
                  }}
                >
                  {finalizing ? "Finalizing..." : "Finalize My Blueprint"}
                </button>
              )}
              {isBlueprintPlus && (
                <a href={strategyActivationHref} target="_blank" rel="noopener noreferrer" style={styles.sectionToolChip}>
                  Book Strategy Activation Session
                </a>
              )}
            </div>
          </div>
        )}
        {sectionDeliverables.length > 0 && (
          <div style={styles.sectionToolsShell}>
            <div style={styles.sectionToolsTitle}>Section Resources</div>
            <div style={styles.sectionToolsList}>
              {sectionDeliverables.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.sectionToolChip}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
        {stakeholderDeliverableGroups.length > 0 && (
          <div style={styles.deliverablesSuiteShell}>
            <div style={styles.deliverablesSuiteHeader}>
              <div style={styles.deliverablesSuiteTitle}>Deliverables Suite</div>
              <div style={styles.deliverablesSuiteHint}>Download by team so each stakeholder gets only what they need.</div>
            </div>
            <div style={styles.deliverablesSuiteGrid}>
              {stakeholderDeliverableGroups.map((group) => (
                <div key={group.role} style={styles.deliverablesGroupCard}>
                  <div style={styles.deliverablesGroupTitle}>{group.role}</div>
                  <div style={styles.deliverablesGroupList}>
                    {group.docs.map((doc) => (
                      <a
                        key={`${group.role}-${doc.label}`}
                        href={doc.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.deliverablesGroupChip}
                      >
                        <span style={styles.deliverablesGroupChipTitle}>{doc.label}</span>
                        <span style={styles.deliverablesGroupChipUse}>{doc.use}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={styles.lensShell}>
          <div style={styles.lensHeaderRow}>
            <span style={styles.lensTitle}>Writing Lens</span>
            <span style={styles.lensPill}>Applies to all editable copy</span>
          </div>
          <div style={styles.lensBody}>
            <strong>Archetype:</strong> {workbook.brand_archetype || "Not determined"}{" "}
            <span style={styles.lensDot}>•</span>{" "}
            <strong>Voice:</strong>{" "}
            {Array.isArray(workbook.brand_voice_attributes) && workbook.brand_voice_attributes.length > 0
              ? workbook.brand_voice_attributes.join(", ")
              : "Clear, confident, and supportive"}
          </div>
          <div style={styles.lensSub}>
            Use this lens for every section so playbook copy sounds consistently on-brand across channels.
          </div>
        </div>
        <div style={styles.mainProgressShell}>
          <div style={styles.mainProgressRow}>
            <span style={styles.mainProgressLabel}>Workbook Progress</span>
            <span style={styles.mainProgressValue}>
              Step {normalizedActiveSectionIndex + 1} of {visibleSections.length}
            </span>
          </div>
          <div style={styles.mainProgressTrack}>
            <div
              style={{
                ...styles.mainProgressFill,
                width: `${navProgressPct}%`,
                background: `linear-gradient(90deg, ${activeSectionMeta.accent} 0%, #021859 100%)`,
              }}
            />
          </div>
        </div>
        <div style={styles.lockedMetaShell}>
          <div style={styles.lockedMetaHeader}>
            <span style={styles.lockedMetaTitle}>Assessment-derived (locked)</span>
            <span style={styles.lockedMetaPill}>Updates only when questionnaire responses are re-run</span>
          </div>
          <div style={styles.lockedMetaGrid}>
            <div style={styles.lockedMetaCard}>
              <div style={styles.lockedMetaLabel}>Brand Alignment Score</div>
              <div style={styles.lockedMetaValue}>{Number(workbook.brand_alignment_score || 0)}/100</div>
            </div>
            <div style={styles.lockedMetaCard}>
              <div style={styles.lockedMetaLabel}>Primary Pillar</div>
              <div style={styles.lockedMetaValue}>
                {String(workbook.primary_pillar || "Not determined").replace(/_/g, " ")}
              </div>
            </div>
            <div style={styles.lockedMetaCard}>
              <div style={styles.lockedMetaLabel}>Brand Archetype</div>
              <div style={styles.lockedMetaValue}>{workbook.brand_archetype || "Not determined"}</div>
            </div>
          </div>
          <div style={styles.lockedMetaFooter}>
            To update these diagnosis-derived results, re-run the questionnaire.
            <a href={`/?resume=${encodeURIComponent(reportId)}`} style={styles.lockedMetaLink}> Re-run now</a>
          </div>
        </div>
        <div style={styles.readinessShell}>
          <div style={styles.readinessHeaderRow}>
            <span style={styles.readinessTitle}>Implementation Readiness</span>
            <span style={styles.readinessValue}>{readinessDone}/{readinessItems.length} complete ({readinessPct}%)</span>
          </div>
          <div style={styles.readinessTrack}>
            <div style={{ ...styles.readinessFill, width: `${readinessPct}%` }} />
          </div>
          <div style={styles.readinessList}>
            {readinessItems.map((item) => (
              <div key={item.label} style={styles.readinessItem}>
                <span style={{ ...styles.readinessDot, ...(item.done ? styles.readinessDotDone : {}) }}>
                  {item.done ? "✓" : "○"}
                </span>
                <span style={{ ...styles.readinessText, ...(item.done ? styles.readinessTextDone : {}) }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Save indicator */}
        {saveStatus && (
          <div style={{
            ...styles.saveIndicator,
            background: saveStatus === "Saved" || saveStatus === "Finalized" ? "#ECFDF5" : "#FEF2F2",
            color: saveStatus === "Saved" || saveStatus === "Finalized" ? "#059669" : "#DC2626",
          }}
            role="status"
            aria-live="polite"
          >
            {saveStatus}
          </div>
        )}
        {/* Review window banner — Blueprint tier, still editable */}
        {isBlueprint && !readOnly && editability?.reviewDaysRemaining != null && (
          <div style={{
            padding: "14px 20px",
            borderRadius: 8,
            background: editability.reviewDaysRemaining <= 3 ? "#FEF3C7" : "#EFF6FF",
            border: `1px solid ${editability.reviewDaysRemaining <= 3 ? "#F59E0B" : "#07B0F2"}30`,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#021859" }}>
                {editability.reviewDaysRemaining} day{editability.reviewDaysRemaining !== 1 ? "s" : ""} left in your review window
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#5A6B7E", lineHeight: 1.5 }}>
                Review and refine your brand playbook. Once finalized, your workbook becomes a read-only reference.
              </p>
            </div>
            <button
              type="button"
              onClick={handleFinalize}
              disabled={finalizing}
              aria-busy={finalizing}
              style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 10, background: "#10B981", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: finalizing ? "default" : "pointer", opacity: finalizing ? 0.7 : 1 }}
            >
              {finalizing ? "..." : "Finalize Now"}
            </button>
          </div>
        )}

        {/* Read-only banner — finalized Blueprint */}
        {readOnly && editability?.isFinalized && (
          <div style={{
            padding: "14px 20px",
            borderRadius: 8,
            background: "#F1F5F9",
            border: "1px solid #E2E8F0",
            marginBottom: 20,
          }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#021859" }}>
              Your Blueprint is finalized
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#5A6B7E", lineHeight: 1.5 }}>
              This is your read-only brand reference. Use the button above to download your final PDF.{" "}
              <a href="/dashboard" style={{ color: "#07B0F2", fontWeight: 600, textDecoration: "none" }}>
                Use your 90-day refresh
              </a>{" "}
              to update your strategy, or{" "}
              <a href="/checkout?product=blueprint-plus" style={{ color: "#07B0F2", fontWeight: 600, textDecoration: "none" }}>
                upgrade to Blueprint+
              </a>{" "}
              for a Brand Workspace that adapts as your brand grows.
            </p>
          </div>
        )}

        {/* ─── Positioning ─── */}
        {activeSection === "positioning" && (
          <section id="workbook-active-section" style={activeSectionShellStyle}>
            <div style={styles.sectionOverline}>
              <span style={{ ...styles.sectionOverlineIcon, color: activeSectionMeta.accent, background: `${activeSectionMeta.accent}14` }}>
                <SectionGlyph sectionId={activeSectionMeta.id} color={activeSectionMeta.accent} />
              </span>
              {activeSectionMeta.hint}
            </div>
            <h1 style={styles.sectionTitle}>Brand Positioning</h1>
            <p style={styles.sectionDesc}>Define how your brand is positioned in the market. These outputs form the foundation of all your messaging.</p>

            <EditableField
              label="Company Description (Public-Facing)"
              value={
                workbook.custom_sections?.report_sections?.company_description ||
                workbook.elevator_pitch_60s ||
                ""
              }
              field="report_sections_company_description"
              onSave={async (_field, value) => {
                const current = workbook.custom_sections || {};
                const reportSections = current.report_sections || {};
                await saveField("custom_sections", {
                  ...current,
                  report_sections: {
                    ...reportSections,
                    company_description: value,
                  },
                });
              }}
              onRefine={async (field) => {
                await refineWithApply(
                  field,
                  "company_description",
                  workbook.custom_sections?.report_sections?.company_description || workbook.elevator_pitch_60s || "",
                  async (refined) => {
                    const current = workbook.custom_sections || {};
                    const reportSections = current.report_sections || {};
                    await saveField("custom_sections", {
                      ...current,
                      report_sections: {
                        ...reportSections,
                        company_description: refined,
                      },
                    });
                  },
                  "Refine this company description so it is clear, audience-aware, and channel-ready."
                );
              }}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={4}
              placeholder="Write a clear company description your team can reuse across website, decks, proposals, and outreach."
            />
            <EditableField
              label="Positioning Statement"
              value={workbook.positioning_statement || ""}
              field="positioning_statement"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={4}
              placeholder="One clear sentence: who you serve, what problem you solve, and why your approach is distinct."
            />
            <EditableField
              label="Unique Value Proposition"
              value={workbook.unique_value_proposition || ""}
              field="unique_value_proposition"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={3}
              placeholder="State the specific outcome you create and the reason clients should choose you over alternatives."
            />
            <EditableField
              label="Competitive Differentiation"
              value={workbook.competitive_differentiation || ""}
              field="competitive_differentiation"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={4}
              placeholder="Describe your edge in practical terms: methodology, proof, speed, specialization, or execution model."
            />
          </section>
        )}

        {/* ─── Elevator Pitches ─── */}
        {activeSection === "pitches" && (
          <section id="workbook-active-section" style={activeSectionShellStyle}>
            <div style={styles.sectionOverline}>
              <span style={{ ...styles.sectionOverlineIcon, color: activeSectionMeta.accent, background: `${activeSectionMeta.accent}14` }}>
                <SectionGlyph sectionId={activeSectionMeta.id} color={activeSectionMeta.accent} />
              </span>
              {activeSectionMeta.hint}
            </div>
            <h1 style={styles.sectionTitle}>Brand Narrative</h1>
            <p style={styles.sectionDesc}>Reusable narrative copy for intros, conversations, and outreach. Edit for clarity and consistency.</p>

            <EditableField
              label="30-Second Pitch"
              value={workbook.elevator_pitch_30s || ""}
              field="elevator_pitch_30s"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={3}
              placeholder="A concise pitch for quick introductions (aim for ~75 words)..."
            />
            <EditableField
              label="60-Second Pitch"
              value={workbook.elevator_pitch_60s || ""}
              field="elevator_pitch_60s"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={5}
              placeholder="An expanded pitch with a story or proof point (~150 words)..."
            />
            <EditableField
              label="Outreach Email Intro"
              value={workbook.elevator_pitch_email || ""}
              field="elevator_pitch_email"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={4}
              placeholder="A concise intro paragraph for outreach emails (problem, value, and next step)..."
            />
          </section>
        )}

        {/* ─── Messaging Pillars ─── */}
        {activeSection === "messaging" && (
          <section id="workbook-active-section" style={activeSectionShellStyle}>
            <div style={styles.sectionOverline}>
              <span style={{ ...styles.sectionOverlineIcon, color: activeSectionMeta.accent, background: `${activeSectionMeta.accent}14` }}>
                <SectionGlyph sectionId={activeSectionMeta.id} color={activeSectionMeta.accent} />
              </span>
              {activeSectionMeta.hint}
            </div>
            <h1 style={styles.sectionTitle}>Messaging Pillars</h1>
            <p style={styles.sectionDesc}>
              Your core messaging system. Refine both message narrative and proof points so teams can reuse this copy in web, email, sales, and social.
            </p>

            {(workbook.messaging_pillars || []).map((pillar: any, idx: number) => (
              <div key={idx} style={styles.pillarCard}>
                <h3 style={styles.pillarTitle}>{pillar.title}</h3>
                <EditableField
                  label="Description"
                  value={pillar.description || ""}
                  field={`messaging_pillar_${idx}_desc`}
                  onSave={async (_, val) => {
                    const updated = [...(workbook.messaging_pillars || [])];
                    updated[idx] = { ...updated[idx], description: val };
                    await saveField("messaging_pillars", updated);
                  }}
                  onRefine={async () => {
                    await refineWithApply(
                      `messaging_pillar_${idx}_desc`,
                      "messaging_pillar",
                      pillar.description || "",
                      async (refined) => {
                        const updated = [...(workbook.messaging_pillars || [])];
                        updated[idx] = { ...updated[idx], description: refined };
                        await saveField("messaging_pillars", updated);
                      },
                      `Refine messaging pillar ${idx + 1} for brand consistency and channel usability.`
                    );
                  }}
                  saving={saving}
                  refining={refining}
                  readOnly={readOnly}
                  rows={3}
                placeholder="What should this pillar communicate across website, sales, email, and social? Include proof angle and tone."
                />
                <EditableField
                  label="Proof Points (one per line)"
                  value={Array.isArray(pillar.proof_points) ? pillar.proof_points.join("\n") : ""}
                  field={`messaging_pillar_${idx}_proof_points`}
                  onSave={async (_, val) => {
                    const updated = [...(workbook.messaging_pillars || [])];
                    const proofPoints = val
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean);
                    updated[idx] = { ...updated[idx], proof_points: proofPoints };
                    await saveField("messaging_pillars", updated);
                  }}
                  onRefine={async () => {
                    const current = Array.isArray(pillar.proof_points) ? pillar.proof_points.join("\n") : "";
                    await refineWithApply(
                      `messaging_pillar_${idx}_proof_points`,
                      "messaging_pillar_proof_points",
                      current,
                      async (refined) => {
                        const updated = [...(workbook.messaging_pillars || [])];
                        const proofPoints = refined
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean);
                        updated[idx] = { ...updated[idx], proof_points: proofPoints };
                        await saveField("messaging_pillars", updated);
                      },
                      "Refine these proof points so they are specific, credible, and reusable across channels."
                    );
                  }}
                  saving={saving}
                  refining={refining}
                  readOnly={readOnly}
                  rows={4}
                  placeholder="List concrete proof points teams can plug into copy: outcomes, evidence, process strengths, or credibility markers."
                />
              </div>
            ))}
          </section>
        )}

        {/* ─── Brand Voice & Tone ─── */}
        {activeSection === "voice" && (
          <section id="workbook-active-section" style={activeSectionShellStyle}>
            <div style={styles.sectionOverline}>
              <span style={{ ...styles.sectionOverlineIcon, color: activeSectionMeta.accent, background: `${activeSectionMeta.accent}14` }}>
                <SectionGlyph sectionId={activeSectionMeta.id} color={activeSectionMeta.accent} />
              </span>
              {activeSectionMeta.hint}
            </div>
            <h1 style={styles.sectionTitle}>Brand Voice & Tone</h1>
            <p style={styles.sectionDesc}>Guidelines for how your brand sounds across all communications. Share this with anyone who writes for your brand.</p>

            <div style={styles.tagContainer}>
              <label style={styles.fieldLabel}>Voice Attributes</label>
              <div style={styles.tagRow}>
                {(workbook.brand_voice_attributes || []).map((attr: string, idx: number) => (
                  <span key={idx} style={styles.tag}>{attr}</span>
                ))}
              </div>
            </div>

            <EditableField
              label="Tone Guidelines"
              value={workbook.tone_guidelines || ""}
              field="tone_guidelines"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={6}
              placeholder="Describe when and how your brand's tone shifts (e.g., more formal in proposals, more casual on social)..."
            />
          </section>
        )}

        {activeSection === "report-sections" && (
          <section id="workbook-active-section" style={activeSectionShellStyle}>
            <div style={styles.sectionOverline}>
              <span style={{ ...styles.sectionOverlineIcon, color: activeSectionMeta.accent, background: `${activeSectionMeta.accent}14` }}>
                <SectionGlyph sectionId={activeSectionMeta.id} color={activeSectionMeta.accent} />
              </span>
              {activeSectionMeta.hint}
            </div>
            <h1 style={styles.sectionTitle}>Campaign + Channel Copy</h1>
            <p style={styles.sectionDesc}>
              Focus on execution-ready copy your team can deploy immediately. Email and social are included here with full editable drafts.
            </p>
            <div style={styles.sectionInlineActions}>
              <button
                type="button"
                onClick={handleGenerateChannelDrafts}
                disabled={readOnly || generatingChannelDrafts}
                style={{
                  ...styles.sectionInlineActionBtn,
                  ...(readOnly || generatingChannelDrafts ? styles.sectionInlineActionBtnDisabled : {}),
                }}
              >
                {generatingChannelDrafts ? "Generating Drafts..." : "Generate Email + Social + Action Plan"}
              </button>
              <span style={styles.sectionInlineActionHint}>
                Creates starter channel copy and a 90-day implementation plan from your positioning, messaging pillars, and voice.
              </span>
            </div>
            {[
              { key: "company_description", label: "Company Description (Master)", placeholder: "Write your core company description in 2-4 sentences. Include audience, value, differentiation, and a clear tone your team should preserve." },
              { key: "implementation_action_plan", label: "90-Day Implementation Action Plan", placeholder: "Define 30/60/90 execution priorities. Include owners, deliverables, and KPI targets for each sprint so teams can execute without ambiguity." },
              { key: "content_type_channel_plan", label: "Content Type + Channel Plan", placeholder: "Map content types to funnel stages and channels (where your audience discovers, evaluates, and converts). Include cadence, CTA type, and proof requirements." },
              { key: "executive_summary", label: "Executive Summary (Shareable)", placeholder: "Write a concise stakeholder-ready summary: current momentum, biggest opportunity, major risk, and 30-day priority plan." },
              { key: "pillar_results", label: "Messaging Playbook by Pillar", placeholder: "For each messaging pillar, provide: core message, proof point, CTA, and where to use it (site, sales, email, social)." },
              { key: "conversion_strategy", label: "Landing Page Conversion Copy", placeholder: "Draft conversion copy structure: headline, supporting proof, objection handling, and primary CTA for one priority page." },
              { key: "email_framework", label: "Email Campaign Copy", placeholder: "Draft complete copy for 3 emails (welcome, nurture, conversion). Include subject line, preview text, body copy, and CTA for each." },
              { key: "social_strategy", label: "Social Campaign Copy", placeholder: "Draft one week of platform-ready posts with hook, body, CTA, and suggested visual direction per post." },
              { key: "journey_map", label: "Customer Journey Messaging Sequence", placeholder: "Map stage-by-stage messaging (awareness to retention) with specific message goal, proof asset, and CTA per stage." },
              { key: "seo_aeo", label: "Search + Answer Content Brief", placeholder: "Define primary and secondary query themes, target pages, answer snippets, and content updates to improve discoverability." },
            ].map((item) => (
              <EditableField
                key={item.key}
                label={item.label}
                value={workbook.custom_sections?.report_sections?.[item.key] || ""}
                field={`report_sections_${item.key}`}
                onSave={async (_field, value) => {
                  const current = workbook.custom_sections || {};
                  const reportSections = current.report_sections || {};
                  await saveField("custom_sections", {
                    ...current,
                    report_sections: {
                      ...reportSections,
                      [item.key]: value,
                    },
                  });
                }}
                onRefine={async (field) => {
                  await refineWithApply(
                    field,
                    item.key,
                    workbook.custom_sections?.report_sections?.[item.key] || "",
                    async (refined) => {
                      const current = workbook.custom_sections || {};
                      const reportSections = current.report_sections || {};
                      await saveField("custom_sections", {
                        ...current,
                        report_sections: {
                          ...reportSections,
                          [item.key]: refined,
                        },
                      });
                    },
                    `Refine this playbook section narrative for clarity and actionability.`
                  );
                }}
                saving={saving}
                refining={refining}
                readOnly={readOnly}
                rows={4}
                placeholder={item.placeholder}
              />
            ))}
          </section>
        )}

        {/* ─── Archetype ─── */}
        {activeSection === "archetype" && (
          <section id="workbook-active-section" style={activeSectionShellStyle}>
            <div style={styles.sectionOverline}>
              <span style={{ ...styles.sectionOverlineIcon, color: activeSectionMeta.accent, background: `${activeSectionMeta.accent}14` }}>
                <SectionGlyph sectionId={activeSectionMeta.id} color={activeSectionMeta.accent} />
              </span>
              {activeSectionMeta.hint}
            </div>
            <h1 style={styles.sectionTitle}>Archetype Lens</h1>
            <p style={styles.sectionDesc}>
              Your brand personality framework — how your brand shows up in the world.
              Archetype results are assessment-derived and stay locked unless the underlying questionnaire inputs change.
            </p>

            <div style={styles.archetypeBadge}>
              <span style={styles.archetypeLabel}>Your Archetype</span>
              <span style={styles.archetypeName}>{workbook.brand_archetype || "Not yet determined"}</span>
            </div>

            <EditableField
              label="Archetype Description"
              value={workbook.archetype_description || ""}
              field="archetype_description"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              readOnly={true}
              lockReason="Assessment-derived (locked)"
              rows={4}
            />
            <EditableField
              label="How to Apply Your Archetype"
              value={workbook.archetype_application || ""}
              field="archetype_application"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              readOnly={true}
              lockReason="Assessment-derived (locked)"
              rows={5}
            />
            <div style={styles.archetypeOutputHeader}>Archetype-driven Playbook Guidance</div>
            <p style={styles.sectionDesc}>
              Keep the archetype diagnosis locked, but shape how it shows up across your playbook.
              Use these fields to define practical messaging, visual, and content expression.
            </p>
            <EditableField
              label="Messaging Translation"
              value={workbook.custom_sections?.archetype_outputs?.messaging_translation || ""}
              field="messaging_translation"
              onSave={saveArchetypeOutputField}
              onRefine={async (field) => {
                await refineWithApply(
                  field,
                  field,
                  workbook.custom_sections?.archetype_outputs?.messaging_translation || "",
                  async (refined) => saveArchetypeOutputField(field, refined),
                  "Refine this archetype messaging guidance for clarity, consistency, and channel usability."
                );
              }}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={4}
              placeholder="How should this archetype sound in copy? Include sentence style, tone boundaries, and what to avoid."
            />
            <EditableField
              label="Visual Translation"
              value={workbook.custom_sections?.archetype_outputs?.visual_translation || ""}
              field="visual_translation"
              onSave={saveArchetypeOutputField}
              onRefine={async (field) => {
                await refineWithApply(
                  field,
                  field,
                  workbook.custom_sections?.archetype_outputs?.visual_translation || "",
                  async (refined) => saveArchetypeOutputField(field, refined),
                  "Refine this archetype visual guidance so design teams can execute consistently."
                );
              }}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={4}
              placeholder="How should this archetype look visually? Include layout mood, imagery style, and visual do/don't guidance."
            />
            <EditableField
              label="Content Translation"
              value={workbook.custom_sections?.archetype_outputs?.content_translation || ""}
              field="content_translation"
              onSave={saveArchetypeOutputField}
              onRefine={async (field) => {
                await refineWithApply(
                  field,
                  field,
                  workbook.custom_sections?.archetype_outputs?.content_translation || "",
                  async (refined) => saveArchetypeOutputField(field, refined),
                  "Refine this archetype content guidance into actionable formats, themes, and recurring angles."
                );
              }}
              saving={saving}
              refining={refining}
              readOnly={readOnly}
              rows={4}
              placeholder="Which formats, topics, and recurring angles best express this archetype in-market?"
            />
          </section>
        )}
        <section style={styles.strategyNotesShell}>
          <div style={styles.strategyNotesHeaderRow}>
            <span style={styles.strategyNotesKicker}>Advanced Inputs</span>
            <span style={styles.strategyNotesPill}>Optional</span>
          </div>
          <button
            type="button"
            onClick={() => setShowStrategyNotes((v) => !v)}
            style={styles.strategyNotesToggle}
            aria-expanded={showStrategyNotes}
          >
            <span>{showStrategyNotes ? "Hide Strategy Notes" : "Show Strategy Notes"}</span>
            <span style={styles.strategyNotesToggleIcon}>{showStrategyNotes ? "−" : "+"}</span>
          </button>
          <p style={styles.strategyNotesHint}>
            Use these only when needed. Core playbook editing stays in Positioning, Messaging, Voice, and Channel Playbook Copy.
          </p>
          {showStrategyNotes && (
            <div style={styles.strategyNotesContent}>
              <div style={styles.strategyNotesSubsection}>
                <h2 style={styles.strategyNotesTitle}>Audience Notes</h2>
                <EditableField
                  label="Primary Audience"
                  value={
                    workbook.primary_audience?.description ||
                    (typeof workbook.primary_audience === "string" ? workbook.primary_audience : "")
                  }
                  field="primary_audience_desc"
                  onSave={async (_, val) => {
                    const updated = { ...(workbook.primary_audience || {}), description: val };
                    await saveField("primary_audience", updated);
                  }}
                  onRefine={async () => {
                    const current =
                      workbook.primary_audience?.description ||
                      (typeof workbook.primary_audience === "string" ? workbook.primary_audience : "");
                    await refineWithApply(
                      "primary_audience_desc",
                      "primary_audience",
                      current,
                      async (refined) => {
                        const updated = { ...(workbook.primary_audience || {}), description: refined };
                        await saveField("primary_audience", updated);
                      }
                    );
                  }}
                  saving={saving}
                  refining={refining}
                  readOnly={readOnly}
                  rows={4}
                  placeholder="Describe your primary audience - who they are, what they need, and what drives decisions."
                />
                <EditableField
                  label="Secondary Audience"
                  value={
                    workbook.secondary_audience?.description ||
                    (typeof workbook.secondary_audience === "string" ? workbook.secondary_audience : "")
                  }
                  field="secondary_audience_desc"
                  onSave={async (_, val) => {
                    const updated = { ...(workbook.secondary_audience || {}), description: val };
                    await saveField("secondary_audience", updated);
                  }}
                  onRefine={async () => {
                    const current =
                      workbook.secondary_audience?.description ||
                      (typeof workbook.secondary_audience === "string" ? workbook.secondary_audience : "");
                    await refineWithApply(
                      "secondary_audience_desc",
                      "secondary_audience",
                      current,
                      async (refined) => {
                        const updated = { ...(workbook.secondary_audience || {}), description: refined };
                        await saveField("secondary_audience", updated);
                      }
                    );
                  }}
                  saving={saving}
                  refining={refining}
                  readOnly={readOnly}
                  rows={4}
                  placeholder="Describe secondary buyers/influencers and when they enter the journey."
                />
              </div>

              <div style={styles.strategyNotesSubsection}>
                <h2 style={styles.strategyNotesTitle}>Differentiator Notes</h2>
                {(workbook.key_differentiators || []).map((diff: any, idx: number) => (
                  <div key={idx} style={styles.pillarCard}>
                    <EditableField
                      label={`Differentiator ${idx + 1}`}
                      value={diff.differentiator || diff || ""}
                      field={`diff_${idx}`}
                      onSave={async (_, val) => {
                        const updated = [...(workbook.key_differentiators || [])];
                        if (typeof updated[idx] === "object") {
                          updated[idx] = { ...updated[idx], differentiator: val };
                        } else {
                          updated[idx] = val;
                        }
                        await saveField("key_differentiators", updated);
                      }}
                      onRefine={async () => {
                        const current = diff?.differentiator || diff || "";
                        await refineWithApply(
                          `diff_${idx}`,
                          "key_differentiator",
                          current,
                          async (refined) => {
                            const updated = [...(workbook.key_differentiators || [])];
                            if (typeof updated[idx] === "object") {
                              updated[idx] = { ...updated[idx], differentiator: refined };
                            } else {
                              updated[idx] = refined;
                            }
                            await saveField("key_differentiators", updated);
                          }
                        );
                      }}
                      saving={saving}
                      refining={refining}
                      readOnly={readOnly}
                      rows={2}
                      placeholder="Name one differentiator that matters to buyers, why it matters, and what proof supports it."
                    />
                  </div>
                ))}
              </div>

              <div style={styles.strategyNotesSubsection}>
                <h2 style={styles.strategyNotesTitle}>SWOT Notes</h2>
                <EditableField
                  label="Strengths"
                  value={workbook.custom_sections?.strategic?.swot_strengths || ""}
                  field="swot_strengths"
                  onSave={saveCustomSectionField}
                  onRefine={async (field) => {
                    await refineWithApply(
                      field,
                      field,
                      workbook.custom_sections?.strategic?.swot_strengths || "",
                      async (refined) => saveCustomSectionField(field, refined)
                    );
                  }}
                  saving={saving}
                  refining={refining}
                  readOnly={readOnly}
                  rows={4}
                  placeholder="List strengths (one per line) with proof points."
                />
                <EditableField
                  label="Weaknesses"
                  value={workbook.custom_sections?.strategic?.swot_weaknesses || ""}
                  field="swot_weaknesses"
                  onSave={saveCustomSectionField}
                  onRefine={async (field) => {
                    await refineWithApply(
                      field,
                      field,
                      workbook.custom_sections?.strategic?.swot_weaknesses || "",
                      async (refined) => saveCustomSectionField(field, refined)
                    );
                  }}
                  saving={saving}
                  refining={refining}
                  readOnly={readOnly}
                  rows={4}
                  placeholder="List weaknesses (one per line) with likely impact."
                />
                <EditableField
                  label="Opportunities"
                  value={workbook.custom_sections?.strategic?.swot_opportunities || ""}
                  field="swot_opportunities"
                  onSave={saveCustomSectionField}
                  onRefine={async (field) => {
                    await refineWithApply(
                      field,
                      field,
                      workbook.custom_sections?.strategic?.swot_opportunities || "",
                      async (refined) => saveCustomSectionField(field, refined)
                    );
                  }}
                  saving={saving}
                  refining={refining}
                  readOnly={readOnly}
                  rows={4}
                  placeholder="List opportunities (one per line) and near-term actions."
                />
                <EditableField
                  label="Threats"
                  value={workbook.custom_sections?.strategic?.swot_threats || ""}
                  field="swot_threats"
                  onSave={saveCustomSectionField}
                  onRefine={async (field) => {
                    await refineWithApply(
                      field,
                      field,
                      workbook.custom_sections?.strategic?.swot_threats || "",
                      async (refined) => saveCustomSectionField(field, refined)
                    );
                  }}
                  saving={saving}
                  refining={refining}
                  readOnly={readOnly}
                  rows={4}
                  placeholder="List threats (one per line) and mitigation notes."
                />
              </div>
            </div>
          )}
        </section>
      </main>
      {refinePreview && (
        <div style={styles.refineModalBackdrop}>
          <div style={styles.refineModalCard}>
            <div style={styles.refineModalTitle}>Review AI refinement</div>
            <div style={styles.refineModalSubtitle}>
              Compare before and after. Accept to update this field, or reject to keep your current copy.
            </div>
            <div style={styles.refineDiffGrid}>
              <div style={styles.refineDiffCol}>
                <div style={styles.refineDiffLabel}>Original</div>
                <div style={styles.refineDiffBody}>{refinePreview.original || "—"}</div>
              </div>
              <div style={styles.refineDiffCol}>
                <div style={styles.refineDiffLabel}>AI Refined</div>
                <div style={styles.refineDiffBody}>{refinePreview.refined || "—"}</div>
              </div>
            </div>
            <div style={styles.refineModalActions}>
              <button
                type="button"
                onClick={() => setRefinePreview(null)}
                style={styles.refineRejectBtn}
                disabled={applyingRefinePreview}
              >
                Reject
              </button>
              <button
                type="button"
                onClick={async () => {
                  setApplyingRefinePreview(true);
                  try {
                    if (refinePreview.refined.trim() === refinePreview.original.trim()) {
                      setSaveStatus("No changes suggested");
                      setTimeout(() => setSaveStatus(null), 2200);
                      setRefinePreview(null);
                      return;
                    }
                    await refinePreview.apply(refinePreview.refined);
                    setSaveStatus("Refined and saved (archetype-aligned)");
                    setTimeout(() => setSaveStatus(null), 2200);
                    setRefinePreview(null);
                  } catch {
                    setSaveStatus("Apply failed");
                    setTimeout(() => setSaveStatus(null), 2500);
                  } finally {
                    setApplyingRefinePreview(false);
                  }
                }}
                style={styles.refineAcceptBtn}
                disabled={applyingRefinePreview}
              >
                {applyingRefinePreview ? "Applying..." : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Editable Field Component ───
function EditableField({
  label,
  value,
  field,
  onSave,
  onRefine,
  saving,
  refining,
  rows = 3,
  placeholder,
  readOnly = false,
  lockReason,
}: {
  label: string;
  value: string;
  field: string;
  onSave: (field: string, value: string) => Promise<void>;
  onRefine: (field: string, value?: string) => Promise<void>;
  saving: boolean;
  refining: string | null;
  rows?: number;
  placeholder?: string;
  readOnly?: boolean;
  lockReason?: string;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [dirty, setDirty] = useState(false);
  const [hoveredSave, setHoveredSave] = useState(false);
  const [hoveredRefine, setHoveredRefine] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [showSavedTick, setShowSavedTick] = useState(false);

  useEffect(() => {
    setLocalValue(value);
    setDirty(false);
    if (lastSavedAt) {
      setShowSavedTick(true);
      const t = window.setTimeout(() => setShowSavedTick(false), 6000);
      return () => window.clearTimeout(t);
    }
  }, [value, lastSavedAt]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    setLocalValue(e.target.value);
    setDirty(true);
  };

  const handleSave = async () => {
    await onSave(field, localValue);
    setDirty(false);
    setLastSavedAt(Date.now());
  };

  const isRefining = refining === field;

  return (
    <div
      style={{
        ...styles.fieldContainer,
        ...(isFocused ? styles.fieldContainerFocused : {}),
        ...(dirty ? styles.fieldContainerDirty : {}),
      }}
    >
      <div style={styles.fieldHeader}>
        <div style={styles.fieldLabelRow}>
          <label style={styles.fieldLabel}>{label}</label>
          {readOnly && lockReason ? <span style={styles.lockedFieldBadge}>{lockReason}</span> : null}
        </div>
        <div style={styles.fieldActions}>
          {!readOnly && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              aria-label={`Save ${label}`}
              onMouseEnter={() => setHoveredSave(true)}
              onMouseLeave={() => setHoveredSave(false)}
              style={{
                ...styles.saveBtn,
                ...(hoveredSave && !saving && dirty ? styles.saveBtnHover : {}),
                ...(saving || !dirty ? styles.saveBtnDisabled : {}),
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
          {!readOnly && value && value.length >= 5 && (
            <button
              type="button"
              onClick={() => onRefine(field, localValue)}
              disabled={isRefining}
              aria-label={`Refine ${label} with AI`}
              onMouseEnter={() => setHoveredRefine(true)}
              onMouseLeave={() => setHoveredRefine(false)}
              style={{
                ...styles.refineBtn,
                ...(hoveredRefine && !isRefining ? styles.refineBtnHover : {}),
                ...(isRefining ? styles.refineBtnDisabled : {}),
              }}
            >
              {isRefining ? "Refining..." : "Refine with AI"}
            </button>
          )}
        </div>
      </div>
      <textarea
        value={localValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        readOnly={readOnly}
        rows={rows}
        placeholder={placeholder || `Enter your ${label.toLowerCase()}...`}
        style={{
          ...styles.textarea,
          ...(readOnly ? { background: "#F1F5F9", cursor: "default", opacity: 0.85 } : {}),
          ...(isFocused && !readOnly ? styles.textareaFocus : {}),
          ...(dirty ? styles.textareaDirty : {}),
          ...(isRefining ? styles.textareaRefining : {}),
        }}
      />
      {readOnly && lockReason ? <div style={styles.lockedFieldNote}>This field is locked. {lockReason}.</div> : null}
      {!readOnly && showSavedTick && lastSavedAt ? (
        <div style={styles.savedFieldNote}>
          Saved {new Date(lastSavedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </div>
      ) : null}
    </div>
  );
}

// ─── Styles ───
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Lato', system-ui, sans-serif",
    background: "linear-gradient(180deg, #F7F9FC 0%, #F3F6FB 100%)",
  },
  sidebar: {
    width: 320,
    background: "#FFFFFF",
    color: "#0F172A",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    flexShrink: 0,
    borderRight: "1px solid #E6EAF2",
    boxShadow: "8px 0 24px rgba(15, 23, 42, 0.04)",
  },
  sidebarHeader: {
    padding: "28px 22px 16px",
    borderBottom: "1px solid #E6EAF2",
    background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)",
  },
  sidebarEyebrow: {
    margin: "0 0 8px",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "#64748B",
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 6px",
    color: "#0B1B44",
    letterSpacing: "-0.02em",
  },
  sidebarBusiness: {
    fontSize: 13.5,
    color: "#475569",
    margin: 0,
  },
  progressMetaRow: {
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressMetaLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#64748B",
  },
  progressMetaValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0EA5E9",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    background: "#D5DFEB",
    marginTop: 7,
    overflow: "hidden",
    boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.08)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #38BDF8 0%, #0EA5E9 100%)",
    transition: "width 0.3s ease",
  },
  sidebarNav: {
    padding: "14px 14px 10px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  navBtn: {
    display: "block",
    width: "100%",
    padding: "11px 12px 12px",
    background: "#FFFFFF",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#0F172A",
    fontSize: 13,
    fontWeight: 500,
    textAlign: "left" as const,
    cursor: "pointer",
    transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
    fontFamily: "'Lato', system-ui, sans-serif",
    borderRadius: 12,
  },
  navBtnActive: {
    background: "#F0F7FF",
    color: "#0B1B44",
    fontWeight: 700,
    borderColor: "#BFDFFF",
    boxShadow: "inset 3px 0 0 #0EA5E9, 0 6px 18px rgba(7, 176, 242, 0.14)",
  },
  navBtnHover: {
    borderColor: "#7CC8F6",
    background: "#DBEEFF",
    transform: "translateY(-2px)",
    boxShadow: "inset 3px 0 0 #38BDF8, 0 12px 24px rgba(14, 116, 144, 0.24)",
  },
  navBtnFocus: {
    outline: "2px solid #7DD3FC",
    outlineOffset: 1,
  },
  navBtnEyebrow: {
    display: "block",
    marginBottom: 4,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.11em",
    textTransform: "uppercase" as const,
    color: "#0EA5E9",
  },
  navGlyph: {
    position: "absolute" as const,
    top: 10,
    right: 10,
    borderRadius: 999,
    width: 22,
    height: 22,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnLabel: {
    display: "block",
    fontSize: 14,
    fontWeight: 700,
    color: "#0B1B44",
    marginBottom: 3,
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
  },
  navBtnHint: {
    display: "block",
    fontSize: 11.5,
    color: "#475569",
    lineHeight: 1.4,
  },
  sidebarFooter: {
    padding: "16px 16px 22px",
    borderTop: "1px solid #E6EAF2",
    background: "#FCFDFF",
  },
  sidebarFooterHint: {
    fontSize: 11.5,
    color: "#64748B",
    marginBottom: 10,
    lineHeight: 1.35,
    textAlign: "center" as const,
  },
  sidebarGroup: {
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    background: "#FFFFFF",
    padding: "10px 10px 8px",
    marginBottom: 10,
  },
  sidebarGroupTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#334155",
    marginBottom: 4,
  },
  sidebarGroupHint: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 8,
    lineHeight: 1.35,
  },
  advancedToolsToggle: {
    width: "100%",
    border: "1px solid #CBD5E1",
    borderRadius: 10,
    background: "#F8FAFC",
    color: "#0F172A",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 10px",
    cursor: "pointer",
  },
  exportBtn: {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    background: "#0EA5E9",
    color: "#fff",
    borderRadius: 12,
    textAlign: "center" as const,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 12,
    boxShadow: "0 8px 16px rgba(14, 165, 233, 0.2)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
  },
  backLink: {
    display: "block",
    color: "#64748B",
    fontSize: 13,
    textDecoration: "none",
    textAlign: "center" as const,
  },
  main: {
    flex: 1,
    padding: "42px 52px",
    maxWidth: 920,
    position: "relative" as const,
  },
  mainNarrow: {
    padding: "24px 16px 30px",
    maxWidth: "100%",
  },
  mainNarrowShort: {
    paddingTop: 16,
  },
  sectionShell: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 18,
    padding: "30px 30px 26px",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.06)",
    marginBottom: 22,
  },
  strategyNotesShell: {
    marginBottom: 24,
    border: "1px solid #DBE5F1",
    borderRadius: 14,
    background: "linear-gradient(180deg, #F8FBFF 0%, #FDFEFF 100%)",
    padding: "12px 12px 6px",
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.04)",
  },
  strategyNotesHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  strategyNotesKicker: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#475569",
  },
  strategyNotesPill: {
    fontSize: 10.5,
    fontWeight: 700,
    color: "#0369A1",
    background: "#E0F2FE",
    border: "1px solid #BAE6FD",
    borderRadius: 999,
    padding: "2px 8px",
  },
  strategyNotesToggle: {
    width: "100%",
    border: "1px solid #CBD5E1",
    borderRadius: 10,
    background: "#FFFFFF",
    color: "#0F172A",
    fontSize: 12,
    fontWeight: 700,
    padding: "9px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  strategyNotesToggleIcon: {
    fontSize: 16,
    lineHeight: 1,
    color: "#0EA5E9",
    fontWeight: 700,
  },
  strategyNotesHint: {
    margin: "8px 2px 6px",
    fontSize: 11.5,
    lineHeight: 1.4,
    color: "#64748B",
  },
  strategyNotesContent: {
    marginTop: 10,
  },
  strategyNotesSubsection: {
    marginBottom: 12,
    padding: "11px 11px 3px",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    background: "#FFFFFF",
  },
  strategyNotesTitle: {
    margin: "0 0 9px",
    fontSize: 13,
    fontWeight: 700,
    color: "#0F172A",
  },
  sectionOverline: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#64748B",
  },
  sectionOverlineIcon: {
    width: 18,
    height: 18,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  mobileNavShell: {
    marginBottom: 18,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "10px 10px 12px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
  },
  mobileNavTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#64748B",
    margin: 0,
  },
  mobileNavTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "0 4px 10px",
  },
  mobileProgressValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0369A1",
  },
  mobileProgressText: {
    margin: "0 4px 8px",
    fontSize: 12,
    fontWeight: 700,
    color: "#0F172A",
  },
  mobileProgressTrack: {
    width: "100%",
    height: 7,
    borderRadius: 999,
    background: "#D5DFEB",
    margin: "0 2px 12px",
    overflow: "hidden",
    boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.08)",
  },
  mobileProgressFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #38BDF8 0%, #0284C7 100%)",
    transition: "width 0.3s ease",
  },
  mobileNavScroller: {
    display: "flex",
    gap: 8,
    overflowX: "auto" as const,
    paddingBottom: 2,
    paddingRight: 14,
    scrollPaddingRight: 14,
    scrollSnapType: "x proximity",
  },
  mobileNavChip: {
    flexShrink: 0,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    background: "#FFFFFF",
    color: "#1E293B",
    padding: "8px 12px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
    minHeight: 40,
    touchAction: "manipulation",
    scrollSnapAlign: "start",
  },
  mobileNavChipCompact: {
    padding: "7px 11px",
    minHeight: 36,
    fontSize: 12,
  },
  mobileNavChipGlyph: {
    width: 18,
    height: 18,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    flexShrink: 0,
  },
  mobileNavChipActive: {
    borderColor: "#BAE6FD",
    background: "#E0F2FE",
    color: "#0C4A6E",
  },
  mobileNavChipHover: {
    borderColor: "#38BDF8",
    background: "#CFE9FF",
    color: "#0C4A6E",
    boxShadow: "0 10px 18px rgba(14, 116, 144, 0.26)",
    transform: "translateY(-1px)",
  },
  mobileNavChipFocus: {
    outline: "2px solid #7DD3FC",
    outlineOffset: 1,
  },
  actionRail: {
    position: "sticky" as const,
    top: 10,
    zIndex: 20,
    marginBottom: 18,
    background: "linear-gradient(90deg, #FFFFFF 0%, #F8FCFF 100%)",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#DCE8F5",
    borderRadius: 14,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  actionRailCompact: {
    position: "static" as const,
    padding: "10px 12px",
    marginBottom: 14,
  },
  actionRailNarrow: {
    flexDirection: "column" as const,
    alignItems: "stretch",
    gap: 10,
  },
  actionRailTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#0EA5E9",
    marginBottom: 2,
  },
  actionRailHint: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 1.4,
  },
  actionRailSubhint: {
    marginTop: 4,
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 1.35,
  },
  actionRailBtn: {
    border: "1px solid #0EA5E9",
    background: "#0EA5E9",
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: 700,
    padding: "9px 14px",
    borderRadius: 999,
    cursor: "pointer",
    flexShrink: 0,
    boxShadow: "0 8px 18px rgba(14, 165, 233, 0.24)",
    transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
  },
  actionRailBtnNarrow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  actionRailActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  actionRailActionsNarrow: {
    width: "100%",
    flexDirection: "column" as const,
    alignItems: "stretch",
  },
  actionRailSecondaryBtn: {
    border: "1px solid #0EA5E9",
    background: "#FFFFFF",
    color: "#0369A1",
    fontSize: 12.5,
    fontWeight: 700,
    padding: "9px 14px",
    borderRadius: 999,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
  },
  actionRailTertiaryBtn: {
    border: "1px solid #BFDBFE",
    background: "#F8FAFC",
    color: "#1E3A8A",
    fontSize: 12.5,
    fontWeight: 700,
    padding: "9px 14px",
    borderRadius: 999,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
  },
  actionRailSessionBtn: {
    border: "1px solid #10B981",
    background: "#ECFDF5",
    color: "#047857",
    fontSize: 12.5,
    fontWeight: 700,
    padding: "9px 14px",
    borderRadius: 999,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
  },
  deliverablesShell: {
    marginBottom: 0,
    border: "none",
    borderRadius: 0,
    padding: 0,
    background: "transparent",
  },
  deliverablesTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#64748B",
    marginBottom: 8,
  },
  deliverablesList: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
  },
  deliverableChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    color: "#0369A1",
    border: "1px solid rgba(14,165,233,0.3)",
    background: "rgba(14,165,233,0.08)",
    textDecoration: "none",
    lineHeight: 1.2,
  },
  actionRailBtnHover: {
    transform: "translateY(-1px)",
    boxShadow: "0 12px 22px rgba(14, 165, 233, 0.3)",
  },
  actionRailBtnFocus: {
    outline: "2px solid #BAE6FD",
    outlineOffset: 2,
  },
  actionRailBtnDisabled: {
    opacity: 0.72,
    cursor: "default",
    boxShadow: "none",
  },
  sectionToolsShell: {
    marginBottom: 14,
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    background: "#FFFFFF",
    padding: "10px 12px",
  },
  sectionToolsTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#64748B",
    marginBottom: 8,
  },
  sectionToolsList: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
  },
  sectionToolChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    color: "#0369A1",
    border: "1px solid rgba(14,165,233,0.3)",
    background: "rgba(14,165,233,0.08)",
    textDecoration: "none",
    lineHeight: 1.2,
  },
  deliverablesSuiteShell: {
    marginBottom: 14,
    border: "1px solid #DBE5F1",
    borderRadius: 12,
    background: "linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)",
    padding: "10px 12px",
  },
  deliverablesSuiteHeader: {
    marginBottom: 8,
  },
  deliverablesSuiteTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#334155",
    marginBottom: 4,
  },
  deliverablesSuiteHint: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 1.35,
  },
  deliverablesSuiteGrid: {
    display: "grid",
    gap: 8,
  },
  deliverablesGroupCard: {
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    background: "#FFFFFF",
    padding: "8px 9px",
  },
  deliverablesGroupTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0B1B44",
    marginBottom: 6,
  },
  deliverablesGroupList: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
  },
  deliverablesGroupChip: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    padding: "7px 10px",
    borderRadius: 10,
    color: "#1E3A8A",
    border: "1px solid rgba(59,130,246,0.2)",
    background: "rgba(59,130,246,0.06)",
    textDecoration: "none",
    lineHeight: 1.25,
    minWidth: 210,
  },
  deliverablesGroupChipTitle: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#1E3A8A",
  },
  deliverablesGroupChipUse: {
    fontSize: 10.5,
    color: "#475569",
  },
  lensShell: {
    marginBottom: 14,
    background: "#F8FBFF",
    border: "1px solid #DBEAFE",
    borderRadius: 12,
    padding: "10px 12px",
  },
  lensHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    flexWrap: "wrap" as const,
  },
  lensTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#1E3A8A",
  },
  lensPill: {
    fontSize: 10.5,
    fontWeight: 700,
    color: "#1D4ED8",
    background: "#E0E7FF",
    borderRadius: 999,
    padding: "3px 8px",
  },
  lensBody: {
    fontSize: 12.5,
    color: "#1E293B",
    lineHeight: 1.45,
  },
  lensDot: {
    color: "#93C5FD",
    margin: "0 4px",
  },
  lensSub: {
    marginTop: 5,
    fontSize: 11.5,
    color: "#475569",
  },
  mainProgressShell: {
    marginBottom: 16,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 14,
    padding: "10px 12px",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
  },
  mainProgressRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mainProgressLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#64748B",
  },
  mainProgressValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0B1B44",
  },
  mainProgressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "#D5DFEB",
    overflow: "hidden",
    boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.08)",
  },
  mainProgressFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #38BDF8 0%, #0284C7 100%)",
    transition: "width 0.35s ease",
  },
  lockedMetaShell: {
    marginBottom: 16,
    background: "#F8FAFC",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#DCE8F5",
    borderRadius: 14,
    padding: "12px 14px",
  },
  lockedMetaHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  lockedMetaTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "#334155",
  },
  lockedMetaPill: {
    fontSize: 11,
    fontWeight: 600,
    color: "#475569",
    background: "#E2E8F0",
    borderRadius: 999,
    padding: "4px 9px",
  },
  lockedMetaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },
  lockedMetaCard: {
    background: "#FFFFFF",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: "9px 10px",
  },
  lockedMetaLabel: {
    fontSize: 10.5,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "#64748B",
    marginBottom: 4,
  },
  lockedMetaValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0F172A",
    textTransform: "capitalize" as const,
  },
  lockedMetaFooter: {
    marginTop: 10,
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 1.4,
  },
  lockedMetaLink: {
    color: "#0369A1",
    fontWeight: 700,
    textDecoration: "none",
  },
  readinessShell: {
    marginBottom: 16,
    background: "#FFFFFF",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#DCE8F5",
    borderRadius: 14,
    padding: "12px 14px",
  },
  readinessHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  readinessTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#334155",
  },
  readinessValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0F172A",
  },
  readinessTrack: {
    width: "100%",
    height: 7,
    borderRadius: 999,
    background: "#D5DFEB",
    overflow: "hidden",
    marginBottom: 10,
  },
  readinessFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #10B981 0%, #0284C7 100%)",
    transition: "width 0.25s ease",
  },
  readinessList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 8,
  },
  readinessItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  readinessDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#94A3B8",
    color: "#64748B",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  readinessDotDone: {
    borderColor: "#10B981",
    background: "#ECFDF5",
    color: "#047857",
  },
  readinessText: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 1.35,
  },
  readinessTextDone: {
    color: "#065F46",
    fontWeight: 600,
  },
  refineModalBackdrop: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(2, 24, 89, 0.28)",
    zIndex: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  refineModalCard: {
    width: "min(900px, 96vw)",
    maxHeight: "88vh",
    overflow: "auto" as const,
    background: "#FFFFFF",
    borderRadius: 14,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#DCE8F5",
    boxShadow: "0 24px 48px rgba(15, 23, 42, 0.22)",
    padding: "16px 16px 14px",
  },
  refineModalTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#0B1B44",
    marginBottom: 4,
  },
  refineModalSubtitle: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 1.45,
    marginBottom: 12,
  },
  refineDiffGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 12,
  },
  refineDiffCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    background: "#F8FAFC",
    padding: "10px 10px 9px",
  },
  refineDiffLabel: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#64748B",
    marginBottom: 7,
  },
  refineDiffBody: {
    fontSize: 13.5,
    color: "#0F172A",
    lineHeight: 1.55,
    whiteSpace: "pre-wrap" as const,
  },
  refineModalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  refineRejectBtn: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    background: "#FFFFFF",
    color: "#334155",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  refineAcceptBtn: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#0EA5E9",
    background: "#0EA5E9",
    color: "#FFFFFF",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  saveIndicator: {
    position: "fixed" as const,
    top: 16,
    right: 16,
    padding: "8px 16px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    zIndex: 100,
    animation: "fadeIn 0.2s ease",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.14)",
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: 700,
    color: "#0B1B44",
    margin: "0 0 10px",
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
  },
  sectionDesc: {
    fontSize: 15.5,
    color: "#475569",
    lineHeight: 1.65,
    margin: "0 0 30px",
    maxWidth: 680,
  },
  sectionInlineActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    margin: "0 0 18px",
  },
  sectionInlineActionBtn: {
    borderRadius: 999,
    border: "1px solid #BFDBFE",
    background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    color: "#1D4ED8",
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  sectionInlineActionBtnDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  sectionInlineActionHint: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 1.4,
  },
  fieldContainer: {
    marginBottom: 26,
    background: "#FCFDFF",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E7EDF5",
    borderRadius: 14,
    padding: "15px 15px 13px",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.03)",
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
  },
  fieldContainerFocused: {
    borderColor: "#BAE6FD",
    boxShadow: "0 10px 20px rgba(14, 165, 233, 0.08)",
  },
  fieldContainerDirty: {
    borderColor: "#FCD34D",
  },
  fieldHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    rowGap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
  fieldLabelRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  lockedFieldBadge: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "#475569",
    background: "#E2E8F0",
    borderRadius: 999,
    padding: "3px 8px",
  },
  lockedFieldNote: {
    marginTop: 8,
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 1.4,
  },
  savedFieldNote: {
    marginTop: 8,
    fontSize: 11.5,
    color: "#059669",
    lineHeight: 1.35,
    fontWeight: 600,
  },
  fieldActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  saveBtn: {
    padding: "7px 14px",
    background: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Lato', system-ui, sans-serif",
    boxShadow: "0 6px 14px rgba(5, 150, 105, 0.22)",
    transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease, opacity 0.2s ease",
  },
  saveBtnHover: {
    transform: "translateY(-1px)",
    boxShadow: "0 10px 18px rgba(5, 150, 105, 0.28)",
  },
  saveBtnDisabled: {
    opacity: 0.8,
    cursor: "default",
  },
  refineBtn: {
    padding: "7px 14px",
    background: "#F0F7FF",
    color: "#0369A1",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
    fontFamily: "'Lato', system-ui, sans-serif",
    boxShadow: "0 2px 8px rgba(14, 165, 233, 0.08)",
  },
  refineBtnHover: {
    transform: "translateY(-1px)",
    background: "#E0F2FE",
    borderColor: "#93C5FD",
    boxShadow: "0 8px 16px rgba(14, 165, 233, 0.16)",
  },
  refineBtnDisabled: {
    opacity: 0.75,
    cursor: "default",
  },
  textarea: {
    width: "100%",
    padding: "14px 15px",
    fontSize: 15,
    lineHeight: 1.7,
    color: "#0F172A",
    border: "1px solid #CFDCEB",
    borderRadius: 10,
    outline: "none",
    resize: "vertical" as const,
    fontFamily: "'Lato', system-ui, sans-serif",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
    background: "#FFFFFF",
    minHeight: 132,
  },
  textareaFocus: {
    border: "1.5px solid #38BDF8",
    boxShadow: "0 0 0 3px rgba(56, 189, 248, 0.12)",
  },
  textareaDirty: {
    border: "1.5px solid #F59E0B",
    boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.1)",
  },
  textareaRefining: {
    opacity: 0.6,
    border: "1.5px solid #07B0F2",
  },
  pillarCard: {
    background: "#FFFFFF",
    border: "1px solid #E6EDF5",
    borderRadius: 12,
    padding: "20px 20px",
    marginBottom: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#021859",
    margin: "0 0 12px",
  },
  tagContainer: {
    marginBottom: 24,
  },
  tagRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    marginTop: 8,
  },
  tag: {
    display: "inline-block",
    padding: "6px 12px",
    background: "#EEF6FF",
    color: "#0369A1",
    borderRadius: 20,
    fontSize: 12.5,
    fontWeight: 700,
    border: "1px solid #BFDBFE",
  },
  archetypeBadge: {
    display: "inline-flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    background: "#021859",
    color: "#fff",
    borderRadius: 12,
    padding: "20px 32px",
    marginBottom: 28,
  },
  archetypeLabel: {
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    color: "#07B0F2",
    fontWeight: 700,
    marginBottom: 4,
  },
  archetypeName: {
    fontSize: 24,
    fontWeight: 700,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: "100vh",
    fontFamily: "'Lato', system-ui, sans-serif",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #E6EAF2",
    borderTop: "3px solid #07B0F2",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 15,
    color: "#5A6B7E",
  },
};

// ─── Main export with Suspense boundary ───
export default function WorkbookPage() {
  return (
    <Suspense
      fallback={
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading your Brand Workbook...</p>
        </div>
      }
    >
      <WorkbookContent />
    </Suspense>
  );
}
