"use client";

import { useEffect, useState } from "react";

import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";
import type { NormalizedImagerySample } from "@/lib/brand/brandImageryNormalize";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;

export type MoodBoardDraftRow = {
  url: string;
  caption: string;
  rationale: string;
};

function samplesToRows(samples: NormalizedImagerySample[]): MoodBoardDraftRow[] {
  if (samples.length === 0) return [{ url: "", caption: "", rationale: "" }];
  return samples.map((s) => ({
    url: s.url,
    caption: s.caption ?? "",
    rationale: s.rationale ?? "",
  }));
}

function rowsToPayload(rows: MoodBoardDraftRow[]): NormalizedImagerySample[] {
  return rows
    .map((r) => ({
      url: r.url.replace(/\s+/g, "").trim(),
      caption: r.caption.trim() || undefined,
      rationale: r.rationale.trim() || undefined,
    }))
    .filter((r) => r.url.length > 0);
}

function looksLikeHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

interface MoodBoardWorkbookPanelProps {
  samples: NormalizedImagerySample[];
  onSave: (samples: NormalizedImagerySample[]) => Promise<void>;
  editable: boolean;
  editWindowExpired?: boolean;
}

export default function MoodBoardWorkbookPanel({
  samples,
  onSave,
  editable,
  editWindowExpired,
}: MoodBoardWorkbookPanelProps) {
  const [rows, setRows] = useState<MoodBoardDraftRow[]>(() => samplesToRows(samples));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setRows(samplesToRows(samples));
  }, [samples]);

  const blocked = !editable || editWindowExpired;

  async function handleSave() {
    setError(null);
    const payload = rowsToPayload(rows);
    for (const p of payload) {
      if (!looksLikeHttpUrl(p.url)) {
        setError("Each URL must be a valid http(s) link.");
        return;
      }
    }
    if (payload.length > 12) {
      setError("Keep at most 12 reference images.");
      return;
    }
    setSaving(true);
    try {
      await onSave(payload);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch {
      setError("Could not save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  function updateRow(index: number, patch: Partial<MoodBoardDraftRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { url: "", caption: "", rationale: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [{ url: "", caption: "", rationale: "" }] : next;
    });
  }

  return (
    <div
      style={{
        marginBottom: 28,
        padding: "18px 20px",
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        borderLeft: `4px solid ${BLUE}`,
        background: "linear-gradient(135deg, #FFFFFF 0%, #F7FBFF 100%)",
        boxShadow: "0 8px 20px rgba(2,24,89,0.05)",
        scrollMarginTop: 120,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Mood board reference images
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: MID_GRAY, lineHeight: 1.55, maxWidth: 720 }}>
            Paste HTTPS image or asset URLs you trust (licensed stock, your photography, mood links). These appear as thumbnails
            on the Brand Standards tab and in exported brand standards PDFs. Textual mood keywords still come from your Blueprint+ report.
          </p>
        </div>
        {blocked ? (
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: MID_GRAY }}>
            {editWindowExpired ? "Blueprint edit window closed." : "Upgrade to Blueprint to edit."}
          </p>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 16px",
              backgroundColor: BLUE,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
              cursor: saving ? "wait" : "pointer",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            {saving ? "Saving…" : savedFlash ? "Saved" : "Save mood board"}
          </button>
        )}
      </div>

      {error ? (
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#B91C1C", fontWeight: 600 }}>{error}</p>
      ) : null}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {rows.map((row, index) => (
          <div
            key={`mood-row-${index}`}
            style={{
              padding: "12px 14px",
              borderRadius: 6,
              border: `1px solid ${BORDER}`,
              background: "#FFFFFF",
              display: "grid",
              gap: 8,
            }}
          >
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Image URL
              </span>
              <input
                type="url"
                value={row.url}
                onChange={(e) => updateRow(index, { url: e.target.value })}
                disabled={blocked}
                placeholder="https://…"
                style={{
                  padding: "8px 10px",
                  borderRadius: 5,
                  border: `1px solid ${BORDER}`,
                  fontSize: 13,
                  fontFamily: "ui-monospace, monospace",
                }}
              />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: MID_GRAY }}>Caption (optional)</span>
                <input
                  type="text"
                  value={row.caption}
                  onChange={(e) => updateRow(index, { caption: e.target.value })}
                  disabled={blocked}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: `1px solid ${BORDER}`,
                    fontSize: 13,
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: MID_GRAY }}>Why this fits (optional)</span>
                <input
                  type="text"
                  value={row.rationale}
                  onChange={(e) => updateRow(index, { rationale: e.target.value })}
                  disabled={blocked}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: `1px solid ${BORDER}`,
                    fontSize: 13,
                  }}
                />
              </label>
            </div>
            {!blocked ? (
              <button
                type="button"
                onClick={() => removeRow(index)}
                style={{
                  justifySelf: "start",
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#B91C1C",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Lato', sans-serif",
                }}
              >
                Remove row
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {!blocked ? (
        <button
          type="button"
          onClick={addRow}
          style={{
            marginTop: 10,
            padding: "6px 12px",
            fontSize: 13,
            fontWeight: 700,
            color: BLUE,
            background: `${BLUE}12`,
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Add another URL
        </button>
      ) : null}
    </div>
  );
}
