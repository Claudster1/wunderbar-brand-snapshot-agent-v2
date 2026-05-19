"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { PillarKey } from "@/src/types/pillars";
import { trackEvent } from "@/lib/analytics";
import { fireACEvent } from "@/lib/fireACEvent";
import { trackUpgradeClick } from "@/lib/adTracking";
import { SNAPSHOT_PLUS_LOCKED_PROMPT_TITLES } from "@/src/lib/prompts/promptLibrary";
import { PRICING, formatPrice } from "@/lib/pricing";

type Props = {
  primaryPillar: PillarKey;
  pillarScores: Record<PillarKey, number>;
  businessType?: string | null;
  businessName?: string | null;
  reportId?: string;
  email?: string;
  likelyArchetype?: string | null;
  archetypeMeaning?: string | null;
  archetypeIcon?: string;
};

function toLabel(pillar: PillarKey): string {
  return pillar.charAt(0).toUpperCase() + pillar.slice(1);
}

function getLowestAndHighest(scores: Record<PillarKey, number>): {
  low: PillarKey;
  high: PillarKey;
} {
  const entries = Object.entries(scores) as Array<[PillarKey, number]>;
  let low: [PillarKey, number] = ["positioning", Infinity];
  let high: [PillarKey, number] = ["positioning", -Infinity];

  for (const [pillar, score] of entries) {
    if (score < low[1]) low = [pillar, score];
    if (score > high[1]) high = [pillar, score];
  }

  return { low: low[0], high: high[0] };
}

function getVulnerabilitySignal(scores: Record<PillarKey, number>): string {
  const { low, high } = getLowestAndHighest(scores);
  const key = `${low}:${high}`;

  const map: Record<string, string> = {
    "visibility:positioning":
      "Your brand has strong differentiation that is not reaching enough of the right people. Competitors with weaker positioning but stronger visibility may win business you are better positioned to serve.",
    "conversion:credibility":
      "Your brand is building trust effectively but losing buyers at the decision point. You are earning consideration and then not closing it.",
    "positioning:visibility":
      "Your brand has reach but may be attracting the wrong audience, which makes every marketing dollar work harder than it should.",
    "messaging:positioning":
      "You know what makes you different, but your language is not landing consistently. The gap is in translation, not in substance.",
    "credibility:messaging":
      "Your brand communicates well but may lack the proof signals buyers need before they commit. Strong messaging gets attention; credibility closes it.",
  };

  return (
    map[key] ??
    "Your score pattern indicates a meaningful competitive exposure. Snapshot+ prioritizes which gap to fix first for the fastest impact."
  );
}

function getAudienceAlignmentTeaser(primaryPillar: PillarKey): string {
  const teasers: Record<PillarKey, string> = {
    positioning:
      "The question your ideal client asks before choosing between you and a competitor is identified in Snapshot+.",
    messaging:
      "The exact language pattern your audience uses when they are ready to buy is identified in Snapshot+.",
    visibility:
      "The channel where your ideal audience is actively searching and where your presence is currently weak is identified in Snapshot+.",
    credibility:
      "The specific trust signal your audience looks for before committing is identified in Snapshot+.",
    conversion:
      "The exact point in your buyer journey where interest most often drops off is identified in Snapshot+.",
  };
  return teasers[primaryPillar];
}

function normalizeBusinessType(input?: string | null): string {
  if (!input) return "general";
  const v = String(input).toLowerCase();
  if (v.includes("service_b2b")) return "service_b2b";
  if (v.includes("service_b2c")) return "service_b2c";
  if (v.includes("retail")) return "retail";
  if (v.includes("ecommerce")) return "ecommerce";
  if (v.includes("saas") || v.includes("software")) return "saas";
  if (v.includes("local_service")) return "local_service";
  return "general";
}

function contentFormatChannelTeaser(type: string): string {
  switch (type) {
    case "service_b2b":
      return "Your audience-mapped format and channel plan is ready: long-form authority content, relationship-driven channels, and funnel-stage priorities.";
    case "service_b2c":
      return "Your audience-mapped format and channel plan is ready: social proof formats, high-trust channels, and conversion-oriented booking flow priorities.";
    case "retail":
      return "Your audience-mapped format and channel plan is ready: local demand formats, store-discovery channels, and repeat-purchase priority actions.";
    case "ecommerce":
      return "Your audience-mapped format and channel plan is ready: product-led content formats, high-intent channels, and conversion/retention funnel priorities.";
    case "saas":
      return "Your audience-mapped format and channel plan is ready: education-led formats, activation-focused channels, and lifecycle conversion priorities.";
    case "local_service":
      return "Your audience-mapped format and channel plan is ready: trust-building formats, local discovery channels, and booking/show-rate priorities.";
    default:
      return "Your audience-mapped format and channel plan is ready: top content formats, highest-leverage channels, and funnel-stage priorities.";
  }
}

export function LockedResultsPreview({
  primaryPillar,
  pillarScores,
  businessType,
  businessName,
  reportId,
  email,
  likelyArchetype,
  archetypeMeaning,
  archetypeIcon,
}: Props) {
  const primaryLabel = toLabel(primaryPillar);
  const normalizedBusinessType = normalizeBusinessType(businessType);
  const promptPackLabel = `${SNAPSHOT_PLUS_LOCKED_PROMPT_TITLES.length} prompts built for ${businessName?.trim() || "your brand"}`;

  useEffect(() => {
    const key = `snapshot_locked_preview_viewed_${reportId ?? "unknown"}`;
    if (typeof window !== "undefined" && window.localStorage.getItem(key)) return;

    trackEvent("RESULTS_VIEWED", {
      source: "locked_results_preview",
      reportId,
      primaryPillar,
    });
    fireACEvent({
      email,
      eventName: "snapshot_locked_sections_viewed",
      tags: ["snapshot:locked-sections-viewed"],
      fields: {
        report_id: reportId ?? "",
        primary_pillar: primaryPillar,
      },
    });
    if (typeof window !== "undefined") window.localStorage.setItem(key, "true");
  }, [email, primaryPillar, reportId]);

  const trackLockedClick = (section: string) => {
    trackEvent("UPGRADE_CLICKED", {
      target: "Snapshot+",
      source: "locked_results_preview",
      section,
      reportId,
      primaryPillar,
    });
    fireACEvent({
      email,
      eventName: "snapshot_locked_section_cta_clicked",
      tags: ["snapshot:locked-section-clicked"],
      fields: {
        report_id: reportId ?? "",
        primary_pillar: primaryPillar,
        locked_section: section,
      },
    });
    trackUpgradeClick({ fromTier: "snapshot", toTier: "snapshot-plus", value: 497 });
  };

  const nextTier = PRICING.snapshot_plus.label;
  const nextTierPrice = formatPrice(PRICING.snapshot_plus.price);

  return (
    <section className="space-y-5 sm:space-y-6 border-t border-brand-border pt-8 sm:pt-9">
      <h2 className="bs-h2 mb-0">What unlocks in {nextTier}</h2>
      <p className="bs-body-sm text-brand-muted max-w-3xl">
        You&apos;ve seen your score, pillars, and priority actions above. These sections show what the
        next tier adds — without repeating the upsell at the top of the page.
      </p>

      <div className="bs-card rounded-xl p-6 sm:p-7 border border-brand-blue/20 bg-brand-blue/5">
        <p className="text-xs font-bold tracking-[0.04em] text-brand-blue mb-4">
          Competitive Vulnerability Signal
        </p>
        <p className="bs-body-sm text-brand-midnight">{getVulnerabilitySignal(pillarScores)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="bs-card rounded-xl p-6 sm:p-7 border border-brand-border bg-white">
          <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-4">
            Your Brand Archetype
          </p>
          {likelyArchetype ? (
            <div className="flex gap-3 items-start mb-3">
              {archetypeIcon ? (
                <span className="text-3xl leading-none shrink-0" aria-hidden>
                  {archetypeIcon}
                </span>
              ) : null}
              <div>
                <p className="bs-body-sm font-bold text-brand-navy m-0 mb-1">{likelyArchetype}</p>
                {archetypeMeaning ? (
                  <p className="bs-small text-brand-muted m-0">{archetypeMeaning}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="bs-body-sm text-brand-midnight mb-2">
              Activation playbooks for your archetype are included in {nextTier}.
            </p>
          )}
          <Link
            href="/snapshot-plus?source=archetype_activation"
            onClick={() => trackLockedClick("archetype_activation")}
            className="text-sm font-semibold text-brand-blue hover:underline underline-offset-2"
          >
            Archetype activation in {nextTier} →
          </Link>
        </article>

        <article className="bs-card rounded-xl p-6 sm:p-7 border border-brand-border">
          <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-4">
            {primaryLabel} Deep Dive
          </p>
          <p className="bs-body-sm text-brand-midnight mb-2">
            Your {primaryLabel} score is influenced by 4 contributing factors. The dominant factor
            with the highest leverage is identified in Snapshot+.
          </p>
          <p className="bs-small text-brand-blue font-bold">Locked — available in Snapshot+</p>
          <Link
            href="/snapshot-plus?source=dominant_factor_lock"
            onClick={() => trackLockedClick("dominant_factor")}
            className="inline-flex mt-3 text-sm font-bold text-brand-blue hover:underline"
          >
            See the dominant factor now
          </Link>
        </article>

        <article className="bs-card rounded-xl p-6 sm:p-7 border border-brand-border">
          <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-4">
            Your Audience Alignment Gap
          </p>
          <p className="bs-body-sm text-brand-midnight mb-2">
            {getAudienceAlignmentTeaser(primaryPillar)}
          </p>
          <p className="bs-small text-brand-blue font-bold">Locked — available in Snapshot+</p>
          <Link
            href="/snapshot-plus?source=audience_alignment_lock"
            onClick={() => trackLockedClick("audience_alignment")}
            className="inline-flex mt-3 text-sm font-bold text-brand-blue hover:underline"
          >
            See your audience alignment gap
          </Link>
        </article>

        <article className="bs-card rounded-xl p-6 sm:p-7 border border-brand-border">
          <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-4">
            Snapshot+ Prompt Pack (Locked Preview)
          </p>
          <p className="bs-body-sm text-brand-midnight mb-2">
            {promptPackLabel}. These are pre-calibrated to your brand context and ready to copy
            into ChatGPT/Claude:
          </p>
          <ul className="mb-2 space-y-1">
            {SNAPSHOT_PLUS_LOCKED_PROMPT_TITLES.map((name) => (
              <li key={name} className="bs-small text-brand-midnight flex items-center justify-between gap-3">
                <span>{name}</span>
                <span className="text-brand-blue font-bold">locked</span>
              </li>
            ))}
          </ul>
          <p className="bs-small text-brand-blue font-bold">Locked — available in Snapshot+</p>
          <Link
            href="/snapshot-plus?source=prompt_pack_lock"
            onClick={() => trackLockedClick("prompt_pack")}
            className="inline-flex mt-3 text-sm font-bold text-brand-blue hover:underline"
          >
            Unlock your prompt pack
          </Link>
        </article>

        <article className="bs-card rounded-xl p-6 sm:p-7 border border-brand-border">
          <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-4">
            Content Format &amp; Channel Recommendations
          </p>
          <p className="bs-body-sm text-brand-midnight mb-2">
            {contentFormatChannelTeaser(normalizedBusinessType)}
          </p>
          <p className="bs-small text-brand-blue font-bold">Locked — available in Snapshot+</p>
          <Link
            href="/snapshot-plus?source=format_channel_lock"
            onClick={() => trackLockedClick("format_channel")}
            className="inline-flex mt-3 text-sm font-bold text-brand-blue hover:underline"
          >
            See your format & channel map
          </Link>
        </article>
      </div>

      <div className="pt-4 border-t border-brand-border">
        <Link
          href="/snapshot-plus?source=full_results_lock"
          onClick={() => trackLockedClick("full_results")}
          className="btn-primary inline-flex w-full sm:w-auto justify-center text-base px-8 py-3.5 shadow-[0_4px_14px_rgba(7,176,242,0.35)]"
        >
          Upgrade to {nextTier} — {nextTierPrice}
        </Link>
      </div>
    </section>
  );
}

