/**
 * Paste-ready email lifecycle for operators who may not live in marketing jargon.
 * Tone: Wunderbar — friendly, approachable expert (clear help, never condescending).
 * Structure: send map → one card per email → simple send rhythm & checklist last.
 */
import { walkthroughSecondaryCta } from "@/lib/activation/formatAgnosticRecommendations";

export type EmailLifecycleDerivatives = {
  companyName: string;
  industry: string;
  primaryPillar: string;
  firstPriority: string;
  secondPriority: string;
  thirdPriority: string;
  audienceShort: string;
};

type StarterEmail = {
  day: string;
  /** Plain-English job of this email (not funnel jargon). */
  stage: string;
  subject: string;
  preheader: string;
  imagePrompt: string;
  bodyLines: string[];
  primaryCta: string;
  secondaryCta?: string;
  note?: string;
};

function emailCard(n: number, email: StarterEmail): string {
  const lines = [
    `### Email ${n} · ${email.day} · ${email.stage}`,
    "",
    email.note ? `_${email.note}_` : "",
    email.note ? "" : "",
    `- **Subject line:** ${email.subject}`,
    `- **Inbox preview:** ${email.preheader}`,
    `- **Image idea:** ${email.imagePrompt}`,
    `- **Email body:**`,
    ...email.bodyLines,
    `- **Main next step:** ${email.primaryCta}`,
    email.secondaryCta ? `- **Optional second step:** ${email.secondaryCta}` : "",
  ].filter((line, i, arr) => {
    if (line === "" && arr[i - 1] === "") return false;
    return true;
  });
  return lines.join("\n");
}

/** Keep priority phrases short enough for subjects/preheaders. */
function shortTopic(raw: string): string {
  const cleaned = raw.replace(/\s+/g, " ").trim().toLowerCase();
  if (!cleaned) return "your next priority";
  if (cleaned.length <= 48) return cleaned;
  const stop = new Set(["and", "the", "of", "to", "for", "a", "an", "on", "in", "with", "tied"]);
  const words = cleaned.split(" ").filter((w) => !stop.has(w));
  return words.slice(0, 5).join(" ") || "your next priority";
}

export function buildDevelopedEmailLifecyclePlan(d: EmailLifecycleDerivatives): string {
  const cn = d.companyName;
  const ind = d.industry.toLowerCase();
  const pillar = d.primaryPillar.toLowerCase();
  const p1 = d.firstPriority.toLowerCase();
  const p2 = d.secondPriority.toLowerCase();
  const p3 = d.thirdPriority.toLowerCase();
  const aud = d.audienceShort;

  const emails: StarterEmail[] = [
    {
      day: "Day 0",
      stage: "Getting noticed",
      subject: `Does your ad say one thing — and your website another?`,
      preheader: `A short note for ${aud} about keeping the story consistent.`,
      imagePrompt: `Side-by-side: messy analytics on the left, calm laptop with one clear headline for ${cn} on the right. Soft daylight, navy and sky blue accents, no stock handshakes.`,
      bodyLines: [
        `Hi {{first_name}},`,
        ``,
        `If you are ${aud}, you have probably cleaned up your ads before. Here is the pattern we see a lot in ${ind}: the ad promises one result, the website talks about something else, and the first email adds a third idea. People do not feel “more content.” They feel confused.`,
        ``,
        `${cn} helps you keep one clear story from the first click through ${p1}. This note is not a hard sell — it is a quick way to decide where your next dollar should go: the ad, the page, or the follow-up email.`,
        ``,
        `— {{sender_name}}`,
      ],
      primaryCta: "See the 3-slide sketch",
      secondaryCta: walkthroughSecondaryCta("audit"),
    },
    {
      day: "Day 2",
      stage: "Getting noticed",
      subject: `The kind of proof ${aud} usually ask for`,
      preheader: "One before-and-after example — short and honest.",
      imagePrompt: `Simple before/after table (blur names), one big number callout, ${cn} brand colors, lots of white space.`,
      bodyLines: [
        `Hi {{first_name}},`,
        ``,
        `Thanks for opening the sketch. Here is the “after” view we share with teams like yours: same budget window, one number you both agree on, and the first three places we make match — usually the homepage hero, the first follow-up email, and the first slide in a sales deck.`,
        ``,
        `If that is how you want to handle ${p2} this quarter, the next email shows the flow on one screen — still with one clear next step.`,
        ``,
        `— {{sender_name}}`,
      ],
      primaryCta: "See the one-screen flow",
      secondaryCta: "Forward this to a teammate",
    },
    {
      day: "Day 5",
      stage: "Looking closer",
      subject: "Who owns what in the first two weeks?",
      preheader: "A simple plan so work does not stall between teams.",
      imagePrompt: `Simple three-column “who owns what” chart on white. Navy text, one sky-blue highlight on the owner column. Small ${cn} footer only.`,
      bodyLines: [
        `Hi {{first_name}},`,
        ``,
        `You already know we care about a matching story across ads, pages, and email. The next question people ask — especially in ${ind} — is whether the work will get stuck between marketing, sales, and delivery.`,
        ``,
        `Here is how we run the first 14 days: named owners, a short weekly checklist, and one shared number so nobody argues about definitions mid-project.`,
        ``,
        `If your team already works this way, it will feel familiar. If not, this is often the fastest win.`,
        ``,
        `— {{sender_name}}`,
      ],
      primaryCta: "Download the 14-day owner map (PDF)",
      secondaryCta: "Book a 20-minute fit call",
    },
    {
      day: "Day 8",
      stage: "Looking closer",
      subject: "What changed in 12 weeks (with honest caveats)",
      preheader: "Real numbers, real timeframe, no fluff.",
      imagePrompt:
        "One simple chart comparing conversations before and after. Footnote text easy to read. Brand colors only.",
      bodyLines: [
        `Hi {{first_name}},`,
        ``,
        `Here is the proof people ask for most: a 12-week window, conversations that came from real interest (not empty clicks), and the change that helped — usually a tighter ${pillar} story on the first three places buyers see you.`,
        ``,
        `Honest caveat: if most of your leads come from one channel, we adjust the plan. We do not force every channel to look the same.`,
        ``,
        `— {{sender_name}}`,
      ],
      primaryCta: "Open the one-page proof summary",
      secondaryCta: "Reply “numbers” for how we define the metric",
    },
    {
      day: "Day 12",
      stage: "Looking closer",
      subject: "How to compare partners without the RFP circus",
      preheader: `Five plain questions ${cn} uses — and you can use too.`,
      imagePrompt:
        "Checklist graphic with five criteria (clarity, proof, owners, timeline, risk). Simple icons, brand colors.",
      bodyLines: [
        `Hi {{first_name}},`,
        ``,
        `If you are comparing ${ind} partners this quarter, try these five checks: (1) Is the story the same everywhere? (2) Is proof easy to find on the first pages? (3) Are owners named for the first 14 days? (4) Do they say when they are not a fit? (5) Do you both agree on one number to move first?`,
        ``,
        `We put extra weight on ${p3}, because that is usually where progress stacks — and where mixed messages quietly waste budget.`,
        ``,
        `— {{sender_name}}`,
      ],
      primaryCta: "Save the comparison checklist",
      secondaryCta: "Share with finance or procurement",
    },
    {
      day: "Day 16",
      stage: "Ready to choose",
      subject: "What you get in the first 14 days (and what you do not)",
      preheader: "Clear deliverables, clear timeline, clear fit.",
      imagePrompt: `Three columns: Week 1–2 / 3–4 / 5+. Clean type, ${cn} header bar.`,
      bodyLines: [
        `Hi {{first_name}},`,
        ``,
        `Clear scope saves everyone later regret. In weeks 1–2 we lock the story and ship the first matching pages and emails. Weeks 3–4 add proof updates and short lines sales can reuse. Week 5+ grows what already moved the number you care about.`,
        ``,
        `We are not the right fit if you need brand-new demand overnight with zero story changes. Say that early — we will still leave you with a prioritized fix list.`,
        ``,
        `— {{sender_name}}`,
      ],
      primaryCta: "Book a 20-minute fit call",
      secondaryCta: "Reply “later” to pause for now",
    },
    {
      day: "Day 21",
      stage: "Ready to choose",
      subject: "One next step — when capacity is open",
      preheader: "Honest timing only. No fake countdown clocks.",
      imagePrompt: "Calm calendar with a few highlighted slots. Short overlay text (six words or fewer).",
      bodyLines: [
        `Hi {{first_name}},`,
        ``,
        `We keep new projects small so delivery matches what we promise. If ${p1} is still a priority this quarter, grab a short call this week. Same agenda: your goal, the first number that matters, and an honest fit check.`,
        ``,
        `If timing slips, reply with your preferred month and we will send one recap — no chase sequence.`,
        ``,
        `— {{sender_name}}`,
      ],
      primaryCta: "Pick a time — 20-minute fit call",
      secondaryCta: "Get the recap PDF instead",
    },
    {
      day: "Monthly",
      stage: "Stay in touch",
      subject: "What changed this month (one chart)",
      preheader: "A short win log — plus one upgrade only if it clearly helps.",
      imagePrompt: "One number tile with a small trend line. Brand colors. Optional product screenshot crop.",
      bodyLines: [
        `Hi {{first_name}},`,
        ``,
        `Quick monthly check-in: one chart on the number we share, one recommendation, and one optional add-on only if it clearly helps the goal you already set.`,
        ``,
        `— {{sender_name}}`,
      ],
      primaryCta: "Open this month’s update",
      note: "For active customers / subscribers only — keep this separate from the nurture emails above.",
    },
    {
      day: "45 days quiet",
      stage: "Welcome back",
      subject: "Still on your list? One idea — no guilt trip",
      preheader: `A short note on ${shortTopic(p2)} for ${aud}. Easy to ignore.`,
      imagePrompt:
        "One bold headline on a simple textured background. Soft shadow. Brand colors. No countdown clocks or “last chance” banners.",
      bodyLines: [
        `Hi {{first_name}},`,
        ``,
        `We noticed it has been quiet — totally fine. If ${shortTopic(p2)} for ${aud} is still on your list, here is one updated idea and a single next step. If not, ignore this or unsubscribe below. No chase sequence after this email.`,
        ``,
        `— {{sender_name}}`,
      ],
      primaryCta: "See the one idea",
      secondaryCta: "Unsubscribe with one click",
      note:
        "Automation rule: send once when someone has not opened or clicked for about 45 days after Email 7 (or your last nurture send). Keep this list separate from monthly customer emails. If they still do not engage, stop — do not keep nudging.",
    },
  ];

  const glanceTable = [
    "| EMAIL # | WHEN | JOB OF THIS EMAIL | SUBJECT |",
    "| --- | --- | --- | --- |",
    ...emails.map((e, i) => {
      const subjectClean = e.subject.replace(/\|/g, "/").replace(/\n/g, " ");
      return `| ${i + 1} | ${e.day} | ${e.stage} | ${subjectClean} |`;
    }),
  ].join("\n");

  return [
    "## Start here — your email sequence",
    "",
    "**Step 1 — Scan the send map** below so you know the order and timing.",
    "",
    "**Step 2 — Build each email** in your email tool (Mailchimp, Klaviyo, HubSpot, ActiveCampaign, etc.). Each card is **one email**. Replace `{{first_name}}` and `{{company}}` with your tool’s name fields. Swap sample numbers for your real results when you have them.",
    "",
    "**Step 3 — Finish setup** in “After you build the sequence” (send rhythm + quick check before you hit send).",
    "",
    "**Send map**",
    "",
    glanceTable,
    "",
    ...emails.map((e, i) => emailCard(i + 1, e)),
    "",
    "## After you build the sequence",
    "",
    "_Step 3 — setup tips for you. Not email bodies to paste._",
    "",
    "### A simple 12-week rhythm",
    "- Weeks 1–4: up to 2 emails per week (teach + show proof).",
    "- Weeks 5–8: 1–2 emails per week (deeper stories + a clearer offer).",
    "- Weeks 9–12: refresh weak subject lines; pause a series if opens stay very low after a few sends.",
    "",
    "### Quick check before you hit send",
    "- Each email has one job and one main next step near the top.",
    "- Subject line, inbox preview, and image all say the same thing.",
    "- Any number you share includes the timeframe and what it means.",
    "- Email 9 (“45 days quiet”) is a one-time win-back only — not part of the weekly rhythm.",
  ].join("\n");
}
