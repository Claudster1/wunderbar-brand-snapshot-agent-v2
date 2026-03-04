"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { PillarKey } from "@/src/types/pillars";
import { trackEvent } from "@/lib/analytics";
import { fireACEvent } from "@/lib/fireACEvent";
import { trackUpgradeClick } from "@/lib/adTracking";

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
  const promptPackLabel = `8 prompts built for ${businessName?.trim() || "your brand"}`;

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

  return (
    <section className="space-y-4 pt-6 border-t border-brand-border">
      <h2 className="bs-h2 mb-0">Your full results are ready</h2>
      <p className="bs-body-sm text-brand-muted max-w-3xl">
        Your diagnostic is complete. You are seeing your core score outputs now, and the deeper
        layer is already compiled for your brand.
      </p>

      <div className="bs-card rounded-xl p-5 sm:p-6 border border-brand-blue/20 bg-brand-blue/5">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-blue mb-2">
          Competitive Vulnerability Signal
        </p>
        <p className="bs-body-sm text-brand-midnight">{getVulnerabilitySignal(pillarScores)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="bs-card rounded-xl p-5 border border-brand-border">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
            Your Brand Archetype
          </p>
          {likelyArchetype ? (
            <>
              <p className="bs-body-sm text-brand-midnight mb-2">
                Your archetype:{" "}
                <span className="font-bold text-brand-navy">
                  {archetypeIcon ? `${archetypeIcon} ` : ""}
                  {likelyArchetype}
                </span>
              </p>
              {archetypeMeaning && (
                <p className="bs-small text-brand-muted mb-2">{archetypeMeaning}</p>
              )}
            </>
          ) : (
            <p className="bs-body-sm text-brand-midnight mb-2">
              We detected a clear archetype pattern in your answers and mapped your results to your
              strongest archetype fit.
            </p>
          )}
          <p className="bs-small text-brand-blue font-bold">
            Full archetype activation guidance is available in Snapshot+
          </p>
          <Link
            href="/snapshot-plus?source=archetype_activation"
            onClick={() => trackLockedClick("archetype_activation")}
            className="inline-flex mt-3 text-sm font-bold text-brand-blue hover:underline"
          >
            Get your full archetype activation plan
          </Link>
        </article>

        <article className="bs-card rounded-xl p-5 border border-brand-border">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
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

        <article className="bs-card rounded-xl p-5 border border-brand-border">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
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

        <article className="bs-card rounded-xl p-5 border border-brand-border">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
            Foundational Prompt Pack
          </p>
          <p className="bs-body-sm text-brand-midnight mb-2">
            {promptPackLabel}. Your highest-leverage prompt for {primaryLabel} is selected and
            waiting in Snapshot+, along with your complete foundational prompt pack.
          </p>
          <p className="bs-small text-brand-blue font-bold">Locked — available in Snapshot+</p>
          <Link
            href="/snapshot-plus?source=prompt_pack_lock"
            onClick={() => trackLockedClick("prompt_pack")}
            className="inline-flex mt-3 text-sm font-bold text-brand-blue hover:underline"
          >
            Unlock your prompt pack
          </Link>
        </article>

        <article className="bs-card rounded-xl p-5 border border-brand-border">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
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

      <div className="pt-1">
        <Link
          href="/snapshot-plus?source=full_results_lock"
          onClick={() => trackLockedClick("full_results")}
          className="btn-primary inline-flex"
        >
          See Your Full Results — $497
        </Link>
      </div>
    </section>
  );
}

