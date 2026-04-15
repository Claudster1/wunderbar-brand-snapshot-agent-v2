"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";
import {
  derivePaidPlatformsList,
  ensurePaidMediaChannelsMinimum,
  normalizePaidChannel,
  paidChannelDisplayTitle,
  type NormalizedPaidChannel,
} from "@/lib/activation/paidMediaPlanFields";

const NAVY = SUITE_NAVY;
const MID = SUITE_MUTED;
const BORDER = SUITE_BORDER;
const BLUE = SUITE_ACCENT_BRIGHT;

const ROWS: { key: keyof NormalizedPaidChannel; label: string }[] = [
  { key: "platform", label: "Platform" },
  { key: "placement", label: "Placement / format" },
  { key: "headline", label: "Headline" },
  { key: "subheadline", label: "Subheadline" },
  { key: "bodyCopy", label: "Body copy" },
  { key: "imagePrompt", label: "Image prompt" },
  { key: "videoPrompt", label: "Video prompt" },
  { key: "cta", label: "CTA" },
  { key: "objective", label: "Objective" },
  { key: "audienceAngle", label: "Audience angle" },
  { key: "offerStrategy", label: "Offer" },
  { key: "kpiToTrack", label: "KPI" },
  { key: "creativeDirection", label: "Creative direction" },
];

const BTN: CSSProperties = {
  padding: "7px 12px",
  borderRadius: 7,
  border: `1px solid ${BORDER}`,
  background: "#FFFFFF",
  color: NAVY,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Lato', sans-serif",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function formatScenarioLine(raw: unknown): string {
  const b = asRecord(raw) ?? {};
  const label = typeof b.label === "string" ? b.label.trim() : "";
  const spend = typeof b.monthlySpend === "number" ? b.monthlySpend : 0;
  const fit = typeof b.objectiveFit === "string" ? b.objectiveFit.trim() : "";
  const out = typeof b.expectedOutcome === "string" ? b.expectedOutcome.trim() : "";
  return `• ${label || "Scenario"}: ~$${spend.toLocaleString()}/mo — ${fit || "fit TBD"} — ${out || "expected outcome"}`;
}

function csvEscapeCell(value: string): string {
  const s = value.replace(/\r\n/g, "\n").replace(/"/g, '""');
  if (/[,"\n]/.test(s)) return `"${s}"`;
  return s;
}

function buildPaidMediaChannelsCsv(channels: NormalizedPaidChannel[]): string {
  const header = ["Channel", ...ROWS.map((r) => r.label)].map(csvEscapeCell).join(",");
  const lines = channels.map((ch, index) => {
    const title = paidChannelDisplayTitle(ch, index);
    const cells = [
      title,
      ...ROWS.map(({ key }) => {
        const v = ch[key];
        return typeof v === "string" ? v.trim() : "";
      }),
    ];
    return cells.map(csvEscapeCell).join(",");
  });
  return [header, ...lines].join("\n");
}

function channelToPlainText(ch: NormalizedPaidChannel, index: number): string {
  const title = paidChannelDisplayTitle(ch, index);
  const parts: string[] = [title, ""];
  for (const { key, label } of ROWS) {
    const value = ch[key];
    if (key === "creativeDirection" && !value) continue;
    if ((key === "platform" || key === "placement") && !value) continue;
    parts.push(`${label}: ${value || "—"}`);
  }
  return parts.join("\n");
}

export default function PaidMediaActivationCreatives({ strategy }: { strategy: Record<string, unknown> }) {
  const s = ensurePaidMediaChannelsMinimum({ ...strategy });
  const overview = typeof s.overview === "string" ? s.overview.trim() : "";
  const rawChannels = Array.isArray(s.channels) ? s.channels : [];
  const scenarios = Array.isArray(s.budgetScenarios) ? s.budgetScenarios : [];

  const normalizedChannels = rawChannels.map((raw) => normalizePaidChannel(raw));

  const [activeIndex, setActiveIndex] = useState(0);
  const [copyFlash, setCopyFlash] = useState<"channel" | "overview" | null>(null);

  useEffect(() => {
    setActiveIndex((i) => {
      if (normalizedChannels.length === 0) return 0;
      return Math.min(Math.max(0, i), normalizedChannels.length - 1);
    });
  }, [normalizedChannels.length]);

  const activeCh = normalizedChannels[activeIndex];
  const platformSummary = derivePaidPlatformsList(s);

  function downloadCsv() {
    if (normalizedChannels.length === 0) return;
    const csv = buildPaidMediaChannelsCsv(normalizedChannels);
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paid-media-channels-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyActiveChannel() {
    if (!activeCh) return;
    const text = channelToPlainText(activeCh, activeIndex);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFlash("channel");
      window.setTimeout(() => setCopyFlash(null), 2000);
    } catch {
      /* ignore */
    }
  }

  async function copyOverview() {
    if (!overview) return;
    try {
      await navigator.clipboard.writeText(overview);
      setCopyFlash("overview");
      window.setTimeout(() => setCopyFlash(null), 2000);
    } catch {
      /* ignore */
    }
  }

  const pillLabel = (ch: NormalizedPaidChannel, index: number) => {
    const full = paidChannelDisplayTitle(ch, index);
    if (full.length <= 36) return full;
    const plat = ch.platform || `Channel ${index + 1}`;
    return plat.length <= 34 ? plat : `${plat.slice(0, 32)}…`;
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {overview ? (
        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 800,
                color: MID,
                letterSpacing: "0.03em",
              }}
            >
              Program Overview
            </p>
            <button type="button" onClick={copyOverview} style={BTN} disabled={!overview}>
              {copyFlash === "overview" ? "Copied" : "Copy overview"}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#2D3A4A", lineHeight: 1.6, whiteSpace: "pre-line" }}>{overview}</p>
        </div>
      ) : null}

      {normalizedChannels.length > 0 ? (
        <div
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            overflow: "hidden",
            background: "#FFFFFF",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              background: "#F8FAFC",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: "1 1 200px" }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: MID, letterSpacing: "0.06em" }}>
                Channel creative (one at a time)
              </p>
              {platformSummary.length > 0 ? (
                <p style={{ margin: 0, fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>
                  {normalizedChannels.length} surface{normalizedChannels.length === 1 ? "" : "s"}: {platformSummary.join(", ")}
                </p>
              ) : null}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <button type="button" onClick={copyActiveChannel} style={BTN} disabled={!activeCh}>
                {copyFlash === "channel" ? "Copied" : "Copy this channel"}
              </button>
              <button
                type="button"
                onClick={downloadCsv}
                style={{
                  ...BTN,
                  background: NAVY,
                  color: "#FFFFFF",
                  borderColor: NAVY,
                }}
              >
                Download .csv (all channels)
              </button>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Paid media channels"
            style={{
              padding: "10px 12px",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              borderBottom: `1px solid ${BORDER}`,
              background: "#FFFFFF",
            }}
          >
            {normalizedChannels.map((ch, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={`pill-${paidChannelDisplayTitle(ch, index)}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveIndex(index)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: `1px solid ${selected ? BLUE : BORDER}`,
                    background: selected ? "#E8F6FE" : "#FFFFFF",
                    color: NAVY,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Lato', sans-serif",
                    maxWidth: "100%",
                    textAlign: "left",
                  }}
                >
                  {pillLabel(ch, index)}
                </button>
              );
            })}
          </div>

          {activeCh ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              <caption
                style={{
                  captionSide: "top",
                  textAlign: "left",
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 800,
                  color: NAVY,
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                {paidChannelDisplayTitle(activeCh, activeIndex)}
              </caption>
              <tbody>
                {ROWS.map(({ key, label }) => {
                  const value = activeCh[key];
                  if (key === "creativeDirection" && !value) return null;
                  if ((key === "platform" || key === "placement") && !value) return null;
                  return (
                    <tr key={key} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <th
                        scope="row"
                        style={{
                          width: "28%",
                          minWidth: 120,
                          verticalAlign: "top",
                          textAlign: "left",
                          padding: "10px 12px",
                          fontWeight: 700,
                          color: MID,
                          background: "#FAFBFC",
                        }}
                      >
                        {label}
                      </th>
                      <td
                        style={{
                          verticalAlign: "top",
                          padding: "10px 12px",
                          color: value ? "#1e293b" : MID,
                          lineHeight: 1.55,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {value || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : null}
        </div>
      ) : null}

      {scenarios.length > 0 ? (
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11,
              fontWeight: 800,
              color: MID,
              letterSpacing: "0.03em",
            }}
          >
            Budget Scenarios
          </p>
          <div style={{ fontSize: 13, color: "#2D3A4A", lineHeight: 1.55 }}>
            {scenarios.slice(0, 4).map((sc, i) => (
              <p key={i} style={{ margin: "0 0 6px" }}>
                {formatScenarioLine(sc)}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
