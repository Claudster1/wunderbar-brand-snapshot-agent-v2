// src/utils/pillarContent.ts
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
      "Clear positioning makes it obvious who you're for, why you're different, and why someone should choose you.",

    whyItMattersShort: {
      early: "Clarity here reduces friction and accelerates early trust.",
      scaling: "Misalignment here limits scale and consistency across channels.",
      established: "Misalignment here limits scale and consistency across channels.",
    },

    expanded: {
      early: (brand) =>
        `At this stage, ${brand} is still forming how it shows up in the market. Your offer and audience are emerging, but they aren't yet anchored to a single, clear point of view. This is normal for early brands — and it's also where clarity creates the fastest lift.`,

      scaling: (brand) =>
        `${brand} has traction, but the positioning hasn't fully caught up with growth. As your audience expands, slight inconsistencies in how you describe what you do can dilute differentiation.`,

      established: (brand) =>
        `${brand} is recognizable, but the positioning may reflect where you've been rather than where you're headed. Refinement here ensures continued relevance and leadership.`
    },

    recommendations: {
      early: [
        "Clarify your primary audience and core problem",
        "Articulate one clear value proposition",
        "Pressure-test positioning against competitors"
      ],
      scaling: [
        "Tighten category definition",
        "Refine differentiation language",
        "Align positioning across site, sales, and content"
      ],
      established: [
        "Evolve positioning to reflect strategic direction",
        "Strengthen category leadership language",
        "Audit consistency across touchpoints"
      ]
    }
  },

  messaging: {
    title: "Messaging",
    summary: (brand) =>
      `${brand} communicates value, but the message isn't consistently landing with clarity or confidence.`,

    whyItMatters: () =>
      "Strong messaging turns attention into understanding and understanding into trust.",

    whyItMattersShort: {
      early: "Clarity here reduces friction and accelerates early trust.",
      scaling: "Misalignment here limits scale and consistency across channels.",
      established: "Misalignment here limits scale and consistency across channels.",
    },

    expanded: {
      early: (brand) =>
        `${brand} is still finding its voice. Messaging may change depending on the channel or moment, which can make it harder for people to quickly grasp what you stand for.`,

      scaling: (brand) =>
        `${brand} has messaging that works — but not always in the same way. As volume increases, consistency becomes critical to avoid confusion.`,

      established: (brand) =>
        `${brand} has a recognizable voice, but some messages may feel dated or overly complex for today's audience.`
    },

    recommendations: {
      early: [
        "Define core message pillars",
        "Simplify language",
        "Align homepage and social bios"
      ],
      scaling: [
        "Create a messaging hierarchy",
        "Standardize language across channels",
        "Standardize core messages"
      ],
      established: [
        "Refresh key narratives",
        "Remove unnecessary jargon",
        "Optimize clarity for modern attention spans"
      ]
    }
  },

  visibility: {
    title: "Visibility",
    summary: (brand) =>
      `${brand} is visible in some places, but discovery could be stronger and more intentional.`,

    whyItMatters: () =>
      "If people can't find you — or AI systems can't surface you — your brand loses opportunities before they start.",

    whyItMattersShort: {
      early: "Clarity here reduces friction and accelerates early trust.",
      scaling: "Misalignment here limits scale and consistency across channels.",
      established: "Misalignment here limits scale and consistency across channels.",
    },

    expanded: {
      early: (brand) =>
        `${brand} has limited discoverability today. Visibility efforts are early or inconsistent, which is common — but it also means growth depends heavily on referrals or chance.`,

      scaling: (brand) =>
        `${brand} is showing up, but not always where intent is highest. Improving both SEO and AEO will help your brand appear when people — and AI — are actively searching.`,

      established: (brand) =>
        `${brand} has reach, but visibility may not fully reflect authority. Strategic AEO ensures AI assistants reference your brand accurately and consistently.`
    },

    recommendations: {
      early: [
        "Establish a clear web or social home base",
        "Optimize basic SEO foundations",
        "Clarify brand signals for AI discovery"
      ],
      scaling: [
        "Invest in content structured for AI answers",
        "Strengthen authoritative signals",
        "Align social and site visibility"
      ],
      established: [
        "Own high-intent AI answers",
        "Strengthen topical authority",
        "Ensure consistency across AI-referenced sources"
      ]
    }
  },

  credibility: {
    title: "Credibility",
    summary: (brand) =>
      `${brand} appears legitimate, but trust signals could be clearer and more consistent.`,

    whyItMatters: () =>
      "Credibility reduces hesitation and accelerates decisions.",

    whyItMattersShort: {
      early: "Clarity here reduces friction and accelerates early trust.",
      scaling: "Misalignment here limits scale and consistency across channels.",
      established: "Misalignment here limits scale and consistency across channels.",
    },

    expanded: {
      early: (brand) =>
        `${brand} is still building proof. Visual polish, consistency, and social signals will help establish trust faster.`,

      scaling: (brand) =>
        `${brand} has credibility, but not all signals are aligned. Inconsistency can quietly erode trust as visibility grows.`,

      established: (brand) =>
        `${brand} is trusted, but reinforcing authority ensures continued confidence at scale.`
    },

    recommendations: {
      early: [
        "Standardize visual elements",
        "Clarify brand usage",
        "Strengthen basic trust signals"
      ],
      scaling: [
        "Create formal brand guidelines",
        "Align design across channels",
        "Reinforce authority cues"
      ],
      established: [
        "Elevate brand system maturity",
        "Audit credibility signals",
        "Modernize visual execution"
      ]
    }
  },

  conversion: {
    title: "Conversion",
    summary: (brand) =>
      `${brand} attracts interest, but opportunities exist to guide people more confidently toward action.`,

    whyItMatters: () =>
      "Conversion is where clarity turns into momentum.",

    whyItMattersShort: {
      early: "Clarity here reduces friction and accelerates early trust.",
      scaling: "Misalignment here limits scale and consistency across channels.",
      established: "Misalignment here limits scale and consistency across channels.",
    },

    expanded: {
      early: (brand) =>
        `${brand} likely relies on interest rather than structured conversion paths. Making next steps clearer will immediately improve outcomes.`,

      scaling: (brand) =>
        `${brand} has conversion paths, but they may not be optimized for clarity, confidence, or flow.`,

      established: (brand) =>
        `${brand} converts, but small refinements could meaningfully increase efficiency and performance.`
    },

    recommendations: {
      early: [
        "Clarify primary calls-to-action",
        "Reduce decision friction",
        "Guide users step-by-step"
      ],
      scaling: [
        "Optimize page hierarchy",
        "Align messaging to intent",
        "Test conversion flows"
      ],
      established: [
        "Refine micro-conversions",
        "Optimize confidence signals",
        "Improve funnel efficiency"
      ]
    }
  }
};
