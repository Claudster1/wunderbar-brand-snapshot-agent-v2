/**
 * Platform-agnostic format / walkthrough recommendations for SMBs.
 * Lead with what the *audience* responds to when capacity allows; always keep a non-video path.
 */

export type VideoComfort = "comfortable" | "prefer_written" | "mixed" | "unsure";

export type WalkthroughLead = "written" | "video" | "either";

export type WalkthroughRecommendation = {
  leadWith: WalkthroughLead;
  audienceVideoFit: boolean;
  operatorVideoReady: boolean;
  /** Short label for UI / Start Here style copy */
  primaryLabel: string;
  alternateLabel: string;
  /** Paste-ready sentence for plans / email CTAs */
  offerLine: string;
  /** Tools line — realistic SMB list, not a single vendor */
  toolsLine: string;
  rationale: string;
};

/** Short async walkthrough options — capacity-aware ordering applied by resolver. */
export const SHORT_WALKTHROUGH_FORMATS = [
  "Annotated one-pager or checklist",
  "3–6 slide walkthrough or screenshot carousel",
  "Short screen recording on any tool you already use (Zoom cloud recording, Loom, Riverside, native screen record)",
  "Live 15–20 minute working session / scope call",
] as const;

/** Proof / testimonial collection — not video-only. */
export const PROOF_COLLECTION_FORMATS = [
  "Email Q&A or written quote",
  "Short voice note (phone memo)",
  "Optional on-camera clip if they are comfortable",
  "Screenshot + caption of a result",
] as const;

export function formatRecommendationList(items: readonly string[]): string {
  return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeVideoComfort(raw: unknown): VideoComfort | null {
  const s = asString(raw).toLowerCase().replace(/[\s-]+/g, "_");
  if (!s) return null;
  if (/(prefer_written|written|text|pdf|no_video|camera.?shy|not.?comfortable)/.test(s)) return "prefer_written";
  if (/(comfortable|happy.?to.?record|yes.?video|ok.?with.?video)/.test(s)) return "comfortable";
  if (/(mixed|sometimes|depends)/.test(s)) return "mixed";
  if (/(unsure|not.?sure|unknown)/.test(s)) return "unsure";
  return null;
}

function normalizeCapacity(raw: unknown): string {
  return asString(raw).toLowerCase().replace(/[\s-]+/g, "_");
}

/** True when the *buyer* audience typically rewards short async video. */
export function audienceLikelyPrefersVideo(diagnosticData: Record<string, unknown>): boolean {
  const audience = `${asString(diagnosticData.audienceType)} ${asString(diagnosticData.businessType)} ${asString(diagnosticData.industry)}`.toLowerCase();
  const channels = Array.isArray(diagnosticData.marketingChannels)
    ? diagnosticData.marketingChannels.map((c) => asString(c).toLowerCase()).join(" ")
    : "";
  const formats = Array.isArray(diagnosticData.contentFormatPreferences)
    ? diagnosticData.contentFormatPreferences.map((c) => asString(c).toLowerCase()).join(" ")
    : "";
  const blob = `${audience} ${channels} ${formats} ${asString(diagnosticData.topAcquisitionChannel)}`;

  if (/\b(b2c|consumer|retail|restaurant|salon|clinic|local service|hospitality)\b/.test(blob) && !/\bb2b\b/.test(blob)) {
    // Local/consumer: short social video can help, but not Loom-style async demos as the default.
    return /\b(tiktok|reels|instagram|youtube|short.?form|video)\b/.test(blob);
  }

  // B2B / professional services: async walkthrough often converts *if* the operator can ship it.
  if (/\b(b2b|saas|agency|consult|professional.?service|b2b services)\b/.test(blob)) return true;
  if (/\b(linkedin|demo|webinar|screen.?share|walkthrough)\b/.test(blob)) return true;
  if (/\bvideo\b/.test(formats)) return true;
  return false;
}

function operatorCanRealisticallyShipVideo(diagnosticData: Record<string, unknown>): boolean {
  const comfort = normalizeVideoComfort(
    diagnosticData.videoComfort ?? diagnosticData.video_comfort ?? diagnosticData.asyncVideoComfort,
  );
  if (comfort === "prefer_written") return false;
  if (comfort === "comfortable" || comfort === "mixed") return true;

  const capacity = normalizeCapacity(
    diagnosticData.contentCreationCapacity ?? diagnosticData.content_creation_capacity,
  );
  if (/under_2|minimal|none|0_/.test(capacity)) return false;
  if (/10_plus|5_10/.test(capacity)) return comfort !== "unsure";

  const team = asString(diagnosticData.teamSize).toLowerCase();
  if (/\b(solo|just me|1\b|only me)\b/.test(team) && /under_2|2_5|minimal/.test(capacity || "under_2")) {
    return false;
  }

  // Unknown comfort + mid capacity: treat as mixed — offer either, don't force video.
  return comfort === null && /2_5|5_10|10_plus/.test(capacity);
}

/**
 * Pick a realistic primary format for this report: audience fit × operator capacity.
 * Always returns a non-video alternate.
 */
export function resolveWalkthroughRecommendation(
  diagnosticData: Record<string, unknown> = {},
): WalkthroughRecommendation {
  const audienceVideoFit = audienceLikelyPrefersVideo(diagnosticData);
  const operatorVideoReady = operatorCanRealisticallyShipVideo(diagnosticData);
  const comfort = normalizeVideoComfort(
    diagnosticData.videoComfort ?? diagnosticData.video_comfort ?? diagnosticData.asyncVideoComfort,
  );

  let leadWith: WalkthroughLead = "written";
  if (audienceVideoFit && operatorVideoReady) leadWith = comfort === "mixed" ? "either" : "video";
  else if (audienceVideoFit && !operatorVideoReady) leadWith = "written";
  else leadWith = "written";

  const writtenPrimary = "Annotated one-pager / checklist (low lift)";
  const videoPrimary =
    "Short screen recording on any tool you already use (2–6 min) — Zoom, Loom, Riverside, or native record";
  const liveAlt = "Live 15–20 minute working session when async is not realistic";

  if (leadWith === "video") {
    return {
      leadWith,
      audienceVideoFit,
      operatorVideoReady,
      primaryLabel: "Short screen recording (any tool)",
      alternateLabel: "Annotated PDF / slides (non-video)",
      offerLine:
        "Primary: a short screen recording walkthrough (any recorder you already have). Non-video option: annotated one-pager or 3–6 slides covering the same points.",
      toolsLine:
        "Use what you already pay for — Zoom cloud recording, native screen record, Loom, or Riverside. Skip new SaaS until volume justifies it.",
      rationale:
        "This audience often engages with short async video, and your capacity supports it — keep a written twin for people who will not watch.",
    };
  }

  if (leadWith === "either") {
    return {
      leadWith,
      audienceVideoFit,
      operatorVideoReady,
      primaryLabel: "Written walkthrough or short recording",
      alternateLabel: liveAlt,
      offerLine:
        "Offer both: an annotated PDF (default) and an optional short screen recording for buyers who prefer watching. Same outline either way.",
      toolsLine:
        "PDF/slides first; record only when it is a light week — any existing recorder is fine.",
      rationale:
        "Audience can go either way; match the format to that week’s capacity so SMB teams stay consistent.",
    };
  }

  return {
    leadWith: "written",
    audienceVideoFit,
    operatorVideoReady,
    primaryLabel: writtenPrimary,
    alternateLabel: audienceVideoFit
      ? "Optional short screen recording later (when capacity allows)"
      : liveAlt,
    offerLine: audienceVideoFit
      ? "Lead with an annotated one-pager or slides. Keep an optional short screen recording as a stretch when you have a lighter week — never block the plan on video."
      : "Lead with an annotated one-pager, checklist, or short live call. Video is optional, not required for this audience.",
    toolsLine:
      "Google Docs / Canva / slides you already use. Add recording only if it stays under ~30 minutes end-to-end including upload.",
    rationale: audienceVideoFit
      ? "Video could help this audience, but current capacity or comfort points to a written primary so the plan stays shippable."
      : "Written and live formats fit this audience and SMB resource limits; video stays optional.",
  };
}

/** Paste-ready secondary CTA — respects resolved lead when diagnostic is provided. */
export function walkthroughSecondaryCta(
  label = "walkthrough",
  diagnosticData?: Record<string, unknown>,
): string {
  const path = resolveWalkthroughRecommendation(diagnosticData ?? {});
  if (path.leadWith === "video") {
    return `Reply “${label}” for a short screen recording (or the annotated PDF if you prefer reading)`;
  }
  if (path.leadWith === "either") {
    return `Reply “${label}” for the walkthrough — PDF or short recording, your choice`;
  }
  return `Reply “${label}” for a short written walkthrough (screen recording available if you prefer video)`;
}

export function optionalWalkthroughBodyLine(
  minutes = 2,
  diagnosticData?: Record<string, unknown>,
): string {
  const path = resolveWalkthroughRecommendation(diagnosticData ?? {});
  if (path.leadWith === "video") {
    return `If a short walkthrough would help, reply with “walkthrough”—we will send a ${minutes}-minute screen recording (any standard recorder) plus the same outline as a one-pager for anyone who prefers reading.`;
  }
  if (path.leadWith === "either") {
    return `If a short walkthrough would help, reply with “walkthrough”—we will send a ${minutes}-minute annotated PDF, or a screen recording if you prefer watching. No special tool required.`;
  }
  return `If a short walkthrough would help, reply with “walkthrough”—we will send a ${minutes}-minute annotated PDF (or a screen recording if you prefer watching). Use any recorder you already have; no special tool required.`;
}

export function optionalWalkthroughDmLine(diagnosticData?: Record<string, unknown>): string {
  const path = resolveWalkthroughRecommendation(diagnosticData ?? {});
  if (path.leadWith === "video") {
    return `If you want a second pair of eyes, happy to send a two-minute screen recording of your headline stack (plus a one-pager twin)—no pitch, just specificity.`;
  }
  return `If you want a second pair of eyes, happy to send a two-minute annotated walkthrough of your headline stack (PDF or screen recording—your choice)—no pitch, just specificity.`;
}

/**
 * Prompt guidance so generated reports stay format-first, capacity-realistic, and dual-path.
 */
export const PLATFORM_AGNOSTIC_TOOLS_PROMPT_RULE = `
TOOL & FORMAT RECOMMENDATIONS (required):
- Recommend the **job** and **format** first (e.g. “short async walkthrough,” “written proof”). Do **not** lock advice to a single vendor (especially Loom).
- When listing tools, give **2–4 options** across free/paid and common stacks, or say “any screen recorder you already use (Zoom, Loom, Riverside, native OS).” Prefer tools they already have — SMBs have limited time and budget.
- Use **videoComfort** (comfortable | prefer_written | mixed | unsure) + **contentCreationCapacity** + **teamSize** to choose the **primary** format:
  - Audience fit for video (B2B async demos, LinkedIn-heavy, stated video prefs) → video may be primary **only if** capacity is realistic and videoComfort is not prefer_written.
  - Low capacity (under ~2 hrs/week), solo operators, or prefer_written → **written / slides primary**; video is a stretch alternate, never a blocker.
  - Always include a clear **non-video option** in the same recommendation (PDF, slides, checklist, or live call).
- Loom and similar async recorders skew **B2B / professional services**. For local/consumer businesses, prefer written one-pagers, SMS/email, Google Business posts, short social clips only when they already post video, and phone/in-person options.
- Never use reply keywords like “loom” as the only CTA; prefer “walkthrough,” “checklist,” or “guide.”
`.trim();
