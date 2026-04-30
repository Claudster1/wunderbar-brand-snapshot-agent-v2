"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getPromptHydrationMeta,
  hydratePromptTemplate,
  PROMPT_LIBRARY,
  type BrandPromptContext,
} from "@/src/lib/prompts/promptLibrary";

type Props = {
  brandContext: BrandPromptContext;
  productTier: "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";
  /** When true, shows LM1 (lead magnet offer builder) alongside the main library. */
  includeLeadMagnetOfferPrompt?: boolean;
};

const tierOrder = {
  snapshot_plus: 1,
  blueprint: 2,
  blueprint_plus: 3,
} as const;

const packMetaByTier = {
  snapshot_plus: { label: "Foundational Pack", colorClass: "text-[#07B0F2]" },
  blueprint: { label: "Activation Pack", colorClass: "text-emerald-600" },
  blueprint_plus: { label: "Advanced Library", colorClass: "text-[#021859]" },
} as const;

export function ExecutionPromptCards({
  brandContext,
  productTier,
  includeLeadMagnetOfferPrompt = false,
}: Props) {
  const [expandedRef, setExpandedRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const prompts = useMemo(() => {
    return [...PROMPT_LIBRARY]
      .filter((p) => p.ref !== "LM1" || includeLeadMagnetOfferPrompt)
      .sort((a, b) => {
        const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
        if (tierDiff !== 0) return tierDiff;
        return a.ref.localeCompare(b.ref);
      });
  }, [includeLeadMagnetOfferPrompt]);

  const canAccess = (tier: (typeof PROMPT_LIBRARY)[number]["tier"]) => {
    if (productTier === "blueprint_plus") return true;
    if (productTier === "blueprint") {
      return tier === "snapshot_plus" || tier === "blueprint";
    }
    if (productTier === "snapshot_plus") {
      return tier === "snapshot_plus";
    }
    return false;
  };

  const getUpgradeTarget = (tier: (typeof PROMPT_LIBRARY)[number]["tier"]) => {
    if (tier === "snapshot_plus") {
      return { href: "/snapshot-plus", label: "See What's Included" };
    }
    if (tier === "blueprint") {
      return { href: "/brand-blueprint", label: "See What's Included" };
    }
    return { href: "/brand-blueprint-plus", label: "See What's Included" };
  };

  return (
    <section className="space-y-4">
      <p className="text-xs font-bold tracking-[0.04em] text-brand-muted">
        Ready-to-Use AI Prompts For This Section
      </p>
      {prompts.map((prompt) => {
        const hydrated = hydratePromptTemplate(prompt.template, brandContext);
        const hydrationMeta = getPromptHydrationMeta(prompt.template, brandContext);
        const dependencyNotices: Array<{ label: string; promptRef: string }> = [];
        if (hydrationMeta.missingVariableKeys.includes("positioning_statement")) {
          dependencyNotices.push({
            label: "Positioning Statement",
            promptRef: "F1 — Brand Positioning Statement Builder",
          });
        }
        if (hydrationMeta.missingVariableKeys.includes("message_pillars")) {
          dependencyNotices.push({
            label: "Message Pillars",
            promptRef: "F3 — Core Messaging Framework",
          });
        }
        if (hydrationMeta.missingVariableKeys.includes("voice_attributes")) {
          dependencyNotices.push({
            label: "Voice Attributes",
            promptRef: "F5 — Brand Voice Guidelines Builder",
          });
        }
        const summaryValues = [
          {
            label: "Brand",
            value: typeof brandContext.brand_name === "string" ? brandContext.brand_name : "",
          },
          {
            label: "Archetype",
            value:
              typeof brandContext.primary_archetype === "string"
                ? brandContext.primary_archetype
                : "",
          },
          {
            label: "Visibility",
            value:
              brandContext.visibility_score != null &&
              String(brandContext.visibility_score).trim().length > 0
                ? String(brandContext.visibility_score)
                : "",
          },
          {
            label: "Conversion",
            value:
              brandContext.conversion_score != null &&
              String(brandContext.conversion_score).trim().length > 0
                ? String(brandContext.conversion_score)
                : "",
          },
        ].filter((item) => item.value);
        const expanded = expandedRef === prompt.ref;
        const locked = !canAccess(prompt.tier);
        const upgrade = getUpgradeTarget(prompt.tier);
        const askWundySeed = [
          `Help me use prompt ${prompt.ref} (${prompt.title}) for my brand.`,
          `Brand: ${String(brandContext.brand_name ?? "Unknown")}`,
          `Archetype: ${String(brandContext.primary_archetype ?? "Unknown")}`,
          `Message pillars: ${String(brandContext.message_pillars ?? "Not provided")}`,
          "Please give me a practical step-by-step approach and what good output should look like.",
        ].join("\n");
        return (
          <article key={prompt.ref} className="bs-card rounded-xl border border-brand-border p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-1">
                  <span className={packMetaByTier[prompt.tier].colorClass}>
                    {packMetaByTier[prompt.tier].label}
                  </span>{" "}
                  · {prompt.ref} · {prompt.category}
                </p>
                <h3 className="text-base font-semibold text-brand-navy">{prompt.title}</h3>
                <p className="bs-small text-brand-muted mt-1">{prompt.description}</p>
                <p className="bs-small text-brand-muted mt-2">
                  ✓ {hydrationMeta.filledVariables} fields pre-filled
                  {hydrationMeta.missingVariables > 0
                    ? ` · ○ ${hydrationMeta.missingVariables} fields to complete`
                    : " · fully personalized"}
                </p>
                {summaryValues.length > 0 && (
                  <p className="bs-small text-brand-muted mt-1">
                    {summaryValues.map((item) => `${item.label}: ${item.value}`).join(" · ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-brand-blue hover:underline"
                onClick={() => setExpandedRef(expanded ? null : prompt.ref)}
              >
                {expanded ? "Collapse" : "Expand & Copy"}
              </button>
            </div>
            {expanded && (
              <div className="mt-4 space-y-3">
                {locked ? (
                  <div className="rounded-lg border border-brand-border bg-slate-50 p-4">
                    <p className="bs-body-sm text-brand-midnight mb-3">
                      This prompt is part of a higher product. You can still review its purpose here.
                    </p>
                    <div className="flex gap-3">
                      <Link href={upgrade.href} className="btn-primary">{upgrade.label}</Link>
                      <Link
                        href="https://calendly.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                      >
                        Talk to an Expert
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {dependencyNotices.length > 0 && (
                      <div className="rounded-lg border border-brand-border bg-slate-50 p-3">
                        {dependencyNotices.map((notice) => (
                          <p key={notice.label} className="bs-small text-brand-muted">
                            💡 Complete {notice.promptRef} to auto-fill {notice.label} here. You can
                            still run this prompt now and fill that field manually.
                          </p>
                        ))}
                      </div>
                    )}
                    {hydrationMeta.filledVariableLabels.length > 0 && (
                      <p className="bs-small text-brand-muted">
                        Personalized from your results:{" "}
                        {hydrationMeta.filledVariableLabels.slice(0, 5).join(", ")}
                        {hydrationMeta.filledVariableLabels.length > 5 ? ", and more." : "."}
                      </p>
                    )}
                    <p className="bs-small text-brand-muted">
                      How to use: copy this prompt into ChatGPT, Claude, or your preferred AI tool. Filled
                      fields are based on your current results context.
                    </p>
                    <pre className="rounded-lg border border-brand-border bg-slate-50 p-4 text-xs sm:text-sm whitespace-pre-wrap">
                      {hydrated}
                    </pre>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={async () => {
                          await navigator.clipboard.writeText(hydrated);
                          setCopiedRef(prompt.ref);
                          setTimeout(() => setCopiedRef((curr) => (curr === prompt.ref ? null : curr)), 1800);
                        }}
                      >
                        {copiedRef === prompt.ref ? "Copied ✓" : "Copy Prompt"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("wundy:ask", {
                              detail: { message: askWundySeed, autoSend: true },
                            })
                          );
                        }}
                      >
                        Ask Wundy About This Prompt
                      </button>
                      <p className="bs-small text-brand-muted">Prompt copied with hydrated values.</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
