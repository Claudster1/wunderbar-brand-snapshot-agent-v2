// content/postPurchaseCopy.ts
// Post-purchase preparation page copy — tier-specific

export type PostPurchaseTier = "snapshot-plus" | "blueprint" | "blueprint-plus";

export interface ChecklistItem {
  bold: string;
  detail: string;
}

export interface HowItWorksStep {
  title: string;
  detail: string;
}

export interface PostPurchaseCopy {
  eyebrow: string;
  headline: string;
  subhead: string;
  reinforcement: string;

  checklist: {
    headline: string;
    subtext: string;
    items: ChecklistItem[];
    uploadNote: string | null;
  };

  steps: HowItWorksStep[];

  noRush: {
    body: string;
    extra: string | null;
  };

  primaryCta: string;
  secondaryCta: string;
  reassurance: (email: string) => string;
}

const SHARED_CHECKLIST_BASE: ChecklistItem[] = [
  {
    bold: "Your website URL",
    detail:
      "Wundy\u2122 will use this to understand how your brand is currently showing up in the world.",
  },
  {
    bold: "Your social media handles",
    detail:
      "Gives Wundy\u2122 a sense of your voice, consistency, and visibility across channels.",
  },
  {
    bold: "2\u20133 competitor names",
    detail:
      "Helps Wundy\u2122 assess your positioning relative to who you\u2019re actually competing with.",
  },
  {
    bold: "Your current customers \u2014 and who you\u2019d love to attract",
    detail:
      "The clearer you are on your audience, the sharper your messaging and conversion analysis will be.",
  },
  {
    bold: "Your business goals for the next 6\u201312 months",
    detail:
      "Your recommendations will be calibrated to where you\u2019re headed, not just where you are today.",
  },
];

const BLUEPRINT_EXTRA_CHECKLIST: ChecklistItem[] = [
  {
    bold: "Current brand guidelines or style guide",
    detail:
      "If you have one, upload it. Wundy\u2122 will assess what\u2019s working and what\u2019s worth keeping as your brand evolves.",
  },
  {
    bold: "Logo files",
    detail:
      "Helps inform your visual direction analysis and brand consistency assessment.",
  },
  {
    bold: "A sample of current marketing material",
    detail:
      "A brochure, one-pager, or PDF gives Wundy\u2122 a real-world view of how your brand communicates today.",
  },
];

const BLUEPRINT_PLUS_EXTRA_CHECKLIST: ChecklistItem[] = [
  ...BLUEPRINT_EXTRA_CHECKLIST,
  {
    bold: "Pitch deck or sales presentation",
    detail:
      "Shows how your brand holds up under pressure \u2014 in the moments that actually drive decisions.",
  },
  {
    bold: "Email templates or newsletter samples",
    detail:
      "Reveals how consistent your voice is across channels and how well your messaging converts.",
  },
  {
    bold: "Case studies or testimonials documents",
    detail:
      "Your credibility signals are a key input for your trust-building and conversion strategy.",
  },
  {
    bold: "Any previous brand audit or strategy work",
    detail:
      "Helps Wundy\u2122 build on what you\u2019ve already done rather than starting from scratch.",
  },
];

const NO_RUSH_SHARED =
  "You can start now, or come back whenever you\u2019re ready. Your progress saves automatically, and you can pause and resume at any time. If you close this page, you can pick up exactly where you left off \u2014 from your dashboard or the link in your confirmation email.";

export const POST_PURCHASE_COPY: Record<PostPurchaseTier, PostPurchaseCopy> = {
  "snapshot-plus": {
    eyebrow: "YOU\u2019RE ALL SET",
    headline: "Your WunderBrand Snapshot+\u2122 is ready.",
    subhead:
      "In 20\u201325 minutes, Wundy\u2122 will guide you through a personalized brand conversation and generate your diagnostic results \u2014 ready the moment you\u2019re done.",
    reinforcement:
      "Wundy\u2122 will turn your answers into personalized strategic results \u2014 including your WunderBrand Score\u2122, pillar-by-pillar analysis across all five brand pillars, and a Foundational Prompt Pack you can put to work in any AI tool immediately. This is your brand, clearly assessed and ready to act on.",

    checklist: {
      headline:
        "Having these nearby will make your results more specific \u2014 and more actionable.",
      subtext:
        "You may not have all of this \u2014 or any of it \u2014 and that\u2019s completely fine. Wundy\u2122 meets you where you are and works with whatever you bring. The more context you can share, the more tailored your results will be, but a great diagnostic starts with nothing more than your answers.",
      items: [...SHARED_CHECKLIST_BASE],
      uploadNote: null,
    },

    steps: [
      {
        title: "Have a conversation with Wundy\u2122",
        detail:
          "Wundy\u2122 will ask about your business, audience, and brand presence. Answer naturally \u2014 there are no wrong answers, and no prep required. The more specific you are, the more precise your results will be.",
      },
      {
        title: "Get your results instantly",
        detail:
          "Your WunderBrand Snapshot+\u2122 results are generated the moment the conversation is complete \u2014 including your WunderBrand Score\u2122, analysis across all five brand pillars, and personalized strategic recommendations tailored to your business.",
      },
      {
        title: "Put your insights to work",
        detail:
          "Your Foundational Prompt Pack includes 8 AI prompts built from your specific results, ready to use in any AI tool. Start building your brand platform the same day you receive your results.",
      },
    ],

    noRush: {
      body: NO_RUSH_SHARED,
      extra: null,
    },

    primaryCta: "Start Your WunderBrand Snapshot+\u2122 \u2192",
    secondaryCta: "I\u2019ll come back later \u2014 take me to my dashboard",
    reassurance: (email: string) =>
      `We\u2019ve sent a confirmation email to ${email} with everything you need. Your WunderBrand Snapshot+\u2122 will be waiting whenever you\u2019re ready.`,
  },

  blueprint: {
    eyebrow: "YOU\u2019RE ALL SET",
    headline: "Your WunderBrand Blueprint\u2122 is ready.",
    subhead:
      "In about 25\u201330 minutes, Wundy\u2122 will build a complete picture of your brand \u2014 and turn it into a strategy you can execute.",
    reinforcement:
      "What you\u2019re about to build is rare: a complete brand foundation, scored, interpreted, and mapped to an execution-ready strategy \u2014 all in one session. Your WunderBrand Score\u2122, pillar analysis, and Interactive Brand Workbook will be ready the moment you\u2019re done. The more context you bring into this conversation, the more specific and actionable your Blueprint\u2122 will be.",

    checklist: {
      headline:
        "Having these nearby will make your Blueprint\u2122 more specific \u2014 and more actionable.",
      subtext:
        "You may not have all of this \u2014 or any of it \u2014 and that\u2019s completely fine. Wundy\u2122 meets you where you are. Any materials you can share will directly sharpen your results \u2014 even a website URL and a couple of competitor names make a difference.",
      items: [...SHARED_CHECKLIST_BASE, ...BLUEPRINT_EXTRA_CHECKLIST],
      uploadNote:
        "You can upload up to 3 files during the conversation \u2014 images (JPEG, PNG, WebP, GIF) and PDFs accepted, up to 20 MB each. Uploading is optional but recommended \u2014 the more Wundy\u2122 can see, the more specific your Blueprint\u2122 will be.",
    },

    steps: [
      {
        title: "Have a conversation with Wundy\u2122",
        detail:
          "Wundy\u2122 will ask about your business, audience, positioning, and how your brand shows up across channels. Answer naturally \u2014 there are no wrong answers. If you\u2019ve gathered materials to upload, you\u2019ll have the opportunity to share them during the conversation.",
      },
      {
        title: "Get your results instantly",
        detail:
          "Your WunderBrand Blueprint\u2122 results are generated the moment the conversation is complete \u2014 including your WunderBrand Score\u2122, analysis across all five brand pillars, your brand archetype, messaging framework, and a complete execution-ready strategy.",
      },
      {
        title: "Open your Interactive Brand Workbook",
        detail:
          "Your Workbook is built directly from your diagnostic results. Review, refine, and finalize your brand outputs \u2014 then export your Brand Standards PDF when you\u2019re ready to put it to work.",
      },
    ],

    noRush: {
      body: NO_RUSH_SHARED,
      extra: null,
    },

    primaryCta: "Start Your WunderBrand Blueprint\u2122 \u2192",
    secondaryCta: "I\u2019ll come back later \u2014 take me to my dashboard",
    reassurance: (email: string) =>
      `We\u2019ve sent a confirmation email to ${email} with everything you need. Your WunderBrand Blueprint\u2122 will be waiting whenever you\u2019re ready.`,
  },

  "blueprint-plus": {
    eyebrow: "YOU\u2019RE ALL SET",
    headline: "Your WunderBrand Blueprint+\u2122 is ready.",
    subhead:
      "Over the next 30\u201340 minutes, Wundy\u2122 will guide you through a comprehensive brand conversation \u2014 building the foundation for your Strategy Activation Session.",
    reinforcement:
      "You\u2019ve made a significant investment in your brand. What you\u2019ll walk away with \u2014 your Advanced Prompt Library, a complete scalable brand strategy, and your complimentary Strategy Activation Session with our team \u2014 is the kind of clarity that typically takes months and five figures to get. The more context you give Wundy\u2122, the more precise and actionable your results will be.",

    checklist: {
      headline:
        "The more you bring in, the more you\u2019ll walk away with.",
      subtext:
        "You may not have all of this \u2014 or any of it \u2014 and that\u2019s completely fine. Wundy\u2122 will build you a strong diagnostic no matter where you\u2019re starting from. Any materials you can upload become part of what Wundy\u2122 analyzes \u2014 the more context you bring, the more precisely your results will reflect where your brand actually stands today.",
      items: [
        {
          bold: "Your website URL",
          detail:
            "Wundy\u2122 will use this to evaluate how your brand is currently showing up and identify gaps in positioning, messaging, and visibility.",
        },
        {
          bold: "Your social media handles",
          detail:
            "Helps Wundy\u2122 assess channel consistency, voice alignment, and discovery opportunities across platforms.",
        },
        {
          bold: "2\u20133 competitor names",
          detail:
            "Your positioning and differentiation analysis is built around your actual competitive landscape. Be specific.",
        },
        {
          bold: "Your current customers \u2014 and who you\u2019d love to attract",
          detail:
            "Your audience segmentation, messaging matrix, and campaign architecture all depend on how clearly you can articulate who you serve and who you want to reach.",
        },
        {
          bold: "Your business goals for the next 6\u201312 months",
          detail:
            "Blueprint+\u2122 is designed for scale. Your growth objectives directly shape the campaign architecture and AEO strategy in your results.",
        },
        {
          bold: "Current brand guidelines or style guide",
          detail:
            "Wundy\u2122 will assess what\u2019s working, what\u2019s holding you back, and how to evolve your brand without starting over.",
        },
        {
          bold: "Logo files",
          detail:
            "Informs your visual direction analysis and brand consistency scoring.",
        },
        {
          bold: "A sample of current marketing material",
          detail:
            "A brochure, one-pager, or PDF gives Wundy\u2122 a real-world view of how your brand communicates today.",
        },
        {
          bold: "Pitch deck or sales presentation",
          detail:
            "Shows how your brand holds up under pressure \u2014 in the moments that actually drive decisions.",
        },
        {
          bold: "Email templates or newsletter samples",
          detail:
            "Reveals how consistent your voice is across channels and how well your messaging converts.",
        },
        {
          bold: "Case studies or testimonials documents",
          detail:
            "Your credibility signals are a key input for your trust-building and conversion strategy.",
        },
        {
          bold: "Any previous brand audit or strategy work",
          detail:
            "Helps Wundy\u2122 build on what you\u2019ve already done rather than starting from scratch.",
        },
      ],
      uploadNote:
        "You can upload up to 10 files during the conversation \u2014 images (JPEG, PNG, WebP, GIF), PDFs, presentations (PPTX), and documents (DOCX) accepted, up to 20 MB each. The more Wundy\u2122 can see, the more your Blueprint+\u2122 will reflect where your brand actually stands today.",
    },

    steps: [
      {
        title: "Have a conversation with Wundy\u2122",
        detail:
          "Wundy\u2122 will guide you through a 30\u201340 minute conversation covering positioning, messaging, visibility, credibility, and conversion. Answer naturally and upload materials when prompted. Everything you share feeds directly into your results and your Strategy Activation Session.",
      },
      {
        title: "Get your results instantly",
        detail:
          "Your WunderBrand Blueprint+\u2122 results are generated the moment the conversation is complete \u2014 including your WunderBrand Score\u2122, deep-dive analysis across all five brand pillars, advanced audience segmentation, a Messaging Matrix, Campaign Architecture, AI Answer Engine (AEO) strategy, and your Advanced Prompt Library.",
      },
      {
        title: "Book your Strategy Activation Session",
        detail:
          "Your complimentary 30-minute session with our team turns your diagnostic into a prioritized action plan. We\u2019ll walk through your results together, identify your highest-impact opportunities, and map your next strategic moves. We recommend booking within 30 days of completing your diagnostic.",
      },
    ],

    noRush: {
      body: NO_RUSH_SHARED,
      extra:
        "Your Strategy Activation Session is available for 30 days from the date your results are generated. We recommend completing your diagnostic soon so you have the full window to book your session.",
    },

    primaryCta: "Start Your WunderBrand Blueprint+\u2122 \u2192",
    secondaryCta: "I\u2019ll come back later \u2014 take me to my dashboard",
    reassurance: (email: string) =>
      `We\u2019ve sent a confirmation email to ${email} with everything you need. Your WunderBrand Blueprint+\u2122 will be waiting whenever you\u2019re ready.`,
  },
};
