"use client";

import type { CSSProperties } from "react";

import {
  SUITE_ACCENT_BRIGHT,
  SUITE_FONT_UI,
  SUITE_NAVY,
  SUITE_RADIUS_MD,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";
import type { StrategicOfferViewModel } from "@/lib/strategy/strategicOfferPlan";
import { SEMANTIC_DO, SEMANTIC_DONT } from "@/src/pdf/reportVisualTokens";

const TEXT: CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.58,
  color: SUITE_TEXT_PRIMARY,
  fontFamily: SUITE_FONT_UI,
};

const LABEL: CSSProperties = {
  margin: "0 0 6px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "rgba(2, 24, 89, 0.55)",
  fontFamily: SUITE_FONT_UI,
};

function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={SUITE_ACCENT_BRIGHT} strokeWidth="1.75" />
      <circle cx="12" cy="12" r="4" fill={SUITE_ACCENT_BRIGHT} opacity={0.35} />
      <circle cx="12" cy="12" r="1.75" fill={SUITE_ACCENT_BRIGHT} />
    </svg>
  );
}

function IconLayers({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4L4 8l8 4 8-4-8-4z"
        stroke={SUITE_NAVY}
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity={0.45}
      />
      <path
        d="M4 12l8 4 8-4"
        stroke={SUITE_ACCENT_BRIGHT}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16l8 4 8-4"
        stroke={SUITE_NAVY}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
      />
    </svg>
  );
}

function IconWave({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14c2.5-3 5.5 3 8-2s5.5 5 8 0"
        stroke={SUITE_ACCENT_BRIGHT}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M4 18c2.5-2.5 5.5 2.5 8-1.5s5.5 4 8-1"
        stroke={SUITE_NAVY}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.35}
      />
    </svg>
  );
}

function formatOfferType(raw: string): string {
  const t = raw.trim().replace(/_/g, " ");
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function roleTone(role: string): { bg: string; color: string; border: string } {
  const r = role.toLowerCase();
  if (r.includes("entry"))
    return { bg: "rgba(7, 176, 242, 0.1)", color: SUITE_NAVY, border: "rgba(7, 176, 242, 0.35)" };
  if (r.includes("upsell"))
    return { bg: "rgba(124, 58, 237, 0.08)", color: "#5b21b6", border: "rgba(124, 58, 237, 0.28)" };
  return { bg: "rgba(2, 24, 89, 0.06)", color: SUITE_NAVY, border: "rgba(2, 24, 89, 0.12)" };
}

/** Icon column (22px) + gap-2 (8px): aligns list with eyebrow row that leads with the same icon */
const LIST_INDENT_MATCH_ICON_HEADER_PX = 30;

function ListBlock({
  items,
  indentToMatchIconHeader,
}: {
  items: string[];
  /** When the card title row starts with a 22px icon + gap, indent the list so dots line up with that title text */
  indentToMatchIconHeader?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <ul
      className="m-0 flex list-none flex-col gap-2 p-0"
      style={{
        fontFamily: SUITE_FONT_UI,
        fontSize: 14,
        lineHeight: 1.55,
        color: SUITE_TEXT_PRIMARY,
        ...(indentToMatchIconHeader ? { paddingLeft: LIST_INDENT_MATCH_ICON_HEADER_PX } : undefined),
      }}
    >
      {items.map((line, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span
            className="mt-[0.55em] size-1.5 shrink-0 rounded-full"
            style={{ background: "var(--wb-bullet-accent, #07b0f2)" }}
            aria-hidden
          />
          <span className="min-w-0 flex-1">{line}</span>
        </li>
      ))}
    </ul>
  );
}

type Props = { model: StrategicOfferViewModel };

/**
 * Scannable Strategy layout for `strategicOfferContext`: hero job statement, primary offer card,
 * portfolio chips, pains vs outcomes grid, scope columns, signal cards, and risk/channel footnotes.
 */
export default function StrategicOfferPortfolioLayout({ model }: Props) {
  const po = model.primaryOffer;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {model.methodologyFraming ? (
        <div
          className="border border-black/[0.07] bg-gradient-to-br from-[#F8FBFF] to-white"
          style={{ borderRadius: SUITE_RADIUS_MD, padding: "16px 18px", boxShadow: SUITE_SHADOW_CARD }}
        >
          <div className="flex flex-wrap items-start gap-3">
            <IconLayers className="mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p style={LABEL}>How this was framed</p>
              <p style={TEXT}>{model.methodologyFraming}</p>
            </div>
          </div>
        </div>
      ) : null}

      {model.jobStatement ? (
        <div
          className="relative overflow-hidden border border-black/[0.08] bg-white"
          style={{
            borderRadius: SUITE_RADIUS_MD,
            padding: "18px 20px",
            boxShadow: SUITE_SHADOW_CARD,
            borderLeft: `4px solid ${SUITE_ACCENT_BRIGHT}`,
          }}
        >
          <div className="flex flex-wrap items-start gap-3">
            <IconTarget className="mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p style={LABEL}>Job to be done</p>
              <p
                style={{
                  ...TEXT,
                  fontSize: 16,
                  fontWeight: 600,
                  color: SUITE_NAVY,
                  lineHeight: 1.5,
                }}
              >
                {model.jobStatement}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {po ? (
        <div
          className="border border-black/[0.08] bg-white"
          style={{ borderRadius: SUITE_RADIUS_MD, padding: "20px 22px", boxShadow: SUITE_SHADOW_CARD }}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {po.offerType ? (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                style={{
                  background: "rgba(7, 176, 242, 0.12)",
                  color: SUITE_NAVY,
                  border: "1px solid rgba(7, 176, 242, 0.28)",
                  fontFamily: SUITE_FONT_UI,
                }}
              >
                {formatOfferType(po.offerType)}
              </span>
            ) : null}
            <span
              className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted"
              style={{ fontFamily: SUITE_FONT_UI }}
            >
              Primary offer
            </span>
          </div>
          {po.name ? (
            <h4 className="bs-h4 m-0 text-brand-navy" style={{ fontFamily: SUITE_FONT_UI, lineHeight: 1.25 }}>
              {po.name}
            </h4>
          ) : null}
          {po.oneLinePitch ? (
            <p className="mt-3" style={TEXT}>
              {po.oneLinePitch}
            </p>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {po.whoItsFor ? (
              <div
                className="min-h-[120px] rounded-lg border border-black/[0.06] bg-[#FAFBFF] p-4"
                style={{ fontFamily: SUITE_FONT_UI }}
              >
                <p style={LABEL}>Who it is for</p>
                <p style={{ ...TEXT, fontSize: 14 }}>{po.whoItsFor}</p>
              </div>
            ) : null}
            {po.substitutesConsidered ? (
              <div
                className="min-h-[120px] rounded-lg border border-black/[0.06] bg-[#FAFAFC] p-4"
                style={{ fontFamily: SUITE_FONT_UI }}
              >
                <p style={LABEL}>Alternatives buyers compare to</p>
                <p style={{ ...TEXT, fontSize: 14 }}>{po.substitutesConsidered}</p>
              </div>
            ) : null}
            {po.whyTheySwitch ? (
              <div
                className="min-h-[120px] rounded-lg border border-black/[0.06] bg-[#F6FFFC] p-4 md:col-span-1"
                style={{ fontFamily: SUITE_FONT_UI }}
              >
                <p style={LABEL}>Why they switch to you</p>
                <p style={{ ...TEXT, fontSize: 14 }}>{po.whyTheySwitch}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {model.secondaryOffers.length > 0 ? (
        <div>
          <p style={{ ...LABEL, marginBottom: 12 }}>Portfolio / adjacent offers</p>
          <div className="flex flex-wrap gap-2.5">
            {model.secondaryOffers.map((row, i) => {
              const tone = roleTone(row.role);
              return (
                <div
                  key={`${row.name}-${i}`}
                  className="flex max-w-full flex-col gap-1 rounded-lg border px-3.5 py-2.5 sm:inline-flex sm:max-w-md sm:flex-row sm:items-center sm:gap-2"
                  style={{
                    background: tone.bg,
                    borderColor: tone.border,
                    fontFamily: SUITE_FONT_UI,
                  }}
                >
                  <span className="text-[15px] font-semibold text-brand-navy">{row.name}</span>
                  {row.role ? (
                    <span
                      className="w-fit rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        background: "rgba(255,255,255,0.75)",
                        color: tone.color,
                        border: `1px solid ${tone.border}`,
                      }}
                    >
                      {row.role}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {(model.painsRelieved.length > 0 || model.outcomesEnabled.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {model.painsRelieved.length > 0 ? (
            <div
              className="rounded-lg border p-4 md:p-5"
              style={{
                borderRadius: SUITE_RADIUS_MD,
                background: "linear-gradient(180deg, #FFFBF7 0%, #FFFFFF 100%)",
                borderColor: "rgba(234, 88, 12, 0.18)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <IconWave />
                <p style={{ ...LABEL, margin: 0, color: "rgba(154, 52, 18, 0.85)" }}>Pains relieved</p>
              </div>
              <ListBlock items={model.painsRelieved} indentToMatchIconHeader />
            </div>
          ) : null}
          {model.outcomesEnabled.length > 0 ? (
            <div
              className="rounded-lg border p-4 md:p-5"
              style={{
                borderRadius: SUITE_RADIUS_MD,
                background: SEMANTIC_DO.bg,
                borderColor: "rgba(5, 150, 105, 0.2)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <IconTarget />
                <p style={{ ...LABEL, margin: 0, color: "rgba(5, 120, 85, 0.9)" }}>Outcomes enabled</p>
              </div>
              <ListBlock items={model.outcomesEnabled} indentToMatchIconHeader />
            </div>
          ) : null}
        </div>
      )}

      {(model.scopeIn.length > 0 || model.scopeOut.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {model.scopeIn.length > 0 ? (
            <div
              className="rounded-lg border p-4 md:p-5"
              style={{
                borderRadius: SUITE_RADIUS_MD,
                background: SEMANTIC_DO.bg,
                border: `1px solid rgba(5, 150, 105, 0.22)`,
                borderLeft: `4px solid ${SEMANTIC_DO.border}`,
              }}
            >
              <p style={{ ...LABEL, color: "rgba(5, 100, 72, 0.9)" }}>In scope</p>
              <ListBlock items={model.scopeIn} />
            </div>
          ) : null}
          {model.scopeOut.length > 0 ? (
            <div
              className="rounded-lg border p-4 md:p-5"
              style={{
                borderRadius: SUITE_RADIUS_MD,
                background: SEMANTIC_DONT.bg,
                border: `1px solid rgba(239, 68, 68, 0.2)`,
                borderLeft: `4px solid ${SEMANTIC_DONT.border}`,
              }}
            >
              <p style={{ ...LABEL, color: "rgba(127, 29, 29, 0.85)" }}>Explicitly out of scope</p>
              <p
                className="mb-3 text-[13px] leading-snug text-brand-muted"
                style={{ fontFamily: SUITE_FONT_UI }}
              >
                Do not promise these in sales or marketing copy.
              </p>
              <ListBlock items={model.scopeOut} />
            </div>
          ) : null}
        </div>
      )}

      {model.leadingSuccessSignals.length > 0 ? (
        <div>
          <p style={{ ...LABEL, marginBottom: 12 }}>Leading success signals</p>
          <div className="flex flex-col gap-3">
            {model.leadingSuccessSignals.map((sig, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 border border-black/[0.07] bg-white sm:flex-row sm:items-start sm:gap-4"
                style={{
                  borderRadius: SUITE_RADIUS_MD,
                  padding: "14px 16px",
                  boxShadow: SUITE_SHADOW_CARD,
                  borderLeftWidth: 4,
                  borderLeftColor: SUITE_ACCENT_BRIGHT,
                  fontFamily: SUITE_FONT_UI,
                }}
              >
                <div className="min-w-0 flex-1">
                  <p style={{ ...TEXT, fontWeight: 600, color: SUITE_NAVY }}>{sig.signal}</p>
                  {sig.whyItMatters ? (
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">{sig.whyItMatters}</p>
                  ) : null}
                </div>
                {sig.reviewCadence ? (
                  <span
                    className="flex-shrink-0 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                    style={{
                      background: "rgba(2, 24, 89, 0.06)",
                      color: SUITE_NAVY,
                      border: "1px solid rgba(2, 24, 89, 0.1)",
                    }}
                  >
                    {sig.reviewCadence}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {model.channelExecutionAlignment ? (
        <div
          className="border border-black/[0.07] bg-[#F8FAFF]"
          style={{ borderRadius: SUITE_RADIUS_MD, padding: "16px 18px" }}
        >
          <p style={LABEL}>Channel execution alignment</p>
          <p style={TEXT}>{model.channelExecutionAlignment}</p>
        </div>
      ) : null}

      {model.riskiestAssumption ? (
        <div
          className="border border-amber-200/80 bg-amber-50/90"
          style={{ borderRadius: SUITE_RADIUS_MD, padding: "16px 18px" }}
        >
          <p style={{ ...LABEL, color: "rgba(146, 64, 14, 0.9)" }}>Riskiest assumption</p>
          <p style={{ ...TEXT, color: "#78350f" }}>{model.riskiestAssumption}</p>
        </div>
      ) : null}
    </div>
  );
}
