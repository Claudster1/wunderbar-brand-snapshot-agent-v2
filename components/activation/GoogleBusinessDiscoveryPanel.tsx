"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BG_CARD,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_BUTTON,
  SUITE_RADIUS_MD,
} from "@/components/results/suiteBrandTokens";
import { copyTextToClipboard } from "@/lib/activation/campaignPasteHelpers";
import {
  buildGoogleBusinessPasteFields,
  formatAiDiscoveryPasteBlock,
  formatGoogleBusinessPasteBlock,
} from "@/lib/activation/googleBusinessProfilePaste";

const BTN: CSSProperties = {
  padding: "7px 12px",
  borderRadius: SUITE_RADIUS_BUTTON,
  border: `1px solid ${SUITE_BORDER}`,
  background: SUITE_BG_CARD,
  color: SUITE_NAVY,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: SUITE_FONT_UI,
};

type Props = {
  diagnosticData: Record<string, unknown>;
};

/**
 * Paste-ready Google Business Profile + AI discovery blocks for Search & AI Discovery plans.
 */
export default function GoogleBusinessDiscoveryPanel({ diagnosticData }: Props) {
  const fields = buildGoogleBusinessPasteFields(diagnosticData);
  const [flash, setFlash] = useState<"gbp" | "ai" | null>(null);

  async function copyGbp() {
    const ok = await copyTextToClipboard(formatGoogleBusinessPasteBlock(fields));
    if (!ok) return;
    setFlash("gbp");
    window.setTimeout(() => setFlash(null), 2000);
  }

  async function copyAi() {
    const ok = await copyTextToClipboard(formatAiDiscoveryPasteBlock(fields));
    if (!ok) return;
    setFlash("ai");
    window.setTimeout(() => setFlash(null), 2000);
  }

  return (
    <div
      style={{
        marginBottom: 16,
        padding: "16px 16px 14px",
        borderRadius: SUITE_RADIUS_MD,
        border: `1px solid ${SUITE_BORDER}`,
        borderTop: `2px solid ${SUITE_ACCENT_BRIGHT}`,
        background: "#F0F9FF",
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 14, fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: SUITE_ACCENT_BRIGHT,
        }}
      >
        Show up in search &amp; AI
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 700, color: SUITE_NAVY, lineHeight: 1.4 }}>
        {fields.showGoogleBusiness
          ? "Google Business Profile + AI answer blocks"
          : "AI answer blocks + search pages"}
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 13, color: SUITE_MUTED, lineHeight: 1.55 }}>
        {fields.showGoogleBusiness
          ? "Local discovery still runs through Maps and Google Business. AI answers need short FAQ blocks on your site. Copy paste-ready text, then finish hours, photos, and categories in Google."
          : "AI assistants and search pull from clear FAQ/answer blocks and consistent pages. Copy the blocks below into your site, then keep the full SEO plan for page targets."}
      </p>

      {fields.oneLiner ? (
        <p style={{ margin: "12px 0 0", fontSize: 13, color: SUITE_NAVY, lineHeight: 1.5 }}>
          <strong>Short listing line: </strong>
          {fields.oneLiner}
        </p>
      ) : null}
      {fields.localSeoNotes ? (
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "#2D3A4A", lineHeight: 1.55 }}>
          <strong>Local / Maps notes: </strong>
          {fields.localSeoNotes}
        </p>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {fields.showGoogleBusiness ? (
          <button
            type="button"
            onClick={copyGbp}
            style={{ ...BTN, borderStyle: "dashed" }}
            title="Copies Google Business listing text to your clipboard"
          >
            {flash === "gbp" ? "Copied — ready to paste" : "Copy listing text"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={copyAi}
          style={{ ...BTN, borderStyle: "dashed" }}
          title="Copies FAQ / AI answer blocks to your clipboard"
        >
          {flash === "ai" ? "Copied — ready to paste" : "Copy FAQ text"}
        </button>
      </div>
    </div>
  );
}
