"use client";

import type { ReactNode } from "react";
import PromptCard from "@/components/PromptCard";
import {
  SECTION_META,
  getPromptsForSection,
  resolvePromptText,
  type PackId,
  type Prompt,
  type SectionId,
} from "@/lib/promptPackData";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const MID_GRAY = "#5A6B7E";
const BORDER = "#E0E8F0";

interface ExecutionSectionProps {
  sectionId: SectionId;
  productTier: string;
  diagnosticData: Record<string, unknown>;
  onAskWundy: (prompt: Prompt) => void;
  activePack: PackId | "all";
  children?: ReactNode;
}

export default function ExecutionSection({
  sectionId,
  productTier,
  diagnosticData,
  onAskWundy,
  activePack,
  children,
}: ExecutionSectionProps) {
  const meta = SECTION_META[sectionId];
  const prompts = getPromptsForSection(sectionId, productTier, activePack);

  if (prompts.length === 0 && !children) return null;

  return (
    <div
      style={{
        borderTop: `1px solid ${BORDER}`,
        paddingTop: 36,
        marginTop: 36,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: NAVY,
            margin: "0 0 6px",
          }}
        >
          {meta.label}
        </h3>
        <p style={{ fontSize: 14, color: MID_GRAY, lineHeight: 1.5, margin: 0 }}>
          {meta.description}
        </p>
      </div>

      {children && <div style={{ marginBottom: 24 }}>{children}</div>}

      {prompts.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="9" rx="1.5" stroke={BLUE} strokeWidth="1.3" />
              <path
                d="M4 6.5h6M4 9h4"
                stroke={BLUE}
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                color: BLUE,
              }}
            >
              AI Prompts for this section
            </span>
          </div>

          {prompts.map((prompt) => {
            const { resolvedText, preFilledCount, totalBracketedCount } = resolvePromptText(
              prompt,
              diagnosticData,
              productTier,
            );

            return (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                resolvedText={resolvedText}
                preFilledCount={preFilledCount}
                totalBracketedCount={totalBracketedCount}
                onAskWundy={onAskWundy}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
