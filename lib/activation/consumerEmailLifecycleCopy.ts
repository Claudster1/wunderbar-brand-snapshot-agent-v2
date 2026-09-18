/**
 * Consumer-facing email lifecycle fallbacks — plain language owners would send,
 * not agency “scope fit / pipeline” copy.
 */
import type { ActivationAudienceVoice } from "@/lib/activation/activationAudienceVoice";
import type { EmailLifecycleDerivatives } from "@/lib/activation/emailLifecycleDevelopedCopy";

export function buildConsumerEmailLifecyclePlan(
  d: EmailLifecycleDerivatives,
  voice: ActivationAudienceVoice,
): string {
  const cn = d.companyName;
  const who = voice.who;
  const cta = voice.primaryCta;
  const proof = voice.proofLine;
  const channels = voice.channelsLine;

  const vertical = voice.vertical;
  const openers = consumerOpeners(vertical, cn, who);

  return [
    "## Starter email sequence (paste-ready)",
    "",
    `Written for **${who}** — keep subjects short, bodies conversational, and one clear next step. Use merge tags (\`{{first_name}}\`) in your ESP. Swap in real ${proof} when you have them.`,
    "",
    "## Email 1 — Welcome / first hello",
    `- **Subject line:** ${openers.e1Subject}`,
    `- **Preheader:** ${openers.e1Preheader}`,
    `- **Body (paste-ready):**`,
    `Hi {{first_name}},`,
    ``,
    openers.e1Body,
    ``,
    `— {{sender_name}}`,
    `- **Primary CTA:** ${cta}`,
    `- **Secondary CTA:** ${voice.secondaryCta}`,
    "",
    "## Email 2 — What to expect",
    `- **Subject line:** ${openers.e2Subject}`,
    `- **Preheader:** A quick look at how we work with ${who}.`,
    `- **Body (paste-ready):**`,
    `Hi {{first_name}},`,
    ``,
    openers.e2Body,
    ``,
    `— {{sender_name}}`,
    `- **Primary CTA:** ${cta}`,
    "",
    "## Email 3 — Social proof",
    `- **Subject line:** ${openers.e3Subject}`,
    `- **Preheader:** What ${who} say after working with us.`,
    `- **Body (paste-ready):**`,
    `Hi {{first_name}},`,
    ``,
    openers.e3Body,
    ``,
    `— {{sender_name}}`,
    `- **Primary CTA:** ${cta}`,
    `- **Secondary CTA:** Leave a Google review (if you’re a current client)`,
    "",
    "## Email 4 — Soft offer / seasonal",
    `- **Subject line:** ${openers.e4Subject}`,
    `- **Preheader:** One clear offer — no pressure.`,
    `- **Body (paste-ready):**`,
    `Hi {{first_name}},`,
    ``,
    openers.e4Body,
    ``,
    `— {{sender_name}}`,
    `- **Primary CTA:** ${cta}`,
    "",
    "## Email 5 — Reminder / stay in touch",
    `- **Subject line:** ${openers.e5Subject}`,
    `- **Preheader:** We’re here when you’re ready.`,
    `- **Body (paste-ready):**`,
    `Hi {{first_name}},`,
    ``,
    openers.e5Body,
    ``,
    `— {{sender_name}}`,
    `- **Primary CTA:** ${cta}`,
    `- **Secondary CTA:** Reply with a question — a real person reads these`,
    "",
    "### Channel note",
    `Lean on ${channels} for discovery; use email to stay useful after someone already knows you.`,
  ].join("\n");
}

function consumerOpeners(
  vertical: ActivationAudienceVoice["vertical"],
  cn: string,
  who: string,
): {
  e1Subject: string;
  e1Preheader: string;
  e1Body: string;
  e2Subject: string;
  e2Body: string;
  e3Subject: string;
  e3Body: string;
  e4Subject: string;
  e4Body: string;
  e5Subject: string;
  e5Body: string;
} {
  switch (vertical) {
    case "beauty_wellness":
      return {
        e1Subject: `Thanks for finding ${cn}`,
        e1Preheader: `A short note from the team — how to book when you’re ready.`,
        e1Body: `Thanks for reaching out to ${cn}. When you’re ready to come in, you can book an appointment online or reply here and we’ll help you find a time that works.\n\nIf you’re not sure which service you need, just tell us what you’re hoping for and we’ll point you in the right direction.`,
        e2Subject: `What a visit with us usually looks like`,
        e2Body: `A lot of first-time ${who} ask what to expect. We’ll confirm your appointment, ask a few questions about your goals, and take it from there — no rush, no upsell script.\n\nBring photos or notes if you have them. Questions ahead of time are always welcome.`,
        e3Subject: `A few words from people we’ve worked with`,
        e3Body: `We grow mostly through referrals and reviews. Here’s the kind of feedback we hear most often — and if you’ve already been in, a Google review helps the next person feel comfortable choosing us.\n\n(Paste 1–2 real short reviews here.)`,
        e4Subject: `Openings this week`,
        e4Body: `We have a few openings coming up. If you’ve been meaning to schedule, this is an easy week to do it — reply or book online and we’ll take care of the rest.`,
        e5Subject: `Still thinking it over? That’s fine`,
        e5Body: `No chase sequence — just a quiet reminder that we’re here when you want to book. If timing is off, reply and tell us when to check back.`,
      };
    case "hospitality":
      return {
        e1Subject: `Glad you found ${cn}`,
        e1Preheader: `Hours, reservations, and what’s on right now.`,
        e1Body: `Thanks for connecting with ${cn}. If you’d like a table, you can make a reservation online or call us — walk-ins are welcome when we have space.\n\nQuestions about the menu, dietary needs, or private events? Just reply.`,
        e2Subject: `A little about how we run service`,
        e2Body: `We keep things straightforward: good food, clear hours, and a warm room. If it’s your first visit, start with what’s seasonal or ask the team for a favorite — they’re happy to help.`,
        e3Subject: `What guests say after they visit`,
        e3Body: `Reviews and guest photos mean a lot to a neighborhood place. Here’s a taste of recent feedback — and if you’ve eaten with us, tagging us or leaving a Google review helps other ${who} find the door.\n\n(Paste 1–2 real short reviews here.)`,
        e4Subject: `This week at ${cn}`,
        e4Body: `A quick heads-up on what’s on this week (specials, hours changes, or events). If you want a table, go ahead and reserve — weekends fill up.`,
        e5Subject: `Come back when you’re hungry`,
        e5Body: `Whenever you’re ready for another meal with us, we’re here. Reply if you need a reservation for a group or a quiet night.`,
      };
    case "home_services":
      return {
        e1Subject: `Thanks for contacting ${cn}`,
        e1Preheader: `How to get an estimate or schedule service.`,
        e1Body: `Thanks for reaching out to ${cn}. Tell us what’s going on at the house (even a short description helps), and we’ll follow up about timing and an estimate.\n\nPrefer to talk? Call or text and we’ll take it from there.`,
        e2Subject: `How a service visit usually works`,
        e2Body: `Most ${who} want to know who shows up and what happens next. We’ll confirm the window, arrive in marked vehicles when we can, walk the job with you, and explain options in plain language before any work starts.`,
        e3Subject: `What neighbors say about working with us`,
        e3Body: `Local reviews are how most people choose a contractor. Here’s recent feedback — and if we’ve already been out, a Google review helps the next homeowner feel sure about calling.\n\n(Paste 1–2 real short reviews here.)`,
        e4Subject: `Seasonal reminder from ${cn}`,
        e4Body: `A short seasonal note (filters, tune-ups, weather-related checks — edit to match your trade). If you want us on the calendar, request an estimate and we’ll find a slot.`,
        e5Subject: `Need help later? Keep this note`,
        e5Body: `Save this email. When something comes up, reply or call — you don’t need to start from scratch explaining who you are.`,
      };
    case "health_clinic":
      return {
        e1Subject: `Welcome to ${cn}`,
        e1Preheader: `How to schedule when you’re ready.`,
        e1Body: `Thanks for connecting with ${cn}. When you’re ready, you can schedule an appointment online or call the front desk — we’ll help with new-patient paperwork and timing.\n\nIf you’re unsure which visit type you need, just ask.`,
        e2Subject: `What to expect at your first visit`,
        e2Body: `First visits can feel like a lot. We’ll confirm your appointment, ask about your history, and explain next steps in everyday language. Bring your ID/insurance card if relevant, and any questions you’ve been saving.`,
        e3Subject: `Notes from patients in our community`,
        e3Body: `People often choose us based on reviews and word of mouth. Here’s the kind of feedback we hear — and if you’re already a patient, a Google review helps families finding care nearby.\n\n(Paste 1–2 real short reviews here.)`,
        e4Subject: `Appointments available`,
        e4Body: `We have openings coming up. If you’ve been putting off a visit, this is a good week to schedule — online or by phone.`,
        e5Subject: `We’re here when you need us`,
        e5Body: `No pressure — just a reminder that you can schedule when the timing is right. Reply or call if you have a quick question for the front desk.`,
      };
    case "fashion_retail":
    case "dtc_product":
      return {
        e1Subject: `Welcome from ${cn}`,
        e1Preheader: `New here? Start with what’s in stock now.`,
        e1Body: `Thanks for joining ${cn}. Browse what’s new, check sizing/fit notes, and reach out if you need help choosing — we’re happy to answer.\n\nReady when you are: shop the site or stop by if we have a store.`,
        e2Subject: `How to shop with us (fit, shipping, returns)`,
        e2Body: `A quick orientation: how sizing works, what shipping looks like, and how returns/exchanges work. Edit this email to match your real policies so ${who} aren’t guessing.`,
        e3Subject: `What shoppers are saying`,
        e3Body: `Real reviews and photos from people who already bought help more than any slogan. Paste a few here — and invite UGC if you collect it.`,
        e4Subject: `Just in / worth a look`,
        e4Body: `A short note on new arrivals or a restock. One link, one ask — shop if it’s useful; ignore if not.`,
        e5Subject: `Still browsing?`,
        e5Body: `No hard sell — reply if you have a fit question, or shop whenever you’re ready.`,
      };
    case "consumer_professional":
      return {
        e1Subject: `Thanks for reaching out to ${cn}`,
        e1Preheader: `How to book a consult when you’re ready.`,
        e1Body: `Thanks for connecting with ${cn}. When you want to talk, book a consult or reply with a few times that work — we’ll keep the first conversation practical and jargon-light.\n\nIf you’re still gathering questions, that’s fine too.`,
        e2Subject: `What a first consult usually covers`,
        e2Body: `Most ${who} want clarity, not a pitch. We’ll listen to your situation, explain options in plain language, and outline sensible next steps — including if we’re not the right fit.`,
        e3Subject: `How people describe working with us`,
        e3Body: `Trust is personal in this work. Here’s the kind of feedback we hear (paste real notes). Credentials and process matter; so does feeling heard.`,
        e4Subject: `A useful read before we meet`,
        e4Body: `One short educational note on a topic your ${who} ask about often. No hard sell — just context so a consult goes further.`,
        e5Subject: `Ready when you are`,
        e5Body: `If timing wasn’t right before, you can still book a consult whenever it makes sense. Reply with questions anytime.`,
      };
    default:
      return {
        e1Subject: `Thanks for connecting with ${cn}`,
        e1Preheader: `A short hello — next steps when you’re ready.`,
        e1Body: `Thanks for reaching out to ${cn}. When you’re ready, get in touch — or reply here with a question and a real person will follow up.`,
        e2Subject: `How we usually work with ${who}`,
        e2Body: `Here’s a plain overview of what working with us looks like. Edit this to match your real process so people know what happens after they say yes.`,
        e3Subject: `What people say after working with us`,
        e3Body: `Paste 1–2 short, real reviews or notes from ${who}. Social proof beats polished claims.`,
        e4Subject: `A simple next step`,
        e4Body: `If you’ve been meaning to move forward, this is an easy week to do it. One clear ask — no pressure.`,
        e5Subject: `We’re here when you’re ready`,
        e5Body: `No chase sequence. Reply anytime, or take the next step when it fits your calendar.`,
      };
  }
}

