"use client";

import { useMemo, useState } from "react";

type ProductTier = "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";

type Props = {
  productTier: ProductTier;
  diagnosticData: Record<string, unknown>;
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function firstWords(input: string, count: number): string {
  return input.split(/\s+/).filter(Boolean).slice(0, count).join(" ");
}

function buildSegments(diagnosticData: Record<string, unknown>) {
  const segments: Array<{
    id: string;
    name: string;
    role: string;
    goal: string;
    fear: string;
    primaryMessage: string;
    supporting: string[];
    useWords: string[];
    avoidWords: string[];
    tone: string;
  }> = [];

  const audience = asString(diagnosticData.targetAudience, "Primary decision-maker audience");
  const primaryPillar = asString(diagnosticData.primaryPillar, "Messaging");
  const topOpportunity = asString(diagnosticData.topOpportunity, "faster, clearer growth");
  const topGap = Array.isArray(diagnosticData.topGaps) ? String(diagnosticData.topGaps[0] || "") : "";
  const topStrength = Array.isArray(diagnosticData.topStrengths) ? String(diagnosticData.topStrengths[0] || "") : "";

  segments.push({
    id: "primary-icp",
    name: firstWords(audience, 6) || "Primary ICP",
    role: "Economic buyer",
    goal: `Improve ${primaryPillar.toLowerCase()} outcomes with less execution risk`,
    fear: topGap || "Inconsistent execution across channels",
    primaryMessage: `This brand gives me a clear path to ${topOpportunity.toLowerCase()} without extra complexity.`,
    supporting: [
      `The approach is practical and mapped to ${primaryPillar.toLowerCase()} priorities.`,
      "I can see proof and know what to do next.",
      "The plan is staged and owner-ready.",
    ],
    useWords: ["clear", "practical", "proof-backed", "owner-ready"],
    avoidWords: ["revolutionary", "disruptive", "best-in-class", "generic growth"],
    tone: topStrength ? `Confident, direct, ${topStrength.toLowerCase()}` : "Confident, direct, practical",
  });

  segments.push({
    id: "operator-influencer",
    name: "Operator / Influencer",
    role: "Execution owner",
    goal: "Ship consistently with fewer revisions",
    fear: "Unclear priorities and scattered messaging",
    primaryMessage: "I can execute this quickly because messaging and channel direction are aligned.",
    supporting: [
      "Each channel has one clear role and KPI.",
      "Content can be repurposed without losing message integrity.",
      "Review standards are explicit before publishing.",
    ],
    useWords: ["specific", "actionable", "structured", "measurable"],
    avoidWords: ["high-level", "visionary only", "broad", "undefined"],
    tone: "Supportive, structured, action-oriented",
  });

  return segments;
}

function channelRows(productTier: ProductTier, diagnosticData: Record<string, unknown>) {
  const plans = (diagnosticData.channelPlans as Record<string, string> | undefined) ?? {};
  const hasSocial = !!asString(plans.social);
  const hasEmail = !!asString(plans.email);
  const hasSeo = !!asString(plans.seo || plans["content-seo"]);
  const rows = [
    {
      id: "organic-social",
      channel: "Organic Social",
      inScope: hasSocial || productTier !== "snapshot_plus",
      priority: "P1",
      expression: "Authority hooks + practical proof snippets by audience segment.",
      format: "Short posts, carousel, short-form video",
      volume: "3-5 posts/week",
      metric: "Qualified engagement + CTA clicks",
      stages: ["awareness", "consideration", "retention"] as Array<
        "awareness" | "consideration" | "decision" | "retention"
      >,
    },
    {
      id: "thought-leadership",
      channel: "Thought Leadership",
      inScope: true,
      priority: "P1",
      expression: "Core POV tied to one strategic message per segment.",
      format: "Articles, interviews, speaking points",
      volume: "1-2 long-form assets/month",
      metric: "High-intent sessions + assisted conversions",
      stages: ["awareness", "consideration"] as Array<
        "awareness" | "consideration" | "decision" | "retention"
      >,
    },
    {
      id: "email-nurture",
      channel: "Email Nurture",
      inScope: hasEmail || true,
      priority: "P1",
      expression: "Subject/openers reflect stage-specific message and proof.",
      format: "Welcome, nurture, conversion, re-engagement",
      volume: "1-2 sends/week",
      metric: "Open-to-click quality + conversion rate",
      stages: ["awareness", "consideration", "decision", "retention"] as Array<
        "awareness" | "consideration" | "decision" | "retention"
      >,
    },
    {
      id: "paid-search",
      channel: "Paid Search",
      inScope: productTier === "blueprint" || productTier === "blueprint_plus" || hasSeo,
      priority: "P2",
      expression: "Intent-matched copy around message pillars.",
      format: "Keyword clusters + ad variants",
      volume: "Weekly optimization",
      metric: "CPC efficiency + qualified conversions",
      stages: ["consideration", "decision"] as Array<
        "awareness" | "consideration" | "decision" | "retention"
      >,
    },
    {
      id: "paid-social",
      channel: "Paid Social",
      inScope: productTier === "blueprint_plus",
      priority: "P2",
      expression: "Persona-specific hooks; same core message, adapted angle.",
      format: "Static, video, carousel",
      volume: "Weekly creative iteration",
      metric: "CTR + lead quality",
      stages: ["awareness", "consideration", "decision"] as Array<
        "awareness" | "consideration" | "decision" | "retention"
      >,
    },
  ];
  return rows.filter((row) => row.inScope);
}

export function MessagingMatrix({ productTier, diagnosticData }: Props) {
  const isBlueprintPlus = productTier === "blueprint_plus";
  const brand = asString(diagnosticData.companyName, "Your Brand");
  const primaryPillar = asString(diagnosticData.primaryPillar, "messaging");
  const firstPriority =
    (Array.isArray(diagnosticData.strategicPriorities) &&
      typeof diagnosticData.strategicPriorities[0] === "object" &&
      diagnosticData.strategicPriorities[0] &&
      asString((diagnosticData.strategicPriorities[0] as Record<string, unknown>).title)) ||
    "clarity-first positioning";
  const segments = buildSegments(diagnosticData);
  const channels = channelRows(productTier, diagnosticData);
  const [selectedSegmentId, setSelectedSegmentId] = useState<"all" | string>("all");
  const [selectedChannel, setSelectedChannel] = useState<"all" | string>("all");
  const [selectedStage, setSelectedStage] = useState<
    "all" | "awareness" | "consideration" | "decision" | "retention"
  >("all");

  const filteredSegments = useMemo(
    () =>
      segments.filter((segment) =>
        selectedSegmentId === "all" ? true : segment.id === selectedSegmentId,
      ),
    [segments, selectedSegmentId],
  );

  const filteredChannels = useMemo(
    () =>
      channels.filter((row) => {
        const channelMatch = selectedChannel === "all" ? true : row.id === selectedChannel;
        const stageMatch = selectedStage === "all" ? true : row.stages.includes(selectedStage);
        return channelMatch && stageMatch;
      }),
    [channels, selectedChannel, selectedStage],
  );

  const activeFilterChips = useMemo(() => {
    const seg =
      selectedSegmentId === "all" ? null : segments.find((s) => s.id === selectedSegmentId) ?? null;
    const chan =
      selectedChannel === "all" ? null : channels.find((c) => c.id === selectedChannel) ?? null;

    const chips: Array<{ key: string; label: string }> = [];
    if (seg) chips.push({ key: "icp", label: `ICP: ${seg.name}` });
    if (chan) chips.push({ key: "channel", label: `Channel: ${chan.channel}` });
    if (selectedStage !== "all") {
      const stageLabel = selectedStage.charAt(0).toUpperCase() + selectedStage.slice(1);
      chips.push({ key: "stage", label: `Stage: ${stageLabel}` });
    }
    return chips;
  }, [channels, selectedChannel, selectedSegmentId, selectedStage, segments]);

  return (
    <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
          Cross-Channel Messaging Matrix
        </p>
        <h2 className="bs-h3 mb-2">Anchor layer above all plans</h2>
        <p className="bs-body-sm text-brand-muted max-w-3xl">
          Build once, reference everywhere. This matrix aligns social, thought leadership, email, and paid so {brand}
          tells one coherent story across channels.
        </p>
      </div>

      <article className="rounded-lg border border-brand-border p-4">
        <p className="text-sm font-semibold text-brand-navy">Order of operations</p>
        <p className="bs-small text-brand-midnight mt-2">
          1) Define segments and ICPs 2) Set message hierarchy by segment 3) Map message expression by channel and
          funnel stage 4) Atomize into assets 5) Run consistency audit before launch.
        </p>
      </article>

      <article className="rounded-lg border border-brand-border p-4">
        <p className="text-sm font-semibold text-brand-navy">Filter this matrix</p>
        <p className="bs-small text-brand-muted mt-1">
          Narrow by ICP segment, channel, or funnel stage to focus planning and handoffs.
        </p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-xs font-semibold text-brand-muted uppercase tracking-wide">
            ICP segment
            <select
              value={selectedSegmentId}
              onChange={(event) => setSelectedSegmentId(event.target.value)}
              className="mt-1 w-full rounded border border-brand-border bg-white p-2 text-sm text-brand-midnight"
              aria-label="Filter by ICP segment"
            >
              <option value="all">All segments</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-brand-muted uppercase tracking-wide">
            Channel
            <select
              value={selectedChannel}
              onChange={(event) => setSelectedChannel(event.target.value)}
              className="mt-1 w-full rounded border border-brand-border bg-white p-2 text-sm text-brand-midnight"
              aria-label="Filter by channel"
            >
              <option value="all">All channels</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.channel}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-brand-muted uppercase tracking-wide">
            Funnel stage
            <select
              value={selectedStage}
              onChange={(event) =>
                setSelectedStage(
                  event.target.value as "all" | "awareness" | "consideration" | "decision" | "retention",
                )
              }
              className="mt-1 w-full rounded border border-brand-border bg-white p-2 text-sm text-brand-midnight"
              aria-label="Filter by funnel stage"
            >
              <option value="all">All stages</option>
              <option value="awareness">Awareness</option>
              <option value="consideration">Consideration</option>
              <option value="decision">Decision</option>
              <option value="retention">Retention</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSelectedSegmentId("all");
                setSelectedChannel("all");
                setSelectedStage("all");
              }}
              className="w-full rounded border border-brand-border bg-[#F8FBFF] p-2 text-sm font-semibold text-brand-navy"
              aria-label="Reset messaging matrix filters"
            >
              Reset filters
            </button>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-brand-border p-4">
        <p className="text-sm font-semibold text-brand-navy">Active filters</p>
        {activeFilterChips.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center rounded border border-brand-border bg-white px-3 py-1 text-xs font-semibold text-brand-navy"
              >
                {chip.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="bs-small text-brand-muted mt-2">No filters applied — showing all segments and channels in scope.</p>
        )}
        <p className="bs-small text-brand-midnight mt-2">
          Matching channels: <strong>{filteredChannels.length}</strong> • Matching segments:{" "}
          <strong>{filteredSegments.length}</strong>
        </p>
      </article>

      <article className="rounded-lg border border-brand-border p-4">
        <p className="text-sm font-semibold text-brand-navy">Message hierarchy by audience segment</p>
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredSegments.map((segment) => (
            <div key={segment.name} className="rounded-lg border border-brand-border p-3">
              <p className="text-sm font-semibold text-brand-navy">{segment.name}</p>
              <p className="bs-small text-brand-muted">{segment.role}</p>
              <p className="bs-small text-brand-midnight mt-1">
                Goal: {segment.goal} | Fear: {segment.fear}
              </p>
              <p className="bs-body-sm text-brand-midnight mt-2">
                <strong>Primary message:</strong> {segment.primaryMessage}
              </p>
              <p className="bs-small text-brand-midnight mt-2">
                <strong>Supporting:</strong> {segment.supporting.join(" | ")}
              </p>
              <p className="bs-small text-brand-midnight mt-2">
                <strong>Use:</strong> {segment.useWords.join(", ")}
              </p>
              <p className="bs-small text-brand-midnight">
                <strong>Avoid:</strong> {segment.avoidWords.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-brand-border p-4">
        <p className="text-sm font-semibold text-brand-navy">Channel scope & message expression</p>
        <div className="mt-2 space-y-2">
          {filteredChannels.map((row) => (
            <div key={row.channel} className="rounded border border-brand-border p-2">
              <p className="bs-small text-brand-navy font-semibold">
                {row.channel} ({row.priority})
              </p>
              <p className="bs-small text-brand-midnight">
                {row.expression} | {row.format} | {row.volume} | KPI: {row.metric}
              </p>
            </div>
          ))}
          {filteredChannels.length === 0 && (
            <p className="bs-small text-brand-muted">No channels match the selected filters.</p>
          )}
        </div>
      </article>

      <article className="rounded-lg border border-brand-border p-4">
        <p className="text-sm font-semibold text-brand-navy">Content atomization workflow</p>
        <p className="bs-small text-brand-midnight mt-2">
          Core sprint idea: <strong>{firstPriority}</strong>. Derive this into thought leadership article, social post
          series, email opener, paid hook, and short-form video script while preserving the same core message around{" "}
          {primaryPillar.toLowerCase()}.
        </p>
      </article>

      <article className="rounded-lg border border-brand-border p-4">
        <p className="text-sm font-semibold text-brand-navy">Consistency audit (pre-publish)</p>
        <p className="bs-small text-brand-midnight mt-2">
          Check that primary message, proof points, tone, funnel CTA logic, and visual language are consistent across
          all active channels. Any contradiction should be corrected in the relevant plan before launch.
        </p>
      </article>

      {isBlueprintPlus ? (
        <>
          <article className="rounded-lg border border-brand-border p-4">
            <p className="text-sm font-semibold text-brand-navy">Email Nurture Plan (Blueprint+)</p>
            <p className="bs-small text-brand-midnight mt-2">
              Every sequence references this matrix before copy is written. Sequence order: Welcome {"->"} Nurture
              {"->"} Conversion {"->"} Post-purchase/Onboarding {"->"} Re-engagement (plus Event and Abandoned Lead
              when relevant).
            </p>
            <div className="mt-3 space-y-2">
              <p className="bs-small text-brand-midnight">
                <strong>Foundation:</strong> segment rules in ESP, trigger logic, sequence scope, tone standards, and
                CTA conventions.
              </p>
              <p className="bs-small text-brand-midnight">
                <strong>Per-email brief fields:</strong> send delay, goal, subject A/B, preview text, opening hook,
                core message reference, key CTA, fallback CTA, and body outline.
              </p>
              <p className="bs-small text-brand-midnight">
                <strong>Optimization layer:</strong> open rate, CTR/CTOR, unsubscribe, sequence completion, conversion
                rate, A/B test cadence, governance owner, and review schedule.
              </p>
            </div>
          </article>

          <article className="rounded-lg border border-brand-border p-4">
            <p className="text-sm font-semibold text-brand-navy">Thought Leadership Plan (Blueprint+)</p>
            <p className="bs-small text-brand-midnight mt-2">
              Thought leadership is mapped to matrix segments and messages first, then translated into pillar-led
              content operations and distribution.
            </p>
            <div className="mt-3 space-y-2">
              <p className="bs-small text-brand-midnight">
                <strong>Strategic foundation:</strong> POV statement, authority goals, competitive whitespace, and
                pipeline contribution expectations.
              </p>
              <p className="bs-small text-brand-midnight">
                <strong>Pillar system:</strong> 3-5 pillars with segment/stage mapping, matrix message links, and
                annual topic angles.
              </p>
              <p className="bs-small text-brand-midnight">
                <strong>Operating system:</strong> formats + cadence, annual calendar, atomization workflow,
                distribution ownership, and KPI governance.
              </p>
            </div>
          </article>
        </>
      ) : null}
    </section>
  );
}
