"use client";

import type { CSSProperties, ReactNode } from "react";

import { SUITE_FONT_UI, SUITE_NAVY, SUITE_TEXT_PRIMARY } from "@/components/results/suiteBrandTokens";
import { parseStrategyProseToBlocks } from "@/lib/strategy/strategyProseBlocks";

const DEFAULT_PARA: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: SUITE_TEXT_PRIMARY,
  lineHeight: 1.58,
  fontFamily: SUITE_FONT_UI,
  whiteSpace: "pre-line",
};

type Props = {
  text: string;
  paragraphStyle?: CSSProperties;
  /** Extra gap between prose blocks (paragraphs and lists). */
  blockGapClassName?: string;
};

type LabeledPart = { label: string; value: string };

/**
 * Title-case field labels only (e.g. "Stage:", "Key message:", "Why ask:") —
 * avoids treating mid-sentence words like "minutes Objective" as labels.
 */
const LABEL_SPLIT =
  /(?:^|\s)([A-Z][A-Za-z0-9/&+\-]*(?:\s+[a-z][A-Za-z0-9/&+\-]*){0,3}):\s+/g;

/** Split one line into one or more Label → value fields (supports smashed multi-label lines). */
export function splitLabeledParts(line: string): LabeledPart[] | null {
  const trimmed = line.trim();
  if (!trimmed.includes(":")) return null;

  const matches = [...trimmed.matchAll(LABEL_SPLIT)];
  if (matches.length === 0) return null;

  const parts: LabeledPart[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!;
    const label = (m[1] || "").trim();
    if (!label || label.length > 32) continue;
    const valueStart = (m.index ?? 0) + m[0].length;
    const valueEnd = i + 1 < matches.length ? (matches[i + 1]!.index ?? trimmed.length) : trimmed.length;
    const value = trimmed.slice(valueStart, valueEnd).trim();
    if (!value) continue;
    parts.push({ label, value });
  }
  return parts.length > 0 ? parts : null;
}

function FieldStack({ parts }: { parts: LabeledPart[] }) {
  return (
    <div className="flex flex-col gap-3">
      {parts.map((p, i) => (
        <div
          key={`${p.label}-${i}`}
          className="rounded-[5px] border border-slate-200/90 bg-[#F8FBFF] px-3.5 py-3"
          style={{ borderLeft: "3px solid #07B0F2" }}
        >
          <p
            className="m-0 text-[11px] font-bold tracking-[0.04em] text-brand-navy"
            style={{ fontFamily: SUITE_FONT_UI, color: SUITE_NAVY }}
          >
            {p.label}
          </p>
          <p
            className="m-0 mt-1.5 text-sm leading-relaxed sm:text-[15px]"
            style={{ fontFamily: SUITE_FONT_UI, color: SUITE_TEXT_PRIMARY }}
          >
            {p.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function RenderLine({ line, paragraphStyle }: { line: string; paragraphStyle: CSSProperties }) {
  const parts = splitLabeledParts(line);
  if (parts) return <FieldStack parts={parts} />;
  return <p style={{ ...DEFAULT_PARA, ...paragraphStyle }}>{line}</p>;
}

/**
 * Renders strategy prose with real list markup where lines use `-`, `*`, `•`, or `1.` / `1)` prefixes.
 * Labeled lines (`Stage: …`, `Why ask: …`) render as field cards — never as bullet + pill.
 */
export default function StrategyProseBody({
  text,
  paragraphStyle = DEFAULT_PARA,
  blockGapClassName = "gap-3",
}: Props): ReactNode {
  const blocks = parseStrategyProseToBlocks(text);
  if (blocks.length === 0) return null;

  return (
    <div className={`flex flex-col ${blockGapClassName}`}>
      {blocks.map((b, i) => {
        if (b.type === "paragraph") {
          const lines = b.text.split("\n").filter((line) => line.trim().length > 0);
          return (
            <div key={`p-${i}`} className="flex flex-col gap-2">
              {lines.map((line, li) => (
                <RenderLine key={`p-${i}-${li}`} line={line} paragraphStyle={paragraphStyle} />
              ))}
            </div>
          );
        }

        const itemParts = b.items.map((item) => ({ item, parts: splitLabeledParts(item) }));
        const allLabeled = itemParts.length > 0 && itemParts.every((row) => row.parts);

        if (allLabeled) {
          return (
            <div key={`fields-${i}`} className="flex flex-col gap-3 sm:gap-4">
              {itemParts.map((row, j) => (
                <FieldStack key={`${i}-${j}`} parts={row.parts!} />
              ))}
            </div>
          );
        }

        if (b.type === "ul") {
          return (
            <ul
              key={`ul-${i}`}
              className="strategy-suite-ul m-0 space-y-3 text-sm leading-relaxed text-brand-midnight sm:text-[15px]"
              style={{ fontFamily: SUITE_FONT_UI }}
            >
              {itemParts.map((row, j) => (
                <li key={`${i}-${j}`} className={row.parts ? "list-none pl-0" : "leading-relaxed"}>
                  {row.parts ? <FieldStack parts={row.parts} /> : row.item}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <ol
            key={`ol-${i}`}
            className="m-0 list-decimal space-y-3 pl-4 text-sm leading-relaxed text-brand-midnight sm:text-[15px]"
            style={{ fontFamily: SUITE_FONT_UI }}
          >
            {itemParts.map((row, j) => (
              <li key={`${i}-${j}`} className="leading-relaxed">
                {row.parts ? <FieldStack parts={row.parts} /> : row.item}
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
