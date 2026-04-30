/**
 * Normalizes Blueprint+ paidMediaStrategy.channels[] for UI and plain-text export.
 * Accepts snake_case and legacy keys from older reports.
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type NormalizedPaidChannel = {
  /** e.g. LinkedIn, Meta, Google Ads, Microsoft Advertising */
  platform: string;
  /** e.g. Sponsored Content, Conversion, Search — non-brand */
  placement: string;
  /** Full row label (often "Platform — placement") */
  channel: string;
  objective: string;
  audienceAngle: string;
  headline: string;
  subheadline: string;
  bodyCopy: string;
  imagePrompt: string;
  videoPrompt: string;
  cta: string;
  offerStrategy: string;
  kpiToTrack: string;
  /** Legacy single field when structured creatives were not generated */
  creativeDirection: string;
};

export function normalizePaidChannel(raw: unknown): NormalizedPaidChannel {
  const c = asRecord(raw) ?? {};
  let platform =
    asString(c.platform) || asString(c.adPlatform) || asString(c.channelPlatform) || asString(c.paidPlatform);
  let placement =
    asString(c.placement) || asString(c.placementType) || asString(c.adFormat) || asString(c.surface);
  const channelDirect = asString(c.channel);
  if (!platform && !placement && channelDirect && /[—–-]/.test(channelDirect)) {
    const parts = channelDirect.split(/\s*[—–-]\s*/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      platform = platform || parts[0];
      placement = placement || parts.slice(1).join(" — ");
    }
  }
  const channel =
    channelDirect ||
    (platform && placement ? `${platform} — ${placement}` : platform || placement || "");
  const headline =
    asString(c.headline) ||
    asString(c.primaryHeadline) ||
    asString(c.adHeadline) ||
    asString(c.hookHeadline);
  const subheadline =
    asString(c.subheadline) || asString(c.subhead) || asString(c.subHeadline) || asString(c.secondaryHeadline);
  const bodyCopy =
    asString(c.bodyCopy) ||
    asString(c.body_copy) ||
    asString(c.primaryText) ||
    asString(c.primary_copy) ||
    asString(c.adBody);
  const imagePrompt =
    asString(c.imagePrompt) ||
    asString(c.image_prompt) ||
    asString(c.visualPrompt) ||
    asString(c.visual_prompt) ||
    asString(c.assetPrompt);
  const videoPrompt =
    asString(c.videoPrompt) ||
    asString(c.video_prompt) ||
    asString(c.motionPrompt) ||
    asString(c.motion_prompt) ||
    asString(c.videoBrief) ||
    asString(c.video_brief);
  const cta =
    asString(c.cta) || asString(c.callToAction) || asString(c.primaryCta) || asString(c.buttonLabel);
  const creativeDirection = asString(c.creativeDirection) || asString(c.creative_direction);

  return {
    platform,
    placement,
    channel: channel || "Channel",
    objective: asString(c.objective),
    audienceAngle: asString(c.audienceAngle) || asString(c.audience_angle),
    headline,
    subheadline,
    bodyCopy,
    imagePrompt,
    videoPrompt,
    cta,
    offerStrategy: asString(c.offerStrategy) || asString(c.offer_strategy),
    kpiToTrack: asString(c.kpiToTrack) || asString(c.kpi_to_track),
    creativeDirection,
  };
}

/** Card title: prefer platform + placement when both set. */
export function paidChannelDisplayTitle(ch: NormalizedPaidChannel, index: number): string {
  if (ch.platform && ch.placement) return `${ch.platform} — ${ch.placement}`;
  if (ch.platform) return ch.platform;
  return ch.channel || `Channel ${index + 1}`;
}

/** Distinct platforms for summary chips (explicit list or deduped from rows). */
export function derivePaidPlatformsList(strategy: unknown): string[] {
  const p = asRecord(strategy);
  if (!p) return [];
  const explicit = p.platformsCovered;
  if (Array.isArray(explicit)) {
    const out = explicit
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (out.length) return [...new Set(out)];
  }
  const channels = Array.isArray(p.channels) ? p.channels : [];
  const fromRows: string[] = [];
  for (const raw of channels) {
    const n = normalizePaidChannel(raw);
    if (n.platform) fromRows.push(n.platform);
  }
  return [...new Set(fromRows)].filter(Boolean);
}

/** Lines for one channel block (activation body / export). */
export function formatNormalizedPaidChannelBlock(ch: NormalizedPaidChannel, index: number): string {
  const title = paidChannelDisplayTitle(ch, index);
  const rows: string[] = [`— ${title} —`];

  const push = (label: string, value: string) => {
    if (value) rows.push(`${label}: ${value}`);
  };

  push("Platform", ch.platform);
  push("Placement", ch.placement);
  push("Headline", ch.headline);
  push("Subheadline", ch.subheadline);
  push("Body copy", ch.bodyCopy);
  push("Image prompt", ch.imagePrompt);
  push("Video prompt", ch.videoPrompt);
  push("CTA", ch.cta);
  push("Objective", ch.objective);
  push("Audience angle", ch.audienceAngle);
  push("Offer", ch.offerStrategy);
  push("KPI", ch.kpiToTrack);

  if (ch.creativeDirection) {
    const hasNew =
      ch.headline ||
      ch.subheadline ||
      ch.bodyCopy ||
      ch.imagePrompt ||
      ch.videoPrompt ||
      ch.cta;
    push(hasNew ? "Creative direction (additional)" : "Creative direction", ch.creativeDirection);
  }

  return rows.join("\n");
}

export function paidStrategyHasRenderableChannels(strategy: unknown): boolean {
  const p = asRecord(strategy);
  if (!p) return false;
  const channels = Array.isArray(p.channels) ? p.channels : [];
  return channels.length > 0;
}

const MIN_PAID_CHANNEL_ROWS = 3;

/** Distinct platform scaffolds when the model returns fewer than three channel rows. */
const PAID_CHANNEL_SCAFFOLDS: Array<Record<string, string>> = [
  {
    platform: "LinkedIn",
    placement: "Sponsored Content — Feed",
    channel: "LinkedIn — Sponsored Content — Feed",
    objective: "Consideration — educate ICP and retarget engagers",
    audienceAngle: "Match job titles, seniority, and company size to your ICP; exclude noisy segments.",
    headline: "[LinkedIn] Lead with the measurable outcome your buyers already track",
    subheadline: "Proof-led line referencing industry context (replace with your stat or mini-case).",
    bodyCopy:
      "Primary text: 2–3 short sentences — pain → your approach → one CTA. Mirror the landing promise. Regenerate in Blueprint+ for AI-filled copy or brief your agency with this scaffold.",
    imagePrompt:
      "Professional context, single subject or small team, natural light, brand palette accents, clear safe zone for headline overlay, no stock clichés.",
    videoPrompt: "",
    cta: "See how it works / Get the breakdown / Read the guide",
    offerStrategy: "Align to your primary conversion offer and lead magnet naming.",
    kpiToTrack: "CTR, CPC, landing view rate, qualified lead rate",
    creativeDirection: "Scaffold row — pair with detailed rows from a full report refresh when possible.",
  },
  {
    platform: "Meta",
    placement: "Conversion — Advantage+",
    channel: "Meta — Conversion — Advantage+",
    objective: "Conversion — site leads or key events",
    audienceAngle: "Site visitors 7–30d, engagers, and 1% lookalike of converters.",
    headline: "[Meta] Pattern-interrupt hook + social proof in first line",
    subheadline: "",
    bodyCopy:
      "Short, conversational primary text; one emoji max if on-brand. Single CTA. Replace with creative variants A/B/C on refresh.",
    imagePrompt:
      "1:1 or 4:5, bold focal subject, high contrast, legible if shrunk to mobile feed.",
    videoPrompt:
      "9:16 optional: hook in first 2s, captions on, product or customer moment, end card with CTA.",
    cta: "Learn more / Shop / Book",
    offerStrategy: "Same offer as LinkedIn row; message-market fit test here.",
    kpiToTrack: "CTR, CPC, CPA, ROAS (if e-com)",
    creativeDirection: "Scaffold row — add UTM and landing parity before spend.",
  },
  {
    platform: "Google Ads",
    placement: "Search — non-brand",
    channel: "Google Ads — Search — non-brand",
    objective: "Capture high-intent demand",
    audienceAngle: "Problem and category keywords; exclude brand campaigns in this row.",
    headline: "Headline 1: core query + outcome | H2: proof | H3: CTA",
    subheadline: "",
    bodyCopy:
      "Description lines: benefit, proof point, CTA with clear next step. Expand into full RSA set on implementation.",
    imagePrompt: "",
    videoPrompt: "",
    cta: "Get pricing / Talk to us / Start now",
    offerStrategy: "Intent-matched landing; one keyword theme per ad group.",
    kpiToTrack: "Impression share, CTR, conv. rate, CPL",
    creativeDirection: "Scaffold row — build keyword list from SEO/AEO plan.",
  },
];

/**
 * Ensures at least `MIN_PAID_CHANNEL_ROWS` channel rows for UI and exports when the model under-delivers.
 */
export function ensurePaidMediaChannelsMinimum(
  strategy: Record<string, unknown>,
  min = MIN_PAID_CHANNEL_ROWS,
): Record<string, unknown> {
  const existing = Array.isArray(strategy.channels) ? [...strategy.channels] : [];
  if (existing.length >= min) return strategy;

  const next: unknown[] = [...existing];
  const usedPlatforms = new Set<string>();
  for (const raw of existing) {
    const n = normalizePaidChannel(raw);
    if (n.platform) usedPlatforms.add(n.platform.toLowerCase());
  }

  for (const scaffold of PAID_CHANNEL_SCAFFOLDS) {
    if (next.length >= min) break;
    const key = scaffold.platform.toLowerCase();
    if (usedPlatforms.has(key)) continue;
    usedPlatforms.add(key);
    next.push({ ...scaffold });
  }

  let fill = 0;
  while (next.length < min) {
    fill += 1;
    next.push({
      platform: `Paid expansion ${fill}`,
      placement: "Define with media plan",
      channel: `Paid expansion ${fill} — custom surface`,
      objective: "Test incremental reach or retargeting",
      audienceAngle: "Layer on after core three channels are stable.",
      headline: `[Expansion ${fill}] Test hook aligned to pillar`,
      subheadline: "",
      bodyCopy: "Brief creative after primary channels have baseline CPA/ROAS.",
      imagePrompt: "Follow brand system; test new angle vs control.",
      videoPrompt: "",
      cta: "Learn more",
      offerStrategy: "Same as primary funnel offer unless running a promo.",
      kpiToTrack: "Compare to account baseline; pause if 2× worse after meaningful volume.",
      creativeDirection: "Auto-added scaffold — replace with a real platform row when you regenerate or plan media.",
    });
  }

  const platformsCovered = derivePaidPlatformsList({ ...strategy, channels: next });
  const prevCovered = Array.isArray(strategy.platformsCovered)
    ? strategy.platformsCovered.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : [];
  const mergedCovered = [...new Set([...prevCovered, ...platformsCovered])];

  return {
    ...strategy,
    channels: next,
    ...(mergedCovered.length > 0 ? { platformsCovered: mergedCovered } : {}),
  };
}
