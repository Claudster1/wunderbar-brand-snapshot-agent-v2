/**
 * Dev / preview QA seeds — jump near the end of Snapshot intake without clicking through
 * every question. Disabled on production hosts unless NEXT_PUBLIC_ALLOW_QA_SEED=1.
 */

export type QaSeedId = "near-end" | "handoff";

type SeedTurn = { role: "assistant" | "user"; text: string };

/** Client-safe gate: localhost, Vercel previews, or explicit public flag. */
export function isQaSeedAllowed(hostname?: string): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_QA_SEED === "1") return true;
  const host =
    hostname ??
    (typeof window !== "undefined" ? window.location.hostname : "");
  if (!host) return process.env.NODE_ENV !== "production";
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (host.endsWith(".vercel.app")) return true;
  if (host === "app.wunderbrand.ai" || host.endsWith(".wunderbrand.ai")) return false;
  return process.env.NODE_ENV !== "production";
}

export function parseQaSeedParam(raw: string | null | undefined): QaSeedId | null {
  const v = String(raw || "")
    .trim()
    .toLowerCase();
  if (v === "near-end" || v === "near_end" || v === "nearend") return "near-end";
  if (v === "handoff" || v === "wrap-up" || v === "wrapup") return "handoff";
  return null;
}

/**
 * Near-complete Snapshot thread. Last assistant turn is the previous-brand-work question
 * so you can answer once and exercise wrap-up / finalize.
 */
const NEAR_END_TURNS: SeedTurn[] = [
  {
    role: "assistant",
    text: "Hi — I'm Wundy™. What's your first name?",
  },
  { role: "user", text: "Claudine" },
  {
    role: "assistant",
    text: "Nice to meet you, Claudine. **What's the name of your business?**",
  },
  { role: "user", text: "Wunderbar Digital" },
  {
    role: "assistant",
    text: "**How do you primarily get paid today** — mostly services/consulting, a physical or digital product, SaaS/subscription, retail, or something else?",
  },
  { role: "user", text: "Services / consulting" },
  {
    role: "assistant",
    text: "**How do you think about your role here?** Tap below — or type your own.",
  },
  { role: "user", text: "I'm a founder / co-founder" },
  {
    role: "assistant",
    text: "**Who do you mainly sell to** — mostly other businesses (B2B), mostly consumers (B2C), or a meaningful mix of both?",
  },
  { role: "user", text: "Mostly B2B" },
  {
    role: "assistant",
    text: "**What industry or space is the business in?** A plain category is perfect.",
  },
  { role: "user", text: "Professional services / consulting — brand and marketing for SMBs" },
  {
    role: "assistant",
    text: "**Where do you mainly serve customers** — locally, regionally, nationally, or globally?",
  },
  { role: "user", text: "Nationally" },
  {
    role: "assistant",
    text: "**Roughly how long have you been operating?**",
  },
  { role: "user", text: "Less than 1 year" },
  {
    role: "assistant",
    text: "**Do you have a website URL to share today** — even a simple landing page or store link?",
  },
  { role: "user", text: "https://wunderbardigital.com" },
  {
    role: "assistant",
    text: "**Where does your brand show up on social today?** Name the platforms that matter (or say none / not really active yet).",
  },
  { role: "user", text: "LinkedIn, Instagram — just launching, not very active yet" },
  {
    role: "assistant",
    text: "**When a brand-new prospect first discovers you, where does that usually happen?**",
  },
  { role: "user", text: "Referrals / word of mouth" },
  {
    role: "assistant",
    text: "**When prospects choose a competitor over you, what reason comes up most often?**",
  },
  { role: "user", text: "Trust" },
  {
    role: "assistant",
    text: "**How clear is your offer to someone encountering you for the first time?**",
  },
  { role: "user", text: "Somewhat clear" },
  {
    role: "assistant",
    text: "**What customer proof do you have today?** Tap all that apply — testimonials/reviews, case studies, or neither yet.",
  },
  { role: "user", text: "Neither yet" },
  {
    role: "assistant",
    text: "**How confident do you feel about how the brand looks visually?**",
  },
  { role: "user", text: "Somewhat confident" },
  {
    role: "assistant",
    text: "Which outcomes matter most for Wunderbar Digital in the next 6–12 months? Tap all that apply below.",
  },
  { role: "user", text: "Launch or establish the brand properly" },
  {
    role: "assistant",
    text: "What feels like the biggest challenge with your brand or marketing right now?",
  },
  {
    role: "user",
    text: "Getting consistent visibility without sounding generic — and proving credibility while we're still early.",
  },
  {
    role: "assistant",
    text: "What makes you different from look-alike competitors?",
  },
  {
    role: "user",
    text: "Fortune-500 quality brand systems packaged for SMBs, with AI-assisted speed.",
  },
  {
    role: "assistant",
    text: "What's the deeper why behind the business — the mission that keeps you going?",
  },
  {
    role: "user",
    text: "After almost 30 years in marketing I want SMBs to look and sound as polished as big brands without the agency bloat.",
  },
  {
    role: "assistant",
    text: "**How clear and consistent does your messaging feel across channels today?**",
  },
  { role: "user", text: "Somewhat clear" },
  {
    role: "assistant",
    text: "If your brand were a person, how would you describe their personality?",
  },
  { role: "user", text: "Sharp and credible, approachable, no jargon" },
  {
    role: "assistant",
    text: "What topics or themes do you talk about most with customers?",
  },
  {
    role: "user",
    text: "Brand foundations, messaging clarity, and practical go-to-market systems.",
  },
  {
    role: "assistant",
    text: "**Are you doing any thought leadership publicly yet** — blog, speaking, LinkedIn POV, or similar?",
  },
  { role: "user", text: "A little / informal" },
  {
    role: "assistant",
    text: "One last thing — have you done any formal brand strategy work before? Could be on your own, with a freelancer, or through an agency.",
  },
];

/** Same as near-end, plus the final answer — next model turn should hand off / finalize. */
const HANDOFF_TURNS: SeedTurn[] = [
  ...NEAR_END_TURNS,
  {
    role: "user",
    text: "I'm the marketing/branding expert and have created everything on my own",
  },
];

export function getQaSeedTurns(seed: QaSeedId): SeedTurn[] {
  switch (seed) {
    case "near-end":
      return NEAR_END_TURNS.map((t) => ({ ...t }));
    case "handoff":
      return HANDOFF_TURNS.map((t) => ({ ...t }));
    default:
      return [];
  }
}

export function listQaSeedIds(): QaSeedId[] {
  return ["near-end", "handoff"];
}
