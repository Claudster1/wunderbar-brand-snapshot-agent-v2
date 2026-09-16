"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  splitActivationBodyIntoSections,
  type ActivationBodySection,
  type ActivationBodySubsection,
} from "@/lib/activation/parseActivationPlanBody";
import { getPlaybookSubsectionChrome } from "@/lib/strategy/journeyMapTileChrome";
import StrategyProseBody from "@/components/strategy/StrategyProseBody";
import LabeledFieldCards from "@/components/strategy/LabeledFieldCards";
import {
  extractEmailSendMap,
  type EmailSendMapRow,
} from "@/lib/activation/parseEmailSendMap";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BG_CARD,
  SUITE_BG_PAGE,
  SUITE_BORDER,
  SUITE_CHROME_MUTED,
  SUITE_FONT_UI,
  SUITE_MICRO_EYEBROW_STYLE,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_LG,
  SUITE_RADIUS_MD,
  SUITE_RADIUS_SM,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
  SUITE_TYPE,
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

/** `- **Label:** value` (colon inside bold) or `- **Label**: value` (colon outside). */
const FIELD_LINE = /^- \*\*(.+?)(?::\*\*|\*\*:)\s*(.*)$/;

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
        if (FIELD_LINE.test(nextTrim) || /^#{1,6}\s/.test(nextTrim)) break;
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

function displayFieldLabel(label: string): string {
  const key = label.trim().toLowerCase();
  if (/^subject( line)?$/.test(key)) return "SUBJECT LINE";
  if (/^(preheader|inbox preview)$/.test(key)) return "INBOX PREVIEW";
  if (/^(body|email body)$/.test(key) || key.includes("paste-ready") || key.startsWith("body ")) {
    return "EMAIL BODY";
  }
  if (/^(hero image|image idea|image prompt)/.test(key)) return "IMAGE IDEA";
  if (/^(video prompt|video idea)/.test(key)) return "VIDEO IDEA";
  if (/^(primary cta|main next step|main button)$/.test(key)) return "MAIN NEXT STEP";
  if (/^(secondary cta|optional second step)$/.test(key)) return "OPTIONAL SECOND STEP";
  if (/^cta$/.test(key)) return "NEXT STEP";
  return label.trim().toUpperCase();
}

function FieldStack({ fields }: { fields: LabeledField[]; baseKey: string }) {
  return (
    <LabeledFieldCards
      parts={fields.map((f) => ({ label: displayFieldLabel(f.label), value: f.value }))}
      className="flex flex-col gap-3.5"
      renderValue={(value) =>
        value ? (
          <StrategyProseBody
            text={value}
            paragraphStyle={{
              margin: 0,
              fontSize: 15,
              color: SUITE_TEXT_PRIMARY,
              lineHeight: 1.65,
              fontFamily: SUITE_FONT_UI,
              whiteSpace: "pre-line",
            }}
          />
        ) : (
          "—"
        )
      }
    />
  );
}

const PROSE_PARA = {
  margin: "0 0 12px" as const,
  fontSize: 15,
  color: SUITE_TEXT_PRIMARY,
  lineHeight: 1.65,
  fontFamily: SUITE_FONT_UI,
  whiteSpace: "pre-line" as const,
};

function stageBadgeStyle(stage: string): { bg: string; color: string } {
  const key = stage.trim().toLowerCase();
  if (key.includes("noticed") || key.includes("aware")) return { bg: "#E0F2FE", color: "#0369A1" };
  if (key.includes("closer") || key.includes("consider")) return { bg: "#FEF3C7", color: "#92400E" };
  if (key.includes("choose") || key.includes("decision") || key.includes("convert")) {
    return { bg: "#DCFCE7", color: "#166534" };
  }
  if (key.includes("stay") || key.includes("retention") || key.includes("retain")) {
    return { bg: "#EDE9FE", color: "#5B21B6" };
  }
  if (key.includes("welcome back") || key.includes("re-engage") || key.includes("reengage")) {
    return { bg: "#FFE4E6", color: "#9F1239" };
  }
  return { bg: "#F1F5F9", color: SUITE_MUTED };
}

function EmailSendScheduleTable({ rows }: { rows: EmailSendMapRow[] }) {
  return (
    <div
      style={{
        marginTop: 4,
        marginBottom: 4,
        borderRadius: SUITE_RADIUS_SM,
        border: `1px solid ${BORDER}`,
        overflow: "hidden",
        background: SUITE_BG_CARD,
        boxShadow: SUITE_SHADOW_CARD,
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: NAVY,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            fontFamily: SUITE_FONT_UI,
          }}
        >
          Send map
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.72)",
            fontFamily: SUITE_FONT_UI,
          }}
        >
          {rows.length} sends · build in this order
        </p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            fontFamily: SUITE_FONT_UI,
            minWidth: 520,
          }}
        >
          <thead>
            <tr style={{ background: "#F1F5F9" }}>
              {["EMAIL #", "WHEN", "JOB OF THIS EMAIL", "SUBJECT"].map((label) => (
                <th
                  key={label}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: SUITE_TYPE.eyebrowMicro,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    color: SUITE_MUTED,
                    borderBottom: `1px solid ${BORDER}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const badge = stageBadgeStyle(row.stage);
              return (
                <tr
                  key={`${row.emailNum}-${index}`}
                  style={{ background: index % 2 === 0 ? SUITE_BG_CARD : "#FAFBFC" }}
                >
                  <td
                    style={{
                      padding: "11px 12px",
                      borderBottom: `1px solid ${BORDER}`,
                      verticalAlign: "top",
                      width: 72,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 28,
                        height: 28,
                        padding: "0 8px",
                        borderRadius: 999,
                        background: NAVY,
                        color: "#FFFFFF",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {row.emailNum}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "11px 12px",
                      borderBottom: `1px solid ${BORDER}`,
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                      fontWeight: 700,
                      color: NAVY,
                      width: 96,
                    }}
                  >
                    {row.when}
                  </td>
                  <td
                    style={{
                      padding: "11px 12px",
                      borderBottom: `1px solid ${BORDER}`,
                      verticalAlign: "top",
                      width: 120,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 9px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        background: badge.bg,
                        color: badge.color,
                      }}
                    >
                      {row.stage}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "11px 12px",
                      borderBottom: `1px solid ${BORDER}`,
                      verticalAlign: "top",
                      color: SUITE_TEXT_PRIMARY,
                      lineHeight: 1.45,
                      fontWeight: 500,
                    }}
                  >
                    {row.subject}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderProseOrFields(content: string, baseKey: string): ReactNode {
  if (!content.trim()) return null;
  const parsed = extractLabeledFields(content);
  if (!parsed) {
    return <StrategyProseBody text={content} paragraphStyle={PROSE_PARA} />;
  }
  const { intro, fields } = parsed;
  return (
    <>
      {intro ? (
        <div style={{ marginBottom: fields.length ? 16 : 0 }}>
          <StrategyProseBody text={intro} paragraphStyle={PROSE_PARA} />
        </div>
      ) : null}
      <FieldStack fields={fields} baseKey={baseKey} />
    </>
  );
}

/** Prefer send-map schedule table, then labeled-field cards, then prose. */
function renderSectionContent(content: string, baseKey: string): ReactNode {
  const sendMap = extractEmailSendMap(content);
  if (sendMap) {
    return (
      <div className="flex flex-col gap-4">
        {sendMap.before ? renderProseOrFields(sendMap.before, `${baseKey}-before`) : null}
        <EmailSendScheduleTable rows={sendMap.rows} />
        {sendMap.after ? renderProseOrFields(sendMap.after, `${baseKey}-after`) : null}
      </div>
    );
  }
  return renderProseOrFields(content, baseKey);
}

function SubsectionCard({
  sub,
  chromeIndex,
  stepNumber,
  compact,
}: {
  sub: ActivationBodySubsection;
  chromeIndex: number;
  stepNumber: number;
  compact?: boolean;
}) {
  const chrome = getPlaybookSubsectionChrome(chromeIndex);
  const pad = compact ? "14px 16px 16px" : "18px 20px 20px";
  return (
    <article
      id={sub.id}
      style={{
        scrollMarginTop: 108,
        padding: pad,
        borderRadius: SUITE_RADIUS_LG,
        border: `1px solid ${chrome.border}`,
        background: `linear-gradient(145deg, ${chrome.bgFrom} 0%, ${chrome.bgTo} 100%)`,
        boxShadow: SUITE_SHADOW_CARD,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "999px",
            fontSize: 12,
            fontWeight: 800,
            color: "#FFFFFF",
            background: chrome.numberBg,
            fontFamily: SUITE_FONT_UI,
          }}
          aria-hidden
        >
          {stepNumber}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: NAVY,
              lineHeight: 1.3,
              letterSpacing: "-0.015em",
              fontFamily: SUITE_FONT_UI,
            }}
          >
            {sub.title}
          </h3>
          <div style={{ marginTop: compact ? 10 : 12 }}>{renderSectionContent(sub.content, sub.id)}</div>
        </div>
      </div>
    </article>
  );
}

function SectionCard({
  sec,
  index,
  total,
  subsectionChromeStart,
  compact,
}: {
  sec: ActivationBodySection;
  index: number;
  total: number;
  subsectionChromeStart: number;
  compact?: boolean;
}) {
  const hasSubsections = Boolean(sec.subsections?.length);
  const outerChrome = getPlaybookSubsectionChrome(index);
  const pad = compact ? "14px 16px 16px" : "20px 22px 22px";
  const gap = compact ? 12 : 14;

  return (
    <article
      id={sec.id}
      style={{
        scrollMarginTop: 108,
        marginBottom: index < total - 1 ? (compact ? 14 : 20) : 0,
        padding: pad,
        borderRadius: SUITE_RADIUS_LG,
        border: `1px solid ${hasSubsections ? BORDER : outerChrome.border}`,
        background: hasSubsections
          ? `linear-gradient(180deg, ${SUITE_BG_PAGE} 0%, ${SUITE_BG_CARD} 88%)`
          : `linear-gradient(145deg, ${outerChrome.bgFrom} 0%, ${outerChrome.bgTo} 100%)`,
        boxShadow: SUITE_SHADOW_CARD,
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
            fontSize: 13,
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

      {hasSubsections ? (
        <>
          {sec.content.trim() ? (
            <div style={{ marginTop: 14 }}>{renderSectionContent(sec.content, `${sec.id}-intro`)}</div>
          ) : null}
          <div style={{ marginTop: sec.content.trim() ? 16 : 14, display: "grid", gap }}>
            {(sec.subsections ?? []).map((sub, j) => (
              <SubsectionCard
                key={sub.id}
                sub={sub}
                chromeIndex={subsectionChromeStart + j}
                stepNumber={j + 1}
                compact={compact}
              />
            ))}
          </div>
        </>
      ) : (
        <div style={{ marginTop: 16 }}>{renderSectionContent(sec.content, sec.id)}</div>
      )}
    </article>
  );
}

function isPrimaryNavGroup(label: string): boolean {
  const key = label.toLowerCase();
  return (
    key.startsWith("start here") ||
    key.includes("start here") ||
    key.includes("email sequence") ||
    key.includes("paste-ready")
  );
}

function shortChildLabel(label: string): { title: string; meta?: string } {
  const m = label.match(/^Email\s+(\d+)\s*[·•]\s*(.+?)(?:\s*[·•]\s*(.+))?$/i);
  if (m) {
    return {
      title: `Email ${m[1]}`,
      meta: [m[2]?.trim(), m[3]?.trim()].filter(Boolean).join(" · "),
    };
  }
  return { title: truncateNavLabel(label, 42) };
}

type NavEntry = { id: string; label: string; depth: 0 | 1 };

type NavGroup = { id: string; label: string; children: Array<{ id: string; label: string }> };

function buildNavEntries(sections: ActivationBodySection[]): NavEntry[] {
  const out: NavEntry[] = [];
  for (const sec of sections) {
    if (sec.subsections?.length) {
      out.push({ id: sec.id, label: sec.title, depth: 0 });
      for (const sub of sec.subsections) {
        out.push({ id: sub.id, label: sub.title, depth: 1 });
      }
    } else {
      out.push({ id: sec.id, label: sec.title, depth: 0 });
    }
  }
  return out;
}

function groupNavEntries(entries: NavEntry[]): NavGroup[] {
  const groups: NavGroup[] = [];
  for (const entry of entries) {
    if (entry.depth === 0) {
      groups.push({ id: entry.id, label: entry.label, children: [] });
      continue;
    }
    const parent = groups[groups.length - 1];
    if (parent) parent.children.push({ id: entry.id, label: entry.label });
    else groups.push({ id: entry.id, label: entry.label, children: [] });
  }
  return groups;
}

function scrollToPlanSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function PlanContentsNav({
  entries,
  hint,
}: {
  entries: NavEntry[];
  hint: string;
}) {
  const groups = groupNavEntries(entries);
  const primaryIndex = groups.findIndex((g) => isPrimaryNavGroup(g.label));
  const primary = primaryIndex >= 0 ? groups[primaryIndex]! : groups[0] ?? null;
  const secondary = groups.filter((g) => g.id !== primary?.id);

  return (
    <div
      style={{
        marginBottom: 22,
        borderRadius: SUITE_RADIUS_LG,
        border: `1px solid ${BORDER}`,
        background: `linear-gradient(165deg, #F8FBFF 0%, ${SUITE_BG_CARD} 42%, ${SUITE_BG_CARD} 100%)`,
        boxShadow: SUITE_SHADOW_CARD,
        overflow: "hidden",
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: `1px solid ${BORDER}`,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 240px" }}>
          <p
            style={{
              ...SUITE_MICRO_EYEBROW_STYLE,
              color: BLUE,
            }}
          >
            On this page
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 15, color: MID_GRAY, lineHeight: 1.5, maxWidth: 560 }}>
            {hint}
          </p>
        </div>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 180, flex: "0 1 220px" }}>
          <span
            style={{
              ...SUITE_MICRO_EYEBROW_STYLE,
              color: SUITE_CHROME_MUTED,
            }}
          >
            Jump to
          </span>
          <select
            defaultValue=""
            aria-label="Jump to section"
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              scrollToPlanSection(id);
              e.currentTarget.value = "";
            }}
            style={{
              width: "100%",
              padding: "9px 10px",
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              background: SUITE_BG_CARD,
              color: NAVY,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: SUITE_FONT_UI,
            }}
          >
            <option value="">Pick a section…</option>
            {entries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.depth ? `· ${truncateNavLabel(entry.label, 48)}` : truncateNavLabel(entry.label, 48)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav aria-label="Plan contents" style={{ padding: "14px 16px 16px" }}>
        {primary ? (
          <div
            style={{
              borderRadius: SUITE_RADIUS_MD,
              border: "1px solid rgba(7, 176, 242, 0.35)",
              background: SUITE_BG_CARD,
              padding: "14px 14px 12px",
              boxShadow: "0 1px 0 rgba(2, 24, 89, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 28,
                  height: 28,
                  padding: "0 8px",
                  borderRadius: 999,
                  background: NAVY,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {(primaryIndex >= 0 ? primaryIndex : 0) + 1}
              </span>
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <p
                  style={{
                    ...SUITE_MICRO_EYEBROW_STYLE,
                    color: BLUE,
                  }}
                >
                  Start here
                </p>
                <a
                  href={`#${primary.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToPlanSection(primary.id);
                  }}
                  style={{
                    margin: "2px 0 0",
                    display: "inline-block",
                    fontSize: 17,
                    fontWeight: 800,
                    color: NAVY,
                    textDecoration: "none",
                    lineHeight: 1.3,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {truncateNavLabel(primary.label, 72)}
                </a>
              </div>
              {primary.children.length > 0 ? (
                <span style={{ fontSize: 13, fontWeight: 700, color: MID_GRAY }}>
                  {primary.children.every((c) => /^Email\s+\d+/i.test(c.label))
                    ? `${primary.children.length} emails`
                    : `${primary.children.length} sections`}
                </span>
              ) : null}
            </div>

            {primary.children.length > 0 ? (
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {primary.children.map((child, i) => {
                  const parts = shortChildLabel(child.label);
                  return (
                  <a
                    key={child.id}
                    href={`#${child.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToPlanSection(child.id);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "12px 10px",
                      borderRadius: 10,
                      border: `1px solid ${BORDER}`,
                      background: SUITE_BG_PAGE,
                      textDecoration: "none",
                      color: NAVY,
                      fontSize: 14,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      minHeight: 88,
                      width: 168,
                      maxWidth: "100%",
                      flex: "0 0 168px",
                      textAlign: "center",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        background: NAVY,
                        color: "#FFFFFF",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        lineHeight: 1,
                        textAlign: "center",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        minWidth: 0,
                        maxWidth: "100%",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ display: "block", textAlign: "center", width: "100%" }}>
                        {parts.title}
                      </span>
                      {parts.meta ? (
                        <span
                          style={{
                            display: "block",
                            width: "100%",
                            fontSize: 13,
                            fontWeight: 600,
                            color: MID_GRAY,
                            lineHeight: 1.35,
                            textAlign: "center",
                          }}
                        >
                          {parts.meta}
                        </span>
                      ) : null}
                    </span>
                  </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {secondary.length > 0 ? (
          <div style={{ marginTop: primary ? 14 : 0 }}>
            <p
              style={{
                ...SUITE_MICRO_EYEBROW_STYLE,
                margin: "0 0 8px",
                color: SUITE_CHROME_MUTED,
                letterSpacing: "0.08em",
              }}
            >
              Also in this plan
            </p>
            <ol
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 8,
              }}
            >
              {secondary.map((group, index) => {
                const step = groups.findIndex((g) => g.id === group.id) + 1;
                return (
                  <li
                    key={group.id}
                    style={{
                      borderRadius: 10,
                      border: `1px solid ${BORDER}`,
                      background: SUITE_BG_CARD,
                      padding: "12px 14px",
                      minHeight: 56,
                    }}
                  >
                    <a
                      href={`#${group.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToPlanSection(group.id);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        textDecoration: "none",
                        color: NAVY,
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          marginTop: 1,
                          fontSize: 13,
                          fontWeight: 800,
                          color: BLUE,
                          minWidth: 16,
                        }}
                      >
                        {step || index + 1}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span
                          style={{
                            display: "block",
                            fontSize: 15,
                            fontWeight: 700,
                            lineHeight: 1.35,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {truncateNavLabel(group.label, 56)}
                        </span>
                        {group.children.length > 0 ? (
                          <span
                            style={{
                              display: "block",
                              marginTop: 4,
                              fontSize: 13,
                              fontWeight: 600,
                              color: MID_GRAY,
                              lineHeight: 1.4,
                            }}
                          >
                            {group.children
                              .slice(0, 2)
                              .map((c) => {
                                const parts = shortChildLabel(c.label);
                                return parts.meta ? `${parts.title} (${parts.meta.split(" · ")[0]})` : parts.title;
                              })
                              .join(" · ")}
                            {group.children.length > 2 ? ` · +${group.children.length - 2}` : ""}
                          </span>
                        ) : null}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </nav>
    </div>
  );
}

type Props = {
  body: string;
  /** When set, copy hints match the plan (e.g. email lifecycle vs generic playbook). */
  sectionId?: string;
  /** Overview table: cards only, tighter padding, no contents nav. */
  variant?: "default" | "embedded";
};

export default function ActivationPlanReadableBody({ body, sectionId, variant = "default" }: Props) {
  const sections = useMemo(() => splitActivationBodyIntoSections(body), [body]);
  const navEntries = useMemo(() => buildNavEntries(sections), [sections]);
  const subsectionChromeStarts = useMemo(() => {
    const starts: number[] = [];
    let acc = 0;
    for (const sec of sections) {
      starts.push(acc);
      acc += sec.subsections?.length ?? 0;
    }
    return starts;
  }, [sections]);

  const navHint =
    sectionId === "email-lifecycle"
      ? "Step 1: scan the send map. Step 2: open each email and copy what you need. Step 3: finish setup after the sequence — or download the plan as a document."
      : "Use Start here for the main work, then browse the rest of the plan as needed.";

  if (sections.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: 15, color: MID_GRAY, lineHeight: 1.6, fontFamily: SUITE_FONT_UI }}>
        No playbook text in this section yet.
      </p>
    );
  }

  const embedded = variant === "embedded";

  return (
    <div>
      {!embedded && navEntries.length > 1 ? <PlanContentsNav entries={navEntries} hint={navHint} /> : null}

      <div style={{ display: "grid", gap: 0 }}>
        {sections.map((sec, index) => (
          <SectionCard
            key={sec.id}
            sec={sec}
            index={index}
            total={sections.length}
            subsectionChromeStart={subsectionChromeStarts[index] ?? 0}
            compact={embedded}
          />
        ))}
      </div>
    </div>
  );
}
