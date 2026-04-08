"use client";

import type { ProductTier } from "@/components/ResultsTabNav";
import FoundationExtras from "@/components/FoundationExtras";
import { BrandArchetypeIcon, SectionGlyph } from "@/components/results/BrandIcons";
import PersonalizedGuidanceCard from "@/components/results/PersonalizedGuidanceCard";
import { ReportCallout, ReportPanel, ReportPanelTitle } from "@/components/results/ReportDesignPrimitives";
import { FunnelVisual, JourneyMapVisual, SwotVisual } from "@/components/results/StoryVisuals";
import TabPageWithSidebar from "@/components/results/TabPageWithSidebar";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_PANEL_RAIL,
} from "@/components/results/suiteBrandTokens";
import { filterStrategySections } from "@/components/results/tabConfig";
import { getSuiteProgressHint } from "@/lib/copy/resultsSuiteGuidance";
import type { WorkbookSectionId } from "@/lib/workbookTypes";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;

interface StrategyTabProps {
  productTier: ProductTier;
  diagnosticData: Record<string, unknown>;
  onEditInWorkbook: (sectionId: WorkbookSectionId) => void;
}

function firstNWords(input: string, count: number): string {
  const words = input.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  return words.slice(0, count).join(" ");
}

export default function StrategyTab({
  productTier,
  diagnosticData,
  onEditInWorkbook,
}: StrategyTabProps) {
  const isFree = productTier === "snapshot";
  const archetype = typeof diagnosticData.primaryArchetype === "string" ? diagnosticData.primaryArchetype : "";
  const secondaryArchetype =
    typeof diagnosticData.secondaryArchetype === "string" ? diagnosticData.secondaryArchetype : "";
  const archetypeMeaning =
    typeof diagnosticData.archetypeMeaning === "string" ? diagnosticData.archetypeMeaning : "";
  const archetypeIcon = typeof diagnosticData.archetypeIcon === "string" ? diagnosticData.archetypeIcon : "";
  const positioningMessaging =
    typeof diagnosticData.positioningMessagingFramework === "string"
      ? diagnosticData.positioningMessagingFramework
      : typeof diagnosticData.topOpportunity === "string"
        ? diagnosticData.topOpportunity
        : "";
  const topOpportunity =
    typeof diagnosticData.topOpportunity === "string" ? diagnosticData.topOpportunity : "";
  const targetAudience =
    typeof diagnosticData.targetAudience === "string" ? diagnosticData.targetAudience : "";
  const audienceShort = firstNWords(targetAudience, 8).toLowerCase() || "decision-makers";
  const companyName =
    typeof diagnosticData.companyName === "string" && diagnosticData.companyName
      ? diagnosticData.companyName
      : "Your Brand";
  const industry =
    typeof diagnosticData.industry === "string" && diagnosticData.industry
      ? diagnosticData.industry
      : "your market";
  const primaryPillar =
    typeof diagnosticData.primaryPillar === "string" && diagnosticData.primaryPillar
      ? diagnosticData.primaryPillar
      : "Messaging";
  const topStrength =
    Array.isArray(diagnosticData.topStrengths) && diagnosticData.topStrengths.length > 0
      ? String(diagnosticData.topStrengths[0])
      : "strategic clarity";
  const topGap =
    Array.isArray(diagnosticData.topGaps) && diagnosticData.topGaps.length > 0
      ? String(diagnosticData.topGaps[0])
      : "message consistency";
  const channelPlans =
    (diagnosticData.channelPlans as Record<string, string> | undefined) ?? {};
  const topStrengths =
    Array.isArray(diagnosticData.topStrengths) && diagnosticData.topStrengths.length > 0
      ? diagnosticData.topStrengths.slice(0, 3).map((item) => String(item))
      : [topStrength, "Positioning clarity", "Strategic direction"];
  const topGaps =
    Array.isArray(diagnosticData.topGaps) && diagnosticData.topGaps.length > 0
      ? diagnosticData.topGaps.slice(0, 3).map((item) => String(item))
      : [topGap, "Proof density", "Channel consistency"];
  const personaAtlasSummary =
    typeof diagnosticData.personaAtlasSummary === "string" && diagnosticData.personaAtlasSummary
      ? diagnosticData.personaAtlasSummary
      : `${companyName} should define a primary customer profile for ${audienceShort}, plus 1-2 secondary buyer roles. For each: capture jobs-to-be-done, top objections, decision criteria, and preferred channels.`;
  const buyerJourneySummary =
    typeof diagnosticData.buyerJourneySummary === "string" && diagnosticData.buyerJourneySummary
      ? diagnosticData.buyerJourneySummary
      : `Map the journey from awareness to decision for ${audienceShort}. For each stage, define core question, required proof, channel touchpoint, and stage-exit next step.`;
  const competitiveMatrixSummary =
    typeof diagnosticData.competitiveMatrixSummary === "string" &&
    diagnosticData.competitiveMatrixSummary
      ? diagnosticData.competitiveMatrixSummary
      : `Track top alternatives in ${industry}, their strongest claim, and where ${companyName} wins. Use one clear displacement narrative tied to ${primaryPillar.toLowerCase()} outcomes.`;
  const channelStrategySummary =
    typeof diagnosticData.channelStrategySummary === "string"
      ? diagnosticData.channelStrategySummary
      : typeof diagnosticData.pillarDependencyExplanation === "string"
        ? diagnosticData.pillarDependencyExplanation
        : "";
  const strategicPriorities = (
    (diagnosticData.strategicPriorities as Array<{ rank?: number; title?: string; pillar?: string }> | undefined) ??
    []
  )
    .slice(0, 5)
    .map((item, index) => ({
      rank: typeof item.rank === "number" ? item.rank : index + 1,
      title: typeof item.title === "string" ? item.title : "Priority",
      pillar: typeof item.pillar === "string" ? item.pillar : "Brand",
    }));
  const firstPriority = strategicPriorities[0]?.title || `Improve ${topGap.toLowerCase()}`;
  const secondPriority =
    strategicPriorities[1]?.title || `Scale ${topStrength.toLowerCase()} across channels`;
  const channelDirection = [
    channelPlans.email,
    channelPlans["content-seo"],
    channelPlans.social,
    channelPlans.website,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .slice(0, 2)
    .join(" ");
  const spendContext =
    diagnosticData.spendRecommendationContext &&
    typeof diagnosticData.spendRecommendationContext === "object"
      ? (diagnosticData.spendRecommendationContext as {
          currentMonthlySpend?: number;
          budgetConstrainedPlan?: { focus?: string; allocation?: Array<{ channel?: string; percent?: number }> };
          growthRoadmap?: { phases?: Array<{ phase?: string; monthlySpend?: number; milestone?: string }> };
          confidence?: string;
        })
      : null;
  const spendPlanSummary = spendContext
    ? [
        spendContext.budgetConstrainedPlan?.focus || "Align channel strategy to current spend before scaling.",
        Array.isArray(spendContext.budgetConstrainedPlan?.allocation)
          ? `Current allocation: ${spendContext.budgetConstrainedPlan!.allocation!
              .map((a) => `${a.percent ?? 0}% ${String(a.channel || "channel").replace(/_/g, " ")}`)
              .join(", ")}.`
          : "",
        Array.isArray(spendContext.growthRoadmap?.phases)
          ? `Phased roadmap: ${spendContext.growthRoadmap!.phases!
              .map((p) => `${String(p.phase || "").replace("_", " ")} ~$${(p.monthlySpend || 0).toLocaleString()}`)
              .join(" → ")}.`
          : "",
        spendContext.confidence ? `Confidence: ${spendContext.confidence}.` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const strategySections: Array<{
    id: string;
    label: string;
    summary: string;
    body: string;
    workbookSectionId: WorkbookSectionId;
  }> = [
    {
      id: "positioning",
      label: "Positioning Statement",
      summary: "Your market position and differentiation baseline.",
      body:
        positioningMessaging ||
        `${companyName} should position around ${primaryPillar.toLowerCase()} leadership for ${audienceShort}. Emphasize your edge in ${topStrength.toLowerCase()} while directly resolving ${topGap.toLowerCase()} in ${industry}.`,
      workbookSectionId: "positioning-statement",
    },
    {
      id: "messaging-pillars",
      label: "Messaging Pillars",
      summary: "Core claims and proof points to repeat across channels.",
      body:
        positioningMessaging ||
        `Build 3-5 pillars anchored on ${primaryPillar.toLowerCase()}. For ${companyName}, each pillar should include a clear claim, one proof artifact, and one outcome statement tied to ${firstPriority.toLowerCase()}.`,
      workbookSectionId: "messaging-framework",
    },
    {
      id: "archetype-voice",
      label: "Archetype & Voice System",
      summary: "How the brand should sound and show up.",
      body:
        archetypeMeaning ||
        `Use the ${archetype || "primary"} archetype as the voice baseline. Keep language ${topStrength.toLowerCase()} and practical, and avoid broad claims that weaken trust with ${audienceShort}.`,
      workbookSectionId: "voice-attributes",
    },
    {
      id: "icp-personas",
      label: "Audience Profiles",
      summary: "Who this strategy is for and how they decide.",
      body:
        targetAudience ||
        `${companyName}'s highest-fit profile is ${targetAudience || audienceShort}. Define primary buyer, influencer, and blocker roles so your offer and proof sequence match real buying behavior in ${industry}.`,
      workbookSectionId: "audience-profile",
    },
    {
      id: "persona-atlas",
      label: "Customer Profiles",
      summary: "Clear role-based customer profiles with needs, concerns, and decision roles.",
      body: personaAtlasSummary,
      workbookSectionId: "persona-atlas",
    },
    {
      id: "buyer-journey-map",
      label: "Customer Decision Journey",
      summary: "Step-by-step journey cues that align messaging and channel execution.",
      body: buyerJourneySummary,
      workbookSectionId: "buyer-journey-map",
    },
    {
      id: "competitive-matrix",
      label: "Competitive Landscape Matrix",
      summary: "Competitive claims, overlap, and counter-positioning strategy.",
      body: competitiveMatrixSummary,
      workbookSectionId: "competitive-landscape-matrix",
    },
    {
      id: "channel-strategy",
      label: "Channel Strategy",
      summary: "Where each core message should show up.",
      body:
        channelStrategySummary ||
        channelDirection ||
          `Activate ${primaryPillar.toLowerCase()} through a defined channel mix: email for follow-up, SEO/AI search for intent capture, social for authority, and site conversion pages for pipeline movement.`,
      workbookSectionId: "channel-notes",
    },
    {
      id: "spend-roadmap",
      label: "Budget-Aligned Spend Roadmap",
      summary: "Current-budget plan plus a phased path to hit growth goals.",
      body:
        spendPlanSummary ||
        `Allocate current spend by channel role first (demand capture, follow-up, conversion), then scale in 30/60/90-day phases tied to success check unlocks. Increase budget only when conversion efficiency and pipeline quality are stable.`,
      workbookSectionId: "channel-notes",
    },
    {
      id: "execution-priorities",
      label: "Strategic Priorities",
      summary: "Priority sequence that sets up activation.",
      body:
        strategicPriorities.length > 0
          ? strategicPriorities
              .map((item) => `${item.rank}. ${item.title} (${item.pillar})`)
              .join("\n")
          : topOpportunity ||
            `1. ${firstPriority}\n2. ${secondPriority}\n3. Convert ${primaryPillar.toLowerCase()} direction into owner-assigned 90-day execution milestones.`,
      workbookSectionId: "action-plan",
    },
  ];
  const strategySectionsVisible = filterStrategySections(productTier, strategySections);
  const strategyMenuItems = strategySectionsVisible.map((section) => ({
    id: `strategy-${section.id}`,
    label: section.label,
  }));
  /** Panel tints only — rails/icons/callouts use Wunderbar navy + brand blue for cohesion. */
  const sectionTheme: Record<string, { tint: string }> = {
    positioning: { tint: "#F7FBFF" },
    "messaging-pillars": { tint: "#F5F9FF" },
    "archetype-voice": { tint: "#F0F9FF" },
    "icp-personas": { tint: "#F5F8FF" },
    "persona-atlas": { tint: "#F7FBFF" },
    "buyer-journey-map": { tint: "#F3FAFC" },
    "competitive-matrix": { tint: "#F8FAFC" },
    "channel-strategy": { tint: "#F0F9FF" },
    "spend-roadmap": { tint: "#F8FBFF" },
    "execution-priorities": { tint: "#F5F9FF" },
  };
  const sectionGuidance: Record<
    string,
    { doText: string; dontText: string; example: string; title: string }
  > = {
    positioning: {
      title: "Positioning checklist",
      doText: `Say clearly why ${companyName} is the right fit for ${audienceShort}. Tie it to one main promise about ${primaryPillar.toLowerCase()}.`,
      dontText: "List services without saying what makes you different.",
      example: `${companyName} helps ${audienceShort} fix ${topGap.toLowerCase()} with a ${primaryPillar.toLowerCase()} plan that turns into real leads and revenue.`,
    },
    "messaging-pillars": {
      title: "Messaging usage",
      doText: "Give each campaign one main idea, one proof point, and one clear next step.",
      dontText: "Mix several promises in one block with no proof.",
      example: `Pillar: ${primaryPillar}. Claim: faster decision confidence. Proof: diagnostic findings + implementation roadmap. Next step: Review your 90-day activation sequence.`,
    },
    "archetype-voice": {
      title: "Voice quality controls",
      doText: "Write in short, confident sentences. Tell people what to do next.",
      dontText: "Use fancy words that sound good but do not help someone decide.",
      example: `Instead of "we transform brands," use "we prioritize ${firstPriority.toLowerCase()} first so teams can execute with less friction."`,
    },
    "icp-personas": {
      title: "Audience specificity",
      doText: "Name who buys, who influences, and what worries them. Note what makes them ready to act.",
      dontText: "Treat everyone the same with one generic button or offer.",
      example: `Best-fit customer: ${audienceShort}. Trigger: stalled growth. Top worry: execution confidence. Proof they need: clear phased roadmap + who owns each step.`,
    },
    "persona-atlas": {
      title: "Persona depth",
      doText: "For each role, write the job they need done, what blocks them, and what proof they need.",
      dontText: "Use only age and title with no story about how they buy.",
      example: `Each profile lists role, what success looks like, what triggered the search, proof needed before a call, and the best next step.`,
    },
    "buyer-journey-map": {
      title: "Journey sequencing",
      doText: "For each step, pick one goal, one message, and one next step.",
      dontText: "Ask for a big commitment in the first touch before you have earned trust.",
      example: `Early: show the problem. Middle: show your method + proof. Late: show the plan, timeline, and owner.`,
    },
    "competitive-matrix": {
      title: "Competitive framing",
      doText: `Show how ${companyName} wins on real results and reliable follow-through.`,
      dontText: "Say you are faster or better with no proof.",
      example: `One line you can use: "Where others stop at ideas, ${companyName} ships owner-ready work tied to 90-day milestones."`,
    },
    "channel-strategy": {
      title: "Channel discipline",
      doText: "Give each channel one job and one simple way to know if it works.",
      dontText: "Post the same copy everywhere with no change for where the reader is in the journey.",
      example: `Email: follow up and build trust. Social: show authority. Website: make the next step obvious. Search: answer what people are already looking for.`,
    },
    "spend-roadmap": {
      title: "Spend alignment",
      doText: "Raise budget only after you see steady quality leads and clear results.",
      dontText: "Pour money into ads before your message and landing pages convert well.",
      example: `First: steady results on current spend. Then: grow the channels that bring the best qualified leads.`,
    },
    "execution-priorities": {
      title: "Priority management",
      doText: "Pick order by what must happen first and what moves the business most.",
      dontText: "Run many projects at once with no clear owner.",
      example: `Suggested order for ${companyName}: 1) ${firstPriority} 2) ${secondPriority} 3) weekly check-ins with owners until it ships.`,
    },
  };
  const expandedContent: Record<
    string,
    {
      whyItMatters: string;
      actions: string[];
      successMetric: string;
      risk: string;
    }
  > = {
    positioning: {
      whyItMatters:
        "Clear positioning helps people understand fit fast. That drives more sign-ups and shorter sales cycles.",
      actions: [
        "Pick one main category and one clear difference. Use both on your main pages.",
        "Rewrite your homepage hero and service opener with the same simple line.",
        "Show the line to five people outside your team. Fix anything they do not get in one read.",
      ],
      successMetric: "A new visitor can say what makes you different in one short sentence.",
      risk: "If you stay vague, clearer competitors will win the first impression.",
    },
    "messaging-pillars": {
      whyItMatters:
        "Pillars turn strategy into repeatable messages your whole team can reuse.",
      actions: [
        "Write 3–5 pillars. Each has one claim, one proof, and one outcome.",
        "Match each live campaign to one pillar. Remove mixed messages.",
        "Save proof snippets sales, email, and web can paste in.",
      ],
      successMetric: "Every big piece of content maps to one pillar and one clear next step.",
      risk: "Without pillars, messages drift and results get weaker over time.",
    },
    "archetype-voice": {
      whyItMatters: "A steady voice builds trust. People decide faster when you sound like one brand.",
      actions: [
        "List words to use, words to skip, and tone by channel.",
        "Check voice on high-impact pages before they go live.",
        "Train the team with examples tied to today’s priorities.",
      ],
      successMetric: "Copy feels like the same brand across channels with few edits.",
      risk: "Mixed tone hurts trust even when the strategy is strong.",
    },
    "icp-personas": {
      whyItMatters:
        "When you know your best-fit customer, you attract stronger leads and waste less budget.",
      actions: [
        "Name the buyer, influencer, and blocker for your main customer type.",
        "List top objections and what proof each person needs.",
        "Match next steps to how ready they are to buy.",
      ],
      successMetric: "More qualified leads and fewer “bad fit” sales calls.",
      risk: "Broad targeting raises cost and fills the pipeline with weak leads.",
    },
    "persona-atlas": {
      whyItMatters: "Rich profiles turn guesses into clear messages and channel picks.",
      actions: [
        "For each role, write the job to be done, trigger, worry, and proof that closes doubt.",
        "Tag campaigns by profile so you can see what works.",
        "Refresh profiles each quarter from sales and delivery notes.",
      ],
      successMetric: "Targeted campaigns beat generic ones on lead quality.",
      risk: "Stale profiles lead to wrong messages and wasted work.",
    },
    "buyer-journey-map": {
      whyItMatters: "A clear journey connects early education to the final yes.",
      actions: [
        "For each step, set one goal, one content type, and one next step.",
        "Set rules for when marketing passes a lead to sales.",
        "Track simple signals that show someone moved to the next step.",
      ],
      successMetric: "Fewer people drop off between follow-up and decision.",
      risk: "Gaps between steps slow deals and lose revenue.",
    },
    "competitive-matrix": {
      whyItMatters:
        "When buyers compare options, clear answers protect your price and win rate.",
      actions: [
        "List top alternatives, their strongest claim, and your counter in plain words.",
        "Write short replies to common objections by profile and stage.",
        "Put comparison proof on sales pages and late-stage assets.",
      ],
      successMetric: "You win more deals when a competitor is named. Less pressure to discount.",
      risk: "If you stay silent, buyers pick what feels safer.",
    },
    "channel-strategy": {
      whyItMatters: "Each channel works best when it matches what the reader needs right now.",
      actions: [
        "Give each channel one job and one simple score to watch.",
        "Plan content by stage, not by how many posts you can ship.",
        "Review results monthly by channel job.",
      ],
      successMetric: "You can see how each channel helps move leads forward.",
      risk: "Random posting raises spend without clear impact.",
    },
    "spend-roadmap": {
      whyItMatters: "Growing spend with care keeps results strong and risk low.",
      actions: [
        "Lock in results on the best channels first.",
        "Write rules for when it is safe to spend more.",
        "Plan 30/60/90 day spend with expected outcomes in plain numbers.",
      ],
      successMetric: "Higher spend only happens when leads and revenue move the right way.",
      risk: "Scaling too early wastes money on weak pages and messages.",
    },
    "execution-priorities": {
      whyItMatters: "Order matters. Good sequencing turns plans into shipped work.",
      actions: [
        "Rank work by what must happen first and what moves the business most.",
        "Give each item an owner, due date, and success check.",
        "Meet weekly to remove blockers.",
      ],
      successMetric: "Top priorities finish on time and key numbers improve within 90 days.",
      risk: "Too many parallel projects dilutes focus and slows results.",
    },
  };
  const doDontGuidance: Record<string, { do: string[]; dont: string[] }> = {
    positioning: {
      do: [
        "Use one simple category line on your site, deck, and outreach.",
        "Start with the buyer’s problem and the outcome they want.",
        "Show one proof point near the top of the page.",
      ],
      dont: [
        "Don't change your positioning line in every channel.",
        "Don't stack several offers in the main hero.",
        "Don't use empty words like “innovative” with no proof.",
      ],
    },
    "messaging-pillars": {
      do: [
        "Use one pillar per asset to avoid mixed intent.",
        "Include one claim, one proof, and one clear next step in each message block.",
        "Create reusable examples for sales, web, and email.",
      ],
      dont: [
        "Don't publish a pillar claim with no proof.",
        "Don't ask for a sale in the same block where you are still introducing the problem.",
        "Don't tweak channel copy until the base pillar wording is stable.",
      ],
    },
    "archetype-voice": {
      do: [
        "Keep tone confident, practical, and specific.",
        "Use short, decision-oriented language in high-intent moments.",
        "Use the same patterns for openers, transitions, and next steps.",
      ],
      dont: [
        "Don't use vague brand language on pages where people decide.",
        "Don't sound like a different brand on social vs sales.",
        "Don't use hype with no detail on how you deliver.",
      ],
    },
    "icp-personas": {
      do: [
        "Separate primary buyer, influencer, and blocker roles.",
        "Capture objections and proof needs by role.",
        "Match next steps to how ready they are to buy.",
      ],
      dont: [
        "Don't treat every inbound lead as the same segment.",
        "Don't guess what buyers want without talking to sales.",
        "Don't use one offer for every stage of the journey.",
      ],
    },
    "persona-atlas": {
      do: [
        "For each profile, write the job to be done and what triggered the search.",
        "Note preferred channels and content types.",
        "Update profiles each quarter with real call notes.",
      ],
      dont: [
        "Don't stop at age and job title.",
        "Don't skip worries and objections.",
        "Don't lose old versions when you update a profile.",
      ],
    },
    "buyer-journey-map": {
      do: [
        "Give each step one goal and one clear next step.",
        "Say what proof they need to move forward.",
        "Track simple signals that show progress.",
      ],
      dont: [
        "Don't skip the middle steps where people compare options.",
        "Don't send unqualified leads to sales.",
        "Don't reuse the same asset for every step.",
      ],
    },
    "competitive-matrix": {
      do: [
        "Write short replies you can use when a competitor comes up.",
        "Say where you win and where you are weaker.",
        "Add comparison proof to late-stage pages and decks.",
      ],
      dont: [
        "Don't attack competitors with fear tactics.",
        "Don't state claims you cannot prove.",
        "Don't leave sales without approved wording.",
      ],
    },
    "channel-strategy": {
      do: [
        "Give each channel one job and one simple score to watch.",
        "Match format to the channel while keeping the same core story.",
        "Review channel results monthly by role in the journey.",
      ],
      dont: [
        "Don't paste identical copy across every channel.",
        "Don't chase likes if your goal is sales.",
        "Don't open a new channel if you cannot staff it.",
      ],
    },
    "spend-roadmap": {
      do: [
        "Raise budget only after leads and conversions look steady.",
        "Plan spend in phases with simple targets you can check.",
        "Put more money into channels that bring the best-fit leads.",
      ],
      dont: [
        "Don't spend more to fix weak messaging or landing pages.",
        "Don't judge paid ads only by clicks if your goal is sales.",
        "Don't split the budget across too many small tests at once.",
      ],
    },
    "execution-priorities": {
      do: [
        "Give each priority an owner, due date, and simple success check.",
        "Meet weekly to clear blockers.",
        "Order work by what must finish first, not only what feels urgent.",
      ],
      dont: [
        "Don't launch every project at the same time.",
        "Don't count planning as done until work ships.",
        "Don't hide who needs what from another team to move forward.",
      ],
    },
  };

  const suiteProgressHint = getSuiteProgressHint(productTier, "strategy");

  return (
    <TabPageWithSidebar navTitle="Strategy" navItems={strategyMenuItems} className="strategy-tab-content">
      <div
        className="tab-action-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: BLUE,
              marginBottom: 8,
            }}
          >
            Strategy
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
            {companyName} Brand Platform
          </h2>
          {suiteProgressHint ? (
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0369A1",
                lineHeight: 1.55,
                maxWidth: 720,
                margin: "0 0 10px",
              }}
            >
              {suiteProgressHint}
            </p>
          ) : null}
          <p style={{ fontSize: 15, color: MID_GRAY, lineHeight: 1.5, maxWidth: 620, margin: 0 }}>
            What your diagnostic means and what to do strategically. Reference this before any
            external communication, agency briefing, or hiring decision.
          </p>
          <p style={{ fontSize: 12, color: MID_GRAY, lineHeight: 1.5, maxWidth: 720, margin: "8px 0 0" }}>
            Panels below match your{" "}
            {productTier === "snapshot"
              ? "free Snapshot"
              : productTier === "snapshot-plus"
                ? "Snapshot+"
                : productTier === "blueprint"
                  ? "Blueprint"
                  : "Blueprint+"}{" "}
            entitlement. Persona Atlas and competitive matrix appear at Blueprint and above.
          </p>
          <p style={{ fontSize: 12, color: MID_GRAY, lineHeight: 1.5, maxWidth: 720, margin: "8px 0 0" }}>
            Open Workbook to refine sections in depth. Full PDF export sets unlock from Blueprint (Downloads tab).
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginBottom: 8 }}>
        {strategySectionsVisible.map((section) => (
          <ReportPanel
            key={section.id}
            id={`strategy-${section.id}`}
            style={{
              padding: "20px 22px",
              scrollMarginTop: 120,
            }}
            accentColor={SUITE_PANEL_RAIL}
            tint={sectionTheme[section.id]?.tint ?? "#F8FBFF"}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <div>
                {(() => {
                  const iconTokenMap: Record<string, string> = {
                    positioning: "positioning",
                    "messaging-pillars": "messaging",
                    "archetype-voice": "archetype",
                    "icp-personas": "audience",
                    "persona-atlas": "persona",
                    "buyer-journey-map": "journey",
                    "competitive-matrix": "competitive",
                    "channel-strategy": "channel",
                    "spend-roadmap": "spend",
                    "execution-priorities": "priorities",
                  };
                  return (
                    <ReportPanelTitle
                      icon={<SectionGlyph token={iconTokenMap[section.id] || "positioning"} size={20} color={BLUE} />}
                      title={section.label}
                      subtitle={section.summary}
                      accentColor={BLUE}
                    />
                  );
                })()}
              </div>
              <button
                onClick={() => onEditInWorkbook(section.workbookSectionId)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 7,
                  border: `1px solid ${BORDER}`,
                  background: "#F8FBFF",
                  color: NAVY,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Lato', sans-serif",
                }}
              >
                Edit in Workbook
              </button>
            </div>
            <p style={{ margin: 0, whiteSpace: "pre-line", fontSize: 14, color: "#2D3A4A", lineHeight: 1.6 }}>
              {section.body}
            </p>
            {section.id === "buyer-journey-map" && (
              <JourneyMapVisual
                stages={[
                  { label: "Aware", focus: `Surface ${primaryPillar.toLowerCase()} insight for ${audienceShort}.` },
                  { label: "Consider", focus: "Deliver framework and proof aligned to top objections." },
                  { label: "Decide", focus: `Present implementation plan tied to ${firstPriority.toLowerCase()}.` },
                  { label: "Commit", focus: "Provide owner timeline and clear conversion action." },
                ]}
              />
            )}
            {section.id === "channel-strategy" && (
              <FunnelVisual
                steps={[
                  { label: "Top Funnel", detail: "Authority content and perspective-led discovery messaging." },
                  { label: "Middle Stage", detail: "Proof-backed follow-up and objection handling by segment." },
                  { label: "Decision Stage", detail: "Conversion pages and clear next-step sequencing." },
                  { label: "Post-Conversion", detail: "Activation onboarding and momentum reinforcement." },
                ]}
              />
            )}
            {section.id === "competitive-matrix" && (
              <SwotVisual
                strengths={topStrengths}
                weaknesses={topGaps}
                opportunities={[
                  `Scale ${primaryPillar.toLowerCase()} messaging consistency.`,
                  `Operationalize ${firstPriority.toLowerCase()} across channels.`,
                ]}
                threats={[
                  "Competitors with clearer proof architecture.",
                  "Message dilution from inconsistent execution.",
                ]}
              />
            )}
            {expandedContent[section.id] && (
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <ReportCallout label="Why this matters" accentColor={BLUE}>
                  {expandedContent[section.id].whyItMatters}
                </ReportCallout>
                <div
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    background: "#FFFFFF",
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: BLUE,
                    }}
                  >
                    90-day actions
                  </p>
                  <div style={{ display: "grid", gap: 6 }}>
                    {expandedContent[section.id].actions.map((action, index) => (
                      <p key={`${section.id}-action-${index}`} style={{ margin: 0, fontSize: 13, color: "#243447", lineHeight: 1.55 }}>
                        {index + 1}. {action}
                      </p>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ padding: "10px 12px", borderRadius: 6, background: "#E8F6FE", borderLeft: `3px solid ${BLUE}` }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Success Metric
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: 13, color: "#243447", lineHeight: 1.5 }}>
                      {expandedContent[section.id].successMetric}
                    </p>
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: 6, background: "#F1F5F9", borderLeft: "3px solid #94A3B8" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Risk if ignored
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                      {expandedContent[section.id].risk}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {sectionGuidance[section.id] && (
              <ReportCallout label="Strategic Application" accentColor={BLUE}>
                <PersonalizedGuidanceCard
                  title={sectionGuidance[section.id].title}
                  doText={sectionGuidance[section.id].doText}
                  dontText={sectionGuidance[section.id].dontText}
                  example={sectionGuidance[section.id].example}
                />
              </ReportCallout>
            )}
            {doDontGuidance[section.id] && (
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: "10px 12px", borderRadius: 6, background: "#E8F6FE", borderLeft: `3px solid ${BLUE}` }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Do
                  </p>
                  <div style={{ display: "grid", gap: 5, marginTop: 6 }}>
                    {doDontGuidance[section.id].do.map((item, index) => (
                      <p key={`${section.id}-do-${index}`} style={{ margin: 0, fontSize: 13, color: "#243447", lineHeight: 1.5 }}>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "10px 12px", borderRadius: 6, background: "#F1F5F9", borderLeft: "3px solid #94A3B8" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Don&apos;t
                  </p>
                  <div style={{ display: "grid", gap: 5, marginTop: 6 }}>
                    {doDontGuidance[section.id].dont.map((item, index) => (
                      <p key={`${section.id}-dont-${index}`} style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ReportPanel>
        ))}
      </div>

      <FoundationExtras slot="signals" data={diagnosticData as any} />

      {!isFree && archetype && (
        <section
          id="strategy-archetype-profile"
          style={{
            marginTop: 24,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            background: "linear-gradient(180deg, #FFFFFF 0%, #FBFDFF 100%)",
            padding: "18px 20px",
            scrollMarginTop: 120,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
            Archetype Profile
          </p>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, margin: "0 0 6px" }}>
            {archetype}
            {secondaryArchetype ? ` + ${secondaryArchetype}` : ""}
          </h3>
          <div style={{ marginBottom: 8 }}>
            <BrandArchetypeIcon archetype={archetype} size={58} />
          </div>
          {archetypeMeaning && (
            <p style={{ margin: 0, fontSize: 14, color: MID_GRAY, lineHeight: 1.55 }}>{archetypeMeaning}</p>
          )}
        </section>
      )}

      <FoundationExtras slot="revenueImpact" data={diagnosticData as any} />

      {positioningMessaging ? (
        <section
          id="strategy-positioning-framework"
          style={{
            marginTop: 24,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            background: "linear-gradient(180deg, #FFFFFF 0%, #FBFDFF 100%)",
            padding: "18px 20px",
            scrollMarginTop: 120,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
            Positioning & Messaging Framework
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#2D3A4A", lineHeight: 1.6 }}>
            {positioningMessaging}
          </p>
        </section>
      ) : null}

      <FoundationExtras slot="synthesis" data={diagnosticData as any} />
    </TabPageWithSidebar>
  );
}
