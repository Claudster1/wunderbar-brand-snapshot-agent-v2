"use client";

import {
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_INSIGHT_CARD_BASE,
  SUITE_INSIGHT_CARD_RAIL_LEFT,
  SUITE_NAVY,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";
import type {
  DiscoveryScriptItem,
  ProofPlacementItem,
  TalkTrackStageItem,
} from "@/lib/strategy/strategyPlanExtract";

function Eyebrow({ children }: { children: string }) {
  return (
    <p
      className="m-0 text-[10px] font-extrabold uppercase tracking-[0.1em]"
      style={{ color: "rgba(2, 24, 89, 0.55)", fontFamily: SUITE_FONT_UI }}
    >
      {children}
    </p>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <div>
      <p
        className="m-0 text-[11px] font-bold tracking-[0.03em]"
        style={{ color: SUITE_NAVY, fontFamily: SUITE_FONT_UI }}
      >
        {label}
      </p>
      <p
        className="m-0 mt-1.5 text-sm leading-relaxed sm:text-[15px]"
        style={{ color: SUITE_TEXT_PRIMARY, fontFamily: SUITE_FONT_UI }}
      >
        {body}
      </p>
    </div>
  );
}

export function TalkTrackStageCards({ items }: { items: TalkTrackStageItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <p
        className="m-0 text-[11px] font-extrabold tracking-[0.06em]"
        style={{ color: SUITE_NAVY, fontFamily: SUITE_FONT_UI }}
      >
        Talk track by stage — say this
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={`${item.stage}-${i}`}
            style={{
              ...SUITE_INSIGHT_CARD_BASE,
              ...SUITE_INSIGHT_CARD_RAIL_LEFT,
              padding: "16px 18px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minHeight: "100%",
            }}
          >
            <div>
              <Eyebrow>{`Stage ${i + 1}`}</Eyebrow>
              <p
                className="m-0 mt-1.5 text-[15px] font-bold leading-snug"
                style={{ color: SUITE_NAVY, fontFamily: SUITE_FONT_UI }}
              >
                {item.stage}
              </p>
            </div>
            <Field label="Goal in the room" body={item.objective} />
            <Field label="Say this" body={item.keyMessage} />
            <Field label="Show this" body={item.proof} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiscoveryScriptCards({ items }: { items: DiscoveryScriptItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <p
        className="m-0 text-[11px] font-extrabold tracking-[0.06em]"
        style={{ color: SUITE_NAVY, fontFamily: SUITE_FONT_UI }}
      >
        Discovery scripts — ask, then use what you hear
      </p>
      {items.map((item, i) => (
        <div
          key={`${item.question.slice(0, 24)}-${i}`}
          style={{
            ...SUITE_INSIGHT_CARD_BASE,
            border: `1px solid ${SUITE_BORDER}`,
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            className="px-4 py-3.5 sm:px-5"
            style={{ background: "linear-gradient(180deg, #F0F4FA 0%, #F7FAFC 100%)" }}
          >
            <Eyebrow>Ask this</Eyebrow>
            <p
              className="m-0 mt-1.5 text-[15px] font-semibold leading-snug"
              style={{ color: SUITE_NAVY, fontFamily: SUITE_FONT_UI }}
            >
              {item.question}
            </p>
          </div>
          <div className="grid gap-0 sm:grid-cols-2">
            <div className="border-t border-slate-200/90 px-4 py-3.5 sm:border-r sm:px-5">
              <Field label="Use when" body={item.useWhen} />
            </div>
            <div className="border-t border-slate-200/90 px-4 py-3.5 sm:px-5">
              <Field label="Listen for — then say" body={item.listenFor} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProofPlacementCards({ items }: { items: ProofPlacementItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <p
        className="m-0 text-[11px] font-extrabold tracking-[0.06em]"
        style={{ color: SUITE_NAVY, fontFamily: SUITE_FONT_UI }}
      >
        Proof to deploy — ready leave-behinds
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <div
            key={`${item.persona}-${item.stage}-${i}`}
            style={{
              ...SUITE_INSIGHT_CARD_BASE,
              ...SUITE_INSIGHT_CARD_RAIL_LEFT,
              padding: "16px 18px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div>
              <Eyebrow>{item.stage}</Eyebrow>
              <p
                className="m-0 mt-1 text-[15px] font-bold"
                style={{ color: SUITE_NAVY, fontFamily: SUITE_FONT_UI }}
              >
                {item.persona}
              </p>
            </div>
            <Field label="Proof they need" body={item.proof} />
            <Field label="How you hand it over" body={item.delivery} />
          </div>
        ))}
      </div>
    </div>
  );
}
