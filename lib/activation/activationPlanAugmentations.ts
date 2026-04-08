import { extractActivationDerivatives } from "@/lib/activation/activationPlanModel";

export function buildActivationGuidanceMaps(diagnosticData: Record<string, unknown>): Record<
  string,
  { title: string; doText: string; dontText: string; example: string }
> {
  const {
    companyName,
    industry,
    primaryPillar,
    firstPriority,
    secondPriority,
    thirdPriority,
    audienceShort,
  } = extractActivationDerivatives(diagnosticData);

  return {
    "audience-segments": {
      title: "Audience targeting quality",
      doText: "Group people by what they do (visits, clicks, replies) and give each group one clear goal.",
      dontText: "Send the same message to everyone, no matter how ready they are to buy.",
      example: `People who match ${audienceShort} get proof-focused follow-up. People who visit pricing twice get a clear offer and next step.`,
    },
    "journey-orchestration": {
      title: "Lifecycle flow",
      doText: "Line up touches from first touch to purchase, with clear rules for when sales steps in.",
      dontText: "Use each channel on its own with no nod to what came before.",
      example: `Example touch order: social point of view, then email proof, then a landing page, then sales when someone shows strong intent.`,
    },
    "competitive-motion-plan": {
      title: "Competitive response plan",
      doText: "Write short answers and proof points in advance for when competitors come up.",
      dontText: "Wait until a live call to figure out what to say.",
      example: `When a competitor is named, send a proof asset that shows how ${companyName} delivers on the promise.`,
    },
    "email-lifecycle": {
      title: "Email clarity",
      doText: "Give each email one job and one clear next step.",
      dontText: "Send long newsletters that mix many goals and hide the next step.",
      example: `Email 1: insight. Email 2: proof. Email 3: next step tied to ${firstPriority.toLowerCase()}.`,
    },
    "seo-aeo": {
      title: "Search strategy",
      doText: "Build pages that answer real questions with proof and a clear next step.",
      dontText: "Post lots of general articles with no path to sign up or contact you.",
      example: `Answer top ${industry.toLowerCase()} questions buyers ask, with proof blocks and a single next step on each page.`,
    },
    "paid-ads": {
      title: "Paid conversion mechanics",
      doText: "Test a few messages and send winners to landing pages that match the ad.",
      dontText: "Spend more because clicks went up, without checking lead quality.",
      example: `Try three angles around ${primaryPillar.toLowerCase()}. Keep the one that brings better leads, not just more clicks.`,
    },
    "thought-leadership": {
      title: "Authority building",
      doText: "Publish on a steady schedule with your point of view and practical steps.",
      dontText: `Chase trends with no clear take from ${companyName} or no next step.`,
      example: `${companyName} shares weekly ideas tied to ${firstPriority.toLowerCase()} and ends each piece with one next step.`,
    },
    "pr-plan": {
      title: "Visibility leverage",
      doText: "Pitch stories that tie to real outcomes your buyers care about.",
      dontText: "Lead with vanity announcements that do not show why you are different.",
      example: `Each quarter, pitch a story that links progress to buyer pain and a sensible next step for readers.`,
    },
    "execution-roadmap": {
      title: "Execution governance",
      doText: "Give every item an owner, due date, what it depends on, and how you will know it worked.",
      dontText: "Track tasks with no owner and no clear link to results.",
      example: `Weekly check: Phase 1 (${firstPriority}), then Phase 2 (${secondPriority}), then Phase 3 (${thirdPriority}).`,
    },
  };
}

export function buildExpandedActivationContent(): Record<
  string,
  { why: string; actions: string[]; kpi: string; warning: string }
> {
  return {
    "audience-segments": {
      why: "When you match message strength to how ready someone is, you get better leads for the same effort.",
      actions: [
        "Name your top two best-fit segments and what event should start outreach.",
        "Match offer and next step to segment and stage.",
        "Send each segment into its own follow-up path.",
      ],
      kpi: "More qualified leads per segment, month over month.",
      warning: "One broad list fills the pipeline with poor-fit contacts.",
    },
    "journey-orchestration": {
      why: "When touches build on each other, people move forward instead of feeling spammed.",
      actions: [
        "Write a simple path: learn → compare → decide, with touch order.",
        "Set clear rules for when marketing hands off to sales.",
        "Track simple signals that show someone moved to the next step.",
      ],
      kpi: "More people move from “compare” to “decide” without stalling.",
      warning: "Random touches feel disconnected and slow deals down.",
    },
    "competitive-motion-plan": {
      why: "Ready answers help you win when buyers are weighing other options.",
      actions: [
        "Write short replies for your top alternatives.",
        "Pair each worry with proof or a case example.",
        "Put comparison proof on high-intent pages.",
      ],
      kpi: "You win more often when a competitor is named.",
      warning: "If you freeze when competitors come up, buyers lose confidence late in the process.",
    },
    "email-lifecycle": {
      why: "A steady sequence turns mild interest into a clear yes with proof in the right order.",
      actions: [
        "Plan four beats: welcome, follow-up, conversion, re-engagement.",
        "One main next step per email.",
        "Change copy by segment and stage.",
      ],
      kpi: "More replies and booked calls from follow-up flows.",
      warning: "Mixed goals in one send weakens trust and clicks.",
    },
    "seo-aeo": {
      why: "Search brings in people who are already looking; that compounds over time.",
      actions: [
        "Match top buyer questions to your main pages.",
        "Use short, scannable answers with proof.",
        "Give each page one clear path to contact or sign up.",
      ],
      kpi: "More qualified visits and sign-ups from intent pages.",
      warning: "Lots of posts with no buyer intent brings traffic but not revenue.",
    },
    "paid-ads": {
      why: "Paid ads speed up tests; you scale only after message and page work together.",
      actions: [
        "Test two or three angles per segment.",
        "Match the landing page to what the ad promises.",
        "Raise spend when qualified leads improve, not only when clicks do.",
      ],
      kpi: "Lower cost per strong opportunity, not just lower cost per click.",
      warning: "Scaling on clicks alone can burn budget fast.",
    },
    "thought-leadership": {
      why: "Steady, useful content builds trust before you ask for the sale.",
      actions: [
        "Publish on a schedule tied to your top priorities.",
        "Use examples and simple how-to, not jargon.",
        "End each piece with one practical next step.",
      ],
      kpi: "More inbound leads and sales help from content.",
      warning: "Generic hot takes do not set you apart.",
    },
    "pr-plan": {
      why: "PR works best when the story ties to outcomes your market already cares about.",
      actions: [
        "Pick quarterly story hooks tied to real business results.",
        "Pitch outlets your buyers already read.",
        "Turn coverage into follow-up and sales assets.",
      ],
      kpi: "More visits and trust from earned coverage.",
      warning: "Vanity placements that skip your strategy add little pipeline value.",
    },
    "execution-roadmap": {
      why: "Owners and weekly reviews turn plans into shipped work and visible results.",
      actions: [
        "Give each initiative an owner, due date, and what it depends on.",
        "Meet weekly to clear blockers.",
        "Check that each milestone actually moved a number you care about.",
      ],
      kpi: "Milestones finish on time and key metrics improve within 90 days.",
      warning: "Without ownership and check-ins, work stalls and piles up.",
    },
  };
}

export const DO_DONT_ACTIVATION: Record<string, { do: string[]; dont: string[] }> = {
  "audience-segments": {
    do: [
      "Start campaigns from what people do (clicks, visits), not how old the list is.",
      "Match how strong your offer is to how ready they are.",
      "Save different message and next-step versions for each segment.",
    ],
    dont: [
      "Don't use one follow-up sequence for every segment.",
      "Don't guess intent without seeing what they opened or clicked.",
      "Don't launch without proof that fits each segment.",
    ],
  },
  "journey-orchestration": {
    do: [
      "Give each step one goal before you add the next touch.",
      "Write clear rules for when sales should step in.",
      "Refer to earlier touches in later messages.",
    ],
    dont: [
      "Don't give two different next steps in the same step.",
      "Don't send leads to sales with no readiness signals.",
      "Don't skip follow-up between channels.",
    ],
  },
  "competitive-motion-plan": {
    do: [
      "Write short scripts for objections by competitor.",
      "Attach proof to each common objection.",
      "Update your notes from lost deals each month.",
    ],
    dont: [
      "Don't make up competitor claims on the spot.",
      "Don't repeat rumors you have not checked.",
      "Don't let paid creative or landing pages drift from your brand story.",
    ],
  },
  "email-lifecycle": {
    do: [
      "Keep emails short with one next step.",
      "Order: insight, then proof, then action.",
      "Test subject lines and next-step wording by segment.",
    ],
    dont: [
      "Don't send long mixed-topic newsletters in a nurture flow.",
      "Don't ask for three different actions in one email.",
      "Don't run a sequence with no stage logic.",
    ],
  },
  "seo-aeo": {
    do: [
      "Aim each page at one main buyer question cluster.",
      "Use short answers with proof.",
      "Give every article a clear next step.",
    ],
    dont: [
      "Don't publish lots of posts with no sign-up or contact path.",
      "Don't rely only on very early-stage topics.",
      "Don't ignore formats that search and AI answer boxes favor.",
    ],
  },
  "paid-ads": {
    do: [
      "Test messages tied to your pillar outcomes.",
      "Send each ad to a landing page that matches.",
      "Scale only when qualified leads improve.",
    ],
    dont: [
      "Don't scale on click rate alone.",
      "Don't mix segments in one ad group without a reason.",
      "Don't send paid traffic to generic pages.",
    ],
  },
  "thought-leadership": {
    do: [
      "Publish recurring themes tied to your priorities.",
      "Use real examples and practical takeaways.",
      "End each piece with one clear next step.",
    ],
    dont: [
      "Don't chase trends with no point of view from your brand.",
      "Don't publish authority content with no path to engage.",
      "Don't drift away from your core positioning.",
    ],
  },
  "pr-plan": {
    do: [
      "Pitch stories tied to real business results.",
      "Turn placements into follow-up and sales content.",
      "Prioritize outlets where your best-fit buyers actually look.",
    ],
    dont: [
      "Don't pick placements for ego over relevance.",
      "Don't run PR off on its own from your campaign calendar.",
      "Don't put out announcements with no story about why it matters.",
    ],
  },
  "execution-roadmap": {
    do: [
      "Link every milestone to an owner and a success check.",
      "Hold short weekly standups on implementation.",
      "Log blockers and decisions in one place.",
    ],
    dont: [
      "Don't leave handoffs between teams unclear.",
      "Don't mark work done when results have not moved.",
      "Don't drop governance when priorities shift mid-cycle.",
    ],
  },
};
