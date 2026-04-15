"use client";

import type { CSSProperties } from "react";

import { SUITE_ACCENT_BRIGHT, SUITE_FONT_UI, SUITE_MUTED, SUITE_NAVY } from "@/components/results/suiteBrandTokens";
import StrategyProseBody from "@/components/strategy/StrategyProseBody";
import {
  buildStrategyAudienceProfilesUiModel,
  buyerPersonasToStrategyCards,
  MAX_ADDITIONAL_ICP_SLOTS,
  type StrategyAudienceTransitionRow,
  type StrategyBuyerPersonaCard,
  type StrategyIcpDetail,
  type StrategyIntakeSegment,
} from "@/lib/strategy/audienceNarrative";

const PROSE_PARA: CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.58,
  fontFamily: SUITE_FONT_UI,
  whiteSpace: "pre-line",
  color: "#1e293b",
};

function asStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function snippet(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

type IcpCard = { title: string; blurb: string; badge: string };

function collectIcpCards(ap: Record<string, unknown>): IcpCard[] {
  const out: IcpCard[] = [];
  const slots: Array<{ key: "primaryICP" | "secondaryICP"; badge: string; fallbackTitle: string }> = [
    { key: "primaryICP", badge: "Primary", fallbackTitle: "Primary customer segment" },
    { key: "secondaryICP", badge: "Secondary", fallbackTitle: "Secondary segment" },
  ];
  for (const { key, badge, fallbackTitle } of slots) {
    const raw = ap[key];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const r = raw as Record<string, unknown>;
    const title = asStr(r.icpLabel) || asStr(r.name) || fallbackTitle;
    const blurb =
      snippet(asStr(r.summary), 180) ||
      snippet(asStr(r.goals), 160) ||
      snippet(asStr(r.demographics), 160) ||
      snippet(asStr(r.psychographics), 160);
    if (!title && !blurb) continue;
    out.push({ title: title || fallbackTitle, blurb: blurb || "Details in the text below.", badge });
  }
  const add = Array.isArray(ap.additionalICPs) ? ap.additionalICPs : [];
  for (const raw of add.slice(0, 3)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const r = raw as Record<string, unknown>;
    const title = asStr(r.icpLabel) || asStr(r.name) || "Another segment";
    const blurb = snippet(asStr(r.summary), 160) || snippet(asStr(r.goals), 140);
    if (!blurb && !asStr(r.icpLabel) && !asStr(r.name)) continue;
    out.push({ title, blurb: blurb || "See full notes below.", badge: "Also consider" });
  }
  return out;
}

/** Card grid for ICP / segment data from `audiencePersonas`. */
export function IcpSegmentCards({ audiencePersonas }: { audiencePersonas: unknown }) {
  if (!audiencePersonas || typeof audiencePersonas !== "object" || Array.isArray(audiencePersonas)) return null;
  const cards = collectIcpCards(audiencePersonas as Record<string, unknown>);
  if (cards.length === 0) return null;

  return (
    <div className="mb-5" style={{ fontFamily: SUITE_FONT_UI }}>
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-blue sm:text-xs">Who you sell to</p>
      <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-brand-muted sm:text-sm">
        Quick read of your main customer groups. Scroll the text under each card for the full detail.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {cards.map((c, i) => (
          <div
            key={`${c.title}-${i}`}
            className="rounded-xl border border-slate-900/[0.08] bg-white p-4 shadow-sm"
            style={{ borderLeftWidth: 3, borderLeftColor: SUITE_ACCENT_BRIGHT }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-blue">{c.badge}</span>
            <p className="mt-1 text-sm font-semibold leading-snug text-brand-navy sm:text-[15px]" style={{ color: SUITE_NAVY }}>
              {c.title}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed sm:text-sm" style={{ color: SUITE_MUTED }}>
              {c.blurb}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

type PersonaTile = {
  name: string;
  role: string;
  hook: string;
  angle?: string;
};

function parsePersonaTiles(buyerPersonas: unknown): PersonaTile[] {
  if (!Array.isArray(buyerPersonas) || buyerPersonas.length === 0) return [];
  const tiles: PersonaTile[] = [];
  for (const raw of buyerPersonas.slice(0, 6)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const p = raw as Record<string, unknown>;
    const name = asStr(p.personaName) || "Buyer role";
    const role = asStr(p.role);
    const hook =
      snippet(asStr(p.coreFrustration), 120) ||
      snippet(asStr(p.primaryMotivation), 120) ||
      snippet(asStr(p.icpAlignment), 120);
    const angle = asStr(p.messagingAngle);
    if (!role && !hook && !angle) continue;
    tiles.push({
      name,
      role: role || "Role not set",
      hook: hook || "Open the section text for full context.",
      angle: angle ? snippet(angle, 90) : undefined,
    });
  }
  return tiles;
}

/** Tile strip for structured `buyerPersonas` rows (role-level profiles). */
export function BuyerPersonaTileStrip({ buyerPersonas }: { buyerPersonas: unknown }) {
  const tiles = parsePersonaTiles(buyerPersonas);
  if (tiles.length === 0) return null;

  return (
    <div className="mb-5" style={{ fontFamily: SUITE_FONT_UI }}>
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-blue sm:text-xs">People behind the purchase</p>
      <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-brand-muted sm:text-sm">
        One card per buyer role. Use them to keep sales and marketing talking about the same person.
      </p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {tiles.map((t, i) => (
          <div
            key={`${t.name}-${i}`}
            className="min-w-[220px] shrink-0 rounded-xl border border-slate-900/[0.08] bg-white p-4 shadow-sm sm:min-w-0"
          >
            <p className="m-0 text-sm font-semibold text-brand-navy sm:text-[15px]" style={{ color: SUITE_NAVY }}>
              {t.name}
            </p>
            <p className="mt-1 text-[12px] font-medium text-brand-blue">{t.role}</p>
            <p className="mt-2 text-[13px] leading-relaxed sm:text-sm" style={{ color: SUITE_MUTED }}>
              {t.hook}
            </p>
            {t.angle ? (
              <p className="mt-2 border-t border-slate-900/[0.06] pt-2 text-[12px] italic leading-relaxed text-brand-muted">
                Angle: {t.angle}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p
      className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-blue sm:text-xs"
      style={{ fontFamily: SUITE_FONT_UI }}
    >
      {children}
    </p>
  );
}

function IntakeSegmentStrip({ segments }: { segments: StrategyIntakeSegment[] }) {
  if (segments.length === 0) return null;
  return (
    <div className="mb-2" style={{ fontFamily: SUITE_FONT_UI }}>
      <SectionEyebrow>From your intake</SectionEyebrow>
      <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-brand-muted sm:text-sm">
        High-level segments from the diagnostic—compare with the structured ICP blocks below.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-900/[0.08] bg-gradient-to-b from-slate-50/90 to-white p-4 shadow-sm"
          >
            <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-brand-blue">{s.label}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-brand-midnight sm:text-sm">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IcpDetailCard({
  detail,
  tier = "priority",
}: {
  detail: StrategyIcpDetail;
  /** `additional` = partners, expansion, tertiary segments (softer chrome than primary/secondary). */
  tier?: "priority" | "additional";
}) {
  const accent = tier === "additional" ? "#64748b" : SUITE_ACCENT_BRIGHT;
  return (
    <article
      className="overflow-hidden rounded-xl border border-slate-900/[0.1] bg-white shadow-sm"
      style={{ borderLeftWidth: 4, borderLeftColor: accent, fontFamily: SUITE_FONT_UI }}
    >
      <div className="border-b border-slate-900/[0.06] bg-slate-50/80 px-4 py-3 sm:px-5 sm:py-4">
        <span className="inline-block rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue ring-1 ring-slate-900/[0.08]">
          {detail.badge}
        </span>
        <h4 className="mt-2 text-base font-semibold leading-snug text-brand-navy sm:text-lg" style={{ color: SUITE_NAVY }}>
          {detail.title}
        </h4>
        {detail.summary ? (
          <p className="mt-2 text-[14px] leading-relaxed text-brand-midnight sm:text-[15px]">{detail.summary}</p>
        ) : null}
      </div>
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        {detail.fields.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {detail.fields.map((f) => (
              <div key={f.label} className="min-w-0">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-blue">{f.label}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed sm:text-sm" style={{ color: SUITE_MUTED }}>
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {(detail.painPoints.length > 0 || detail.objections.length > 0) && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {detail.painPoints.length > 0 ? (
              <div className="rounded-lg border border-rose-900/[0.08] bg-rose-50/40 px-3 py-3 sm:px-4">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-rose-800/90">
                  Pain points
                </p>
                <ul className="mb-0 mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-brand-midnight sm:text-sm">
                  {detail.painPoints.map((p, idx) => (
                    <li key={`${idx}-${p.slice(0, 40)}`}>{p}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {detail.objections.length > 0 ? (
              <div className="rounded-lg border border-amber-900/[0.1] bg-amber-50/50 px-3 py-3 sm:px-4">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-amber-900/85">
                  Typical objections
                </p>
                <ul className="mb-0 mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-brand-midnight sm:text-sm">
                  {detail.objections.map((o, idx) => (
                    <li key={`${idx}-${o.slice(0, 40)}`}>{o}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}

function TransitionPlanCard({ rows }: { rows: StrategyAudienceTransitionRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div
      className="rounded-xl border border-slate-900/[0.08] bg-white p-4 shadow-sm sm:p-5"
      style={{ fontFamily: SUITE_FONT_UI }}
    >
      <SectionEyebrow>Audience transition plan</SectionEyebrow>
      <p className="mt-1 text-[12px] leading-relaxed text-brand-muted sm:text-sm">
        How to move from today&apos;s mix toward the ideal audience without losing message consistency.
      </p>
      <dl className="mt-4 space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="border-t border-slate-900/[0.06] pt-4 first:border-t-0 first:pt-0">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-blue">{r.label}</dt>
            <dd className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed sm:text-sm" style={{ color: SUITE_MUTED }}>
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Strategy tab: replaces prose wall when structured `audiencePersonas` / transition exists. */
export function StrategyAudienceProfilesLayout(props: {
  diagnostic: Record<string, unknown>;
  companyName: string;
  industry: string;
  audienceShort: string;
  targetAudience: string;
  fallbackBody: string;
}) {
  const model = buildStrategyAudienceProfilesUiModel({
    companyName: props.companyName,
    industry: props.industry,
    audienceShort: props.audienceShort,
    targetAudience: props.targetAudience,
    diagnostic: props.diagnostic,
  });

  if (!model.useStructuredLayout) {
    return (
      <StrategyProseBody text={props.fallbackBody} paragraphStyle={{ ...PROSE_PARA, color: "#1e293b" }} />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <IntakeSegmentStrip segments={model.intakeSegments} />
      {(() => {
        const priorityIcps = model.icpDetails.filter(
          (d) => d.badge === "Primary" || d.badge === "Secondary",
        );
        const additionalIcps = model.icpDetails.filter((d) => d.badge === "Also consider");
        if (priorityIcps.length === 0 && additionalIcps.length === 0) return null;
        return (
          <div className="flex flex-col gap-8">
            {priorityIcps.length > 0 ? (
              <div>
                <SectionEyebrow>Priority segments</SectionEyebrow>
                <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-brand-muted sm:text-sm">
                  Primary and secondary ICPs from your deliverable—the accounts and motions that should carry most of the
                  message and proof budget.
                </p>
                <div className="mt-4 flex flex-col gap-5">
                  {priorityIcps.map((d, i) => (
                    <IcpDetailCard key={`pri-${d.title}-${i}`} detail={d} tier="priority" />
                  ))}
                </div>
              </div>
            ) : null}
            {additionalIcps.length > 0 ? (
              <div>
                <SectionEyebrow>Additional ICPs</SectionEyebrow>
                <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-brand-muted sm:text-sm">
                  Beyond primary and secondary: partners, expansion markets, or adjacent accounts. These usually carry a
                  lighter share of voice but still need a coherent story and proof path. Up to {MAX_ADDITIONAL_ICP_SLOTS}{" "}
                  additional segments from your deliverable are listed here.
                </p>
                <div className="mt-4 flex flex-col gap-5">
                  {additionalIcps.map((d, i) => (
                    <IcpDetailCard key={`add-${d.title}-${i}`} detail={d} tier="additional" />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })()}
      <TransitionPlanCard rows={model.transitionRows} />
    </div>
  );
}

function BuyerPersonaCard({ card }: { card: StrategyBuyerPersonaCard }) {
  return (
    <article
      className="rounded-xl border border-slate-900/[0.1] bg-white shadow-sm"
      style={{ fontFamily: SUITE_FONT_UI, borderTopWidth: 3, borderTopColor: SUITE_ACCENT_BRIGHT }}
    >
      <div className="flex flex-col gap-4 border-b border-slate-900/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-4">
        <img
          src={card.portraitSrc}
          alt={card.portraitAlt}
          width={88}
          height={88}
          className="h-[5.5rem] w-[5.5rem] shrink-0 self-start rounded-xl bg-[#E8F6FE] object-cover shadow-sm ring-1 ring-slate-200/80 sm:h-24 sm:w-24"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0 flex-1">
          <h4 className="m-0 text-base font-semibold text-brand-navy sm:text-lg" style={{ color: SUITE_NAVY }}>
            {card.title}
          </h4>
          <p className="mt-1 text-[12px] font-medium text-brand-blue sm:text-sm">{card.subtitle}</p>
        </div>
      </div>
      <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3 sm:px-5 sm:py-5">
        {card.rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-blue">{row.label}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed sm:text-sm" style={{ color: SUITE_MUTED }}>
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

/** Strategy tab: role-level personas as stacked cards; optional atlas summary. */
export function StrategyBuyerPersonasLayout(props: {
  buyerPersonas: unknown;
  summaryText: string;
  fallbackBody: string;
  reportId?: string;
  companyName?: string;
  diagnostic?: Record<string, unknown> | null;
}) {
  const cards = buyerPersonasToStrategyCards(props.buyerPersonas, {
    reportId: props.reportId,
    companyName: props.companyName,
    diagnostic: props.diagnostic,
  });
  if (cards.length === 0) {
    return (
      <StrategyProseBody text={props.fallbackBody} paragraphStyle={{ ...PROSE_PARA, color: "#1e293b" }} />
    );
  }

  const summary = props.summaryText.trim();

  return (
    <div className="flex flex-col gap-6">
      {summary ? (
        <div
          className="rounded-xl border border-slate-900/[0.08] bg-slate-50/60 px-4 py-3 sm:px-5 sm:py-4"
          style={{ fontFamily: SUITE_FONT_UI }}
        >
          <SectionEyebrow>Atlas summary</SectionEyebrow>
          <p className="mt-2 text-[13px] leading-relaxed text-brand-midnight sm:text-[15px]">{summary}</p>
        </div>
      ) : null}
      <div>
        <SectionEyebrow>Role-level profiles</SectionEyebrow>
        <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-brand-muted sm:text-sm">
          One card per buyer role. Use objections and sample lines when writing outbound, ads, and enablement.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          {cards.map((c, i) => (
            <BuyerPersonaCard key={`${c.title}-${i}`} card={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
