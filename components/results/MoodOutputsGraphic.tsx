"use client";

import { useMemo } from "react";
import type { NormalizedMoodBoardDescriptors } from "@/lib/brand/brandImageryNormalize";
import { SectionGlyph } from "@/components/results/BrandIcons";

const NAVY = "#021859";
const BORDER = "#E0E3EA";

const SEGMENT_FILLS = ["#07b0f2", "#0d9488", "#6366f1", "#021859"] as const;

function pieSlicePath(cx: number, cy: number, rOuter: number, rInner: number, startRad: number, endRad: number): string {
  const x1o = cx + rOuter * Math.cos(startRad);
  const y1o = cy + rOuter * Math.sin(startRad);
  const x2o = cx + rOuter * Math.cos(endRad);
  const y2o = cy + rOuter * Math.sin(endRad);
  const x1i = cx + rInner * Math.cos(endRad);
  const y1i = cy + rInner * Math.sin(endRad);
  const x2i = cx + rInner * Math.cos(startRad);
  const y2i = cy + rInner * Math.sin(startRad);
  const sweep = endRad - startRad;
  const largeArc = sweep > Math.PI ? 1 : 0;
  return [
    `M ${x1o} ${y1o}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2o} ${y2o}`,
    `L ${x1i} ${y1i}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2i} ${y2i}`,
    "Z",
  ].join(" ");
}

function atmosphereWeight(mood: NormalizedMoodBoardDescriptors): number {
  const prose =
    (mood.lighting_conditions?.length ?? 0) +
    (mood.color_moods?.length ?? 0) +
    (mood.designer_note?.length ?? 0);
  if (prose <= 0) return 0;
  return Math.max(2, Math.min(12, Math.ceil(prose / 160)));
}

/** Non-zero segments only; total drives slice angles. */
function moodBalanceParts(mood: NormalizedMoodBoardDescriptors) {
  const wAt = atmosphereWeight(mood);
  const raw = [
    { id: "keywords", label: "Keywords", w: mood.adjectives?.length ?? 0, fill: SEGMENT_FILLS[0]! },
    { id: "textures", label: "Textures", w: mood.textures?.length ?? 0, fill: SEGMENT_FILLS[1]! },
    { id: "environments", label: "Environments", w: mood.environments?.length ?? 0, fill: SEGMENT_FILLS[2]! },
    { id: "atmosphere", label: "Light, color & brief", w: wAt, fill: SEGMENT_FILLS[3]! },
  ];
  const parts = raw.filter((p) => p.w > 0);
  const total = parts.reduce((s, p) => s + p.w, 0);
  return { parts, total };
}

function chipAccent(tag: string, i: number): string {
  const palette = ["#07b0f2", "#021859", "#0d9488", "#6366f1", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"];
  let h = i * 17;
  for (let j = 0; j < tag.length; j++) h = (h * 31 + tag.charCodeAt(j)) >>> 0;
  return palette[h % palette.length]!;
}

type Props = {
  moodDesc: NormalizedMoodBoardDescriptors;
};

/**
 * Graphic summary of structured mood outputs: balance donut + pillar cards.
 */
export function MoodOutputsGraphic({ moodDesc }: Props) {
  const { parts, total } = useMemo(() => moodBalanceParts(moodDesc), [moodDesc]);

  const cx = 50;
  const cy = 50;
  const rOuter = 40;
  const rInner = 22;

  const donutSlices = useMemo(() => {
    if (parts.length === 0 || total <= 0) return [];
    if (parts.length === 1) {
      const only = parts[0]!;
      return [{ ...only, d: "", pct: 100, kind: "full" as const }];
    }
    let angle = -Math.PI / 2;
    return parts.map((p) => {
      const share = p.w / total;
      const sweep = share * 2 * Math.PI;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      const d = sweep < 1e-6 ? "" : pieSlicePath(cx, cy, rOuter, rInner, start, end);
      return { ...p, d, pct: Math.round(share * 100), kind: "slice" as const };
    });
  }, [parts, total]);

  const hasAtmosphereText =
    Boolean(moodDesc.lighting_conditions) || Boolean(moodDesc.color_moods) || Boolean(moodDesc.designer_note);

  const ariaLabel = `Mood balance: ${donutSlices.map((s) => `${s.label} ${s.pct} percent`).join(", ")}`;

  return (
    <div
      className="mb-4 overflow-hidden rounded-xl border border-slate-200/90 bg-gradient-to-br from-[#f8fbff] via-white to-[#f5faf9] px-4 py-5 shadow-sm sm:px-5 sm:py-6"
      role="img"
      aria-label={ariaLabel}
    >
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-brand-blue">Mood map</p>
      <p className="mt-1 text-sm text-brand-muted sm:text-[13px]">
        Donut shows how much each pillar contributes in this report (tag counts plus condensed weight for lighting, color,
        and designer brief). Cards spell out the same outputs.
      </p>

      <div className="mt-5 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="flex shrink-0 flex-col items-center">
          <svg viewBox="0 0 100 100" className="h-44 w-44 sm:h-52 sm:w-52" aria-hidden>
            {donutSlices[0]?.kind === "full" ? (
              <>
                <circle cx={cx} cy={cy} r={rOuter} fill={donutSlices[0].fill} />
                <circle cx={cx} cy={cy} r={rInner} fill="white" stroke={BORDER} strokeWidth={0.5} />
                <text
                  x={cx}
                  y={cy - 4}
                  textAnchor="middle"
                  className="fill-brand-navy"
                  style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.06em" }}
                >
                  MOOD
                </text>
                <text
                  x={cx}
                  y={cy + 8}
                  textAnchor="middle"
                  className="fill-brand-muted"
                  style={{ fontSize: 5.5, fontWeight: 600 }}
                >
                  MIX
                </text>
              </>
            ) : (
              donutSlices.map((seg) =>
                seg.d ? <path key={seg.id} d={seg.d} fill={seg.fill} stroke="white" strokeWidth={0.6} /> : null,
              )
            )}
            {donutSlices[0]?.kind !== "full" ? (
              <circle cx={cx} cy={cy} r={rInner - 0.5} fill="white" stroke={BORDER} strokeWidth={0.5} />
            ) : null}
            {donutSlices.length > 0 ? (
              <>
                <text
                  x={cx}
                  y={cy - 4}
                  textAnchor="middle"
                  className="fill-brand-navy"
                  style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.06em" }}
                >
                  MOOD
                </text>
                <text
                  x={cx}
                  y={cy + 8}
                  textAnchor="middle"
                  className="fill-brand-muted"
                  style={{ fontSize: 5.5, fontWeight: 600 }}
                >
                  MIX
                </text>
              </>
            ) : null}
          </svg>
          {donutSlices.length > 0 ? (
            <ul
              className="mt-3 flex max-w-xs flex-wrap justify-center gap-x-4 gap-y-1.5 p-0 text-[11px] sm:text-xs"
              style={{ listStyle: "none", margin: 0 }}
              aria-hidden
            >
              {donutSlices.map((seg) => (
                <li key={`leg-${seg.id}`} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm ring-1 ring-black/10"
                    style={{ backgroundColor: seg.fill }}
                  />
                  <span className="text-brand-navy">
                    {seg.label} <span className="tabular-nums text-brand-muted">({seg.pct}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="grid w-full min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          <MoodPillarCard title="Mood keywords" glyphToken="positioning" accent="#07b0f2" items={moodDesc.adjectives} />
          <MoodPillarCard title="Textures" glyphToken="visual" accent="#0d9488" items={moodDesc.textures} />
          <MoodPillarCard title="Environments" glyphToken="journey" accent="#6366f1" items={moodDesc.environments} />
          <div
            className="rounded-lg border bg-white p-3 shadow-sm"
            style={{
              borderColor: BORDER,
              background: "linear-gradient(180deg, #fffefb 0%, #ffffff 100%)",
              borderTop: `3px solid ${SEGMENT_FILLS[3]}`,
            }}
          >
            <div className="flex items-center gap-2">
              <SectionGlyph token="channel" size={18} color={SEGMENT_FILLS[3]} />
              <p className="m-0 text-xs font-extrabold uppercase tracking-[0.06em] text-brand-navy">Light, color & brief</p>
            </div>
            {hasAtmosphereText ? (
              <div className="mt-2 space-y-2 text-[12px] leading-snug text-brand-midnight sm:text-[13px]">
                {moodDesc.lighting_conditions ? (
                  <p className="m-0">
                    <span className="font-bold text-brand-navy">Lighting:</span> {moodDesc.lighting_conditions}
                  </p>
                ) : null}
                {moodDesc.color_moods ? (
                  <p className="m-0">
                    <span className="font-bold text-brand-navy">Color:</span> {moodDesc.color_moods}
                  </p>
                ) : null}
                {moodDesc.designer_note ? (
                  <p className="m-0 italic text-brand-muted">{moodDesc.designer_note}</p>
                ) : null}
              </div>
            ) : (
              <p className="m-0 mt-2 text-xs text-brand-muted">No lighting, color, or designer brief in this block.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MoodPillarCard({
  title,
  glyphToken,
  accent,
  items,
}: {
  title: string;
  glyphToken: "positioning" | "visual" | "journey";
  accent: string;
  items?: string[];
}) {
  return (
    <div
      className="rounded-lg border bg-white p-3 shadow-sm"
      style={{ borderColor: BORDER, borderTop: `3px solid ${accent}` }}
    >
      <div className="flex items-center gap-2">
        <SectionGlyph token={glyphToken} size={18} color={accent} />
        <p className="m-0 text-xs font-extrabold uppercase tracking-[0.06em] text-brand-navy">{title}</p>
      </div>
      {items?.length ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {items.map((t, i) => {
            const c = chipAccent(t, i);
            return (
              <span
                key={`${title}-${t}-${i}`}
                className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold sm:text-xs"
                style={{
                  borderColor: `${c}55`,
                  backgroundColor: `${c}18`,
                  color: NAVY,
                }}
              >
                {t}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="m-0 mt-2 text-xs text-brand-muted">—</p>
      )}
    </div>
  );
}
