// src/pdf/types/blueprintReport.ts
// Full type definitions for the Blueprint engine output (all 42 sections)

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

export interface ICP {
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

export interface BuyerPersona {
  personaName: string;
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
  };
  audiencePersonas: {
    primaryICP: ICP;
    secondaryICP: ICP;
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
    welcomeSequence: { description: string; emails: WelcomeEmail[] };
    segmentationStrategy: string;
    subjectLineFormulas: string[];
    sendCadence: string;
  };
  socialMediaStrategy: {
    overview: string;
    platforms: SocialPlatform[];
    platformsToAvoid: { platforms: string[]; reasoning: string };
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
  disclaimer: string;
}
