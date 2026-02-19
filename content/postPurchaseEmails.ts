// content/postPurchaseEmails.ts
// Post-purchase confirmation email copy — tier-specific
// Used by ActiveCampaign templates via custom field interpolation.

export type EmailTier = "snapshot_plus" | "blueprint" | "blueprint_plus";

export interface PostPurchaseEmail {
  subject: string;
  opening: string;
  checklistIntro: string;
  checklistItems: string[];
  uploadNote: string | null;
  howItWorks: string;
  sessionNote: string | null;
  buttonLabel: string;
  closing: string;
}

export const POST_PURCHASE_EMAILS: Record<EmailTier, PostPurchaseEmail> = {
  snapshot_plus: {
    subject:
      "Your WunderBrand Snapshot+\u2122 is ready \u2014 here\u2019s what\u2019s waiting for you",
    opening:
      "You\u2019re about to have the clearest picture of your brand you\u2019ve ever had. Here\u2019s how to get started.",
    checklistIntro:
      "Before you begin, it helps to have these handy \u2014 but you may not have all of them, or any of them, and that\u2019s completely fine. Wundy\u2122 works with whatever you bring.",
    checklistItems: [
      "Your website URL",
      "Your social media handles",
      "2\u20133 competitor names in your space",
      "Your current customers \u2014 and who you\u2019d love to attract",
      "Your goals for the next 6\u201312 months",
    ],
    uploadNote: null,
    howItWorks:
      "Wundy\u2122 will guide you through a 20\u201325 minute conversation about your business, audience, and brand presence. Answer naturally \u2014 there are no wrong answers, and no prep required. Your WunderBrand Snapshot+\u2122 results are generated instantly when the conversation is complete, including your WunderBrand Score\u2122, pillar-by-pillar analysis, and a Foundational Prompt Pack you can put to work in any AI tool right away.",
    sessionNote: null,
    buttonLabel: "Start Your WunderBrand Snapshot+\u2122 \u2192",
    closing:
      "Not ready yet? No rush. Your progress saves automatically, and you can pause and come back anytime.",
  },

  blueprint: {
    subject:
      "Your brand strategy starts now \u2014 here\u2019s how to begin",
    opening:
      "Your complete brand strategy starts with a single conversation. Here\u2019s what to expect \u2014 and how to get the most out of it.",
    checklistIntro:
      "You may not have all of this \u2014 or any of it \u2014 and that\u2019s completely fine. Wundy\u2122 meets you where you are. Any materials you can share will directly sharpen your results.",
    checklistItems: [
      "Your website URL",
      "Your social media handles",
      "2\u20133 competitor names in your space",
      "Your current customers \u2014 and who you\u2019d love to attract",
      "Your goals for the next 6\u201312 months",
      "Current brand guidelines or style guide (if you have one)",
      "Logo files",
      "A sample of current marketing material \u2014 a brochure, one-pager, or PDF",
    ],
    uploadNote:
      "You can upload up to 3 files during the conversation \u2014 images and PDFs accepted, up to 20 MB each. Nothing is required to get started.",
    howItWorks:
      "Wundy\u2122 will guide you through a 25\u201330 minute conversation about your business, audience, positioning, and how your brand shows up across channels. Answer naturally and upload materials when prompted. Your WunderBrand Blueprint\u2122 results \u2014 including your WunderBrand Score\u2122, complete brand strategy, and Interactive Brand Workbook \u2014 are generated instantly when the conversation is complete.",
    sessionNote: null,
    buttonLabel: "Start Your WunderBrand Blueprint\u2122 \u2192",
    closing:
      "Not ready yet? No rush. Your progress saves automatically, and you can pause and come back anytime.",
  },

  blueprint_plus: {
    subject:
      "You\u2019re all set \u2014 your WunderBrand Blueprint+\u2122 is ready to start",
    opening:
      "You\u2019ve made a significant investment in your brand. Here\u2019s everything that\u2019s waiting for you \u2014 and how to make the most of it.",
    checklistIntro:
      "You may not have all of this \u2014 or any of it \u2014 and that\u2019s completely fine. Wundy\u2122 will build you a strong diagnostic regardless. Any materials you can upload become part of what Wundy\u2122 analyzes \u2014 the more context you bring, the more precisely your results will reflect where your brand actually stands today.",
    checklistItems: [
      "Your website URL",
      "Your social media handles",
      "2\u20133 competitor names in your space",
      "Your current customers \u2014 and who you\u2019d love to attract",
      "Your goals for the next 6\u201312 months",
      "Current brand guidelines or style guide (if you have one)",
      "Logo files",
      "A sample of current marketing material \u2014 a brochure, one-pager, or PDF",
      "Pitch deck or sales presentation",
      "Email templates or newsletter samples",
      "Case studies or testimonials documents",
      "Any previous brand audit or strategy work",
    ],
    uploadNote:
      "You can upload up to 10 files during the conversation \u2014 images, PDFs, presentations (PPTX), and documents (DOCX) accepted, up to 20 MB each. Nothing is required to get started, but the more Wundy\u2122 can see, the more your Blueprint+\u2122 will reflect where your brand actually stands today.",
    howItWorks:
      "Wundy\u2122 will guide you through a 30\u201340 minute conversation about your brand \u2014 covering positioning, messaging, visibility, credibility, and conversion. Answer naturally and upload materials when prompted. Everything you share feeds directly into your results and your Strategy Activation Session. Your WunderBrand Blueprint+\u2122 results are generated instantly when the conversation is complete.",
    sessionNote:
      "Your complimentary Strategy Activation Session is available for 30 days from the date your results are generated. We recommend completing your diagnostic soon so you have the full window to book your session.",
    buttonLabel: "Start Your WunderBrand Blueprint+\u2122 \u2192",
    closing:
      "Not ready yet? No rush. Your progress saves automatically, and you can pause and come back anytime.",
  },
};

/**
 * Render a plain-text version of the email for AC or transactional use.
 * Interpolates firstName, startLink, and dashboardLink.
 */
export function renderEmailPlainText(
  tier: EmailTier,
  params: { firstName: string; startLink: string; dashboardLink: string }
): string {
  const e = POST_PURCHASE_EMAILS[tier];
  const lines: string[] = [
    `Hi ${params.firstName},`,
    "",
    e.opening,
    "",
    "What to have nearby:",
    "",
    e.checklistIntro,
    "",
    ...e.checklistItems.map((item) => `- ${item}`),
  ];

  if (e.uploadNote) {
    lines.push("", e.uploadNote);
  }

  lines.push(
    "",
    "How it works:",
    "",
    e.howItWorks
  );

  if (e.sessionNote) {
    lines.push("", e.sessionNote);
  }

  lines.push(
    "",
    `Start now: ${params.startLink}`,
    "",
    e.closing,
    "",
    `Access your diagnostic from your dashboard: ${params.dashboardLink}`,
    "",
    "\u2014 The Wunderbar Digital Team"
  );

  return lines.join("\n");
}
