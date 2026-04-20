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
  SUITE_CHROME_MUTED,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_LG,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
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

const FIELD_LINE = /^- \*\*(.+?)\*\*:\s*(.*)$/;

type LabeledField = { label: string; value: string };

/** Parse `- **Label:**` blocks; multi-line values when the label line ends with `:**` and empty remainder. */
function extractLabeledFields(content: string): { intro: string; fields: LabeledField[] } | null {
  const lines = content.split("\n");
  let start = 0;
  while (start < lines.length && !FIELD_LINE.test(lines[start].trim())) {
    start++;
  }
  if (start >= lines.length) return null;

  const intro = lines.slice(0, start).join("\n").trim();
  const fields: LabeledField[] = [];
  let i = start;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    const m = trimmed.match(FIELD_LINE);
    if (!m) break;
    const label = m[1].trim();
    let value = m[2] ?? "";
    i++;
    if (!value) {
      const bodyLines: string[] = [];
      while (i < lines.length) {
        const nextTrim = lines[i].trim();
        if (FIELD_LINE.test(nextTrim)) break;
        bodyLines.push(lines[i]);
        i++;
      }
      value = bodyLines.join("\n").trim();
    }
    fields.push({ label, value });
  }
  if (fields.length === 0) return null;
  return { intro, fields };
}

function FieldStack({ fields, baseKey }: { fields: LabeledField[]; baseKey: string }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {fields.map((f, idx) => (
        <div
          key={`${baseKey}-f-${idx}-${f.label}`}
          style={{
            paddingBottom: 14,
            borderBottom: idx < fields.length - 1 ? `1px solid ${BORDER}` : undefined,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: SUITE_CHROME_MUTED,
              fontFamily: SUITE_FONT_UI,
            }}
          >
            {f.label}
          </p>
          <div
            style={{
              marginTop: 6,
              fontSize: 14,
              color: SUITE_TEXT_PRIMARY,
              lineHeight: 1.65,
              fontFamily: SUITE_FONT_UI,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {f.value || "—"}
          </div>
        </div>
      ))}
    </div>
  );
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
              color: SUITE_TEXT_PRIMARY,
              lineHeight: 1.65,
              fontFamily: SUITE_FONT_UI,
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
            color: SUITE_TEXT_PRIMARY,
            lineHeight: 1.55,
            fontFamily: SUITE_FONT_UI,
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

/** Prefer labeled-field layout when the section is mostly `- **Key:**` rows (email playbooks). */
function renderSectionContent(content: string, baseKey: string): ReactNode {
  const parsed = extractLabeledFields(content);
  if (!parsed) {
    return renderContentBlocks(content, baseKey);
  }
  const { intro, fields } = parsed;
  return (
    <>
      {intro ? (
        <div style={{ marginBottom: fields.length ? 16 : 0 }}>{renderContentBlocks(intro, `${baseKey}-intro`)}</div>
      ) : null}
      <FieldStack fields={fields} baseKey={baseKey} />
    </>
  );
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
        marginBottom: index < total - 1 ? 20 : 0,
        padding: "20px 22px 22px",
        borderRadius: SUITE_RADIUS_LG,
        border: `1px solid ${BORDER}`,
        background: "#FFFFFF",
        boxShadow: SUITE_SHADOW_CARD,
        borderLeft: `3px solid rgba(7, 176, 242, 0.55)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: NAVY,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            fontFamily: SUITE_FONT_UI,
          }}
        >
          {sec.title}
        </h2>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: SUITE_CHROME_MUTED,
            letterSpacing: "0.02em",
            flexShrink: 0,
            fontFamily: SUITE_FONT_UI,
          }}
        >
          {index + 1} / {total}
        </span>
      </div>
      <div style={{ marginTop: 16 }}>{renderSectionContent(sec.content, sec.id)}</div>
    </article>
  );
}

type Props = {
  body: string;
  /** When set, copy hints match the plan (e.g. email lifecycle vs generic playbook). */
  sectionId?: string;
};

export default function ActivationPlanReadableBody({ body, sectionId }: Props) {
  const sections = useMemo(() => splitActivationBodyIntoSections(body), [body]);

  const navHint =
    sectionId === "email-lifecycle"
      ? "Each chip is one layer or email block: how to read → optional report notes → ICP-by-tier touches → starter sequence. Within a nurture email, **Subject line** is the inbox title; **Preheader** is the preview line beneath it (not a second subject)."
      : "Each chip is one part of the plan — bullets and paragraphs are separated so nothing runs together.";

  if (sections.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: 14, color: MID_GRAY, lineHeight: 1.6, fontFamily: SUITE_FONT_UI }}>
        No playbook text in this section yet.
      </p>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          padding: "16px 18px",
          borderRadius: SUITE_RADIUS_LG,
          background: "#FFFFFF",
          border: `1px solid ${BORDER}`,
          boxShadow: SUITE_SHADOW_CARD,
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 11,
            fontWeight: 700,
            color: BLUE,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: SUITE_FONT_UI,
          }}
        >
          On this page
        </p>
        <nav aria-label="Section navigation" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: `1px solid ${BORDER}`,
                background: "#F5F5F7",
                fontSize: 12,
                fontWeight: 600,
                color: NAVY,
                textDecoration: "none",
                fontFamily: SUITE_FONT_UI,
                maxWidth: "100%",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {truncateNavLabel(sec.title)}
            </a>
          ))}
        </nav>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.55, fontFamily: SUITE_FONT_UI }}>
          {navHint}
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
