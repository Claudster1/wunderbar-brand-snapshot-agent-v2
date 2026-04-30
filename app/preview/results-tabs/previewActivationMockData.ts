import { buildActivationDiagnostics, type ActivationDiagnostics } from "@/lib/results/buildActivationDiagnostics";

export const previewActivationStrategicPriorities = [
  { rank: 1, title: "Unify external messaging to one positioning promise", pillar: "Messaging" },
  { rank: 2, title: "Build weekly visibility themes tied to pillar goals", pillar: "Visibility" },
  { rank: 3, title: "Surface social proof on key conversion pages", pillar: "Credibility" },
];

export const previewActivationScheduleRows = [
  {
    week: 1,
    channel: "Paid + Organic",
    contentType: "Creative + LP",
    assetTopic: "Align paid primary text, organic hook, and landing proof block",
    messagePillar: "Messaging",
    funnelStage: "Problem-Aware",
    primaryCta: "Book Strategy Call",
    owner: "Marketing Lead",
    status: "Not Started" as const,
    dueDate: "Week 1",
  },
  {
    week: 2,
    channel: "Email",
    contentType: "Sequence",
    assetTopic: "Welcome sequence with pillar-aligned narrative",
    messagePillar: "Credibility",
    funnelStage: "Solution-Aware",
    primaryCta: "Download Guide",
    owner: "Growth Manager",
    status: "Not Started" as const,
    dueDate: "Week 2",
  },
  {
    week: 3,
    channel: "Social",
    contentType: "Post Series",
    assetTopic: "3-post authority cluster around core offer",
    messagePillar: "Visibility",
    funnelStage: "Problem-Aware",
    primaryCta: "Learn More",
    owner: "Content Lead",
    status: "Not Started" as const,
    dueDate: "Week 3",
  },
];

/** Sample structured creatives for Paid Ads activation (mirrors Blueprint+ paidMediaStrategy). */
export const previewPaidMediaStrategy = {
  overview:
    "Run two parallel learning flights: LinkedIn for high-intent B2B conversations, Meta for retargeting and proof. Keep message-landing parity on every ad.",
  conversionSpine: {
    primaryMacroConversion: "Qualified strategy call booked with budget range and decision timeline confirmed",
    primaryOfferAnchor: "20-minute funnel alignment audit (same CTA on ads, landing, and first nurture email)",
    advancesConversion:
      "Captures in-market and retargeted clicks, routes every placement to the audit landing path, and keeps headline parity so paid spend buys intent—not message drift.",
  },
  platformsCovered: ["LinkedIn", "Meta", "Google Ads"],
  channels: [
    {
      channel: "LinkedIn — Sponsored Content",
      platform: "LinkedIn",
      placement: "Sponsored Content — Feed",
      objective: "Qualified conversations with growth-stage operators",
      audienceAngle: "Founder-led service firms (10–80 employees) comparing positioning and GTM partners",
      headline: "Stop paying for traffic that doesn’t match your pipeline story.",
      subheadline: "One narrative from ad → landing → sales deck, built for service brands.",
      bodyCopy:
        "If your ads promise speed but your landing page sells depth, you’re taxing buyers. Acme maps one proof-led story across every touchpoint so spend buys intent—not confusion.",
      imagePrompt:
        "Split layout: left side noisy analytics dashboard with muted reds; right calm founder reviewing a single campaign report on a laptop. Navy and white UI, soft daylight through blinds, subtle sage accent, no stock handshakes, include small “Acme” wordmark on the report.",
      videoPrompt: "",
      cta: "Book a 20-minute funnel audit",
      creativeDirection: "Trust-forward, minimal polish; avoid startup rocket clichés.",
      offerStrategy: "Free audit → scoped workshop proposal",
      kpiToTrack: "Cost per qualified SQL (30-day)",
    },
    {
      channel: "Meta — Conversion",
      platform: "Meta",
      placement: "Conversion — Advantage+ (Instagram + Facebook)",
      objective: "Retarget site visitors with proof and a single next step",
      audienceAngle: "Visitors who viewed services or pricing in the last 14 days",
      headline: "Still comparing partners? See how teams like yours tightened message → channel fit.",
      subheadline: "Short proof clip + one CTA—no funnel noise.",
      bodyCopy:
        "Watch a 45-second walkthrough: how messaging alignment cut wasted spend in three sprints. Comment “guide” for the checklist.",
      imagePrompt:
        "Vertical 4:5 static: mobile screen showing before/after message matrix; warm neutral background; caption space at bottom; brand colors navy #021859 and sky blue #07B0F2; no text in image except UI labels.",
      videoPrompt:
        "9:16 Reels / Shorts, 12–15s: 0–2s hook on-screen text “Same spend. Cleaner story.”; 3–8s screen recording of cluttered analytics vs one clean pipeline view; 9–12s founder waist-up nod + caption “One narrative”; 13–15s end card checklist icon + “Get the alignment checklist”; VO: calm, no buzzwords; brand navy/sky accents only.",
      cta: "Get the alignment checklist",
      creativeDirection: "Motion-safe; readable at small sizes.",
      offerStrategy: "Checklist PDF + optional CTA to audit",
      kpiToTrack: "Landing CTR and cost per checklist start",
    },
    {
      channel: "Google Ads — Search — non-brand",
      platform: "Google Ads",
      placement: "Search — non-brand",
      objective: "Capture high-intent category and problem queries",
      audienceAngle: "Searchers comparing vendors and methodologies in your category",
      headline: "Compare positioning partners without the RFP theater | Acme Co",
      subheadline: "",
      bodyCopy:
        "Lines 1–2: name the risk of generic agencies. Line 3: your proof point. CTA: see pricing framework or book a fit call.",
      imagePrompt: "",
      videoPrompt: "",
      cta: "See pricing / Book a fit call",
      creativeDirection: "Keep RSA variants tight; mirror landing H1.",
      offerStrategy: "Intent landing aligned to search theme",
      kpiToTrack: "Conv. rate, CPL, impression share (non-brand)",
    },
  ],
  budgetScenarios: [
    {
      label: "Base",
      monthlySpend: 4000,
      objectiveFit: "Balanced learning + retargeting",
      expectedOutcome: "Stable CPL within 8 weeks",
    },
  ],
};

/** Blueprint+ ICP framework — drives structured Audience Segments activation panel in preview. */
export const previewAudiencePersonaDefinition = {
  primaryICP: {
    icpLabel: "Founder-led service firms",
    summary:
      "10–50 employee B2B services brands with inconsistent demand quality and founder-owned messaging; evaluating positioning partners.",
    conversionPath: "Free audit offer → 20-min scope call → workshop proposal → implementation sprint.",
  },
  secondaryICP: {
    icpLabel: "Growth operators",
    summary: "Marketing leads who need repeatable campaign throughput and clearer message-to-channel alignment.",
    conversionPath: "Guide download → nurture → team working session.",
  },
};

export const previewPersonaDrivenSegmentation = {
  segmentationStrategy:
    "Weight segments by commercial intent: high-intent site behavior and asset downloads route to faster sales touches; education-first leads stay in proof-led nurture.",
  segments: [
    {
      segmentName: "High intent — pricing & services revisits",
      segmentSize: "15–25% of pipeline",
      revenueValue: "Highest LTV / fastest close",
      messagingDifferentiation: "Lead with ROI framing and case snippets; avoid generic thought leadership.",
      channelMix: "Email automation + LinkedIn retargeting + one direct sales touch",
      conversionTactics: [
        "3-email proof sequence with single CTA",
        "Static ad variant repeating email headline",
      ],
      contentCalendarThemes: ["Proof density", "Implementation timeline", "Risk reversal"],
      kpisToTrack: ["Reply rate", "SQL rate from segment", "Cost per booked call"],
    },
  ],
};

export const previewIcpConversionIntelligenceFramework = {
  overview:
    "This framework maps how your primary ICP moves from signal → content → channel → conversion, so every activation plan uses the same language and CTA hierarchy.",
  conversionProfile: [
    {
      icpTier: "Primary ICP",
      buyingCycleLength: "45–90 days",
      primaryConversionBarrier: "Fear of another vague strategy engagement without execution path",
      decisionTrigger: "Missed quarter on qualified pipeline or CAC spike after message drift",
      conversionBehaviorPattern: "Researches 3–5 vendors; needs mechanism + timeline before booking",
    },
  ],
  contentTypeConversionMatrix: [
    {
      icpTier: "Primary ICP",
      funnelStage: "Consideration",
      highestConvertingContentType: "6-min Loom + one-page before/after PDF",
      whyItConverts: "Shows mechanism without a sales call; matches how they evaluate agencies.",
      requiredContentAttributes: ["Named metric window", "Role-specific example", "Single CTA"],
      leadMessagePillar: "Credibility",
      convertingCTA: "See the 12-week message-system map",
      exampleHeadline: "The 90-day leak most founder-led firms miss (and how to plug it)",
      examplePrimaryCopy:
        "If your homepage, ads, and outbound all promise something slightly different, you are not losing to competitors—you are taxing your own pipeline. In this walkthrough we show one service brand that cut unqualified conversations by 31% in twelve weeks by locking one storyline across LinkedIn, email, and the offer page. You will see the exact before/after message map, the metric window we used, and the single CTA we repeated at every step. No fluff: mechanism, timeline, owner. When you are done, you will know whether your next dollar should go to creative, landing, or nurture—and why.",
      exampleImagePrompt:
        "Founder at desk, single monitor showing a simple before/after message matrix (blurred), navy UI accents, daylight, no stock-handshake clichés, subtle Acme wordmark on doc corner.",
      exampleVideoPrompt:
        "6-min Loom-style single take: 0:00–0:20 hook + agenda; 0:20–2:30 screen share walking message map; 2:30–4:30 blurred metric overlay + voiceover on what changed; 4:30–5:45 objection handling; 5:45–6:00 CTA to reply “loom”. Lower-third: name + title; tab audio only, no background music.",
    },
    {
      icpTier: "Primary ICP",
      funnelStage: "Decision",
      highestConvertingContentType: "3-slide workshop scope + calendar link",
      whyItConverts: "Reduces fear of open-ended consulting spend.",
      requiredContentAttributes: ["Deliverables list", "Owner map", "First 14 days spelled out"],
      leadMessagePillar: "Conversion",
      convertingCTA: "Book a 20-minute scope fit",
      exampleHeadline: "Scope fit call: what we deliver in the first 14 days (slide outline inside)",
      examplePrimaryCopy:
        "Slide 1: Current state—where message-channel drift is costing you (one diagram). Slide 2: 12-week system—positioning lock, channel alignment, proof cadence, owners per workstream. Slide 3: First 14 days—three deliverables you can ship internally, one metric we move first. This is the same deck we use after pricing-page intent signals. CTA: pick a time; bring your analytics view-only link if you want sharper feedback.",
      exampleImagePrompt:
        "Clean 16:9 presentation cover: title slide with navy header, white body, single bold line of copy, no faces.",
      exampleVideoPrompt: "",
    },
  ],
  channelLevelConversionMechanics: [
    {
      icpTier: "Primary ICP",
      channel: "LinkedIn",
      convertingFormats: ["Sponsored content static", "Document ad"],
      optimalMessageLength: "Primary text ≤ 150 words; headline ≤ 70 characters",
      conversionAction: "Click to landing page that repeats ad headline in H1",
      followUpLogic: "If landing view 30s+ and no form: fire retarget with checklist creative in 48h",
      failurePatterns: ["Homepage traffic from ads", "Mixed CTAs on landing", "Case study without metrics"],
    },
  ],
  multiTouchConversionSequence: [
    {
      icpTier: "Primary ICP",
      sequence: [
        {
          order: 1,
          channel: "LinkedIn",
          touchType: "Sponsored content — single image",
          objective: "Problem awareness",
          conversionSignal: "3s video watch or click",
          headlineOrSubject: "Still seeing clicks that never become qualified conversations?",
          subhead: "Founder-led teams fix this first—not with more budget, with one storyline.",
          primaryCopy:
            "Most B2B services brands do not have a demand problem. They have a translation problem: the ad says speed, the landing says depth, the SDR says something else. We mapped how one team realigned hero, ad, and first email in two weeks—and what happened to CPL after. Click through for the one-page before/after (no gate).",
          cta: "Read the one-page map",
          imagePrompt:
            "1080x1080 static: split panel left cluttered analytics (muted), right calm message map on laptop; navy #021859 and sky #07B0F2; no logos except small client-safe geometric mark.",
          videoPrompt:
            "Optional 6s bumper for same concept: quick zoom from noisy dashboard to calm laptop; bold supers at 1s and 4s mirroring headline/subhead; no VO; subtle whoosh SFX only.",
          performanceRationale: "Uses Hidden cost / leakage hook; supports Consideration matrix cell (proof asset).",
        },
        {
          order: 2,
          channel: "Email",
          touchType: "Automated nurture — email 1 of 3",
          objective: "Proof",
          conversionSignal: "Guide download",
          headlineOrSubject: "Here is the before/after you clicked for (+ the metric window)",
          primaryCopy:
            "Hi {{first_name}},\n\nYou grabbed the message map from LinkedIn—here is the full one-pager with the metric window we used (12 weeks, pipeline-sourced convos, not vanity clicks).\n\nQuick context: the fix was not 'more content.' It was one promise repeated on the ad, landing H1, and first sales deck slide. If you want the Loom walkthrough that matches this PDF, it is 6 minutes—reply \"loom\" and I will send the link.\n\n— {{sender}}\n\nP.S. If this is not you anymore, one click unsub is at the bottom.",
          cta: "Reply \"loom\" for the walkthrough",
          performanceRationale: "Delivers matrix asset for Consideration; CTA matches convertingCTA family from ICP matrix.",
        },
        {
          order: 3,
          channel: "Sales",
          touchType: "Manual outreach — follow-up to engaged leads",
          objective: "Scope fit",
          conversionSignal: "Calendar booking",
          headlineOrSubject: "Scope fit for {{company}} — 20 minutes, three decisions",
          primaryCopy:
            "{{first_name}}—you engaged with our proof sequence. If timing is real this quarter, here is a 20-minute scope fit: we will confirm goal, pick one metric to move first, and tell you honestly if we are the right crew. Cal link: [calendar]. If not ready, reply \"later\" and I will quiet the thread.",
          cta: "[Book 20-minute scope fit]",
          performanceRationale: "Aligns with Decision-stage matrix CTA and salesHandoffTrigger (budget/timeline language).",
        },
      ],
      criticalTouch: "Email #2 with case snippet + single CTA",
      salesHandoffTrigger: "Demo request or reply mentioning budget/timeline",
    },
  ],
  behavioralSignalLibrary: [
    {
      icpTier: "Primary ICP",
      signal: "Pricing or services page 2+ visits in 7 days",
      indicatesStageTransition: "Consideration → Decision",
      triggeredAction: "Enroll in 3-email proof sequence; retarget with LinkedIn static using same headline.",
      recommendedChannels: ["Email", "LinkedIn Sponsored Content"],
      primaryHeadline:
        "Your pricing page visits signal a real evaluation — here is the proof block buyers asked for last quarter",
      subhead: "Three touches, one CTA: the 12-week plan outline your CFO-friendly peers used.",
      primaryBody:
        "Hi {{first_name}},\n\nNoticed you back on pricing/services this week—that usually means evaluation mode, not browsing. Attached is the same one-page outline we give teams before a scope call: what gets locked in weeks 1-4, what proof we ship, and the one metric we agree to move first.\n\nIf it resonates, the next step is a 20-minute scope fit (calendar below). If not, reply \"pass\" and we will close the loop.\n\n— {{sender}}",
      cta: "Download the plan outline",
      imagePrompt:
        "LinkedIn static 1200x627: headline text as overlay (max 2 lines), proof doc thumbnail, navy band, high contrast.",
      videoPrompt:
        "LinkedIn / Meta 15s: first frame matches static headline; 2–10s kinetic text + doc pages flipping; 11–13s founder 2s sound-bite; 14–15s CTA card; captions burned-in; safe for muted autoplay.",
      performanceRationale: "Ties to Consideration→Decision transition; reuses Hidden cost + proof hooks; mirrors matrix CTA language.",
    },
  ],
  hookTypePerformance: [
    {
      icpTier: "Primary ICP",
      reliableHookTypes: [
        { hookType: "Hidden cost / leakage", whyItConverts: "Matches founder fear of wasted spend on wrong-fit traffic." },
        { hookType: "Before/after mechanism", whyItConverts: "Shows how you work without fluff." },
      ],
      hookTypesToAvoid: [
        { hookType: "Generic inspiration quotes", whyToAvoid: "Reads as consumer B2C; erodes trust for services buyers." },
      ],
    },
  ],
};

export const previewActivationContent = {
  activationPersonaIcpBanner:
    "Activation plans are mapped to your buyer context: Founder-led service firms · Growth operators · Sales enablement stakeholders.",
  activationSegmentPlansBody:
    "Primary ICP\n" +
    "Founder-led B2B service firms (10–50 employees) with inconsistent demand quality and founder-owned messaging.\n\n" +
    "Content × funnel execution matrix (paste into briefs)\n" +
    "— Primary ICP × Consideration —\n" +
    "Winning format: 6-minute Loom walkthrough + one-page before/after PDF\n" +
    "Why it converts: Shows mechanism and timeline without a sales call.\n" +
    "Message pillar: Credibility\n" +
    "Required in asset: named metric window, role-specific example, single CTA\n" +
    "Use this CTA: \"See the 12-week message-system map\"\n\n" +
    "— Primary ICP × Decision —\n" +
    "Winning format: Scoped workshop proposal (3 slides) + calendar link\n" +
    "Why it converts: Reduces fear of open-ended consulting spend.\n" +
    "Message pillar: Conversion\n" +
    "Use this CTA: \"Book a 20-minute scope fit\"\n\n" +
    "Behavioral triggers → actions (automations & plays)\n" +
    "Signal: Pricing page 2+ visits in 7 days (Primary ICP)\n" +
    "Stage shift: Consideration → Decision\n" +
    "Channels: Email, LinkedIn Sponsored Content\n" +
    "Headline / subject: \"Your pricing page visits signal a real evaluation — here’s the proof block buyers asked for last quarter\"\n" +
    "Body / script:\n" +
    "We packaged the same before/after narrative your peers used to justify budget. One CTA: review the 12-week plan outline.\n" +
    "CTA: Download the plan outline\n" +
    "Play summary: Enroll in 3-email proof sequence; retarget with LinkedIn static using the same headline.\n\n" +
    "Multi-touch sequence — Primary ICP\n" +
    "  Step 1: LinkedIn | Touch: Sponsored content | Objective: Problem awareness | Signal: 3s video watch\n" +
    "  Step 2: Email | Touch: Automated nurture | Objective: Proof | Signal: guide download\n" +
    "  Step 3: Sales | Touch: Manual outreach | Objective: Scope fit | Signal: calendar booking\n" +
    "Critical touch: Email #2 with case snippet\n" +
    "Sales handoff when: Demo request or reply with budget/timeline language",
  buyerJourneySummary:
    "Aware: Publish POV-led visibility assets that diagnose the hidden cost of channel/message drift.\n\n" +
    "Consider: Sequence proof assets (before/after narrative, mechanism explanation, role-specific examples) and route by intent signal.\n\n" +
    "Decide: Present one implementation path with owner map, 30/60/90 milestones, and low-risk first sprint scope.\n\n" +
    "Closed/Won: Hand off with activation checklist, KPI baseline, and weekly review ritual to protect execution quality.",
  competitiveMatrixSummary:
    "Differentiate on execution depth, not generic strategy claims. Competitors emphasize speed or tooling breadth; Acme wins by linking strategy decisions to owner-ready channel execution.\n\n" +
    "Competitive motion plan:\n" +
    "- Use comparison proof blocks on high-intent pages.\n" +
    "- Arm sales with 3 short rebuttal scripts tied to common alternatives.\n" +
    "- Publish quarterly 'what changed and why' narrative updates to keep positioning current.",
  activationRoadmapPlansBody:
    "Phase 1 (Weeks 1-3): Message-system lock and channel alignment.\n" +
    "- Deliverables: refreshed core offer page, paid/social message matrix, welcome sequence v1.\n\n" +
    "Phase 2 (Weeks 4-7): Proof and nurture acceleration.\n" +
    "- Deliverables: case-study asset set, comparison page, objection-aware follow-up branch.\n\n" +
    "Phase 3 (Weeks 8-12): Scale and governance.\n" +
    "- Deliverables: editorial cadence, weekly KPI review, spend reallocation rules by lead quality.",
  channelPlans: {
    positioning:
      "Align paid ads, organic social, and landing page language to one clear category and differentiator.",
    messaging:
      "Create three message pillars with supporting proof assets and repeat across all channels.",
    "voice-copy":
      "Document voice rules and examples so contributors can produce consistent on-brand drafts.",
    email:
      "Welcome sequence (3 emails):\n" +
      "1) Subject: \"Where qualified demand gets lost\" -> diagnose current funnel leakage + CTA to 12-week plan.\n" +
      "2) Subject: \"How Acme fixes message-channel drift\" -> mechanism + mini case proof.\n" +
      "3) Subject: \"Your first 14-day activation sprint\" -> owner map + kickoff CTA.\n\n" +
      "Nurture sequence (weekly): insight -> proof -> implementation.\n" +
      "Re-engagement trigger: no click in 14 days -> send concise benchmark + single next step.",
    social:
      "Weekly rhythm:\n" +
      "- Mon: POV diagnosis post (problem framing)\n" +
      "- Wed: proof post (before/after or process screenshot)\n" +
      "- Fri: tactical breakdown (how-to with CTA)\n\n" +
      "Every post maps to one pillar and one stage; no mixed CTA posts.",
    "content-seo":
      "Priority topic cluster: messaging consistency, conversion-ready positioning, and founder-led GTM execution.\n" +
      "Build 1 pillar page + 4 supporting intent pages.\n" +
      "AEO layer: publish concise FAQ blocks and answer-first sections for AI retrieval.\n" +
      "Each page ends with one stage-matched CTA and proof snippet.",
    website:
      "Refresh key pages for clarity, proof hierarchy, and conversion intent.",
    "lead-gen":
      "Deploy one high-fit lead asset and route follow-up by intent.",
    "strategic-planning":
      "Sequence work into a 30/60/90 activation cadence with ownership and metrics.",
    "persona-messaging":
      "Adjust emphasis by persona while preserving a consistent voice.",
    "full-funnel":
      "Map messages and CTAs by awareness, consideration, and decision stages.",
    campaigns:
      "Quarterly campaign architecture:\n" +
      "Theme -> hook set -> channel brief -> launch checklist -> weekly optimization loop.\n" +
      "Every campaign brief includes audience trigger, core claim, proof asset, CTA, owner, and KPI.",
    pr:
      "Quarterly media angle framework:\n" +
      "- Angle: Why service brands stall after initial traction.\n" +
      "- Hook: Message-channel fragmentation increases CAC and slows close velocity.\n" +
      "- Targets: operator-focused podcasts, growth newsletters, B2B practitioner publications.\n" +
      "- Reuse: convert placements into nurture proof assets and sales enablement snippets.",
    ads:
      "Paid structure:\n" +
      "- 3 message angles (diagnosis, proof, execution path)\n" +
      "- Segment-specific ad sets by role + intent\n" +
      "- Landing page parity rule: ad claim must match hero + proof + CTA sequence.\n" +
      "Scale based on qualified opportunity rate, not click metrics alone.",
    "advanced-strategy":
      "Track competitive shifts and adapt narrative without diluting core positioning.",
  },
};

const PREVIEW_ENGINE_MACRO =
  "Qualified workshop scope call for the 90-Day Narrative & Channel Operating Plan (budget + timeline agreed)";
const PREVIEW_ENGINE_OFFER = "90-Day Narrative & Channel Operating Plan";

/**
 * Blueprint+ shaped `full_report` slice — drives `buildActivationDiagnostics` so preview
 * channelPlans / journey / roadmap copy stays aligned with engine output (regenerated sample).
 */
export const previewFullBlueprintReport: Record<string, unknown> = {
  _meta: { tier: "blueprint_plus" },
  emailMarketingFramework: {
    overview:
      "Lifecycle email advances the same macro conversion as paid and social: proof first, one CTA per touch, same offer name in subject and body.",
    conversionSpine: {
      primaryMacroConversion: PREVIEW_ENGINE_MACRO,
      primaryOfferAnchor: PREVIEW_ENGINE_OFFER,
      advancesConversion:
        "Nurtures consideration-stage buyers with staged proof until they book the scope workshop or download the alignment asset tied to the primary offer.",
    },
    welcomeSequence: {
      description: "Three-email spine: leak diagnosis → mechanism → bounded next step.",
      emails: [
        {
          timing: "Day 0",
          subject: "Where qualified demand gets lost (3 surfaces to check)",
          purpose: "Diagnose message-channel drift without blaming the team.",
          keyMessage:
            "If hero, first outbound line, and nurture subject disagree, you are taxing your own CPL—here is the 12-week fix outline.",
          ctaButton: "Read the 12-week plan outline",
        },
        {
          timing: "Day 2",
          subject: "How Acme fixes narrative drift in two weeks",
          purpose: "Mechanism + one anonymized before/after frame.",
          keyMessage: "One owner map, one metric window, three surfaces locked first—no rebrand required.",
          ctaButton: "See the one-page map",
        },
        {
          timing: "Day 5",
          subject: "Your first 14-day activation sprint",
          purpose: "Bounded pilot CTA matching sales talk track.",
          keyMessage: "Book a 20-minute scope fit—we confirm goal, metric, and owners; you leave with a dated RACI.",
          ctaButton: "Book scope fit",
        },
      ],
    },
    segmentationStrategy: "Route by intent: pricing revisits → fast-track proof branch; education-only → weekly nurture.",
    subjectLineFormulas: ["Hidden cost: {symptom} → {mechanism}", "Proof: {metric window} on {surface}"],
    sendCadence: "Tue/Thu sends; one re-engagement branch after 14d no click.",
  },
  socialMediaStrategy: {
    overview:
      "Social earns trust for the same offer story paid pushes—no second promise, softer CTAs early, same landing path on conversion posts.",
    conversionSpine: {
      primaryMacroConversion: PREVIEW_ENGINE_MACRO,
      primaryOfferAnchor: PREVIEW_ENGINE_OFFER,
      advancesConversion:
        "Builds authority and repeatable hooks so cold and warm audiences recognize the same offer name before they hit paid or email retargeting.",
    },
    platforms: [
      {
        platform: "LinkedIn",
        whyThisPlatform: "Founder and operator ICP live evaluation-mode here.",
        audienceOnPlatform: "Primary ICP: founder-led B2B services; secondary: growth marketers.",
        contentStrategy: "Mon POV / Wed proof / Fri tactical; each maps to one pillar.",
        postingFrequency: "3× weekly",
        contentMix: "40% pillar / 35% proof / 25% offer-adjacent clarity",
        examplePosts: [
          "Most pipeline leaks are translation leaks—same week: pick one promise across ad, LP, email.",
          "Before/after: 12-week message map + one metric window (anonymized).",
        ],
        exampleImagePrompts: [
          "1080×1080 split: noisy dashboard vs calm laptop with aligned headlines; navy/sky palette.",
        ],
        exampleVideoPrompts: ["9:16 hook in 2s; captions on; CTA card matches nurture subject line."],
        kpiToTrack: "Save rate + profile visits from ICP titles",
        competitorInsight: "Competitors post generic inspiration; you post mechanism + metric.",
        growthTactics: ["Comment-to-DM playbook for “map” replies"],
      },
    ],
    platformsToAvoid: { platforms: ["TikTok"], reasoning: "ICP not in evaluation mode there for this offer." },
    crossPlatformStrategy: "Repurpose LinkedIn longform into email deep link + paid retarget creative using same headline.",
  },
  seoStrategy: {
    overview: "SEO captures research-mode intent and routes to the same landing story as paid—not a parallel storyline.",
    conversionSpine: {
      primaryMacroConversion: PREVIEW_ENGINE_MACRO,
      primaryOfferAnchor: PREVIEW_ENGINE_OFFER,
      advancesConversion:
        "Earns high-intent visits on problem/solution queries and lands them on pages that repeat the primary-offer headline and CTA family.",
    },
    primaryKeywords: [
      {
        keyword: "b2b messaging alignment",
        intent: "Commercial investigation",
        contentAngle: "Pillar page tying drift → operating plan offer",
        pillarConnection: "Messaging",
      },
      {
        keyword: "founder led services pipeline quality",
        intent: "Problem aware",
        contentAngle: "Supporting guide with CTA to plan outline",
        pillarConnection: "Conversion",
      },
    ],
    contentSEOPlaybook:
      "One pillar + four supporting pages; every H2 ends with FAQ block; single stage-matched CTA per page matching email/paid vocabulary.",
  },
  aeoStrategy: {
    overview: "AEO answers should route readers to the same proof modules and CTA stack as organic landing pages.",
    conversionSpine: {
      primaryMacroConversion: PREVIEW_ENGINE_MACRO,
      primaryOfferAnchor: PREVIEW_ENGINE_OFFER,
      advancesConversion:
        "Surfaces concise, citation-friendly answers that point to the primary offer pages and FAQs sales already use.",
    },
    faqStrategy: {
      overview: "FAQ targets match sales objections and matrix cells.",
      priorityFAQs: [
        "What is message-channel drift?",
        "How long until we see pipeline-quality movement?",
        "What do we get in the first 14 days of the operating plan?",
      ],
    },
  },
  thoughtLeadershipStrategy: {
    overview: "Authority placements make the macro CTA credible—same proof language as nurture and late-funnel pages.",
    conversionSpine: {
      primaryMacroConversion: PREVIEW_ENGINE_MACRO,
      primaryOfferAnchor: PREVIEW_ENGINE_OFFER,
      advancesConversion:
        "Earns third-party validation and speaking hooks that feed nurture proof blocks and sales leave-behinds—not a separate storyline.",
    },
    authorityPositioning: { expertiseAreas: ["GTM narrative"], uniquePerspective: "Diagnostic-to-shipped rhythm", targetOutlets: [] },
    speakingTopics: [],
    mediaAngles: [
      {
        angle: "Why service brands stall after traction",
        hook: "Fragmented messaging raises CAC before competitors do",
        targetMedia: "Operator newsletters",
        talkingPoints: ["One metric window", "Owner map", "14-day artifact"],
      },
    ],
    authorityContentPlan: { pillarContent: [], distributionStrategy: "Quarterly", cadence: "Monthly deep dives" },
    prPositioning: { mediaReadyBio: "", boilerplate: "", mediaKitRecommendations: "" },
  },
  paidMediaStrategy: { ...previewPaidMediaStrategy },
  customerJourneyMap: {
    overview: "Journey stages align CTAs to the same macro conversion with increasing proof density.",
    stages: [
      {
        stage: "Aware",
        customerMindset: "Skeptical of another strategy engagement",
        messagingFocus: "Name the hidden tax of drift",
        conversionTrigger: "Soft CTA: read map / subscribe",
        personaVariations: [{ persona: "Founder", adaptation: "Lead with revenue rhythm language" }],
      },
      {
        stage: "Consider",
        customerMindset: "Comparing vendors; needs mechanism",
        messagingFocus: "Proof + timeline",
        conversionTrigger: "Guide or Loom CTA",
        personaVariations: [],
      },
      {
        stage: "Decide",
        customerMindset: "Needs bounded risk",
        messagingFocus: "Pilot scope + owners",
        conversionTrigger: "Book 20-min scope fit",
        personaVariations: [],
      },
      {
        stage: "Closed/Won",
        customerMindset: "Expecting fast time-to-value without surprise scope",
        messagingFocus: "Activation checklist + KPI baseline + weekly governance",
        conversionTrigger: "Kickoff pack + first customer-visible artifact date",
        personaVariations: [],
      },
    ],
  },
  competitivePositioning: {
    differentiationSummary:
      "Acme Co wins on diagnostic-to-shipped rhythm with named owners—not decks alone.",
    strategicWhitespace: "Own operating checkpoints for founder-led B2B services.",
    movementPlan: "Quarterly: refresh battle cards; monthly: proof module beside every late CTA.",
    vulnerabilities: "If proof stays on About, rivals with clearer ROI stories win late funnel.",
  },
  ninetyDayRoadmap: {
    overview: "Phased delivery with customer-visible artifacts each phase.",
    phase1: {
      name: "Phase 1 — Lock",
      objective: "One storyline on hero, welcome v1, paid message matrix",
      weeks: [
        {
          weekNumber: 1,
          focus: "Audit + owner map",
          tasks: [{ task: "Hero vs outbound vs deck opener audit", deliverable: "Redline doc" }],
        },
        {
          weekNumber: 2,
          focus: "Channel alignment",
          tasks: [{ task: "Paid + organic headline parity", deliverable: "Message matrix v1" }],
        },
      ],
    },
    phase2: {
      name: "Phase 2 — Proof",
      objective: "Case snippets + comparison module",
      weeks: [
        {
          weekNumber: 5,
          focus: "Proof assets",
          tasks: [{ task: "Late-funnel proof module", deliverable: "Web + deck slides" }],
        },
      ],
    },
    phase3: {
      name: "Phase 3 — Scale",
      objective: "Cadence + governance",
      weeks: [
        {
          weekNumber: 9,
          focus: "Operating rhythm",
          tasks: [{ task: "Weekly KPI review", deliverable: "Scorecard template" }],
        },
      ],
    },
  },
  personaDrivenSegmentation: previewPersonaDrivenSegmentation,
  audiencePersonaDefinition: previewAudiencePersonaDefinition,
  icpConversionIntelligenceFramework: previewIcpConversionIntelligenceFramework,
  conversionStrategy: {
    howTrustIsBuilt: "Mechanism-first proof; named windows.",
    howClarityDrivesAction: "One CTA per email and landing block.",
    ctaHierarchy: [
      { level: "Primary", action: "Book scope fit", context: "High intent" },
      { level: "Secondary", action: "Download plan outline", context: "Mid funnel" },
    ],
    leadCaptureRecommendations: {
      leadPath: "create_new",
      primaryPickTitle: "Message alignment kit (PDF)",
      supportiveContext: "Threads through email, social, and paid as the soft conversion path.",
    },
  },
};

/** Merge engine-shaped preview diagnostics (same path as live Blueprint+ reports). */
export function getPreviewActivationEngineMerge(companyName = "Acme Co"): ActivationDiagnostics {
  return buildActivationDiagnostics(previewFullBlueprintReport, companyName);
}
