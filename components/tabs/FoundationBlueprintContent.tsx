"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import ArchetypeToggleCard from "@/components/results/ArchetypeToggleCard";
import { BrandArchetypeIcon } from "@/components/results/BrandIcons";
import { ReportPanel } from "@/components/results/ReportDesignPrimitives";
import {
  filterFoundationAudienceSubsections,
  normalizeProductTierString,
  type ProductTier,
  type ResultsTab,
} from "@/components/results/tabConfig";
import { useResultsSuiteNav } from "@/components/results/ResultsSuiteNavContext";
import { getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";
import {
  buildFoundationPersonaAtlasEntries,
  extractBuyerPersonasRaw,
} from "@/lib/foundationPersonaAtlas";
import PersonaAtlasSuite from "@/components/persona/PersonaAtlasSuite";
import { SUITE_PANEL_RAIL, SUITE_SHADOW_CARD } from "@/components/results/suiteBrandTokens";

interface FoundationBlueprintContentProps {
  businessName: string;
  targetAudience: string;
  industry: string;
  primaryPillar: string;
  primaryArchetype?: string | null;
  secondaryArchetype?: string | null;
  diagnosticData?: Record<string, unknown>;
}

type Subsection = {
  id: string;
  title: string;
  whatItIs: string;
  contentRequirements: string[];
  personalizedDraft?: string[];
  customBody?: ReactNode;
};

type VisualSystemMode = "existing" | "optimize" | "refresh";
type JourneyStageId = "unaware" | "aware" | "considering" | "evaluating" | "deciding" | "retained";
type DensityMode = "comfortable" | "compact";

const FAMILY_STYLES: Record<string, { chip: string; descriptorBg: string; badgeBg: string }> = {
  identity: {
    chip: "#DBEAFE",
    descriptorBg: "#F5F9FF",
    badgeBg: "#DBEAFE",
  },
  positioning: {
    chip: "#DBEAFE",
    descriptorBg: "#F5F9FF",
    badgeBg: "#DBEAFE",
  },
  messaging: {
    chip: "#DBEAFE",
    descriptorBg: "#F5F9FF",
    badgeBg: "#DBEAFE",
  },
  voice: {
    chip: "#CCFBF1",
    descriptorBg: "#F2FBFA",
    badgeBg: "#CCFBF1",
  },
  visual: {
    chip: "#CFFAFE",
    descriptorBg: "#F2FBFE",
    badgeBg: "#CFFAFE",
  },
  audience: {
    chip: "#E1EEF9",
    descriptorBg: "#F5F9FF",
    badgeBg: "#E1EEF9",
  },
};

/** Typography + spacing aligned with Results tab — Foundation subsections + draft panels. */
const FN_TITLE = "text-xl sm:text-2xl font-semibold text-brand-midnight leading-snug";
const FN_FAMILY_CHIP =
  "rounded-full px-2.5 py-1.5 text-xs font-medium tracking-wide text-brand-midnight";
const FN_DESCRIPTOR =
  "rounded-xl px-4 py-3.5 text-sm sm:text-base leading-relaxed text-brand-muted shadow-[0_1px_0_rgba(2,24,89,0.04),inset_0_0_0_1px_rgba(2,24,89,0.05)] sm:px-5 sm:py-4";
const FN_DRAFT_SHELL =
  "rounded-xl bg-[#F7FBFF] shadow-[inset_0_0_0_1px_rgba(7,176,242,0.12),0_1px_2px_rgba(2,24,89,0.04)]";
const FN_DRAFT_EYEBROW = "text-[14px] font-semibold tracking-[0.08em]";
const FN_DRAFT_HELPER = "mt-1.5 text-sm sm:text-base leading-relaxed text-brand-muted";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function compact(lines: Array<string | null | undefined>): string[] {
  return lines.map((line) => (typeof line === "string" ? line.trim() : "")).filter(Boolean);
}

const SUBSECTION_DESCRIPTORS: Record<string, string> = {
  "identity-purpose":
    "The core belief your brand stands for; it keeps strategy authentic and decisions consistent.",
  "identity-vision":
    "The future your brand is building toward; it aligns long-term direction across teams.",
  "identity-mission":
    "How your company creates impact day-to-day; it translates vision into executable focus.",
  "identity-values":
    "The non-negotiable principles behind decisions and behavior; they protect quality as you scale.",
  "identity-personality":
    "The human character of the brand; it keeps tone, design, and interaction style coherent.",
  "identity-archetype":
    "Your foundational character pattern; it sharpens differentiation and expression consistency.",
  "identity-brand-persona":
    "The person your brand sounds like in-market; it helps teams execute voice consistently under pressure.",
  "identity-origin":
    "The founding narrative that explains why you exist; it builds trust and memorability.",
  "positioning-icp":
    "Your primary (Tier 1) ideal customer—the anchor segment. Additional ICPs are captured as tiers in later positioning, messaging, and audience sections.",
  "positioning-statement":
    "Your strategic market position in one clear construct; it anchors all messaging and sales narratives.",
  "positioning-category":
    "The market frame you compete in; it shapes buyer evaluation criteria in your favor.",
  "positioning-differentiators":
    "The defensible reasons buyers choose you; it turns claims into competitive advantage.",
  "positioning-not":
    "Your strategic boundaries; it prevents dilution and protects positioning integrity.",
  "positioning-competitive-context":
    "Your real context versus alternatives; it informs where to attack, defend, and differentiate.",
  "messaging-value-proposition":
    "The primary buyer outcome you deliver; it answers why your audience should care now.",
  "messaging-pillars":
    "The core message themes repeated across channels; they build lasting brand associations.",
  "messaging-proof-library":
    "The evidence layer behind your claims; it strengthens credibility and reduces buyer risk.",
  "messaging-tagline":
    "A concise expression of positioning and personality; it improves memorability.",
  "messaging-elevator-pitch":
    "Spoken narrative versions for live conversations; they improve clarity in high-stakes moments.",
  "messaging-vocabulary":
    "Your preferred words and terms; it keeps communication distinctive and consistent.",
  "voice-brand-voice":
    "Your consistent communication character; it makes the brand recognizable in any format.",
  "voice-tone-registers":
    "Context-specific tone settings; they adapt expression without losing brand identity.",
  "voice-writing-principles":
    "The structural rules for written communication; they improve readability and quality control.",
  "voice-dodont":
    "Practical examples of on-brand vs off-brand writing; they speed up execution consistency.",
  "visual-logo-system":
    "Rules for logo usage and variants; they protect recognizability and brand integrity.",
  "visual-color-palette":
    "Your approved color system and hierarchy; it drives coherence and visual impact.",
  "visual-typography":
    "The type hierarchy for headings and body copy; it improves readability and brand tone.",
  "visual-iconography":
    "The icon style system; it keeps UI and document visuals clean and consistent.",
  "visual-photography":
    "Imagery direction for subject, mood, and composition; it reinforces brand perception.",
  "visual-layout":
    "Composition and spacing rules; they make dense strategy content easier to consume.",
  "visual-motion":
    "Motion behavior standards; they support clarity without adding visual noise.",
  "audience-persona-atlas":
    "Role-based buyer profiles; they improve relevance across strategy and messaging.",
  "audience-jtbd":
    "The real jobs buyers need solved; they reveal what actually drives decisions.",
  "audience-journey":
    "Step-by-step decision path; it helps you match content and next steps to buyer behavior.",
  "audience-objections":
    "The key reasons buyers hesitate and how to answer them; it increases conversion confidence.",
};

const MAX_LEAD_LEN = 96;

function parsePoint(point: string): { lead: string; detail: string | null } {
  const trimmed = point.trim();
  /** "Value:" / "Value 1:" lines — keep whole string (may be multiline); do not split on inner colons. */
  if (/^Value\s*(?:\d+\s*)?:/i.test(trimmed.split("\n")[0] ?? "")) {
    return { lead: trimmed, detail: null };
  }

  // Channel sample lines — split after "In use (Label):" so colons inside the surface copy (Owner:, https:, etc.) stay in detail.
  if (trimmed.startsWith("In use (")) {
    const close = trimmed.indexOf("):");
    if (close !== -1 && trimmed.charAt(close + 1) === ":") {
      const lead = trimmed.slice(0, close + 1).trim();
      const detail = trimmed.slice(close + 2).trim();
      return { lead, detail: detail || null };
    }
  }

  const parts = trimmed.split(":");
  if (parts.length > 1 && parts[0].length <= MAX_LEAD_LEN) {
    return {
      lead: parts[0].trim(),
      detail: parts.slice(1).join(":").trim(),
    };
  }
  return { lead: trimmed, detail: null };
}

type CoreValuePutToWorkParsed = {
  valueName: string;
  sections: { label: string; body: string }[];
};

function stripNextStepPrefix(point: string): string {
  return point.replace(/^Next step:\s*/i, "").trim();
}

/** Parses Core Values "Put it to work" rows: multiline Value: … / Behavior / In practice / Why it matters, or legacy single-line. */
function parseCoreValuePutToWork(point: string): CoreValuePutToWorkParsed | null {
  const t = stripNextStepPrefix(point);
  const firstLine = t.split("\n")[0]?.trim() ?? "";
  if (!/^Value\s*(?:\d+\s*)?:/i.test(firstLine)) return null;

  if (t.includes("\n")) {
    const blocks = t
      .split(/\n\n+/)
      .map((b) => b.trim())
      .filter(Boolean);
    const nameMatch = blocks[0]?.match(/^Value\s*(?:\d+\s*)?:\s*(.+?)\.?$/i);
    if (!nameMatch) return null;
    const valueName = nameMatch[1].trim().replace(/\.$/, "");
    const sections: { label: string; body: string }[] = [];
    const labelNorm = (raw: string): string | null => {
      const x = raw.replace(/:$/, "").trim().toLowerCase();
      if (x === "behavior") return apStyleHeadingCase("Behavior");
      if (x === "in practice") return apStyleHeadingCase("In practice");
      if (x === "why it matters") return apStyleHeadingCase("Why it matters");
      return null;
    };
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const nl = block.indexOf("\n");
      if (nl === -1) {
        const one = block.match(/^(Behavior|In practice|Why it matters)\s*[-–:]\s*(.+)$/i);
        if (one) {
          sections.push({
            label: labelNorm(one[1]) ?? one[1],
            body: one[2].trim(),
          });
        }
        continue;
      }
      const headerRaw = block.slice(0, nl).trim();
      const body = block.slice(nl + 1).trim();
      const label = labelNorm(headerRaw);
      if (label && body) sections.push({ label, body });
    }
    return { valueName, sections };
  }

  const legacy = t.match(/^Value\s*(?:\d+\s*)?:\s*(.+?)\.\s*Behavior\s*[-–]\s*(.+)$/i);
  if (legacy) {
    return {
      valueName: legacy[1].trim().replace(/\.$/, ""),
      sections: [{ label: "Behavior", body: legacy[2].trim() }],
    };
  }

  const nameOnly = t.match(/^Value\s*(?:\d+\s*)?:\s*(.+?)\.?$/i);
  if (nameOnly) {
    return { valueName: nameOnly[1].trim().replace(/\.$/, ""), sections: [] };
  }
  return null;
}

/**
 * Primary draft deliverables (pitch scripts, core statements, etc.) must stay in the main body.
 * They should not be recycled as synthetic "Next step" rows under Put it to work.
 */
function isReservedMainBodyLead(lead: string): boolean {
  const l = lead.trim().toLowerCase();
  if (/^\d{1,3}-second\b/.test(l)) return true;
  if (l.startsWith("conversion prompt")) return true;
  if (l.startsWith("primary tagline") || l.startsWith("alternative tagline")) return true;
  if (l.startsWith("long-form positioning") || l.startsWith("short-form positioning")) return true;
  if (
    l.startsWith("purpose statement") ||
    l.startsWith("vision statement") ||
    l.startsWith("mission statement")
  ) {
    return true;
  }
  if (l.startsWith("headline value proposition") || l.startsWith("core value proposition")) return true;
  return false;
}

type DraftPointKind = "principle" | "contrast" | "example";

/** Split workbook bullets so principles, do/don't, and examples get distinct UI (order preserved). */
function classifyDraftPointKind(lead: string): DraftPointKind {
  const l = lead.trim().toLowerCase();
  if (l.startsWith("don't") || l.startsWith("not ") || l.startsWith("do ")) return "contrast";
  if (l.includes("example")) return "example";
  if (l.startsWith("before ") || l.startsWith("after ")) return "example";
  if (l.startsWith("in use")) return "example";
  return "principle";
}

type DraftSegment = { kind: DraftPointKind; points: string[] };

function segmentDraftPoints(points: string[]): DraftSegment[] {
  const segments: DraftSegment[] = [];
  for (const point of points) {
    const kind = classifyDraftPointKind(parsePoint(point).lead);
    const last = segments[segments.length - 1];
    if (last?.kind === kind) last.points.push(point);
    else segments.push({ kind, points: [point] });
  }
  return segments;
}

/** AP-style headline case for UI headings (principal words; short articles/prepositions lowercased unless first/last). */
const AP_HEADLINE_SMALL_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "but",
  "for",
  "nor",
  "or",
  "as",
  "at",
  "by",
  "in",
  "into",
  "of",
  "on",
  "onto",
  "off",
  "out",
  "over",
  "per",
  "to",
  "up",
  "via",
  "vs",
  "from",
  "with",
  "than",
  "that",
  "when",
  "we",
]);

function apTitleCaseAtom(atom: string, isFirst: boolean, isLast: boolean): string {
  if (!atom) return atom;
  const lower = atom.toLowerCase();
  if (!isFirst && !isLast && AP_HEADLINE_SMALL_WORDS.has(lower)) return lower;
  if (/^[A-Z]{2,}$/.test(atom)) return atom;
  return atom.charAt(0).toUpperCase() + atom.slice(1).toLowerCase();
}

/** Title-case a segment split on spaces (handles hyphens; preserves trailing punctuation on tokens). */
function apStyleWordsSegment(segment: string): string {
  const words = segment.trim().split(/\s+/).filter(Boolean);
  const n = words.length;
  if (n === 0) return segment;
  return words.map((raw, i) => formatApHeadingWord(raw, i === 0, i === n - 1)).join(" ");
}

/** Title-case each step in an arrow-separated process (e.g. Diagnose → Prioritize → Ship → Review). */
function apStyleArrowChain(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.includes("→")) return apStyleWordsSegment(trimmed);
  return trimmed
    .split(/\s*→\s*/g)
    .map((seg) => apStyleWordsSegment(seg.trim()))
    .join(" → ");
}

function formatApHeadingWord(raw: string, isFirst: boolean, isLast: boolean): string {
  const parenToken = raw.match(/^\(([^)]+)\)([,;:.)}\]!'?"]*)$/);
  if (parenToken) {
    const inner = parenToken[1];
    const suf = parenToken[2];
    if (/^[A-Z0-9]{2,}$/.test(inner)) return `(${inner})${suf}`;
    return `(${apStyleWordsSegment(inner)})${suf}`;
  }

  const trailingMatch = raw.match(/([,;:.)}\]!'?"]+)$/);
  const trailing = trailingMatch ? trailingMatch[1] : "";
  const w0 = trailing ? raw.slice(0, -trailing.length) : raw;
  if (!w0) return raw;

  if (w0.includes("-")) {
    const parts = w0.split("-");
    const titled = parts.map((p, j) =>
      apTitleCaseAtom(p, isFirst && j === 0, isLast && j === parts.length - 1),
    ).join("-");
    return titled + trailing;
  }
  return apTitleCaseAtom(w0, isFirst, isLast) + trailing;
}

/**
 * AP-style title case for foundation draft eyebrows and similar UI headings.
 * Special-cases "In use (…)" lines from channel samples.
 */
function apStyleHeadingCase(input: string): string {
  const s = input.trim();
  if (!s) return s;

  const inUseMatch = s.match(/^in\s+use\s+\((.+)\)\s*$/i);
  if (inUseMatch) {
    const inner = inUseMatch[1]
      .split(/\s*→\s*/g)
      .map((p) => apStyleWordsSegment(p.trim()))
      .join(" → ");
    return `In Use (${inner})`;
  }

  return apStyleWordsSegment(s);
}

function formatPutToWorkHeadingLabel(labelWithOptionalColon: string): string {
  const t = labelWithOptionalColon.trim();
  if (!t) return t;
  if (t.endsWith(":")) {
    return `${apStyleHeadingCase(t.slice(0, -1).trim())}:`;
  }
  return apStyleHeadingCase(t);
}

/** @deprecated Prefer apStyleHeadingCase — kept name for contrast/example lines that need heading case. */
function toInitialCaps(value: string): string {
  return apStyleHeadingCase(value);
}

function sentenceStartCaps(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Split "Field label: body" on the first colon for Put it to work (visual label + body).
 * Skips http(s): and labels that are too short to read as a title.
 */
function splitPutToWorkLabelBody(text: string): { label: string | null; body: string } {
  const t = text.trim();
  if (!t) return { label: null, body: t };
  const colonAt = t.indexOf(":");
  if (colonAt < 4 || colonAt > 110) return { label: null, body: t };
  const before = t.slice(0, colonAt).trim();
  const after = t.slice(colonAt + 1).trim();
  if (!before || !after) return { label: null, body: t };
  if (before.length < 4 || before.length > 100) return { label: null, body: t };
  if (/^https?$/i.test(before)) return { label: null, body: t };
  return { label: `${before}:`, body: after };
}

/** Optional micro-label + stripped headline for "Put it to work" (omit tag for generic / next-step lines to avoid repetition). */
function getActionLineMeta(lead: string): { tag: string | null; headline: string | null } {
  const raw = lead.trim();
  const lower = raw.toLowerCase();
  const stripPrefix = (prefix: string): string | null => {
    if (!lower.startsWith(prefix)) return null;
    const rest = raw.slice(prefix.length).replace(/^[:.\s]+/, "").trim();
    return rest.length > 0 ? rest : null;
  };

  if (lower.startsWith("application example")) {
    return { tag: apStyleHeadingCase("Apply"), headline: stripPrefix("application example") };
  }
  if (lower.startsWith("example in operation")) {
    return { tag: apStyleHeadingCase("In practice"), headline: stripPrefix("example in operation") };
  }
  if (lower.startsWith("example in action")) {
    return { tag: apStyleHeadingCase("Example"), headline: stripPrefix("example in action") };
  }
  if (lower.startsWith("this connects to")) {
    return { tag: apStyleHeadingCase("Connects"), headline: stripPrefix("this connects to") };
  }
  if (lower.startsWith("use this when")) {
    return { tag: apStyleHeadingCase("When"), headline: stripPrefix("use this when") };
  }
  if (lower.startsWith("next step")) {
    return { tag: null, headline: stripPrefix("next step") };
  }
  return { tag: null, headline: null };
}

/** Application / in-practice lines are illustrative; everything else in Put it to work is framed as a direct move or cue. */
function isPutToWorkExampleVariant(tag: string | null): boolean {
  if (!tag) return false;
  const t = tag.trim().toLowerCase();
  return t === "apply" || t === "in practice" || t === "example";
}

type ExecutionSignals = {
  owner?: string;
  timeline?: string;
  metric?: string;
};

/**
 * Pull Owner / Timeline / Success metric snippets from a single action line when phrasing matches.
 * Best-effort heuristics — only surfaces chips when the copy actually signals structure.
 */
function extractExecutionSignals(fullText: string): ExecutionSignals {
  const t = fullText.replace(/\s+/g, " ").trim();
  if (!t) return {};

  const clip = (s: string, max = 72) => {
    const x = s.trim();
    if (x.length <= max) return x;
    return `${x.slice(0, max - 1)}…`;
  };

  let owner: string | undefined;
  const ownerPatterns: RegExp[] = [
    /\bowner\s*[:—]\s*([^.;\n]+)/i,
    /\baccountable(?:\s+owner)?\s*[:—]\s*([^.;\n]+)/i,
    /\bassigned to\s+([^,;\n]+)/i,
    /\bled by\s+([^,;\n]+)/i,
    /\bowned by\s+([^,;\n]+)/i,
    /\breporting to\s+([^,;\n]+)/i,
  ];
  for (const re of ownerPatterns) {
    const m = t.match(re);
    if (m?.[1]) {
      owner = clip(m[1]);
      break;
    }
  }

  let timeline: string | undefined;
  const timePatterns: RegExp[] = [
    /\bwithin\s+(\d{1,3})\s*(day|week|month|quarter)s?\b/i,
    /\bin\s+(\d{1,3})\s*(day|week|month|quarter)s?\b/i,
    /\b(\d{1,3})\s*[-–]\s*(day|week|month|quarter)s?\b/i,
    /\b(?:this|next)\s+(week|month|quarter)\b/i,
    /\bQ[1-4](?:\s+20\d{2})?\b/i,
    /\b90\s*[- ]?\s*days?\b/i,
    /\b30\s*[- ]?\s*days?\b/i,
    /\b(?:by|before)\s+(?:end of\s+)?(?:Q[1-4]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s*\d{4})?)\b/i,
    /\b(?:timeline|deadline)\s*[:—]\s*([^.;\n]+)/i,
  ];
  for (const re of timePatterns) {
    const m = t.match(re);
    if (m) {
      timeline = clip(m[0]);
      break;
    }
  }

  let metric: string | undefined;
  const metricPatterns: RegExp[] = [
    /\b(?:success metric|success criteria|KPI|key metric)\s*[:—]\s*([^.;\n]+)/i,
    /\bmetric\s*[:—]\s*([^.;\n]+)/i,
    /\bmeasure(?:ment)?\s*[:—]\s*([^.;\n]+)/i,
    /\btarget\s*[:—]\s*([^.;\n]+)/i,
    /\b(?:increase|lift|improve|reduce)\s+(?:by\s+)?(\d+(?:\.\d+)?%)/i,
    /\b(\d+(?:\.\d+)?%)\s+(?:lift|increase|improvement|uplift|conversion)\b/i,
    /\bconversion rate\b[^.;]{0,60}/i,
  ];
  for (const re of metricPatterns) {
    const m = t.match(re);
    if (m) {
      metric = clip(m[1] ? m[1] : m[0]);
      break;
    }
  }

  const out: ExecutionSignals = {};
  if (owner) out.owner = owner;
  if (timeline) out.timeline = timeline;
  if (metric) out.metric = metric;
  return out;
}

function ExecutionSignalChips({ signals }: { signals: ExecutionSignals }) {
  const chips: Array<{ label: string; value: string }> = [];
  if (signals.owner) chips.push({ label: "Owner", value: signals.owner });
  if (signals.timeline) chips.push({ label: "Timeline", value: signals.timeline });
  if (signals.metric) chips.push({ label: "Success metric", value: signals.metric });
  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label="Execution details">
      {chips.map((c, chipIndex) => (
        <span
          key={`${c.label}-${chipIndex}-${c.value.slice(0, 32)}`}
          className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-brand-border/70 bg-white px-2.5 py-1.5 text-xs leading-snug text-brand-midnight shadow-sm"
          title={`${c.label}: ${c.value}`}
        >
          <span className="shrink-0 font-medium text-brand-muted">{c.label}</span>
          <span className="min-w-0 truncate font-semibold text-brand-navy">{c.value}</span>
        </span>
      ))}
    </div>
  );
}

function normalizeArchetypeName(value: string | null | undefined): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  return raw.replace(/^the\s+/i, "");
}

/** Mock ad CTAs: real buttons when rendered inside ResultsTabsShell (open related suite tab). */
function ArchetypeChannelPreviewCta({
  className,
  children,
  tab,
  ariaLabel,
  openTab,
}: {
  className: string;
  children: ReactNode;
  tab: ResultsTab;
  ariaLabel: string;
  openTab: ((t: ResultsTab) => void) | undefined;
}) {
  if (!openTab) {
    return <span className={className}>{children}</span>;
  }
  return (
    <button
      type="button"
      className={`${className} cursor-pointer border-0 font-sans hover:brightness-110 active:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2`}
      onClick={() => openTab(tab)}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

/** Collapse whitespace and trim for UI samples; soft-break on words. */
function clipForSample(text: string, maxLen: number): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  const slice = oneLine.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLen * 0.45 ? slice.slice(0, lastSpace) : slice;
  return `${base.trimEnd()}…`;
}

function firstTaglineFromRecommendations(raw: unknown): string {
  if (!Array.isArray(raw)) return "";
  for (const item of raw) {
    if (typeof item === "string") {
      const t = item.trim();
      if (t) return t;
    }
    if (item && typeof item === "object") {
      const t = asString((item as Record<string, unknown>).tagline);
      if (t) return t;
    }
  }
  return "";
}

/** Copy from Blueprint/Plus `brandFoundation` / `brandStory` (and `full_report`) when present. */
type FoundationVoiceSnippets = {
  positioningStatement: string;
  brandPromise: string;
  differentiationNarrative: string;
  tagline: string;
  elevatorPitch: string;
};

function extractFoundationVoiceSnippets(diagnostic: Record<string, unknown>): FoundationVoiceSnippets {
  const fullReport = diagnostic.full_report as Record<string, unknown> | undefined;
  const pickBf = (): Record<string, unknown> | undefined => {
    const top = diagnostic.brandFoundation as Record<string, unknown> | undefined;
    if (top && typeof top === "object") return top;
    const fr = fullReport?.brandFoundation as Record<string, unknown> | undefined;
    return fr;
  };
  const bf = pickBf() ?? {};
  const pickStory = (): Record<string, unknown> | undefined => {
    const s = diagnostic.brandStory as Record<string, unknown> | undefined;
    if (s && typeof s === "object") return s;
    return fullReport?.brandStory as Record<string, unknown> | undefined;
  };
  const story = pickStory() ?? {};
  const tagRec =
    firstTaglineFromRecommendations(diagnostic.taglineRecommendations) ||
    firstTaglineFromRecommendations(fullReport?.taglineRecommendations) ||
    firstTaglineFromRecommendations(bf.taglineRecommendations);

  return {
    positioningStatement: asString(bf.positioningStatement) || asString(bf.positioning_statement),
    brandPromise: asString(bf.brandPromise) || asString(bf.brand_promise),
    differentiationNarrative:
      asString(bf.differentiationNarrative) || asString(bf.differentiation_narrative),
    tagline: asString(bf.tagline) || asString(bf.primaryTagline) || tagRec,
    elevatorPitch:
      asString(story.elevatorPitch) ||
      asString(story.elevator_pitch) ||
      asString(story.oneLiner) ||
      asString(story.one_liner),
  };
}

/** Finished copy only—no “Headline:” scaffolding or homework language (UI + draft “In use” lines). */
type ArchetypeChannelSamples = {
  socialOrganic: { hook: string; body: string; cta: string };
  paidAd: { headline: string; body: string; cta: string };
  retargeting: { quote: string; cta: string };
};

function buildArchetypeChannelSamples(params: {
  brandName: string;
  market: string;
  primaryPillar: string;
  firstGap: string;
  primaryLabel: string;
  secondaryLabel?: string | null;
  foundation?: FoundationVoiceSnippets;
  voiceAttributes?: string[];
}): ArchetypeChannelSamples {
  const { brandName, market, primaryPillar, firstGap, primaryLabel, secondaryLabel, foundation, voiceAttributes } =
    params;
  const dual = Boolean(primaryLabel && secondaryLabel?.trim());
  const pillar = primaryPillar.toLowerCase();
  const mkt = market.toLowerCase();

  const pos = foundation?.positioningStatement ? clipForSample(foundation.positioningStatement, 118) : "";
  const promise = foundation?.brandPromise ? clipForSample(foundation.brandPromise, 220) : "";
  const diff = foundation?.differentiationNarrative ? clipForSample(foundation.differentiationNarrative, 200) : "";
  const elev = foundation?.elevatorPitch ? clipForSample(foundation.elevatorPitch, 220) : "";
  const tag = foundation?.tagline ? clipForSample(foundation.tagline, 40) : "";

  const hook =
    pos ||
    (foundation?.elevatorPitch ? clipForSample(foundation.elevatorPitch, 108) : "") ||
    `${brandName}: if ${firstGap} keeps repeating, the issue is message clarity—not effort.`;

  const usedElevInHook = !pos && Boolean(foundation?.elevatorPitch);

  let body =
    promise ||
    diff ||
    (!usedElevInHook && elev ? elev : "") ||
    `Most ${mkt} teams do not need more activity. They need one ${pillar} narrative that stays consistent from post to proof to CTA.`;

  if (voiceAttributes && voiceAttributes.length > 0 && body.includes("do not need more activity")) {
    const cue = clipForSample(voiceAttributes.slice(0, 3).join(", "), 56);
    body = `${body} Aim for a ${cue} read.`;
  }

  const socialOrganic = {
    hook,
    body,
    cta: tag && tag.length <= 34 ? tag : "See the 90-day priority sequence",
  };

  const paidBody = dual
    ? `${brandName} leads with ${primaryLabel} in the hook; ${secondaryLabel} shows up in the proof line only—same promise, warmer evidence.`
    : promise
      ? promise
      : diff
        ? diff
        : `${brandName} · One ${pillar} promise, one mechanism, one next step—same voice from ad to landing.`;

  const paidAd = {
    headline: foundation?.positioningStatement
      ? clipForSample(foundation.positioningStatement, 58)
      : foundation?.differentiationNarrative
        ? clipForSample(foundation.differentiationNarrative, 58)
        : `Stop funding ${firstGap} with more spend`,
    body: paidBody,
    cta: tag && tag.length <= 34 ? tag : "Get your 90-day plan",
  };

  const retQuote = promise
    ? clipForSample(
        `${promise} If ${firstGap} still shows up in pipeline, add one proof block this week—then retest before raising spend.`,
        240,
      )
    : pos
      ? clipForSample(
          `Revisit your hero claim: ${pos} Tighten one proof line this week if ${firstGap} is still visible in reporting.`,
          240,
        )
      : `Still seeing ${firstGap}? Align one hero claim with one proof block this week—then retest before you raise budget.`;

  const retargeting = {
    quote: retQuote,
    cta: tag && tag.length <= 30 ? tag : "See what to fix first",
  };

  return { socialOrganic, paidAd, retargeting };
}

type BrandValueRow = {
  name: string;
  description?: string;
  inAction?: string;
  whyItMatters?: string;
};

/** Pull values from Blueprint/Plus JSON (or string[] fallbacks) passed through diagnosticData. */
function extractBrandValuesFromDiagnostic(diagnostic: Record<string, unknown>): BrandValueRow[] {
  const asArray = (raw: unknown): unknown[] => (Array.isArray(raw) ? raw : []);

  const fromFoundation = (bf: Record<string, unknown> | undefined): BrandValueRow[] => {
    if (!bf || typeof bf !== "object") return [];
    const rawList: unknown[] =
      asArray(bf.brandValues).length > 0 ? asArray(bf.brandValues) : asArray(bf.values);
    const rows: BrandValueRow[] = [];
    for (const item of rawList) {
      if (typeof item === "string") {
        const name = item.trim();
        if (name) rows.push({ name });
        continue;
      }
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const name = String(o.name ?? o.title ?? o.label ?? "").trim();
        if (!name) continue;
        rows.push({
          name,
          description: typeof o.description === "string" ? o.description : undefined,
          inAction:
            typeof o.inAction === "string"
              ? o.inAction
              : typeof o.in_action === "string"
                ? o.in_action
                : undefined,
          whyItMatters:
            typeof o.whyItMatters === "string"
              ? o.whyItMatters
              : typeof o.why_it_matters === "string"
                ? o.why_it_matters
                : undefined,
        });
      }
    }
    return rows;
  };

  const fullReport = diagnostic.full_report as Record<string, unknown> | undefined;
  let rows = fromFoundation(diagnostic.brandFoundation as Record<string, unknown> | undefined);
  if (rows.length === 0 && fullReport) {
    rows = fromFoundation(fullReport.brandFoundation as Record<string, unknown> | undefined);
  }

  if (rows.length === 0) {
    const cv = diagnostic.coreValues;
    if (Array.isArray(cv)) {
      rows = cv.map((s) => ({ name: String(s).trim() })).filter((r) => r.name.length > 0);
    }
  }

  return rows.slice(0, 8);
}

type PrincipleHeadingVariant = "none" | "elevator" | "guidance";

function DraftSegmentHeading({
  kind,
  principleVariant,
}: {
  kind: DraftPointKind;
  principleVariant: PrincipleHeadingVariant;
}) {
  if (kind === "principle") {
    if (principleVariant === "none") return null;
    if (principleVariant === "elevator") {
      return (
        <div className="mb-4">
          <p className={`${FN_DRAFT_EYEBROW} text-brand-midnight`}>Ready-to-say scripts</p>
          <p className={FN_DRAFT_HELPER}>
            Speakable lines you can use as-is or tighten for live conversations.
          </p>
        </div>
      );
    }
    return (
      <div className="mb-4">
        <p className={`${FN_DRAFT_EYEBROW} text-brand-midnight`}>Guidance</p>
        <p className={FN_DRAFT_HELPER}>
          Rules, definitions, and statements to lock in for this subsection.
        </p>
      </div>
    );
  }
  if (kind === "contrast") {
    return (
      <div className="mb-4">
        <p className={`${FN_DRAFT_EYEBROW} text-brand-midnight`}>Do / Don&apos;t</p>
        <p className={FN_DRAFT_HELPER}>Contrast on-brand execution with patterns to avoid.</p>
      </div>
    );
  }
  return (
    <div className="mb-4">
      <p className={`${FN_DRAFT_EYEBROW} text-slate-600`}>Examples</p>
      <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-slate-600">
        Illustrative phrasing and scenarios—adapt for your brand and channels.
      </p>
    </div>
  );
}

function DraftPointContent({
  point,
  kind,
}: {
  point: string;
  kind: DraftPointKind;
}) {
  const parsed = parsePoint(point);
  const leadLower = parsed.lead.toLowerCase();
  const isDo = leadLower.startsWith("do ");
  const isDont = leadLower.startsWith("don't") || leadLower.startsWith("not ");

  if (kind === "contrast") {
    return (
      <>
        <div
          className={`mb-2.5 inline-flex rounded-md border px-2.5 py-1 ${
            isDont ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <span
            className={`text-xs font-medium tracking-wide ${
              isDont ? "text-red-800" : "text-emerald-900"
            }`}
          >
            {isDont ? "Not This" : "Do This"}
          </span>
        </div>
        {parsed.detail ? (
          <>
            <p className="text-sm font-normal leading-snug text-brand-midnight sm:text-base">
              {toInitialCaps(parsed.lead)}
            </p>
            <p className="mt-2 text-[15px] sm:text-base leading-relaxed text-brand-midnight">
              {sentenceStartCaps(parsed.detail)}
            </p>
          </>
        ) : (
          <p className="text-[15px] sm:text-base leading-relaxed text-brand-midnight">
            {sentenceStartCaps(parsed.lead)}
          </p>
        )}
      </>
    );
  }

  if (kind === "example") {
    return (
      <>
        <p className="text-xs font-medium tracking-wide text-slate-600 sm:text-sm">
          {toInitialCaps(parsed.lead)}
        </p>
        {parsed.detail ? (
          <p className="mt-3 rounded-lg bg-amber-50/80 px-3 py-2.5 text-[15px] sm:text-base leading-relaxed text-brand-midnight ring-1 ring-amber-200/50">
            {sentenceStartCaps(parsed.detail)}
          </p>
        ) : (
          <p className="mt-2 text-[15px] sm:text-base leading-relaxed text-brand-midnight">
            {sentenceStartCaps(parsed.lead)}
          </p>
        )}
      </>
    );
  }

  return (
    <>
      {parsed.detail ? (
        <>
          <p className={`${FN_DRAFT_EYEBROW} text-brand-blue`}>{apStyleHeadingCase(parsed.lead)}</p>
          <p className="mt-2.5 text-[15px] sm:text-base leading-relaxed text-brand-midnight">
            {sentenceStartCaps(parsed.detail)}
          </p>
        </>
      ) : (
        <p className="text-[15px] sm:text-base leading-relaxed text-brand-midnight">{sentenceStartCaps(parsed.lead)}</p>
      )}
    </>
  );
}

function SubsectionCard({ item, densityMode }: { item: Subsection; densityMode: DensityMode }) {
  const family = item.id.split("-")[0];
  const familyStyle = FAMILY_STYLES[family] || FAMILY_STYLES.positioning;
  const isActionLead = (lead: string): boolean => {
    const firstLine = lead.split("\n")[0]?.trim() ?? lead;
    /** "Value:" / "Value 1:" — not "Values …" */
    if (/^value\s*(?:\d+\s*)?:/i.test(firstLine)) return true;
    const leadLower = lead.toLowerCase();
    return (
      leadLower.startsWith("application example") ||
      leadLower.startsWith("example in action") ||
      leadLower.startsWith("example in operation") ||
      leadLower.startsWith("this connects to") ||
      leadLower.startsWith("use this when") ||
      leadLower.startsWith("next step")
    );
  };
  const actionPoints =
    item.personalizedDraft?.filter((point) => {
      return isActionLead(parsePoint(point).lead);
    }) || [];
  const standardPoints =
    item.personalizedDraft?.filter((point) => {
      return !isActionLead(parsePoint(point).lead);
    }) || [];
  /** Only non-reserved lines may be pulled into synthetic "Next step" rows (never pitch scripts, etc.). */
  const supplementalStandards = standardPoints.filter((p) => !isReservedMainBodyLead(parsePoint(p).lead));
  const fallbackTakeCount =
    actionPoints.length >= 3
      ? 0
      : Math.min(Math.max(0, 3 - actionPoints.length), 4, supplementalStandards.length);
  const consumedSupplementals = supplementalStandards.slice(0, fallbackTakeCount);
  /** Avoid duplicating supplementals in the body when they are echoed under Put it to work. */
  const displayStandardPoints = standardPoints.filter((p) => !consumedSupplementals.includes(p));
  const draftSegments = segmentDraftPoints(displayStandardPoints);
  const draftKindSet = new Set(draftSegments.map((s) => s.kind));
  const principleHeadingForSegment = (segIndex: number): PrincipleHeadingVariant => {
    const seg = draftSegments[segIndex];
    if (!seg || seg.kind !== "principle") return "none";
    const prev = draftSegments[segIndex - 1];
    const isStartOfPrincipleRun = !prev || prev.kind !== "principle";
    if (!isStartOfPrincipleRun) return "none";
    if (item.id === "messaging-elevator-pitch") return "elevator";
    if (draftKindSet.size <= 1) return "none";
    return "guidance";
  };
  const derivedActionPoints =
    actionPoints.length >= 3
      ? actionPoints
      : [
          ...actionPoints,
          ...consumedSupplementals.map((point) => {
            const parsed = parsePoint(point);
            const sentence = parsed.detail ? `${parsed.lead}: ${parsed.detail}` : parsed.lead;
            return `Next step: ${sentence}`;
          }),
        ];

  return (
    <ReportPanel
      id={item.id}
      accentColor={SUITE_PANEL_RAIL}
      tint={familyStyle.descriptorBg}
      edgeAccent="none"
      style={{
        padding: densityMode === "compact" ? "22px 24px" : "26px 28px",
        scrollMarginTop: 120,
        boxShadow: SUITE_SHADOW_CARD,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <h4 className={FN_TITLE}>{item.title}</h4>
        <span className={FN_FAMILY_CHIP} style={{ backgroundColor: familyStyle.chip }}>
          {family}
        </span>
      </div>
      <p
        className={`${FN_DESCRIPTOR} ${densityMode === "compact" ? "mt-4" : "mt-5"}`}
        style={{ backgroundColor: familyStyle.descriptorBg }}
      >
        {SUBSECTION_DESCRIPTORS[item.id] || item.whatItIs}
      </p>
      {item.customBody ? (
        <div className={densityMode === "compact" ? "mt-4" : "mt-5"}>{item.customBody}</div>
      ) : null}
      {item.personalizedDraft && item.personalizedDraft.length > 0 ? (
        <div
          className={`${
            item.customBody ? (densityMode === "compact" ? "mt-6" : "mt-7") : "mt-6"
          } ${FN_DRAFT_SHELL} ${densityMode === "compact" ? "p-5 sm:p-6" : "p-6 sm:p-7"}`}
        >
          <div className={densityMode === "compact" ? "space-y-7" : "space-y-8"}>
            {draftSegments.map((segment, segIndex) => (
              <div
                key={`${item.id}-seg-${segIndex}-${segment.kind}`}
                className={segIndex > 0 ? "border-t border-slate-200/90 pt-7 sm:pt-8" : ""}
              >
                <DraftSegmentHeading
                  kind={segment.kind}
                  principleVariant={principleHeadingForSegment(segIndex)}
                />
                <div
                  className={
                    segment.kind === "example"
                      ? `rounded-xl bg-slate-50/95 ${
                          densityMode === "compact" ? "p-4 sm:p-5" : "p-5 sm:p-6"
                        } space-y-5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] [background-image:linear-gradient(135deg,rgba(255,255,255,0.9)_0%,transparent_100%)]`
                      : segment.kind === "contrast"
                        ? `rounded-xl bg-slate-50/60 ${
                            densityMode === "compact" ? "p-4 sm:p-5" : "p-5 sm:p-6"
                          } space-y-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]`
                        : `${densityMode === "compact" ? "space-y-4" : "space-y-5"}`
                  }
                >
                  {segment.points.map((point, index) => {
                    const contrastLead = segment.kind === "contrast" ? parsePoint(point).lead.toLowerCase() : "";
                    const contrastIsDont =
                      segment.kind === "contrast" &&
                      (contrastLead.startsWith("don't") || contrastLead.startsWith("not "));
                    return (
                      <div
                        key={`${item.id}-${segIndex}-${index}-${point.slice(0, 36)}`}
                        className={`relative ${
                          segment.kind === "example" && index > 0 ? "border-t border-slate-200/70 pt-5" : ""
                        }`}
                      >
                        {segment.kind === "example" ? (
                          <DraftPointContent point={point} kind={segment.kind} />
                        ) : (
                          <div
                            className={`rounded-xl bg-white px-4 sm:px-5 ${
                              densityMode === "compact" ? "py-3.5" : "py-4 sm:py-5"
                            } ${
                              segment.kind === "contrast"
                                ? contrastIsDont
                                  ? "shadow-[inset_0_0_0_1px_rgba(248,113,113,0.35)] bg-red-50/50"
                                  : "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.35)] bg-emerald-50/40"
                                : segment.kind === "principle"
                                  ? "shadow-[inset_0_0_0_1px_rgba(7,176,242,0.2),0_1px_2px_rgba(2,24,89,0.03)]"
                                  : "shadow-[inset_0_0_0_1px_rgba(2,24,89,0.06)]"
                            }`}
                          >
                            <DraftPointContent point={point} kind={segment.kind} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {derivedActionPoints.length > 0 ? (
            <div
              className={`mt-6 rounded-2xl border-2 border-brand-blue/20 bg-gradient-to-b from-white to-[#f4f9ff] shadow-[0_6px_24px_rgba(2,24,89,0.06)] ${
                densityMode === "compact" ? "p-5 sm:p-6" : "p-6 sm:p-8"
              }`}
            >
              <div className="mb-6 flex items-start gap-4 border-b border-brand-border/70 pb-5 sm:mb-7 sm:pb-6">
                <span
                  className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-brand-blue text-sm font-semibold leading-none text-white shadow-sm"
                  aria-hidden
                >
                  →
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue m-0 mb-3">
                    Put It to Work
                  </p>
                  <p className="m-0 text-sm sm:text-base leading-relaxed text-brand-midnight">
                    {item.id === "identity-values" ? (
                      <>
                        Ranked values (1–3). Each card separates Behavior, In Practice, and Why It Matters so the ideas do
                        not run together.
                      </>
                    ) : item.id === "identity-archetype" ? (
                      <>
                        Operational moves—briefs, reviews, and checkpoints. Archetype names and samples are above; this
                        block avoids repeating them.
                      </>
                    ) : (
                      <>
                        Concrete moves—workshops, audits, artifacts, and QA hooks. No fixed order. Warm, dashed cards are
                        sample wording; solid cards are next steps, “use this when,” or connection cues. Owner, date, or goal
                        mentions surface as chips below when we detect them.
                      </>
                    )}
                  </p>
                </div>
              </div>
              <ul
                className={`m-0 list-none p-0 ${
                  densityMode === "compact" ? "space-y-4" : "space-y-5"
                }`}
              >
                {derivedActionPoints.map((point, index) => {
                  const cvParsed = item.id === "identity-values" ? parseCoreValuePutToWork(point) : null;
                  const coreValueOrdinal = cvParsed
                    ? derivedActionPoints
                        .slice(0, index + 1)
                        .filter((p) => parseCoreValuePutToWork(p)).length
                    : 0;
                  const signalSource = stripNextStepPrefix(point);
                  if (item.id === "identity-values" && cvParsed) {
                    const signals = extractExecutionSignals(signalSource);
                    return (
                      <li
                        key={`${item.id}-action-${index}-${point.slice(0, 36)}`}
                        className="list-none"
                      >
                        <div className="flex gap-4 items-start">
                          <span
                            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-brand-blue text-sm font-semibold tabular-nums leading-none text-white shadow-sm"
                            aria-hidden
                          >
                            {coreValueOrdinal}
                          </span>
                          <div className="min-w-0 flex-1 rounded-xl bg-white/95 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_1px_3px_rgba(2,24,89,0.05)] ring-1 ring-slate-900/[0.06]">
                            <p className="m-0 text-[15px] sm:text-base leading-snug text-brand-midnight">
                              <span className="text-brand-muted">Value:</span>{" "}
                              <span className="font-semibold text-brand-navy">{cvParsed.valueName}</span>
                            </p>
                            {cvParsed.sections.map((s, si) => (
                              <div
                                key={`${item.id}-cv-${index}-sec-${si}-${s.label}`}
                                className={si === 0 ? "mt-5" : "mt-5 border-t border-slate-200/90 pt-5"}
                              >
                                <p className="m-0 text-xs sm:text-sm font-medium tracking-[0.08em] text-brand-blue">
                                  {s.label}
                                </p>
                                <p className="mt-2.5 text-[15px] sm:text-base leading-relaxed text-brand-midnight">
                                  {s.body}
                                </p>
                              </div>
                            ))}
                            <ExecutionSignalChips signals={signals} />
                          </div>
                        </div>
                      </li>
                    );
                  }
                  const parsed = parsePoint(point);
                  const meta = getActionLineMeta(parsed.lead);
                  const isExample = isPutToWorkExampleVariant(meta.tag);
                  const fullLineForSignals = parsed.detail
                    ? `${parsed.lead}: ${parsed.detail}`
                    : parsed.lead;
                  const signals = extractExecutionSignals(fullLineForSignals);
                  const rawPrimary =
                    parsed.detail?.trim() ||
                    (meta.headline ? meta.headline.trim() : null) ||
                    parsed.lead.trim();
                  const colonSplit = splitPutToWorkLabelBody(rawPrimary);
                  const mainText = parsed.detail
                    ? sentenceStartCaps(parsed.detail)
                    : meta.headline
                      ? sentenceStartCaps(meta.headline)
                      : sentenceStartCaps(parsed.lead);
                  const bodyOnly = colonSplit.label ? sentenceStartCaps(colonSplit.body) : mainText;
                  const contextLine =
                    parsed.detail && meta.headline
                      ? sentenceStartCaps(meta.headline)
                      : null;
                  const showContext =
                    Boolean(contextLine && contextLine.trim() && contextLine.trim() !== mainText.trim());
                  return (
                    <li
                      key={`${item.id}-action-${index}-${point.slice(0, 36)}`}
                        className={
                        isExample
                          ? `rounded-xl border-2 border-dashed border-amber-400/75 bg-gradient-to-br from-amber-50/95 to-orange-50/40 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ring-1 ring-amber-200/50 ${
                              densityMode === "compact" ? "py-3.5" : "py-4 sm:py-5"
                            }`
                            : "rounded-xl bg-white/95 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_1px_3px_rgba(2,24,89,0.05)] ring-1 ring-slate-900/[0.06]"
                      }
                    >
                      {isExample ? (
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-md border border-amber-300/90 bg-white/90 px-2.5 py-1 text-xs font-medium tracking-[0.08em] text-amber-900">
                            Example
                          </span>
                          <span className="text-xs sm:text-sm font-medium leading-snug text-amber-900/75">
                            Sample phrasing—adapt to your voice
                          </span>
                        </div>
                      ) : meta.tag ? (
                        <span className="mb-2 inline-flex rounded-full border border-brand-border/70 bg-[#F0F9FF] px-2.5 py-1 text-xs sm:text-sm font-medium tracking-[0.08em] text-brand-blue">
                          {meta.tag}
                        </span>
                      ) : null}
                      {colonSplit.label ? (
                        <div className={!isExample && meta.tag ? "mt-0.5" : ""}>
                          <p
                            className={`text-sm font-medium leading-snug tracking-wide ${
                              isExample ? "text-amber-950" : "text-brand-blue"
                            }`}
                          >
                            {formatPutToWorkHeadingLabel(colonSplit.label)}
                          </p>
                          <p
                            className={`mt-2 text-[15px] sm:text-base leading-relaxed ${
                              isExample ? "font-medium text-[#292524]" : "font-normal text-brand-midnight"
                            }`}
                          >
                            {bodyOnly}
                          </p>
                        </div>
                      ) : (
                        <p
                          className={`text-[15px] sm:text-base leading-relaxed text-brand-midnight ${
                            isExample ? "font-medium text-[#292524]" : "font-normal"
                          } ${!isExample && meta.tag ? "mt-1" : ""} ${isExample ? "mt-0" : ""}`}
                        >
                          {mainText}
                        </p>
                      )}
                      {showContext ? (
                        <p
                          className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                            isExample ? "text-amber-900/70" : "text-brand-muted"
                          }`}
                        >
                          {contextLine}
                        </p>
                      ) : null}
                      <ExecutionSignalChips signals={signals} />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </ReportPanel>
  );
}

function DomainSection({
  id,
  sectionNumber,
  eyebrow,
  title,
  intro,
  gradient,
  subsections,
  visual,
  densityMode,
}: {
  id: string;
  sectionNumber?: string;
  eyebrow: string;
  title: string;
  intro: string;
  gradient: string;
  subsections: Subsection[];
  visual?: ReactNode;
  densityMode: DensityMode;
}) {
  return (
    <section
      id={id}
      className={`bs-card rounded-2xl ${
        densityMode === "compact" ? "p-6 sm:p-7 lg:p-8" : "p-7 sm:p-8 lg:p-10"
      } shadow-[0_10px_40px_rgba(2,24,89,0.05)] ring-1 ring-slate-900/[0.04]`}
      style={{ background: gradient }}
    >
      <div
        className={`flex items-start gap-5 ${
          densityMode === "compact" ? "mb-6 pb-4 sm:mb-7 sm:pb-5" : "mb-7 pb-5 sm:mb-8 sm:pb-6"
        }`}
        style={{ boxShadow: "0 1px 0 rgba(2, 24, 89, 0.07)" }}
      >
        <div className="min-w-[44px] text-3xl sm:text-4xl font-semibold leading-none tabular-nums text-brand-blue">
          {sectionNumber || ""}
        </div>
        <div>
          <p className={`mb-2 ${FN_DRAFT_EYEBROW} text-brand-navy`}>{eyebrow}</p>
          <h3 className="bs-h2 mb-3">{title}</h3>
          <p className="text-sm sm:text-base leading-relaxed text-brand-muted max-w-3xl">{intro}</p>
        </div>
      </div>
      {visual ? <div className={densityMode === "compact" ? "mb-6 sm:mb-7" : "mb-7 sm:mb-8"}>{visual}</div> : null}
      <div className={`grid grid-cols-1 ${densityMode === "compact" ? "gap-5 sm:gap-6" : "gap-6 sm:gap-7"}`}>
        {subsections.map((item) => (
          <SubsectionCard key={item.id} item={item} densityMode={densityMode} />
        ))}
      </div>
    </section>
  );
}

export default function FoundationBlueprintContent({
  businessName,
  targetAudience,
  industry,
  primaryPillar,
  primaryArchetype,
  secondaryArchetype,
  diagnosticData,
}: FoundationBlueprintContentProps) {
  const brandName = businessName || "Your Brand";
  const audience = targetAudience || "your highest-fit audience";
  const market = industry || "your market";
  const archetypePair = [primaryArchetype, secondaryArchetype].filter(Boolean).join(" + ");
  const data = useMemo((): Record<string, unknown> => {
    if (diagnosticData && typeof diagnosticData === "object") return diagnosticData as Record<string, unknown>;
    return {};
  }, [diagnosticData]);
  const secondaryAudience =
    asString(data.secondaryAudience) ||
    asString(data.secondary_audience) ||
    `Adjacent operator audience supporting ${audience.toLowerCase()}`;
  const tertiaryAudience =
    asString(data.tertiaryAudience) ||
    asString(data.tertiary_audience) ||
    "Referral and internal stakeholder audience that influences final selection";
  const score =
    typeof data.wunderBrandScore === "number"
      ? data.wunderBrandScore
      : typeof data.brandAlignmentScore === "number"
        ? data.brandAlignmentScore
        : 0;
  const positioning = asString(data.positioningMessagingFramework);
  const topOpportunity = asString(data.topOpportunity);
  const brandVerdict = asString(data.brandHealthVerdict);
  const revenueImpact = asString(data.revenueImpactStatement);
  const pillarDependency = asString(data.pillarDependencyExplanation);
  const topStrengths = asStringList(data.topStrengths);
  const topGaps = asStringList(data.topGaps);
  const voiceAttributes = asStringList(data.voiceAttributes);
  const strategicPriorities =
    (data.strategicPriorities as Array<{ rank?: number; title?: string; pillar?: string }> | undefined) ?? [];
  const synthesisPoints =
    (data.synthesisPoints as Array<{ label?: string; content?: string }> | undefined) ?? [];
  const channelPlans = (data.channelPlans as Record<string, string> | undefined) ?? {};
  const competitiveVulnerability =
    (data.competitiveVulnerability as { summary?: string; implication?: string; recommendation?: string } | undefined) ??
    {};
  const scheduleRows =
    (data.scheduleRows as Array<{ week?: string | number; channel?: string; assetTopic?: string; owner?: string }> | undefined) ??
    [];

  const topPriority = strategicPriorities[0];
  const secondPriority = strategicPriorities[1];
  const normalizedPrimaryArchetype = normalizeArchetypeName(primaryArchetype);
  const normalizedSecondaryArchetype = normalizeArchetypeName(secondaryArchetype);
  const channelPlanLines = Object.entries(channelPlans)
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .slice(0, 3)
    .map(([channel, value]) => `${channel.replace(/[_-]+/g, " ")}: ${value.trim()}`);
  const topGap = (topGaps[0] || "message inconsistency").toLowerCase();
  const topStrength = (topStrengths[0] || "strategic clarity").toLowerCase();
  const journeyStages: Array<{
    id: JourneyStageId;
    title: string;
    color: { border: string; bg: string; text: string; chip: string };
    objective: string;
    buyerMindset: string;
    message: string;
    proof: string;
    channels: string;
    content: string;
    cta: string;
    kpi: string;
    avoid: string;
  }> = [
    {
      id: "unaware",
      title: "Unaware",
      color: { border: "#93C5FD", bg: "#EFF6FF", text: "#1D4ED8", chip: "#DBEAFE" },
      objective: "Create problem awareness and category tension.",
      buyerMindset: `They do not yet connect ${topGap} to commercial impact.`,
      message: `${brandName} shows why active marketing still underperforms when strategy and execution are disconnected.`,
      proof: "Use benchmark stats, category trend shifts, and diagnostic signal snapshots.",
      channels: "Thought leadership social, SEO/AEO educational content, podcast/short-form POV.",
      content: "Problem-framing insight posts, contrarian articles, myth-vs-reality narratives.",
      cta: "See the hidden growth leaks",
      kpi: "Qualified reach and awareness-stage engagement rate.",
      avoid: "Do not push hard conversion offers before the problem is understood.",
    },
    {
      id: "aware",
      title: "Aware",
      color: { border: "#60A5FA", bg: "#E0F2FE", text: "#0369A1", chip: "#BAE6FD" },
      objective: "Translate awareness into strategic interest.",
      buyerMindset: "They recognize the issue and want a credible path forward.",
      message: `${brandName} provides a structured method to close ${topGap} without adding execution chaos.`,
      proof: "Use framework previews, simplified process maps, and practical implementation examples.",
      channels: "Landing pages, webinar snippets, founder email, retargeting education ads.",
      content: "Framework explainers, checklist lead magnets, short case diagnostics.",
      cta: "View the 90-day framework",
      kpi: "Lead magnet conversion rate and solution-aware click-through rate.",
      avoid: "Avoid vague capability claims without method clarity.",
    },
    {
      id: "considering",
      title: "Considering",
      color: { border: "#5CC4F5", bg: "#E8F6FE", text: "#021859", chip: "#D6EEFB" },
      objective: "Increase solution confidence and fit.",
      buyerMindset: `They compare options and evaluate whether ${brandName} fits their context.`,
      message: `${brandName} aligns ${primaryPillar.toLowerCase()} strategy with owner-ready execution to improve decision confidence.`,
      proof: "Use before/after messaging examples, priority plans, and channel sequence demonstrations.",
      channels: "Comparison pages, nurture email, live demos, pillar-specific case content.",
      content: "Use-case breakdowns, ROI narratives, implementation sequence previews.",
      cta: "Review a sample priority plan",
      kpi: "Marketing qualified lead-to-sales qualified lead progression.",
      avoid: "Do not overload with features that hide strategic differentiation.",
    },
    {
      id: "evaluating",
      title: "Evaluating",
      color: { border: "#07B0F2", bg: "#E6F7FE", text: "#021859", chip: "#B8E8FB" },
      objective: "Remove final risk and prove execution readiness.",
      buyerMindset: "They need confidence in timeline, ownership, and measurable outcomes.",
      message: `${brandName} delivers measurable movement through prioritized sequencing and clear ownership.`,
      proof: "Use KPI baselines, role ownership model, and milestone schedule examples.",
      channels: "Sales calls, proposal docs, one-page executive summaries, objection-handling emails.",
      content: "Implementation roadmap, risk-reversal messaging, governance model visuals.",
      cta: "Validate your execution plan",
      kpi: "Proposal-to-close rate and sales cycle velocity.",
      avoid: "Avoid soft language that leaves ownership ambiguous.",
    },
    {
      id: "deciding",
      title: "Deciding",
      color: { border: "#34D399", bg: "#ECFDF5", text: "#047857", chip: "#D1FAE5" },
      objective: "Drive commitment and simplify next action.",
      buyerMindset: "They are ready to move if risk and clarity are resolved.",
      message: `${brandName} is the lowest-risk, highest-clarity partner for sustained ${topStrength}.`,
      proof: "Use direct commercial impact statement, timeline to first win, and role-specific onboarding.",
      channels: "Closing call follow-ups, decision-stage email, proposal summary pages.",
      content: "Decision brief, implementation kickoff sequence, stakeholder handoff kit.",
      cta: "Start the 90-day rollout",
      kpi: "Close rate and time-to-kickoff after verbal commitment.",
      avoid: "Do not introduce new offers or conflicting options at final decision stage.",
    },
    {
      id: "retained",
      title: "Retained",
      color: { border: "#F59E0B", bg: "#FFFBEB", text: "#B45309", chip: "#FEF3C7" },
      objective: "Increase expansion, advocacy, and compounding value.",
      buyerMindset: "They expect continued strategic value and visible momentum.",
      message: `${brandName} compounds outcomes by continuously optimizing message, proof, and activation priorities.`,
      proof: "Use quarterly outcome reviews, gains by pillar, and roadmap evolution snapshots.",
      channels: "QBRs, customer newsletter, renewal narratives, referral enablement assets.",
      content: "Progress scorecards, next-phase strategy briefs, champion enablement templates.",
      cta: "Plan the next growth cycle",
      kpi: "Retention, expansion revenue, and referral contribution.",
      avoid: "Avoid static reporting that does not connect outcomes to next-phase priorities.",
    },
  ];
  const stageDurationById: Record<JourneyStageId, string> = {
    unaware: "0-3 mo",
    aware: "1-2 wks",
    considering: "2-3 wks",
    evaluating: "3-5 wks",
    deciding: "1-2 wks",
    retained: "1-2 wks",
  };
  const stageCueById: Record<JourneyStageId, string> = {
    unaware: "Diagnose hidden cost",
    aware: "Frame viable path",
    considering: "Prove fit + method",
    evaluating: "De-risk rollout",
    deciding: "Simplify commitment",
    retained: "Compound outcomes",
  };
  const buyerPersonaFingerprint = useMemo(
    () => JSON.stringify(extractBuyerPersonasRaw(data as Record<string, unknown>).slice(0, 6)),
    [data],
  );
  const reportId = asString(data.reportId);
  const foundationPersonaAtlasEntries = useMemo(() => {
    const gaps = asStringList(data.topGaps);
    const atlasTopGap = (gaps[0] || "message inconsistency").toLowerCase();
    return buildFoundationPersonaAtlasEntries({
      diagnosticData: data as Record<string, unknown>,
      businessName: brandName,
      reportId,
      topGap: atlasTopGap,
      primaryPillar,
    });
  }, [brandName, buyerPersonaFingerprint, data, primaryPillar, reportId]);
  const userEmail = asString(data.userEmail).toLowerCase();
  const tierRaw = asString(data.productTier || data.product_tier).toLowerCase();
  const normalizedTier = tierRaw.replace(/_/g, "-");
  const canPersistToWorkbook = normalizedTier === "blueprint" || normalizedTier === "blueprint-plus";
  const visualModeStorageKey =
    reportId && userEmail ? `foundation-visual-mode:${reportId}:${userEmail}` : "foundation-visual-mode";
  const densityStorageKey = reportId && userEmail ? `foundation-density:${reportId}:${userEmail}` : "foundation-density";
  const initialMode =
    asString(data.visualSystemMode) === "existing" ||
    asString(data.visualSystemMode) === "optimize" ||
    asString(data.visualSystemMode) === "refresh"
      ? (asString(data.visualSystemMode) as VisualSystemMode)
      : "optimize";
  const suiteNav = useResultsSuiteNav();
  const openSuiteTab = suiteNav?.openTab;
  const [visualSystemMode, setVisualSystemMode] = useState<VisualSystemMode>(initialMode);
  const [visualModeReady, setVisualModeReady] = useState(false);
  const [selectedJourneyStage, setSelectedJourneyStage] = useState<JourneyStageId>("considering");
  const [selectedPersonaAtlasIndex, setSelectedPersonaAtlasIndex] = useState(0);
  const [activeFoundationAnchor, setActiveFoundationAnchor] = useState("brand-story-proof");
  const [densityMode, setDensityMode] = useState<DensityMode>("comfortable");

  useEffect(() => {
    setSelectedPersonaAtlasIndex(0);
  }, [buyerPersonaFingerprint]);

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      if (typeof window !== "undefined") {
        try {
          const saved = window.localStorage.getItem(visualModeStorageKey);
          if (saved === "existing" || saved === "optimize" || saved === "refresh") {
            if (isMounted) setVisualSystemMode(saved);
            if (isMounted) setVisualModeReady(true);
            return;
          }
        } catch {
          // Ignore storage read errors.
        }
      }

      if (reportId && userEmail && canPersistToWorkbook) {
        try {
          const existingResponse = await fetch(
            `/api/workbook?reportId=${encodeURIComponent(reportId)}&email=${encodeURIComponent(userEmail)}`,
          );
          const existingPayload = existingResponse.ok ? await existingResponse.json() : null;
          const workbookMode = existingPayload?.workbook?.custom_sections?.visual_system_mode;
          if (
            isMounted &&
            (workbookMode === "existing" || workbookMode === "optimize" || workbookMode === "refresh")
          ) {
            setVisualSystemMode(workbookMode);
          }
        } catch {
          // Ignore workbook hydration errors.
        }
      }

      if (isMounted) setVisualModeReady(true);
    };

    void hydrate();
    return () => {
      isMounted = false;
    };
  }, [visualModeStorageKey, reportId, userEmail, canPersistToWorkbook]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(visualModeStorageKey, visualSystemMode);
    } catch {
      // Ignore storage write errors.
    }
  }, [visualModeStorageKey, visualSystemMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(densityStorageKey);
      if (saved === "compact" || saved === "comfortable") {
        setDensityMode(saved);
      }
    } catch {
      // Ignore storage read errors.
    }
  }, [densityStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(densityStorageKey, densityMode);
    } catch {
      // Ignore storage write errors.
    }
  }, [densityStorageKey, densityMode]);

  useEffect(() => {
    if (!visualModeReady || !reportId || !userEmail || !canPersistToWorkbook) return;
    const controller = new AbortController();
    const persist = async () => {
      try {
        const existingResponse = await fetch(
          `/api/workbook?reportId=${encodeURIComponent(reportId)}&email=${encodeURIComponent(userEmail)}`,
          { signal: controller.signal },
        );
        const existingPayload = existingResponse.ok ? await existingResponse.json() : null;
        const existingCustomSections =
          existingPayload?.workbook?.custom_sections && typeof existingPayload.workbook.custom_sections === "object"
            ? (existingPayload.workbook.custom_sections as Record<string, unknown>)
            : {};
        await fetch("/api/workbook", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            reportId,
            email: userEmail,
            updates: {
              custom_sections: {
                ...existingCustomSections,
                visual_system_mode: visualSystemMode,
              },
            },
          }),
        });
      } catch {
        // Non-blocking: local state still applies in-tab.
      }
    };
    void persist();
    return () => controller.abort();
  }, [reportId, userEmail, canPersistToWorkbook, visualSystemMode, visualModeReady]);

  useEffect(() => {
    const ids = [
      "brand-story-proof",
      "identity-purpose",
      "identity-vision",
      "identity-mission",
      "identity-values",
      "identity-personality",
      "identity-archetype",
      "identity-brand-persona",
      "identity-origin",
      "icp-persona-foundation",
      "audience-persona-atlas",
      "audience-jtbd",
      "audience-journey",
      "positioning-platform",
      "positioning-icp",
      "positioning-statement",
      "positioning-differentiators",
      "messaging-foundation",
      "messaging-value-proposition",
      "messaging-pillars",
      "messaging-vocabulary",
      "archetype-voice",
      "voice-brand-voice",
      "voice-tone-registers",
      "voice-writing-principles",
      "visual-direction",
      "foundation-90day",
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveFoundationAnchor(visible.target.id);
        }
      },
      { rootMargin: "-10% 0px -75% 0px", threshold: 0.2 },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollToAnchor(anchorId: string): void {
    const el = document.getElementById(anchorId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveFoundationAnchor(anchorId);
  }
  const visualModeLabel =
    visualSystemMode === "existing"
      ? "Use Existing Brand System"
      : visualSystemMode === "optimize"
        ? "Use Existing + Optimization Layer"
        : "Strategic Refresh";
  const visualModeSummary =
    visualSystemMode === "existing"
      ? "Preserve current brand assets and enforce consistency, accessibility, and usage discipline."
      : visualSystemMode === "optimize"
        ? "Keep core assets and add functional/UI standards to improve clarity and conversion performance."
        : "Refresh selected brand elements where current assets limit differentiation or conversion quality.";

  function buildCustomBody(sectionId: string): ReactNode | null {
    if (sectionId === "identity-personality") {
      const traitPool =
        voiceAttributes.length > 0
          ? voiceAttributes.slice(0, 4)
          : ["Strategic", "Direct", "Credible", "Action-Oriented"];
      const traitDescriptions: Record<string, string> = {
        Strategic: "Frames decisions in terms of long-term market and conversion impact.",
        Direct: "Communicates clearly without hedging or unnecessary abstraction.",
        Credible: "Grounds recommendations in evidence, mechanism, and measurable outcomes.",
        "Action-Oriented": "Ends communication with explicit next steps and ownership.",
        Clear: "Prioritizes simple language and unambiguous structure.",
        Confident: "Signals authority without overclaiming or exaggeration.",
        Practical: "Focuses on what teams can execute now with available resources.",
        Insightful: "Connects observed patterns to strategic implications.",
      };

      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <div className="rounded-md border border-brand-border bg-white p-3 mb-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">
              Personality Operating Model
            </p>
            <p className="bs-body-sm text-brand-midnight">
              Personality defines how <strong>{brandName}</strong> behaves in everyday communication.
              Archetypes define strategic character; personality governs execution quality in copy, design, and interaction.
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {traitPool.map((trait) => (
                <div key={trait} className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                  <p className="text-sm sm:text-base font-medium text-brand-blue">{trait}</p>
                  <p className="text-sm sm:text-base text-brand-midnight mt-1">
                    {traitDescriptions[trait] || "Applied consistently across messaging, visual hierarchy, and customer interactions."}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-brand-border bg-white p-3 mb-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">In Use on Key Surfaces</p>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Organic Social</p>
                <p className="text-[14px] font-semibold leading-snug text-brand-midnight mt-1">{brandName}</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1 leading-relaxed">
                  When {topGap} is silent in your story, pipeline pays for it. One proof line, one CTA—built for feeds.
                </p>
              </div>
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Paid Ad</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1 leading-relaxed">
                  Headline + one proof point + single next step. Same promise as organic—tighter for the click.
                </p>
              </div>
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Retargeting</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1 leading-relaxed">
                  “Still seeing {topGap}? Align one claim and one proof block before raising spend—then retest.”
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-[#86EFAC] bg-[#F0FDF4] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#166534]">Do This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Keep language specific and decision-led: diagnosis, implication, action.
              </p>
            </div>
            <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#B91C1C]">Not This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Avoid generic “innovative solutions” phrasing that removes ownership and proof.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "identity-archetype") {
      const primaryName = primaryArchetype || "Primary archetype";
      const secondaryName = secondaryArchetype || undefined;
      const primaryMeaning =
        getArchetypeMeaning(normalizedPrimaryArchetype) ||
        "Primary archetype defines how your brand is recognized at first impression.";
      const secondaryMeaning =
        getArchetypeMeaning(normalizedSecondaryArchetype) ||
        "Secondary archetype adds nuance to voice and execution style.";
      const primaryLabelForSamples = normalizedPrimaryArchetype || "your primary archetype";
      const foundationSnippets = extractFoundationVoiceSnippets(data as Record<string, unknown>);
      const archetypeSamples = buildArchetypeChannelSamples({
        brandName,
        market,
        primaryPillar,
        firstGap: (topGaps[0] || "cross-channel message inconsistency").toLowerCase(),
        primaryLabel: primaryLabelForSamples,
        secondaryLabel: normalizedSecondaryArchetype,
        foundation: foundationSnippets,
        voiceAttributes,
      });
      const { socialOrganic, paidAd, retargeting } = archetypeSamples;
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <div className="mb-3">
            <ArchetypeToggleCard
              brandName={brandName}
              primaryName={primaryName}
              secondaryName={secondaryName}
              primaryMeaning={primaryMeaning}
              secondaryMeaning={secondaryMeaning}
              primaryDetails={{
                strategicImplication: `${brandName} should lead with a ${primaryPillar.toLowerCase()} narrative that resolves ${(topGaps[0] || "message inconsistency").toLowerCase()}.`,
                voiceApplication: `“Here is what broke, here is what fixes it, here is who owns week one.”`,
                visualApplication: "Structured layouts: one dominant claim, proof beside it, one next step.",
                conversionRisk: "If archetype tone is abstract, buyers perceive polish but not operational confidence.",
              }}
              secondaryDetails={{
                strategicImplication: `${brandName} can apply secondary traits in campaign variation while keeping the primary signal dominant.`,
                voiceApplication: `Warmer turns in nurture and proof—still the same promise as the hero.`,
                visualApplication: "Secondary cues in supporting visuals, not in the main positioning block.",
                conversionRisk: "Overuse of secondary cues can dilute positioning clarity and message consistency.",
              }}
            />
          </div>
          <div className="rounded-md border border-brand-border bg-white p-3 mb-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">
              How The Archetypes Work Together
            </p>
            <p className="bs-body-sm text-brand-midnight">
              <span className="font-semibold text-brand-midnight">{primaryName}</span> sets the core market signal (authority, trust, and strategic clarity).
              {secondaryName ? (
                <>
                  {" "}
                  <span className="font-semibold text-brand-midnight">{secondaryName}</span> adds energy and variation in campaign formats
                </>
              ) : (
                <> Secondary archetype adds energy and variation in campaign formats</>
              )}{" "}
              without changing the core positioning.
            </p>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-brand-muted">
              Same archetype, three placements—written as it would ship.
              Channel names sit in the header row once; each column is the same height with the CTA pinned to the bottom.
            </p>
            {(() => {
              const channelShell =
                "rounded-xl border-2 border-dashed border-amber-400/75 bg-gradient-to-br from-amber-50/95 to-orange-50/40 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ring-1 ring-amber-200/50";
              const ctaMock =
                "mt-auto flex w-full shrink-0 items-center justify-center rounded-lg bg-brand-blue px-3 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm";
              const adPreviewSlug = primaryPillar
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
                .slice(0, 28);
              return (
                <div className="mt-4">
                  <div className="mb-2 hidden text-xs font-medium tracking-[0.08em] text-brand-muted md:grid md:grid-cols-3 md:gap-3">
                    <div>Organic Social</div>
                    <div>Paid Social Ad</div>
                    <div>Retargeting</div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3 md:items-stretch md:gap-3 md:[grid-auto-rows:1fr]">
                    <div className={`${channelShell} flex min-h-0 flex-col`}>
                      <p className="mb-2 text-xs font-semibold text-brand-blue md:hidden">Organic Social</p>
                      <div className="flex min-h-[248px] flex-1 flex-col rounded-lg border border-slate-200/90 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F4FE] text-xs font-semibold text-brand-blue">
                            {brandName.trim().slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-brand-midnight">{brandName}</p>
                            <p className="text-[11px] text-slate-500">Organic post preview</p>
                          </div>
                        </div>
                        <p className="mt-3 text-[15px] font-semibold leading-snug text-brand-midnight">{socialOrganic.hook}</p>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">{socialOrganic.body}</p>
                        <ArchetypeChannelPreviewCta
                          className={ctaMock}
                          tab="strategy"
                          ariaLabel="Open Strategy tab for 90-day priorities"
                          openTab={openSuiteTab}
                        >
                          {socialOrganic.cta}
                        </ArchetypeChannelPreviewCta>
                      </div>
                    </div>

                    <div className={`${channelShell} flex min-h-0 flex-col`}>
                      <p className="mb-2 text-xs font-semibold text-brand-blue md:hidden">Paid Social Ad</p>
                      <div className="flex min-h-[248px] flex-1 flex-col overflow-hidden rounded-lg border border-slate-300/90 bg-white shadow-md ring-1 ring-black/[0.04]">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2.5 py-1.5">
                          <span className="text-[10px] font-semibold tracking-wide text-slate-500">Sponsored</span>
                          <span className="max-w-[55%] truncate text-[11px] font-semibold text-slate-700">{brandName}</span>
                        </div>
                        <div className="h-[4.5rem] w-full shrink-0 bg-gradient-to-br from-slate-100 via-[#E8F4FE] to-slate-200" aria-hidden />
                        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2">
                          <p className="text-[15px] font-semibold leading-[1.25] text-[#0f172a]">{paidAd.headline}</p>
                          <p className="mt-1.5 text-[13px] leading-snug text-slate-600">{paidAd.body}</p>
                          <p className="mt-2 text-[11px] text-slate-400">
                            {adPreviewSlug ? `example.ad/${adPreviewSlug}` : "example.ad/learn-more"}
                          </p>
                          <ArchetypeChannelPreviewCta
                            className={ctaMock}
                            tab="activation"
                            ariaLabel="Open Activation tab for your 90-day plan"
                            openTab={openSuiteTab}
                          >
                            {paidAd.cta}
                          </ArchetypeChannelPreviewCta>
                        </div>
                      </div>
                    </div>

                    <div className={`${channelShell} flex min-h-0 flex-col`}>
                      <p className="mb-2 text-xs font-semibold text-brand-blue md:hidden">Retargeting</p>
                      <div className="flex min-h-[248px] flex-1 flex-col rounded-lg border border-slate-200/90 bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-semibold tracking-wide text-slate-500">Reminder ad</p>
                        <p className="mt-3 min-h-0 flex-1 font-serif text-base italic leading-relaxed text-[#1C1917]">
                          &ldquo;{retargeting.quote}&rdquo;
                        </p>
                        <ArchetypeChannelPreviewCta
                          className={ctaMock}
                          tab="results"
                          ariaLabel="Open Results tab to review diagnostic gaps"
                          openTab={openSuiteTab}
                        >
                          {retargeting.cta}
                        </ArchetypeChannelPreviewCta>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="grid gap-2 md:grid-cols-2 mt-3">
            <div className="rounded-md border border-[#86EFAC] bg-[#F0FDF4] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#166534]">Do This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Keep the primary archetype dominant in core positioning, and use secondary traits only in supporting contexts.
              </p>
            </div>
            <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#B91C1C]">Not This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Do not alternate archetypes between major sections; that creates mixed signals and weakens trust.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "identity-brand-persona") {
      const personaName = asString(data.brandPersonaName) || "Morgan";
      const personaRole =
        asString(data.brandPersonaRole) || "Operator-Advisor for growth-stage B2B teams";
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <div className="rounded-md border border-brand-border bg-white p-3 mb-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">Brand Persona Profile</p>
            <p className="text-base sm:text-lg font-semibold text-brand-blue">{personaName}</p>
            <p className="text-sm sm:text-base text-brand-midnight mt-1">{personaRole}</p>
            <p className="text-sm sm:text-base text-brand-midnight mt-2">
              Use this persona as the fastest quality filter: before publishing, ask whether this sounds like{" "}
              {personaName} giving practical guidance to {audience.toLowerCase()}.
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-emerald-300/90 bg-emerald-50/95 p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#059669]">Do This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                "Your highest-risk gap is {topGap}; here is the first implementation move and the owner."
              </p>
            </div>
            <div className="rounded-md border border-red-300/90 bg-red-50/95 p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#991B1B]">Not This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                "We offer innovative, end-to-end solutions for businesses of all sizes."
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "messaging-pillars") {
      const rows = [
        {
          pillar: topPriority?.title || `Strengthen ${primaryPillar} clarity`,
          proof: synthesisPoints[0]?.content || "Use baseline score and gap-specific proof artifacts.",
          cta: "Review 90-day priority plan",
        },
        {
          pillar: secondPriority?.title || "Increase consistency across key channels",
          proof: synthesisPoints[1]?.content || "Use one claim-proof-outcome sequence in every campaign asset.",
          cta: "Open implementation roadmap",
        },
        {
          pillar: `Convert ${primaryPillar.toLowerCase()} improvements into measurable outcomes`,
          proof: synthesisPoints[2]?.content || "Track conversion-quality movement against baseline diagnostics.",
          cta: "Prioritize next execution sprint",
        },
      ];
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-4">Pillar Application Matrix</p>
          <div className="grid gap-3">
            {rows.map((row) => (
              <div key={row.pillar} className="rounded-md border border-brand-border bg-white p-3">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Pillar Claim</p>
                <p className="bs-body-sm text-brand-midnight mt-1">{row.pillar}</p>
                <p className="text-sm sm:text-base font-medium text-brand-blue mt-2">Proof Signal</p>
                <p className="bs-body-sm text-brand-midnight mt-1">{row.proof}</p>
                <p className="text-sm sm:text-base font-medium text-brand-blue mt-2">Best Call to Action</p>
                <p className="bs-body-sm text-brand-midnight mt-1">{row.cta}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (sectionId === "positioning-statement") {
      const longForm =
        `For ${audience.toLowerCase()}, ${brandName} is the strategy-to-execution partner that improves conversion quality by aligning positioning, proof, and activation around one measurable operating model.`;
      const shortForm = `${brandName} turns brand strategy into execution that performs.`;
      const beforeLine = "We help businesses grow with innovative solutions.";
      const afterLine = `${brandName} helps ${audience.toLowerCase()} improve ${primaryPillar.toLowerCase()} performance with proof-backed execution priorities.`;
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <div className="rounded-md border border-brand-border bg-white p-3 mb-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">Positioning Hierarchy</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Long-Form Positioning</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{longForm}</p>
              </div>
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Short-Form Positioning</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{shortForm}</p>
              </div>
            </div>
          </div>
          <div className="rounded-md border border-brand-border bg-white p-3 mb-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">Before / After</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-2">
                <p className="text-xs sm:text-sm font-semibold text-[#B91C1C]">Before</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">"{beforeLine}"</p>
              </div>
              <div className="rounded-md border border-[#86EFAC] bg-[#F0FDF4] p-2">
                <p className="text-xs sm:text-sm font-semibold text-[#166534]">After</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">"{afterLine}"</p>
              </div>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-[#86EFAC] bg-[#F0FDF4] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#166534]">Do This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Keep every positioning statement tied to audience, differentiated method, and measurable business outcome.
              </p>
            </div>
            <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#B91C1C]">Not This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Do not use interchangeable category language that any competitor can plausibly claim.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "positioning-differentiators") {
      const differentiators = [
        {
          title: "Diagnostic-to-Activation Workflow",
          impact: "Reduces strategy drift between insight and execution.",
          proof: "Owner-ready plans with 30/60/90-day sequencing.",
          tone: { border: "#60A5FA", bg: "#EFF6FF", chip: "#DBEAFE", text: "#1D4ED8" },
        },
        {
          title: "Pillar-Level Prioritization",
          impact: `Focuses teams on the highest-leverage ${primaryPillar.toLowerCase()} moves first.`,
          proof: "Priority order mapped to conversion-quality outcomes.",
          tone: { border: "#34D399", bg: "#ECFDF5", chip: "#D1FAE5", text: "#047857" },
        },
        {
          title: "Integrated Delivery System",
          impact: "Keeps strategy, workbook execution, and downloadable assets aligned.",
          proof: "Consistent claim-proof-CTA logic across surfaces.",
          tone: { border: "#F59E0B", bg: "#FFFBEB", chip: "#FEF3C7", text: "#B45309" },
        },
      ];
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-4">Differentiator Evidence Matrix</p>
          <div className="grid gap-2">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="rounded-md border bg-white p-3 shadow-[0_2px_8px_rgba(2,24,89,0.05)]"
                style={{
                  borderColor: item.tone.border,
                  background: `linear-gradient(145deg, ${item.tone.bg} 0%, #FFFFFF 100%)`,
                  borderLeftWidth: 4,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm sm:text-base font-medium" style={{ color: item.tone.text }}>
                    {item.title}
                  </p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.06em]"
                    style={{ backgroundColor: item.tone.chip, color: item.tone.text }}
                  >
                    Differentiator
                  </span>
                </div>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">
                  <span className="text-brand-muted font-medium">{apStyleHeadingCase("Why it matters")}:</span>{" "}
                  {item.impact}
                </p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">
                  <span className="text-brand-muted font-medium">Proof Signal:</span> {item.proof}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (sectionId === "positioning-competitive-context") {
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-4">Competitive Position Map</p>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue">High Strategy / Low Execution</p>
              <p className="bs-body-sm text-brand-midnight mt-1">Alternatives with strong strategy narratives but weak implementation follow-through.</p>
            </div>
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue">Low Strategy / High Activity</p>
              <p className="bs-body-sm text-brand-midnight mt-1">High-output providers driving volume without positioning discipline.</p>
            </div>
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue">Low Strategy / Low Execution</p>
              <p className="bs-body-sm text-brand-midnight mt-1">Fragmented approaches with low conversion confidence and unclear ownership.</p>
            </div>
            <div className="rounded-md border border-[#07B0F2] bg-[#E8F6FE] p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue">
                Target Position: <span className="font-semibold text-brand-navy">{brandName}</span>
              </p>
              <p className="bs-body-sm text-brand-midnight mt-1">High strategy + high execution accountability with proof-backed sequencing.</p>
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "messaging-value-proposition") {
      const valueHeadline = `${brandName} helps ${audience.toLowerCase()} improve ${primaryPillar.toLowerCase()} outcomes with strategy built for execution.`;
      const beforeLine = "We provide innovative services to accelerate growth.";
      const afterLine = `${brandName} identifies your highest-impact message gap and gives your team the first implementation move this week.`;
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <div className="rounded-md border border-brand-border bg-white p-3 mb-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">Value Proposition Stack</p>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Core Outcome</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{valueHeadline}</p>
              </div>
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Mechanism</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">
                  {apStyleArrowChain(`diagnose highest-gap pillar → prioritize by impact → deploy owner-ready actions`)}
                </p>
              </div>
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Business Result</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">
                  Higher conversion-quality consistency and faster decision confidence.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-md border border-brand-border bg-white p-3 mb-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">Copy Upgrade Example</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-2">
                <p className="text-xs sm:text-sm font-semibold text-[#B91C1C]">Before</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">"{beforeLine}"</p>
              </div>
              <div className="rounded-md border border-[#86EFAC] bg-[#F0FDF4] p-2">
                <p className="text-xs sm:text-sm font-semibold text-[#166534]">After</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">"{afterLine}"</p>
              </div>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-[#86EFAC] bg-[#F0FDF4] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#166534]">Do This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Tie value language to one outcome, one mechanism, and one immediate action.
              </p>
            </div>
            <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#B91C1C]">Not This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Avoid broad “growth” language without a proof path or execution model.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "messaging-proof-library") {
      const proofRows = [
        {
          label: "Performance Baseline",
          detail: score > 0 ? `Current score baseline: ${score}/100 with pillar-level diagnostics.` : "Current score baseline with pillar-level diagnostics.",
        },
        {
          label: "Narrative Proof",
          detail: "Before/after messaging examples tied to conversion implications.",
        },
        {
          label: "Operational Proof",
          detail: "Owner, timeline, and KPI definitions attached to each strategic priority.",
        },
      ];
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-4">Proof Readiness Board</p>
          <div className="grid gap-2 md:grid-cols-3">
            {proofRows.map((row) => (
              <div key={row.label} className="rounded-md border border-brand-border bg-white p-3">
                <p className="text-sm sm:text-base font-medium text-brand-blue">{row.label}</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{row.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md border border-brand-border bg-white p-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue">Applied Example</p>
            <p className="text-sm sm:text-base text-brand-midnight mt-1">
              Claim: “We improve {primaryPillar.toLowerCase()} performance.” Proof package: baseline metric, identified leakage point,
              first 30-day action owner, and expected movement range.
            </p>
          </div>
        </div>
      );
    }

    if (sectionId === "visual-color-palette") {
      const colorSpecs = [
        {
          name: "Brand Navy",
          usage: "Primary headings, high-contrast anchors, premium surfaces",
          hex: "#021859",
          rgb: "2, 24, 89",
          cmyk: "98, 73, 0, 65",
        },
        {
          name: "Brand Blue",
          usage: "Primary accents, links, section highlights, active states",
          hex: "#07B0F2",
          rgb: "7, 176, 242",
          cmyk: "97, 27, 0, 5",
        },
        {
          name: "Brand Aqua",
          usage: "Secondary accents, supportive highlights, visual variation",
          hex: "#27CDF2",
          rgb: "39, 205, 242",
          cmyk: "84, 15, 0, 5",
        },
        {
          name: "Neutral Mist",
          usage: "Cards, separators, quiet backgrounds",
          hex: "#E0E3EA",
          rgb: "224, 227, 234",
          cmyk: "4, 3, 0, 8",
        },
      ];

      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-2">Color Specification Board</p>
          <p className="text-sm sm:text-base text-brand-midnight mb-3">
            <span className="text-brand-muted font-medium">Mode:</span> {visualModeLabel}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {colorSpecs.map((color) => (
              <div key={color.name} className="rounded-md border border-brand-border bg-white p-3">
                <div className="flex items-start gap-3">
                  <div
                    className="h-20 w-20 rounded-lg border border-brand-border shadow-sm shrink-0"
                    style={{ backgroundColor: color.hex }}
                    aria-label={`${color.name} swatch`}
                  />
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-semibold text-brand-blue">{color.name}</p>
                    <p className="text-sm sm:text-base text-brand-midnight mt-1">{color.usage}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm sm:text-base text-brand-midnight">
                        <span className="text-brand-muted font-medium">HEX:</span> {color.hex}
                      </p>
                      <p className="text-sm sm:text-base text-brand-midnight">
                        <span className="text-brand-muted font-medium">RGB:</span> {color.rgb}
                      </p>
                      <p className="text-sm sm:text-base text-brand-midnight">
                        <span className="text-brand-muted font-medium">CMYK:</span> {color.cmyk}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md border border-brand-border bg-white p-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue">Applied Example</p>
            <p className="text-sm sm:text-base text-brand-midnight mt-1">
              {visualSystemMode === "existing"
                ? "Keep current primary and secondary colors unchanged, but standardize when each appears so visual hierarchy stays consistent."
                : visualSystemMode === "optimize"
                  ? "Use Brand Navy for strategic headlines, Brand Blue for action accents, and Neutral Mist for content containers to keep dense pages readable and premium."
                  : "Retain the strongest equity color, simplify supporting colors, and re-balance contrast so key calls-to-action stand out faster."}
            </p>
          </div>
        </div>
      );
    }

    if (sectionId === "visual-typography") {
      const typeRows = [
        {
          role: "Headline",
          sample: `${brandName} Turns Strategy Into Market Momentum`,
          spec: "Lato, 700, 36/44",
          className: "text-[28px] leading-[1.2] font-bold text-brand-navy",
          usage: "Hero headlines, section openers, high-priority strategic claims.",
        },
        {
          role: "Subhead",
          sample: "A Structured Brand System That Improves Conversion Quality",
          spec: "Lato, 600, 22/30",
          className: "text-[22px] leading-[1.35] font-semibold text-brand-midnight",
          usage: "Section intros, bridge statements, and explanatory callouts.",
        },
        {
          role: "Body",
          sample:
            `${brandName} uses diagnosis-first messaging, proof-backed logic, and owner-ready action steps to keep execution consistent.`,
          spec: "Lato, 400, 16/26",
          className: "text-[16px] leading-[1.65] font-normal text-brand-midnight",
          usage: "Long-form guidance, examples, and implementation details.",
        },
      ];

      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-2">Typography Showcase</p>
          <p className="text-sm sm:text-base text-brand-midnight mb-3">
            <span className="text-brand-muted font-medium">Mode:</span> {visualModeLabel}
          </p>
          <div className="grid gap-3">
            {typeRows.map((row) => (
              <div key={row.role} className="rounded-md border border-brand-border bg-white p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue">{row.role}</p>
                  <p className="text-sm sm:text-base text-brand-muted">{row.spec}</p>
                </div>
                <p className={row.className}>{row.sample}</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-2">
                  <span className="text-brand-muted font-medium">Use:</span> {row.usage}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md border border-brand-border bg-white p-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue">Recommended Font Stack</p>
            <p className="text-sm sm:text-base text-brand-midnight mt-1">
              <span className="text-brand-muted font-medium">Primary:</span>{" "}
              {visualSystemMode === "refresh" ? "Lato (or approved brand update) for Headline, Subhead, Body" : "Lato for Headline, Subhead, Body"}
            </p>
            <p className="text-sm sm:text-base text-brand-midnight">
              <span className="text-brand-muted font-medium">Fallback:</span> system-ui, sans-serif
            </p>
          </div>
        </div>
      );
    }

    if (sectionId === "visual-iconography") {
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-4">Iconography Application Examples</p>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue mb-2">Social / ad creative row</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-border bg-[#EFF6FF] text-brand-blue">+</span>
                <p className="text-sm sm:text-base text-brand-midnight">Use 1.5px stroke line icons with consistent corner radius.</p>
              </div>
            </div>
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue mb-2">Dashboard Status</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-border bg-[#EFF6FF] text-brand-blue">i</span>
                <p className="text-sm sm:text-base text-brand-midnight">Pair icons with labels for fast scanning, never icon-only in dense sections.</p>
              </div>
            </div>
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue mb-2">CTA Support</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-border bg-[#EFF6FF] text-brand-blue">→</span>
                <p className="text-sm sm:text-base text-brand-midnight">Use icons to clarify direction/action, not as decoration.</p>
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-[#86EFAC] bg-[#F0FDF4] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#166534]">Do This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Keep one icon family, one stroke behavior, and role-based color usage across all assets.
              </p>
            </div>
            <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#B91C1C]">Not This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Avoid mixing filled and outlined icon sets or rotating icon styles between pages.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "visual-photography") {
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-4">Photography Direction Examples</p>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue">Use Example: Strategy in Action</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Real team workshop scene with framework artifacts visible, neutral grading, and clear subject focus.
              </p>
            </div>
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue">Use Example: Decision Moment</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Buyer/operator context with practical environment cues and visible implementation signals.
              </p>
            </div>
            <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3">
              <p className="text-xs sm:text-sm font-semibold text-[#B91C1C]">Avoid Example</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Generic handshake stock image with no role context, heavy filter, and low strategic relevance.
              </p>
            </div>
            <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue">Channel Example</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Paid and organic social use one high-credibility frame; landing pages use process + outcome pairs.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "visual-layout") {
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-4">Layout Execution Examples</p>
          <div className="rounded-md border border-brand-border bg-white p-3 mb-3">
            <p className="text-sm sm:text-base font-medium text-brand-blue mb-2">Recommended Page Pattern</p>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Message</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">One core claim for {brandName}.</p>
              </div>
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Proof</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">One metric or case-based validation block.</p>
              </div>
              <div className="rounded-md border border-brand-border bg-[#EFF6FF] p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Action</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">One CTA tied to {primaryPillar.toLowerCase()} priority.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-[#86EFAC] bg-[#F0FDF4] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#166534]">Do This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Keep each viewport focused on one decision and one supporting evidence layer.
              </p>
            </div>
            <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#B91C1C]">Not This</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Avoid stacking multiple CTAs and unrelated claims in the same visual block.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "visual-motion") {
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-4">Motion Behavior Examples</p>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue">Tab Transition</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                180-220ms ease-out fade/slide to clarify context change without visual noise.
              </p>
            </div>
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue">Card Reveal</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                140-180ms upward reveal on scroll for hierarchy support in dense content sections.
              </p>
            </div>
            <div className="rounded-md border border-brand-border bg-white p-3">
              <p className="text-sm sm:text-base font-medium text-brand-blue">CTA Hover</p>
              <p className="text-sm sm:text-base text-brand-midnight mt-1">
                Subtle color shift and shadow only; no bounce or elastic motion.
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#B91C1C]">Avoid Example</p>
            <p className="text-sm sm:text-base text-brand-midnight mt-1">
              Long, decorative animations that delay interaction or distract from strategic content.
            </p>
          </div>
        </div>
      );
    }

    if (sectionId === "audience-persona-atlas") {
      const atlasIdx = Math.min(
        selectedPersonaAtlasIndex,
        Math.max(0, foundationPersonaAtlasEntries.length - 1),
      );
      return (
        <PersonaAtlasSuite
          entries={foundationPersonaAtlasEntries}
          selectedIndex={atlasIdx}
          onSelectIndex={setSelectedPersonaAtlasIndex}
          leadIn="Tap a role to load goals, objections, and channel-ready messaging cues. When buyer personas are not yet in your file, sample roles illustrate the layout."
          regionLabel="Persona atlas preview"
        />
      );
    }

    if (sectionId === "audience-journey") {
      const activeStage = journeyStages.find((stage) => stage.id === selectedJourneyStage) || journeyStages[2];
      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-1">
            Interactive Buyer Journey Map
          </p>
          <p className="mb-4 text-sm text-brand-muted leading-snug max-w-3xl">
            Top row shows typical duration by stage.{" "}
            <span className="text-brand-midnight font-medium">Click a stage in the row below</span> to load the detail
            panel and playbook fields for that step.
          </p>
          <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            {journeyStages.map((stage) => (
              <div
                key={`${stage.id}-bar`}
                className="rounded-md border px-2.5 py-2.5 shadow-[0_2px_8px_rgba(2,24,89,0.05)]"
                style={{
                  borderColor: stage.color.border,
                  background: `linear-gradient(145deg, ${stage.color.bg} 0%, #FFFFFF 100%)`,
                  borderLeftWidth: 4,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs sm:text-sm font-semibold tracking-[0.08em]" style={{ color: stage.color.text }}>
                    {stage.title}
                  </p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.06em]"
                    style={{ backgroundColor: stage.color.chip, color: stage.color.text }}
                  >
                    {stageDurationById[stage.id]}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs mt-1.5" style={{ color: stage.color.text }}>
                  {stageCueById[stage.id]}
                </p>
              </div>
            ))}
          </div>
          <div
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6"
            role="group"
            aria-label="Journey stages — select one to update the detail panel below"
          >
            {journeyStages.map((stage) => (
              <button
                key={stage.id}
                type="button"
                aria-pressed={selectedJourneyStage === stage.id}
                onClick={() => setSelectedJourneyStage(stage.id)}
                className="rounded-md border px-2 py-2 text-center transition hover:border-brand-blue/45 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/35 focus-visible:ring-offset-2"
                style={{
                  borderColor: stage.color.border,
                  background:
                    selectedJourneyStage === stage.id
                      ? `linear-gradient(145deg, ${stage.color.bg} 0%, #FFFFFF 100%)`
                      : "#FFFFFF",
                  boxShadow:
                    selectedJourneyStage === stage.id
                      ? "0 0 0 2px rgba(7,176,242,0.18), 0 4px 12px rgba(2,24,89,0.06)"
                      : "0 1px 3px rgba(2,24,89,0.03)",
                }}
              >
                <p
                  className="text-xs sm:text-sm font-semibold"
                  style={{ color: selectedJourneyStage === stage.id ? stage.color.text : "#0C1526" }}
                >
                  {stage.title}
                </p>
                <p
                  className="mt-1 text-[10px] sm:text-[11px] leading-snug"
                  style={{ color: selectedJourneyStage === stage.id ? stage.color.text : "#5A6C8A" }}
                >
                  {stageCueById[stage.id]}
                </p>
              </button>
            ))}
          </div>

          <div
            className="mt-3 rounded-md border bg-white p-3"
            style={{ borderColor: activeStage.color.border, backgroundColor: activeStage.color.bg }}
            aria-live="polite"
            aria-label={`Details for ${activeStage.title} stage`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="rounded-full px-2.5 py-1 text-xs sm:text-sm font-semibold tracking-[0.08em]"
                style={{ backgroundColor: activeStage.color.chip, color: activeStage.color.text }}
              >
                {activeStage.title} Stage
              </span>
              <p className="text-sm sm:text-base font-semibold text-brand-midnight">{activeStage.objective}</p>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-md border border-brand-border bg-white p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">What they are thinking</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{activeStage.buyerMindset}</p>
              </div>
              <div className="rounded-md border border-brand-border bg-white p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">What to say</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{activeStage.message}</p>
              </div>
              <div className="rounded-md border border-brand-border bg-white p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Proof to show early</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{activeStage.proof}</p>
              </div>
              <div className="rounded-md border border-brand-border bg-white p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Best places to reach them</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{activeStage.channels}</p>
              </div>
              <div className="rounded-md border border-brand-border bg-white p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Best content type</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{activeStage.content}</p>
              </div>
              <div className="rounded-md border border-brand-border bg-white p-2">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Main Next Step</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{activeStage.cta}</p>
              </div>
            </div>

            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <div className="rounded-md border border-[#86EFAC] bg-[#F0FDF4] p-2">
                <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#166534]">How You Know This Is Working</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{activeStage.kpi}</p>
              </div>
              <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-2">
                <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-[#B91C1C]">Avoid This Move</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">{activeStage.avoid}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto rounded-md border border-brand-border bg-white">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[140px_1fr_1fr_1fr] border-b border-brand-border bg-[#F8FAFC]">
              <p className="px-3 py-2.5 text-xs sm:text-sm font-medium tracking-wide text-brand-muted">Stage</p>
              <p className="px-3 py-2.5 text-xs sm:text-sm font-medium tracking-wide text-brand-muted">What They Are Asking</p>
              <p className="px-3 py-2.5 text-xs sm:text-sm font-medium tracking-wide text-brand-muted">Where to Reach Them</p>
              <p className="px-3 py-2.5 text-xs sm:text-sm font-medium tracking-wide text-brand-muted">What Moves Them Forward</p>
              </div>
              {journeyStages.map((stage) => (
                <div key={`${stage.id}-row`} className="grid grid-cols-[140px_1fr_1fr_1fr] border-b border-brand-border last:border-b-0">
                  <div className="px-3 py-2" style={{ backgroundColor: stage.color.bg }}>
                    <p className="text-xs sm:text-sm font-semibold" style={{ color: stage.color.text }}>
                      {stage.title}
                    </p>
                  </div>
                  <p className="px-3 py-2 text-sm sm:text-base text-brand-midnight">{stage.buyerMindset}</p>
                  <p className="px-3 py-2 text-sm sm:text-base text-brand-midnight">{stage.channels}</p>
                  <p className="px-3 py-2 text-sm sm:text-base text-brand-midnight">{stage.proof}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (sectionId === "audience-objections") {
      const objectionQaPairs: Array<{ tag: string; question: string; answer: string }> = [
        {
          tag: "Fit",
          question: "Will this work for our stage?",
          answer:
            "Walk through a role-specific roadmap and timeline fit: who does what in the first 30 days, what “good” looks like for a team your size, and which milestones de-risk the investment.",
        },
        {
          tag: "Risk",
          question: "What if we invest and still miss targets?",
          answer:
            "Share baseline, milestones, and the owner accountability model—how progress is measured, when you adjust course, and what happens before budget runs out.",
        },
        {
          tag: "Proof",
          question: "How is this different from every other option we’re evaluating?",
          answer:
            "Tie the answer to diagnostic evidence and your implementation architecture—not a logo slide. Show what you already saw in their situation and how execution is sequenced.",
        },
      ];

      return (
        <div className="rounded-lg border border-brand-border/70 bg-[#F7FBFF] p-4 space-y-4">
          <div>
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-2">Objection Handling (Q&amp;A)</p>
            <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
              Pair each buyer concern with a clear answer. Use the same structure in paid ads, landing pages, and organic posts so objections don’t blur into generic talking points.
            </p>
          </div>

          <div className="space-y-3">
            {objectionQaPairs.map((pair) => (
              <div
                key={pair.tag}
                className="overflow-hidden rounded-lg border border-brand-border bg-white shadow-[0_2px_8px_rgba(2,24,89,0.06)]"
              >
                <div className="border-b border-amber-200/80 bg-gradient-to-br from-amber-50 via-amber-50/40 to-white px-4 py-3">
                  <div className="flex gap-3">
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-white text-sm font-semibold text-amber-900"
                      aria-hidden
                    >
                      Q
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium tracking-[0.08em] text-amber-900/85">{pair.tag} · Buyer Asks</p>
                      <p className="mt-1 text-[14px] font-semibold leading-snug text-brand-midnight">{pair.question}</p>
                    </div>
                  </div>
                </div>
                <div className="border-l-[3px] border-brand-blue bg-[#F0F9FF] px-4 py-3 pl-[1.15rem]">
                  <div className="flex gap-3">
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white"
                      aria-hidden
                    >
                      A
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue">{brandName} Responds</p>
                      <p className="mt-1 text-sm sm:text-base leading-relaxed text-brand-midnight">{pair.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs sm:text-sm font-medium tracking-[0.08em] text-brand-midnight mb-1">Response Sequence (Every Time)</p>
            <ol className="m-0 list-decimal space-y-1.5 pl-4 text-sm sm:text-base leading-relaxed text-brand-midnight">
              <li>Acknowledge the concern in their words.</li>
              <li>Reframe with strategic logic (why this matters before tactics).</li>
              <li>Validate with evidence (diagnostic, proof, mechanism).</li>
              <li>Advance with one concrete next step (owner + timeline).</li>
            </ol>
          </div>

          {competitiveVulnerability.implication ? (
            <div className="rounded-md border border-brand-blue/25 bg-[#F0F9FF] px-4 py-3">
              <p className="text-xs sm:text-sm font-medium tracking-[0.08em] text-brand-navy mb-1">Market-Specific Objection Cue</p>
              <p className="text-sm sm:text-base text-brand-midnight leading-relaxed">{competitiveVulnerability.implication}</p>
            </div>
          ) : null}

          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/90 px-4 py-3">
            <p className="text-xs sm:text-sm font-medium tracking-[0.08em] text-slate-600 mb-2">Sample Q&amp;A (Adapt)</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-900/90">Q</p>
                <p className="text-sm sm:text-base text-brand-midnight leading-snug">
                  If proof is the blocker, where do we start—without a six-month case study project?
                </p>
                <p className="mt-1.5 text-sm sm:text-base font-medium text-brand-blue">A</p>
                <p className="text-sm sm:text-base text-brand-midnight leading-relaxed">
                  Start with your highest-gap pillar baseline and a first 30-day owner plan—one metric, one mechanism, one accountable role—then expand proof as those numbers move.
                </p>
              </div>
              <div className="border-t border-slate-200/90 pt-3">
                <p className="text-sm sm:text-base leading-relaxed text-brand-midnight">
                  <span className="font-semibold text-brand-blue">Live demo pattern:</span> one slide pairs “If you say ___” with “We respond with ___,” then moves to your{" "}
                  {primaryPillar.toLowerCase()} execution plan.
                </p>
                <p className="mt-2 text-sm sm:text-base leading-relaxed text-brand-midnight">
                  <span className="font-semibold text-brand-blue">Campaign / landing FAQ:</span> paste three objection + answer pairs with evidence links for {audience.toLowerCase()} evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  function buildDraftForSection(sectionId: string): string[] {
    const foundationSnippets = extractFoundationVoiceSnippets(data as Record<string, unknown>);
    const commonNarrative =
      positioning ||
      `${brandName} helps ${audience.toLowerCase()} convert strategic clarity into measurable growth outcomes.`;
    const concreteStrength = topStrengths[0] || "strategic clarity";
    const concreteGap = topGaps[0] || "cross-channel message inconsistency";
    const firstChannelRoute =
      channelPlanLines[0] ||
      `Website: lead with one positioning promise and one proof-backed CTA for ${audience.toLowerCase()}.`;
    const beforeGenericLine = "We help businesses grow with innovative solutions.";
    const afterSpecificLine = `${brandName} helps ${audience.toLowerCase()} improve ${primaryPillar.toLowerCase()} performance by aligning positioning, proof, and execution priorities.`;
    const beforeSubject = "Ideas to improve your marketing";
    const afterSubject = `${brandName}: your ${primaryPillar} priority this week`;
    const firstGap = concreteGap.toLowerCase();
    const brandValueRows = extractBrandValuesFromDiagnostic(data as Record<string, unknown>);
    const executionOwner = scheduleRows.find((row) => row.owner && String(row.owner).trim())?.owner || "Assigned Owner";
    const pillarKpi =
      primaryPillar.toLowerCase().includes("visibility")
        ? "Increase qualified traffic and top-of-funnel engagement consistency over the next 90 days."
        : primaryPillar.toLowerCase().includes("conversion")
          ? "Lift conversion rate on high-intent pages and key decision journeys over the next 90 days."
          : primaryPillar.toLowerCase().includes("credibility")
            ? "Increase proof-signal density across core buyer journeys over the next 90 days."
            : primaryPillar.toLowerCase().includes("position")
              ? "Increase message recognition and offer clarity across high-intent touchpoints over the next 90 days."
              : "Improve conversion-quality consistency across key channels over the next 90 days.";
    const strategicThesis = topOpportunity || commonNarrative;

    /** One dashed “Application example” per subsection — surfaces in Put it to work with company + audience context. */
    function companyPutToWorkExampleLine(id: string): string {
      const aud = audience.toLowerCase();
      const mkt = market.toLowerCase();
      const pillar = primaryPillar.toLowerCase();
      const strength = concreteStrength.toLowerCase();
      const gap = concreteGap.toLowerCase();
      const scoreBit = score > 0 ? `${score}/100 benchmark` : "diagnostic evidence";
      switch (id) {
        case "identity-purpose":
          return `Application example: In a ${brandName} leadership sync, someone pitches a volume play—you filter it by naming one real decision from the last 90 days that was on-purpose vs off-purpose for ${aud}, using the purpose statement above.`;
        case "identity-vision":
          return `Application example: ${brandName} publishes a short LinkedIn note: “In ${mkt}, teams that win in 12 months compound ${strength}—here’s the one metric we’re moving monthly for ${aud}.”`;
        case "identity-mission":
          return `Application example: ${executionOwner} sends a weekly “how ${brandName} runs mission” note: ${apStyleArrowChain(`diagnose → prioritize → ship → review`)}, plus one ${pillar} artifact due in 14 days that ${aud} can actually see.`;
        case "identity-values":
          return `Application example: During a ${brandName} review, speed threatens proof—someone cites your values veto: two-sentence log of why the draft breaks “proof over preference” or strategic clarity, tied to ${gap}.`;
        case "identity-personality":
          return `Application example: A draft to ${aud} opens with a vague check-in—${brandName} rewrites the first line to lead with diagnosis: “Your highest-risk gap is ${firstGap}; here’s the first move this week.”`;
        case "identity-archetype":
          return `Application example: ${brandName} ships a paid ad where the primary archetype owns headline + CTA; any secondary warmth sits only in the proof line so ${aud} see one clear character in the hero.`;
        case "identity-brand-persona":
          return `Application example: ${brandName}’s organic post opens: “Here’s what we’re seeing in your diagnostic—and the first move this week”—practitioner-advisor frame, no generic hype, signed as ${brandName}.`;
        case "identity-origin":
          return `Application example: ${brandName}’s About opener becomes two short paragraphs: founding tension (${topOpportunity || "strategy vs execution split"}) + conviction, then proof—before timeline fluff competitors could copy.`;
        case "positioning-icp":
          return `Application example: ${brandName}’s team disqualifies an inbound that wants tactics without alignment—your negative ICP saves a scoping call for ${aud}-shaped fit only.`;
        case "positioning-statement":
          return foundationSnippets.positioningStatement
            ? `Application example: ${brandName}’s hero leads with your positioning line: “${clipForSample(foundationSnippets.positioningStatement, 200)}”—after a 15-minute read-aloud with someone skeptical from ${aud}.`
            : `Application example: ${brandName}’s hero swaps generic growth language for: “${afterSpecificLine}”—after a 15-minute read-aloud with someone skeptical from ${aud}.`;
        case "positioning-category":
          return `Application example: When a prospect buckets ${brandName} with generic agencies, your 20-second answer uses this category frame: judged on ${pillar} and implementation readiness, not a deliverables menu.`;
        case "positioning-differentiators":
          return `Application example: ${brandName}’s deck includes a battle slide: Column A = commodity claim rivals make; Column B = your differentiator + one dated proof artifact from this quarter.`;
        case "positioning-not":
          return `Application example: ${brandName} redlines a “we do everything” services page—each line rewrites as a ${pillar} outcome so ${aud} see the boundary, not a laundry list.`;
        case "positioning-competitive-context":
          return `Application example: After a loss on price, ${brandName} follows with one page: your counter-positioning line + link to proof of implementation sequencing—no discount-first reply.`;
        case "messaging-value-proposition":
          return `Application example: ${brandName} runs a hero A/B: current vs “${brandName} helps ${aud} improve ${pillar} outcomes…” with a proof strip using ${scoreBit}.`;
        case "messaging-pillars":
          return `Application example: ${brandName} maps “${primaryPillar}” to the live homepage hero for 30 days; ${executionOwner} keeps the one-page pillar map (claim, proof URL, last refreshed).`;
        case "messaging-proof-library":
          return `Application example: ${brandName}’s paid carousel uses a card: “${apStyleArrowChain(`Before ${firstGap} → after measurable lift → owner ${executionOwner}`)}”—pulled from the proof library you maintain.`;
        case "messaging-tagline":
          return foundationSnippets.tagline
            ? `Application example: ${brandName} standardizes on “${clipForSample(foundationSnippets.tagline, 72)}” in email footer and primary paid text; campaign slogans stay subcopy so ${aud} aren’t served competing brand lines.`
            : `Application example: ${brandName}’s email footer keeps a single master tagline; campaign slogans stay subcopy so ${aud} aren’t served three competing brand lines.`;
        case "messaging-elevator-pitch":
          return foundationSnippets.elevatorPitch
            ? `Application example: At a ${mkt} meetup, ${brandName} answers “What do you do?” with: “${clipForSample(foundationSnippets.elevatorPitch, 220)}”—same beats as your approved elevator, not company-history drift.`
            : `Application example: At a ${mkt} meetup, ${brandName} answers “What do you do?” with the 30-second alignment problem—not company history—then invites the 90-day priority conversation.`;
        case "messaging-vocabulary":
          return `Application example: Before launch, ${brandName} runs Ctrl+F on the next campaign for banned terms (“world-class,” “cutting-edge”) and swaps to approved ${pillar}-tied language.`;
        case "voice-brand-voice":
          return `Application example: ${brandName} posts: “${brandName} helps ${aud} close ${firstGap}. Diagnostic signal + owner-ready plan—book a short priority review.”—matches your voice attributes in a real channel.`;
        case "voice-tone-registers":
          return `Application example: ${brandName}’s sales email stays commercially direct (“Your top risk is ${firstGap}…”) while nurture uses the education register—same voice, different proof density for ${aud}.`;
        case "voice-writing-principles":
          return `Application example: ${brandName} restructures a long landing page so each H2 carries one claim, one proof, and one KPI anchor—nothing that can’t tie to a decision ships.`;
        case "voice-dodont":
          return `Application example: ${brandName}’s homepage hero uses the Do homepage line from above, not the Don’t generic line—paste-check against the appendix before publish.`;
        case "visual-logo-system":
          return `Application example: ${brandName} rejects a partner deck that equalizes marks on the hero—partner stays subordinate; primary lockup and clear space match your export pack.`;
        case "visual-color-palette":
          return `Application example: ${brandName}’s marketing chart uses the same insight blue and risk red tokens as the product—no one-off hex that confuses ${aud} comparing screenshots.`;
        case "visual-typography":
          return `Application example: A vendor returns ${brandName} slides in the wrong font—you send the H1–H4 + body scale screenshot and PDF preset so exports match in-app Foundation rhythm.`;
        case "visual-iconography":
          return `Application example: ${brandName}’s roadmap diagram uses one 1.5px stroke family; customer-facing PDFs drop emoji substitutes that cheapen signal with ${aud}.`;
        case "visual-photography":
          return `Application example: ${brandName} replaces handshake stock in paid social with one real ${aud} context frame + one product/UI frame from your approved mood board.`;
        case "visual-layout":
          return `Application example: ${brandName}’s mobile QA catches two H1s above the fold—you collapse to one message, one proof strip, one CTA per viewport before launch.`;
        case "visual-motion":
          return `Application example: ${brandName} caps transitions at ~200ms on strategy surfaces; no decorative bounce on dense reading views—motion only for navigation and save states.`;
        case "audience-persona-atlas":
          return `Application example: ${brandName}’s carousel ad gives the economic buyer an ROI card, the champion a rollout checklist—same offer, persona-tuned proof for ${aud}.`;
        case "audience-jtbd":
          return `Application example: ${brandName}’s webinar invite leads with the functional job (“Improve ${pillar} without fragmenting the story”) before the agenda—job before features for ${aud}.`;
        case "audience-journey":
          return `Application example: ${brandName}’s retargeting ladder matches CTA to stage (no demo ask on touch one); ${executionOwner} reviews the journey table quarterly for mismatch.`;
        case "audience-objections":
          return `Application example: When ${aud} asks “How is this different?”, ${brandName} answers with your sequence: ${apStyleArrowChain(`acknowledge → reframe with ${pillar} logic → evidence → one next step`)}, logged in the objection doc.`;
        default:
          return `Application example: ${brandName} walks ${aud} through this subsection in a working session—assign ${executionOwner} and tie the next move to ${pillar} within 14 days.`;
      }
    }

    const core = ((): string[] => {
    switch (sectionId) {
      case "identity-purpose":
        return compact([
          `Purpose statement: ${brandName} exists to help ${audience.toLowerCase()} turn brand clarity into confident, high-quality growth decisions.`,
          `Strategic thesis for ${brandName}: ${strategicThesis}`,
          `Purpose in practice at ${brandName}: every recommendation must improve ${primaryPillar.toLowerCase()} outcomes for ${audience.toLowerCase()}.`,
          topOpportunity
            ? `Load-bearing belief: ${topOpportunity}`
            : `Load-bearing belief for ${market.toLowerCase()}: clarity and consistency outperform volume and noise.`,
          `Authenticity standard: ${brandName} does not sacrifice strategic integrity for short-term vanity performance.`,
          topPriority?.title ? `Current purpose priority: ${topPriority.title}.` : null,
          revenueImpact ? `Business impact signal: ${revenueImpact}` : null,
          `Next step: Run a 30-minute purpose check with leadership—list three real decisions from the last 90 days and tag each as “on-purpose” or “off-purpose” with one sentence of evidence.`,
          `Next step: Add this purpose as the first slide or paragraph in any external narrative review (campaign brief, landing copy, major deck)—if it does not fit, the work is scoped wrong.`,
          `Use this when: a channel owner pushes for spend or volume that dilutes story—reread the purpose aloud and decide what to defer, not what to justify.`,
          `This connects to: ${topPriority?.title ? `"${topPriority.title}" only matters if it advances who you serve and the outcome this purpose promises.` : "Strategic priorities only matter if they advance who you serve and the outcome this purpose promises."}`,
        ]);
      case "identity-vision":
        return compact([
          `Vision statement: within 5-10 years, ${brandName} is the most trusted strategic authority in ${market.toLowerCase()} for ${audience.toLowerCase()}.`,
          `Future-state outcome: buyers expect proof-backed strategy with execution accountability as the default engagement model.`,
          `Strategic advantage to compound: make ${concreteStrength.toLowerCase()} the through-line in your external story—repeat it with proof in organic, paid, and landing so ${audience.toLowerCase()} files ${brandName} under that edge, not generic competence.`,
          `Constraint to remove as vision matures: ${concreteGap.toLowerCase()} is the ceiling on how credible the vision feels until it is owned and measured; treat lifting it as a sequenced program (owner, mechanism, 90-day signal), not a one-off copy tweak.`,
          topPriority?.title ? `Vision priority now: ${topPriority.title}.` : null,
          pillarDependency ? `System dependency to resolve: ${pillarDependency}` : null,
          revenueImpact ? `Commercial upside if achieved: ${revenueImpact}` : null,
          `Execution test: if this vision is true in 12 months, one measurable buyer behavior should improve (conversion rate, sales-cycle velocity, or qualified pipeline quality).`,
          `Next step: Pick one metric (e.g. qualified lead rate, sales cycle, or win rate) and write “${apStyleArrowChain(`current → 12-month target → leading indicator we will move monthly`)}” on a single page.`,
          `Next step: Socialize the vision in one internal forum and one external touch (e.g. leadership note + organic post)—same story, different depth; note where language drifted and fix the brief.`,
          `Use this when: the team debates tactics—ask which option compounds ${concreteStrength.toLowerCase()} and which only adds noise for ${audience.toLowerCase()}.`,
          `This connects to: roadmap fights shrink when ${concreteGap.toLowerCase()} is named as the cap on the vision and given an owner plus a 90-day proof point.`,
        ]);
      case "identity-mission":
        return compact([
          `Mission statement: ${brandName} translates diagnostic insight into execution-ready plans that ${audience.toLowerCase()} can run with confidence.`,
          `Mission components: diagnose precisely, prioritize by impact, and operationalize through owner-ready plans under ${executionOwner}.`,
          topPriority?.title ? `Current mission focus: ${topPriority.title}.` : null,
          secondPriority?.title ? `Secondary mission priority: ${secondPriority.title}.` : null,
          `Current mission blocker: ${concreteGap.toLowerCase()} slows mission delivery until it has a countermeasure with a named owner and weekly evidence—not a one-off workshop.`,
          `90-day performance objective: ${pillarKpi}`,
          revenueImpact ? `Expected business outcome: ${revenueImpact}` : null,
          `In use (Priority card): Every shipped priority names an owner, a timeline, and what “done” looks like.`,
          `Next step: ${executionOwner} publishes a one-page “how we run mission this quarter”: ${apStyleArrowChain(`diagnose → prioritize → ship → review`)}, with dates for the next four checkpoints.`,
          `Next step: Tie the top mission priority to one customer-visible artifact due in 14 days (page, email, or creative) so the mission is not trapped in strategy docs.`,
          `Use this when: scope creeps—if the ask does not improve ${primaryPillar.toLowerCase()} for ${audience.toLowerCase()}, it waits for the next planning cycle.`,
          `This connects to: clearing ${concreteGap.toLowerCase()} is a mission success criterion; add it to the same scoreboard as revenue or pipeline where leadership already looks weekly.`,
        ]);
      case "identity-values": {
        const fallbackValues = compact([
          `Value: Strategic clarity before scale.

Behavior
${brandName} launches campaigns only after positioning and message hierarchy are aligned for ${audience.toLowerCase()}.`,
          `Value: Proof over preference.

Behavior
${brandName} requires evidence, mechanism logic, or observable outcomes before scaling claims in ${market.toLowerCase()}.`,
          `Value: Execution ownership.

Behavior
Each ${brandName} initiative has one accountable owner and a specific timeline.`,
        ]);
        const fromReport =
          brandValueRows.length > 0
            ? brandValueRows.map((v) => {
                const desc =
                  v.description?.trim() ||
                  `How ${brandName} applies "${v.name}" when speed, budget, and quality pull in different directions.`;
                const blocks = [`Value: ${v.name}.`, `Behavior\n${desc}`];
                if (v.inAction?.trim()) blocks.push(`In practice\n${v.inAction.trim()}`);
                if (v.whyItMatters?.trim()) blocks.push(`Why it matters\n${v.whyItMatters.trim()}`);
                return blocks.join("\n\n");
              })
            : [];
        return compact([
          ...(fromReport.length > 0 ? fromReport : fallbackValues),
          `Values pressure test: when teams push for speed, protect quality by addressing "${concreteGap}" before expanding scope.`,
          secondPriority?.title ? `Decision precedence rule: when trade-offs occur, prioritize work that advances "${secondPriority.title}".` : null,
          topPriority?.title ? `Current values application focus: ${topPriority.title}.` : null,
          `Next step: Add a “values veto” line to your creative QA—one person can block publish if a draft violates a stated value; log the reason in two sentences.`,
          `Next step: Monthly 20-minute review: one win and one near-miss tied to values (speed vs proof, polish vs ship)—decide one rule to tighten next month.`,
          `Use this when: two good options conflict—score each against the top two values only; if it is a tie, default to the option that reduces ${concreteGap.toLowerCase()}.`,
        ]);
      }
      case "identity-personality":
        return compact([
          `Brand personality profile: Strategic, Direct, Credible, and Action-Oriented.`,
          `Personality is distinct from archetype; archetype informs style while personality governs everyday behavior.`,
          voiceAttributes.length > 0
            ? `Core expression traits: ${voiceAttributes.join(", ")}.`
            : `Core expression traits: clear, confident, specific, and operationally grounded.`,
          `In use (Body): "Your highest-risk gap is ${firstGap}; here is the first move this week."`,
          `In use (Social / ad frame): One headline, one proof block, one next step—nothing competes in the first screen.`,
          `In use (Social DM): "Owner: ${executionOwner}. Next: align the ad claim with the landing page. Impact: cleaner replies inside two weeks."`,
          `Writing principle: lead with diagnosis, support with proof, and close with one concrete next step.`,
          `Stress principle: guidance stays direct and constructive under pressure—no panic tone, no vague reassurance.`,
          `Next step: Build a 5-line “personality cheat sheet” (words we use / words we avoid / how we open / how we close / how we say no) and pin it in Slack or Notion where drafts start.`,
          `Next step: Audit one live email thread and one paid ad this week—highlight three phrases that match traits and two that feel generic; rewrite the two.`,
          `Use this when: an agency or freelancer drafts copy—give them the cheat sheet plus one annotated example from ${brandName} that passed your bar.`,
          `This connects to: personality is how ${audience.toLowerCase()} recognize ${brandName} under stress; if tone only holds on calm days, it is not a standard.`,
        ]);
      case "identity-archetype": {
        const dualArchetype = Boolean(normalizedPrimaryArchetype && normalizedSecondaryArchetype);
        /** Main body: synthesis without repeating the channel samples already shown in the subsection UI. */
        return compact([
          dualArchetype
            ? `How the two signals work: primary owns conversion and category framing; secondary humanizes nurture, onboarding, and recovery—never at the hero.`
            : `Single-lane signal: keep the same character across positioning, messaging, and visuals so ${audience.toLowerCase()} get one recognizable brand.`,
          `Messaging: ${dualArchetype ? "Headlines and claims stay in the primary lane; proof and story beats can lean secondary so trust builds before the ask." : "Keep every claim in the same character until the positioning chapter changes."}`,
          `Visuals: hero and brand moments carry the primary signal; ${dualArchetype ? "secondary cues belong in supporting surfaces (email, social, UI microcopy) without mixing conflicting styles." : "one visual system across surfaces."}`,
          `Differentiation: amplifies ${concreteStrength} versus generic ${market.toLowerCase()} language.`,
          `Guardrail: avoid expression patterns that reintroduce ${concreteGap}.`,
          /** Put it to work — action leads only; avoid repeating archetype names or sample copy from above. */
          `Next step: add one line to every creative brief—who owns the hero (primary lane vs secondary flavor).`,
          `Use this when: a new campaign feels off-brand but you cannot name why—check the hero against guardrails, not personal taste.`,
          `This connects to: paid ad energy should match the landing page promise—${firstGap} when they diverge.`,
          `Next step: weekly 5-minute review—one page or deck where tone drifted; fix before scaling spend.`,
          `Next step: In the next campaign brief, add a checkbox: “Hero archetype lane confirmed + secondary only in support surfaces” with initials from marketing and whoever approves spend.`,
          `Use this when: creative feels “off” but reviewers disagree—compare the hero frame to the archetype guardrails in writing, not taste (claim, proof, CTA, visual hierarchy).`,
          `This connects to: ${concreteGap.toLowerCase()} often returns when secondary flavor leaks into the hero; fixing one hero per sprint beats rewriting everything.`,
        ]);
      }
      case "identity-brand-persona":
        return compact([
          `Brand Persona Profile: Morgan, the practitioner-advisor who translates complexity into direct execution guidance.`,
          `Persona communication rule: lead with diagnosis, then action, then owner.`,
          `Persona stress behavior: under pressure, language becomes more specific and more accountable, never vague.`,
          `Persona use case: every homepage, email, and sales asset is reviewed with the question "Would this sound like Morgan?"`,
          `In use (Organic Social): "Here is what we are seeing in your diagnostic—and the first move this week."`,
          `In use (Paid Ad primary text): "You are not underinvesting in marketing—you are underwriting confusion between channels. Here is the sequence we use before spend moves."`,
          `Next step: Create a “Morgan test” doc: 6 before/after sentences from real drafts; use it in onboarding for anyone who writes customer-facing copy.`,
          `Next step: Record a 3-minute Loom walking through one customer email in Morgan’s voice—share with sales and support as the reference clip.`,
          `Use this when: a launch is rushed—default to Morgan’s stress behavior (more specific, more accountable), not shorter generic reassurance.`,
        ]);
      case "identity-origin":
        return compact([
          `Origin narrative: ${brandName} was created after repeated evidence that teams with active marketing still underperform when strategy and execution are disconnected.`,
          topOpportunity
            ? `Founding tension: ${topOpportunity}`
            : `Founding tension: high effort and low conversion quality caused by fragmented messaging and poor strategic sequencing.`,
          `Founding conviction: growth improves when positioning, proof, and activation mechanics are designed as one integrated system.`,
          `Founder quote: "We built this so teams can stop guessing and scale with strategic confidence."`,
          `In use (Profile / About): "${brandName} exists because ${topOpportunity || "strategy and execution kept splitting"}—and growth should not stay noisy or fragile for teams like yours."`,
          `In use (Retargeting ad): "Why now: ${topOpportunity || "the gap between what ads promise and what the landing page proves"}—then how ${brandName} closes it before the next budget cycle."`,
          `Next step: Rewrite your About or Profile opener to lead with founding tension + conviction (two short paragraphs), then proof—cut timeline fluff that any competitor could claim.`,
          `Next step: Add one “why we started” pull-quote to the site or deck footer team actually uses in sales conversations.`,
          `Use this when: a prospect asks “why you versus X?”—answer with founding tension and who loses if the problem stays unsolved, not feature parity.`,
        ]);
      case "positioning-icp":
        return compact([
          `Primary ideal customer profile (ICP): ${audience}.`,
          `Best-fit profile: organizations in ${market.toLowerCase()} with growth ambition, existing demand activity, and willingness to align teams around one strategic platform.`,
          topPriority?.pillar ? `Primary evaluation axis for this ICP: ${topPriority.pillar}.` : null,
          `Negative ICP: teams seeking tactical execution without strategic alignment or accountability.`,
          `Commercial fit signal: buyers who value implementation accountability over one-off deliverables.`,
          `In use (Organic Social hook): "Most ${audience} we talk to are tired of ${primaryPillar.toLowerCase()} promises that never match what their team actually ships."`,
          `In use (Fit note): Growth-stage ${market.toLowerCase()} teams with demand in motion—roles that own revenue story and cross-channel coherence.`,
          `Next step: Document 3 “good-fit” and 3 “bad-fit” signals from last quarter’s conversations—add them to the CRM picklist or brief template reps actually open.`,
          `Next step: In one working session, align sales and marketing on the single primary ICP sentence above; anything outside it is nurture or partner, not core pipeline.`,
          `Use this when: inbound volume is up but quality drops—tighten the negative ICP list first, then adjust targeting, not the whole story.`,
        ]);
      case "positioning-statement":
        return compact([
          `Long-form positioning: For ${audience.toLowerCase()}, ${brandName} is the strategy-to-execution partner that improves conversion quality by aligning positioning, proof, and activation around one measurable operating model.`,
          `Short-form positioning: ${brandName} turns brand strategy into execution that performs.`,
          `Decision criterion: if messaging does not support this position, it is revised before publication.`,
          topOpportunity ? `Primary benefit emphasis: ${topOpportunity}` : null,
          pillarDependency ? `Differentiation logic: ${pillarDependency}` : null,
          `Before line: "${beforeGenericLine}"`,
          `After line: "${afterSpecificLine}"`,
          `In use (Category frame): "We are not an agency retainer; we are a strategy-to-execution system for ${audience.toLowerCase()}."`,
          `Next step: Paste long-form and short-form positioning into the top of your messaging doc and link every new claim to one of the two—if it fits neither, cut or rewrite.`,
          `Next step: Run a 15-minute “before/after” read-aloud with a skeptical teammate using the lines above; capture two objections and add answers to the workbook.`,
          `This connects to: ${pillarDependency ? pillarDependency : "Pillar discipline"} should appear as proof in the short-form line within 90 days, not only in the long paragraph.`,
        ]);
      case "positioning-category":
        return compact([
          `Category decision: compete as a strategy-plus-execution system, not a standalone branding or campaign service.`,
          `Category framing: buyers should evaluate options by strategic precision, evidence quality, and implementation readiness.`,
          score > 0 ? `Current category narrative anchor: score ${score}/100 highlights measurable upside from consistency improvements.` : null,
          `Evaluation criteria to lead: strategic clarity, proof architecture, and conversion pathway design.`,
          `In use (Paid Ad headline): Outcomes and operating cadence—not a flat deliverables menu.`,
          `In use (Organic Social): "${brandName} — for ${market.toLowerCase()} teams that need strategy and execution in one system, not another generic agency pitch."`,
          `In use (Paid lead form): "${brandName} · Judge us on ${primaryPillar.toLowerCase()}, proof depth, and implementation readiness—then open scope."`,
          `Next step: List the three evaluation criteria on your primary offer or pricing page as subheads with one proof line each—no adjectives without evidence.`,
          `Next step: Train reps on a 20-second category answer: what you are, what you are not, and the one metric buyers should use to compare.`,
          `Use this when: a prospect buckets you with agencies—use the category frame line, then show implementation readiness (owners, cadence, deliverable shape).`,
        ]);
      case "positioning-differentiators":
        return compact([
          `Differentiator 1: proprietary diagnostic-to-activation workflow that closes the gap between analysis and implementation.`,
          `Differentiator 2: pillar-level strategic sequencing that identifies highest-leverage moves before channel spend scales.`,
          `Differentiator 3: integrated workbook and downloadable deliverables that keep strategy, execution, and governance aligned.`,
          `Outcome linkage: this model improves decision velocity, message consistency, and conversion quality in the first 90 days.`,
          competitiveVulnerability.recommendation ? `Defensibility move: ${competitiveVulnerability.recommendation}` : null,
          `In use (Comparison): "More content" is easy; ${brandName} ships priority sequencing and measurable movement.`,
          `In use (Paid campaign): Three workstreams mapped to ${primaryPillar.toLowerCase()} impact and ${concreteStrength}—not a tactic buffet.`,
          `Next step: Turn each differentiator into a “proof hook” (metric, customer quote, or process step) and assign an owner to refresh it quarterly.`,
          `Next step: Add a competitive battle slide: column A = commodity claim competitors make, column B = your differentiator + proof artifact.`,
          `This connects to: ${competitiveVulnerability.recommendation ? competitiveVulnerability.recommendation : "Defensibility is showing the workflow others skip, not claiming louder."}`,
        ]);
      case "positioning-not":
        return compact([
          `${brandName} is not a generic "full-service" provider with interchangeable language.`,
          `${brandName} is not channel-first without strategic alignment and role-level ownership.`,
          `${brandName} is not optimized for short-term activity that sacrifices message integrity.`,
          `Hard boundary: avoid any expression that reinforces ${concreteGap}.`,
          `In use (Link-in-bio / profile): Every service line ties to ${primaryPillar.toLowerCase()} outcomes—no "we do everything" without that line of sight.`,
          `Next step: Redline one public page that still sounds “full service”; rewrite services as outcomes tied to ${primaryPillar.toLowerCase()} and archive generic lists.`,
          `Use this when: RFPs force laundry lists—attach an appendix that maps each requested item to strategy-to-execution, or decline politely.`,
          `This connects to: ${concreteGap.toLowerCase()} is the symptom when “not us” boundaries are fuzzy; reinforce boundaries in sales decks, not only in brand docs.`,
        ]);
      case "positioning-competitive-context":
        return compact([
          competitiveVulnerability.summary ? `Current competitive pressure: ${competitiveVulnerability.summary}` : null,
          competitiveVulnerability.implication ? `Implication for buyer decisions: ${competitiveVulnerability.implication}` : null,
          `White-space ownership: practical strategic authority with explicit implementation sequencing.`,
          competitiveVulnerability.recommendation ? `Counter-positioning statement: ${competitiveVulnerability.recommendation}` : null,
          `In use (Paid Ad angle): When competitors lead with activity volume, we lead with proof quality and who owns the rollout.`,
          `In use (Paid social proof): ${score > 0 ? `Diagnostic ${score}/100` : "Diagnostic baseline"} plus one implementation lane only we run.`,
          `Next step: Monthly competitive scan (30 min): capture one rival headline, one proof claim, one CTA—write your counter-line and file in a shared doc with date.`,
          `Next step: Add the counter-positioning statement to the internal sales note that goes out after first discovery—same language marketing uses externally.`,
          `Use this when: you lose on price—replay the vulnerability implication and show proof of implementation sequencing, not a discount.`,
        ]);
      case "messaging-value-proposition":
        return compact([
          `Value proposition headline: ${brandName} helps ${audience.toLowerCase()} improve ${primaryPillar.toLowerCase()} outcomes with strategy built for execution.`,
          `Supporting statement: the platform diagnoses where performance is leaking, prioritizes high-impact fixes, and delivers owner-ready actions across channel and team workflows.`,
          topOpportunity ? `Primary benefit emphasis: ${topOpportunity}` : null,
          `Measurement priority: ${pillarKpi}`,
          `Memory line: clarity first, execution second, compounding growth third.`,
          `Before homepage: "${beforeGenericLine}"`,
          `After homepage: "${afterSpecificLine}"`,
          `In use (Hero subhead): "${audience} · ${primaryPillar.toLowerCase()} that holds from ad to landing page${score > 0 ? `—${score}/100 benchmark behind it` : "—diagnostic evidence behind it"}."`,
          `Next step: A/B one homepage or landing hero: current vs value-prop headline + single proof strip; run until statistical confidence or 2 weeks minimum.`,
          `Next step: Add “measurement priority” (${pillarKpi}) to the campaign dashboard row leadership sees first—not buried in a secondary tab.`,
          `This connects to: ${topOpportunity ? topOpportunity : "Your top opportunity"} should appear verbatim in at least one customer-facing block this month.`,
        ]);
      case "messaging-pillars":
        return compact([
          `Primary message pillar: ${primaryPillar}.`,
          topPriority?.title ? `Pillar Claim 1: ${topPriority.title}.` : null,
          secondPriority?.title ? `Pillar Claim 2: ${secondPriority.title}.` : null,
          `Pillar Claim 3: conversion-quality gains come from aligned positioning, proof, and CTA sequencing.`,
          `In use (Channel): ${firstChannelRoute}`,
          `In use (Landing section): One pillar, one proof (${concreteStrength}), one CTA tied to ${primaryPillar.toLowerCase()}.`,
          `Next step: Map each pillar to one “hero surface” (site section, ad set, or email series) for the next 30 days—no pillar without a live asset.`,
          `Next step: ${executionOwner} maintains a one-page pillar map: claim, proof artifact link, owner, last refreshed date.`,
          `Use this when: a new initiative appears—assign it to the pillar it strengthens; if it strengthens none, deprioritize.`,
        ]);
      case "messaging-proof-library":
        return compact([
          `Proof asset 1: current benchmark score (${score}/100) and associated pillar-level diagnostic findings.`,
          `Proof asset 2: narrative before/after examples showing message clarity and conversion implication improvements.`,
          synthesisPoints[0]?.content ? `Proof asset 3: strategic synthesis - ${synthesisPoints[0].content}` : null,
          `Proof governance: monthly review cadence with staleness checks before major campaign pushes; owner ${executionOwner}.`,
          `In use (Landing): Every claim sits next to a number, a mechanism, and one clear next step.`,
          `In use (Evidence line): Baseline, method, expected 90-day movement—stated in one tight line.`,
          `In use (Paid carousel card): "${apStyleArrowChain(`Before ${firstGap} → after measurable lift → owner ${executionOwner}`)}."`,
          `Next step: Build a proof library folder (5–8 items): benchmark, before/after copy, customer quote, methodology one-pager—each tagged to a pillar.`,
          `Next step: Calendar a monthly staleness review with ${executionOwner}; retire any proof older than 12 months without a refresh plan.`,
          `This connects to: ${synthesisPoints[0]?.content ? synthesisPoints[0].content : "Synthesis from your diagnostic"} should become at least one dated proof slide or snippet this quarter.`,
        ]);
      case "messaging-tagline":
        return compact([
          `Primary tagline: "Clarity that converts."`,
          `Alternative tagline 1: "Strategy built to perform."`,
          `Alternative tagline 2: "From brand insight to market impact."`,
          `Usage rule: apply in high-signal brand contexts (cover pages, headers, strategic decks), not repetitive CTA microcopy.`,
          `In use (Paid Ad brand line): "Clarity that converts."`,
          `In use (Profile tagline): "Clarity that converts" · ${score > 0 ? `${score}/100 benchmark` : "diagnostic-backed plan"} for ${audience.toLowerCase()}.`,
          `In use (Ad): Clarity that converts — for ${audience.toLowerCase()}, ${primaryPillar.toLowerCase()} that performs.`,
          `Next step: Add tagline usage rules to your design checklist: max line length, never stacked with a second slogan, never on busy photography without a solid scrim.`,
          `Next step: Audit where the primary tagline appears (site header, email footer, deck cover); remove duplicate taglines so one line carries the brand.`,
          `Use this when: a designer proposes a new campaign slogan—decide if it replaces the master tagline for the flight or sits as subcopy only.`,
        ]);
      case "messaging-elevator-pitch":
        return compact([
          `30-second pitch: "Most ${market.toLowerCase()} teams don't have an activity problem - they have an alignment problem. ${brandName} fixes that by turning strategic clarity into execution that converts."`,
          `60-second pitch: "${commonNarrative} We diagnose the highest-impact gaps, align your message architecture, and deliver owner-ready actions your team can execute now."`,
          `90-second close: "The result is stronger conversion quality, less wasted spend, and a repeatable system your team can scale with confidence."`,
          `Conversion prompt: "Would it be useful to review your highest-impact 90-day priority and owner plan together?"`,
          `In use (Open): "If your team is active but still underperforming, the issue is usually message-to-execution misalignment."`,
          `In use (Organic Social comment): "We fix ${firstGap} for ${market.toLowerCase()} teams like yours—happy to share one example."`,
          `In use (Ad landing CTA): "${commonNarrative}"`,
          `Next step: Drills: record yourself delivering 30s / 60s / 90s once a week for a month; trim one vague phrase every pass.`,
          `Next step: Add the conversion prompt as the last slide in any first-call deck and practice the exact handoff to calendar.`,
          `Use this when: someone asks “what do you do?” at an event—lead with the 30-second alignment problem, not the company history.`,
        ]);
      case "messaging-vocabulary":
        return compact([
          `Owned terms: WunderBrand Score™, Brand Pillar Analysis, Implementation Readiness, Conversion Path.`,
          `Preferred words: strategic clarity, proof-backed, execution-ready, conversion quality, prioritized sequencing.`,
          `Words to avoid: "best-in-class," "cutting-edge," "world-class," and vague innovation claims without evidence.`,
          `Style rule: concise, specific, practical word choice across every channel.`,
          `In use (Rewrite): "Increase conversion-quality consistency" instead of "optimize growth."`,
          `In use (Style guide block): Five words to avoid, five approved swaps for ${audience.toLowerCase()}—checked before publish.`,
          `In use (Hero scan): No hits from the avoid list; preferred terms tie to ${primaryPillar.toLowerCase()}.`,
          `Next step: Create a living “banned / preferred” table in the workbook; run a Ctrl+F pass on the next three outbound campaigns before launch.`,
          `Next step: Assign a copy steward (can be ${executionOwner}) to approve net-new coined terms before they appear in paid creative.`,
          `This connects to: vocabulary drift feeds ${concreteGap.toLowerCase()}; tighten terms before you add channels.`,
        ]);
      case "voice-brand-voice":
        return compact([
          `Voice baseline (archetype-informed): ${archetypePair || "authority-led and practically focused"}—how ${brandName} sounds must match how the brand character shows up, not a generic "marketing voice."`,
          voiceAttributes.length > 0 ? `Voice attributes in active use: ${voiceAttributes.join(", ")}.` : `Voice attributes in active use: clear, confident, practical, insightful.`,
          normalizedPrimaryArchetype && normalizedSecondaryArchetype
            ? `Archetype × voice: ${normalizedPrimaryArchetype} sets the decisive spine (what we say first); ${normalizedSecondaryArchetype} sets approachability (how we say it) so ${audience.toLowerCase()} get both conviction and trust.`
            : `Voice is the audible form of your archetype—same character in organic social, paid creative, and product UI.`,
          `Voice execution rule: every customer-facing block includes one decision, one reason, and one next action.`,
          `Stress-test behavior: when stakes increase, tone stays calm, specific, and accountable—never frantic or vague.`,
          `In use (Organic Social): "${brandName} helps ${audience.toLowerCase()} close ${firstGap}. Diagnostic signal and owner-ready plan on request—book a short priority review."`,
          `In use (Paid Ad secondary text): "We start where ${firstGap} is costing you—which maps straight to ${primaryPillar.toLowerCase()}."`,
          `In use (Product): "Something went wrong—here is the fix and who owns the next step." Same steady voice as marketing, not playful disclaimers.`,
          `Next step: Add voice attributes (${voiceAttributes.length > 0 ? voiceAttributes.join(", ") : "clear, confident, practical"}) to the creative brief header as non-optional fields.`,
          `Next step: Review one support macro and one billing email this week—rewrite any line that breaks the steady-voice rule.`,
          `Use this when: AI drafts sound generic—inject one archetype-informed constraint (“say the risk out loud,” “name the owner”) before regenerating.`,
        ]);
      case "voice-tone-registers":
        return compact([
          `How registers map to archetype: thought leadership carries the "expert" spine; sales carries the "decision" spine; education carries the "guide" spine—all still recognizably ${brandName}.`,
          `Thought leadership register: insight-led, evidence-backed, perspective-forward—use when ${audience.toLowerCase()} are still forming the problem.`,
          `Sales register: concise, commercially focused, objection-aware—use when budget and timing are on the table.`,
          `Educational register: structured, plain-language, implementation-oriented—use for onboarding and how-to.`,
          `Support register: clear, reassuring, solution-focused with explicit ownership—use when something broke or stalled.`,
          `Switching registers: same voice, different job—do not change personality between registers; only change density, proof level, and urgency.`,
          `Do (Sales): "Your top risk is ${firstGap}; here is the first action to reduce it this week."`,
          `Don't (Sales): "Let's discuss various opportunities to potentially improve outcomes."`,
          `In use (Retargeting sequence): Plain-language steps ${audience.toLowerCase()} can run this week—same personality, lighter proof density.`,
          `In use (Paid lead nurture): Budget, timeline, and one recommended sequence—calm, specific, commercially direct.`,
          `Next step: Tag five live assets by register (TL / sales / edu / support); fix any file missing a register label in the CMS or DAM.`,
          `Next step: Write a one-page “register switch” guide: same claim in four densities—publish internally for sales + CS.`,
          `This connects to: register drift shows up as ${concreteGap.toLowerCase()} in customer experience; QA by journey stage, not only by channel.`,
        ]);
      case "voice-writing-principles":
        return compact([
          `Writing principle 1: lead with a strategic claim before detail.`,
          `Writing principle 2: use short, high-signal paragraphs and avoid stacked abstractions.`,
          `Writing principle 3: pair every claim with proof, mechanism, or measurable implication.`,
          `Writing principle 4: remove language patterns that reintroduce ${concreteGap}.`,
          `Editorial QA rule: if a paragraph cannot be linked to a decision or KPI, it is rewritten.`,
          `Before paragraph: "${beforeGenericLine}"`,
          `After paragraph: "${afterSpecificLine}"`,
          `In use (Rewrite): "Increase qualified traffic by tightening message consistency" instead of "improve visibility."`,
          `In use (Organic Social thread): Headline claim, proof paragraph, CTA—no stacked abstractions without a KPI anchor.`,
          `In use (Organic carousel): Four short cards max for ${market.toLowerCase()} feeds; longer drafts get split or cut.`,
          `Next step: Add the editorial QA rule to your publish checklist: every block links to a decision or KPI or it does not ship.`,
          `Next step: Pick two long pages; split into sections with H2s that each carry one claim + one proof + one action.`,
          `Use this when: a draft stacks adjectives—replace with mechanism + number + owner.`,
        ]);
      case "voice-dodont":
        return compact([
          `Do (homepage): "We pinpoint where your brand is leaking conversion and give your team a 90-day execution plan."`,
          `Don't (homepage): "We empower businesses with innovative growth solutions."`,
          `Do (email): "Your priority this month is ${topOpportunity || "message consistency"}; here is the first move to execute this week."`,
          `Don't (email): "Just checking in to share a few marketing thoughts."`,
          `Before subject: "${beforeSubject}"`,
          `After subject: "${afterSubject}"`,
          `Next step: Paste the Do/Don’t homepage and email pairs into your style guide appendix and link from the CMS required-reading list.`,
          `Next step: Run a 10-minute subject-line review on the last five sends—flag vague check-ins; rewrite using the after subject pattern.`,
          `This connects to: homepage and email Do lines should match ${primaryPillar.toLowerCase()} proof on the page they point to.`,
        ]);
      case "visual-logo-system":
        return compact([
          visualSystemMode === "existing"
            ? `Logo policy: preserve current approved logo assets and lockups as-is.`
            : visualSystemMode === "optimize"
              ? `Logo policy: keep current logo system and improve usage consistency across app and exports.`
              : `Logo policy: evaluate selective refinements only if current logo expression limits legibility or premium signal.`,
          `Clear-space and legibility are enforced across app surfaces and all downloadable outputs.`,
          `Approved assets only: no generated alternatives or unapproved logo variants.`,
          `Co-branding pattern: keep partner marks subordinate to the primary brand hierarchy.`,
          `In use (Partner deck): Primary lockup on slide 1 and footer; partner marks cap at 60% width of ours and never sit on the hero.`,
          `In use (Web header): SVG master only—no stretched raster or off-palette fills.`,
          `Next step: Export logo lockups with clear-space marks and approve/disapprove examples for social avatars, email headers, and deck title slides.`,
          `Next step: Store masters in a shared folder with “do not outline fonts” and raster export presets for paid specs your media team requests.`,
          `Use this when: partners or events need cobranding—enforce subordinate placement and contrast checks before approving files.`,
        ]);
      case "visual-color-palette":
        return compact([
          visualSystemMode === "existing"
            ? `Color system default: preserve existing brand palette and formalize approved combinations.`
            : visualSystemMode === "optimize"
              ? `Color system default: keep current palette and add functional/UI tokens for clarity and accessibility.`
              : `Color system default: refresh supporting palette roles while preserving highest-equity brand anchors.`,
          `Semantic mapping: green=progress, amber=caution, red=risk, blue=insight/action.`,
          `Accessibility baseline: all primary text and UI pairings target WCAG AA or higher.`,
          `Specification standard: HEX, RGB, and CMYK values are included in deliverable exports.`,
          `In use (Dashboard): Insight and action on brand blue; risk on system red—no one-off hex on ${audience.toLowerCase()}-facing charts.`,
          `In use (Print handoff): Same primary/secondary as the app; vendor sheet lists CMYK values.`,
          `Next step: Build a one-page color token sheet (HEX + RGB + semantic role) and link it from Figma or your design repo as the single source.`,
          `Next step: Run contrast checks on primary text + background pairs used in email and ads; fix any pair below WCAG AA before the next send.`,
          `This connects to: “insight/action blue” and “risk red” should match between product charts and marketing graphics—no one-off campaign hex.`,
        ]);
      case "visual-typography":
        return compact([
          visualSystemMode === "existing"
            ? `Typography default: preserve current type family and enforce hierarchy consistency by role.`
            : visualSystemMode === "optimize"
              ? `Typography default: keep current font family and tighten scale/weight rules for readability and conversion clarity.`
              : `Typography default: refresh role typography only where current system weakens hierarchy or perceived quality.`,
          `Scale system: fixed H1-H4 and body tiers to preserve hierarchy across app and PDF.`,
          `Weight usage: restrained and consistent to avoid visual noise in dense strategic documents.`,
          `Fallback stack is defined for reliable browser and export rendering.`,
          `In use (Report PDF): Section titles at H1, subheads at H2, body at 11 pt—same rhythm as in-app Foundation.`,
          `In use (Ad landing page): Two weights plus one accent weight for CTAs—no extra display styles.`,
          `Next step: Document H1–H4 + body + caption sizes for web, email, and PDF; add two real screenshots marked with “correct” hierarchy.`,
          `Next step: Remove orphan font weights from templates—if a weight is not in the scale, delete it from the kit.`,
          `Use this when: a contractor ships a deck in a different font—provide the fallback stack and a branded PDF export preset.`,
        ]);
      case "visual-iconography":
        return compact([
          `Iconography default: single-family modern line icons aligned with wunderbardigital.com standards.`,
          `Usage model: icons support structure and meaning, not decoration.`,
          `Priority placement: archetype, journey, funnel, and framework sections where visual cues increase comprehension.`,
          `Consistency rule: avoid mixed icon styles and emoji substitutions.`,
          `In use (Diagrams): One line-icon family, 1.5px stroke; decoration drops if it does not label a step.`,
          `In use (Nav): Icons only where they speed scanning—downloads, workbook—not on every label.`,
          `Next step: Purge mixed icon packs from the last year’s decks; replace with one approved stroke family at 1.5px.`,
          `Next step: Add an “icon or no icon” rule to templates: max one icon per section header unless it labels a step in a diagram.`,
          `This connects to: emoji-as-icons erode premium signal for ${audience.toLowerCase()}—ban them in customer-facing PDFs.`,
        ]);
      case "visual-photography":
        return compact([
          `Photography direction: premium, modern, and context-realistic for ${audience.toLowerCase()}.`,
          `Mood profile: trusted authority with practical momentum, aligned to ${archetypePair || "archetype expression"}.`,
          `People and environment: candid, role-relevant scenarios over staged stock poses.`,
          `Mood-board references are embedded in standards deliverables for production consistency.`,
          `In use (Ad / social creative): One real ${audience.toLowerCase()} context frame plus one product UI frame—no generic handshake stock.`,
          `In use (Social): Same trusted-modern grade and palette as the main site.`,
          `Next step: Create a 6-image mood board with “approve / reject” captions tied to ${archetypePair || "your archetype"}; share with anyone commissioning shoots.`,
          `Next step: For the next shoot brief, require one real environment frame and one product/UI frame—no generic handshake stock.`,
          `Use this when: paid social performance drops—swap creative before copy; check if imagery broke trust (staged, off-palette, off-archetype).`,
        ]);
      case "visual-layout":
        return compact([
          `Layout system: one strategic message block, one proof block, and one action block per section.`,
          `Spacing system: generous section rhythm and card segmentation for easier scanning.`,
          `Hierarchy model: one dominant idea per viewport with immediate supporting evidence.`,
          `Cross-surface parity: UI and PDFs retain the same content rhythm and visual logic.`,
          `In use (Landing / long-scroll): One message card, one proof card, one CTA per scroll depth—no three competing claims in one viewport.`,
          `In use (Mobile): Same order as desktop—message, proof, action.`,
          `Next step: Template one landing section as message + proof + action blocks; duplicate before writing net-new layouts.`,
          `Next step: Mobile QA pass on the three highest-traffic pages—screenshot above-the-fold; fix any competing H1 or dual CTAs.`,
          `This connects to: ${concreteGap.toLowerCase()} shows up as layout noise—one dominant idea per viewport before adding proof.`,
        ]);
      case "visual-motion":
        return compact([
          `Motion profile: restrained, confident, and utility-first.`,
          `Transition use: clarify navigation, section changes, and save states - never decorative distraction.`,
          `Timing pattern: short, consistent transitions across tabs, menus, and interactive modules.`,
          `Performance rule: motion cannot reduce readability or perceived speed.`,
          `In use (Tabs): 150–200ms ease; skeleton pulse stays subtle—no bounce on strategy reading surfaces.`,
          `In use (Save toast): Short fade in and out—no confetti competing with the confirmation.`,
          `Next step: Disable decorative motion on dense reading views (Foundation, long articles); keep motion for navigation and save states only.`,
          `Next step: Set a max transition duration (e.g. 200ms) in your component library tokens and lint PRs that exceed it.`,
          `Use this when: stakeholders ask for “delight”—redirect to faster comprehension (skeleton, focus states) before animation flourishes.`,
        ]);
      case "audience-persona-atlas":
        return compact([
          `Audience hierarchy: primary=${audience}; secondary=${secondaryAudience}; tertiary=${tertiaryAudience}.`,
          `Persona 1 - Economic buyer: prioritizes ROI certainty, risk control, and strategic defensibility.`,
          `Persona 2 - Functional champion: prioritizes implementation clarity, role ownership, and execution speed.`,
          `Persona 3 - Stakeholder influencer: prioritizes consistency, governance, and cross-team adoption.`,
          topPriority?.title ? `Primary buying narrative: ${topPriority.title}.` : null,
          `In use (Paid carousel ad): Economic, champion, and influencer each get one card—trigger line, proof, call to action (CTA) tuned to ${audience.toLowerCase()}.`,
          `In use (Retargeting): ROI proof for economic buyers; checklist rollout for champions—parallel tracks.`,
          `Next step: For each persona, write one “day in the life” paragraph + top 3 objections + preferred proof format—store next to CRM stage definitions.`,
          `Next step: Tag five recent wins by persona type; pull one quote per type for the next landing refresh.`,
          `This connects to: ${topPriority?.title ? `"${topPriority.title}" should name which persona it moves first.` : "Priorities should name which persona they move first."}`,
        ]);
      case "audience-jtbd":
        return compact([
          `Functional job to be done (JTBD): improve ${primaryPillar.toLowerCase()} performance while maintaining cross-channel brand consistency.`,
          `Emotional job to be done (JTBD): increase confidence in strategy decisions and reduce anxiety around execution quality.`,
          `Social job to be done (JTBD): be recognized internally as the team that turns strategy into measurable business outcomes.`,
          `Current workaround being replaced: fragmented messaging and ad hoc campaign execution.`,
          `In use (Lead magnet / webinar): "Rank the job—functional, emotional, social—we will map ${primaryPillar.toLowerCase()} work to what wins first."`,
          `In use (Social hook): The job-to-be-done headline lands before features or methodology.`,
          `Next step: Workshop (45 min): for each JTBD lens, list the workaround buyers use today and the “firing” trigger that would make them switch to ${brandName}.`,
          `Next step: Add jobs-to-be-done (JTBD) language to one nurture email subject line A/B this month—functional vs emotional framing.`,
          `Use this when: product wants feature-first copy—flip to job headline, then map features as proof of job completion.`,
        ]);
      case "audience-journey":
        return compact([
          `Journey Model: unaware -> aware -> considering -> evaluating -> deciding -> retained/expanded.`,
          scheduleRows.length > 0
            ? `Execution Alignment: ${scheduleRows.length} scheduled actions are already mapped to journey progression.`
            : `Execution Alignment: Journey stages are mapped to campaign sequencing and stage-exit CTAs.`,
          `Primary Conversion Route: ${firstChannelRoute}`,
          `Audience Sequencing: primary sees conversion outcome first; secondary gets implementation detail; tertiary gets risk/ROI validation.`,
          `In use (Considering → Evaluating): "See how teams like yours proved ${primaryPillar.toLowerCase()} gains before expanding spend."`,
          `Decision-stage KPI: increase conversion confidence through one proof-rich call to action (CTA) pathway per ideal customer profile (ICP) tier.`,
          `In use (Retargeting email): One touch per stage from awareness through evaluation—call to action (CTA) matches readiness, not a hard ask in the first touch.`,
          `In use (Retargeting touch): Proof depth follows where they are on ${firstChannelRoute.split(":")[0] || "the funnel"}—same story, stage-appropriate detail.`,
          `Next step: Map one proof asset and one call to action (CTA) to each journey stage in a table; highlight any stage with no asset—fill that gap first.`,
          `Next step: ${executionOwner} reviews journey CTAs quarterly to remove stage-mismatch asks (e.g. demo ask on first touch).`,
          `This connects to: scheduled actions ${scheduleRows.length > 0 ? `(${scheduleRows.length} in your plan)` : "in your activation plan"} should line up to stage exits, not random calendar density.`,
        ]);
      case "audience-objections":
        /* Main Q&A UI: buildCustomBody("audience-objections"). These lines power Put it to work only. */
        return compact([
          `Next step: Maintain a living objection log (10+ rows): objection, stage, owner, approved answer link, last used date—review monthly with sales and CS.`,
          `Next step: Add the four-step response sequence (${apStyleArrowChain(`acknowledge → reframe → evidence → advance`)}) as a required footer on talk tracks and battlecards.`,
          `Use this when: a deal stalls on the same question twice—promote that objection to a formal FAQ block on the site or in nurture with a proof asset.`,
          `This connects to: ${competitiveVulnerability.implication ? competitiveVulnerability.implication : "Market pressure"} should map to at least one named objection and counter-proof this quarter.`,
        ]);
      default:
        return compact([`${brandName} foundation content is populated and executable as-is from current diagnostic analysis.`]);
    }
    })();
    return [...core, companyPutToWorkExampleLine(sectionId)];
  }

  const identitySubsections: Subsection[] = [
    {
      id: "identity-purpose",
      title: "1.1 Brand Purpose",
      whatItIs:
        "Declarative purpose copy — why this organization merits existing beyond transactions. Competitors in " +
        market +
        " should not be able to reuse it. This is **the articulation** (beliefs, stakes, who you serve), not a list of marketing tasks like \"unify messaging\" or \"improve visibility\" (those belong in execution sections).",
      contentRequirements: [
        "Opening anchor: who you serve and the meaningful outcome or relief they gain (\"We exist to…\" / \"Our reason for being is…\").",
        "Tension from the diagnostic: why this purpose matters in their market or customer reality (not \"you should fix your brand\").",
        "Identity grounding: what the business stands for or delivers, stated as fact of who they are — not a roadmap.",
        "Tradeoff principle: one sentence on what you protect first when two good options conflict (values-level).",
        "Not prescriptive: no imperatives to the client, no channel or funnel to-dos here.",
        "Distinct from mission, brand promise, positioning, and strategic action plan.",
      ],
    },
    {
      id: "identity-vision",
      title: "1.2 Brand Vision",
      whatItIs:
        "Define the external future state this brand is building toward over a 5-10 year horizon. Vision should describe what changes for buyers and the category, not internal growth targets.",
      contentRequirements: [
        "One vision statement (1-2 sentences, future-facing).",
        "Paragraph describing what the market looks like if the vision is achieved.",
        "Explicit time horizon: 5 years, 10 years, or generational.",
      ],
    },
    {
      id: "identity-mission",
      title: "1.3 Brand Mission",
      whatItIs:
        "Define what " +
        brandName +
        " does repeatedly to move from current reality to the vision state: core activity, for whom, and what measurable impact it should create.",
      contentRequirements: [
        "Mission statement (1-2 sentences, present tense, action-led).",
        "Breakout of activity, audience, and impact components.",
        "Mission-to-vision alignment test with rationale.",
      ],
    },
    {
      id: "identity-values",
      title: "1.4 Core Values",
      whatItIs:
        "Document the 3-5 behavioral standards that actually govern decisions today. Values must be evidence-backed, with explicit examples of what each value permits and prohibits.",
      contentRequirements: [
        "3-5 values with definition, in-practice examples, and what each value rules out.",
        "Load-bearing value called out with rationale.",
        "Conflict rule for value trade-offs when values are in tension.",
      ],
    },
    {
      id: "identity-personality",
      title: "1.5 Brand Personality",
      whatItIs:
        "Define 4-5 human characteristics as clear is/is-not standards so writers, designers, and operators express the same character across channels.",
      contentRequirements: [
        "4-5 personality traits with explicit is/is-not definitions.",
        "Per trait examples across copy, visual expression, and customer interaction.",
        "Stress-test behavior for criticism, mistakes, and wins.",
      ],
    },
    {
      id: "identity-archetype",
      title: "1.6 Brand Archetype",
      whatItIs:
        "Anchor expression in a primary + shadow archetype. Current working signal: " +
        (archetypePair || "Archetype pair pending") +
        ". Selection must define strategic implications across positioning, messaging, and visuals.",
      contentRequirements: [
        "Primary and shadow archetype with rationale.",
        "Full profile: desire, goal, fear, strategy, gift, and trap.",
        "Paste-ready samples (finished copy, not tasks): organic social post, paid ad, retargeting line—each showing the archetype in use.",
        "Competitor archetype mapping (min 3 competitors).",
      ],
    },
    {
      id: "identity-brand-persona",
      title: "1.7 Brand Persona",
      whatItIs:
        "Define the person your brand sounds like in real customer conversations so teams execute consistent voice and judgment.",
      contentRequirements: [
        "Persona profile with role, worldview, and communication style.",
        "Do This / Not This Examples in Brand Voice.",
        "Stress-test behavior for criticism, urgency, and decision moments.",
      ],
    },
    {
      id: "identity-origin",
      title: "1.8 Brand Origin / Founding Story",
      whatItIs:
        "Develop an authentic narrative with a specific frustration moment, conviction, risk, and early proof so the brand story builds trust and memorability.",
      contentRequirements: [
        "Long-form origin narrative (500-800 words) in brand voice.",
        "Short-form origin narrative (100-150 words) and one-line origin hook.",
        "Founder quote and specific founder problem moment.",
      ],
    },
  ];

  const positioningSubsections: Subsection[] = [
    {
      id: "positioning-icp",
      title: "2.1 Ideal Customer Profile (ICP) Definition",
      whatItIs:
        "Specify the exact ideal customer profile (ICP)—company profile and buying roles—where this solution produces highest conversion and retention. Current priority audience: " +
        audience +
        ".",
      contentRequirements: [
        "Full firmographic and psychographic spec.",
        "Minimum 5 trigger events and minimum 3 negative ICP exclusions.",
        "Human narrative paragraph describing the ideal client.",
      ],
    },
    {
      id: "positioning-statement",
      title: "2.2 Brand Positioning Statement",
      whatItIs:
        "Construct the strategic north star statement: for who, category frame, primary benefit, differentiator, and reason-to-believe.",
      contentRequirements: [
        "Long-form positioning statement and one-line distillation.",
        "Variant per active ICP tier with rationale for each component.",
        "Competitive tension and defensibility analysis plus sign-off record.",
      ],
    },
    {
      id: "positioning-category",
      title: "2.3 Category Definition",
      whatItIs:
        "Decide whether to compete, redefine, or create category territory and set evaluation criteria that aligns with brand strengths.",
      contentRequirements: [
        "Category strategy choice with rationale.",
        "Category name, description, and 4-6 buyer evaluation criteria.",
        "Category growth evidence and specific role in category.",
      ],
    },
    {
      id: "positioning-differentiators",
      title: "2.4 Key Differentiators",
      whatItIs:
        "Document 3-5 defensible reasons this brand wins against alternatives, mapped to buyer relevance and evidence.",
      contentRequirements: [
        "Each differentiator includes claim, type, evidence, ICP relevance, and competitor status.",
        "Claims vs differentiators vs table-stakes matrix.",
        "Hierarchy of which differentiator to lead with by ICP tier.",
      ],
    },
    {
      id: "positioning-not",
      title: "2.5 What the Brand Is Not",
      whatItIs:
        "Set explicit strategic boundaries to prevent dilution. These exclusions protect audience focus, offer scope, tone, and category association.",
      contentRequirements: [
        "Minimum 5 explicit is-not statements, each with rationale.",
        "For each exclusion: what positioning element it protects.",
        "Handling guidance when prospects push against exclusions.",
      ],
    },
    {
      id: "positioning-competitive-context",
      title: "2.6 Competitive Context",
      whatItIs:
        "Assess direct, indirect, and substitute competition with honest strength/weakness analysis and white-space mapping.",
      contentRequirements: [
        "Competitor list with direct/indirect/substitute classification.",
        "Perceptual map on two buyer-critical axes.",
        "White-space narrative and switching story for top competitors.",
      ],
    },
  ];

  const messagingSubsections: Subsection[] = [
    {
      id: "messaging-value-proposition",
      title: "3.1 Core Value Proposition",
      whatItIs:
        "Define the single most important buyer outcome this brand should be known for, then adapt phrasing by ICP without changing core meaning.",
      contentRequirements: [
        "Headline value proposition plus 2-3 sentence support layer.",
        "ICP-specific headline variants.",
        "One-thing memory line (if buyer remembers one sentence).",
      ],
    },
    {
      id: "messaging-pillars",
      title: "3.2 Message Pillars",
      whatItIs:
        "Establish 3-5 strategic message territories; current emphasis should prioritize " +
        primaryPillar +
        " while preserving full-funnel narrative balance.",
      contentRequirements: [
        "Each pillar includes claim, ICP relevance, proof points, and RTB.",
        "Pillar hierarchy with ICP relevance matrix.",
        "Channel expression mapping for thought leadership, paid, sales, and nurture.",
      ],
    },
    {
      id: "messaging-proof-library",
      title: "3.3 Proof Point Library",
      whatItIs:
        "Create the approved evidence system so every claim can be supported by current, source-validated proof.",
      contentRequirements: [
        "Minimum 10 proof points organized by pillar.",
        "Each proof includes source, date, approved use context, and ICP applicability.",
        "Governance owner and proof staleness policy.",
      ],
    },
    {
      id: "messaging-tagline",
      title: "3.4 Tagline",
      whatItIs:
        "Develop the shortest durable articulation of positioning and personality that remains ownable and memorable across contexts.",
      contentRequirements: [
        "Primary tagline plus 3-5 contextual variants.",
        "Tagline rationale and expression intent.",
        "Usage guardrails: where it appears and where it should not.",
      ],
    },
    {
      id: "messaging-elevator-pitch",
      title: "3.5 Elevator Pitch",
      whatItIs:
        "Build spoken narrative variants for 30s, 60s, and 90s contexts so delivery remains consistent in live sales and leadership conversations.",
      contentRequirements: [
        "30/60/90-second versions with hook, what, who, why different, proof, and invitation.",
        "ICP variants for each length where relevant.",
        "Delivery notes for tone, pacing, and conversation-opening close.",
      ],
    },
    {
      id: "messaging-vocabulary",
      title: "3.6 Brand Vocabulary",
      whatItIs:
        "Codify owned terms, preferred terminology, and words to avoid to protect distinctiveness and consistency.",
      contentRequirements: [
        "Owned terms list with definitions.",
        "Minimum 10 preferred term pairs and 10 words to avoid with rationale.",
        "Jargon policy and punctuation/formatting conventions.",
      ],
    },
  ];

  const voiceSubsections: Subsection[] = [
    {
      id: "voice-brand-voice",
      title: "4.1 Brand Voice",
      whatItIs:
        "Define one durable communication character that stays constant while tone adapts by context.",
      contentRequirements: [
        "Voice archetype and 3-4 voice attributes.",
        "Is/is-not definition for each attribute.",
        "Annotated examples and stress-test behavior scenarios.",
      ],
    },
    {
      id: "voice-tone-registers",
      title: "4.2 Tone Registers",
      whatItIs:
        "Set channel/context-specific tone dials without changing core voice (thought leadership, sales, education, social, support, crisis).",
      contentRequirements: [
        "4-6 tone registers with activation context.",
        "What to dial up/down plus annotated examples.",
        "Decision guide for selecting the right register quickly.",
      ],
    },
    {
      id: "voice-writing-principles",
      title: "4.3 Writing Principles",
      whatItIs:
        "Define structural writing rules (sentence style, paragraph depth, POV, specificity, headline patterns, formatting) for multi-author consistency.",
      contentRequirements: [
        "6-10 principles with rationale.",
        "Before/after examples for each principle.",
        "Absolute vs contextual rule labels.",
      ],
    },
    {
      id: "voice-dodont",
      title: "4.4 Do / Don't Examples",
      whatItIs:
        "Provide practical side-by-side rewrites so teams can execute voice consistently in real channels and moments.",
      contentRequirements: [
        "Minimum 10 annotated do/don't pairs across key channels.",
        "At least 2 pairs per active ICP tier.",
        "Each pair maps to a specific voice attribute.",
      ],
    },
  ];

  const visualSubsections: Subsection[] = [
    {
      id: "visual-logo-system",
      title: "5.1 Logo System",
      whatItIs:
        "Define the full logo architecture and usage guardrails for digital, print, and partner contexts.",
      contentRequirements: [
        "Primary/secondary/mark/wordmark/reversed/single-color sets in required formats.",
        "Min size, clear-space, approved backgrounds, prohibited uses.",
        "Co-branding guidance and examples.",
      ],
    },
    {
      id: "visual-color-palette",
      title: "5.2 Color Palette",
      whatItIs:
        "Specify primary, secondary, functional, and neutral color systems with production-ready values and accessibility logic.",
      contentRequirements: [
        "HEX, RGB, CMYK, Pantone, accessibility rating for each color.",
        "Dominant/accent hierarchy and approved combinations.",
        "Prohibited combinations and WCAG AA compliance note.",
      ],
    },
    {
      id: "visual-typography",
      title: "5.3 Typography System",
      whatItIs:
        "Define display, body, UI, and optional mono roles with strict hierarchy for readability and brand personality.",
      contentRequirements: [
        "Typeface selections with rationale and approved weights.",
        "Size/line-height/letter-spacing hierarchy per role.",
        "Web loading spec and fallback stacks.",
      ],
    },
    {
      id: "visual-iconography",
      title: "5.4 Iconography Style",
      whatItIs:
        "Set one icon family and style parameters so all UI and report visuals remain coherent and premium.",
      contentRequirements: [
        "Style, stroke, corner, and size-system standards.",
        "Color application rules and approved source library.",
        "Correct vs incorrect icon usage examples.",
      ],
    },
    {
      id: "visual-photography",
      title: "5.5 Photography & Imagery Direction",
      whatItIs:
        "Define image subject, mood, composition, and treatment standards to keep visuals aligned with brand personality.",
      contentRequirements: [
        "Mood board direction with 10-15 sample references.",
        "People, diversity, composition, and color treatment rules.",
        "Stock policy and explicit avoid list.",
      ],
    },
    {
      id: "visual-layout",
      title: "5.6 Layout and Spacing Principles",
      whatItIs:
        "Codify grid, spacing density, hierarchy logic, and background usage rules across web, print, and presentation formats.",
      contentRequirements: [
        "Grid specs per format and white-space philosophy.",
        "Hierarchy/alignment/background principles.",
        "Correct application examples across surfaces.",
      ],
    },
    {
      id: "visual-motion",
      title: "5.7 Brand in Motion",
      whatItIs:
        "Define digital motion personality, timing, easing, and transition logic so movement feels intentionally branded.",
      contentRequirements: [
        "Motion personality and easing standards.",
        "Duration scale and animation trigger rules.",
        "Logo/page/interaction motion examples for key journeys.",
      ],
    },
  ];

  const audienceSubsections: Subsection[] = [
    {
      id: "audience-persona-atlas",
      title: "6.1 Customer Persona Profiles (by ICP)",
      whatItIs:
        "Create role-based customer profiles grounded in real decision dynamics, not demographic placeholders.",
      contentRequirements: [
        "Complete profile for each buying role with goals, concerns, key jobs-to-be-done, information sources, and objections.",
        "Most influential persona identified with rationale.",
        "Persona relationship map across buying committee.",
      ],
    },
    {
      id: "audience-jtbd",
      title: "6.2 Customer Jobs (Jobs to Be Done)",
      whatItIs:
        "Map practical, emotional, and social needs so messaging and outreach are anchored in real motivations.",
      contentRequirements: [
        "3-5 jobs per persona with workaround and perfect-solution criteria.",
        "Jobs-to-be-done priority order by purchase influence.",
        "Map of what personas share vs what is unique in their key jobs.",
      ],
    },
    {
      id: "audience-journey",
      title: "6.3 Buyer Journey Map",
      whatItIs:
        "Define stage-by-stage buyer behavior from unaware to retained, including stage questions, emotions, touchpoints, and progression triggers.",
      contentRequirements: [
        "Full journey map per active ICP tier.",
        "Visual journey representation and stage-gap analysis.",
        "Average time per stage for nurture sequencing.",
      ],
    },
    {
      id: "audience-objections",
      title: "6.4 Key Objections",
      whatItIs:
        "Maintain a structured objection-response system so teams proactively address risk, proof, fit, and priority concerns.",
      contentRequirements: [
        "Minimum 10 objections across all objection types.",
        "Structured response: acknowledge, reframe, evidence, advance.",
        "Priority ranking plus misfit-disengage guidance.",
      ],
    },
  ];

  const resolvedTier = normalizeProductTierString(tierRaw || "snapshot-plus");
  const audienceProductTier: ProductTier =
    resolvedTier === "snapshot" ? "snapshot-plus" : resolvedTier;
  const audienceSubsectionsVisible = filterFoundationAudienceSubsections(
    audienceProductTier,
    audienceSubsections,
  );

  const audienceSidebarGroup: Array<{
    label: string;
    links: Array<{ id: string; label: string }>;
  }> =
    audienceSubsectionsVisible.length > 0
      ? [
          {
            label: "Audience",
            links: audienceSubsectionsVisible.map((s) => ({
              id: s.id,
              label:
                s.id === "audience-persona-atlas"
                  ? "Customer Personas"
                  : s.id === "audience-jtbd"
                    ? "Customer Jobs"
                    : s.id === "audience-journey"
                      ? "Buyer Journey"
                      : s.id === "audience-objections"
                        ? "Key Objections"
                        : s.title,
            })),
          },
        ]
      : [];

  const sidebarGroups: Array<{ label: string; links: Array<{ id: string; label: string }> }> = [
    {
      label: "Identity",
      links: [
        { id: "identity-purpose", label: "Purpose" },
        { id: "identity-vision", label: "Vision" },
        { id: "identity-mission", label: "Mission" },
        { id: "identity-values", label: "Core Values" },
        { id: "identity-personality", label: "Personality" },
        { id: "identity-archetype", label: "Archetype" },
        { id: "identity-brand-persona", label: "Brand Persona" },
        { id: "identity-origin", label: "Origin Story" },
      ],
    },
    ...audienceSidebarGroup,
    {
      label: "Positioning",
      links: [
        { id: "positioning-icp", label: "Ideal Customer Profile (ICP)" },
        { id: "positioning-statement", label: "Positioning Statement" },
        { id: "positioning-differentiators", label: "Differentiators" },
      ],
    },
    {
      label: "Messaging",
      links: [
        { id: "messaging-value-proposition", label: "Value Proposition" },
        { id: "messaging-pillars", label: "Message Pillars" },
        { id: "messaging-vocabulary", label: "Brand Vocabulary" },
      ],
    },
    {
      label: "Voice & Expression",
      links: [
        { id: "voice-brand-voice", label: "Brand Voice" },
        { id: "voice-tone-registers", label: "Tone Registers" },
        { id: "voice-writing-principles", label: "Writing Principles" },
      ],
    },
  ];

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_4px_20px_rgba(2,24,89,0.05)] ring-1 ring-slate-900/[0.05]">
        <div>
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue">Reading Density</p>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">Switch between comfortable spacing and compact scan mode.</p>
        </div>
        <div className="inline-flex rounded-lg bg-[#F8FAFC] p-1 ring-1 ring-slate-900/[0.06]">
          {([
            { id: "comfortable", label: "Comfortable" },
            { id: "compact", label: "Compact" },
          ] as Array<{ id: DensityMode; label: string }>).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setDensityMode(mode.id)}
              className="rounded px-3 py-2 text-xs sm:text-sm font-semibold tracking-[0.08em] transition"
              style={{
                backgroundColor: densityMode === mode.id ? "#E6F7FE" : "transparent",
                color: densityMode === mode.id ? "#021859" : "#5A6C8A",
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      {/* Flex avoids grid mis-placing the main column when the aside is display:none below lg. */}
      <div
        className={`flex w-full flex-col items-stretch ${
          densityMode === "compact" ? "gap-6 lg:flex-row lg:gap-8" : "gap-8 lg:flex-row lg:gap-10"
        }`}
      >
      <aside className="hidden min-h-0 w-full shrink-0 lg:block lg:w-[256px] lg:max-w-[256px]">
        <div
          className="sticky z-10 space-y-5 overflow-y-auto overscroll-contain pr-1"
          style={{
            top: "120px",
            maxHeight: "calc(100dvh - 9rem)",
          }}
        >
          {sidebarGroups.map((group) => (
            <div key={group.label} className="rounded-xl bg-white p-3 shadow-[0_4px_18px_rgba(2,24,89,0.05)] ring-1 ring-slate-900/[0.05]">
              <p className="px-2 pb-2 text-xs sm:text-sm font-semibold tracking-[0.1em] text-brand-blue">{group.label}</p>
              <div className="space-y-1.5">
                {group.links.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => scrollToAnchor(link.id)}
                    className="w-full rounded-md px-2.5 py-2.5 text-left text-sm sm:text-[15px] leading-snug transition"
                    style={{
                      backgroundColor: activeFoundationAnchor === link.id ? "#E6F7FE" : "transparent",
                      color: activeFoundationAnchor === link.id ? "#021859" : "#1A1A1A",
                      fontWeight: activeFoundationAnchor === link.id ? 700 : 500,
                    }}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
      <div
        className={`min-w-0 flex-1 ${
          densityMode === "compact" ? "space-y-8 md:space-y-10" : "space-y-10 md:space-y-12"
        }`}
      >
      <DomainSection
        id="brand-story-proof"
        sectionNumber="01"
        eyebrow="Identity"
        title={`1. Identity — ${brandName}: Who You Are and Why You Exist`}
        intro={`Identity governs belief, culture, and narrative continuity for ${brandName}.`}
        gradient="linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)"
        densityMode={densityMode}
        visual={
          <div className="rounded-xl bg-white p-4 shadow-[0_2px_12px_rgba(2,24,89,0.04)] ring-1 ring-slate-900/[0.05] sm:p-5">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue">Identity System Map</p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-muted">
              Read down each pillar: general definition, then how it applies for {brandName}, then the cost of neglecting
              it.
              <span className="hidden lg:inline"> Row labels on the left apply to every column—no repeated headers.</span>
            </p>
            {(() => {
              const identityMapPillars = [
                {
                  key: "Purpose",
                  targetId: "identity-purpose",
                  definition: "Why the brand exists beyond short-term commercial goals.",
                  context: `${brandName} uses this to keep strategy anchored in outcomes for ${audience.toLowerCase()}.`,
                  failureMode:
                    "Tactics multiply without a north star—short-term wins undermine strategic coherence.",
                },
                {
                  key: "Vision",
                  targetId: "identity-vision",
                  definition: "The future state the brand is helping create in its market.",
                  context: `${brandName} uses this to prioritize long-horizon bets over reactive tactics.`,
                  failureMode:
                    "Roadmaps drift toward noise; durable advantage never compounds.",
                },
                {
                  key: "Mission",
                  targetId: "identity-mission",
                  definition: "What the business does repeatedly to make the vision real.",
                  context: `${brandName} uses this to align day-to-day execution and ownership decisions.`,
                  failureMode:
                    "Work fragments across teams; ownership, sequencing, and timelines stay unclear.",
                },
                {
                  key: "Values",
                  targetId: "identity-values",
                  definition: "The non-negotiable standards used to make tradeoff decisions.",
                  context: `${brandName} uses this as a quality gate when pressure pushes for speed over clarity.`,
                  failureMode:
                    "Tradeoffs feel arbitrary; trust and perceived brand quality erode under pressure.",
                },
              ] as const;
              const riskPad =
                densityMode === "compact"
                  ? "rounded-lg bg-[#FEF2F2]/90 px-3 py-3"
                  : "rounded-lg bg-[#FEF2F2]/90 px-3 py-3.5 sm:px-4 sm:py-4";
              const rowLabelClass =
                "flex h-full min-h-[2.75rem] items-center text-xs font-medium tracking-[0.08em] leading-snug text-brand-muted pr-3";
              const rowLabelCompanyClass =
                "flex h-full min-h-0 items-start py-2 pr-3 text-sm font-semibold leading-snug text-brand-navy break-words [hyphens:auto]";
              const rowLabelRiskClass =
                "flex h-full min-h-[2.75rem] items-center text-xs font-medium tracking-[0.08em] leading-snug text-[#991B1B] pr-3";
              return (
                <>
                  {/* Mobile / tablet: legend once; cards use spacing + color only (no repeated row headers) */}
                  <div className="mt-4 rounded-lg bg-slate-50/90 px-3 py-2.5 text-xs leading-relaxed text-brand-muted lg:hidden">
                    <span className="font-semibold text-brand-midnight">How to read each card:</span> plain text = the
                    standard idea; frosted white block = how it applies for {brandName}; red-tinted block = strategic risk
                    if you skip it.
                  </div>
                  <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-2 lg:hidden">
                    {identityMapPillars.map((item) => (
                      <div
                        key={item.key}
                        className="flex min-h-0 w-full flex-col rounded-xl bg-[#F7FBFF] px-4 py-4 shadow-[0_1px_3px_rgba(2,24,89,0.06)] ring-1 ring-slate-900/[0.05] sm:px-5 sm:py-5"
                      >
                        <button
                          type="button"
                          onClick={() => scrollToAnchor(item.targetId)}
                          title={`Jump to ${item.key} in Foundation`}
                          className="text-left text-base font-semibold text-brand-blue underline-offset-2 transition hover:text-brand-navy hover:underline"
                        >
                          {item.key}
                        </button>
                        <p className="mt-4 text-sm sm:text-base leading-relaxed text-brand-midnight">{item.definition}</p>
                        <p className="mt-4 rounded-lg bg-white/95 px-3 py-3 text-sm sm:text-base leading-relaxed text-brand-midnight shadow-[inset_0_0_0_1px_rgba(7,176,242,0.12)] sm:px-3.5 sm:py-3.5">
                          {item.context}
                        </p>
                        <div className="mt-4">
                          <div className={riskPad}>
                            <p className="text-sm sm:text-base leading-snug text-[#7F1D1D]">{item.failureMode}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Large screens: row labels once (left column); pillars are content-only */}
                  <div
                    className="mt-5 hidden gap-x-3 gap-y-3 lg:grid"
                    style={{
                      gridTemplateColumns: "minmax(7rem, 10rem) repeat(4, minmax(0, 1fr))",
                    }}
                  >
                    <div
                      className="flex min-h-[3rem] items-end pb-2 pr-2 border-b border-slate-200/80"
                      aria-hidden
                    />
                    {identityMapPillars.map((item) => (
                      <button
                        key={`hd-${item.key}`}
                        type="button"
                        onClick={() => scrollToAnchor(item.targetId)}
                        title={`Jump to ${item.key}`}
                        className="flex w-full min-h-[3rem] items-center rounded-lg border-b border-slate-200/80 bg-[#E8F4FE] px-3 py-3 text-left text-sm font-semibold text-brand-blue shadow-sm transition hover:bg-[#D6EDFC] hover:text-brand-navy"
                      >
                        {item.key}
                      </button>
                    ))}

                    <div className={rowLabelClass}>Definition</div>
                    {identityMapPillars.map((item) => (
                      <div
                        key={`def-${item.key}`}
                        className="flex h-full min-h-0 flex-col rounded-lg bg-[#F7FBFF] px-3 py-3 shadow-sm sm:px-3.5 sm:py-4"
                      >
                        <p className="text-sm leading-relaxed text-brand-midnight sm:text-[15px]">{item.definition}</p>
                      </div>
                    ))}

                    <div className={rowLabelCompanyClass}>{brandName}</div>
                    {identityMapPillars.map((item) => (
                      <div
                        key={`ctx-${item.key}`}
                        className="flex h-full min-h-0 flex-col rounded-lg bg-white px-3 py-3 shadow-[inset_0_0_0_1px_rgba(7,176,242,0.12)] sm:px-3.5 sm:py-4"
                      >
                        <p className="text-sm leading-relaxed text-brand-midnight sm:text-[15px]">{item.context}</p>
                      </div>
                    ))}

                    <div className={rowLabelRiskClass}>Strategic risk</div>
                    {identityMapPillars.map((item) => (
                      <div
                        key={`risk-${item.key}`}
                        className={`flex h-full min-h-0 flex-col ${riskPad} shadow-sm`}
                      >
                        <p className="text-sm leading-snug text-[#7F1D1D] sm:text-[15px]">{item.failureMode}</p>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        }
        subsections={identitySubsections.map((item) => ({
          ...item,
          customBody: buildCustomBody(item.id),
          personalizedDraft: buildDraftForSection(item.id),
        }))}
      />

      <DomainSection
        id="positioning-platform"
        sectionNumber="02"
        eyebrow="Positioning"
        title={`2. Positioning — How ${brandName} Wins in ${market}`}
        intro={`Positioning defines how ${brandName} is evaluated in ${market} and why ${audience} should choose it.`}
        gradient="linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)"
        densityMode={densityMode}
        visual={
          <div className="rounded-lg border border-brand-border bg-white p-4">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">
              Positioning Decision Framework
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex h-full flex-col rounded-md border border-brand-border bg-[#F7FBFF] p-3">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Audience Fit</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">
                  Ideal Customer Profile (ICP) Precision + Buying Urgency + Decision Authority
                </p>
              </div>
              <div className="flex h-full flex-col rounded-md border border-brand-border bg-[#F7FBFF] p-3">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Differentiation Depth</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">Ownable method + proof-backed outcomes</p>
              </div>
              <div className="flex h-full flex-col rounded-md border border-brand-border bg-[#F7FBFF] p-3">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Category Frame</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">Where you compete and how buyers evaluate</p>
              </div>
              <div className="flex h-full flex-col rounded-md border border-brand-border bg-[#F7FBFF] p-3">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Commercial Signal</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-1">Conversion quality + decision velocity + retention quality</p>
              </div>
            </div>
          </div>
        }
        subsections={positioningSubsections.map((item) => ({
          ...item,
          customBody: buildCustomBody(item.id),
          personalizedDraft: buildDraftForSection(item.id),
        }))}
      />

      <DomainSection
        id="messaging-foundation"
        sectionNumber="03"
        eyebrow="Messaging"
        title={`3. Messaging — How ${brandName} Communicates and Proves Value`}
        intro="Messaging translates identity and positioning into repeatable conversion language."
        gradient="linear-gradient(135deg, #FFFFFF 0%, #F5F8FF 100%)"
        densityMode={densityMode}
        visual={
          <div className="rounded-lg border border-brand-border bg-white p-4">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">Messaging Conversion Flow</p>
            <div className="grid gap-2 md:grid-cols-4">
              {["Claim", "Proof", "Outcome", "CTA"].map((stage) => (
                <div key={stage} className="flex h-full flex-col rounded-md border border-brand-border bg-[#F7FBFF] px-3 py-2">
                  <p className="text-sm sm:text-base font-medium text-brand-blue">{stage}</p>
                </div>
              ))}
            </div>
          </div>
        }
        subsections={messagingSubsections.map((item) => ({
          ...item,
          customBody: buildCustomBody(item.id),
          personalizedDraft: buildDraftForSection(item.id),
        }))}
      />

      <DomainSection
        id="archetype-voice"
        sectionNumber="04"
        eyebrow="Voice & Expression"
        title={`4. Voice & Expression — How ${brandName} Sounds in Market`}
        intro="Voice stays consistent; tone adapts by context without losing brand character."
        gradient="linear-gradient(135deg, #FFFFFF 0%, #F3FCFB 100%)"
        densityMode={densityMode}
        visual={
          (() => {
            const voiceTraitSummary =
              voiceAttributes.length > 0
                ? voiceAttributes.slice(0, 4).join(", ")
                : "strategic, clear, credible, action-oriented";
            const coreVoiceExample = `"${brandName} speaks like a practitioner-advisor: we name the real constraint, show the mechanism, and give ${audience.toLowerCase()} one accountable next move—not generic hype."`;
            const tlExample = `"In ${market.toLowerCase()}, the teams that win aren't the busiest—they're the ones who align message, proof, and execution before they scale spend. Here's the pattern we see most often…"`;
            const salesExample = `"Your top risk right now is ${topGap}. If we fix that first, ${primaryPillar.toLowerCase()} improves without adding more random activity—want to walk through the 90-day sequence?"`;
            const eduExample = `"First, tighten the hero to one promise for ${audience.toLowerCase()}. Second, add one proof block with a metric or mechanism. Third, one CTA that matches where they are in the journey."`;
            const tiles: Array<{
              title: string;
              span?: "wide";
              traits?: string;
              when: string;
              sample: string;
            }> = [
              {
                title: "Core Voice (Constant)",
                span: "wide",
                traits: voiceTraitSummary,
                when: "The through-line in every channel—who you sound like when the brand shows up.",
                sample: coreVoiceExample,
              },
              {
                title: "Thought Leadership",
                when: `Insight-led and perspective-forward—while ${audience.toLowerCase()} are still naming the problem.`,
                sample: tlExample,
              },
              {
                title: "Sales",
                when: "Concise and commercially sharp—when budget, timing, and objections are live.",
                sample: salesExample,
              },
              {
                title: "Education",
                when: "Plain-language and stepwise—for onboarding, nurture, and how-to moments.",
                sample: eduExample,
              },
            ];
            return (
              <div className="rounded-lg border border-brand-border bg-white p-4">
                <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-1">Voice Architecture</p>
                <p className="text-sm sm:text-base leading-relaxed text-brand-muted mb-3">
                  How tone shifts by context—each tile includes a sample line you can adapt, not a checklist to complete later.
                </p>
                <div className="grid gap-2 md:grid-cols-5">
                  {tiles.map((tile) => (
                    <div
                      key={tile.title}
                      className={`flex min-h-0 flex-col rounded-md border border-brand-border bg-[#F7FBFF] px-3 py-2.5 ${
                        tile.span === "wide" ? "md:col-span-2" : ""
                      }`}
                    >
                      <p className="text-sm sm:text-base font-medium text-brand-blue">{tile.title}</p>
                      {tile.traits ? (
                        <p className="text-sm sm:text-base font-medium text-brand-midnight mt-1 leading-snug">{tile.traits}</p>
                      ) : null}
                      <p className="text-sm sm:text-base text-brand-muted mt-1.5 leading-snug">{tile.when}</p>
                      <div className="mt-2 rounded-md border border-slate-200/90 bg-white/90 px-2.5 py-2">
                        <p className="text-xs sm:text-sm font-medium tracking-[0.08em] text-slate-500 mb-1">Sample Line</p>
                        <p className="text-sm sm:text-base leading-snug text-brand-midnight">{tile.sample}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()
        }
        subsections={voiceSubsections.map((item) => ({
          ...item,
          customBody: buildCustomBody(item.id),
          personalizedDraft: buildDraftForSection(item.id),
        }))}
      />

      <DomainSection
        id="visual-direction"
        sectionNumber="05"
        eyebrow="Visual Identity"
        title={`5. Visual Identity — How ${brandName} Looks and Feels`}
        intro="Visual standards protect recognizability, clarity, and premium signal across every surface."
        gradient="linear-gradient(135deg, #FFFFFF 0%, #F3FAFD 100%)"
        densityMode={densityMode}
        visual={
          <div className="rounded-lg border border-brand-border bg-white p-4">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">Visual System Stack</p>
            <div className="mb-3 rounded-md border border-brand-border bg-[#F7FBFF] p-2">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">Visual System Mode</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setVisualSystemMode("existing")}
                  className={`rounded-md border px-3 py-2 text-xs sm:text-sm font-semibold tracking-[0.08em] transition ${
                    visualSystemMode === "existing"
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-brand-border bg-white text-brand-midnight"
                  }`}
                >
                  Use Existing Brand System
                </button>
                <button
                  type="button"
                  onClick={() => setVisualSystemMode("optimize")}
                  className={`rounded-md border px-3 py-2 text-xs sm:text-sm font-semibold tracking-[0.08em] transition ${
                    visualSystemMode === "optimize"
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-brand-border bg-white text-brand-midnight"
                  }`}
                >
                  Existing + Optimization
                </button>
                <button
                  type="button"
                  onClick={() => setVisualSystemMode("refresh")}
                  className={`rounded-md border px-3 py-2 text-xs sm:text-sm font-semibold tracking-[0.08em] transition ${
                    visualSystemMode === "refresh"
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-brand-border bg-white text-brand-midnight"
                  }`}
                >
                  Strategic Refresh
                </button>
              </div>
              <p className="text-sm sm:text-base text-brand-midnight mt-2">{visualModeSummary}</p>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="flex h-full flex-col rounded-md border border-brand-border bg-[#F7FBFF] p-3">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Color</p>
                <div className="mt-2 flex gap-2">
                  <div className="rounded border border-brand-border p-1 bg-white">
                    <span className="block h-8 w-8 rounded bg-[#021859]" />
                  </div>
                  <div className="rounded border border-brand-border p-1 bg-white">
                    <span className="block h-8 w-8 rounded bg-[#07B0F2]" />
                  </div>
                  <div className="rounded border border-brand-border p-1 bg-white">
                    <span className="block h-8 w-8 rounded bg-[#E0E3EA]" />
                  </div>
                </div>
              </div>
              <div className="flex h-full flex-col rounded-md border border-brand-border bg-[#F7FBFF] p-3">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Typography</p>
                <p className="text-[16px] font-semibold text-brand-midnight mt-2">Headline Example</p>
                <p className="text-sm sm:text-base text-brand-muted mt-1 leading-relaxed">Subhead + body hierarchy in Lato</p>
              </div>
              <div className="flex h-full flex-col rounded-md border border-brand-border bg-[#F7FBFF] p-3">
                <p className="text-sm sm:text-base font-medium text-brand-blue">Layout</p>
                <p className="text-sm sm:text-base text-brand-midnight mt-2">Message + proof + action block composition</p>
              </div>
            </div>
            <div className="mt-3 rounded-md border border-brand-border bg-white p-3">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-2">Brand Application Mock</p>
              <div className="rounded-lg border border-[#021859] overflow-hidden">
                <div className="bg-[#021859] px-4 py-4">
                  <p className="text-xs sm:text-sm tracking-[0.12em] text-[#7DD3FC]">Paid Social / Ad Creative Example</p>
                  <p className="text-[24px] leading-tight font-semibold text-white mt-1">
                    {brandName} Turns Strategic Clarity Into Conversion Quality
                  </p>
                  <p className="text-sm sm:text-base text-[#D6E4FF] mt-2 max-w-2xl leading-relaxed">
                    {apStyleArrowChain(
                      `diagnose the highest-impact gap → align your message architecture → execute with owner-level accountability`,
                    )}
                  </p>
                  <div className="mt-3 inline-flex items-center rounded-[5px] bg-[#07B0F2] px-3 py-2">
                    <span className="text-sm font-semibold text-white">See Your 90-day Priority Plan</span>
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-3 bg-[#F8FBFF] p-3">
                  <div className="rounded-md border border-brand-border bg-white p-3">
                    <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue">Message</p>
                    <p className="text-sm sm:text-base text-brand-midnight mt-1">One strategic claim per section.</p>
                  </div>
                  <div className="rounded-md border border-brand-border bg-white p-3">
                    <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue">Proof</p>
                    <p className="text-sm sm:text-base text-brand-midnight mt-1">Pair claims with metric + mechanism.</p>
                  </div>
                  <div className="rounded-md border border-brand-border bg-white p-3">
                    <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue">Action</p>
                    <p className="text-sm sm:text-base text-brand-midnight mt-1">End with one explicit next step.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        subsections={visualSubsections.map((item) => ({
          ...item,
          customBody: buildCustomBody(item.id),
          personalizedDraft: buildDraftForSection(item.id),
        }))}
      />

      {audienceSubsectionsVisible.length > 0 ? (
        <DomainSection
          id="icp-persona-foundation"
          sectionNumber="06"
          eyebrow="Audience"
          title={`6. Audience — Who ${brandName} Is For and How They Decide`}
          intro="Audience intelligence grounds strategy in real buyer behavior, decision friction, and conversion logic."
          gradient="linear-gradient(135deg, #FFFFFF 0%, #FAF7FF 100%)"
          densityMode={densityMode}
          visual={
            <div className="rounded-lg border border-brand-border bg-white p-4">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] text-brand-blue mb-3">Audience Journey Map</p>
              <div className="grid gap-2 md:grid-cols-6">
                {["Unaware", "Aware", "Considering", "Evaluating", "Deciding", "Retained"].map((stage) => (
                  <div key={stage} className="flex h-full flex-col rounded-md border border-brand-border bg-[#F7FBFF] px-2 py-2 text-center">
                    <p className="text-sm sm:text-base font-medium text-brand-blue">{stage}</p>
                  </div>
                ))}
              </div>
            </div>
          }
          subsections={audienceSubsectionsVisible.map((item) => ({
            ...item,
            customBody: buildCustomBody(item.id),
            personalizedDraft: buildDraftForSection(item.id),
          }))}
        />
      ) : null}

      <section
        id="foundation-90day"
        className={`bs-card rounded-xl border border-brand-border ${
          densityMode === "compact" ? "p-4 sm:p-5" : "p-5 sm:p-6"
        }`}
        style={{ borderLeft: "4px solid #16A34A", background: "linear-gradient(135deg, #FFFFFF 0%, #F3FCF6 100%)" }}
      >
        <p className="text-[14px] font-semibold tracking-wide text-brand-blue mb-2">Foundation Rollout</p>
        <h3 className="bs-h3 mb-2">90-day implementation sequencing</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-brand-border bg-white p-4">
            <p className="text-[14px] font-semibold tracking-wide text-brand-blue">Days 1-30</p>
            <p className="bs-body-sm text-brand-midnight mt-1">
              Finalize identity, positioning, and message architecture, led by:{" "}
              {topPriority?.title || `the highest-impact ${primaryPillar.toLowerCase()} priority`}.
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-white p-4">
            <p className="text-[14px] font-semibold tracking-wide text-brand-blue">Days 31-60</p>
            <p className="bs-body-sm text-brand-midnight mt-1">
              Publish voice, visual, and audience standards into strategy/activation and align to channel plans.
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-white p-4">
            <p className="text-[14px] font-semibold tracking-wide text-brand-blue">Days 61-90</p>
            <p className="bs-body-sm text-brand-midnight mt-1">
              QA execution across channels, then update workbook and downloads with performance-backed refinements.
            </p>
          </div>
        </div>
      </section>
      </div>
    </div>
    </div>
  );
}
