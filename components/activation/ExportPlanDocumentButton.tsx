"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import {
  SUITE_FONT_UI,
  SUITE_NAVY,
  SUITE_RADIUS_BUTTON,
} from "@/components/results/suiteBrandTokens";
import { downloadActivationPlanSectionMarkdown } from "@/lib/activation/exportActivationPack";

const TOOLTIP =
  "Downloads this plan as a document. Open it in Google Docs, Word, or Notion, then copy the pieces you need into email, ads, or your website.";

function DownloadGlyph({ size = 14 }: { size?: number }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M8 2.5v7.5M8 10l-2.5-2.5M8 10l2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12.5h10"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Props = {
  planLabel: string;
  companyName?: string;
  summary?: string;
  body: string;
  /** Tighter padding for dense tables / chip rows. */
  compact?: boolean;
  style?: CSSProperties;
};

/**
 * Export one Activation plan as a document — open in Docs/Word/Notion, then copy pieces out.
 */
export default function ExportPlanDocumentButton({
  planLabel,
  companyName,
  summary,
  body,
  compact = false,
  style,
}: Props): ReactNode {
  const [flash, setFlash] = useState(false);

  function handleExport() {
    downloadActivationPlanSectionMarkdown({
      planLabel,
      companyName,
      summary,
      body,
    });
    setFlash(true);
    window.setTimeout(() => setFlash(false), 2200);
  }

  const idleLabel = compact ? "Download doc" : "Download plan (document)";
  const doneLabel = compact ? "Downloaded" : "Downloaded — open & use pieces";

  return (
    <button
      type="button"
      onClick={handleExport}
      title={TOOLTIP}
      aria-label={flash ? doneLabel : `${idleLabel}: ${planLabel}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: compact ? "6px 10px" : "8px 12px",
        borderRadius: SUITE_RADIUS_BUTTON,
        border: `1px solid ${flash ? "#059669" : "#94A3B8"}`,
        background: flash ? "#ECFDF5" : "#F8FAFC",
        color: flash ? "#047857" : SUITE_NAVY,
        fontSize: compact ? 11 : 12,
        fontWeight: 700,
        fontFamily: SUITE_FONT_UI,
        cursor: "pointer",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <DownloadGlyph size={compact ? 12 : 14} />
      <span>{flash ? doneLabel : idleLabel}</span>
    </button>
  );
}
