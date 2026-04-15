"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  splitActivationBodyIntoSections,
  type ActivationBodySection,
} from "@/lib/activation/parseActivationPlanBody";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;

function truncateNavLabel(title: string, max = 48): string {
  const t = title.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function renderContentBlocks(text: string, baseKey: string): ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let bulletAcc: string[] = [];
  let paraAcc: string[] = [];
  let elKey = 0;

  const flushPara = () => {
    if (paraAcc.length) {
      const p = paraAcc.join(" ").trim();
      if (p) {
        elements.push(
          <p
            key={`${baseKey}-p-${elKey++}`}
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              color: "#243447",
              lineHeight: 1.65,
            }}
          >
            {p}
          </p>,
        );
      }
      paraAcc = [];
    }
  };

  const flushBullets = () => {
    if (bulletAcc.length) {
      elements.push(
        <ul
          key={`${baseKey}-ul-${elKey++}`}
          style={{
            margin: "0 0 16px",
            paddingLeft: 22,
            fontSize: 14,
            color: "#243447",
            lineHeight: 1.55,
          }}
        >
          {bulletAcc.map((item, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              {item}
            </li>
          ))}
        </ul>,
      );
      bulletAcc = [];
    }
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushBullets();
      flushPara();
      continue;
    }
    if (/^[-•*]\s/.test(t)) {
      flushPara();
      bulletAcc.push(t.replace(/^[-•*]\s+/, ""));
    } else {
      flushBullets();
      paraAcc.push(t);
    }
  }
  flushBullets();
  flushPara();

  return <>{elements}</>;
}

function SectionCard({
  sec,
  index,
  total,
}: {
  sec: ActivationBodySection;
  index: number;
  total: number;
}) {
  return (
    <article
      id={sec.id}
      style={{
        scrollMarginTop: 108,
        marginBottom: index < total - 1 ? 22 : 0,
        padding: "16px 18px 18px",
        borderRadius: 10,
        border: `1px solid ${BORDER}`,
        background: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(2, 24, 89, 0.06)",
        borderLeft: `4px solid ${BLUE}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: NAVY,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          {sec.title}
        </h2>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: MID_GRAY,
            letterSpacing: "0.03em",
            flexShrink: 0,
          }}
        >
          {index + 1} / {total}
        </span>
      </div>
      <div style={{ marginTop: 14 }}>{renderContentBlocks(sec.content, sec.id)}</div>
    </article>
  );
}

type Props = {
  body: string;
};

export default function ActivationPlanReadableBody({ body }: Props) {
  const sections = useMemo(() => splitActivationBodyIntoSections(body), [body]);

  if (sections.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: 14, color: MID_GRAY, lineHeight: 1.6 }}>
        No playbook text in this section yet.
      </p>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 18,
          padding: "12px 14px",
          borderRadius: 10,
          background: "linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)",
          border: `1px solid ${BORDER}`,
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 11,
            fontWeight: 800,
            color: BLUE,
            letterSpacing: "0.04em",
          }}
        >
          On This Page
        </p>
        <nav aria-label="Section navigation" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              style={{
                padding: "7px 12px",
                borderRadius: 999,
                border: `1px solid ${BORDER}`,
                background: "#FFFFFF",
                fontSize: 12,
                fontWeight: 700,
                color: NAVY,
                textDecoration: "none",
                fontFamily: "'Lato', sans-serif",
                maxWidth: "100%",
              }}
            >
              {truncateNavLabel(sec.title)}
            </a>
          ))}
        </nav>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.5 }}>
          Tip: each block below is one part of the plan — bullets and paragraphs are separated so nothing runs together.
        </p>
      </div>

      <div style={{ display: "grid", gap: 0 }}>
        {sections.map((sec, index) => (
          <SectionCard key={sec.id} sec={sec} index={index} total={sections.length} />
        ))}
      </div>
    </div>
  );
}
