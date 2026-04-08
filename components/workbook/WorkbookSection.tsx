"use client";

import { useEffect, useState } from "react";
import type { WorkbookSection as WorkbookSectionType } from "@/lib/workbookTypes";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const GREEN = "#16A34A";
const MID_GRAY = "#5A6B7E";
const BORDER = "#E0E8F0";
const LIGHT = "#F7F9FC";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface WorkbookSectionProps {
  section: WorkbookSectionType;
  content: string;
  isFocused?: boolean;
  isEditable: boolean;
  editWindowExpired?: boolean;
  onSave: (sectionId: string, content: string) => Promise<void>;
}

export default function WorkbookSectionComponent({
  section,
  content,
  isFocused = false,
  isEditable,
  editWindowExpired = false,
  onSave,
}: WorkbookSectionProps) {
  const [localContent, setLocalContent] = useState(content);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isDirty = localContent !== content;

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  async function handleSave() {
    if (!isDirty || saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      await onSave(section.id, localContent);
      setSaveStatus("saved");
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  const charCount = localContent.length;
  const wordCount = localContent.trim() ? localContent.trim().split(/\s+/).length : 0;

  return (
    <div
      id={`workbook-section-${section.id}`}
      style={{
        borderTop: `1px solid ${BORDER}`,
        paddingTop: 32,
        marginTop: 32,
        fontFamily: "'Lato', sans-serif",
        scrollMarginTop: 120,
        background: isFocused ? "#F8FBFF" : "transparent",
        borderRadius: isFocused ? 10 : 0,
        boxShadow: isFocused ? "0 0 0 1px rgba(7,176,242,0.25) inset" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: 0 }}>{section.label}</h3>
            {section.pillar && (
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: "#E8F6FE",
                  color: BLUE,
                }}
              >
                {section.pillar}
              </span>
            )}
            {!isEditable && (
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: "#F1F5F9",
                  color: MID_GRAY,
                }}
              >
                Read Only
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: MID_GRAY, margin: 0, lineHeight: 1.5 }}>{section.description}</p>
        </div>

        {isEditable && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {saveStatus === "saved" && (
              <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Saved</span>
            )}
            {saveStatus === "error" && (
              <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 600 }}>
                Save failed — try again
              </span>
            )}
            {lastSaved && saveStatus === "idle" && (
              <span style={{ fontSize: 11, color: "#94A3B8" }}>
                Last saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty || saveStatus === "saving"}
              style={{
                padding: "8px 16px",
                backgroundColor: isDirty ? BLUE : "#E2E8F0",
                color: isDirty ? "#ffffff" : "#94A3B8",
                border: "none",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                cursor: isDirty ? "pointer" : "not-allowed",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {saveStatus === "saving" ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {editWindowExpired && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13,
            color: "#92400E",
          }}
        >
          Your 14-day edit window has closed. This section is now read-only. WunderBrand Blueprint+™
          includes unlimited edits.
        </div>
      )}

      {section.inputTemplate && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            backgroundColor: "#F8FBFF",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 11,
              fontWeight: 800,
              color: MID_GRAY,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Recommended Format
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#2D3A4A",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {section.inputTemplate}
          </p>
        </div>
      )}

      {isEditable ? (
        <div>
          <textarea
            value={localContent}
            onChange={(event) => setLocalContent(event.target.value)}
            placeholder={section.placeholder}
            style={{
              width: "100%",
              minHeight: 180,
              padding: "14px 16px",
              fontSize: 14,
              lineHeight: 1.7,
              color: NAVY,
              backgroundColor: "#ffffff",
              border: `1.5px solid ${isDirty ? BLUE : BORDER}`,
              borderRadius: 8,
              resize: "vertical",
              fontFamily: "'Lato', sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              fontSize: 11,
              color: "#94A3B8",
              marginTop: 4,
              gap: 12,
            }}
          >
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "14px 16px",
            backgroundColor: LIGHT,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            minHeight: 80,
          }}
        >
          {localContent ? (
            <p style={{ fontSize: 14, lineHeight: 1.7, color: NAVY, margin: 0, whiteSpace: "pre-wrap" }}>
              {localContent}
            </p>
          ) : (
            <p style={{ fontSize: 14, color: "#CBD5E0", margin: 0, fontStyle: "italic" }}>
              {section.placeholder}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
