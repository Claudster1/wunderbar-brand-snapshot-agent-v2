/**
 * Consumer Activation developed packs — plain language for local / B2C businesses.
 */
import type { ActivationDevelopedContext } from "@/lib/activation/activationDevelopedPlansCopy";
import type { ConsumerVerticalId } from "@/lib/intake/consumerVertical";

function voiceBits(ctx: ActivationDevelopedContext) {
  const who = ctx.voice?.who ?? "customers";
  const cta = ctx.voice?.primaryCta ?? "Get in touch";
  const channels = ctx.voice?.channelsLine ?? "the channels your customers already use";
  const proof = ctx.voice?.proofLine ?? "reviews and clear proof";
  return { who, cta, channels, proof, cn: ctx.companyName, ind: ctx.industry.toLowerCase() };
}

export function buildConsumerJourneyPlan(ctx: ActivationDevelopedContext): string {
  const { who, cta, cn, proof } = voiceBits(ctx);
  return [
    "## Customer journey (touch-by-touch)",
    "",
    `Follow how **${who}** actually find and choose **${cn}** — then make each step easier.`,
    "",
    "### Discover",
    `- **Where:** Google/Maps, Instagram, referrals, or a friend mentioning you.`,
    `- **Job:** Be easy to recognize and easy to trust (${proof}).`,
    `- **Next step:** Profile/site that clearly says who you help and how to **${cta.toLowerCase()}**.`,
    "",
    "### Consider",
    `- **What they do:** Read reviews, look at real work/photos, check hours or pricing style.`,
    `- **Job:** Answer the questions they would ask in person — no jargon.`,
    `- **Next step:** One clear invitation to **${cta.toLowerCase()}**.`,
    "",
    "### Decide / book",
    `- **What they need:** A simple path — online booking, call, text, or reservation.`,
    `- **Job:** Confirm time, what to expect, and how to reach you if plans change.`,
    `- **CTA:** ${cta}`,
    "",
    "### After the visit",
    `- **Job:** Thank them, invite a Google review when it feels natural, make rebooking/return easy.`,
    `- **CTA:** Soft follow-up — not a hard pitch every time.`,
  ].join("\n");
}

export function buildConsumerCompetitivePlan(ctx: ActivationDevelopedContext): string {
  const { who, cta, cn, ind } = voiceBits(ctx);
  return [
    "## Standing out locally",
    "",
    `### How ${who} choose in ${ind}`,
    `- They compare reviews, response time, how clear you are, and whether you feel like a fit.`,
    `- **Your edge:** Write the 2–3 things ${cn} does differently in everyday words (not “best in class”).`,
    "",
    "### When someone mentions a competitor",
    `- **Acknowledge** what they liked elsewhere.`,
    `- **Clarify** what you do differently (process, care, specialty, neighborhood focus).`,
    `- **Invite** a next step: **${cta}** — let them decide.`,
    "",
    "### Simple comparison notes (for your team)",
    `- Keep a short internal list: what you won’t compete on (e.g. being the cheapest) and what you will (reliability, craft, hospitality).`,
    `- Share real examples and reviews — not digs at other businesses.`,
  ].join("\n");
}

export function buildConsumerLeadMagnetPlan(ctx: ActivationDevelopedContext): string {
  const { who, cta, cn, proof } = voiceBits(ctx);
  const magnet = consumerMagnetIdea(ctx.voice?.vertical ?? null, cn, who);
  return [
    "## Free helpful offer (optional)",
    "",
    "Only use this if it helps **before** someone is ready to buy — keep it useful and short.",
    "",
    `### Offer idea`,
    `- **${magnet.title}**`,
    `- **Why it helps ${who}:** ${magnet.why}`,
    `- **Where it lives:** Simple landing page or PDF + thank-you note.`,
    `- **Primary CTA after download:** ${cta}`,
    "",
    "### Follow-up (3 touches max)",
    `1. Deliver the offer + how to ${cta.toLowerCase()}.`,
    `2. One useful tip related to the offer.`,
    `3. Soft reminder with ${proof} — then stop chasing.`,
    "",
    "### Skip this if…",
    `- Your main path is already booking/reserving/calling and a “download” would slow people down.`,
  ].join("\n");
}

function consumerMagnetIdea(
  vertical: ConsumerVerticalId | null,
  cn: string,
  who: string,
): { title: string; why: string } {
  switch (vertical) {
    case "beauty_wellness":
      return {
        title: `“What to expect at your first visit” one-pager (${cn})`,
        why: "Reduces nerves and no-shows; answers common questions before they book.",
      };
    case "hospitality":
      return {
        title: "Private events / group dining FAQ",
        why: "Helps planners decide faster without a long back-and-forth.",
      };
    case "home_services":
      return {
        title: "Seasonal home checklist (edit to your trade)",
        why: "Useful before they need emergency service — builds trust early.",
      };
    case "health_clinic":
      return {
        title: "New patient visit checklist",
        why: "Sets expectations on paperwork, timing, and what to bring.",
      };
    case "fashion_retail":
    case "dtc_product":
      return {
        title: "Fit / sizing guide",
        why: "Cuts returns and hesitation for first-time shoppers.",
      };
    case "consumer_professional":
      return {
        title: "Questions to ask before you hire an advisor",
        why: `Helps serious ${who} prepare — and filters tire-kickers kindly.`,
      };
    default:
      return {
        title: `Short guide for ${who} considering ${cn}`,
        why: "Answers the top questions you get on calls — then invites the next step.",
      };
  }
}

export function buildConsumerPaidCreativesPack(ctx: ActivationDevelopedContext): string {
  const { who, cta, cn, proof } = voiceBits(ctx);
  return [
    "## Paid creative starters (Meta / Google)",
    "",
    "Write like a person, not an agency pitch. One promise per ad.",
    "",
    "### Ad A — introduction",
    `**Headline**  \n${cn} — for ${who} nearby`,
    "",
    `**Primary text**  \nSay what you do in one or two sentences. Invite them to **${cta.toLowerCase()}**.`,
    "",
    `**CTA**  \n${cta}`,
    "",
    "### Ad B — proof",
    `**Headline**  \nWhat ${who} say about us`,
    "",
    `**Primary text**  \nOne real review or result (${proof}). Then the same next step.`,
    "",
    `**CTA**  \n${cta}`,
    "",
    "### Ad C — ready now",
    `**Headline**  \nOpenings this week`,
    "",
    `**Primary text**  \nHow scheduling works and what happens after they reach out. One ask only.`,
    "",
    `**CTA**  \n${cta}`,
    "",
    "### Google search angles",
    `- Match the words people type (“near me,” your service, your neighborhood).`,
    `- Landing page H1 should match the ad line.`,
    `- Measure cost per completed ${cta.toLowerCase()}, not just clicks.`,
  ].join("\n");
}

export function buildConsumerThoughtLeadershipPack(ctx: ActivationDevelopedContext): string {
  const { who, cta, cn, proof, channels } = voiceBits(ctx);
  const posts = thoughtPosts(ctx.voice?.vertical ?? null, cn, who, cta, proof);
  return [
    "## Social posts you can actually publish",
    "",
    `Written for ${channels} — keep your own voice. No LinkedIn “POV for buyers” tone unless that’s truly your audience.`,
    "",
    posts,
    "",
    "### Cadence tip",
    `- A few honest posts beat a content calendar you won’t keep.`,
    `- Reply to comments and reviews when you can — that builds trust.`,
  ].join("\n");
}

function thoughtPosts(
  vertical: ConsumerVerticalId | null,
  cn: string,
  who: string,
  cta: string,
  proof: string,
): string {
  switch (vertical) {
    case "beauty_wellness":
      return [
        "### Post 1 — what to expect",
        `First time at ${cn}? We’ll confirm your time, talk through what you want, and go from there. Questions before you book are welcome.`,
        "",
        `CTA: ${cta}`,
        "",
        "### Post 2 — real work",
        `Recent work (shared with permission). Every client is different — this is one example of how we approached it.`,
        "",
        `CTA: ${cta}`,
        "",
        "### Post 3 — gratitude / reviews",
        `Grateful for kind words from clients. ${proof}. If we’ve taken care of you, a Google review helps the next person feel comfortable walking in.`,
        "",
        `CTA: ${cta}`,
      ].join("\n");
    case "hospitality":
      return [
        "### Post 1 — this week",
        `What’s on at ${cn} this week — specials, hours, or a plate we’re proud of.`,
        "",
        `CTA: ${cta}`,
        "",
        "### Post 2 — the room",
        `A look at the space / a favorite dish / the team. Phone photos are fine — keep it real.`,
        "",
        `CTA: ${cta}`,
        "",
        "### Post 3 — guests",
        `Thanks to everyone who visited recently. Tag us if you share a photo.`,
        "",
        `CTA: ${cta}`,
      ].join("\n");
    case "home_services":
      return [
        "### Post 1 — how we work",
        `Before we start, we walk the job with you and explain options in plain language.`,
        "",
        `CTA: ${cta}`,
        "",
        "### Post 2 — job photo",
        `Recent work (with permission). Here’s what we found and how we fixed it.`,
        "",
        `CTA: ${cta}`,
        "",
        "### Post 3 — neighborhood trust",
        `Local reviews are how most homeowners choose who to call. Grateful for the trust.`,
        "",
        `CTA: ${cta}`,
      ].join("\n");
    case "health_clinic":
      return [
        "### Post 1 — first visit",
        `New here? We’ll help with scheduling and paperwork, and explain next steps in everyday language.`,
        "",
        `CTA: ${cta}`,
        "",
        "### Post 2 — team / office",
        `A quick look at our team and office — so walking in feels a little more familiar.`,
        "",
        `CTA: ${cta}`,
        "",
        "### Post 3 — gentle reminder",
        `When you’re ready for a visit, schedule online or call the front desk.`,
        "",
        `CTA: ${cta}`,
      ].join("\n");
    default:
      return [
        "### Post 1 — useful",
        `Answer one question ${who} ask you all the time. Keep it short.`,
        "",
        `CTA: ${cta}`,
        "",
        "### Post 2 — proof",
        `Share a real review or photo (with permission). ${proof}.`,
        "",
        `CTA: ${cta}`,
        "",
        "### Post 3 — invitation",
        `Openings, hours, or how to take the next step with ${cn}.`,
        "",
        `CTA: ${cta}`,
      ].join("\n");
  }
}

export function buildConsumerPrPlan(ctx: ActivationDevelopedContext): string {
  const { who, cta, cn, ind, proof } = voiceBits(ctx);
  return [
    "## Local visibility & PR",
    "",
    "Think neighborhood and community — not national press releases (unless that’s truly your stage).",
    "",
    "### Story angles worth pitching",
    `- Owner/operator story: why ${cn} exists for ${who} in your area.`,
    `- Seasonal or community tie-in (edit to something true — charity night, local partnership, anniversary).`,
    `- Expertise in plain language: a tip ${who} in ${ind} actually need.`,
    "",
    "### Where to show up",
    `- Local newsletters, neighborhood blogs, chamber/community calendars, relevant podcasts.`,
    `- Google reviews and consistent NAP (name/address/phone) everywhere you list yourselves.`,
    "",
    "### Short quote you can adapt",
    `- “We want ${who} to feel sure before they walk in — clear expectations, real ${proof}, and a simple way to ${cta.toLowerCase()}.” — [Name], ${cn}`,
    "",
    "### After any feature",
    `- Share it on your primary social channel and add a link from your site.`,
    `- One thank-you note to the writer/partner — relationships compound.`,
  ].join("\n");
}

export function buildConsumerExecutionRoadmap(ctx: ActivationDevelopedContext): string {
  const { who, cta, cn, proof } = voiceBits(ctx);
  return [
    "## 90-day execution roadmap",
    "",
    `Practical steps for **${cn}** — optimize for more of the right ${who} completing **${cta.toLowerCase()}**.`,
    "",
    "### Days 1–30 — Foundations",
    `- Confirm Google Business profile, hours, photos, and primary CTA (**${cta}**) match reality.`,
    `- Align homepage/services copy with how you talk on the phone.`,
    `- Ask 5–10 happy ${who} for a Google review.`,
    "",
    "### Days 31–60 — Proof & rhythm",
    `- Post steadily on your primary channel (education + proof + invitation).`,
    `- Fix the biggest friction in booking/contact (forms, response time, unclear next step).`,
    `- Light boost only on posts that already got engagement or inquiries.`,
    "",
    "### Days 61–90 — Tighten",
    `- Drop channels/posts you won’t sustain.`,
    `- Double down on what drove ${cta.toLowerCase()} or quality conversations.`,
    `- Document a simple monthly checklist your team can repeat.`,
    "",
    "### Weekly ritual (keep it light)",
    `- 15 minutes: what shipped, what ${who} asked, one fix.`,
    `- Check reviews and reply when you can.`,
    "",
    "### Success looks like",
    `- Clearer path to ${cta.toLowerCase()}.`,
    `- Stronger ${proof}.`,
    `- Less guesswork for whoever runs marketing week to week.`,
  ].join("\n");
}
