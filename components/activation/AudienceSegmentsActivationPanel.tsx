"use client";

import type { ReactNode } from "react";
import {
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const MID = SUITE_MUTED;
const BORDER = SUITE_BORDER;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 8px",
        fontSize: 11,
        fontWeight: 800,
        color: MID,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}
    >
      {children}
    </p>
  );
}

function CardShell({ title, children }: { title: string; children: ReactNode }) {
  return (
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
          padding: "10px 14px",
          background: "#F8FAFC",
          borderBottom: `1px solid ${BORDER}`,
          fontSize: 14,
          fontWeight: 800,
          color: NAVY,
        }}
      >
        {title}
      </div>
      <div style={{ padding: "12px 14px" }}>{children}</div>
    </div>
  );
}

function FieldTable(rows: { label: string; value: string }[]) {
  const filtered = rows.filter((r) => r.value);
  if (!filtered.length) return null;
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 13,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <tbody>
        {filtered.map(({ label, value }) => (
          <tr key={label} style={{ borderBottom: `1px solid ${BORDER}` }}>
            <th
              scope="row"
              style={{
                width: "30%",
                minWidth: 110,
                verticalAlign: "top",
                textAlign: "left",
                padding: "8px 10px",
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
                padding: "8px 10px",
                color: "#1e293b",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export type AudienceSegmentsActivationPanelProps = {
  icp: Record<string, unknown> | null;
  personaSeg?: Record<string, unknown> | null;
  audienceDef?: Record<string, unknown> | null;
};

export default function AudienceSegmentsActivationPanel({
  icp,
  personaSeg,
  audienceDef,
}: AudienceSegmentsActivationPanelProps) {
  const overview = icp ? asString(icp.overview) : "";

  const icpDefBlocks: { title: string; fields: { label: string; value: string }[] }[] = [];
  if (audienceDef) {
    for (const key of ["primaryICP", "secondaryICP"] as const) {
      const b = asRecord(audienceDef[key]);
      if (!b) continue;
      const label = asString(b.icpLabel) || asString(b.name) || key;
      const fields = [
        { label: "Profile", value: asString(b.summary) },
        { label: "Conversion path", value: asString(b.conversionPath) },
      ];
      if (fields.some((f) => f.value))
        icpDefBlocks.push({
          title: label,
          fields,
        });
    }
    const add = Array.isArray(audienceDef.additionalICPs) ? audienceDef.additionalICPs : [];
    for (const raw of add.slice(0, 4)) {
      const b = asRecord(raw) ?? {};
      const label = asString(b.icpLabel) || asString(b.name) || "ICP";
      const f = [{ label: "Profile", value: asString(b.summary) }];
      if (f[0].value) icpDefBlocks.push({ title: label, fields: f });
    }
  }

  const conversionProfiles = icp && Array.isArray(icp.conversionProfile) ? icp.conversionProfile : [];
  const matrix = icp && Array.isArray(icp.contentTypeConversionMatrix) ? icp.contentTypeConversionMatrix : [];
  const mechanics = icp && Array.isArray(icp.channelLevelConversionMechanics) ? icp.channelLevelConversionMechanics : [];
  const sequences = icp && Array.isArray(icp.multiTouchConversionSequence) ? icp.multiTouchConversionSequence : [];
  const signals = icp && Array.isArray(icp.behavioralSignalLibrary) ? icp.behavioralSignalLibrary : [];
  const hooks = icp && Array.isArray(icp.hookTypePerformance) ? icp.hookTypePerformance : [];

  const segStrategy = personaSeg ? asString(personaSeg.segmentationStrategy) : "";
  const segments = personaSeg && Array.isArray(personaSeg.segments) ? personaSeg.segments : [];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {icpDefBlocks.length > 0 ? (
        <div>
          <SectionKicker>ICP &amp; audience definitions</SectionKicker>
          <div style={{ display: "grid", gap: 12 }}>
            {icpDefBlocks.map((block, i) => (
              <CardShell key={`${block.title}-${i}`} title={block.title}>
                {FieldTable(block.fields)}
              </CardShell>
            ))}
          </div>
        </div>
      ) : null}

      {overview ? (
        <div>
          <SectionKicker>Conversion intelligence overview</SectionKicker>
          <p style={{ margin: 0, fontSize: 14, color: "#2D3A4A", lineHeight: 1.6, whiteSpace: "pre-line" }}>{overview}</p>
        </div>
      ) : null}

      {conversionProfiles.length > 0 ? (
        <div>
          <SectionKicker>ICP conversion profiles</SectionKicker>
          <div style={{ display: "grid", gap: 10 }}>
            {conversionProfiles.slice(0, 6).map((raw, i) => {
              const p = asRecord(raw) ?? {};
              return (
                <CardShell key={i} title={asString(p.icpTier) || `ICP tier ${i + 1}`}>
                  {FieldTable([
                    { label: "Buying cycle", value: asString(p.buyingCycleLength) },
                    { label: "Primary barrier", value: asString(p.primaryConversionBarrier) },
                    { label: "Decision trigger", value: asString(p.decisionTrigger) },
                    { label: "Behavior pattern", value: asString(p.conversionBehaviorPattern) },
                  ])}
                </CardShell>
              );
            })}
          </div>
        </div>
      ) : null}

      {matrix.length > 0 ? (
        <div>
          <SectionKicker>Content × funnel matrix</SectionKicker>
          <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 10, background: "#FFFFFF" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1120,
                borderCollapse: "collapse",
                fontSize: 12,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              <thead>
                <tr style={{ background: NAVY, color: "#FFFFFF" }}>
                  {[
                    "ICP tier",
                    "Stage",
                    "Winning format",
                    "CTA",
                    "Pillar",
                    "Why it converts",
                    "Example headline",
                    "Draft copy",
                    "Image prompt",
                    "Video prompt",
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      style={{
                        textAlign: "left",
                        padding: "10px 10px",
                        fontWeight: 700,
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.slice(0, 14).map((raw, i) => {
                  const m = asRecord(raw) ?? {};
                  const attrs = Array.isArray(m.requiredContentAttributes)
                    ? (m.requiredContentAttributes as unknown[]).filter((x): x is string => typeof x === "string")
                    : [];
                  const why = [asString(m.whyItConverts), attrs.length ? `Required: ${attrs.join("; ")}` : ""]
                    .filter(Boolean)
                    .join("\n");
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 ? "#F8FAFC" : "#FFFFFF" }}>
                      <td style={{ padding: "10px", verticalAlign: "top", fontWeight: 700, color: NAVY }}>
                        {asString(m.icpTier) || "—"}
                      </td>
                      <td style={{ padding: "10px", verticalAlign: "top" }}>{asString(m.funnelStage) || "—"}</td>
                      <td style={{ padding: "10px", verticalAlign: "top", whiteSpace: "pre-wrap" }}>
                        {asString(m.highestConvertingContentType) || "—"}
                      </td>
                      <td style={{ padding: "10px", verticalAlign: "top", whiteSpace: "pre-wrap", fontWeight: 600 }}>
                        {asString(m.convertingCTA) || "—"}
                      </td>
                      <td style={{ padding: "10px", verticalAlign: "top" }}>{asString(m.leadMessagePillar) || "—"}</td>
                      <td style={{ padding: "10px", verticalAlign: "top", whiteSpace: "pre-wrap", color: "#334155" }}>
                        {why || "—"}
                      </td>
                      <td style={{ padding: "10px", verticalAlign: "top", whiteSpace: "pre-wrap", fontWeight: 600 }}>
                        {asString(m.exampleHeadline) || "—"}
                      </td>
                      <td style={{ padding: "10px", verticalAlign: "top", whiteSpace: "pre-wrap", color: "#1e293b" }}>
                        {asString(m.examplePrimaryCopy) || "—"}
                      </td>
                      <td style={{ padding: "10px", verticalAlign: "top", whiteSpace: "pre-wrap", color: "#475569", fontSize: 12 }}>
                        {asString(m.exampleImagePrompt) || "—"}
                      </td>
                      <td style={{ padding: "10px", verticalAlign: "top", whiteSpace: "pre-wrap", color: "#475569", fontSize: 12 }}>
                        {asString(m.exampleVideoPrompt) || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {mechanics.length > 0 ? (
        <div>
          <SectionKicker>Channel-level conversion mechanics</SectionKicker>
          <div style={{ display: "grid", gap: 10 }}>
            {mechanics.slice(0, 10).map((raw, i) => {
              const m = asRecord(raw) ?? {};
              const formats = Array.isArray(m.convertingFormats)
                ? m.convertingFormats.filter((x): x is string => typeof x === "string")
                : [];
              const fails = Array.isArray(m.failurePatterns)
                ? m.failurePatterns.filter((x): x is string => typeof x === "string")
                : [];
              return (
                <CardShell
                  key={i}
                  title={`${asString(m.icpTier) || "ICP"} — ${asString(m.channel) || "Channel"}`}
                >
                  {FieldTable([
                    { label: "Formats that convert", value: formats.join(", ") },
                    { label: "Message length", value: asString(m.optimalMessageLength) },
                    { label: "Conversion action", value: asString(m.conversionAction) },
                    { label: "Follow-up logic", value: asString(m.followUpLogic) },
                    { label: "Failure patterns", value: fails.slice(0, 6).join("; ") },
                  ])}
                </CardShell>
              );
            })}
          </div>
        </div>
      ) : null}

      {sequences.length > 0 ? (
        <div>
          <SectionKicker>Multi-touch sequences</SectionKicker>
          <div style={{ display: "grid", gap: 12 }}>
            {sequences.slice(0, 4).map((raw, i) => {
              const seq = asRecord(raw) ?? {};
              const steps = Array.isArray(seq.sequence) ? seq.sequence : [];
              return (
                <CardShell key={i} title={`Sequence — ${asString(seq.icpTier) || `ICP ${i + 1}`}`}>
                  <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
                    {steps.slice(0, 10).map((sraw, j) => {
                      const s = asRecord(sraw) ?? {};
                      const stepTitle = `Step ${asString(s.order) || j + 1}: ${asString(s.channel) || "Channel"} — ${asString(s.touchType) || "touch"}`;
                      return (
                        <div
                          key={j}
                          style={{
                            border: `1px solid ${BORDER}`,
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "#FAFBFC",
                          }}
                        >
                          <div
                            style={{
                              padding: "8px 12px",
                              background: "#EFF6FF",
                              fontSize: 12,
                              fontWeight: 800,
                              color: NAVY,
                            }}
                          >
                            {stepTitle}
                          </div>
                          <div style={{ padding: "10px 12px" }}>
                            {FieldTable([
                              { label: "Objective", value: asString(s.objective) },
                              { label: "Conversion signal", value: asString(s.conversionSignal) },
                              { label: "Headline / subject", value: asString(s.headlineOrSubject) },
                              { label: "Subhead", value: asString(s.subhead) },
                              { label: "Primary copy", value: asString(s.primaryCopy) },
                              { label: "CTA", value: asString(s.cta) },
                              { label: "Image prompt", value: asString(s.imagePrompt) },
                              { label: "Video prompt", value: asString(s.videoPrompt) },
                              { label: "Performance rationale", value: asString(s.performanceRationale) },
                            ])}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {FieldTable([
                    { label: "Critical touch", value: asString(seq.criticalTouch) },
                    { label: "Sales handoff", value: asString(seq.salesHandoffTrigger) },
                  ])}
                </CardShell>
              );
            })}
          </div>
        </div>
      ) : null}

      {signals.length > 0 ? (
        <div>
          <SectionKicker>Behavioral triggers → plays</SectionKicker>
          <div style={{ display: "grid", gap: 12 }}>
            {signals.slice(0, 12).map((raw, i) => {
              const s = asRecord(raw) ?? {};
              const chans = Array.isArray(s.recommendedChannels)
                ? s.recommendedChannels.filter((x): x is string => typeof x === "string")
                : [];
              return (
                <CardShell
                  key={i}
                  title={`${asString(s.signal) || "Signal"} (${asString(s.icpTier) || "ICP"})`}
                >
                  {FieldTable([
                    { label: "Stage shift", value: asString(s.indicatesStageTransition) },
                    { label: "Channels", value: chans.join(", ") },
                    { label: "Headline / subject", value: asString(s.primaryHeadline) },
                    { label: "Subhead", value: asString(s.subhead) },
                    { label: "Body / script", value: asString(s.primaryBody) },
                    { label: "CTA", value: asString(s.cta) },
                    { label: "Image prompt", value: asString(s.imagePrompt) },
                    { label: "Video prompt", value: asString(s.videoPrompt) },
                    { label: "Performance rationale", value: asString(s.performanceRationale) },
                    { label: "Play summary", value: asString(s.triggeredAction) },
                  ])}
                </CardShell>
              );
            })}
          </div>
        </div>
      ) : null}

      {hooks.length > 0 ? (
        <div>
          <SectionKicker>Hook types — use vs avoid</SectionKicker>
          <div style={{ display: "grid", gap: 10 }}>
            {hooks.slice(0, 4).map((raw, i) => {
              const h = asRecord(raw) ?? {};
              const good = Array.isArray(h.reliableHookTypes) ? h.reliableHookTypes : [];
              const bad = Array.isArray(h.hookTypesToAvoid) ? h.hookTypesToAvoid : [];
              return (
                <CardShell key={i} title={`Hooks — ${asString(h.icpTier) || "ICP"}`}>
                  <div style={{ display: "grid", gap: 10 }}>
                    {good.length > 0 ? (
                      <div>
                        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, color: NAVY }}>Use</p>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                          {good.slice(0, 5).map((gr, j) => {
                            const g = asRecord(gr) ?? {};
                            return (
                              <li key={j}>
                                <strong>{asString(g.hookType) || "Hook"}</strong>
                                {asString(g.whyItConverts) ? ` — ${asString(g.whyItConverts)}` : ""}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                    {bad.length > 0 ? (
                      <div>
                        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, color: MID }}>Avoid</p>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                          {bad.slice(0, 4).map((br, j) => {
                            const b = asRecord(br) ?? {};
                            return (
                              <li key={j}>
                                <strong>{asString(b.hookType) || "Hook"}</strong>
                                {asString(b.whyToAvoid) ? ` — ${asString(b.whyToAvoid)}` : ""}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </CardShell>
              );
            })}
          </div>
        </div>
      ) : null}

      {segStrategy || segments.length > 0 ? (
        <div>
          <SectionKicker>Persona-driven segments</SectionKicker>
          {segStrategy ? (
            <p style={{ margin: "0 0 12px", fontSize: 14, color: "#2D3A4A", lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {segStrategy}
            </p>
          ) : null}
          <div style={{ display: "grid", gap: 10 }}>
            {segments.slice(0, 6).map((raw, i) => {
              const s = asRecord(raw) ?? {};
              const tactics = Array.isArray(s.conversionTactics)
                ? s.conversionTactics.filter((x): x is string => typeof x === "string")
                : [];
              const themes = Array.isArray(s.contentCalendarThemes)
                ? s.contentCalendarThemes.filter((x): x is string => typeof x === "string")
                : [];
              const kpis = Array.isArray(s.kpisToTrack)
                ? s.kpisToTrack.filter((x): x is string => typeof x === "string")
                : [];
              return (
                <CardShell key={i} title={asString(s.segmentName) || `Segment ${i + 1}`}>
                  {FieldTable([
                    { label: "Size / value", value: [asString(s.segmentSize), asString(s.revenueValue)].filter(Boolean).join(" · ") },
                    { label: "Messaging angle", value: asString(s.messagingDifferentiation) },
                    { label: "Channel mix", value: asString(s.channelMix) },
                    { label: "Conversion tactics", value: tactics.join("; ") },
                    { label: "Content themes", value: themes.join("; ") },
                    { label: "KPIs", value: kpis.join("; ") },
                  ])}
                </CardShell>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
