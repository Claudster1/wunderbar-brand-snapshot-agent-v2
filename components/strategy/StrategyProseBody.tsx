"use client";

import type { CSSProperties, ReactNode } from "react";

import { SUITE_FONT_UI, SUITE_TEXT_PRIMARY } from "@/components/results/suiteBrandTokens";
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

function splitLabeledLine(line: string): { label: string; value: string } | null {
  const trimmed = line.trim();
  const m = trimmed.match(/^([A-Za-z][A-Za-z0-9/&+\- ]{2,28}):\s+(.+)$/);
  if (!m) return null;
  return { label: m[1].trim(), value: m[2].trim() };
}

function RenderLabeledLine({ line }: { line: string }) {
  const parts = splitLabeledLine(line);
  if (!parts) return <>{line}</>;
  return (
    <span className="inline-flex flex-wrap items-start gap-2">
      <span
        className="inline-flex items-center rounded-md border border-brand-blue/30 bg-brand-blue/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-brand-navy"
        style={{ fontFamily: SUITE_FONT_UI }}
      >
        {parts.label}
      </span>
      <span>{parts.value}</span>
    </span>
  );
}

/**
 * Renders strategy prose with real list markup where lines use `-`, `*`, `•`, or `1.` / `1)` prefixes.
 * Unordered lists use `strategy-suite-ul` (bright blue `::marker`, padding, 0.5rem row gap — see `globals.css`).
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
                <p key={`p-${i}-${li}`} style={{ ...DEFAULT_PARA, ...paragraphStyle }}>
                  <RenderLabeledLine line={line} />
                </p>
              ))}
            </div>
          );
        }
        if (b.type === "ul") {
          return (
            <ul
              key={`ul-${i}`}
              className="strategy-suite-ul m-0 space-y-2 text-sm leading-relaxed text-brand-midnight sm:text-[15px]"
              style={{ fontFamily: SUITE_FONT_UI }}
            >
              {b.items.map((item, j) => (
                <li key={`${i}-${j}`} className="leading-relaxed">
                  <RenderLabeledLine line={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <ol
            key={`ol-${i}`}
            className="m-0 list-decimal space-y-2 pl-4 text-sm leading-relaxed text-brand-midnight sm:text-[15px]"
            style={{ fontFamily: SUITE_FONT_UI }}
          >
            {b.items.map((item, j) => (
              <li key={`${i}-${j}`} className="leading-relaxed">
                <RenderLabeledLine line={item} />
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
