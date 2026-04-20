"use client";

import type { IcpPlaybookStructuredBody } from "@/lib/strategy/strategyPlanExtract";
import { SUITE_FONT_UI, SUITE_NAVY, SUITE_TEXT_PRIMARY } from "@/components/results/suiteBrandTokens";

type Accent = {
  rail: string;
};

type Props = {
  data: IcpPlaybookStructuredBody;
  accent: Accent;
};

function Subheading({ children }: { children: string }) {
  return (
    <h4
      className="m-0 text-[10px] font-extrabold uppercase tracking-[0.1em]"
      style={{ color: "rgba(2, 24, 89, 0.55)", fontFamily: SUITE_FONT_UI }}
    >
      {children}
    </h4>
  );
}

export default function IcpPlaybookStructuredLayout({ data, accent }: Props) {
  const proseStyle = {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6,
    color: SUITE_TEXT_PRIMARY,
    fontFamily: SUITE_FONT_UI,
  } as const;

  const innerCard =
    "rounded-xl border border-slate-200/90 bg-white/80 px-4 py-3.5 shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:px-5 sm:py-4";

  const hasContext = Boolean(data.strategyTieIn || data.segmentFocus);
  const hasLists =
    (data.campaignNeeds?.length ?? 0) > 0 || (data.priorityTactics?.length ?? 0) > 0;

  return (
    <div className="mt-4 flex flex-col gap-4 sm:gap-5">
      {hasContext ? (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {data.strategyTieIn ? (
            <div className={innerCard} style={{ borderTop: `3px solid ${accent.rail}` }}>
              <Subheading>Strategy tie-in</Subheading>
              <p className="mt-2.5" style={proseStyle}>
                {data.strategyTieIn}
              </p>
            </div>
          ) : null}
          {data.segmentFocus ? (
            <div className={innerCard} style={{ borderTop: `3px solid ${accent.rail}` }}>
              <Subheading>Segment focus</Subheading>
              <p className="mt-2.5" style={proseStyle}>
                {data.segmentFocus}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {data.conversionRows?.length ? (
        <div
          className={`${innerCard} border-slate-200/90`}
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.92) 100%)",
          }}
        >
          <Subheading>Conversion intelligence</Subheading>
          <div className="mt-3 flex flex-col gap-3 sm:gap-2.5">
            {data.conversionRows.map((row, ri) => (
              <div
                key={`${ri}-${row.label}`}
                className="grid gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,148px)_1fr] sm:gap-x-5 sm:pb-2.5"
              >
                <dt
                  className="m-0 text-[12px] font-semibold leading-snug"
                  style={{ color: SUITE_NAVY, fontFamily: SUITE_FONT_UI }}
                >
                  {row.label}
                </dt>
                <dd
                  className="m-0 text-[13px] leading-relaxed sm:text-[14px]"
                  style={{ color: SUITE_TEXT_PRIMARY, fontFamily: SUITE_FONT_UI }}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hasLists ? (
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {data.campaignNeeds?.length ? (
            <div className={innerCard}>
              <Subheading>Campaign &amp; content needs</Subheading>
              <ul
                className="strategy-suite-ul mb-0 mt-3 text-[13px] leading-relaxed sm:text-[14px]"
                style={{ color: SUITE_TEXT_PRIMARY, fontFamily: SUITE_FONT_UI }}
              >
                {data.campaignNeeds.map((item) => (
                  <li key={item} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {data.priorityTactics?.length ? (
            <div className={innerCard}>
              <Subheading>Priority tactics (90-day)</Subheading>
              <ul
                className="strategy-suite-ul mb-0 mt-3 text-[13px] leading-relaxed sm:text-[14px]"
                style={{ color: SUITE_TEXT_PRIMARY, fontFamily: SUITE_FONT_UI }}
              >
                {data.priorityTactics.map((item) => (
                  <li key={item} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {data.competitiveCues ? (
        <div
          className="rounded-xl border border-slate-200/80 px-4 py-3.5 sm:px-5 sm:py-4"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: accent.rail,
            background: "rgba(255,255,255,0.65)",
          }}
        >
          <Subheading>Competitive conversation cues</Subheading>
          <p className="mt-2.5 mb-0" style={proseStyle}>
            {data.competitiveCues}
          </p>
        </div>
      ) : null}
    </div>
  );
}
