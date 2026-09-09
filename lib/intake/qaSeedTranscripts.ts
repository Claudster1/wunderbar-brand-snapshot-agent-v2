/**
 * Dev / preview QA seeds — jump near the end of Snapshot intake without clicking through
 * every question. Disabled on production hosts unless NEXT_PUBLIC_ALLOW_QA_SEED=1.
 */

export type QaSeedId =
  | "near-end"
  | "handoff"
  | "near-end-salon"
  | "near-end-restaurant"
  | "near-end-fashion"
  | "near-end-consumer-finance"
  | "handoff-salon"
  | "handoff-restaurant"
  | "handoff-fashion"
  | "handoff-consumer-finance";

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
  if (v === "near-end-salon" || v === "salon" || v === "near_end_salon") return "near-end-salon";
  if (v === "near-end-restaurant" || v === "restaurant" || v === "near_end_restaurant") {
    return "near-end-restaurant";
  }
  if (v === "near-end-fashion" || v === "fashion" || v === "near_end_fashion" || v === "boutique") {
    return "near-end-fashion";
  }
  if (
    v === "near-end-consumer-finance" ||
    v === "consumer-finance" ||
    v === "finance" ||
    v === "advisor" ||
    v === "near_end_consumer_finance"
  ) {
    return "near-end-consumer-finance";
  }
  if (v === "handoff-salon" || v === "salon-handoff") return "handoff-salon";
  if (v === "handoff-restaurant" || v === "restaurant-handoff") return "handoff-restaurant";
  if (v === "handoff-fashion" || v === "fashion-handoff") return "handoff-fashion";
  if (v === "handoff-consumer-finance" || v === "finance-handoff" || v === "advisor-handoff") {
    return "handoff-consumer-finance";
  }
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
    text: "**How do you primarily get paid today** — local/personal services, business consulting, a product (online or in-person), SaaS/subscription, or something else?",
  },
  { role: "user", text: "Business consulting / agency" },
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
    text: "**What industry or space is the business in?** A simple category is perfect.",
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
    text: "**Do you have a website?** If yes, **paste the URL in the message box below** (e.g. `yoursite.com` or `https://yoursite.com`) and send. If you don't have one yet, tap a chip.",
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

const NEAR_END_SALON_TURNS: SeedTurn[] = [
  { role: "assistant", text: "Hi — I'm Wundy™. What's your first name?" },
  { role: "user", text: "Maya" },
  {
    role: "assistant",
    text: "Nice to meet you, Maya. **What's the name of your business?**",
  },
  { role: "user", text: "Luna Hair Studio" },
  {
    role: "assistant",
    text: "**How do you primarily get paid today** — local/personal services, business consulting, a product (online or in-person), SaaS/subscription, or something else?",
  },
  { role: "user", text: "Local / personal services" },
  {
    role: "assistant",
    text: "**How do you think about your role here?** Tap below — or type your own.",
  },
  { role: "user", text: "I run the business day-to-day" },
  {
    role: "assistant",
    text: "**Who do you mainly sell to** — mostly other businesses (B2B), mostly consumers (B2C), or a meaningful mix of both?",
  },
  { role: "user", text: "Mostly B2C" },
  {
    role: "assistant",
    text: "**What kind of business is this?** Hair salon, restaurant, retail shop, wellness, home services — whatever fits.",
  },
  { role: "user", text: "Hair / beauty / spa" },
  {
    role: "assistant",
    text: "**Where do you mainly serve people** — your neighborhood or city, a wider region, nationally, or online everywhere?",
  },
  { role: "user", text: "Locally (city or metro)" },
  {
    role: "assistant",
    text: "**Roughly how long have you been operating?**",
  },
  { role: "user", text: "3–5 years" },
  {
    role: "assistant",
    text: "**Do you have a website?** If yes, **paste the URL in the message box below** (e.g. `yoursite.com` or `https://yoursite.com`) and send. If you don't have one yet, tap a chip.",
  },
  { role: "user", text: "https://lunahairstudio.example" },
  {
    role: "assistant",
    text: "**Where does your brand show up on social today?** Name the platforms that matter (Instagram, Google, TikTok, etc.) — or say *none / not really active yet*.",
  },
  { role: "user", text: "Instagram, Google Business / Maps" },
  {
    role: "assistant",
    text: "**When a brand-new client first discovers you, where does that usually happen?**",
  },
  { role: "user", text: "Instagram / Google" },
  {
    role: "assistant",
    text: "**When clients choose a competitor over you, what reason comes up most often?**",
  },
  { role: "user", text: "Price" },
  {
    role: "assistant",
    text: "**How clear are your services to someone encountering you for the first time?**",
  },
  { role: "user", text: "Somewhat clear" },
  {
    role: "assistant",
    text: "**What customer proof do you have today?** Tap all that apply — reviews, testimonials, before/after or success stories, or neither yet.",
  },
  { role: "user", text: "Reviews (Google / Yelp / etc.)" },
  {
    role: "assistant",
    text: "**How confident do you feel about how the brand looks visually?**",
  },
  { role: "user", text: "Somewhat confident" },
  {
    role: "assistant",
    text: "Which outcomes matter most for Luna Hair Studio in the next 6–12 months? Tap all that apply below.",
  },
  { role: "user", text: "More bookings / appointments" },
  {
    role: "assistant",
    text: "What feels like the biggest challenge with your brand or marketing right now?",
  },
  {
    role: "user",
    text: "Staying booked midweek without discounting — and looking as polished online as we feel in the chair.",
  },
  {
    role: "assistant",
    text: "What makes you different from look-alike competitors?",
  },
  {
    role: "user",
    text: "Personalized color consults and a calm studio vibe — not a high-volume chain feel.",
  },
  {
    role: "assistant",
    text: "What's the deeper why behind the business — the mission that keeps you going?",
  },
  {
    role: "user",
    text: "I want every client to leave feeling like themselves, just more confident.",
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
  { role: "user", text: "Warm, stylish, unfussy" },
  {
    role: "assistant",
    text: "What topics or themes do you talk about most with customers?",
  },
  {
    role: "user",
    text: "Hair health, low-maintenance color, and how to book the right service.",
  },
  {
    role: "assistant",
    text: "**Are you sharing tips, behind-the-scenes, or expertise publicly yet** — social posts, short videos, a blog, or not really?",
  },
  { role: "user", text: "A little / informal" },
  {
    role: "assistant",
    text: "One last thing — have you done any formal brand strategy work before? Could be on your own, with a freelancer, or through an agency.",
  },
];

const HANDOFF_SALON_TURNS: SeedTurn[] = [
  ...NEAR_END_SALON_TURNS,
  { role: "user", text: "Just DIY so far — logos and Instagram on my own" },
];

const NEAR_END_RESTAURANT_TURNS: SeedTurn[] = [
  { role: "assistant", text: "Hi — I'm Wundy™. What's your first name?" },
  { role: "user", text: "Jordan" },
  {
    role: "assistant",
    text: "Nice to meet you, Jordan. **What's the name of your business?**",
  },
  { role: "user", text: "Harbor Kitchen" },
  {
    role: "assistant",
    text: "**How do you primarily get paid today** — local/personal services, business consulting, a product (online or in-person), SaaS/subscription, or something else?",
  },
  { role: "user", text: "Retail or in-person" },
  {
    role: "assistant",
    text: "**How do you think about your role here?** Tap below — or type your own.",
  },
  { role: "user", text: "I'm a founder / co-founder" },
  {
    role: "assistant",
    text: "**Who do you mainly sell to** — mostly other businesses (B2B), mostly consumers (B2C), or a meaningful mix of both?",
  },
  { role: "user", text: "Mostly B2C" },
  {
    role: "assistant",
    text: "**What kind of business is this?** Hair salon, restaurant, retail shop, wellness, home services — whatever fits.",
  },
  { role: "user", text: "Restaurant / café / food" },
  {
    role: "assistant",
    text: "**Where do you mainly serve people** — your neighborhood or city, a wider region, nationally, or online everywhere?",
  },
  { role: "user", text: "Locally (city or metro)" },
  {
    role: "assistant",
    text: "**Roughly how long have you been operating?**",
  },
  { role: "user", text: "1–3 years" },
  {
    role: "assistant",
    text: "**Do you have a website?** If yes, **paste the URL in the message box below** (e.g. `yoursite.com` or `https://yoursite.com`) and send. If you don't have one yet, tap a chip.",
  },
  { role: "user", text: "https://harborkitchen.example" },
  {
    role: "assistant",
    text: "**Where does your brand show up on social today?** Name the platforms that matter (Instagram, Google, TikTok, etc.) — or say *none / not really active yet*.",
  },
  { role: "user", text: "Instagram, Google Business / Maps, Facebook" },
  {
    role: "assistant",
    text: "**When a brand-new guest first discovers you, where does that usually happen?**",
  },
  { role: "user", text: "Google / walk-by" },
  {
    role: "assistant",
    text: "**When guests choose a competitor over you, what reason comes up most often?**",
  },
  { role: "user", text: "Convenience / location" },
  {
    role: "assistant",
    text: "**How clear is your menu or experience to someone discovering you for the first time?**",
  },
  { role: "user", text: "Somewhat clear" },
  {
    role: "assistant",
    text: "**What customer proof do you have today?** Tap all that apply — reviews, testimonials, before/after or success stories, or neither yet.",
  },
  { role: "user", text: "Reviews (Google / Yelp / etc.)" },
  {
    role: "assistant",
    text: "**How confident do you feel about how the brand looks visually?**",
  },
  { role: "user", text: "Somewhat confident" },
  {
    role: "assistant",
    text: "Which outcomes matter most for Harbor Kitchen in the next 6–12 months? Tap all that apply below.",
  },
  { role: "user", text: "More guests / foot traffic" },
  {
    role: "assistant",
    text: "What feels like the biggest challenge with your brand or marketing right now?",
  },
  {
    role: "user",
    text: "Weeknight covers are soft — people know us for brunch but not dinner.",
  },
  {
    role: "assistant",
    text: "What makes you different from look-alike competitors?",
  },
  {
    role: "user",
    text: "Seasonal coastal menu and a patio that feels like a neighborhood living room.",
  },
  {
    role: "assistant",
    text: "What's the deeper why behind the business — the mission that keeps you going?",
  },
  {
    role: "user",
    text: "Feed people well and make the waterfront feel welcoming every night of the week.",
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
  { role: "user", text: "Relaxed, generous, a little coastal-cool" },
  {
    role: "assistant",
    text: "What topics or themes do you talk about most with customers?",
  },
  {
    role: "user",
    text: "Seasonal specials, patio nights, and what’s fresh from local suppliers.",
  },
  {
    role: "assistant",
    text: "**Are you sharing tips, behind-the-scenes, or expertise publicly yet** — social posts, short videos, a blog, or not really?",
  },
  { role: "user", text: "Yes — regularly on social" },
  {
    role: "assistant",
    text: "One last thing — have you done any formal brand strategy work before? Could be on your own, with a freelancer, or through an agency.",
  },
];

const HANDOFF_RESTAURANT_TURNS: SeedTurn[] = [
  ...NEAR_END_RESTAURANT_TURNS,
  { role: "user", text: "Worked with a freelancer on the logo and menu design once" },
];

const NEAR_END_FASHION_TURNS: SeedTurn[] = [
  { role: "assistant", text: "Hi — I'm Wundy™. What's your first name?" },
  { role: "user", text: "Maya" },
  {
    role: "assistant",
    text: "Nice to meet you, Maya. **What's the name of your business?**",
  },
  { role: "user", text: "Thread & Tide" },
  {
    role: "assistant",
    text: "**How do you primarily get paid today** — local/personal services, business consulting, a product (online or in-person), SaaS/subscription, or something else?",
  },
  { role: "user", text: "Retail or in-person" },
  {
    role: "assistant",
    text: "**How do you think about your role here?** Tap below — or type your own.",
  },
  { role: "user", text: "I'm a founder / co-founder" },
  {
    role: "assistant",
    text: "**Who do you mainly sell to** — mostly other businesses (B2B), mostly consumers (B2C), or a meaningful mix of both?",
  },
  { role: "user", text: "Mostly B2C" },
  {
    role: "assistant",
    text: "**What kind of business is this?** Hair salon, restaurant, retail shop, wellness, home services — whatever fits.",
  },
  { role: "user", text: "Fashion / apparel / boutique" },
  {
    role: "assistant",
    text: "**Where do you mainly serve people** — your neighborhood or city, a wider region, nationally, or online everywhere?",
  },
  { role: "user", text: "Locally (city or metro)" },
  {
    role: "assistant",
    text: "**Roughly how long have you been operating?**",
  },
  { role: "user", text: "1–3 years" },
  {
    role: "assistant",
    text: "**Do you have a website?** If yes, **paste the URL in the message box below** (e.g. `yoursite.com` or `https://yoursite.com`) and send. If you don't have one yet, tap a chip.",
  },
  { role: "user", text: "https://threadandtide.example" },
  {
    role: "assistant",
    text: "**Where does your brand show up on social today?** Name the platforms that matter (Instagram, Google, TikTok, etc.) — or say *none / not really active yet*.",
  },
  { role: "user", text: "Instagram, TikTok, Google Business / Maps" },
  {
    role: "assistant",
    text: "**When a brand-new customer first discovers you, where does that usually happen?**",
  },
  { role: "user", text: "Instagram / walk-by" },
  {
    role: "assistant",
    text: "**When customers choose a competitor over you, what reason comes up most often?**",
  },
  { role: "user", text: "Price" },
  {
    role: "assistant",
    text: "**How clear is your offer to someone encountering you for the first time?**",
  },
  { role: "user", text: "Somewhat clear" },
  {
    role: "assistant",
    text: "**What customer proof do you have today?** Tap all that apply — reviews, testimonials, before/after or success stories, or neither yet.",
  },
  { role: "user", text: "Reviews (Google / Yelp / etc.)" },
  {
    role: "assistant",
    text: "**How confident do you feel about how the brand looks visually?**",
  },
  { role: "user", text: "Somewhat confident" },
  {
    role: "assistant",
    text: "Which outcomes matter most for Thread & Tide in the next 6–12 months? Tap all that apply below.",
  },
  { role: "user", text: "More shoppers / sales" },
  {
    role: "assistant",
    text: "What feels like the biggest challenge with your brand or marketing right now?",
  },
  {
    role: "user",
    text: "Lots of likes, not enough buy — people browse the lookbook vibe but hesitate on fit and price.",
  },
  {
    role: "assistant",
    text: "What makes you different from look-alike competitors?",
  },
  {
    role: "user",
    text: "Coastal everyday pieces with careful fit notes — not fast-fashion dump drops.",
  },
  {
    role: "assistant",
    text: "What's the deeper why behind the business — the mission that keeps you going?",
  },
  {
    role: "user",
    text: "Help people dress like themselves for real life, not just for the feed.",
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
  { role: "user", text: "Stylish, unfussy, a little coastal-cool" },
  {
    role: "assistant",
    text: "What topics or themes do you talk about most with customers?",
  },
  {
    role: "user",
    text: "Fit, fabric, capsule wardrobes, and how to style one piece three ways.",
  },
  {
    role: "assistant",
    text: "**Are you sharing tips, behind-the-scenes, or expertise publicly yet** — social posts, short videos, a blog, or not really?",
  },
  { role: "user", text: "Yes — regularly on social" },
  {
    role: "assistant",
    text: "One last thing — have you done any formal brand strategy work before? Could be on your own, with a freelancer, or through an agency.",
  },
];

const HANDOFF_FASHION_TURNS: SeedTurn[] = [
  ...NEAR_END_FASHION_TURNS,
  { role: "user", text: "Just DIY so far — Instagram and product photos on my own" },
];

const NEAR_END_CONSUMER_FINANCE_TURNS: SeedTurn[] = [
  { role: "assistant", text: "Hi — I'm Wundy™. What's your first name?" },
  { role: "user", text: "Priya" },
  {
    role: "assistant",
    text: "Nice to meet you, Priya. **What's the name of your business?**",
  },
  { role: "user", text: "Northshore Wealth" },
  {
    role: "assistant",
    text: "**How do you primarily get paid today** — local/personal services, business consulting, a product (online or in-person), SaaS/subscription, or something else?",
  },
  { role: "user", text: "Local / personal services" },
  {
    role: "assistant",
    text: "**How do you think about your role here?** Tap below — or type your own.",
  },
  { role: "user", text: "I'm a founder / co-founder" },
  {
    role: "assistant",
    text: "**Who do you mainly sell to** — mostly other businesses (B2B), mostly consumers (B2C), or a meaningful mix of both?",
  },
  { role: "user", text: "Mostly B2C" },
  {
    role: "assistant",
    text: "**What kind of business is this?** Hair salon, restaurant, retail shop, wellness, home services — whatever fits.",
  },
  { role: "user", text: "Consumer financial / advisory" },
  {
    role: "assistant",
    text: "**Where do you mainly serve people** — your neighborhood or city, a wider region, nationally, or online everywhere?",
  },
  { role: "user", text: "Regionally (state or multi-state)" },
  {
    role: "assistant",
    text: "**Roughly how long have you been operating?**",
  },
  { role: "user", text: "5–10 years" },
  {
    role: "assistant",
    text: "**Do you have a website?** If yes, **paste the URL in the message box below** (e.g. `yoursite.com` or `https://yoursite.com`) and send. If you don't have one yet, tap a chip.",
  },
  { role: "user", text: "https://northshorewealth.example" },
  {
    role: "assistant",
    text: "**Where do people find you online today?** Name what matters (Google, LinkedIn, site, email) — or say *none / not really active yet*.",
  },
  { role: "user", text: "Google Business / Maps, LinkedIn, Email / newsletter" },
  {
    role: "assistant",
    text: "**When a brand-new client first discovers you, where does that usually happen?**",
  },
  { role: "user", text: "Word of mouth / referrals" },
  {
    role: "assistant",
    text: "**When clients choose a competitor over you, what reason comes up most often?**",
  },
  { role: "user", text: "Trust / credentials" },
  {
    role: "assistant",
    text: "**How clear is what you help with to someone encountering you for the first time?**",
  },
  { role: "user", text: "Somewhat clear" },
  {
    role: "assistant",
    text: "**What client proof do you have today?** Tap all that apply — reviews, testimonials, outcome stories, or neither yet.",
  },
  { role: "user", text: "Testimonials" },
  {
    role: "assistant",
    text: "**How confident do you feel about how the brand looks visually?**",
  },
  { role: "user", text: "Somewhat confident" },
  {
    role: "assistant",
    text: "Which outcomes matter most for Northshore Wealth in the next 6–12 months? Tap all that apply below.",
  },
  { role: "user", text: "More consult bookings" },
  {
    role: "assistant",
    text: "What feels like the biggest challenge with your brand or marketing right now?",
  },
  {
    role: "user",
    text: "People don't understand who we help until a long first call — too many explain-loops before trust.",
  },
  {
    role: "assistant",
    text: "What makes you different from look-alike competitors?",
  },
  {
    role: "user",
    text: "Plain-language planning for families — not product-pushing or jargon-heavy pitches.",
  },
  {
    role: "assistant",
    text: "What's the deeper why behind the business — the mission that keeps you going?",
  },
  {
    role: "user",
    text: "Help people feel calm and clear about money decisions that shape their family's future.",
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
  { role: "user", text: "Clear, calm, trusted" },
  {
    role: "assistant",
    text: "What topics or themes do you talk about most with customers?",
  },
  {
    role: "user",
    text: "Retirement clarity, protecting family income, and simple next steps after a consult.",
  },
  {
    role: "assistant",
    text: "**Are you sharing plain-language education or guidance publicly yet** — short posts, email tips, a simple guide, or not really?",
  },
  { role: "user", text: "A little / informal" },
  {
    role: "assistant",
    text: "One last thing — have you done any formal brand strategy work before? Could be on your own, with a freelancer, or through an agency.",
  },
];

const HANDOFF_CONSUMER_FINANCE_TURNS: SeedTurn[] = [
  ...NEAR_END_CONSUMER_FINANCE_TURNS,
  { role: "user", text: "Worked with a freelancer on the website once — nothing ongoing" },
];

export function getQaSeedTurns(seed: QaSeedId): SeedTurn[] {
  switch (seed) {
    case "near-end":
      return NEAR_END_TURNS.map((t) => ({ ...t }));
    case "handoff":
      return HANDOFF_TURNS.map((t) => ({ ...t }));
    case "near-end-salon":
      return NEAR_END_SALON_TURNS.map((t) => ({ ...t }));
    case "handoff-salon":
      return HANDOFF_SALON_TURNS.map((t) => ({ ...t }));
    case "near-end-restaurant":
      return NEAR_END_RESTAURANT_TURNS.map((t) => ({ ...t }));
    case "handoff-restaurant":
      return HANDOFF_RESTAURANT_TURNS.map((t) => ({ ...t }));
    case "near-end-fashion":
      return NEAR_END_FASHION_TURNS.map((t) => ({ ...t }));
    case "handoff-fashion":
      return HANDOFF_FASHION_TURNS.map((t) => ({ ...t }));
    case "near-end-consumer-finance":
      return NEAR_END_CONSUMER_FINANCE_TURNS.map((t) => ({ ...t }));
    case "handoff-consumer-finance":
      return HANDOFF_CONSUMER_FINANCE_TURNS.map((t) => ({ ...t }));
    default:
      return [];
  }
}

export function listQaSeedIds(): QaSeedId[] {
  return [
    "near-end",
    "handoff",
    "near-end-salon",
    "near-end-restaurant",
    "near-end-fashion",
    "near-end-consumer-finance",
    "handoff-salon",
    "handoff-restaurant",
    "handoff-fashion",
    "handoff-consumer-finance",
  ];
}
