"use client";

import { useEffect, useState } from "react";
import type { WorkbookSection as WorkbookSectionType } from "@/lib/workbookTypes";
import StrategyProseBody from "@/components/strategy/StrategyProseBody";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_MD,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const GREEN = "#16A34A";
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;
const LIGHT = "#F7F9FC";
const BODY = SUITE_TEXT_PRIMARY;

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
  const [formatGuideOpen, setFormatGuideOpen] = useState(false);
  const [areaFocused, setAreaFocused] = useState(false);
  /** Prefer structured read view when content exists; empty sections start in edit. */
  const [isEditing, setIsEditing] = useState(() => isEditable && !content.trim());
  const isDirty = localContent !== content;

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  function startEditing() {
    setLocalContent(content);
    setIsEditing(true);
  }

  function cancelEditing() {
    setLocalContent(content);
    setIsEditing(false);
    setSaveStatus("idle");
  }

  async function handleSave() {
    if (!isDirty || saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      await onSave(section.id, localContent);
      setSaveStatus("saved");
      setLastSaved(new Date());
      setIsEditing(false);
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
        paddingTop: 36,
        marginTop: 36,
        fontFamily: SUITE_FONT_UI,
        scrollMarginTop: 120,
        background: isFocused ? "rgba(248,251,255,0.95)" : "transparent",
        borderRadius: isFocused ? SUITE_RADIUS_MD : 0,
        boxShadow: isFocused ? "inset 0 0 0 1px rgba(7,176,242,0.22)" : "none",
        paddingLeft: isFocused ? 14 : 0,
        paddingRight: isFocused ? 14 : 0,
        paddingBottom: isFocused ? 14 : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0, letterSpacing: "-0.01em" }}>
              {section.label}
            </h3>
            {section.pillar && (
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: "rgba(7,176,242,0.1)",
                  color: BLUE,
                }}
              >
                {section.pillar}
              </span>
            )}
            {!isEditable && (
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: "#F1F5F9",
                  color: MID_GRAY,
                }}
              >
                Read only
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: MID_GRAY, margin: 0, lineHeight: 1.55, maxWidth: 720 }}>{section.description}</p>
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
            {isEditing && isDirty && saveStatus === "idle" && (
              <span style={{ fontSize: 11, color: MID_GRAY, fontWeight: 600 }}>Unsaved changes</span>
            )}
            {lastSaved && saveStatus === "idle" && !isDirty && (
              <span style={{ fontSize: 11, color: "#94A3B8" }}>
                Last saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {isEditing ? (
              <>
                {content.trim() ? (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saveStatus === "saving"}
                    style={{
                      padding: "9px 14px",
                      backgroundColor: "transparent",
                      color: MID_GRAY,
                      border: `1px solid ${BORDER}`,
                      borderRadius: SUITE_RADIUS_MD,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
                      fontFamily: SUITE_FONT_UI,
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty || saveStatus === "saving"}
                  style={{
                    padding: "9px 18px",
                    backgroundColor: isDirty ? BLUE : "#E8ECF0",
                    color: isDirty ? "#ffffff" : "#94A3B8",
                    border: "none",
                    borderRadius: SUITE_RADIUS_MD,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: isDirty ? "pointer" : "not-allowed",
                    fontFamily: SUITE_FONT_UI,
                  }}
                >
                  {saveStatus === "saving" ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                style={{
                  padding: "9px 18px",
                  backgroundColor: BLUE,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: SUITE_RADIUS_MD,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: SUITE_FONT_UI,
                }}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {editWindowExpired && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: SUITE_RADIUS_MD,
            marginBottom: 14,
            fontSize: 13,
            color: "#92400E",
            lineHeight: 1.5,
          }}
        >
          Your 14-day edit window has closed. This section is now read-only. WunderBrand Blueprint+™ includes unlimited
          edits.
        </div>
      )}

      {section.inputTemplate ? (
        <div style={{ marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => setFormatGuideOpen((o) => !o)}
            aria-expanded={formatGuideOpen}
            style={{
              padding: 0,
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: BLUE,
              fontFamily: SUITE_FONT_UI,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {formatGuideOpen ? "Hide formatting guide" : "Show formatting guide"}
          </button>
          {formatGuideOpen ? (
            <div
              style={{
                marginTop: 10,
                padding: "14px 16px",
                border: `1px solid ${BORDER}`,
                borderRadius: SUITE_RADIUS_MD,
                backgroundColor: "#FAFBFD",
                boxShadow: SUITE_SHADOW_CARD,
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: MID_GRAY,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Suggested structure
              </p>
              <StrategyProseBody
                text={section.inputTemplate}
                paragraphStyle={{
                  margin: 0,
                  fontSize: 13,
                  color: BODY,
                  lineHeight: 1.55,
                  fontFamily: SUITE_FONT_UI,
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {isEditable && isEditing ? (
        <div>
          <textarea
            value={localContent}
            onChange={(event) => setLocalContent(event.target.value)}
            placeholder={section.placeholder}
            onFocus={() => setAreaFocused(true)}
            onBlur={() => setAreaFocused(false)}
            style={{
              width: "100%",
              minHeight: 220,
              padding: "16px 18px",
              fontSize: 15,
              lineHeight: 1.65,
              color: NAVY,
              backgroundColor: "#ffffff",
              border: `1px solid ${isDirty ? BLUE : BORDER}`,
              borderRadius: SUITE_RADIUS_MD,
              resize: "vertical",
              fontFamily: SUITE_FONT_UI,
              outline: "none",
              boxSizing: "border-box",
              boxShadow: areaFocused
                ? "0 0 0 3px rgba(7, 176, 242, 0.22), 0 2px 12px rgba(0,0,0,0.04)"
                : isFocused
                  ? "0 2px 12px rgba(0,0,0,0.04)"
                  : "none",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              color: "#94A3B8",
              marginTop: 6,
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <span style={{ lineHeight: 1.4 }}>
              Tip: Use one <span style={{ fontWeight: 600 }}>Label: value</span> per line for a clearer reading view after
              save.
            </span>
            <span style={{ display: "flex", gap: 14, flexShrink: 0 }}>
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "16px 18px",
            backgroundColor: LIGHT,
            border: `1px solid ${BORDER}`,
            borderRadius: SUITE_RADIUS_MD,
            minHeight: 88,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {content.trim() ? (
            <StrategyProseBody text={content} />
          ) : (
            <p style={{ fontSize: 15, color: "#94A3B8", margin: 0, fontStyle: "italic" }}>{section.placeholder}</p>
          )}
        </div>
      )}
    </div>
  );
}
