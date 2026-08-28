"use client";

import type { CSSProperties, ReactNode } from "react";

import LabeledFieldCards from "@/components/strategy/LabeledFieldCards";
import { SUITE_FONT_UI, SUITE_TEXT_PRIMARY } from "@/components/results/suiteBrandTokens";
import { parseStrategyProseToBlocks } from "@/lib/strategy/strategyProseBlocks";
import { splitLabeledParts } from "@/lib/strategy/labeledProse";

export { splitLabeledParts } from "@/lib/strategy/labeledProse";
export type { LabeledPart } from "@/lib/strategy/labeledProse";

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

function RenderLine({ line, paragraphStyle }: { line: string; paragraphStyle: CSSProperties }) {
  const parts = splitLabeledParts(line);
  if (parts) return <LabeledFieldCards parts={parts} />;
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
                <LabeledFieldCards key={`${i}-${j}`} parts={row.parts!} />
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
                  {row.parts ? <LabeledFieldCards parts={row.parts} /> : row.item}
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
                {row.parts ? <LabeledFieldCards parts={row.parts} /> : row.item}
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
