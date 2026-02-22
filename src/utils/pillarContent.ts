export type BrandStage = "early" | "scaling" | "established";

export type PillarKey =
  | "positioning"
  | "messaging"
  | "visibility"
  | "credibility"
  | "conversion";

export interface PillarContent {
  title: string;
  summary: (brandName: string) => string;
  whyItMatters: (brandName: string) => string;
  whyItMattersShort: {
    early: string;
    scaling: string;
    established: string;
  };
  expanded: {
    early: (brandName: string) => string;
    scaling: (brandName: string) => string;
    established: (brandName: string) => string;
  };
  recommendations: {
    early: string[];
    scaling: string[];
    established: string[];
  };
}

export const PILLARS: Record<PillarKey, PillarContent> = {
  positioning: {
    title: "Positioning",
    summary: (brand) =>
      `${brand} has a foundation in place, but its position in the market could be sharper and more distinct.`,

    whyItMatters: () =>
      "Clear positioning makes it obvious who you're for, why you're different, and why someone should choose you over any alternative — including doing nothing.",

    whyItMattersShort: {
      early: "At this stage, positioning clarity is the single fastest way to reduce customer acquisition cost and attract the right early adopters.",
      scaling: "Inconsistent positioning becomes a multiplier problem at scale — every new channel, hire, and campaign amplifies the gap between intent and perception.",
      established: "Established brands with imprecise positioning bleed margin quietly — premium pricing requires a position the market can articulate without you in the room.",
    },

    expanded: {
      early: (brand) =>
        `At this stage, ${brand} is still forming how it shows up in the market. The offer and audience are emerging, but they aren't yet anchored to a single, clear point of view. This is the highest-leverage moment to define positioning — the brands that get this right early spend 40–60% less to acquire customers over time.`,

      scaling: (brand) =>
        `${brand} has traction, but the positioning hasn't kept pace with growth. As your audience expands, slight inconsistencies in how the brand describes what it does compound into diluted differentiation and longer sales cycles.`,

      established: (brand) =>
        `${brand} is recognized, but the positioning may reflect where the brand has been rather than where it's headed. Strategic repositioning ensures continued relevance, protects premium pricing, and creates space for new market opportunities.`
    },

    recommendations: {
      early: [
        "Define your primary audience with enough specificity that you can name 10 real people who fit",
        "Articulate a single value proposition that passes the 'so what' test — if a competitor could say the same thing, it's not positioning",
        "Validate positioning against 3–5 competitors to identify defensible white space"
      ],
      scaling: [
        "Codify your category definition so every team member describes what you do in the same 15 words",
        "Sharpen differentiation language from feature-based to outcome-based framing",
        "Audit positioning consistency across website, sales decks, social profiles, and ad copy"
      ],
      established: [
        "Stress-test current positioning against evolving market dynamics and emerging competitors",
        "Develop category leadership narrative that positions you as the standard, not just an option",
        "Conduct a full touchpoint audit to eliminate positioning drift across the organization"
      ]
    }
  },

  messaging: {
    title: "Messaging",
    summary: (brand) =>
      `${brand} communicates value, but the message isn't consistently landing with the clarity and confidence needed to drive trust at scale.`,

    whyItMatters: () =>
      "Messaging is how positioning becomes tangible — it determines whether people understand, remember, and repeat what your brand stands for.",

    whyItMattersShort: {
      early: "Early-stage messaging shapes first impressions that are expensive to undo — getting the core narrative right now prevents costly rebrand cycles later.",
      scaling: "At scale, inconsistent messaging across channels creates a compounding trust deficit — each mixed signal makes the next conversion harder to earn.",
      established: "For established brands, messaging precision is a margin lever — the gap between 'they're good' and 'they're the obvious choice' is often one sentence.",
    },

    expanded: {
      early: (brand) =>
        `${brand} is still finding its voice. The message changes depending on the channel and the moment, which makes it harder for people to build the kind of quick, intuitive understanding that drives referrals and shortens sales cycles.`,

      scaling: (brand) =>
        `${brand} has messaging that works in certain contexts — but not consistently. As volume increases, the lack of a codified messaging system means each new touchpoint is a coin flip between reinforcing the brand and diluting it.`,

      established: (brand) =>
        `${brand} has a recognized voice, but some messages may have calcified around language that resonated in an earlier market. Refreshing the narrative can unlock new audience segments without abandoning the brand equity already built.`
    },

    recommendations: {
      early: [
        "Define 3 messaging pillars that anchor every piece of communication to a consistent strategic theme",
        "Rewrite your homepage headline, LinkedIn bio, and email signature to use identical positioning language",
        "Create a 'messaging cheat sheet' with approved phrases and ones to retire"
      ],
      scaling: [
        "Build a messaging hierarchy: one master narrative, 3 supporting themes, and channel-specific adaptations",
        "Standardize core language across sales scripts, marketing copy, and customer communications",
        "Implement a quarterly messaging audit to catch drift before it compounds"
      ],
      established: [
        "Refresh key narratives to reflect current market position and future ambition",
        "Eliminate jargon that creates distance between the brand and its buyers",
        "Test messaging variants with actual customers to validate resonance vs. internal preference"
      ]
    }
  },

  visibility: {
    title: "Visibility",
    summary: (brand) =>
      `${brand} is present in select channels, but discovery gaps mean qualified prospects are finding alternatives where ${brand} should be appearing.`,

    whyItMatters: () =>
      "Visibility is distribution for your brand — if people and AI systems can't find you when intent is highest, your positioning, messaging, and credibility never get the chance to work.",

    whyItMattersShort: {
      early: "Early-stage visibility isn't about being everywhere — it's about being findable in the 2–3 channels where your best customers are actively looking for solutions.",
      scaling: "Visibility gaps become opportunity cost at scale — every high-intent search where you don't appear is a qualified prospect defaulting to a competitor.",
      established: "For established brands, the visibility frontier has shifted to AI-powered discovery — brands that aren't optimized for AEO are invisible in the conversations that increasingly drive buying decisions.",
    },

    expanded: {
      early: (brand) =>
        `${brand} has limited discoverability today. Growth depends heavily on referrals or direct outreach, which caps scalability. Establishing presence in 2–3 high-intent channels will create the organic discovery that makes every other marketing dollar work harder.`,

      scaling: (brand) =>
        `${brand} shows up, but not always where buyer intent is highest. The gap between current visibility and where high-value prospects are searching represents measurable lost revenue — especially as AI-powered search reshapes how people discover brands.`,

      established: (brand) =>
        `${brand} has reach, but visibility may not reflect the authority the brand has earned. Strategic investment in AEO ensures AI assistants reference and recommend ${brand} accurately, while traditional channels maintain consistent top-of-mind presence.`
    },

    recommendations: {
      early: [
        "Establish a clear web presence optimized for your primary audience's search behavior",
        "Build foundational SEO on your highest-intent keywords — prioritize 5–10 terms with commercial intent",
        "Create one piece of authoritative, comprehensive content that AI systems can reference about your category"
      ],
      scaling: [
        "Invest in content structured for AI-powered answers — FAQ pages, definitive guides, and structured data",
        "Strengthen authoritative signals through backlinks, mentions, and consistent entity information across platforms",
        "Diversify discovery across organic search, social, and AI-powered platforms to reduce single-channel dependency"
      ],
      established: [
        "Develop an AEO strategy to own the AI-generated answers in your category",
        "Build topical authority clusters that position you as the definitive source in your space",
        "Audit all platforms where your brand is cited by AI systems and ensure accuracy and consistency"
      ]
    }
  },

  credibility: {
    title: "Credibility",
    summary: (brand) =>
      `${brand} has trust indicators in place, but they aren't strategically deployed where buying decisions happen — creating unnecessary hesitation at critical moments.`,

    whyItMatters: () =>
      "Credibility is the currency of conversion — it determines whether a prospect trusts you enough to take the next step, and how much price sensitivity enters the conversation.",

    whyItMattersShort: {
      early: "Early-stage credibility is about demonstrating competence before you have a track record — every proof point you surface removes a reason for prospects to choose a 'safer' alternative.",
      scaling: "As visibility grows, credibility gaps become amplified — more people seeing an inconsistent trust story means more deals lost to competitors who simply look more established.",
      established: "For established brands, credibility maintenance is an active practice — market perception lags behind reality, so proof points need to be refreshed as aggressively as they were first built.",
    },

    expanded: {
      early: (brand) =>
        `${brand} is still building the proof that makes prospects feel safe choosing a newer brand. Visual consistency, early testimonials, and clear expertise signals will establish the trust foundation that makes every subsequent marketing effort more effective.`,

      scaling: (brand) =>
        `${brand} has earned credibility, but not all trust signals are visible where they matter. Inconsistency between what prospects see on the website, social media, and in proposals creates micro-doubts that quietly erode conversion rates.`,

      established: (brand) =>
        `${brand} has established trust, but ongoing reinforcement ensures it's protected at scale. Refreshing proof points, modernizing visual execution, and surfacing new forms of social proof prevents the perception gap that allows newer competitors to appear more current.`
    },

    recommendations: {
      early: [
        "Collect and prominently display 3–5 testimonials that speak to specific outcomes, not generic praise",
        "Standardize visual elements — consistent typography, color, and imagery across all touchpoints",
        "Create one detailed case study or success narrative that demonstrates your methodology and results"
      ],
      scaling: [
        "Build a formal brand guidelines document and enforce it across all new content production",
        "Deploy social proof strategically — place testimonials at decision points, not just testimonial pages",
        "Develop authority content (industry reports, original research, expert commentary) that positions you as a thought leader"
      ],
      established: [
        "Commission a comprehensive brand system audit to identify and close credibility gaps",
        "Refresh visual identity to ensure it reflects current market position, not legacy brand equity",
        "Build a systematic proof-point pipeline — quarterly testimonial collection, annual case study production, ongoing credential acquisition"
      ]
    }
  },

  conversion: {
    title: "Conversion",
    summary: (brand) =>
      `${brand} generates interest, but structural friction in the path from engagement to action means qualified attention is being lost before it becomes revenue.`,

    whyItMatters: () =>
      "Conversion is where every upstream investment — in positioning, messaging, visibility, and credibility — either compounds into revenue or leaks out through unclear next steps.",

    whyItMattersShort: {
      early: "For early-stage brands, conversion infrastructure isn't a luxury — it's the difference between growing through intention and growing through luck.",
      scaling: "At scale, even small conversion improvements compound significantly — a 10% improvement in conversion efficiency at higher traffic volumes has outsized revenue impact.",
      established: "For established brands, conversion optimization is one of the highest-ROI investments available — the audience already exists, and the goal is to remove every unnecessary barrier between intent and action.",
    },

    expanded: {
      early: (brand) =>
        `${brand} likely relies on organic interest rather than structured conversion paths. Without clear calls-to-action, lead capture mechanisms, and follow-up systems, growth depends on prospects doing the work of figuring out how to buy — and most won't.`,

      scaling: (brand) =>
        `${brand} has conversion paths in place, but they aren't optimized as a cohesive system. Disconnects between messaging, CTAs, and follow-up flows mean qualified prospects are dropping off at predictable — and fixable — points.`,

      established: (brand) =>
        `${brand} converts at scale, but micro-optimizations to the conversion system — clearer CTAs, tighter page hierarchy, stronger confidence signals at decision points — can meaningfully improve efficiency and reduce cost per acquisition.`
    },

    recommendations: {
      early: [
        "Define a single, clear primary CTA for every page — one action, one outcome, zero ambiguity",
        "Build a basic lead capture system (email list + welcome sequence) to convert visitors into a contactable audience",
        "Map the 3-step path from first visit to first conversion and eliminate every unnecessary choice or click"
      ],
      scaling: [
        "Implement a CTA hierarchy — primary, secondary, and tertiary actions that guide different levels of buyer readiness",
        "Align on-page messaging with visitor intent at each stage of the funnel",
        "A/B test critical conversion points (headlines, CTAs, form length) to find the highest-performing variants"
      ],
      established: [
        "Conduct a full conversion funnel audit to identify and quantify drop-off points",
        "Optimize micro-conversions — newsletter signups, content downloads, demo requests — that feed the primary revenue path",
        "Deploy behavioral triggers and personalization to serve the right CTA based on where each visitor is in the buying journey"
      ]
    }
  }
};
