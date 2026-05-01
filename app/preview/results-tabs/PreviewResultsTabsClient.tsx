"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ResultsTabsShell from "@/components/results/ResultsTabsShell";
import {
  parseResultsTabId,
  type ActivationPlanSectionId,
  type ResultsTab,
} from "@/components/results/tabConfig";
import {
  SUITE_CHIP_CARD_STYLE,
  SUITE_CONTENT_MAX_PX,
  SUITE_SECTION_KICKER_CLASS,
} from "@/components/results/suiteBrandTokens";
import { ResultsHeroSection } from "@/src/components/results/ResultsHeroSection";
import FoundationBlueprintContent from "@/components/tabs/FoundationBlueprintContent";
import TabSectionMenu from "@/components/results/TabSectionMenu";
import { ResultsBlockSkeleton } from "@/components/results/ResultsBlockSkeleton";
import { ImplementationIntro } from "@/components/SnapshotPlus/ImplementationIntro";
import { buildResultsTabNavItems } from "@/lib/results/buildResultsTabNavItems";
import { TAB_SECTION_NAV_HINT_CHIPS_ONLY } from "@/lib/copy/resultsSuiteGuidance";
import { ReportTierUpgradeCTAs } from "@/components/results/ReportTierUpgradeCTAs";

const PillarBreakdown = dynamic(
  () => import("@/components/PillarBreakdown").then((m) => ({ default: m.PillarBreakdown })),
  { loading: () => <ResultsBlockSkeleton label="Loading pillar analysis" /> },
);

const ContextCoverageMeter = dynamic(
  () => import("@/src/components/results/ContextCoverageMeter").then((m) => ({ default: m.ContextCoverageMeter })),
  { loading: () => <ResultsBlockSkeleton label="Loading context coverage" /> },
);

const ResultsSuiteVisualSummary = dynamic(
  () =>
    import("@/components/results/charts/ResultsSuiteVisualSummary").then((m) => ({
      default: m.ResultsSuiteVisualSummary,
    })),
  { loading: () => <ResultsBlockSkeleton label="Loading charts" /> },
);
import type { PillarKey } from "@/src/types/pillars";
import { computeWeightedBrandAlignmentScore } from "@/src/lib/pillarWeights";
import type { WorkbookSectionId } from "@/lib/workbookTypes";
import { ensurePaidMediaChannelsMinimum } from "@/lib/activation/paidMediaPlanFields";
import {
  getPreviewActivationEngineMerge,
  previewActivationContent,
  previewActivationScheduleRows,
  previewActivationStrategicPriorities,
  previewAudiencePersonaDefinition,
  previewIcpConversionIntelligenceFramework,
  previewPaidMediaStrategy,
  previewPersonaDrivenSegmentation,
} from "@/app/preview/results-tabs/previewActivationMockData";

const pillarScores: Record<PillarKey, number> = {
  positioning: 16,
  messaging: 14,
  visibility: 11,
  credibility: 13,
  conversion: 12,
};

const previewWunderBrandScore = computeWeightedBrandAlignmentScore(pillarScores);

const pillarInsights: Record<PillarKey, string> = {
  positioning:
    "Positioning is clear internally, but external copy does not always reinforce the same promise.",
  messaging:
    "Core messages are solid, but proof points and outcomes are not consistently attached to each claim.",
  visibility:
    "You are active in key channels, but publication themes are fragmented and dilute authority signals.",
  credibility:
    "Trust signals exist, but they are not always visible at the moments prospects are deciding.",
  conversion:
    "Conversion paths are present, but nurture flow and CTA sequencing can improve lead quality and speed.",
};

const strategicPriorities = previewActivationStrategicPriorities;
const scheduleRows = previewActivationScheduleRows;
const previewEngine = getPreviewActivationEngineMerge("Acme Co");

const diagnosticData = {
  companyName: "Acme Co",
  businessName: "Acme Co",
  reportId: "preview-results-tabs",
  userEmail: "preview@wunderbar.ai",
  resultsDeliveredAt: "2026-03-05T17:30:00.000Z",
  industry: "B2B Services",
  targetAudience: "Founder-led and growth-stage service businesses",
  secondaryAudience: "Marketing and growth operators responsible for campaign execution",
  tertiaryAudience: "Sales leaders and enablement stakeholders influencing final vendor selection",
  primaryArchetype: "The Sage",
  secondaryArchetype: "The Explorer",
  archetypeMeaning: "Insight-led positioning with practical exploration of better ways to grow.",
  archetypeIcon: "S",
  topStrengths: ["Strategic clarity", "Market insight", "Advisory credibility"],
  topGaps: ["Visibility consistency", "Proof density", "Nurture flow"],
  voiceAttributes: ["Clear", "Confident", "Insightful", "Practical"],
  productTier: "blueprint-plus",
  contextCoverage: 68,
  hasPriorityActions: true,
  wunderBrandScore: previewWunderBrandScore,
  pillarScores,
  pillarInsights,
  primaryPillar: "Visibility",
  upstreamPillar: "Messaging",
  strategicPriorities,
  scheduleRows,
  competitiveVulnerability: {
    severity: "medium" as const,
    summary: "Competitors with tighter publishing cadence can win awareness despite weaker offers.",
    implication: "Visibility inconsistency is creating avoidable share-of-voice loss in high-intent moments.",
    recommendation: "Consolidate weekly content into one pillar-led channel rhythm.",
  },
  marketingSpendEfficiency: {
    severity: "medium" as const,
    summary: "Spend is generating traffic, but conversion efficiency is uneven by channel.",
    implication: "Message-channel mismatch increases cost per qualified lead.",
    recommendation: "Map each campaign CTA to one message pillar and one audience intent stage.",
  },
  revenueImpactStatement:
    "Improving visibility and conversion alignment can raise qualified pipeline efficiency over the next 90 days.",
  brandHealthVerdict:
    "Acme Co has a strong strategic base but inconsistent external execution across key growth channels.",
  positioningMessagingFramework:
    "Use one category promise, three proof-backed message pillars, and channel-specific CTA sequencing.",
  topOpportunity:
    "Tighten visibility strategy around a single message architecture to compound authority and demand.",
  synthesisPoints: [
    { label: "What to protect", content: "Strong positioning clarity and advisory tone." },
    { label: "What to prioritize", content: "Visibility consistency and proof-led messaging." },
    { label: "What unlocks growth", content: "Aligned channel plan + refined conversion pathways." },
  ],
  pillarDependencyExplanation:
    "Visibility gains depend on tighter messaging discipline so every channel reinforces the same narrative.",
  strategicOfferContext: {
    methodologyFraming:
      "Jobs to be done (JTBD) for the economic buyer, explicit scope boundaries, leading indicators with review cadence, and channel alignment so go-to-market (GTM) stays coherent.",
    jobStatement:
      "When pipeline quality is uncertain, I want one narrative spine and named checkpoints, so I can defend spend to finance and sales without another generic strategy deck.",
    primaryOffer: {
      name: "90-Day Narrative & Channel Operating Plan",
      offerType: "service",
      oneLinePitch:
        "A fixed-scope diagnostic plus a 90-day rollout map with owners, weekly leading signals, and channel copy that all point to the same offer.",
      whoItsFor:
        "Founder-led and marketing-led B2B services firms ($2–15M ARR) running multi-channel demand but seeing flat SQL quality.",
      substitutesConsidered:
        "Full-service agencies, freelance strategists, in-house playbooks from peer networks, and DIY templates.",
      whyTheySwitch:
        "They need shipped artifacts and a single primary offer story—not more campaigns that disagree with the homepage.",
    },
    secondaryOffers: [
      { name: "Executive narrative audit (2-week)", role: "entry" },
      { name: "RevOps + messaging alignment workshop", role: "upsell" },
    ],
    painsRelieved: [
      "Message-market drift across LinkedIn, outbound, and the site.",
      "Proof buried on About instead of beside the late-funnel ask.",
      "Marketing and sales using different definitions of a qualified opportunity.",
    ],
    outcomesEnabled: [
      "One quotable primary offer and CTA stack for email, social, paid, and sales.",
      "Weekly leading signals tied to narrative consistency and SQL quality.",
      "Explicit out-of-scope guardrails so delivery stays credible.",
    ],
    scopeIn: [
      "Positioning spine, message pillars, channel examples, and nurture hooks for the primary offer.",
      "90-day phased priorities with owners and review cadence.",
    ],
    scopeOut: [
      "Guaranteed revenue or CPL targets.",
      "Hands-on media buying execution inside ad platforms.",
      "Legal, compliance, or employment brand policy.",
    ],
    leadingSuccessSignals: [
      {
        signal: "Share of homepage + outbound + deck using the same primary-offer headline family",
        reviewCadence: "weekly",
        whyItMatters: "Leading indicator that narrative drift is closing before SQL mix improves.",
      },
      {
        signal: "MQL→SQL rate and stage velocity on the named ICP segment",
        reviewCadence: "monthly",
        whyItMatters: "Ties the offer story to revenue-facing outcomes without overfitting to vanity reach.",
      },
    ],
    channelExecutionAlignment:
      "Email nurtures and social proof posts always promote the 90-Day Operating Plan by name; paid points to the same landing story; the site hero and sales deck use the same primary-offer framing; sales talk tracks reference scopeIn deliverables only.",
    riskiestAssumption:
      "Buyers will trade a short diagnostic for access to the full plan—validate with a landing-page A/B on promise + proof density before scaling paid.",
  },
  competitivePositioning: {
    positioningAxis1: {
      label: "Depth of implementation support",
      lowEnd: "Strategy-only / deck shops",
      highEnd: "Strategy + shipped execution artifacts",
    },
    positioningAxis2: {
      label: "Buyer sophistication",
      lowEnd: "SMB DIY tooling",
      highEnd: "Mid-market operator-led GTM",
    },
    players: [
      {
        name: "Northline Advisory",
        position: { x: "mid", y: "high" },
        narrative: "Positioned as executive strategy; strong brand but lighter on weekly execution checkpoints.",
      },
      {
        name: "StackMetrics Studio",
        position: { x: "high", y: "mid" },
        narrative: "Performance marketing shop; fast on paid media, thinner on narrative spine and sales enablement.",
      },
      {
        name: "Generic AI “brand kits”",
        position: { x: "low", y: "low" },
        narrative: "Low-cost templates; buyers compare on price until pipeline quality forces a real operating plan.",
      },
    ],
    strategicWhitespace: "Room to own “diagnostic-to-shipped-rhythm” for founder-led B2B services without enterprise agency overhead.",
    differentiationSummary:
      "Acme Co wins when buyers need one spine across narrative, proof, and activation—not either a deck or disconnected channel tactics.",
    vulnerabilities: "If proof blocks stay buried on About, named alternatives with clearer ROI stories can win late-funnel.",
  },
  icpConversionIntelligenceFramework: previewIcpConversionIntelligenceFramework,
  personaDrivenSegmentation: previewPersonaDrivenSegmentation,
  audiencePersonaDefinition: previewAudiencePersonaDefinition,
  buyerPersonas: [
    {
      personaName: "Jordan Malik",
      icpAlignment: "Primary ICP",
      role: "VP Marketing",
      coreFrustration: "Campaigns look polished but pipeline quality is flat quarter over quarter.",
      primaryMotivation: "Prove which narrative and channel mix actually moves qualified opportunities.",
      decisionStyle: "Evidence-first; wants a 90-day plan with owners and weekly proof.",
      informationSources: "Peer CMO networks, analyst briefs, and vendor case studies with named metrics.",
      messagingAngle:
        "Acme Co should lead with diagnostic clarity—show the leak, the fix sequence, and the first measurable checkpoint.",
      contentPreferences: "Short executive summaries, one-page rollout plans, and live walkthroughs of the priority queue.",
      objectionAndResponse: {
        objection: "We have tried agency-style strategy decks before with no execution lift.",
        response: "Pair every recommendation with an owner, timeline, and one customer-visible artifact due in 14 days.",
      },
      channelPriority: ["LinkedIn", "Email nurture", "High-intent landing pages"],
      sampleHeadline: "Stop funding fragmented messaging—run one pillar-led growth rhythm for 90 days.",
      sampleCTA: "Review my priority rollout plan",
    },
    {
      personaName: "Priya Nandakumar",
      icpAlignment: "Secondary ICP",
      role: "CFO",
      coreFrustration: "Hard to tie brand and demand spend to revenue efficiency with confidence.",
      primaryMotivation: "A finance-legible model: payback window, risk controls, and scenario planning.",
      decisionStyle: "Conservative; requires ROI framing and phased investment gates.",
      informationSources: "Board materials, finance peer forums, and vendor security or procurement packets.",
      messagingAngle:
        "Acme Co should translate strategy into cost-of-delay and efficiency metrics finance can defend in a board pack.",
      contentPreferences: "ROI one-pagers, milestone-based billing alignment, and implementation risk registers.",
      objectionAndResponse: {
        objection: "Brand work feels subjective compared to performance channels we can optimize weekly.",
        response: "Anchor the plan to conversion-quality and cycle-time deltas, not vanity reach.",
      },
      channelPriority: ["Executive email", "CFO roundtables", "Proposal appendix"],
      sampleHeadline: "From spend to signal—tie every initiative to pipeline efficiency and payback.",
      sampleCTA: "See the financial impact model",
    },
    {
      personaName: "Marcus Webb",
      icpAlignment: "Primary ICP",
      role: "Head of Revenue Operations",
      coreFrustration: "CRM and campaigns tell different stories; handoffs break under scale.",
      primaryMotivation: "One operating model: shared definitions, attribution guardrails, and rollout governance.",
      decisionStyle: "Systems thinker; validates integrations and data lineage before committing.",
      informationSources: "RevOps communities, solution architects, and reference calls with similar stacks.",
      messagingAngle:
        "Acme Co should show how messaging, routing, and reporting stay synchronized as channels multiply.",
      contentPreferences: "Implementation checklists, RACI templates, and technical validation calls.",
      objectionAndResponse: {
        objection: "Another framework will not fix broken handoffs between marketing and sales.",
        response: "Lead with ownership mapping plus a two-week pilot on one journey before broad rollout.",
      },
      channelPriority: ["Sales enablement sessions", "Slack/Teams async", "RevOps office hours"],
      sampleHeadline: "Align GTM narrative with the systems your team already runs every Monday.",
      sampleCTA: "Validate integration and ownership plan",
    },
  ],
  audiencePersonas: {
    primaryICP: {
      icpLabel: "Primary — founder-led B2B services",
      name: "Founder-led services firms ($2–15M ARR)",
      summary:
        "Leaders who feel pipeline quality slipping despite visible marketing activity; they want one narrative spine, named owners, and proof at decision moments—not more campaigns.",
      demographics:
        "US/UK-centric; 15–120 employees; complex or considered offers; often hybrid sales (founder + AE or BD).",
      psychographics:
        "Skeptical of vanity metrics; reward vendors who speak in outcomes, timelines, and accountability; allergic to endless strategy without shipped artifacts.",
      painPoints: [
        "Messaging drifts by channel—homepage, outbound, and deck tell slightly different stories.",
        "Proof lives on the About page instead of beside the ask in late funnel.",
        "Marketing and sales disagree on what a qualified opportunity looks like.",
      ],
      goals:
        "Stabilize qualified pipeline, shorten evaluation cycles, and give the board a legible growth story without doubling headcount.",
      buyingJourney:
        "Peer referral or inbound → founder-led eval → workshop or diagnostic → pilot with milestones → expand if checkpoints hit.",
      languageTheyUse:
        "Pipeline quality, payback, narrative consistency, owners, checkpoints, RevOps, not another deck.",
      whereToBeFindable:
        "LinkedIn founder POV, targeted outbound to economic buyers, partner intros, niche communities and vertical podcasts.",
      objections: [
        "We have tried agencies and still have the same funnel leaks.",
        "We cannot pause demand gen long enough to fix narrative.",
      ],
    },
    secondaryICP: {
      icpLabel: "Secondary — growth-stage marketing-led",
      name: "Marketing-led scale-ups modernizing GTM",
      summary:
        "CMO or VP Marketing tasked with proving which motions actually move SQLs; needs alignment with sales and finance on definitions and proof.",
      demographics:
        "Series A–C or bootstrapped high growth; 50–400 employees; multi-channel demand programs already live.",
      psychographics:
        "Data-hungry but frustrated by messy attribution; wants a pragmatic operating cadence, not a rebrand for its own sake.",
      painPoints: [
        "Campaign reporting and CRM stages tell different stories.",
        "Content calendar is busy but not tied to one message architecture.",
      ],
      goals:
        "Raise MQL→SQL quality while keeping spend flat; show leadership a 90-day plan with weekly leading indicators.",
      buyingJourney:
        "Internal business case → vendor shortlist → deep dive on methodology and references → pilot tied to one journey or segment.",
      languageTheyUse:
        "Attribution, stage definitions, nurture, CAC, payback, message-market fit, enablement.",
      whereToBeFindable:
        "Marketing leadership communities, analyst content, webinars, and peer referrals from RevOps or CFO networks.",
      objections: [
        "We already have a positioning doc—execution is the problem.",
        "Sales will not adopt another messaging framework.",
      ],
    },
    additionalICPs: [
      {
        icpLabel: "Partner — implementation & SI ecosystem",
        name: "Regional SIs and boutique consultancies",
        summary:
          "Partners who bring you into multi-vendor deals when the buyer needs narrative + operating rhythm, not point tactics.",
        demographics: "10–80 person firms; often co-selling with your team on transformation or GTM programs.",
        psychographics: "Reputation-sensitive; need repeatable co-sell stories and clear handoff RACI.",
        painPoints: ["Unclear joint value story on proposals", "Overlap anxiety with their own strategy practice"],
        goals: "Win larger engagements with a credible brand and execution layer.",
        buyingJourney: "Partner manager intro → joint workshop template → shared case format → quarterly pipeline review.",
        languageTheyUse: "Co-sell, RACI, joint IP, referenceable outcomes, deal registration.",
        whereToBeFindable: "Partner portals, industry events, warm intros from existing customer success.",
        objections: ["Your team might compete with ours on strategy"],
      },
    ],
    audienceTransitionPlan: {
      currentAudience:
        "Broad B2B services and founder-led teams attracted by general growth messaging.",
      idealAudience:
        "Founder-led and marketing-led services firms with visible funnel leaks and willingness to run a 90-day pilot with checkpoints.",
      gapDiagnosis:
        "Top-of-funnel reach is fine; the gap is repetition and proof placement so evaluation-stage buyers hear one spine from every surface.",
      messagingShifts:
        "From we do everything growth to we diagnose the leak, align the narrative, and ship weekly proof with owners.",
      channelShifts:
        "Fewer one-off campaigns; one pillar-led weekly rhythm; late-funnel pages and decks carry the same proof modules as paid and outbound.",
      timeline: "90 days to baseline consistency; 6 months to harden enablement and RevOps tie-in.",
      repositioningSteps: [
        "Audit hero, outbound hook, and deck opener against one positioning statement.",
        "Define SQL in writing and align nurture CTAs to that definition.",
        "Place one proof module beside every primary CTA in evaluation paths.",
        "Run a two-week sales/marketing sync on talk tracks and objection responses.",
      ],
    },
  },
  icpGoToMarketPlans: [
    {
      icpLabel: "Primary — founder-led B2B services",
      alignmentToBusinessStrategy:
        "Acme Co’s growth goals depend on winning founder-led services firms where narrative drift is the hidden tax on demand—this ICP funds the 90-day operating-plan offer and proves the diagnostic-to-shipped rhythm that differentiates the brand.",
      strategicFocus:
        "Earn trust with one spine across hero, outbound, and deck; pair proof modules with late-funnel asks and named owners on every milestone.",
      campaignContentNeeds: [
        "Founder POV LinkedIn series tied to pipeline-quality and payback language.",
        "Late-funnel landing variant with proof beside the primary CTA (not buried on About).",
        "Outbound hook family that mirrors the homepage job-to-be-done.",
        "14-day pilot RACI one-pager for sales leave-behinds.",
        "Short Loom: three-surface narrative audit (hero, slide 1, first outbound line).",
      ],
      priorityTactics: [
        "Week 1–2: publish one proof-led hero test vs. control; track scroll-to-proof and CTA click.",
        "Week 3–4: align sales talk track to the same headline family as paid and outbound.",
        "Week 5–8: run weekly narrative consistency score on homepage + deck + top outbound cohort.",
        "Week 9–12: book six founder reference conversations; capture one anonymized before/after pipeline snapshot.",
      ],
      conversion_intelligence_reference: {
        type: "ref",
        framework: "icp_conversion_intelligence_framework",
        icpTier: "Primary — founder-led B2B services",
        funnelStage: "Evaluation (economic buyer)",
        matrixCell: "Proof placement × late-funnel CTA",
        note: "Lead with diagnostic clarity and owner-backed milestones.",
      },
      competitiveConversationCues:
        "Contrast full-service agencies on shipped artifacts and weekly checkpoints, not hours. With DIY templates, stress operator burden and CRM-stage truth; never attack individuals—attack the pattern of narrative drift.",
    },
    {
      icpLabel: "Secondary — growth-stage marketing-led",
      alignmentToBusinessStrategy:
        "This segment expands ACV and logo velocity when marketing and sales share one message architecture; it supports the brand’s goal of repeatable, finance-legible GTM without a full rebrand.",
      strategicFocus:
        "Win on attribution clarity, stage definitions, and enablement that sales will actually run on Monday.",
      campaignContentNeeds: [
        "MQL→SQL definition one-pager co-branded with sales leadership.",
        "Nurture branch for marketing-led accounts with stage-matched proof.",
        "Webinar or live teardown: ‘one journey, three surfaces’ using their real copy (sanitized).",
        "RevOps-facing checklist: UTM, stage hygiene, handoff SLA.",
      ],
      priorityTactics: [
        "Align CRM stages to nurture CTAs in two workshops (marketing + RevOps).",
        "Publish one pillar-led monthly theme with sales talk-track appendix.",
        "Run a 30-day test on late-funnel page with proof module above the fold.",
        "Monthly leading metric: % of opportunities using the approved headline family.",
      ],
      conversion_intelligence_reference: {
        type: "ref",
        framework: "icp_conversion_intelligence_framework",
        icpTier: "Secondary — growth-stage marketing-led",
        funnelStage: "Consideration → decision",
        matrixCell: "Enablement × nurture proof branch",
        note: "CFO-friendly payback framing optional in late emails; RevOps cares about definitions.",
      },
      competitiveConversationCues:
        "Vs. ‘we already have a positioning doc,’ sell operating rhythm and adoption, not more PDFs. Vs. point agencies, show cross-channel narrative governance and sales-ready proof modules.",
    },
    {
      icpLabel: "Partner — implementation & SI ecosystem",
      alignmentToBusinessStrategy:
        "Partners extend reach into multi-vendor deals without diluting the core offer story; they support the firm’s goal of larger engagements with clear co-sell and handoff IP.",
      strategicFocus:
        "Make joint value obvious on proposals and protect RACI so overlap anxiety drops.",
      campaignContentNeeds: [
        "Co-sell one-pager: when Acme Co vs. partner leads strategy vs. delivery.",
        "Joint case outline template with shared proof slots.",
        "Partner webinar kit: title options, hook, and Q&A guardrails.",
      ],
      priorityTactics: [
        "Quarterly partner pipeline review with shared opportunity taxonomy.",
        "Two joint workshops using a fixed agenda and shared customer story.",
        "Publish one partner-safe anonymized win with implementation milestones.",
      ],
      conversion_intelligence_reference: {
        type: "ref",
        framework: "icp_conversion_intelligence_framework",
        icpTier: "Partner — implementation & SI ecosystem",
        funnelStage: "Partner co-sell",
        matrixCell: "Joint narrative × RACI",
        note: "Reputation-sensitive; avoid competing on strategy language—clarify lanes.",
      },
      competitiveConversationCues:
        "Emphasize complementary lanes: partner owns transformation scope, Acme Co owns narrative spine and weekly operating checkpoints. Pre-handle ‘you compete with our strategy’ with explicit RACI and deal-registration etiquette.",
    },
  ],
  ...previewActivationContent,
  executiveSummary: {
    synthesis:
      "Acme Co wins when buyers see one disciplined story from first touch to proposal: diagnostic clarity, proof-backed sequencing, and owner-ready execution. The brand is already credible; the gap is repetition and channel-specific discipline so every asset reinforces the same promise.",
    diagnosis:
      "Visibility and conversion are pulling in different directions because messaging is strong at the narrative level but inconsistently expressed in high-intent surfaces.",
    primaryFocusArea: "Messaging",
    secondaryFocusArea: "Visibility",
  },
  strategicAlignmentOverview: {
    summary:
      "Positioning and messaging are the strongest pillars; credibility assets exist but are under-deployed at decision moments. Visibility creates reach but needs tighter ties to the core message architecture. Conversion mechanics work when proof and narrative align upstream.",
    reinforcements: [
      {
        pillars: "Positioning → Messaging",
        insight: "When the homepage and outbound hooks use the same category frame, reply quality and meeting conversion improve without more spend.",
      },
      {
        pillars: "Credibility → Conversion",
        insight: "Surfacing proof beside the ask—not only on the About page—reduces stall-outs in the late funnel.",
      },
    ],
  },
  messagingSystem: {
    coreMessage: "Acme Co turns fragmented GTM motion into one pillar-led growth rhythm with named owners and weekly proof.",
    supportingMessages: [
      "Diagnose the leak before you fund more channels.",
      "One storyline from LinkedIn to landing page to nurture.",
      "Finance-legible milestones for every phase of spend.",
    ],
    proofPoints: [
      "Before/after pipeline quality examples from similar B2B services clients.",
      "90-day rollout templates with RACI and checkpoint criteria.",
      "Channel mix models tied to payback gates—not vanity reach.",
    ],
    whatNotToSay: ["Full-service agency for everyone", "We transform your brand overnight", "Generic thought leadership with no CTA"],
  },
  brandFoundation: {
    positioningStatement:
      "For founder-led B2B services teams stuck translating strategy into steady pipeline, Acme Co is the growth partner that replaces scattered campaigns with one proof-backed narrative and an execution rhythm sales and marketing can run together.",
    differentiationNarrative:
      "Unlike generalist agencies that deliver decks without ownership, Acme Co pairs strategic clarity with delivery accountability—every recommendation maps to an owner, artifact, and date.",
    brandPromise:
      "We will not expand channel spend until your core story, proof placement, and conversion path agree in language and evidence.",
    brandValues: [
      {
        name: "Strategic clarity before scale",
        description: "Campaigns and spend wait until positioning and message hierarchy match how Acme Co actually wins.",
        inAction: "Green-light paid media only after organic hook, paid primary text, and landing page agree on one storyline.",
        whyItMatters: "Founder-led teams burn budget when every channel tells a slightly different story.",
      },
      {
        name: "Proof over preference",
        description: "Claims scale only when evidence, mechanism, or observable outcomes back them.",
        inAction: "Every paid or organic case card lists before metric, lever pulled, and window of time—not adjectives.",
        whyItMatters: "B2B buyers in competitive services default to skepticism; proof is the trust shortcut.",
      },
      {
        name: "Execution ownership",
        description: "Each initiative has one accountable owner and a dated checkpoint.",
        inAction: "Weekly review names who unblocks the next step—not a list of departments.",
        whyItMatters: "Strategy without owners becomes slides; owners turn plans into shipped work.",
      },
    ],
  },
  measurementFramework: {
    overview:
      "Measure the system, not vanity: leading signals weekly (reply quality, meeting conversion), channel efficiency biweekly, pipeline quality monthly.",
    perSectionKPIs: [
      {
        section: "Visibility",
        recommendation: "ICP-weighted reach in priority feeds",
        kpi: "Qualified impressions / week",
        target: "+15% quarter over quarter",
      },
      {
        section: "Conversion",
        recommendation: "Stage-exit rates with same message spine",
        kpi: "MQL → SQL rate",
        target: "Stable or up while spend flat",
      },
    ],
    leadingIndicators: [
      {
        indicator: "Reply-to-meeting rate on outbound",
        whatItMeans: "Message–market fit is tightening or drifting",
        timeframe: "Weekly",
      },
    ],
    trackingRecommendations: [
      {
        metric: "Cost per qualified opportunity",
        tool: "CRM stages + UTM hygiene",
        howToSetUp: "One campaign taxonomy; SQL definition in writing",
        frequency: "Monthly",
        readerFriendlyOneLiner:
          'Agree how you name campaigns and which leads count as "ready for sales," then tag links so you can see which effort produced each opportunity—review together monthly.',
      },
    ],
  },
  brandHealthScorecard: {
    overview: "Quarterly brand review against buyer behavior—not subjective creative scores.",
    scorecardDimensions: [
      {
        dimension: "Messaging consistency",
        currentState: "Three hero variants in market",
        targetState: "One spine, contextual skins by segment",
        keyMetric: "Audit pass rate on key pages",
        measurementMethod: "Sample hero + outbound + deck monthly",
        frequency: "Monthly",
        greenThreshold: "90%+",
        yellowThreshold: "70–89%",
        redThreshold: "<70%",
      },
    ],
    quarterlyReviewProcess: { description: "", steps: [], reviewTemplate: "" },
    leadingIndicators: [],
    laggingIndicators: [],
  },
  conversionStrategy: {
    howTrustIsBuilt: "Lead with mechanism and named proof; avoid generic authority claims.",
    howClarityDrivesAction: "One decisive CTA per page; secondary paths for researchers.",
    ctaHierarchy: [
      { level: "Primary", action: "Book diagnostic review", context: "High-intent pages" },
      { level: "Secondary", action: "See sample rollout plan", context: "Mid-funnel nurture" },
      { level: "Tertiary", action: "Subscribe to insight drops", context: "Early education" },
    ],
  },
  websiteCopyDirection: {
    overview: "Homepage sells the transformation; internal pages sell the operating model.",
    homepage: {
      heroHeadline: "Turn scattered GTM into one proof-backed rhythm",
      heroSubheadline: "For founder-led teams who need pipeline quality, not more noise.",
      heroCtaButton: "Review your 90-day plan",
      valuePropSection: "Three moves: diagnose the leak, align the narrative, ship weekly proof.",
    },
    aboutPage: { openingHook: "", storyFramework: "", teamPositioning: "" },
    servicesPage: { pageStructure: "", serviceFramework: "", pricingLanguage: "" },
    copyPrinciples: [],
  },
  contentPillars: [
    {
      name: "Pipeline truth",
      description: "Expose where funnel math breaks with evidence, not opinions.",
      exampleTopics: ["CAC reality check", "Win/loss patterns", "Channel attribution sanity"],
      suggestedFormats: ["LinkedIn essay", "One-pager", "Webinar hook"],
      messagingPillarConnection: "Credibility",
    },
  ],
  contentCalendarFramework: {
    overview: "One monthly theme; weekly proof story; daily social reinforcement.",
    monthlyThemes: [
      {
        month: "Q1",
        theme: "Diagnostic clarity",
        contentPillarFocus: "Pipeline truth",
        keyTopics: ["Leak taxonomy", "ICP fit signals"],
      },
      {
        month: "Q2",
        theme: "Proof in market",
        contentPillarFocus: "Credibility",
        keyTopics: ["Named outcomes", "Case study slices", "Sales deck proof module"],
      },
      {
        month: "Q3",
        theme: "Scale what clears the bar",
        contentPillarFocus: "Conversion",
        keyTopics: ["Payback gates", "Channel reinvestment", "Creative iteration rules"],
      },
      {
        month: "Q4",
        theme: "Refresh and plan forward",
        contentPillarFocus: "Governance",
        keyTopics: ["Quarterly narrative audit", "Next-year theme map", "Budget reallocation"],
      },
    ],
    weeklyStructure: { description: "", days: [] },
    batchingStrategy: "Batch founder voice on Mondays; distribute slices through Thursday.",
    repurposingPlaybook: "One long insight becomes three social posts plus a nurture deep link.",
  },
  credibilityStrategy: {
    overview: "Proof should precede the price conversation wherever possible.",
    proofPointsToCreate: [
      {
        proofPoint: "Before/after pipeline snapshot (anonymized)",
        type: "Quant",
        priority: "High",
        howToGet: "Client-approved metric window",
        whereToDisplay: "Sales deck + late-funnel page",
      },
    ],
    testimonialStrategy: {
      whoToAsk: "Economic buyers post-implementation",
      howToAsk: "Outcome-led interview, not generic praise",
      whatToCapture: "Metric, mechanism, timeframe",
      whereToPlace: "Proposal appendix + site proof module",
    },
    authoritySignals: [{ signal: "Founder POV column", impact: "Top-of-funnel trust", timeline: "60 days" }],
    trustGaps: "Vertical-specific case depth lags competitors who publish named outcomes.",
  },
  salesConversationGuide: {
    openingFramework:
      "Open with their revenue rhythm and where evaluation breaks—not your credentials. Mirror their language (pipeline quality, payback, narrative drift), then offer a concrete diagnostic frame: one leak, one storyline, one 90-day checkpoint path.",
    talkTrackFramework: [
      {
        stage: "First 10 minutes",
        objective: "Earn permission to go deep on where the story and the funnel disagree.",
        keyMessage: "We care more about the leak taxonomy than the channel mix.",
        proofToUse: "One anonymized before/after from a similar services motion.",
      },
      {
        stage: "Middle — discovery",
        objective: "Separate positioning clarity from proof placement and handoff mechanics.",
        keyMessage: "Marketing air cover only works if sales uses the same proof at the same stage.",
        proofToUse: "Sample hero vs. deck vs. outbound line audit (3 bullets).",
      },
      {
        stage: "Close",
        objective: "Land a bounded pilot with owners and a customer-visible artifact due in 14 days.",
        keyMessage: "You should see movement on one journey before we expand scope.",
        proofToUse: "Pilot RACI + milestone template from similar engagement.",
      },
    ],
    discoveryQuestions: [
      {
        question: "Where does pipeline typically stall today?",
        whyThisQuestion: "Separates messaging drift from ops or offer issues.",
        listenFor: "Blame on lead volume vs. close mechanics; vague vs. specific stage names.",
      },
      {
        question: "If I read your homepage hero, your top outbound hook, and slide 1 of your deck, would they promise the same job-to-be-done?",
        whyThisQuestion: "Surfaces narrative inconsistency without sounding accusatory.",
        listenFor: "Hesitation, laughter, or instant yes—each tells you how broken alignment is.",
      },
      {
        question: "What proof does a rep actually show beside the ask in late funnel today?",
        whyThisQuestion: "Reveals whether credibility is deployed at decision moments or buried.",
        listenFor: "PDFs nobody opens vs. tight one-pagers tied to stage.",
      },
      {
        question: "How do marketing and sales currently define a qualified opportunity?",
        whyThisQuestion: "Handoff quality is often the hidden tax on demand spend.",
        listenFor: "Different verbs, different thresholds, or we are still aligning.",
      },
      {
        question: "What did the last growth or brand initiative change in the CRM within 30 days?",
        whyThisQuestion: "Tests whether prior work produced observable operating change.",
        listenFor: "Activity metrics only vs. stage movement or cycle time.",
      },
      {
        question: "Who owns narrative consistency week to week—not the workshop, the habit?",
        whyThisQuestion: "If nobody owns it, messaging will drift again after any project.",
        listenFor: "Named owner vs. committee vs. outsourced only to agency.",
      },
    ],
    proofPointDeployment: [
      {
        persona: "VP Marketing",
        stage: "Evaluation",
        proofPoint: "Named rollout milestones with owners and dates",
        howToDeliver: "Leave-behind one-pager tied to their stack and current funnel stages",
      },
      {
        persona: "CFO",
        stage: "Evaluation",
        proofPoint: "Cost-of-delay framing + payback scenario tied to their funnel math",
        howToDeliver: "Appendix slide with assumptions they can edit in the room",
      },
      {
        persona: "Head of RevOps",
        stage: "Technical validation",
        proofPoint: "RACI + routing diagram for how messaging updates propagate to CRM and campaigns",
        howToDeliver: "Short Loom plus checklist for UTM and stage hygiene",
      },
      {
        persona: "Founder",
        stage: "Late stage",
        proofPoint: "Reference call + anonymized pipeline snapshot from similar ARR band",
        howToDeliver: "Offer intro within 48 hours; keep proof specific to their motion",
      },
    ],
    objectionHandlingPlaybook: [
      {
        objection: "We have tried strategy firms before",
        response:
          "Anchor every recommendation on an owner, a date, and one customer-visible artifact—then expand. The pilot is the product, not the deck.",
        pillarConnection: "Execution",
        proofPoint: "Sample 14-day deliverable cadence from a comparable client",
      },
      {
        objection: "Sales will not adopt another messaging framework",
        response:
          "We do not ship a framework first; we ship one talk track and three proof modules for the journey they already run on Mondays.",
        pillarConnection: "Messaging",
        proofPoint: "Talk track one-pager + objection/response pairs used in last quarter",
      },
      {
        objection: "We cannot pause demand gen to fix narrative",
        response:
          "We narrow spend on one ICP and one journey so quality rises without a full pause—then scale what wins.",
        pillarConnection: "Conversion",
        proofPoint: "ICP-weighted efficiency snapshot template",
      },
      {
        objection: "Brand work feels subjective next to performance channels",
        response:
          "Tie the work to conversion-quality, cycle time, and stage-exit rates with the same definitions finance already uses.",
        pillarConnection: "Credibility",
        proofPoint: "Board-ready KPI tree: leading vs. lagging, weekly vs. monthly",
      },
    ],
    conversion_intelligence_reference: {
      type: "ref",
      framework: "icp_conversion_intelligence_framework",
      icpTier: "Primary — founder-led B2B services",
      funnelStage: "Evaluation (technical + economic buyer in same room)",
      matrixCell: "Proof placement × late-funnel CTA",
      note: "Lead with diagnostic clarity and owner-backed milestones; CFO cares about payback framing, RevOps cares about routing and definitions.",
    },
    closingLanguage:
      "Close on a time-bound pilot checkpoint with named owners—e.g. two-week journey fix plus one customer-visible artifact—not an open-ended follow-up or another scoping call.",
  },
  channelPlans: {
    ...previewActivationContent.channelPlans,
    ...previewEngine.channelPlans,
  },
  buyerJourneySummary:
    previewEngine.buyerJourneySummary || previewActivationContent.buyerJourneySummary,
  competitiveMatrixSummary:
    previewEngine.competitiveMatrixSummary || previewActivationContent.competitiveMatrixSummary,
  activationRoadmapPlansBody:
    previewEngine.executionRoadmapBody || previewActivationContent.activationRoadmapPlansBody,
  activationSegmentPlansBody:
    previewEngine.audienceSegmentsBody || previewActivationContent.activationSegmentPlansBody,
  activationPersonaIcpBanner:
    previewEngine.personaIcpBanner || previewActivationContent.activationPersonaIcpBanner,
  paidMediaStrategy: ensurePaidMediaChannelsMinimum({
    ...(previewPaidMediaStrategy as Record<string, unknown>),
  }),
};

const previewResultsNavItems = buildResultsTabNavItems({ hasSnapshotPlusAccess: true });

const resultsContent = (
  <div className="space-y-16 md:space-y-20">
    <div style={SUITE_CHIP_CARD_STYLE}>
      <TabSectionMenu
        title="On this page"
        items={previewResultsNavItems}
        description={TAB_SECTION_NAV_HINT_CHIPS_ONLY}
        suiteChipCardEmbed
      />
    </div>
    <section id="results-overview" className="scroll-mt-28">
      <ResultsHeroSection
        score={previewWunderBrandScore}
        primaryPillar="visibility"
        hasSnapshotPlus
        userRoleContext="founder"
        executiveContext={{
          businessName: "Acme Co",
          stage: "scaling",
          pillarScores,
          primaryPillar: "visibility",
          recommendationPreview: [
            "Align homepage and core offer pages to one positioning statement and three proof-backed messaging pillars.",
            "Rebuild channel cadence around weekly visibility themes tied to audience intent stages.",
            "Surface testimonials, case studies, and outcome proof where buying decisions happen.",
          ],
        }}
      />
    </section>

    <ResultsSuiteVisualSummary pillars={pillarScores} />

    <div id="pillar-analysis" className="scroll-mt-28">
      <PillarBreakdown
        pillars={pillarScores}
        insights={pillarInsights}
        businessName="Acme Co"
        stage="scaling"
      />
    </div>

    <section
      id="priority-actions"
      className="scroll-mt-28 rounded-2xl border-2 border-brand-blue/20 bg-gradient-to-b from-white to-[#f4f9ff] p-6 sm:p-8 shadow-[0_6px_24px_rgba(2,24,89,0.06)]"
    >
      <div className="mb-7 pb-6 border-b border-brand-border/70 sm:mb-8">
        <p className={`${SUITE_SECTION_KICKER_CLASS} mb-4`}>Opportunities</p>
        <h2 className="bs-h3 mb-1">Priority Actions</h2>
        <p className="bs-body-sm text-brand-muted max-w-2xl m-0">
          Concrete moves derived from your diagnostic — distinct from pillar scores above.
        </p>
      </div>
      <ol
        className="list-none m-0 p-0 space-y-4"
        aria-label="Ranked priority actions from your diagnostic, up to five items"
      >
        {[
          "Align homepage and core offer pages to one positioning statement and three proof-backed messaging pillars.",
          "Rebuild channel cadence around weekly visibility themes tied to audience intent stages.",
          "Surface testimonials, case studies, and outcome proof where buying decisions happen.",
          "Tighten CTA sequencing from awareness to conversion across email and website touchpoints.",
        ].map((item, idx) => (
          <li
            key={idx}
            className="flex gap-4 items-start rounded-xl border border-brand-border/60 bg-white/90 p-4 sm:p-5 shadow-sm"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-brand-blue text-white text-sm font-bold tabular-nums shadow-sm"
              aria-hidden
            >
              {idx + 1}
            </span>
            <p className="bs-body-sm text-brand-midnight leading-relaxed m-0 pt-1">{item}</p>
          </li>
        ))}
      </ol>
    </section>

    <div id="context-coverage" className="scroll-mt-28">
      <ContextCoverageMeter
        coveragePercent={68}
        areas={[
          { name: "Business Fundamentals", percent: 82, status: "strong" },
          { name: "Audience & Positioning", percent: 75, status: "strong" },
          { name: "Competitive Context", percent: 56, status: "moderate" },
          { name: "Conversion Inputs", percent: 48, status: "moderate" },
          { name: "Proof Assets", percent: 32, status: "limited" },
        ]}
        contextGaps={[
          "Specific competitor messaging examples were limited.",
          "Conversion-path metrics were directional rather than exact.",
          "Proof artifacts (case-study details, hard numbers that show results) were incomplete.",
        ]}
      />
    </div>

    <div id="implementation" className="scroll-mt-28">
      <ImplementationIntro variant="compact" />
    </div>

    <div id="next-steps" className="scroll-mt-28 rounded-xl border border-brand-border bg-white p-6 sm:p-7">
      <p className={`${SUITE_SECTION_KICKER_CLASS} m-0 mb-2`}>Next Steps</p>
      <div className="mt-1">
        <ReportTierUpgradeCTAs
          tier="blueprint-plus"
          utmSource="preview_results_tabs"
          downloadsHref="/preview/results-tabs?tab=downloads"
        />
      </div>
    </div>
  </div>
);

const foundationContent = (
  <FoundationBlueprintContent
    businessName={diagnosticData.businessName}
    targetAudience={diagnosticData.targetAudience}
    industry={diagnosticData.industry}
    primaryPillar={diagnosticData.primaryPillar}
    primaryArchetype={diagnosticData.primaryArchetype}
    secondaryArchetype={diagnosticData.secondaryArchetype}
    diagnosticData={diagnosticData}
  />
);

export type PreviewResultsTabsClientProps = {
  initialActiveTab?: ResultsTab;
  initialActivationPlanId?: ActivationPlanSectionId;
  initialWorkbookSectionId?: WorkbookSectionId;
  activationFocus?: string | null;
};

function PreviewResultsTabsClientInner({
  initialActiveTab,
  initialActivationPlanId,
  initialWorkbookSectionId,
  activationFocus,
}: PreviewResultsTabsClientProps) {
  const searchParams = useSearchParams();
  const resolvedTab = useMemo((): ResultsTab => {
    const raw = searchParams.get("tab");
    if (!raw?.trim()) return initialActiveTab ?? "strategy";
    return parseResultsTabId(raw) ?? "results";
  }, [searchParams, initialActiveTab]);

  useEffect(() => {
    if (resolvedTab !== "strategy") return;
    const id = window.setTimeout(() => {
      document.getElementById("strategy-sales-alignment")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 350);
    return () => window.clearTimeout(id);
  }, [resolvedTab]);

  return (
    <main className="min-h-screen font-brand" style={{ backgroundColor: "#F5F7FA" }}>
      <ResultsTabsShell
        productTier="blueprint-plus"
        resultsContent={resultsContent}
        foundationContent={foundationContent}
        diagnosticData={diagnosticData}
        initialActiveTab={resolvedTab}
        initialWorkbookSectionId={initialWorkbookSectionId}
        initialActivationPlanId={initialActivationPlanId}
        activationFocus={activationFocus}
      />

      <div style={{ maxWidth: SUITE_CONTENT_MAX_PX, margin: "0 auto", padding: "0 min(28px, 4vw) 28px" }}>
        <p style={{ fontSize: 12, color: "#5A6B7E", margin: 0 }}>
          Preview mode with mock data (URL defaults to <code style={{ fontSize: 11 }}>?tab=strategy</code>; use{" "}
          <code style={{ fontSize: 11 }}>?tab=results</code> for the scores overview).{" "}
          <Link href="/preview" style={{ color: "#021859", textDecoration: "underline", fontWeight: 700 }}>
            Back to all previews
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function PreviewResultsTabsClient(props: PreviewResultsTabsClientProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen font-brand" style={{ backgroundColor: "#F5F7FA" }}>
          <div style={{ maxWidth: SUITE_CONTENT_MAX_PX, margin: "0 auto", padding: "min(28px, 4vw)" }}>
            <p style={{ fontSize: 14, color: "#5A6B7E", margin: 0 }}>Loading preview suite…</p>
          </div>
        </main>
      }
    >
      <PreviewResultsTabsClientInner {...props} />
    </Suspense>
  );
}
