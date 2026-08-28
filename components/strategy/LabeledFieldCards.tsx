"use client";

import type { CSSProperties, ReactNode } from "react";

import {
  SUITE_FONT_UI,
  SUITE_RADIUS_SM,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";
import { chromeForLabeledField, sanitizeSpokenCustomerScript, stripBrandReplyPrefix } from "@/lib/strategy/labeledFieldChrome";
import type { LabeledPart } from "@/lib/strategy/labeledProse";

type Props = {
  parts: LabeledPart[];
  /** Optional richer value rendering (e.g. nested prose). Defaults to plain text. */
  renderValue?: (value: string, label: string) => ReactNode;
  className?: string;
  style?: CSSProperties;
};

function shouldSanitizeSpokenField(label: string): boolean {
  const key = label.trim().toLowerCase();
  return (
    /^(response|reply|say this|key message|supporting copy|email body|listen for|ask this|question)$/.test(
      key,
    ) ||
    key.includes("response") ||
    key.startsWith("say ") ||
    key.startsWith("listen") ||
    key.startsWith("ask ") ||
    key.includes("what to say")
  );
}

/**
 * Shared labeled-field cards for Strategy + Activation — role-colored rails
 * (Response / Pillar / Proof / …) so both tabs scan as one system.
 */
export default function LabeledFieldCards({
  parts,
  renderValue,
  className = "flex flex-col gap-3",
  style,
}: Props): ReactNode {
  if (parts.length === 0) return null;

  return (
    <div className={className} style={style}>
      {parts.map((p, i) => {
        const chrome = chromeForLabeledField(p.label);
        const cleaned = shouldSanitizeSpokenField(p.label)
          ? sanitizeSpokenCustomerScript(p.value)
          : p.value;
        const raw =
          /^response$/i.test(p.label.trim()) || /^reply$/i.test(p.label.trim())
            ? stripBrandReplyPrefix(cleaned)
            : cleaned;
        return (
          <div
            key={`${p.label}-${i}`}
            className="px-3.5 py-3"
            style={{
              border: `1px solid ${chrome.border}`,
              background: chrome.bg,
              borderLeft: `3px solid ${chrome.rail}`,
              borderRadius: SUITE_RADIUS_SM,
            }}
          >
            <p
              className="m-0 text-[11px] font-bold tracking-[0.04em]"
              style={{ fontFamily: SUITE_FONT_UI, color: chrome.label }}
            >
              {p.label}
            </p>
            <div
              className="m-0 mt-1.5 text-sm leading-relaxed sm:text-[15px]"
              style={{ fontFamily: SUITE_FONT_UI, color: SUITE_TEXT_PRIMARY }}
            >
              {renderValue ? renderValue(raw, p.label) : raw || "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
