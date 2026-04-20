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
          return (
            <p key={`p-${i}`} style={{ ...DEFAULT_PARA, ...paragraphStyle }}>
              {b.text}
            </p>
          );
        }
        if (b.type === "ul") {
          return (
            <ul
              key={`ul-${i}`}
              className="strategy-suite-ul m-0 text-sm leading-relaxed text-brand-midnight sm:text-[15px]"
              style={{ fontFamily: SUITE_FONT_UI }}
            >
              {b.items.map((item, j) => (
                <li key={`${i}-${j}`} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <ol
            key={`ol-${i}`}
            className="m-0 list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-brand-midnight sm:text-[15px]"
            style={{ fontFamily: SUITE_FONT_UI }}
          >
            {b.items.map((item, j) => (
              <li key={`${i}-${j}`} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
