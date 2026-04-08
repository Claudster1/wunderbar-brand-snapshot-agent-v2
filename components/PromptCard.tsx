"use client";

import { useState } from "react";
import type { Prompt } from "@/lib/promptPackData";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const GREEN = "#0EA472";
const MID_GRAY = "#5A6B7E";
const BORDER = "#E0E8F0";
const LIGHT_BLUE = "#E8F6FE";

const PACK_COLORS: Record<string, string> = {
  foundational: BLUE,
  execution: GREEN,
  advanced: NAVY,
};

interface PromptCardProps {
  prompt: Prompt;
  resolvedText: string;
  preFilledCount: number;
  totalBracketedCount: number;
  onAskWundy: (prompt: Prompt) => void;
}

export default function PromptCard({
  prompt,
  resolvedText,
  preFilledCount,
  totalBracketedCount,
  onAskWundy,
}: PromptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const packColor = PACK_COLORS[prompt.pack] ?? BLUE;

  async function handleCopy() {
    const plainText = resolvedText.replace(/\s+/g, " ").trim();
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${packColor}`,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        marginBottom: 10,
        fontFamily: "'Lato', sans-serif",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <span
          style={{
            flexShrink: 0,
            padding: "2px 8px",
            borderRadius: 10,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            backgroundColor: `${packColor}18`,
            color: packColor,
            whiteSpace: "nowrap",
          }}
        >
          {prompt.packLabel} · {prompt.id}
        </span>

        <span
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 600,
            color: NAVY,
          }}
        >
          {prompt.name}
        </span>

        <span
          style={{
            flexShrink: 0,
            fontSize: 12,
            color: preFilledCount > 0 ? BLUE : MID_GRAY,
            fontWeight: preFilledCount > 0 ? 600 : 400,
            whiteSpace: "nowrap",
          }}
        >
          {preFilledCount > 0
            ? `✓ ${preFilledCount} pre-filled`
            : `${totalBracketedCount} fields to fill`}
        </span>

        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            flexShrink: 0,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke={MID_GRAY}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ padding: "14px 0 12px" }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                color: MID_GRAY,
                display: "block",
                marginBottom: 4,
              }}
            >
              Why this works for you
            </span>
            <p style={{ fontSize: 13, color: "#2D3A4A", lineHeight: 1.6, margin: 0 }}>
              {prompt.whyItMatters}
            </p>
          </div>

          <div
            style={{
              padding: "10px 12px",
              backgroundColor: LIGHT_BLUE,
              borderRadius: 6,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                color: BLUE,
                display: "block",
                marginBottom: 4,
              }}
            >
              How to use
            </span>
            <p style={{ fontSize: 13, color: NAVY, lineHeight: 1.5, margin: 0 }}>
              {prompt.howToUse}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 12,
              fontSize: 12,
              color: MID_GRAY,
            }}
          >
            {preFilledCount > 0 && (
              <span style={{ color: BLUE, fontWeight: 600 }}>
                ✓ {preFilledCount} fields pre-filled from your results
              </span>
            )}
            {totalBracketedCount - preFilledCount > 0 && (
              <span>○ {totalBracketedCount - preFilledCount} fields to complete manually</span>
            )}
          </div>

          <div
            style={{
              backgroundColor: "#F7F9FC",
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: "14px 16px",
              marginBottom: 14,
            }}
          >
            <pre
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: "#2D3A4A",
                fontFamily: "'Lato', sans-serif",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {resolvedText}
            </pre>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleCopy}
              style={{
                padding: "10px 20px",
                backgroundColor: copied ? "#16A34A" : BLUE,
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {copied ? "Copied ✓" : "Copy Prompt"}
            </button>

            <button
              onClick={() => onAskWundy(prompt)}
              style={{
                padding: "10px 20px",
                backgroundColor: "transparent",
                color: NAVY,
                border: `2px solid ${BORDER}`,
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Ask Wundy™
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
