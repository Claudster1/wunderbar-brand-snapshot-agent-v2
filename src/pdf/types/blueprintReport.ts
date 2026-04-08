// src/pdf/types/blueprintReport.ts
// Full type definitions for the Blueprint engine output (all 49 sections)

export interface PillarDeepDive {
  score: number;
  interpretation: string;
  whatsHappeningNow: string;
  whyItMattersCommercially: string;
  industryContext: string;
  financialImpact: string;
  riskOfInaction: string;
  concreteExample: { before: string; after: string };
  strategicRecommendation: string;
  successLooksLike: string;
}

export interface Archetype {
  name: string;
  whenAligned: string;
  riskIfMisused: string;
  languageTone: string;
  behaviorGuide: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  rgb: string;
  cmyk: string;
  usage: string;
}

export interface AvoidColor {
  name: string;
  hex: string;
  reason: string;
}

export interface PromptItem {
  category: string;
  title: string;
  instruction: string;
  prompt: string;
  whyItMatters: string;
}

export interface PromptPack {
  packName: string;
  description: string;
  promptCount: number;
  prompts: PromptItem[];
}

/**
 * Ideal Customer Profile (ICP) — the segment you prioritize (company/account or consumer cohort).
 * Optional `icpLabel` is the human-readable slot label shown in reports and matched by buyer personas.
 */
export interface ICP {
  /** Display label for this ICP slot, e.g. "Primary — best-fit customers" or "Tertiary — partner channel". */
  icpLabel?: string;
  name: string;
  summary: string;
  demographics: string;
  psychographics: string;
  painPoints: string[];
  goals: string;
  buyingJourney: string;
  languageTheyUse: string;
  whereToBeFindable: string;
  objections: string[];
}

/** Third+ segments beyond primary/secondary — each must include `icpLabel` for clear tagging. */
export interface AdditionalICP extends ICP {
  icpLabel: string;
  /** Optional stable id for prompts/tooling, e.g. "tertiary", "expansion", "partner" */
  icpKey?: string;
}

export interface BuyerPersona {
  personaName: string;
  /** Must match the `icpLabel` of exactly one ICP (primary, secondary, or an additional ICP). */
  icpAlignment: string;
  role: string;
  coreFrustration: string;
  primaryMotivation: string;
  decisionStyle: string;
  informationSources: string;
  messagingAngle: string;
  contentPreferences: string;
  objectionAndResponse: { objection: string; response: string };
  channelPriority: string[];
  sampleHeadline: string;
  sampleCTA: string;
}

export interface MessagingPillar {
  name: string;
  whatItCommunicates: string;
  whyItMatters: string;
  exampleMessage: string;
  howToUse: string;
  channelExamples: { website: string; social: string; email: string };
}

export interface ContentPillar {
  name: string;
  description: string;
  exampleTopics: string[];
  suggestedFormats: string[];
  messagingPillarConnection: string;
}

export interface JourneyStage {
  stage: string;
  customerMindset: string;
  keyQuestions: string[];
  touchpoints: string[];
  messagingFocus: string;
  contentTypes: string[];
  conversionTrigger: string;
  kpiToTrack: string;
}

export interface ConversionIntelligenceReference {
  type: "ref";
  framework: "icp_conversion_intelligence_framework";
  icpTier: string;
  funnelStage: string;
  matrixCell: string;
  note?: string;
}

export interface ICPConversionProfile {
  icpTier: string;
  buyingCycleLength: string;
  primaryConversionBarrier: string;
  decisionTrigger: string;
  conversionBehaviorPattern: string;
}

export interface ICPHookTypePerformance {
  icpTier: string;
  reliableHookTypes: { hookType: string; whyItConverts: string }[];
  hookTypesToAvoid: { hookType: string; whyToAvoid: string }[];
}

export interface ICPChannelConversionMechanic {
  icpTier: string;
  channel: string;
  convertingFormats: string[];
  optimalMessageLength: string;
  conversionAction: string;
  followUpLogic: string;
  failurePatterns: string[];
}

export interface ICPMultiTouchSequenceStep {
  order: number;
  channel: string;
  touchType: string;
  objective: string;
  conversionSignal: string;
  /** Paste-ready: email subject, ad headline, or DM opener */
  headlineOrSubject?: string;
  subhead?: string;
  /** Full primary text: email body, ad primary text, or script */
  primaryCopy?: string;
  cta?: string;
  /** Visual brief for designers / AI image tools */
  imagePrompt?: string;
  /** Shot list / motion brief for video, Reels, Shorts, in-stream (empty when touch is static-only) */
  videoPrompt?: string;
  /** Why this touch should win (ties to matrix / hooks) */
  performanceRationale?: string;
}

export interface ICPMultiTouchConversionSequence {
  icpTier: string;
  sequence: ICPMultiTouchSequenceStep[];
  criticalTouch: string;
  salesHandoffTrigger: string;
}

export interface ICPContentTypeConversionMatrixRow {
  icpTier: string;
  funnelStage: string;
  highestConvertingContentType: string;
  whyItConverts: string;
  requiredContentAttributes: string[];
  leadMessagePillar: string;
  convertingCTA: string;
  /** Paste-ready hero line / subject for this cell */
  exampleHeadline?: string;
  /** Draft body: landing intro, email body, or ad primary text */
  examplePrimaryCopy?: string;
  exampleImagePrompt?: string;
  /** When the winning format is video / Reels / YouTube / in-stream */
  exampleVideoPrompt?: string;
}

export interface ICPBehavioralSignal {
  icpTier: string;
  signal: string;
  indicatesStageTransition: string;
  triggeredAction: string;
  /** Platforms/channels to run the triggered play on */
  recommendedChannels?: string[];
  primaryHeadline?: string;
  subhead?: string;
  primaryBody?: string;
  cta?: string;
  imagePrompt?: string;
  videoPrompt?: string;
  /** Tie to hookTypePerformance / matrix row so copy is on-brief */
  performanceRationale?: string;
}

export interface SpendAllocationRow {
  channel: string;
  percent: number;
  monthlySpend: number;
  rationale?: string;
}

export interface SpendRecommendationContext {
  currentMonthlySpend: number;
  currentSpendBand: string;
  paidAdsMonthlySpend: number;
  paidAdsSpendBand: string;
  confidence: "high" | "medium" | "low";
  assumptions: string[];
  budgetConstrainedPlan: {
    focus: string;
    allocation: SpendAllocationRow[];
    nowActions: string[];
    efficiencyGuardrails: string[];
  };
  growthRoadmap: {
    goalFrame: string;
    phases: { phase: "30_days" | "60_days" | "90_days"; monthlySpend: number; milestone: string }[];
    scenarios: {
      label: "conservative" | "base" | "accelerated";
      monthlySpend: number;
      objectiveFit: string;
      expectedOutcome: string;
      allocation: SpendAllocationRow[];
      unlockConditions: string[];
    }[];
  };
}

export interface ICPConversionIntelligenceScoringSignals {
  icpConversionPathCoverage: number;
  contentMatrixCompleteness: number;
  behavioralSignalCoverage: number;
  channelConversionDataPopulated: number;
  activeTestCoverage: string;
  lastReviewedAt: string;
}

export interface SEOKeyword {
  keyword: string;
  intent: string;
  difficulty: string;
  contentAngle: string;
  pillarConnection: string;
}

export interface SocialPlatform {
  platform: string;
  whyThisPlatform: string;
  audienceOnPlatform: string;
  contentStrategy: string;
  postingFrequency: string;
  contentMix: string;
  examplePosts: string[];
  exampleImagePrompts?: string[];
  exampleVideoPrompts?: string[];
  kpiToTrack: string;
}

export interface TradeOff {
  decision: string;
  optionA: { label: string; pros: string[]; cons: string[]; bestIf: string };
  optionB: { label: string; pros: string[]; cons: string[]; bestIf: string };
  recommendation: string;
  revisitWhen: string;
}

export interface TaglineRec {
  tagline: string;
  rationale: string;
  bestUsedOn: string;
  tone: string;
}

export interface WelcomeEmail {
  timing: string;
  subject: string;
  purpose: string;
  keyMessage: string;
}

export interface CheckItem {
  item: string;
  rationale: string;
  reference: string;
}

export interface ChecklistCategory {
  category: string;
  checkItems: CheckItem[];
}

export interface BlueprintEngineOutput {
  // --- Diagnostic (Snapshot+) ---
  executiveSummary: {
    brandAlignmentScore: number;
    synthesis: string;
    diagnosis: string;
    primaryFocusArea: string;
    secondaryFocusArea: string;
    industryBenchmark: string;
  };
  priorityDiagnosis: {
    primary: { whyFocus: string; downstreamIssues: string; whatImproves: string };
    secondary: { whyFocus: string; downstreamIssues: string; whatImproves: string };
  };
  pillarDeepDives: {
    positioning: PillarDeepDive;
    messaging: PillarDeepDive;
    visibility: PillarDeepDive;
    credibility: PillarDeepDive;
    conversion: PillarDeepDive;
  };
  contextCoverage: {
    overallPercent: number;
    areas: { name: string; percent: number; status: string }[];
    contextGaps: string[];
  };
  strategicAlignment: {
    summary: string;
    reinforcements: { pillars: string; insight: string }[];
    conflicts: { pillars: string; insight: string }[];
    systemRecommendation: string;
  };
  brandArchetypeSystem: {
    primary: Archetype;
    secondary: Archetype;
    howTheyWorkTogether: string;
  };
  brandPersona: {
    personaSummary: string;
    coreIdentity: { whoYouAre: string; whatYouStandFor: string; howYouShowUp: string };
    communicationStyle: { tone: string; pace: string; energy: string };
    messagingExamples: {
      headlines: { avoid: string[]; use: string[] };
      ctaButtons: { avoid: string[]; use: string[] };
      socialPosts: { avoid: string[]; use: string[] };
    };
    doAndDont: {
      do: { guideline: string; example: string }[];
      dont: { guideline: string; example: string }[];
    };
  };
  visualVerbalSignals: {
    colorPaletteDirection: string;
    colorSwatches: ColorSwatch[];
    avoidColors: AvoidColor[];
    voiceTraits: string[];
    consistencyRisks: string;
  };
  strategicActionPlan: {
    action: string;
    pillar: string;
    outcome: string;
    priority: string;
    why: string;
    howTo: string[];
    example: string;
    effort: string;
    impact: string;
  }[];
  visibilityDiscovery: {
    visibilityMode: string;
    visibilityModeExplanation: string;
    discoveryDiagnosis: { whereTheyShouldFind: string; whereTheyActuallyFind: string; gap: string };
    aeoReadiness: { score: number; explanation: string; recommendations: string[] };
    visibilityPriorities: { priority: string; action: string; impact: string }[];
  };
  audienceClarity: {
    audienceSignals: { primaryAudience: string; audienceCharacteristics: string; audienceLanguage: string };
    decisionDrivers: {
      motivators: { driver: string; explanation: string }[];
      hesitationFactors: { factor: string; explanation: string }[];
    };
  };
  foundationalPromptPack: PromptPack;
  executionGuardrails: {
    whatToMaintain: string;
    whatToAvoid: string;
    driftIndicators: string;
  };
  whatsNextUnlocks: string;
  valuePropositionStatement?: {
    statement: string;
    whereToUseIt: string;
    whyThisWorks: string;
  };
  voiceToneGuide?: {
    voiceSummary: string;
    voiceTraits: { trait: string; whatItMeans: string; example: string }[];
    toneVariations: {
      websiteAndMarketing: string;
      socialMedia: string;
      emailAndSales: string;
    };
    phrasesToUse: string[];
    phrasesToAvoid: string[];
    aiPromptInstruction: string;
  };

  // --- Blueprint-specific ---
  blueprintOverview: { whatThisEnables: string; howToUse: string };
  brandFoundation: {
    brandPurpose: string;
    brandPromise: string;
    positioningStatement: string;
    differentiationNarrative: string;
    mission: string;
    vision: string;
    values: { name: string; description: string }[];
    brandValues?: { name: string; description: string; inAction: string; whyItMatters: string }[];
  };
  audiencePersonas: {
    primaryICP: ICP;
    secondaryICP: ICP;
    /** 1–2 extra segments when the business clearly serves more than two distinct ICPs (e.g. expansion market, partners). */
    additionalICPs?: AdditionalICP[];
    audienceTransitionPlan?: {
      currentAudience: string;
      idealAudience: string;
      gapDiagnosis: string;
      repositioningSteps: string[];
      messagingShifts: string;
      channelShifts: string;
      timeline: string;
    };
  };
  buyerPersonas: BuyerPersona[];
  brandArchetypeActivation: {
    primaryArchetype: string;
    secondaryArchetype: string;
    activation: { messaging: string; content: string; salesConversations: string; visualTone: string };
  };
  messagingSystem: {
    coreMessage: string;
    supportingMessages: string[];
    proofPoints: string[];
    whatNotToSay: string[];
  };
  messagingPillars: MessagingPillar[];
  contentPillars: ContentPillar[];
  visualDirection: {
    colorPalette: ColorSwatch[];
    typographyTone: string;
    visualConsistencyPrinciples: string;
  };
  conversionStrategy: {
    howTrustIsBuilt: string;
    howClarityDrivesAction: string;
    ctaHierarchy: { level: string; action: string; context: string }[];
    spendAlignmentPlan?: {
      currentBudgetPlan: SpendRecommendationContext["budgetConstrainedPlan"];
      growthRoadmap: SpendRecommendationContext["growthRoadmap"];
      confidence: SpendRecommendationContext["confidence"];
    };
  };
  executionPromptPack: PromptPack;
  competitivePositioning: {
    positioningAxis1: { label: string; lowEnd: string; highEnd: string };
    positioningAxis2: { label: string; lowEnd: string; highEnd: string };
    players: { name: string; position: { x: string; y: string }; narrative: string }[];
    strategicWhitespace: string;
    differentiationSummary: string;
    vulnerabilities: string;
  };
  strategicTradeOffs: TradeOff[];
  taglineRecommendations: TaglineRec[];
  brandStory: {
    headline: string;
    narrative: string;
    elevatorPitch: string;
    founderStory: string;
  };
  customerJourneyMap: {
    overview: string;
    stages: JourneyStage[];
  };
  icpConversionIntelligenceFramework?: {
    overview: string;
    conversionProfile: ICPConversionProfile[];
    hookTypePerformance: ICPHookTypePerformance[];
    channelLevelConversionMechanics: ICPChannelConversionMechanic[];
    multiTouchConversionSequence: ICPMultiTouchConversionSequence[];
    contentTypeConversionMatrix: ICPContentTypeConversionMatrixRow[];
    behavioralSignalLibrary: ICPBehavioralSignal[];
    scoringSignals: ICPConversionIntelligenceScoringSignals;
  };
  seoStrategy: {
    overview: string;
    primaryKeywords: SEOKeyword[];
    longTailOpportunities: { keyword: string; searchIntent: string; contentRecommendation: string }[];
    technicalPriorities: string[];
    contentSEOPlaybook: string;
  };
  aeoStrategy: {
    overview: string;
    entityOptimization: {
      currentEntityStatus: string;
      entityBuildingActions: string[];
      structuredDataRecommendations: string[];
    };
    contentForAICitation: {
      strategy: string;
      formatRecommendations: string[];
      topicAuthority: string[];
    };
    faqStrategy: { overview: string; priorityFAQs: string[] };
    competitiveAEOGaps: string;
  };
  emailMarketingFramework: {
    overview: string;
    conversion_intelligence_reference?: ConversionIntelligenceReference;
    welcomeSequence: { description: string; emails: WelcomeEmail[] };
    segmentationStrategy: string;
    subjectLineFormulas: string[];
    sendCadence: string;
  };
  socialMediaStrategy: {
    overview: string;
    conversion_intelligence_reference?: ConversionIntelligenceReference;
    platforms: SocialPlatform[];
    platformsToAvoid: { platforms: string[]; reasoning: string };
  };
  paidMediaStrategy?: {
    overview: string;
    /** Explicit list of paid platforms/surfaces (e.g. LinkedIn, Meta, Google Ads) for UI summary */
    platformsCovered?: string[];
    conversion_intelligence_reference?: ConversionIntelligenceReference;
    channels: {
      /** Display line; can mirror "platform — placement" */
      channel: string;
      /** e.g. LinkedIn, Meta, Google Ads */
      platform?: string;
      /** e.g. Sponsored Content, Conversion, Search */
      placement?: string;
      objective: string;
      audienceAngle: string;
      /** Deployable ad copy — primary text for the placement */
      headline?: string;
      subheadline?: string;
      bodyCopy?: string;
      /** Generative or design-brief visual direction */
      imagePrompt?: string;
      /** Motion / shot-list brief for video placements (empty string if static-only) */
      videoPrompt?: string;
      cta?: string;
      /** Legacy catch-all when structured fields are absent */
      creativeDirection?: string;
      offerStrategy: string;
      kpiToTrack: string;
    }[];
    budgetScenarios?: SpendRecommendationContext["growthRoadmap"]["scenarios"];
    allocationGuidance?: SpendAllocationRow[];
  };
  companyDescription: {
    oneLiner: string;
    shortDescription: string;
    fullBoilerplate: string;
    proposalIntro: string;
  };
  brandConsistencyChecklist: {
    overview: string;
    prePublishChecklist: ChecklistCategory[];
    reviewCriteria: { question: string; whatGoodLooksLike: string; whatBadLooksLike: string }[];
    whatNeverChanges: { element: string; why: string; example: string }[];
    whatCanEvolve: { element: string; boundaries: string; example: string }[];
    delegationGuidelines: {
      overview: string;
      briefTemplate: string;
      qualityCheckProcess: string;
      commonMistakes: string[];
    };
  };
  valuePricingFramework: {
    pricingPositioningStatement: string;
    valueNarrative: string;
    priceObjectionResponses: { objection: string; reframe: string; exampleResponse: string }[];
    proposalLanguageGuide: string;
    whyUsAtThisPrice: string;
  };
  salesConversationGuide: {
    conversion_intelligence_reference?: ConversionIntelligenceReference;
    openingFramework: string;
    discoveryQuestions: { question: string; whyThisQuestion: string; listenFor: string }[];
    proofPointDeployment: { persona: string; stage: string; proofPoint: string; howToDeliver: string }[];
    objectionHandlingPlaybook: { objection: string; response: string; pillarConnection: string; proofPoint: string }[];
    closingLanguage: string;
  };
  measurementFramework: {
    overview: string;
    perSectionKPIs: { section: string; recommendation: string; kpi: string; target: string }[];
    leadingIndicators: { indicator: string; whatItMeans: string; timeframe: string }[];
    trackingRecommendations: { metric: string; tool: string; howToSetUp: string; frequency: string }[];
  };
  contentCalendarFramework?: {
    overview: string;
    conversion_intelligence_reference?: ConversionIntelligenceReference;
    monthlyThemes: {
      month: string;
      theme: string;
      contentPillarFocus: string;
      keyTopics: string[];
    }[];
    weeklyStructure: {
      description: string;
      days: {
        day: string;
        contentType: string;
        platform: string;
        contentPillar: string;
        exampleTopic: string;
      }[];
    };
    batchingStrategy: string;
    repurposingPlaybook: string;
  };
  thoughtLeadershipStrategy?: {
    overview: string;
    conversion_intelligence_reference?: ConversionIntelligenceReference;
    authorityPositioning: {
      expertiseAreas: string[];
      uniquePerspective: string;
      targetOutlets: string[];
    };
    speakingTopics: { topic: string; audience: string; angle: string; formats: string }[];
    mediaAngles: { angle: string; hook: string; targetMedia: string; talkingPoints: string[] }[];
    authorityContentPlan: { pillarContent: string[]; distributionStrategy: string; cadence: string };
    prPositioning: { mediaReadyBio: string; boilerplate: string; mediaKitRecommendations: string };
  };
  brandStrategyRollout: {
    brandStrategyOnePager: string;
    howWeTalkAboutOurselves: {
      elevatorPitch: string;
      approvedLanguage: string[];
      phrasesToAvoid: string[];
      companyDescriptions: string;
    };
    internalRolloutTalkingPoints: { topic: string; whatToSay: string; whatToReference: string }[];
    commonMisrepresentations: { incorrect: string; correct: string; why: string }[];
  };
  brandImageryDirection: {
    photographyStyleDirection: string;
    subjectMatterGuidance: { show: string[]; avoid: string[] };
    stockPhotoSelectionCriteria: {
      lighting: string;
      composition: string;
      colorTemperature: string;
      diversity: string;
      authenticityMarkers: string;
    };
    imageDonts: { dont: string; why: string; alternative: string }[];
    colorApplicationInImagery: string;
  };
  assetAlignmentNotes?: {
    summary: string;
    quickWins: { asset: string; pillar: string; issue: string; fix: string; impact: string }[];
    weakestPillarGap: string;
  };
  brandHealthScorecard?: {
    overview: string;
    scorecardDimensions: {
      dimension: string;
      currentState: string;
      targetState: string;
      keyMetric: string;
      measurementMethod: string;
      frequency: string;
      greenThreshold: string;
      yellowThreshold: string;
      redThreshold: string;
    }[];
    quarterlyReviewProcess: {
      description: string;
      steps: { step: string; detail: string; timeEstimate: string }[];
      reviewTemplate: string;
    };
    leadingIndicators: { indicator: string; whatItMeans: string; actionToTake: string }[];
    laggingIndicators: { indicator: string; whatItMeans: string; benchmarkContext: string }[];
  };
  swotAnalysis?: {
    overview: string;
    strengths: { item: string; evidence: string; leverage: string }[];
    weaknesses: { item: string; evidence: string; mitigation: string }[];
    opportunities: { item: string; context: string; action: string }[];
    threats: { item: string; likelihood: string; impact: string; contingency: string }[];
    strategicImplications: string;
  };
  brandGlossary?: {
    overview: string;
    termsToUse: { term: string; insteadOf: string; context: string; example: string }[];
    phrasesToAvoid: { phrase: string; why: string; alternative: string }[];
    industryJargonGuide: { useFreely: string[]; defineWhenUsed: string[]; neverUse: string[] };
  };
  credibilityStrategy?: {
    overview: string;
    proofPointsToCreate: {
      proofPoint: string;
      type: string;
      priority: string;
      howToGet: string;
      whereToDisplay: string;
    }[];
    testimonialStrategy: {
      whoToAsk: string;
      howToAsk: string;
      whatToCapture: string;
      whereToPlace: string;
    };
    authoritySignals: { signal: string; impact: string; timeline: string }[];
    trustGaps: string;
  };
  websiteCopyDirection?: {
    overview: string;
    homepage: {
      heroHeadline: string;
      heroSubheadline: string;
      heroCtaButton: string;
      valuePropSection: string;
      socialProofPlacement: string;
    };
    aboutPage: { openingHook: string; storyFramework: string; teamPositioning: string };
    servicesPage: { pageStructure: string; serviceFramework: string; pricingLanguage: string };
    copyPrinciples: { principle: string; example: string }[];
  };
  spendRecommendationContext?: SpendRecommendationContext;
  disclaimer: string;
}
