"use client";

import type { ReactNode } from "react";

import type { FoundationPersonaAtlasEntry } from "@/lib/foundationPersonaAtlas";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_CHROME_MUTED,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_LG,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

function channelTokens(channels: string): string[] {
  if (!channels.trim()) return [];
  return channels
    .split(/[,;]+/)
    .map((x) => x.replace(/^\s*and\s+/i, "").trim())
    .filter(Boolean);
}

function ListTile({
  tone,
  icon,
  children,
}: {
  tone: "goal" | "fear";
  icon: ReactNode;
  children: ReactNode;
}) {
  const bg =
    tone === "goal"
      ? "linear-gradient(180deg, rgba(236,253,245,0.95) 0%, rgba(255,255,255,0.9) 100%)"
      : "linear-gradient(180deg, rgba(255,251,235,0.95) 0%, rgba(255,255,255,0.92) 100%)";
  const border = tone === "goal" ? "rgba(16,185,129,0.22)" : "rgba(245,158,11,0.28)";
  return (
    <div
      className="flex gap-3 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: tone === "goal" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.14)",
          color: tone === "goal" ? "#047857" : "#B45309",
        }}
        aria-hidden
      >
        {icon}
      </span>
      <p
        className="m-0 min-w-0 flex-1 text-[13px] leading-relaxed sm:text-[14px]"
        style={{ color: SUITE_TEXT_PRIMARY, fontFamily: SUITE_FONT_UI }}
      >
        {children}
      </p>
    </div>
  );
}

function InsightPanel({
  label,
  children,
  footer,
}: {
  label: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className="flex min-h-0 flex-col rounded-xl border bg-white/90 p-4 sm:p-5"
      style={{
        borderColor: SUITE_BORDER,
        boxShadow: SUITE_SHADOW_CARD,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <p
        className="m-0 text-[11px] font-semibold tracking-[0.08em]"
        style={{ color: SUITE_ACCENT_BRIGHT }}
      >
        {label}
      </p>
      <div className="mt-2.5 min-w-0 flex-1 text-[13px] leading-relaxed sm:text-[14px]" style={{ color: SUITE_TEXT_PRIMARY }}>
        {children}
      </div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}

export type PersonaAtlasSuiteProps = {
  entries: FoundationPersonaAtlasEntry[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  /** Short guidance under the section title */
  leadIn?: string;
  /** Accessible label for the persona region */
  regionLabel?: string;
};

export default function PersonaAtlasSuite({
  entries,
  selectedIndex,
  onSelectIndex,
  leadIn,
  regionLabel = "Buyer personas",
}: PersonaAtlasSuiteProps) {
  if (entries.length === 0) return null;

  const safeIdx = Math.min(Math.max(0, selectedIndex), entries.length - 1);
  const profile = entries[safeIdx];
  const panelId = `persona-atlas-panel-${profile.key}`;
  const channels = channelTokens(profile.channels);

  return (
    <div
      className="w-full min-w-0 overflow-hidden border"
      style={{
        borderRadius: SUITE_RADIUS_LG,
        borderColor: "rgba(0,0,0,0.06)",
        background:
          "linear-gradient(165deg, #FFFFFF 0%, #FAFBFD 42%, rgba(232,246,254,0.35) 100%)",
        boxShadow: SUITE_SHADOW_CARD,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <div className="border-b border-black/[0.06] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="m-0 text-[11px] font-semibold tracking-[0.1em] text-brand-blue sm:text-xs">Persona atlas</p>
            <h3 className="bs-h3 mt-1.5 mb-0 text-brand-navy" style={{ color: SUITE_NAVY }}>
              Role-level buyer reference
            </h3>
            {leadIn ? (
              <p className="mt-2 max-w-3xl text-[13px] leading-relaxed sm:text-sm" style={{ color: SUITE_MUTED }}>
                {leadIn}
              </p>
            ) : null}
          </div>
          <p className="m-0 text-[12px] tabular-nums" style={{ color: SUITE_CHROME_MUTED }}>
            {safeIdx + 1} of {entries.length}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Select buyer persona"
          className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {entries.map((entry, idx) => {
            const selected = idx === safeIdx;
            return (
              <button
                key={entry.key}
                type="button"
                role="tab"
                id={`persona-atlas-tab-${entry.key}`}
                aria-selected={selected}
                aria-controls={panelId}
                aria-label={`${entry.tabLabel}: ${entry.title}`}
                onClick={() => onSelectIndex(idx)}
                className="flex min-w-[200px] max-w-[280px] shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/35 focus-visible:ring-offset-2 sm:min-w-0 sm:max-w-none sm:shrink"
                style={{
                  borderColor: selected ? SUITE_ACCENT_BRIGHT : SUITE_BORDER,
                  backgroundColor: selected ? "rgba(230,247,254,0.95)" : "rgba(255,255,255,0.92)",
                  boxShadow: selected ? "0 2px 12px rgba(7,176,242,0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <img
                  src={entry.portraitSrc}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 rounded-[10px] object-cover ring-1 ring-black/[0.06]"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <span className="min-w-0">
                  <span
                    className="block truncate text-[13px] font-semibold sm:text-sm"
                    style={{ color: SUITE_NAVY }}
                  >
                    {entry.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] sm:text-xs" style={{ color: SUITE_MUTED }}>
                    {entry.tabLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-label={regionLabel}
        className="px-4 py-5 sm:px-6 sm:py-6"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-8">
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <div
              className="relative overflow-hidden rounded-2xl p-1"
              style={{
                background: "linear-gradient(145deg, rgba(7,176,242,0.2), rgba(2,24,89,0.06))",
                boxShadow: "0 12px 40px rgba(2,24,89,0.08)",
              }}
            >
              <img
                src={profile.portraitSrc}
                alt={profile.portraitAlt}
                width={160}
                height={160}
                className="h-36 w-36 rounded-[14px] bg-[#E8F6FE] object-cover sm:h-40 sm:w-40"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-full text-center lg:text-left">
              <p className="m-0 text-xl font-semibold tracking-tight sm:text-2xl" style={{ color: SUITE_NAVY }}>
                {profile.title}
              </p>
              <p className="mt-1.5 text-sm font-medium sm:text-base" style={{ color: SUITE_ACCENT_BRIGHT }}>
                {profile.role}
              </p>
            </div>
          </div>

          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            <div>
              <p className="m-0 text-[11px] font-semibold tracking-[0.08em]" style={{ color: SUITE_ACCENT_BRIGHT }}>
                What they are optimizing for
              </p>
              <div className="mt-3 flex flex-col gap-2.5">
                {profile.goals.map((goal) => (
                  <ListTile
                    key={goal}
                    tone="goal"
                    icon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path
                          d="M13.25 4.75L6.75 11.25L3.25 7.75"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  >
                    {goal}
                  </ListTile>
                ))}
              </div>
            </div>
            <div>
              <p className="m-0 text-[11px] font-semibold tracking-[0.08em]" style={{ color: SUITE_ACCENT_BRIGHT }}>
                What could block the yes
              </p>
              <div className="mt-3 flex flex-col gap-2.5">
                {profile.fears.map((fear) => (
                  <ListTile
                    key={fear}
                    tone="fear"
                    icon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path
                          d="M8 4.5v5M8 11.5h.01"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
                      </svg>
                    }
                  >
                    {fear}
                  </ListTile>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <InsightPanel label="Message angle">
            <p className="m-0">{profile.messageAngle}</p>
          </InsightPanel>
          <InsightPanel
            label="Channel mix"
            footer={
              channels.length > 1 ? (
                <div className="flex flex-wrap gap-1.5">
                  {channels.map((c) => (
                    <span
                      key={c}
                      className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        background: "rgba(7,176,242,0.1)",
                        color: SUITE_NAVY,
                        border: `1px solid rgba(7,176,242,0.2)`,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : null
            }
          >
            <p className="m-0">{profile.channels}</p>
          </InsightPanel>
          <InsightPanel label="Primary call to action">
            <p className="m-0 font-medium" style={{ color: SUITE_NAVY }}>
              {profile.cta}
            </p>
          </InsightPanel>
        </div>
      </div>
    </div>
  );
}
