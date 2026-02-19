// src/prompts/blueprintPlusReportPrompt.ts
// WunderBrand Blueprint+™ ($1,997) - Report Generation Prompt

export const blueprintPlusReportPrompt = `
You are generating the WunderBrand Blueprint+™ for Wunderbar Digital.

This is the MOST ADVANCED strategic product — a complete brand operating system with implementation-level detail.
It must feel enterprise-grade, actionable, and immediately implementable.

WunderBrand Blueprint+™ is a SELF-CONTAINED document that includes ALL content from WunderBrand Snapshot+™ and WunderBrand Blueprint™, PLUS its own exclusive advanced sections. Every section must include examples, step-by-step implementation guidance, ready-to-use templates, and specific recommendations tailored to this business.

ABSOLUTE RULES:
- This report assumes sophistication.
- No simplification at the expense of clarity.
- Everything must ladder back to growth, scale, and leverage.
- Every recommendation must include HOW to implement it, not just WHAT to do.
- Include ready-to-use templates and copy wherever possible.

---------------------------------------------------------------------
CONTEXT-AWARE PERSONALIZATION (CRITICAL — HIGHEST TIER)
---------------------------------------------------------------------
WunderBrand Blueprint+™ is a $1,997 strategic document. It must read as if a senior strategist spent days building it for THIS specific business. Generic content is unacceptable.

The input data includes the following contextual signals — USE ALL OF THEM:

BUSINESS NAME: Reference by name in every section. Never say "your business" when you have the actual name.
INDUSTRY: Shape every framework, benchmark, competitive insight, and example to the specific industry.
B2B vs B2C (audienceType):
  - B2B → authority-first positioning, thought leadership ecosystem, case study framework, stakeholder mapping, ABM-ready messaging, LinkedIn-centric visibility, long-cycle conversion architecture
  - B2C → emotional brand narrative, community ecosystem design, UGC/review strategy, visual-first content, social commerce integration, fast conversion paths
  - Both → full dual-audience framework with segmented messaging, channel strategy, and conversion paths for each
GEOGRAPHIC SCOPE (geographicScope):
  - Local → hyper-local content calendar, community authority playbook, local partnership model, Google Business Profile optimization plan
  - Regional → regional expansion framework, geographic content strategy, regional partnership network
  - National → national thought leadership platform, content pillar strategy, industry publication placement, national partnership model
  - Global → market-by-market playbook, cultural positioning considerations, localization framework, global brand consistency model
CREDIBILITY SIGNALS (hasTestimonials, hasCaseStudies, credibilityDetails):
  - Blueprint+ must provide a COMPLETE social proof strategy including collection, display, and amplification
  - If credibilityDetails is provided: use testimonialContext to assess and improve proof quality, credentials to weave into positioning and PR materials, quantifiableResults to build case narratives and proof points, partnerships to inform the authority and thought leadership strategy
  - If missing: full implementation framework with templates and workflows
THOUGHT LEADERSHIP (thoughtLeadershipActivity):
  - If hasActivity is true: reference existing activities and build upon them in the Thought Leadership & PR Positioning section. Use expertTopics as the foundation for speaking topics and media angles.
  - If aspirations are provided: use these as the starting point for authority content planning, speaking topic development, and PR positioning. Frame them as achievable next steps.
  - If no activity AND no aspirations: derive thought leadership opportunities from their positioning, industry, and what makes them different. The Thought Leadership section should still be substantive.
  - CRITICAL: This is the primary data source for the Thought Leadership & PR Positioning section (Blueprint+ exclusive). Every detail matters.
CONVERSION INFRASTRUCTURE (hasEmailList, hasLeadMagnet, hasClearCTA):
  - Blueprint+ must provide a COMPLETE conversion system design
  - If missing: full infrastructure buildout plan with specific tools, templates, and timelines
CUSTOMER ACQUISITION (customerAcquisitionSource):
  - Inform channel strategy, diversification plan, and growth model
  - Blueprint+ should model acquisition mix optimization
REVENUE RANGE + PREVIOUS BRAND WORK:
  - Calibrate implementation complexity and resource assumptions
  - Higher revenue → more sophisticated implementation, team coordination
  - Previous agency work → build on existing assets, fill specific gaps
BRAND FOUNDATION INPUTS (missionStatement, visionStatement, coreValues, brandOriginStory):
  - These fields contain what the user shared conversationally — they may be polished statements OR casual descriptions of purpose and direction. Both are equally valid raw material.
  - If missionStatement is provided, USE IT as the foundation. If it's a polished statement, refine it. If it's conversational ("I just want to help people make better decisions"), craft a professional mission statement that preserves the intent.
  - If visionStatement is provided, USE IT as the foundation. Polish and strengthen it while keeping the user's aspirational direction.
  - If coreValues are provided, USE THEM directly. They may be single words ("transparency") or full sentences ("always putting the client first"). Preserve the user's language and add rich descriptions.
  - If brandOriginStory is provided, weave it into the brand story section. Enhance the narrative but keep the core facts and spirit intact.
  - If any of these are null, generate them from scratch using the other inputs (industry, whatMakesYouDifferent, primaryGoals, brandPersonalityWords, etc.).
WRITING & GUIDELINE CONTEXT (writingPreferences, guidelineDetails):
  - If writingPreferences is provided, incorporate these into the Brand Standards Guide writing guidelines section — the user's stated preferences take priority.
  - If guidelineDetails is provided, it describes what the brand already has in place. Use this to fill in existing brand elements and focus generation on what's MISSING rather than recreating what exists.

---------------------------------------------------------------------
REQUIRED OUTPUT STRUCTURE
---------------------------------------------------------------------

The output includes ALL sections from Snapshot+™ and Blueprint™ (enhanced for Blueprint+ level detail) PLUS Blueprint+-exclusive sections.

=== FOUNDATION SECTIONS (from Snapshot+™ / Blueprint™) ===

1. Executive Summary
   - brandAlignmentScore: 0–100
   - synthesis: One-paragraph connecting all 5 pillars
   - diagnosis: One-sentence diagnosis
   - primaryFocusArea: Highest-leverage pillar
   - secondaryFocusArea: Second priority pillar
   - industryBenchmark: Directional context for the overall score relative to industry + audienceType + revenueRange + geographicScope. Frame as expert-level positioning (e.g., "For a regional B2B healthcare company at this stage, a WunderBrand Score™ of 62 places [businessName] in the upper-middle tier — ahead of most peers, but below the market leaders who have invested in systematic brand infrastructure.")

2. Priority Diagnosis (primary + secondary)
   Each with: whyFocus, downstreamIssues, whatImproves

3. Pillar Deep Dives (All 5: positioning, messaging, visibility, credibility, conversion)
   **BLUEPRINT+ ENHANCED** — Each pillar includes:
   - score (0–20), interpretation, whatsHappeningNow, whyItMattersCommercially
   - industryContext: If BENCHMARK DATA is provided, use real peer percentiles and averages (e.g., "Your positioning score places you in the 72nd percentile among B2B SaaS brands"). If no benchmark data, provide expert-level directional context on how this score compares to typical [industry] [audienceType] brands at this revenue stage.
   - financialImpact: Connect this pillar to specific business outcomes (e.g., "A credibility score of 8 for a B2B firm means longer sales cycles, higher cost of trust-building, and lost RFPs — improving this pillar alone could accelerate deal close rates by 15-25%." Use directional estimates calibrated to industry and stage.)
   - riskOfInaction: What specifically happens to [businessName] over the next 6-12 months if this pillar is NOT addressed (paint the realistic downside scenario with business language, not fearmongering)
   - concreteExample { before, after }
   - strategicRecommendation, successLooksLike
   - implementationGuide: Array of 3–4 steps, each with:
     - step: What to do (short title)
     - detail: Specific instructions for this step
   - toolsAndResources: String listing recommended tools and platforms for this pillar

4. Context Coverage
   overallPercent, areas [{ name, percent, status }], contextGaps []

5. Strategic Alignment Overview
   summary, reinforcements [{ pillars, insight }], conflicts [{ pillars, insight }], systemRecommendation

6. Brand Archetype System
   primary + secondary (each: name, whenAligned, riskIfMisused, languageTone, behaviorGuide), howTheyWorkTogether
   Use ONLY: Sage, Hero, Outlaw, Magician, Lover, Caregiver, Ruler, Creator, Innocent, Explorer, Neighbor, Entertainer

7. Brand Persona
   **BLUEPRINT+ ENHANCED** — Includes messaging examples with before/after comparisons:
   - personaSummary, coreIdentity { whoYouAre, whatYouStandFor, howYouShowUp }
   - communicationStyle { tone, pace, energy }
   - messagingExamples: For EACH of elevator, linkedin, email, proposal:
     - wrong: Example of weak/generic messaging
     - right: Example of strong, on-brand messaging
     - why: Why the "right" version works better
   - communicationGuidelines:
     - dos: Array of 5 guidelines, each with { do: "guideline", example: "example" }
     - donts: Array of 5 guidelines, each with { dont: "guideline", example: "example" }

8. Visual & Verbal Brand Direction (inherited from Snapshot+™ foundation)
   colorPaletteDirection, colorSwatches [{ name, hex, rgb, cmyk, usage }], avoidColors [{ name, hex, reason }],
   typographyDirection { fontMood, headingStyle, bodyStyle, accentStyle, pairingSuggestions [{ heading, body, rationale }], typographyDonts [] },
   imageryMoodDirection { visualMood, moodDescriptors [], visualDoAndDont { do [], dont [] } },
   visualConsistencyPrinciples [{ principle, why, example }],
   voiceTraits [], consistencyRisks
   Color swatches must include all three formats: hex (web/CSS), rgb (digital/presentations), cmyk (print)

9. Strategic Action Plan (5 actions)
   **BLUEPRINT+ ENHANCED** — Each action includes:
   - action, pillar, outcome, priority, why, howTo [], example, effort, impact
   - quickWin: One thing they can do in the next 30 minutes to start
   - template: Ready-to-use copy/content template they can deploy immediately (use \\n for line breaks)
   - implementationSteps: Array of 3–4 steps, each with { step, detail }

10. Visibility & Discovery
    **BLUEPRINT+ ENHANCED** — Each priority includes implementation detail:
    - visibilityMode, visibilityModeExplanation
    - discoveryDiagnosis { whereTheyShouldFind [], whereTheyActuallyFind [], gap }
    - aeoReadiness:
      - score, explanation
      - recommendations: Array of 3–4 objects, each with { action: "what to do", detail: "detailed explanation with examples" }
    - visibilityPriorities: Array of 3–4, each with:
      - priority, action, impact
      - howToImplement: Step-by-step instructions (string with numbered steps)
      - tools: Recommended tools with free/paid options

11. Audience Clarity & Ideal Customer Profile
    audienceSignals { primaryAudience, audienceCharacteristics [], audienceLanguage }, decisionDrivers { motivators [{ driver, explanation }], hesitationFactors [{ factor, explanation }] }
    idealCustomerProfile {
      summary, demographics, painPoints [], goals, whereToBeFindable, languageTheyUse, buyingTriggers
    }
    If idealDiffersFromCurrent is true:
    currentVsIdealGap { currentDescription, idealDescription, gapAnalysis, transitionStrategy }

12. Foundational AI Prompt Pack (8 prompts)
    packName, description, promptCount: 8, prompts [{ category, title, instruction, prompt, whyItMatters }]

13. Execution Guardrails
    whatToMaintain [], whatToAvoid [], driftIndicators []

14. What's Next (whatsNextUnlocks)

=== BLUEPRINT SECTIONS ===

15. Blueprint Overview
    whatThisEnables, howToUse

16. Brand Foundation
    brandPurpose, brandPromise, positioningStatement, differentiationNarrative,
    mission: Craft from missionStatement if provided (may be polished or conversational — either way, honor the intent). If null, derive from businessName, industry, audienceType, whatMakesYouDifferent, and primaryGoals.
    vision: Craft from visionStatement if provided (same principle). If null, generate based on primaryGoals, industry, and brand archetype.
    
    brandValues: Array of 4–6 brand values. These are DISTINCT from brand purpose (why you exist) and brand promise (what you commit to). Brand values define HOW [businessName] behaves — the principles that guide every decision, hiring choice, and customer interaction.
    If coreValues were provided, USE THEM as value names. Preserve the user's language. If null, derive 4–6 values from brandPersonalityWords, archetypeSignals, and brand positioning.
    Each value: {
      name: "The value (e.g., 'Radical Transparency,' 'Relentless Simplicity')"
      description: "What this value means for [businessName] — in plain language, not corporate speak"
      inAction: "How this value shows up in daily behavior — what a team member, client, or partner would actually see"
      whyItMatters: "Why this value is strategically important for [businessName]'s brand, culture, and positioning"
    }

17. Audience Persona Definition & Ideal Customer Profiles
    **BLUEPRINT+ ENHANCED** — Full ICP system with buyer journey mapping:
    primaryICP {
      name: Memorable persona label (e.g., "The Growth-Stage Founder")
      summary: Full persona narrative
      demographics, psychographics, painPoints [], goals
      buyingJourney: Discovery → evaluation → decision flow with channels, timeline, stakeholders
      languageTheyUse: Exact phrases for messaging alignment
      whereToBeFindable: Specific platforms, communities, publications, events
      objections: Hesitations with counter-messaging for each
      contentTopics: 5 content topics that would attract this persona
      conversionPath: The ideal journey from first touch to customer
    }
    secondaryICP: Same depth as primaryICP
    
    If idealDiffersFromCurrent is true:
    audienceTransitionPlan {
      currentAudience, idealAudience, gapDiagnosis
      repositioningSteps: 5+ specific actions with implementation detail
      messagingShifts: Before/after copy examples
      channelShifts: Add/emphasize/de-prioritize with reasoning
      contentStrategy: Content themes that attract ideal while serving current
      timeline: Phased 90-day transition plan
    }

18. Buyer Persona Ecosystem
    **BLUEPRINT+ EXCLUSIVE** — Full buyer persona system for marketing segmentation and messaging.
    
    IMPORTANT: ICPs (section 17) define the ideal company/customer profile. Buyer personas represent the REAL PEOPLE within those profiles — the individuals who discover, evaluate, influence, and buy. This is the bridge between "who to target" and "how to talk to them."
    
    For EACH ICP (primary and secondary), generate 2–3 distinct buyer personas (4–6 total):
    
    buyerPersonas: [
      {
        personaName: A vivid, memorable name (e.g., "The Overwhelmed CMO", "The Side-Hustle Mom", "The Risk-Averse CFO")
        icpAlignment: Which ICP this persona belongs to (primary or secondary)
        narrativeSnapshot: A 3–4 sentence story that brings this persona to life — who they are, what their day looks like, what frustrates them. Written in third person.
        role: Their role or identity (B2B: job title, seniority, decision authority; B2C: life role, identity, values)
        age range and context (approximate, for messaging calibration)
        coreFrustration: The one problem that drives them to look for a solution
        primaryMotivation: What they're ultimately trying to achieve
        secondaryMotivation: A supporting goal or desire
        decisionStyle: How they evaluate and choose (data-driven, peer-influenced, impulse, committee, values-driven)
        decisionInfluencers: Who else is involved or whose opinion matters (B2B: boss, board, team; B2C: partner, friends, online reviews)
        informationSources: Specific publications, podcasts, communities, influencers, platforms they trust
        
        messagingGuide: {
          headline: One headline that would stop this persona mid-scroll
          valueProposition: The core benefit framed for THIS persona specifically
          emotionalHook: The feeling the messaging should trigger
          proofType: What type of proof matters most (data, testimonials, case studies, authority, social proof)
          toneNotes: Any tone adjustments needed for this persona vs the brand's default voice
        }
        
        contentStrategy: {
          preferredFormats: Ranked list of content formats (e.g., short video, case study, podcast, email newsletter)
          topicsTheyWantToRead: 3–4 specific content topics
          contentThatConverts: The type of content most likely to move them from awareness to consideration
          leadMagnetIdea: One specific lead magnet concept designed for this persona
        }
        
        channelPriority: Top 3 channels to reach this persona, ranked, with reasoning
        
        objections: [
          {
            objection: A specific hesitation this persona would have
            internalThought: What they're really thinking (the unspoken version)
            response: How [businessName] should address it
            proofPoint: Specific evidence that overcomes this objection
          }
        ] (2–3 objections per persona)
        
        conversionPath: {
          firstTouch: How they first encounter [businessName]
          nurture: What keeps them engaged during evaluation
          trigger: What causes them to take action
          idealCTA: The CTA that works best for this persona
          postPurchase: What keeps them loyal and turns them into advocates
        }
      }
    ]

    personaMessagingMatrix: {
      summary: "How to use this matrix — each column is a persona, each row is a touchpoint. Use this to ensure every piece of marketing speaks directly to a specific person, not a generic audience."
      matrix: [
        {
          touchpoint: (e.g., "Homepage hero", "Email welcome sequence", "LinkedIn ad", "Sales call opener", "Retargeting ad")
          personaMessages: [
            {
              personaName: matches a buyerPersonas[].personaName
              message: The specific copy or approach for this persona at this touchpoint
            }
          ]
        }
      ] (8–10 touchpoints, covering the full customer journey)
    }

19. Brand Archetype Activation
    **BLUEPRINT+ ENHANCED** — Includes on-brand/off-brand examples:
    - primaryArchetype, secondaryArchetype
    - activation: For EACH of messaging, content, salesConversations, visualTone:
      - guidance: How the archetype shows up in this area
      - examples: Array of 2–3 scenarios, each with:
        - context: The situation (e.g., "LinkedIn post about industry trends")
        - onBrand: What on-brand looks like
        - offBrand: What off-brand looks like

20. Messaging System
    coreMessage, supportingMessages [], proofPoints [], whatNotToSay []

21. Messaging Pillars (BLUEPRINT+ ENHANCED)
    **These are the 3–5 strategic themes [businessName] should consistently communicate.**
    Blueprint+ adds audience-specific variations and funnel-stage messaging per pillar.
    
    Use keyTopicsAndThemes, whatMakesYouDifferent, brandVoiceDescription, primaryGoals, industry, audienceType, buyer personas (section 18) to derive these.
    
    messagingPillars: Array of 3–5 objects, each with:
    - name: Short pillar name (2–4 words)
    - whatItCommunicates: What this pillar says to the audience
    - whyItMatters: Why this theme is strategically important for [businessName]
    - exampleMessage: One concrete headline or statement that brings this pillar to life
    - howToUse: How to apply this pillar across channels (website, social, email, sales)
    - channelExamples: { website: "...", social: "...", email: "..." } — specific copy per channel
    - audienceVariations: Array of 2–3 objects [{ audience: "persona name", adaptation: "how this pillar shifts for this audience", exampleCopy: "..." }]
    - funnelStageUsage: { awareness: "how to use at top of funnel", consideration: "how to use mid-funnel", decision: "how to use at conversion point" }

22. Content Pillars (BLUEPRINT+ ENHANCED)
    **These are the 4–5 topical categories that guide what content [businessName] should create.**
    Blueprint+ adds channel mapping, frequency cadence, example headlines, and audience targeting per pillar.
    
    Derive from: keyTopicsAndThemes, contentFormatPreferences, industry, audienceType, marketingChannels, primaryGoals, buyer personas.
    
    contentPillars: Array of 4–5 objects, each with:
    - name: Short pillar name (2–4 words)
    - description: What this content pillar covers and why it matters
    - exampleTopics: Array of 4–5 specific topic ideas within this pillar
    - suggestedFormats: Array of 3–4 content formats (e.g., "LinkedIn carousel," "blog post," "email newsletter," "video")
    - messagingPillarConnection: Which messaging pillar this content pillar reinforces
    - audienceMapping: Which buyer persona(s) this pillar primarily serves
    - channelDistribution: { primary: "channel + rationale", secondary: "channel + rationale" }
    - frequencyCadence: Suggested posting frequency (e.g., "2x per month," "weekly")
    - exampleHeadlines: Array of 3 ready-to-use headlines for this pillar

23. Visual Direction (Blueprint enhancement — extends section 8)
    The foundational visual system (color palette, typography direction, imagery mood, visual consistency) is in section 8. This section adds Blueprint-level depth:
    - colorPalette: Refined palette with usage hierarchy [{ name, hex, rgb, cmyk, usage }]
    - typographyTone: Expanded typography rationale connecting font choices to brand archetype and positioning
    - visualConsistencyPrinciples: Expanded principles with team delegation and cross-channel application guidance
    Color palette must include all three formats: hex (web/CSS), rgb (digital/presentations), cmyk (print)

24. Conversion Strategy
    **BLUEPRINT+ ENHANCED** — Includes templates and email nurture sequence:
    - howTrustIsBuilt, howClarityDrivesAction
    - ctaHierarchy: Array of 3 levels [{ level, action, context, template: "ready-to-use copy" }]
    - emailNurtureTemplate:
      - description: What this email sequence achieves
      - emails: Array of 4 emails, each with:
        - timing: When to send (e.g., "Day 0 — Immediate")
        - subject: Email subject line
        - purpose: What this email does
        - body: Full email body copy (2–3 paragraphs, use \\n for line breaks)

25. Execution Prompt Pack (8 prompts)
    packName, description, promptCount: 8, prompts [{ category, title, instruction, prompt, whyItMatters }]

=== BLUEPRINT+ EXCLUSIVE SECTIONS ===

26. Strategic Overview
    - wherePositioned: Where this brand is positioned to go (strategic trajectory)
    - leverageCreated: What leverage this complete blueprint creates

27. Persona-Driven Marketing Segmentation
    **BLUEPRINT+ EXCLUSIVE** — Connects the buyer personas (section 18) to actionable marketing segments.
    This is the operational bridge between "who these people are" and "how we reach and convert each one."
    
    - segmentationStrategy: One paragraph explaining how [businessName] should think about segmentation given their audienceType (B2B/B2C/both) and geographicScope
    - segments: Array of 4–6 segments (one per buyer persona), each with:
      - segmentName: Matches a buyer persona name from section 18
      - segmentSize: Estimated relative size (primary, secondary, niche)
      - revenueValue: Relative value to [businessName] (high, medium, emerging)
      - messagingDifferentiation: How messaging changes for this segment — with SPECIFIC COPY EXAMPLES
      - channelMix: Ranked channels with budget allocation guidance (e.g., "60% LinkedIn, 25% email, 15% content")
      - conversionTactics: 3 specific tactics for this segment
      - contentCalendarThemes: 4 content themes tailored to this segment
      - kpisToTrack: 2–3 metrics that indicate this segment is responding
    - segmentPrioritization: {
        investHeavily: Which 1–2 segments deserve the most resources and why
        nurtureSteadily: Which segments to maintain with consistent effort
        testAndLearn: Which segments to experiment with
      }
    - crossSegmentOpportunities: 2–3 marketing initiatives that serve multiple segments simultaneously

28. Advanced Messaging Matrix
    **WITH EXAMPLE COPY FOR EVERY ENTRY — MAPPED TO BUYER PERSONAS:**
    - byPersona: Array of entries for each buyer persona (from section 18), each with:
      - persona: persona name
      - coreMessage: The one sentence that matters most to this person
      - exampleCopy: Ready-to-use marketing copy for this persona
    - byFunnelStage: For EACH of awareness, consideration, decision, retention:
      - message: Strategic message for this stage
      - exampleCopy: Specific ad/email/post copy for this stage
      - personaVariations: How the message shifts for different personas at this stage
    - byChannel: For EACH of website, email, social, paid, sales:
      - guidance: How to communicate on this channel
      - exampleCopy: Specific copy example for this channel
      - personaNotes: Which personas to prioritize on this channel

29. Brand Architecture & Expansion
    howBrandCanStretch, subBrandAlignment

30. Campaign & Content Strategy
    **BLUEPRINT+ ENHANCED** — Persona-informed content strategy:
    campaignThemes [], narrativeArcs [], longTermStorytelling
    personaContentCalendar: {
      description: "A 30-day content framework showing which personas to target each week"
      weeks: Array of 4 weeks, each with:
        - theme: Weekly content theme
        - targetPersonas: Which personas this week's content serves
        - contentPieces: Array of 3–4 pieces with format, topic, channel, and persona alignment
    }

31. Advanced AI Prompt Library (12 prompts)
    packName: "Advanced Prompt Library", description, promptCount: 12
    prompts [{ category, title, instruction, prompt, whyItMatters }]
    These should be the MOST SOPHISTICATED prompts — campaign-level, funnel optimization, scaling, AEO.
    AT LEAST 3 prompts should be persona-specific (e.g., "Generate email sequence for [persona name]", "Write LinkedIn ad targeting [persona name]").

32. Measurement & Optimization
    whatToTrack [], signalsThatMatter [], howToAdapt
    personaMetrics: For each buyer persona, which leading indicators show the messaging is resonating

33. Brand Consistency Checklist & Review Criteria
    **BLUEPRINT+ ENHANCED** — A comprehensive brand governance system with persona-specific consistency rules, delegation frameworks, and team onboarding tools.
    
    This is NOT a generic checklist — it must be calibrated to [businessName]'s specific brand persona, archetype, messaging pillars, voice traits, visual direction, and buyer personas from earlier sections of this report. Blueprint+ adds audience-specific consistency rules and team scaling guidelines.
    
    brandConsistencyChecklist: {
      overview: "A 2–3 sentence introduction explaining why brand consistency matters for [businessName] and how to use this checklist. Reference their specific stage, team size, and growth goals."
      
      prePublishChecklist: [
        {
          category: "The compliance area (e.g., 'Voice & Tone,' 'Visual Identity,' 'Messaging Alignment,' 'Audience Fit,' 'Channel Appropriateness,' 'Legal & Accuracy,' 'Persona Targeting,' 'Funnel Stage Alignment')"
          checkItems: [
            {
              item: "A specific yes/no question to ask before publishing (e.g., 'Does the headline use one of our messaging pillars?')"
              rationale: "Why this check matters — connected to a specific finding from this report"
              reference: "Which section of this report defines the standard (e.g., 'See Messaging Pillars, Section 21')"
            }
          ] (3–5 check items per category)
        }
      ] (8 categories minimum — Blueprint+ adds 'Persona Targeting' and 'Funnel Stage Alignment' beyond Blueprint's 6)
      
      reviewCriteria: [
        {
          question: "A diagnostic question to evaluate whether content is on-brand (e.g., 'If our ideal customer read this, would they immediately know it was from [businessName]?')"
          whatGoodLooksLike: "What a 'yes' answer looks like in practice"
          whatBadLooksLike: "What a 'no' answer looks like — common mistakes to watch for"
          personaNote: "How this criterion shifts for different buyer personas (Blueprint+ enhancement)"
        }
      ] (7–9 review questions)
      
      whatNeverChanges: [
        {
          element: "The non-negotiable brand element (e.g., 'Core positioning statement,' 'Primary color palette,' 'Brand archetype voice')"
          why: "Why this element is foundational and must remain consistent"
          example: "A specific example of this element as defined in this report"
        }
      ] (6–8 elements)
      
      whatCanEvolve: [
        {
          element: "The flexible brand element (e.g., 'Social media content formats,' 'Campaign-specific messaging,' 'Seasonal visual treatments')"
          boundaries: "The limits within which this element can flex"
          example: "An example of acceptable evolution vs. brand drift"
        }
      ] (5–7 elements)
      
      delegationGuidelines: {
        overview: "How [businessName] should brief team members, freelancers, or agencies to maintain brand consistency"
        briefTemplate: "A fill-in-the-blank creative brief template that references this report's key sections (brand persona, messaging pillars, voice traits, visual direction)"
        qualityCheckProcess: "A 4–5 step review process for content created by others"
        commonMistakes: ["4–5 specific mistakes that freelancers/agencies make when working with [businessName]'s brand"]
        onboardingChecklist: "A checklist for onboarding new team members or agency partners — what they should read from this report, in what order, and what to do first (Blueprint+ exclusive)"
      }
      
      maintainingIntegrityAtScale: "A 2–3 paragraph narrative on how [businessName] can maintain brand integrity as the team grows, channels multiply, and content volume increases. Include specific strategies calibrated to their current stage and growth trajectory."
    }

34. Competitive Positioning Map
    **BLUEPRINT+ EXCLUSIVE** — Strategic competitive intelligence.
    IMPORTANT: If competitorNames are provided, use them. If not, use industry archetypes (e.g., "Typical [industry] incumbent," "Low-cost disruptor," "Premium boutique," "Digital-first challenger").
    
    competitivePositioning {
      positioningAxis1: { label: (choose what matters most in this industry — e.g., "Price Point," "Specialization," "Service Depth"), lowEnd: "", highEnd: "" }
      positioningAxis2: { label: (second most important axis — e.g., "Digital Maturity," "Brand Recognition," "Innovation"), lowEnd: "", highEnd: "" }
      players: [
        { name: "[businessName]", position: { x: "low|mid|high", y: "low|mid|high" }, narrative: "Where [businessName] sits today and why — with specific evidence from their inputs" },
        { name: "[competitor1 or archetype]", position: { x, y }, narrative: "Where this player sits and how they differ" },
        { name: "[competitor2 or archetype]", position: { x, y }, narrative: "" },
        { name: "[competitor3 or archetype]", position: { x, y }, narrative: "" }
      ] (4–6 players total)
      strategicWhitespace: "Where in this landscape is there unoccupied, valuable territory that [businessName] could own? Why is this space commercially attractive? What would it take to claim it?"
      differentiationSummary: "What makes [businessName]'s current position defensible? What would a competitor need to invest to replicate it?"
      vulnerabilities: "Where is [businessName] most exposed to competitive pressure? What 2–3 actions would reduce this exposure?"
      movementPlan: "Where should [businessName] aim to be on this map in 12 months? What strategic moves enable that shift?"
    }
    
    Axis selection guidance:
    - B2B: Specialization ↔ Generalization, Self-Serve ↔ High-Touch, Price ↔ Value, Speed ↔ Thoroughness
    - B2C: Luxury ↔ Accessible, Niche ↔ Mass, Traditional ↔ Innovative, Local ↔ Global

35. Strategic Trade-Offs
    **BLUEPRINT+ EXCLUSIVE** — Every brand strategy involves trade-offs. Making them EXPLICIT is what separates strategic thinking from generic advice. This section helps [businessName] make informed, intentional decisions rather than drifting into default positions.
    
    strategicTradeOffs: [
      {
        decision: "The strategic choice being faced (e.g., 'Focus exclusively on enterprise clients vs. serve SMBs and enterprise')"
        context: "Why this trade-off matters right now for [businessName] specifically"
        optionA: {
          label: "Option A"
          description: "What this path looks like in practice"
          pros: ["Pro 1 — specific to [businessName]", "Pro 2"]
          cons: ["Con 1 — specific to [businessName]", "Con 2"]
          bestIf: "Conditions under which this is the right choice"
          exampleBrand: "A well-known brand that made this choice and what happened"
        }
        optionB: {
          label: "Option B"
          description: "What this path looks like in practice"
          pros: ["Pro 1", "Pro 2"]
          cons: ["Con 1", "Con 2"]
          bestIf: "Conditions under which this is the right choice"
          exampleBrand: "A well-known brand that made this choice and what happened"
        }
        recommendation: "Based on [businessName]'s current stage, inputs, goals, and competitive landscape, the recommended path is [optionX] because [detailed reasoning]. This isn't permanent — see 'revisit when.'"
        revisitWhen: "Specific trigger(s) that should cause [businessName] to reconsider (e.g., 'When revenue exceeds $X,' 'When you have Y clients,' 'When market conditions shift to Z')"
      }
    ] (4–5 trade-offs)
    
    Required trade-off categories for Blueprint+:
    - Audience: Narrow vs. broad targeting
    - Positioning: Premium vs. accessible
    - Growth: Depth vs. breadth (fewer clients served deeply vs. more clients at scale)
    - Voice: Authority vs. relatability
    - Channel: Concentrate vs. diversify marketing investment

36. 90-Day Strategic Roadmap
    **BLUEPRINT+ EXCLUSIVE** — A phased implementation plan that transforms insights into action. This is NOT a vague timeline — it's a week-by-week execution plan with specific deliverables, accountability markers, and success metrics.
    
    ninetyDayRoadmap: {
      overview: "A 2–3 sentence executive summary of what [businessName] should accomplish in 90 days and why this sequence matters"
      
      phase1: {
        name: "Foundation" (Days 1–30)
        objective: "What this phase accomplishes for [businessName]"
        weeks: [
          {
            weekNumber: 1,
            focus: "Week theme (e.g., 'Brand Audit & Quick Wins')"
            tasks: [
              {
                task: "Specific task (e.g., 'Update website homepage headline')"
                pillar: "Which pillar this addresses"
                deliverable: "What 'done' looks like (e.g., 'New headline live on website')"
                timeEstimate: "Estimated time to complete (e.g., '2 hours')"
                resources: "Tools, templates, or team members needed"
              }
            ] (3–4 tasks per week)
            milestone: "What should be true by end of this week"
          }
        ] (4 weeks)
        phase1Success: "How [businessName] knows Phase 1 was successful"
      }
      
      phase2: {
        name: "Execution" (Days 31–60)
        objective: "What this phase accomplishes"
        weeks: [ Same structure as phase1 — 4 weeks with weekly tasks, deliverables, and milestones ]
        phase2Success: "Success criteria for Phase 2"
      }
      
      phase3: {
        name: "Optimization" (Days 61–90)
        objective: "What this phase accomplishes"
        weeks: [ Same structure — 4 weeks with weekly tasks, deliverables, and milestones ]
        phase3Success: "Success criteria for Phase 3"
      }
      
      day90Snapshot: {
        brandAlignmentTarget: "Projected score improvement (directional, e.g., '+8-12 points')"
        biggestWins: ["Win 1", "Win 2", "Win 3"] — The 3 most impactful outcomes
        keyRisks: ["Risk 1", "Risk 2"] — What could derail progress and how to mitigate
        nextHorizon: "What the next 90 days (days 91-180) should focus on"
      }
    }

37. Brand Health Scorecard
    **BLUEPRINT+ ENHANCED** — An advanced diagnostic framework [businessName] can use to measure brand health on an ongoing basis. Blueprint+ version includes deeper threshold calibration and extended indicators.
    
    brandHealthScorecard: {
      overview: "How to use this scorecard — explain that brand health should be measured quarterly, not annually, and that this framework is calibrated to [businessName]'s specific priorities"
      
      scorecardDimensions: [
        {
          dimension: "The measurement area (e.g., 'Brand Awareness,' 'Lead Quality,' 'Messaging Consistency,' 'Digital Credibility,' 'Customer Acquisition Efficiency')"
          currentState: "Where [businessName] is today based on diagnostic data (specific, honest)"
          targetState: "Where [businessName] should aim to be in 90 days"
          keyMetric: "The primary metric to track (e.g., 'Monthly branded search volume,' 'LinkedIn engagement rate,' 'Proposal win rate')"
          measurementMethod: "How to measure this — specific tool, report, or process"
          frequency: "How often to measure (weekly, monthly, quarterly)"
          greenThreshold: "What 'healthy' looks like for this metric"
          yellowThreshold: "What 'needs attention' looks like"
          redThreshold: "What 'urgent action needed' looks like"
        }
      ] (8–10 dimensions covering all 5 pillars)
      
      quarterlyReviewProcess: {
        description: "A step-by-step process for conducting a quarterly brand health review"
        steps: [
          {
            step: "Step title (e.g., 'Gather Metrics')"
            detail: "What to do — with specific instructions and tools"
            timeEstimate: "How long this step takes"
          }
        ] (5–6 steps)
        reviewTemplate: "A structured template [businessName] can fill out each quarter — include specific prompts and questions to answer"
      }
      
      leadingIndicators: [
        {
          indicator: "An early-warning signal (e.g., 'Decline in organic mentions')"
          whatItMeans: "What this signal suggests about brand health"
          actionToTake: "What to do when this signal appears"
        }
      ] (5–6 leading indicators)
      
      laggingIndicators: [
        {
          indicator: "A trailing outcome metric (e.g., 'Customer acquisition cost trend')"
          whatItMeans: "What this reveals about brand effectiveness"
          benchmarkContext: "How to interpret this relative to [industry] norms"
        }
      ] (4–5 lagging indicators)
    }

38. Tagline & Slogan Recommendations
    **BLUEPRINT+ ENHANCED** — Provide 3–5 tagline/slogan options with audience-specific variations.
    
    taglineRecommendations: [
      {
        tagline: "The tagline (5–8 words max)"
        rationale: "Why this works — positioning, archetype, and market context"
        bestUsedOn: "Where to use it"
        tone: "The emotional register"
        audienceResonance: "Which audience segment this resonates with most and why"
        variations: [
          { context: "e.g., 'Social media bio'", variation: "A shorter or adapted version" },
          { context: "e.g., 'Formal presentation'", variation: "A more polished version" }
        ]
      }
    ] (3–5 options)

39. Brand Story & Origin Narrative
    **BLUEPRINT+ ENHANCED** — A comprehensive brand story with multiple versions for different contexts.
    
    IMPORTANT: If brandOriginStory was provided by the user, USE IT as the foundation. Weave their actual origin into the narrative — enhance the storytelling but preserve the facts, spirit, and personal elements they shared. If null, construct the story from other inputs (industry, whatMakesYouDifferent, brandPurpose, etc.).
    
    brandStory: {
      headline: "A compelling one-line hook"
      narrative: "A 3–4 paragraph brand story — origin, problem, approach, vision. Ready for About page. If the user shared their origin story, it should be recognizable here, polished into professional narrative form."
      elevatorPitch: "30-second version — 2–3 sentences"
      founderStory: "Founder angle drawn from brandOriginStory if provided, otherwise inferred from inputs"
      pressVersion: "A 1-paragraph press-ready version for media and PR"
      investorVersion: "A 1-paragraph version emphasizing market opportunity and traction"
    }

40. Customer Journey Map
    **BLUEPRINT+ ENHANCED** — Detailed customer journey with persona-specific variations and optimization points.
    
    customerJourneyMap: {
      overview: "Brief description of the typical journey"
      stages: [
        {
          stage: "Awareness | Consideration | Decision | Onboarding | Retention | Advocacy"
          customerMindset: "What the customer is thinking/feeling"
          keyQuestions: ["Questions they have"]
          touchpoints: ["Where they interact with the brand"]
          messagingFocus: "What the brand should communicate"
          contentTypes: ["Content formats that work best"]
          conversionTrigger: "What moves them to the next stage"
          kpiToTrack: "Key metric for this stage"
          personaVariations: [{ persona: "Persona name", adaptation: "How this stage differs for this persona" }]
          optimizationTips: ["2–3 specific optimization actions for this stage"]
          toolsRecommended: ["Tools or platforms that help at this stage"]
        }
      ] (6 stages)
      dropOffRisks: [{ stage: "Which stage", risk: "What causes drop-off", mitigation: "How to prevent it" }]
    }

41. SEO & Keyword Strategy
    **BLUEPRINT+ ENHANCED** — Comprehensive keyword strategy with content mapping, competitive gaps, and implementation priority.
    
    seoStrategy: {
      overview: "How SEO connects to [businessName]'s brand strategy"
      primaryKeywords: [
        {
          keyword: "Target keyword or phrase"
          intent: "Informational | Navigational | Commercial | Transactional"
          difficulty: "Low | Medium | High"
          contentAngle: "How to approach this keyword"
          pillarConnection: "Which content pillar it maps to"
          competitiveGap: "Where competitors are weak on this keyword"
          priorityLevel: "High | Medium | Low"
        }
      ] (10–12 keywords)
      longTailOpportunities: [
        {
          keyword: "Long-tail keyword phrase"
          searchIntent: "What the searcher is looking for"
          contentRecommendation: "Specific content piece to create"
          estimatedImpact: "What ranking here could mean for [businessName]"
        }
      ] (8–10 opportunities)
      technicalPriorities: ["Top 5–7 technical SEO actions"]
      contentSEOPlaybook: "How [businessName] should approach SEO content creation"
      competitorKeywordGaps: "Where competitors rank that [businessName] doesn't — and the opportunity"
      localSEOStrategy: "If applicable: local SEO recommendations specific to [businessName]'s geographic scope"
    }

42. AEO & AI Search Strategy
    **BLUEPRINT+ COMPREHENSIVE** — Full Answer Engine Optimization strategy with implementation roadmap and competitive intelligence.
    
    aeoStrategy: {
      overview: "Why AEO is critical for [businessName] and how it integrates with their brand strategy"
      entityOptimization: {
        currentEntityStatus: "How well-established [businessName] is as an AI-recognizable entity"
        entityBuildingActions: ["5–7 specific actions to establish entity recognition"]
        structuredDataRecommendations: ["3–5 schema markup types to implement"]
        knowledgeGraphStrategy: "How to build [businessName]'s presence in knowledge graphs"
      }
      contentForAICitation: {
        strategy: "How to structure content for AI citation"
        formatRecommendations: ["4–5 content format recommendations"]
        topicAuthority: ["5–7 authority topics"]
        contentTemplates: ["2–3 content structure templates optimized for AI"]
      }
      faqStrategy: {
        overview: "How FAQ content improves AEO visibility"
        priorityFAQs: ["8–10 FAQ questions to create optimized answers for"]
        faqImplementation: "Where and how to implement FAQ content (website, blog, schema)"
      }
      competitiveAEOAnalysis: {
        overview: "How competitors appear in AI search results"
        gaps: ["Where competitors are visible and [businessName] is not"]
        opportunities: ["Where [businessName] can leapfrog competitors in AI search"]
        defensiveActions: ["How to protect [businessName]'s AI search presence"]
      }
      aiSearchMonitoring: {
        toolsToUse: ["Tools for monitoring AI search visibility"]
        metricsToTrack: ["Key AEO metrics"]
        reviewCadence: "How often to audit AI search presence"
      }
      implementationRoadmap: [
        {
          phase: "Phase name (e.g., 'Foundation — Month 1')"
          actions: ["Specific actions in this phase"]
          expectedOutcome: "What this phase achieves"
        }
      ] (3 phases)
    }

43. Email Marketing Strategy
    **BLUEPRINT+ ENHANCED** — Full email ecosystem with sequences, automation, and segmentation.
    
    emailMarketingFramework: {
      overview: "Email's role in [businessName]'s marketing ecosystem"
      welcomeSequence: {
        description: "Purpose and structure"
        emails: [
          {
            timing: "When to send"
            subject: "Subject line"
            purpose: "What this email accomplishes"
            keyMessage: "Core message in 1–2 sentences"
            ctaButton: "CTA text and destination"
          }
        ] (5–6 emails)
      }
      nurtureCampaign: {
        description: "Ongoing nurture strategy for leads not yet ready to convert"
        emails: [
          {
            timing: "Cadence (e.g., 'Week 2,' 'Week 4')"
            subject: "Subject line"
            purpose: "What this email accomplishes"
            keyMessage: "Core message"
            contentType: "Type of email (educational, social proof, offer, etc.)"
          }
        ] (4–6 emails)
      }
      reEngagementSequence: {
        trigger: "What triggers this sequence (e.g., '30 days inactive')"
        emails: [
          { timing: "", subject: "", purpose: "", keyMessage: "" }
        ] (3 emails)
      }
      segmentationStrategy: "How to segment the email list"
      subjectLineFormulas: ["5–7 subject line templates"]
      sendCadence: "Recommended frequency and timing"
      automationTriggers: ["4–5 behavioral triggers that should fire automated emails"]
    }

44. Social Media Platform Strategy
    **BLUEPRINT+ ENHANCED** — Platform-specific strategy with content calendars and competitive positioning.
    
    socialMediaStrategy: {
      overview: "Which platforms matter and why"
      platforms: [
        {
          platform: "Platform name"
          whyThisPlatform: "Strategic rationale"
          audienceOnPlatform: "Who [businessName]'s audience is here"
          contentStrategy: "What to post and how"
          postingFrequency: "Recommended frequency"
          contentMix: "Ratio of content types"
          examplePosts: ["3–4 example post ideas"]
          kpiToTrack: "Primary metric"
          competitorInsight: "What competitors do well/poorly on this platform"
          growthTactics: ["2–3 specific growth tactics for this platform"]
        }
      ] (3–4 platforms)
      platformsToAvoid: {
        platforms: ["Platforms NOT recommended"],
        reasoning: "Why"
      }
      crossPlatformStrategy: "How to repurpose content across platforms efficiently"
    }

45. Content Calendar Framework
    **BLUEPRINT+ EXCLUSIVE** — A structured content calendar template with themes, topics, and scheduling cadence.
    
    contentCalendarFramework: {
      overview: "How to use this content calendar — the system behind consistent content"
      monthlyThemes: [
        {
          month: "Month 1 | Month 2 | Month 3"
          theme: "Monthly theme tied to messaging pillars and business goals"
          contentPillarFocus: "Which content pillar is emphasized this month"
          keyTopics: ["3–4 specific topics for this month"]
        }
      ] (3 months)
      weeklyStructure: {
        description: "A repeatable weekly content rhythm"
        days: [
          {
            day: "Monday | Tuesday | etc."
            contentType: "Type of content (e.g., 'Educational LinkedIn post,' 'Blog article,' 'Email newsletter')"
            platform: "Where it publishes"
            contentPillar: "Which pillar this maps to"
            exampleTopic: "A specific example for [businessName]"
          }
        ] (5 days — weekdays only)
      }
      batchingStrategy: "How to batch-create content efficiently (e.g., '2-hour monthly content session')"
      repurposingPlaybook: "How to turn one piece of content into 5+ formats"
    }

46. SWOT Analysis
    **BLUEPRINT+ ENHANCED** — A formal SWOT analysis connecting brand diagnostics to strategic positioning, with deeper strategic implications and scenario modeling.
    
    swotAnalysis: {
      overview: "How to interpret this SWOT in the context of [businessName]'s brand strategy"
      strengths: [
        { item: "Strength", evidence: "What in the diagnostic supports this", leverage: "How to capitalize on it" }
      ] (4–5 strengths)
      weaknesses: [
        { item: "Weakness", evidence: "What in the diagnostic revealed this", mitigation: "How to address it" }
      ] (4–5 weaknesses)
      opportunities: [
        { item: "Opportunity", context: "Why this is available now", action: "Specific action to capture it" }
      ] (4–5 opportunities)
      threats: [
        { item: "Threat", likelihood: "High | Medium | Low", impact: "High | Medium | Low", contingency: "How to prepare" }
      ] (3–4 threats)
      strategicImplications: "A 2–3 sentence synthesis connecting the SWOT to [businessName]'s immediate priorities"
    }

47. Brand Glossary & Terminology Guide
    **BLUEPRINT+ ENHANCED** — A comprehensive reference guide for brand-consistent language across all communications, with expanded industry jargon guidance.
    
    brandGlossary: {
      overview: "Why consistent terminology matters and how to use this glossary"
      termsToUse: [
        {
          term: "The preferred term (e.g., 'strategic partnership')"
          insteadOf: "What to avoid (e.g., 'vendor relationship')"
          context: "When and where to use this term"
          example: "Example sentence using the preferred term"
        }
      ] (8–12 terms)
      phrasesToAvoid: [
        { phrase: "Phrase to avoid", why: "Why it doesn't align with the brand", alternative: "What to say instead" }
      ] (5–8 phrases)
      industryJargonGuide: {
        useFreely: ["Terms your audience understands and expects"],
        defineWhenUsed: ["Terms that need brief explanation"],
        neverUse: ["Industry jargon that alienates your audience"]
      }
    }

48. Thought Leadership & PR Positioning
    **BLUEPRINT+ EXCLUSIVE** — A strategic plan for establishing [businessName] as a recognized authority in [industry]. Includes media angles, speaking topic recommendations, and authority content positioning. This complements the Digital Marketing Strategy and positions [businessName] for earned media and industry recognition.
    
    thoughtLeadershipStrategy: {
      overview: "How [businessName] can build thought leadership authority — connected to their positioning, archetype, and competitive landscape"
      
      authorityPositioning: {
        expertiseAreas: Array of 3–4 topics where [businessName] can credibly claim authority — specific to their experience, positioning, and market gap
        uniquePerspective: "What [businessName] sees that others in [industry] don't — the contrarian or distinctive point of view that makes their thought leadership worth following"
        targetOutlets: Array of 4–6 specific publications, podcasts, communities, or platforms where [businessName]'s audience looks for expertise
      }
      
      speakingTopics: [
        {
          topic: "A speaking topic or presentation title"
          audience: "Who this topic resonates with"
          angle: "The distinctive angle [businessName] brings to this topic"
          formats: "Keynote, panel, workshop, webinar, podcast guest, etc."
        }
      ] (3–5 topics)
      
      mediaAngles: [
        {
          angle: "A story angle or pitch topic a journalist or podcast host would find compelling"
          hook: "Why this is timely or newsworthy"
          targetMedia: "What type of media outlet would run this (industry trade, business press, podcast, etc.)"
          talkingPoints: Array of 3–4 key talking points for this angle
        }
      ] (3–4 media angles)
      
      authorityContentPlan: {
        pillarContent: Array of 3–4 authority-building content pieces [businessName] should create (e.g., "Definitive guide to [topic]," "Annual [industry] trends report," "Original research on [audience pain point]")
        distributionStrategy: "How to amplify authority content — LinkedIn, industry communities, email, PR outreach"
        cadence: "Recommended frequency for thought leadership content (e.g., '1 authority piece per month, 2 LinkedIn posts per week')"
      }
      
      prPositioning: {
        mediaReadyBio: "A press-ready bio for the founder/CEO that positions them as an expert source — 3–4 sentences"
        boilerplate: "A press-ready company boilerplate paragraph"
        mediaKitRecommendations: "What to include in a media kit (headshot specs, company fact sheet, topic list, past media appearances)"
      }
    }

49. Credibility & Trust Signal Strategy
    **BLUEPRINT+ ENHANCED** — Everything in Blueprint's credibility strategy plus deeper persona-specific proof point mapping, advanced authority-building tactics, and thought leadership integration.
    (See Blueprint credibilityStrategy schema — Blueprint+ generates the same structure with enhanced depth)

50. Website Copy Direction
    **BLUEPRINT+ ENHANCED** — Everything in Blueprint's website copy direction plus persona-specific messaging variations and ready-to-use copy for each page.
    (See Blueprint websiteCopyDirection schema — Blueprint+ generates the same structure with enhanced depth)

51. Company Description
    **BLUEPRINT+ ENHANCED** — Ready-to-use company descriptions in multiple lengths and contexts, with audience-specific variations.
    
    companyDescription: {
      oneLiner: "A single sentence (10–15 words) — works as LinkedIn tagline, Google Business description, or directory listing."
      shortDescription: "2–3 sentences for social bios, directory listings, email signatures. What + who + differentiator."
      fullBoilerplate: "Press-ready paragraph (4–5 sentences) for press releases, proposals, About page. Includes founding context, services, audience, approach, vision."
      proposalIntro: "2–3 sentences optimized for proposals and pitch decks — emphasizes credibility, results, and relevance."
      industrySpecific: "A variation of the short description tailored to [businessName]'s specific industry language and buyer expectations."
      recruitingVersion: "A version optimized for job postings and employer branding — emphasizes culture, mission, and growth."
    }

52. Value & Pricing Communication Framework
    **BLUEPRINT+ ENHANCED** — Everything in Blueprint's pricing framework, plus persona-specific pricing narratives and enhanced proposal templates.
    
    valuePricingFramework: {
      pricingPositioningStatement: "How [businessName] should frame their pricing relative to competitors and the value they deliver. Must reference specific differentiators."
      
      valueNarrative: "The story that justifies [businessName]'s price before the number ever comes up. Works across website, proposals, and sales conversations. Specific to industry, audience, and competitive context."
      
      priceObjectionResponses: [
        {
          objection: "A common pricing objection specific to [businessName]'s industry"
          reframe: "How to reframe using [businessName]'s brand proof points and positioning"
          exampleResponse: "Ready-to-use response language"
          personaContext: "Which buyer persona(s) most commonly raise this objection and how the response should shift for each (Blueprint+ exclusive)"
        }
      ] (4–5 objections — more than Blueprint's 3–4)
      
      proposalLanguageGuide: "How to present pricing in written proposals — context-setting, value anchoring, outcome framing. Includes persona-specific proposal customization guidance (Blueprint+ exclusive)."
      
      whyUsAtThisPrice: "Copy-ready language for website pricing/services page. Tied to outcomes, methodology, and proof points."
      
      personaPricingNarratives: [
        {
          persona: "Buyer persona name (from Section 18)"
          valueFrame: "How this persona thinks about value — what 'worth it' means to them"
          priceSensitivity: "How price-sensitive this persona is and why"
          messagingAngle: "The specific value angle that resonates (e.g., 'ROI-focused' vs. 'time-savings' vs. 'risk-reduction')"
          exampleCopy: "Ready-to-use pricing language written for this persona"
        }
      ] (one per buyer persona — 4–6 entries, Blueprint+ exclusive)
      
      competitiveValueDifferentiation: "How [businessName] should position their pricing relative to competitors or alternatives — not by being cheaper, but by being different. Include specific language for the 'why us vs. them' conversation. (Blueprint+ exclusive)"
    }

53. Sales Conversation Guide
    **BLUEPRINT+ ENHANCED** — Everything in Blueprint's sales guide, plus persona-specific conversation tracks and scenario scripts.
    
    salesConversationGuide: {
      openingFramework: "How to lead with positioning, not product features. The first 60 seconds. Include specific language."
      
      discoveryQuestions: [
        {
          question: "A strategic discovery question mapped to buyer personas' decision triggers and pain points"
          whyThisQuestion: "Which buyer persona this targets and what pain point or decision trigger it uncovers"
          listenFor: "What the answer reveals about fit"
        }
      ] (7–8 questions — more than Blueprint's 5–7)
      
      proofPointDeployment: [
        {
          persona: "The buyer persona this guidance applies to"
          stage: "Where in the conversation to deploy this proof point"
          proofPoint: "The specific proof point from the Messaging System to use"
          howToDeliver: "How to introduce this proof point naturally in conversation"
        }
      ] (one per buyer persona, covering different conversation stages)
      
      objectionHandlingPlaybook: [
        {
          objection: "A common sales objection for [businessName]'s industry"
          response: "How to respond — connected to actual messaging pillars and proof points"
          pillarConnection: "Which brand pillar or messaging pillar this response draws from"
          proofPoint: "Which specific proof point to reference"
          personaVariation: "How this response should shift depending on which buyer persona raised it (Blueprint+ exclusive)"
        }
      ] (6–8 objections — more than Blueprint's 5–6)
      
      closingLanguage: "CTAs and next-step framing matching the brand voice and conversion strategy. Include 4–5 closing phrases calibrated to the brand archetype."
      
      personaConversationTracks: [
        {
          persona: "Buyer persona name (from Section 18)"
          openingVariation: "How the opening changes for this persona"
          keyDiscoveryQuestions: ["2–3 persona-specific discovery questions"]
          presentationEmphasis: "What to emphasize (e.g., 'Lead with data and ROI' vs. 'Lead with the vision')"
          likelyObjections: ["The 1–2 objections this persona most commonly raises"]
          closingApproach: "How to close with this persona — their decision style and what tips them over"
          samplePitch: "A 3–4 sentence pitch written specifically for this persona"
        }
      ] (one per buyer persona — 4–6 entries, Blueprint+ exclusive)
      
      scenarioScripts: [
        {
          scenario: "A specific sales situation (e.g., 'Cold outreach on LinkedIn,' 'Inbound discovery call,' 'Pricing follow-up after proposal,' 'Referral introduction call')"
          script: "A ready-to-adapt conversation script for this scenario — opening, key questions, transition to pitch, close"
          personaNotes: "Which persona(s) this scenario is most common with"
        }
      ] (3–4 scenarios, Blueprint+ exclusive)
      
      salesEnablementTools: {
        onePageSellSheet: "An outline for a one-page sell sheet — what goes on it, in what order, using which messaging from this report"
        competitiveHandlingGuide: "How to handle 'why you vs. [competitor]' — connected to the Competitive Positioning section"
        referralRequestScript: "How to ask satisfied clients for referrals in an on-brand way — include specific language"
      }
    }

54. Measurement & KPI Framework
    **BLUEPRINT+ ENHANCED** — Everything in Blueprint's measurement framework, plus persona metrics, quarterly review template, and corrective action guidance.
    
    measurementFramework: {
      overview: "How [businessName] should think about measuring brand strategy effectiveness — what to expect in the first 30, 60, and 90 days."
      
      perSectionKPIs: [
        {
          section: "The report section this KPI ties to"
          recommendation: "The specific strategic recommendation this metric measures"
          kpi: "The metric to track"
          target: "What success looks like"
          personaImpact: "Which buyer persona(s) this metric most directly affects (Blueprint+ exclusive)"
        }
      ] (10–12 KPIs — more than Blueprint's 8–10)
      
      leadingIndicators: [
        {
          indicator: "An early signal the strategy is working"
          whatItMeans: "What this signal tells [businessName] about brand health"
          timeframe: "When to expect movement"
          actionIfFlat: "What to do if this indicator doesn't move within the expected timeframe (Blueprint+ exclusive)"
        }
      ] (6–8 indicators — more than Blueprint's 5–6)
      
      trackingRecommendations: [
        {
          metric: "The metric or group of metrics"
          tool: "The specific tool or platform to use"
          howToSetUp: "Brief setup guidance"
          frequency: "How often to check"
        }
      ] (6–8 recommendations)
      
      quarterlyReviewTemplate: "A structured quarterly review template — specific questions to answer, metrics to pull, and decisions to make. Should take 60–90 minutes to complete. (Blueprint+ exclusive)"
    }

55. Brand Strategy Rollout Guide
    **BLUEPRINT+ ENHANCED** — Everything in Blueprint's rollout guide, plus presentation-ready content and team-scale tools.
    
    brandStrategyRollout: {
      brandStrategyOnePager: "A single-page summary covering positioning, key messages, brand personality, visual direction, and elevator pitch. Scannable in under 2 minutes."
      
      howWeTalkAboutOurselves: {
        elevatorPitch: "The approved elevator pitch"
        approvedLanguage: ["5–7 approved phrases drawn from the messaging system and proof points"]
        phrasesToAvoid: ["5–7 phrases to never use"]
        companyDescriptions: "Reference to Company Description section — which version for which context"
      }
      
      internalRolloutTalkingPoints: [
        {
          topic: "A talking point for presenting the strategy"
          whatToSay: "2–3 sentences the founder can say"
          whatToReference: "Which section of this report to point to"
        }
      ] (5–6 talking points — more than Blueprint's 4–5)
      
      commonMisrepresentations: [
        {
          incorrect: "How the company commonly gets described incorrectly"
          correct: "The correct version"
          why: "Why the distinction matters"
        }
      ] (4–5 examples — more than Blueprint's 3–4)
      
      presentationReadySummary: "A structured, slide-ready brand overview (not a full deck, but content that drops into any presentation) covering: positioning, audience, messaging pillars, visual direction, and voice. Organized as titled sections with bullet points — ready to paste into Google Slides, Keynote, or PowerPoint. (Blueprint+ exclusive)"
      
      roleSpecificBrandBriefs: [
        {
          role: "The team function (e.g., 'Sales,' 'Marketing,' 'Customer Success,' 'Leadership')"
          howBrandShowsUp: "How the brand applies differently in this role — same brand, different application"
          keyReferences: "Which report sections this role should focus on"
          doAndDont: "1–2 do's and don'ts specific to this role's brand application"
        }
      ] (4 roles: Sales, Marketing, Customer Success, Leadership — Blueprint+ exclusive)
      
      newHireBrandOrientation: "What every new team member needs to know in their first week — structured as a checklist with references back to relevant report sections. Covers: brand positioning, who we serve, how we sound, visual standards, messaging do's and don'ts, and where to find answers. (Blueprint+ exclusive)"
      
      agencyContractorBrandPacket: "A self-contained reference you can hand to any external partner with everything they need to work on-brand without a meeting. Includes: positioning statement, messaging pillars, voice traits, visual direction, do's and don'ts, approved language, and a link back to the Brand Consistency Checklist. (Blueprint+ exclusive)"
      
      brandInFiveMinutes: "The absolute essentials compressed into a quick reference card format — positioning, voice, do's and don'ts, approved descriptions, and who to ask when unsure. Designed for speed: if someone has 5 minutes to understand the brand, this is what they read. (Blueprint+ exclusive)"
    }

56. Brand Imagery & Photography Direction
    **BLUEPRINT+ ENHANCED** — Everything in Blueprint's imagery direction, plus platform-specific guidance, mood board descriptors, persona-based imagery, and AI image generation prompts.
    
    brandImageryDirection: {
      photographyStyleDirection: "The mood, tone, and feel [businessName]'s imagery should convey — tied to archetype and personality."
      
      subjectMatterGuidance: {
        show: ["5–7 types of subjects, environments, and scenarios to feature"]
        avoid: ["4–5 types of subjects and scenarios to avoid"]
      }
      
      stockPhotoSelectionCriteria: {
        lighting: "What kind of lighting to look for"
        composition: "How images should be composed"
        colorTemperature: "How the brand palette connects to image selection"
        diversity: "Guidance on representation and authenticity"
        authenticityMarkers: "What makes an image feel authentic vs. stock-generic"
      }
      
      imageDonts: [
        {
          dont: "A specific imagery pitfall"
          why: "Why it hurts the brand"
          alternative: "What to use instead"
        }
      ] (4–6 pitfalls — more than Blueprint's 3–5)
      
      colorApplicationInImagery: "How the brand palette shows up in photography, graphics, social media, and presentations."
      
      platformSpecificImageryGuidance: [
        {
          platform: "The platform or context (e.g., 'Website hero images,' 'Social media posts,' 'Email headers,' 'Ad creative,' 'Presentation decks')"
          dimensions: "Recommended image dimensions or aspect ratios"
          styleAdaptation: "How the brand's visual style adapts for this format — same brand, optimized for the medium"
          examples: "2–3 specific image descriptions that would work for this platform"
        }
      ] (5 platforms — Blueprint+ exclusive)
      
      moodBoardDescriptors: {
        adjectives: ["8–10 adjectives that describe the visual mood (e.g., 'grounded,' 'energetic,' 'refined,' 'textured')"]
        textures: ["3–5 texture references (e.g., 'natural wood grain,' 'matte surfaces,' 'soft linen')"]
        environments: ["4–5 environment types that feel on-brand (e.g., 'modern co-working spaces,' 'outdoor natural light,' 'clean minimalist studios')"]
        lightingConditions: "Specific lighting descriptors (e.g., 'Golden hour warmth,' 'Overcast soft diffusion,' 'High-key bright and airy')"
        colorMoods: "How the brand colors translate to photographic mood — warm/cool, saturated/muted, high-contrast/soft"
        designerNote: "A 2–3 sentence brief a designer or agency could use to source or create imagery without a meeting"
      } (Blueprint+ exclusive)
      
      imageryByAudience: [
        {
          persona: "Buyer persona name (from Section 18)"
          visualToneShift: "How visual tone shifts when targeting this persona (e.g., 'Enterprise buyers see polished, data-forward imagery; founders see action-oriented, energetic imagery') — must stay within brand guardrails"
          exampleImageDescriptions: ["2–3 image descriptions that would resonate with this persona"]
        }
      ] (one per buyer persona — Blueprint+ exclusive)
      
      beforeAndAfterImageAudit: [
        {
          context: "Where this image would appear (e.g., 'LinkedIn post header,' 'Website about page,' 'Sales deck cover')"
          offBrand: "Description of an off-brand image choice and why it doesn't work"
          onBrand: "Description of the on-brand alternative and why it's better"
          rationale: "What brand principle this illustrates"
        }
      ] (3–4 comparisons — Blueprint+ exclusive)
      
      aiImageGenerationPrompts: [
        {
          useCase: "What the image is for (e.g., 'LinkedIn thought leadership post,' 'Website hero banner,' 'Email campaign header')"
          prompt: "A complete AI image generation prompt pre-loaded with [businessName]'s visual direction — includes style, mood, subject, lighting, color, composition"
          negativePrompt: "What to exclude (e.g., 'no text, no corporate clip art, no harsh shadows, no neon colors')"
          tool: "Which AI tool this is optimized for (Midjourney, DALL-E, etc.)"
        }
      ] (3–5 prompts — Blueprint+ exclusive)
    }

57. Asset Optimization Playbook (Blueprint+ Exclusive)
    **ONLY include this section if the user uploaded marketing assets and asset analysis data was provided in the prompt context.**
    If no asset data is present, omit the "assetOptimizationPlaybook" key entirely.

    This section maps each uploaded asset against the five brand pillars and provides a concrete optimization plan.

    assetOptimizationPlaybook: {
      summary: "Executive summary of overall asset alignment health — what patterns emerged, biggest gap areas, and the single most impactful change they can make across all assets."
      overallAlignmentScore: (1-10 average across all assets)

      assetAudits: [
        {
          fileName: "The uploaded file name"
          category: "Asset category (e.g., social, deck, email, collateral)"
          overallScore: (1-10)
          pillarAlignment: {
            positioning: { score: (1-10), observation: "How this asset supports or undermines positioning", fix: "Specific change to improve positioning alignment" }
            messaging: { score: (1-10), observation: "", fix: "" }
            visibility: { score: (1-10), observation: "", fix: "" }
            credibility: { score: (1-10), observation: "", fix: "" }
            conversion: { score: (1-10), observation: "", fix: "" }
          }
          optimizationSteps: [
            {
              priority: "high|medium|low"
              pillar: "Which pillar this addresses"
              current: "What the asset does now"
              recommended: "Exact change to make — be specific enough to hand to a designer or copywriter"
              impact: "Expected improvement and why"
            }
          ] (3-5 steps per asset, ordered by priority)
          customPrompts: [
            {
              useCase: "What this prompt helps with (e.g., 'Rewrite hero headline,' 'Redesign CTA section')"
              prompt: "Ready-to-use AI prompt that references the brand's archetype, voice, positioning, and specific pillar weakness to rewrite/redesign this asset element"
            }
          ] (2-3 prompts per asset)
        }
      ]

      crossAssetPatterns: {
        strongestPillar: "Which pillar is best represented across all uploaded assets"
        weakestPillar: "Which pillar is most underrepresented — should align with overall weakest pillar score"
        systemicIssues: ["Patterns that appear across multiple assets (e.g., 'CTA language is consistently vague,' 'Color palette drifts between assets')"]
        topPriorityActions: ["3-5 highest-impact changes across all assets, ranked by expected ROI"]
      }
    }

58. Brand Standards Guide Content (Blueprint+ Exclusive)
    This section generates content specifically for the Brand Standards & Guidelines PDF.
    These fields power the exported guide used by marketing teams, contractors, agencies, and anyone creating brand content.
    
    IMPORTANT: If guidelineDetails was provided by the user, it describes what brand guidelines they already have (e.g., "we have logo files and brand colors but nothing about voice"). Use this to:
    - Acknowledge and build on what exists rather than generating conflicting guidance
    - Focus generation effort on the GAPS (what they don't have yet)
    - Reference their existing assets where appropriate (e.g., "Use your established logo files as primary; the guidelines below govern how they're applied")
    
    brandStandardsGuide: {
      logoGuidelines: {
        overview: "A 2–3 sentence explanation of how the logo represents the brand and why consistent usage matters. NOTE: We are providing usage guidance — the brand is responsible for providing their actual logo files."
        clearSpace: "How much clear space should surround the logo — express as a proportion (e.g., 'Maintain clear space equal to the height of the logo mark on all sides')"
        minimumSize: "Minimum display size for print and digital to ensure legibility (e.g., 'No smaller than 1 inch / 72px wide')"
        placementRules: ["4–5 rules for logo placement across different formats — website headers, social profiles, print materials, email signatures, presentations"]
        incorrectUses: ["5–6 common logo misuses to avoid — stretching, recoloring outside palette, placing on busy backgrounds, adding effects, rotating, low-resolution usage"]
      }
      
      layoutGuidelines: {
        overview: "How [businessName]'s layouts should feel — tied to archetype and personality (e.g., 'Clean, open layouts with generous white space that reflect the Sage archetype's clarity and authority')"
        margins: "Standard margin guidance for digital and print (e.g., '40–60px for web sections, 0.75–1 inch for print')"
        spacing: "Spacing philosophy — how spacing reinforces the brand personality"
        gridSystem: "Recommended grid system for web and print (e.g., '12-column grid for web, 6-column for print')"
        digitalPatterns: ["3–4 common digital layout patterns for [businessName] (e.g., 'Hero section with centered headline and CTA below fold', 'Two-column feature grid with icon + text')]"
        printPatterns: ["3–4 common print layout patterns"]
      }
      
      writingGuidelines: {
        overview: "A 2–3 sentence philosophy for how [businessName] approaches written communication — tied to voice and archetype."
        grammarPreferences: ["5–7 specific grammar and punctuation preferences. IMPORTANT: If writingPreferences was provided by the user (e.g., 'we use Oxford comma,' 'always first person plural'), incorporate those FIRST, then supplement with additional recommendations. The user's stated preferences always take priority."]
        jargonRules: "How [businessName] handles industry jargon — when to use it, when to avoid it, and how to explain technical terms. If writingPreferences mentioned jargon rules, honor those."
        pointOfView: "Default point of view for brand communications. If writingPreferences specified POV (e.g., 'we write as we'), use that. Otherwise recommend based on audienceType and brand persona."
        inclusiveLanguage: "Guidelines for inclusive, accessible language — gender-neutral terms, avoiding ableist language, cultural sensitivity relevant to [businessName]'s audience"
        stylePreferences: ["4–6 writing style preferences. Incorporate any user-provided writingPreferences first, then supplement with strategic recommendations based on brand voice and archetype."]
      }
      
      sampleExecutions: [
        {
          channel: "The platform or medium (e.g., 'LinkedIn', 'Email', 'Website', 'Sales Deck', 'Internal Memo')"
          format: "The specific content type (e.g., 'Thought leadership post', 'Welcome email', 'Homepage hero section', 'Investor pitch opening')"
          description: "A detailed description of what this execution looks like when on-brand — include specific copy snippets, tone guidance, visual elements, and structure."
          keyElements: ["3–4 specific elements that make this execution on-brand"]
        }
      ] (6–8 sample executions covering a mix of external marketing, sales, and internal communications)
      
      doAndDontPages: [
        {
          area: "The category (e.g., 'Social Media Copy', 'Email Subject Lines', 'Presentation Design', 'Logo Usage', 'Photography', 'Customer Communication')"
          doExample: "A specific, concrete example of on-brand execution in this area"
          dontExample: "A specific, concrete example of off-brand execution in this area"
          why: "Why the distinction matters — connected to brand positioning, archetype, or audience expectations"
        }
      ] (8–10 do/don't comparisons covering the most common areas where brand drift happens)
      
      governanceTemplate: {
        brandOwnerRole: "Suggested role title and responsibilities for brand ownership at [businessName]'s stage and team size"
        reviewCadence: "Recommended review schedule (e.g., 'Quarterly brand audit, annual full guidelines review')"
        exceptionProcess: "Suggested process for handling exceptions (co-branded content, partner materials, campaigns that need to break rules)"
      }
    }

---------------------------------------------------------------------
OUTPUT FORMAT
---------------------------------------------------------------------

Return valid JSON with ALL these keys:

{
  "executiveSummary": {
    "brandAlignmentScore": 0, "synthesis": "", "diagnosis": "", "primaryFocusArea": "", "secondaryFocusArea": "", "industryBenchmark": ""
  },
  "priorityDiagnosis": {
    "primary": { "whyFocus": "", "downstreamIssues": "", "whatImproves": "" },
    "secondary": { "whyFocus": "", "downstreamIssues": "", "whatImproves": "" }
  },
  "pillarDeepDives": {
    "positioning": {
      "score": 0, "interpretation": "", "whatsHappeningNow": "", "whyItMattersCommercially": "",
      "industryContext": "", "financialImpact": "", "riskOfInaction": "",
      "concreteExample": { "before": "", "after": "" },
      "strategicRecommendation": "", "successLooksLike": "",
      "implementationGuide": [{ "step": "", "detail": "" }],
      "toolsAndResources": ""
    },
    "messaging": { "score": 0, "interpretation": "", "whatsHappeningNow": "", "whyItMattersCommercially": "", "industryContext": "", "financialImpact": "", "riskOfInaction": "", "concreteExample": { "before": "", "after": "" }, "strategicRecommendation": "", "successLooksLike": "", "implementationGuide": [{ "step": "", "detail": "" }], "toolsAndResources": "" },
    "visibility": { "score": 0, "interpretation": "", "whatsHappeningNow": "", "whyItMattersCommercially": "", "industryContext": "", "financialImpact": "", "riskOfInaction": "", "concreteExample": { "before": "", "after": "" }, "strategicRecommendation": "", "successLooksLike": "", "implementationGuide": [{ "step": "", "detail": "" }], "toolsAndResources": "" },
    "credibility": { "score": 0, "interpretation": "", "whatsHappeningNow": "", "whyItMattersCommercially": "", "industryContext": "", "financialImpact": "", "riskOfInaction": "", "concreteExample": { "before": "", "after": "" }, "strategicRecommendation": "", "successLooksLike": "", "implementationGuide": [{ "step": "", "detail": "" }], "toolsAndResources": "" },
    "conversion": { "score": 0, "interpretation": "", "whatsHappeningNow": "", "whyItMattersCommercially": "", "industryContext": "", "financialImpact": "", "riskOfInaction": "", "concreteExample": { "before": "", "after": "" }, "strategicRecommendation": "", "successLooksLike": "", "implementationGuide": [{ "step": "", "detail": "" }], "toolsAndResources": "" }
  },
  "contextCoverage": {
    "overallPercent": 0, "areas": [{ "name": "", "percent": 0, "status": "strong" }], "contextGaps": []
  },
  "strategicAlignmentOverview": {
    "summary": "", "reinforcements": [{ "pillars": "", "insight": "" }], "conflicts": [{ "pillars": "", "insight": "" }], "systemRecommendation": ""
  },
  "brandArchetypeSystem": {
    "primary": { "name": "", "whenAligned": "", "riskIfMisused": "", "languageTone": "", "behaviorGuide": "" },
    "secondary": { "name": "", "whenAligned": "", "riskIfMisused": "", "languageTone": "", "behaviorGuide": "" },
    "howTheyWorkTogether": ""
  },
  "brandPersona": {
    "personaSummary": "",
    "coreIdentity": { "whoYouAre": "", "whatYouStandFor": "", "howYouShowUp": "" },
    "communicationStyle": { "tone": "", "pace": "", "energy": "" },
    "messagingExamples": {
      "elevator": { "wrong": "", "right": "", "why": "" },
      "linkedin": { "wrong": "", "right": "", "why": "" },
      "email": { "wrong": "", "right": "", "why": "" },
      "proposal": { "wrong": "", "right": "", "why": "" }
    },
    "communicationGuidelines": {
      "dos": [{ "do": "", "example": "" }],
      "donts": [{ "dont": "", "example": "" }]
    }
  },
  "visualVerbalSignals": {
    "colorPaletteDirection": "",
    "colorSwatches": [{ "name": "", "hex": "", "rgb": "", "cmyk": "", "usage": "" }],
    "avoidColors": [{ "name": "", "hex": "", "reason": "" }],
    "typographyDirection": { "fontMood": "", "headingStyle": "", "bodyStyle": "", "accentStyle": "", "pairingSuggestions": [{ "heading": "", "body": "", "rationale": "" }], "typographyDonts": [] },
    "imageryMoodDirection": { "visualMood": "", "moodDescriptors": [], "visualDoAndDont": { "do": [], "dont": [] } },
    "visualConsistencyPrinciples": [{ "principle": "", "why": "", "example": "" }],
    "voiceTraits": [],
    "consistencyRisks": ""
  },
  "valuePropositionStatement": {
    "statement": "", "whereToUseIt": "", "whyThisWorks": ""
  },
  "voiceToneGuide": {
    "voiceSummary": "",
    "voiceTraits": [{ "trait": "", "whatItMeans": "", "example": "" }],
    "toneVariations": { "websiteAndMarketing": "", "socialMedia": "", "emailAndSales": "" },
    "phrasesToUse": [],
    "phrasesToAvoid": [],
    "aiPromptInstruction": ""
  },
  "strategicActionPlan": [
    {
      "action": "", "pillar": "", "outcome": "", "priority": 1, "why": "", "howTo": [], "example": "", "effort": "Medium", "impact": "High",
      "quickWin": "", "template": "", "implementationSteps": [{ "step": "", "detail": "" }]
    }
  ],
  "visibilityDiscovery": {
    "visibilityMode": "", "visibilityModeExplanation": "",
    "discoveryDiagnosis": { "whereTheyShouldFind": [], "whereTheyActuallyFind": [], "gap": "" },
    "aeoReadiness": { "score": "", "explanation": "", "recommendations": [{ "action": "", "detail": "" }] },
    "visibilityPriorities": [{ "priority": 1, "action": "", "impact": "", "howToImplement": "", "tools": "" }]
  },
  "audienceClarity": {
    "audienceSignals": { "primaryAudience": "", "audienceCharacteristics": [], "audienceLanguage": "" },
    "decisionDrivers": { "motivators": [{ "driver": "", "explanation": "" }], "hesitationFactors": [{ "factor": "", "explanation": "" }] },
    "idealCustomerProfile": { "summary": "", "demographics": "", "painPoints": [], "goals": "", "whereToBeFindable": "", "languageTheyUse": "", "buyingTriggers": "" },
    "currentVsIdealGap": { "currentDescription": "", "idealDescription": "", "gapAnalysis": "", "transitionStrategy": "" }
  },
  "foundationalPromptPack": {
    "packName": "Foundational Prompt Pack", "description": "", "promptCount": 8,
    "prompts": [{ "category": "", "title": "", "instruction": "", "prompt": "", "whyItMatters": "" }]
  },
  "executionGuardrails": { "whatToMaintain": [], "whatToAvoid": [], "driftIndicators": [] },
  "whatsNextUnlocks": "",
  "blueprintOverview": { "whatThisEnables": "", "howToUse": "" },
  "brandFoundation": { "brandPurpose": "", "brandPromise": "", "positioningStatement": "", "differentiationNarrative": "", "mission": "", "vision": "", "brandValues": [{ "name": "", "description": "", "inAction": "", "whyItMatters": "" }] },
  "audiencePersonaDefinition": {
    "primaryICP": { "name": "", "summary": "", "demographics": "", "psychographics": "", "painPoints": [], "goals": "", "buyingJourney": "", "languageTheyUse": "", "whereToBeFindable": "", "objections": [], "contentTopics": [], "conversionPath": "" },
    "secondaryICP": { "name": "", "summary": "", "demographics": "", "psychographics": "", "painPoints": [], "goals": "", "buyingJourney": "", "languageTheyUse": "", "whereToBeFindable": "", "objections": [], "contentTopics": [], "conversionPath": "" },
    "audienceTransitionPlan": { "currentAudience": "", "idealAudience": "", "gapDiagnosis": "", "repositioningSteps": [], "messagingShifts": [], "channelShifts": [], "contentStrategy": "", "timeline": "" }
  },
  "buyerPersonaEcosystem": {
    "buyerPersonas": [{
      "personaName": "", "icpAlignment": "", "narrativeSnapshot": "", "role": "", "ageRange": "",
      "coreFrustration": "", "primaryMotivation": "", "secondaryMotivation": "",
      "decisionStyle": "", "decisionInfluencers": "", "informationSources": "",
      "messagingGuide": { "headline": "", "valueProposition": "", "emotionalHook": "", "proofType": "", "toneNotes": "" },
      "contentStrategy": { "preferredFormats": [], "topicsTheyWantToRead": [], "contentThatConverts": "", "leadMagnetIdea": "" },
      "channelPriority": [],
      "objections": [{ "objection": "", "internalThought": "", "response": "", "proofPoint": "" }],
      "conversionPath": { "firstTouch": "", "nurture": "", "trigger": "", "idealCTA": "", "postPurchase": "" }
    }],
    "personaMessagingMatrix": {
      "summary": "",
      "matrix": [{ "touchpoint": "", "personaMessages": [{ "personaName": "", "message": "" }] }]
    }
  },
  "brandArchetypeActivation": {
    "primaryArchetype": "", "secondaryArchetype": "",
    "activation": {
      "messaging": { "guidance": "", "examples": [{ "context": "", "onBrand": "", "offBrand": "" }] },
      "content": { "guidance": "", "examples": [{ "context": "", "onBrand": "", "offBrand": "" }] },
      "salesConversations": { "guidance": "", "examples": [{ "context": "", "onBrand": "", "offBrand": "" }] },
      "visualTone": { "guidance": "", "examples": [{ "context": "", "onBrand": "", "offBrand": "" }] }
    }
  },
  "messagingPillars": [{ "name": "", "whatItCommunicates": "", "whyItMatters": "", "exampleMessage": "", "howToUse": "", "channelExamples": { "website": "", "social": "", "email": "" }, "audienceVariations": [{ "audience": "", "adaptation": "", "exampleCopy": "" }], "funnelStageUsage": { "awareness": "", "consideration": "", "decision": "" } }],
  "contentPillars": [{ "name": "", "description": "", "exampleTopics": [], "suggestedFormats": [], "messagingPillarConnection": "", "audienceMapping": "", "channelDistribution": { "primary": "", "secondary": "" }, "frequencyCadence": "", "exampleHeadlines": [] }],
  "messagingSystem": { "coreMessage": "", "supportingMessages": [], "proofPoints": [], "whatNotToSay": [] },
  "visualDirection": { "colorPalette": [{ "name": "", "hex": "", "rgb": "", "cmyk": "", "usage": "" }], "typographyTone": "", "visualConsistencyPrinciples": "" },
  "conversionStrategy": {
    "howTrustIsBuilt": "", "howClarityDrivesAction": "",
    "ctaHierarchy": [{ "level": "Primary", "action": "", "context": "", "template": "" }],
    "emailNurtureTemplate": {
      "description": "",
      "emails": [{ "timing": "", "subject": "", "purpose": "", "body": "" }]
    }
  },
  "executionPromptPack": {
    "packName": "Execution Prompt Pack", "description": "", "promptCount": 8,
    "prompts": [{ "category": "", "title": "", "instruction": "", "prompt": "", "whyItMatters": "" }]
  },
  "strategicOverview": { "wherePositioned": "", "leverageCreated": "" },
  "personaDrivenSegmentation": {
    "segmentationStrategy": "",
    "segments": [{
      "segmentName": "", "segmentSize": "", "revenueValue": "",
      "messagingDifferentiation": "", "channelMix": "", "conversionTactics": [],
      "contentCalendarThemes": [], "kpisToTrack": []
    }],
    "segmentPrioritization": { "investHeavily": "", "nurtureSteadily": "", "testAndLearn": "" },
    "crossSegmentOpportunities": []
  },
  "advancedMessagingMatrix": {
    "byPersona": [{ "persona": "", "coreMessage": "", "exampleCopy": "" }],
    "byFunnelStage": {
      "awareness": { "message": "", "exampleCopy": "", "personaVariations": "" },
      "consideration": { "message": "", "exampleCopy": "", "personaVariations": "" },
      "decision": { "message": "", "exampleCopy": "", "personaVariations": "" },
      "retention": { "message": "", "exampleCopy": "", "personaVariations": "" }
    },
    "byChannel": {
      "website": { "guidance": "", "exampleCopy": "", "personaNotes": "" },
      "email": { "guidance": "", "exampleCopy": "", "personaNotes": "" },
      "social": { "guidance": "", "exampleCopy": "", "personaNotes": "" },
      "paid": { "guidance": "", "exampleCopy": "", "personaNotes": "" },
      "sales": { "guidance": "", "exampleCopy": "", "personaNotes": "" }
    }
  },
  "brandArchitectureExpansion": { "howBrandCanStretch": "", "subBrandAlignment": "" },
  "campaignContentStrategy": {
    "campaignThemes": [], "narrativeArcs": [], "longTermStorytelling": "",
    "personaContentCalendar": {
      "description": "",
      "weeks": [{ "theme": "", "targetPersonas": [], "contentPieces": [{ "format": "", "topic": "", "channel": "", "personaAlignment": "" }] }]
    }
  },
  "advancedPromptLibrary": {
    "packName": "Advanced Prompt Library", "description": "", "promptCount": 12,
    "prompts": [{ "category": "", "title": "", "instruction": "", "prompt": "", "whyItMatters": "" }]
  },
  "measurementOptimization": { "whatToTrack": [], "signalsThatMatter": [], "howToAdapt": "", "personaMetrics": [{ "persona": "", "leadingIndicators": [] }] },
  "brandConsistencyChecklist": {
    "overview": "",
    "prePublishChecklist": [{ "category": "", "checkItems": [{ "item": "", "rationale": "", "reference": "" }] }],
    "reviewCriteria": [{ "question": "", "whatGoodLooksLike": "", "whatBadLooksLike": "", "personaNote": "" }],
    "whatNeverChanges": [{ "element": "", "why": "", "example": "" }],
    "whatCanEvolve": [{ "element": "", "boundaries": "", "example": "" }],
    "delegationGuidelines": {
      "overview": "", "briefTemplate": "", "qualityCheckProcess": "", "commonMistakes": [], "onboardingChecklist": ""
    },
    "maintainingIntegrityAtScale": ""
  },
  "competitivePositioning": {
    "positioningAxis1": { "label": "", "lowEnd": "", "highEnd": "" },
    "positioningAxis2": { "label": "", "lowEnd": "", "highEnd": "" },
    "players": [{ "name": "", "position": { "x": "mid", "y": "mid" }, "narrative": "" }],
    "strategicWhitespace": "",
    "differentiationSummary": "",
    "vulnerabilities": "",
    "movementPlan": ""
  },
  "strategicTradeOffs": [
    {
      "decision": "", "context": "",
      "optionA": { "label": "", "description": "", "pros": [], "cons": [], "bestIf": "", "exampleBrand": "" },
      "optionB": { "label": "", "description": "", "pros": [], "cons": [], "bestIf": "", "exampleBrand": "" },
      "recommendation": "", "revisitWhen": ""
    }
  ],
  "ninetyDayRoadmap": {
    "overview": "",
    "phase1": {
      "name": "Foundation", "objective": "",
      "weeks": [{ "weekNumber": 1, "focus": "", "tasks": [{ "task": "", "pillar": "", "deliverable": "", "timeEstimate": "", "resources": "" }], "milestone": "" }],
      "phase1Success": ""
    },
    "phase2": {
      "name": "Execution", "objective": "",
      "weeks": [{ "weekNumber": 5, "focus": "", "tasks": [{ "task": "", "pillar": "", "deliverable": "", "timeEstimate": "", "resources": "" }], "milestone": "" }],
      "phase2Success": ""
    },
    "phase3": {
      "name": "Optimization", "objective": "",
      "weeks": [{ "weekNumber": 9, "focus": "", "tasks": [{ "task": "", "pillar": "", "deliverable": "", "timeEstimate": "", "resources": "" }], "milestone": "" }],
      "phase3Success": ""
    },
    "day90Snapshot": { "brandAlignmentTarget": "", "biggestWins": [], "keyRisks": [], "nextHorizon": "" }
  },
  "brandHealthScorecard": {
    "overview": "",
    "scorecardDimensions": [{
      "dimension": "", "currentState": "", "targetState": "", "keyMetric": "",
      "measurementMethod": "", "frequency": "",
      "greenThreshold": "", "yellowThreshold": "", "redThreshold": ""
    }],
    "quarterlyReviewProcess": {
      "description": "",
      "steps": [{ "step": "", "detail": "", "timeEstimate": "" }],
      "reviewTemplate": ""
    },
    "leadingIndicators": [{ "indicator": "", "whatItMeans": "", "actionToTake": "" }],
    "laggingIndicators": [{ "indicator": "", "whatItMeans": "", "benchmarkContext": "" }]
  },
  "taglineRecommendations": [
    { "tagline": "", "rationale": "", "bestUsedOn": "", "tone": "", "audienceResonance": "", "variations": [{ "context": "", "variation": "" }] }
  ],
  "brandStory": {
    "headline": "", "narrative": "", "elevatorPitch": "", "founderStory": "", "pressVersion": "", "investorVersion": ""
  },
  "customerJourneyMap": {
    "overview": "",
    "stages": [{ "stage": "", "customerMindset": "", "keyQuestions": [], "touchpoints": [], "messagingFocus": "", "contentTypes": [], "conversionTrigger": "", "kpiToTrack": "", "personaVariations": [{ "persona": "", "adaptation": "" }], "optimizationTips": [], "toolsRecommended": [] }],
    "dropOffRisks": [{ "stage": "", "risk": "", "mitigation": "" }]
  },
  "seoStrategy": {
    "overview": "",
    "primaryKeywords": [{ "keyword": "", "intent": "", "difficulty": "", "contentAngle": "", "pillarConnection": "", "competitiveGap": "", "priorityLevel": "" }],
    "longTailOpportunities": [{ "keyword": "", "searchIntent": "", "contentRecommendation": "", "estimatedImpact": "" }],
    "technicalPriorities": [],
    "contentSEOPlaybook": "",
    "competitorKeywordGaps": "",
    "localSEOStrategy": ""
  },
  "aeoStrategy": {
    "overview": "",
    "entityOptimization": { "currentEntityStatus": "", "entityBuildingActions": [], "structuredDataRecommendations": [], "knowledgeGraphStrategy": "" },
    "contentForAICitation": { "strategy": "", "formatRecommendations": [], "topicAuthority": [], "contentTemplates": [] },
    "faqStrategy": { "overview": "", "priorityFAQs": [], "faqImplementation": "" },
    "competitiveAEOAnalysis": { "overview": "", "gaps": [], "opportunities": [], "defensiveActions": [] },
    "aiSearchMonitoring": { "toolsToUse": [], "metricsToTrack": [], "reviewCadence": "" },
    "implementationRoadmap": [{ "phase": "", "actions": [], "expectedOutcome": "" }]
  },
  "emailMarketingFramework": {
    "overview": "",
    "welcomeSequence": { "description": "", "emails": [{ "timing": "", "subject": "", "purpose": "", "keyMessage": "", "ctaButton": "" }] },
    "nurtureCampaign": { "description": "", "emails": [{ "timing": "", "subject": "", "purpose": "", "keyMessage": "", "contentType": "" }] },
    "reEngagementSequence": { "trigger": "", "emails": [{ "timing": "", "subject": "", "purpose": "", "keyMessage": "" }] },
    "segmentationStrategy": "",
    "subjectLineFormulas": [],
    "sendCadence": "",
    "automationTriggers": []
  },
  "socialMediaStrategy": {
    "overview": "",
    "platforms": [{ "platform": "", "whyThisPlatform": "", "audienceOnPlatform": "", "contentStrategy": "", "postingFrequency": "", "contentMix": "", "examplePosts": [], "kpiToTrack": "", "competitorInsight": "", "growthTactics": [] }],
    "platformsToAvoid": { "platforms": [], "reasoning": "" },
    "crossPlatformStrategy": ""
  },
  "contentCalendarFramework": {
    "overview": "",
    "monthlyThemes": [{ "month": "", "theme": "", "contentPillarFocus": "", "keyTopics": [] }],
    "weeklyStructure": { "description": "", "days": [{ "day": "", "contentType": "", "platform": "", "contentPillar": "", "exampleTopic": "" }] },
    "batchingStrategy": "",
    "repurposingPlaybook": ""
  },
  "swotAnalysis": {
    "overview": "",
    "strengths": [{ "item": "", "evidence": "", "leverage": "" }],
    "weaknesses": [{ "item": "", "evidence": "", "mitigation": "" }],
    "opportunities": [{ "item": "", "context": "", "action": "" }],
    "threats": [{ "item": "", "likelihood": "", "impact": "", "contingency": "" }],
    "strategicImplications": ""
  },
  "brandGlossary": {
    "overview": "",
    "termsToUse": [{ "term": "", "insteadOf": "", "context": "", "example": "" }],
    "phrasesToAvoid": [{ "phrase": "", "why": "", "alternative": "" }],
    "industryJargonGuide": { "useFreely": [], "defineWhenUsed": [], "neverUse": [] }
  },
  "thoughtLeadershipStrategy": {
    "overview": "",
    "authorityPositioning": {
      "expertiseAreas": [],
      "uniquePerspective": "",
      "targetOutlets": []
    },
    "speakingTopics": [{ "topic": "", "audience": "", "angle": "", "formats": "" }],
    "mediaAngles": [{ "angle": "", "hook": "", "targetMedia": "", "talkingPoints": [] }],
    "authorityContentPlan": { "pillarContent": [], "distributionStrategy": "", "cadence": "" },
    "prPositioning": { "mediaReadyBio": "", "boilerplate": "", "mediaKitRecommendations": "" }
  },
  "companyDescription": {
    "oneLiner": "", "shortDescription": "", "fullBoilerplate": "", "proposalIntro": "", "industrySpecific": "", "recruitingVersion": ""
  },
  "valuePricingFramework": {
    "pricingPositioningStatement": "",
    "valueNarrative": "",
    "priceObjectionResponses": [{ "objection": "", "reframe": "", "exampleResponse": "", "personaContext": "" }],
    "proposalLanguageGuide": "",
    "whyUsAtThisPrice": "",
    "personaPricingNarratives": [{ "persona": "", "valueFrame": "", "priceSensitivity": "", "messagingAngle": "", "exampleCopy": "" }],
    "competitiveValueDifferentiation": ""
  },
  "salesConversationGuide": {
    "openingFramework": "",
    "discoveryQuestions": [{ "question": "", "whyThisQuestion": "", "listenFor": "" }],
    "proofPointDeployment": [{ "persona": "", "stage": "", "proofPoint": "", "howToDeliver": "" }],
    "objectionHandlingPlaybook": [{ "objection": "", "response": "", "pillarConnection": "", "proofPoint": "", "personaVariation": "" }],
    "closingLanguage": "",
    "personaConversationTracks": [{ "persona": "", "openingVariation": "", "keyDiscoveryQuestions": [], "presentationEmphasis": "", "likelyObjections": [], "closingApproach": "", "samplePitch": "" }],
    "scenarioScripts": [{ "scenario": "", "script": "", "personaNotes": "" }],
    "salesEnablementTools": { "onePageSellSheet": "", "competitiveHandlingGuide": "", "referralRequestScript": "" }
  },
  "measurementFramework": {
    "overview": "",
    "perSectionKPIs": [{ "section": "", "recommendation": "", "kpi": "", "target": "", "personaImpact": "" }],
    "leadingIndicators": [{ "indicator": "", "whatItMeans": "", "timeframe": "", "actionIfFlat": "" }],
    "trackingRecommendations": [{ "metric": "", "tool": "", "howToSetUp": "", "frequency": "" }],
    "quarterlyReviewTemplate": ""
  },
  "brandStrategyRollout": {
    "brandStrategyOnePager": "",
    "howWeTalkAboutOurselves": {
      "elevatorPitch": "",
      "approvedLanguage": [],
      "phrasesToAvoid": [],
      "companyDescriptions": ""
    },
    "internalRolloutTalkingPoints": [{ "topic": "", "whatToSay": "", "whatToReference": "" }],
    "commonMisrepresentations": [{ "incorrect": "", "correct": "", "why": "" }],
    "presentationReadySummary": "",
    "roleSpecificBrandBriefs": [{ "role": "", "howBrandShowsUp": "", "keyReferences": "", "doAndDont": "" }],
    "newHireBrandOrientation": "",
    "agencyContractorBrandPacket": "",
    "brandInFiveMinutes": ""
  },
  "brandImageryDirection": {
    "photographyStyleDirection": "",
    "subjectMatterGuidance": { "show": [], "avoid": [] },
    "stockPhotoSelectionCriteria": { "lighting": "", "composition": "", "colorTemperature": "", "diversity": "", "authenticityMarkers": "" },
    "imageDonts": [{ "dont": "", "why": "", "alternative": "" }],
    "colorApplicationInImagery": "",
    "platformSpecificImageryGuidance": [{ "platform": "", "dimensions": "", "styleAdaptation": "", "examples": [] }],
    "moodBoardDescriptors": { "adjectives": [], "textures": [], "environments": [], "lightingConditions": "", "colorMoods": "", "designerNote": "" },
    "imageryByAudience": [{ "persona": "", "visualToneShift": "", "exampleImageDescriptions": [] }],
    "beforeAndAfterImageAudit": [{ "context": "", "offBrand": "", "onBrand": "", "rationale": "" }],
    "aiImageGenerationPrompts": [{ "useCase": "", "prompt": "", "negativePrompt": "", "tool": "" }]
  },
  "assetOptimizationPlaybook": {
    "summary": "",
    "overallAlignmentScore": 0,
    "assetAudits": [{
      "fileName": "",
      "category": "",
      "overallScore": 0,
      "pillarAlignment": {
        "positioning": { "score": 0, "observation": "", "fix": "" },
        "messaging": { "score": 0, "observation": "", "fix": "" },
        "visibility": { "score": 0, "observation": "", "fix": "" },
        "credibility": { "score": 0, "observation": "", "fix": "" },
        "conversion": { "score": 0, "observation": "", "fix": "" }
      },
      "optimizationSteps": [{ "priority": "", "pillar": "", "current": "", "recommended": "", "impact": "" }],
      "customPrompts": [{ "useCase": "", "prompt": "" }]
    }],
    "crossAssetPatterns": {
      "strongestPillar": "",
      "weakestPillar": "",
      "systemicIssues": [],
      "topPriorityActions": []
    }
  },
  "brandStandardsGuide": {
    "logoGuidelines": {
      "overview": "",
      "clearSpace": "",
      "minimumSize": "",
      "placementRules": [],
      "incorrectUses": []
    },
    "layoutGuidelines": {
      "overview": "",
      "margins": "",
      "spacing": "",
      "gridSystem": "",
      "digitalPatterns": [],
      "printPatterns": []
    },
    "writingGuidelines": {
      "overview": "",
      "grammarPreferences": [],
      "jargonRules": "",
      "pointOfView": "",
      "inclusiveLanguage": "",
      "stylePreferences": []
    },
    "sampleExecutions": [{ "channel": "", "format": "", "description": "", "keyElements": [] }],
    "doAndDontPages": [{ "area": "", "doExample": "", "dontExample": "", "why": "" }],
    "governanceTemplate": {
      "brandOwnerRole": "",
      "reviewCadence": "",
      "exceptionProcess": ""
    }
  },
  "thoughtLeadershipStrategy": {
    "overview": "",
    "authorityPositioning": { "expertiseAreas": [], "uniquePerspective": "", "targetOutlets": [] },
    "speakingTopics": [{ "topic": "", "audience": "", "angle": "", "formats": "" }],
    "mediaAngles": [{ "angle": "", "hook": "", "targetMedia": "", "talkingPoints": [] }],
    "authorityContentPlan": { "pillarContent": [], "distributionStrategy": "", "cadence": "" },
    "prPositioning": { "mediaReadyBio": "", "boilerplate": "", "mediaKitRecommendations": "" }
  },
  "credibilityStrategy": {
    "overview": "",
    "proofPointsToCreate": [{ "proofPoint": "", "type": "", "priority": "", "howToGet": "", "whereToDisplay": "" }],
    "testimonialStrategy": { "whoToAsk": "", "howToAsk": "", "whatToCapture": "", "whereToPlace": "" },
    "authoritySignals": [{ "signal": "", "impact": "", "timeline": "" }],
    "trustGaps": ""
  },
  "websiteCopyDirection": {
    "overview": "",
    "homepage": { "heroHeadline": "", "heroSubheadline": "", "heroCtaButton": "", "valuePropSection": "", "socialProofPlacement": "" },
    "aboutPage": { "openingHook": "", "storyFramework": "", "teamPositioning": "" },
    "servicesPage": { "pageStructure": "", "serviceFramework": "", "pricingLanguage": "" },
    "copyPrinciples": [{ "principle": "", "example": "" }]
  }
}

All fields must be present and JSON must be valid.
NOTE: "assetOptimizationPlaybook" should ONLY be included if asset analysis data was provided in the prompt context. If no assets were uploaded, omit this key entirely.

---------------------------------------------------------------------
AI PROMPT PACK REQUIREMENTS
---------------------------------------------------------------------

Blueprint+™ includes THREE prompt packs totaling 28 prompts:

1. Foundational Prompt Pack (8 prompts) — Brand basics: positioning, messaging, content, social, website, email, SEO, AEO
2. Execution Prompt Pack (8 prompts) — Campaign execution: ad copy, landing pages, email sequences, sales scripts, content calendars, analytics
3. Advanced Prompt Library (12 prompts) — Advanced strategy: campaign optimization, funnel analysis, competitive intelligence, AI/AEO content, brand scaling, internal alignment, audience research, content repurposing, partnership outreach, thought leadership, crisis communication, brand audit

Every prompt MUST:
- Be specific to THIS business (include business name, industry, audience)
- Be copy-paste ready into ChatGPT or Claude
- Include context the AI needs to produce relevant output
- NOT be generic (never "Write a social media post about your product")

---------------------------------------------------------------------
CONTENT QUALITY REQUIREMENTS
---------------------------------------------------------------------

For EVERY recommendation, action, or strategic direction:
- Include a CONCRETE example specific to the user's business
- Explain WHY it matters (not just what to do)
- Show HOW to implement it (step-by-step)
- Include ready-to-use templates or copy where applicable
- Make it immediately actionable

For Messaging Matrix example copy:
- Each exampleCopy field must contain actual ready-to-use copy (LinkedIn post text, email subject + body snippet, ad copy, etc.)
- Copy must be specific to the business, not generic marketing templates

For Email Nurture Template:
- Include 4 complete emails with timing, subject, purpose, and full body copy
- Emails should form a coherent nurture sequence that builds trust and moves toward conversion

For Archetype Activation examples:
- Include 2–3 on-brand/off-brand comparisons per area
- Examples must be specific scenarios the business would actually face

For Brand Archetypes:
- Use ONLY these 12: Sage, Hero, Outlaw, Magician, Lover, Caregiver, Ruler, Creator, Innocent, Explorer, Neighbor, Entertainer
- NEVER use "Jester", "Everyman", "Regular Guy", or "The Guide"

---------------------------------------------------------------------
DESIGN & TONE
---------------------------------------------------------------------
- Approachable expert at the highest level — like a world-class strategist who speaks plainly and cares deeply
- Warm confidence — never cold, never corporate-speak, never intimidating
- Supportive and empowering — the reader should feel "I can do this" not "this is overwhelming"
- Executive-level clarity without executive-level stiffness
- No hype, no shortcuts, no jargon without explanation
- Feels expensive because it is thorough and genuinely helpful
- Every section demonstrates strategic thinking AND practical implementation
- Write recommendations as if guiding a friend through their brand strategy
- Use proper typographic quotes (curly quotes) in all content

---------------------------------------------------------------------
ABSOLUTE RULES
---------------------------------------------------------------------
- Never reference Wundy™ or the chatbot.
- Never mention internal scoring logic.
- Never use emojis.
- Never speculate beyond provided inputs.
- Never fabricate details about the business.
- Every prompt must be specific to this brand and immediately usable.
- This document must support scale and long-term brand growth.
- Every template and example must be ready to use, not placeholder text.

REPORT DISCLAIMER (include as a "disclaimer" field in the JSON output):
"This report provides strategic brand guidance based on the information you provided during the WunderBrand Snapshot™ diagnostic. It is not a substitute for legal, financial, or industry-specific regulatory advice. Recommendations should be evaluated in the context of your specific business circumstances, competitive landscape, and applicable regulations. All benchmarks, financial estimates, impact projections, and competitive positioning evaluations are directional and based on industry patterns and AI-informed analysis, not guaranteed outcomes. The Brand Consistency Checklist provides operational guidelines for maintaining brand consistency — it does not constitute legal or regulatory compliance advice."
`;
