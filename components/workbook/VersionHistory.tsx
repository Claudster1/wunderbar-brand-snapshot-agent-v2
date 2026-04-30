"use client";

import type { WorkbookVersion } from "@/lib/workbookTypes";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const MID_GRAY = "#5A6B7E";
const BORDER = "#E0E8F0";

interface VersionHistoryProps {
  versions: WorkbookVersion[];
  onRestoreVersion: (version: WorkbookVersion) => void;
  onClose: () => void;
}

export default function VersionHistory({
  versions,
  onRestoreVersion,
  onClose,
}: VersionHistoryProps) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.3)",
          zIndex: 200,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          backgroundColor: "#ffffff",
          boxShadow: "-4px 0 24px rgba(2,24,89,0.12)",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: "0 0 2px" }}>
              Version History
            </h3>
            <p style={{ fontSize: 12, color: MID_GRAY, margin: 0 }}>
              {versions.length} saved version{versions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              color: MID_GRAY,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke={MID_GRAY} strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {versions.length === 0 ? (
            <p style={{ fontSize: 14, color: MID_GRAY, textAlign: "center", marginTop: 40 }}>
              No saved versions yet. Save your workbook to create a version checkpoint.
            </p>
          ) : (
            [...versions].reverse().map((version, index) => {
              const savedDate = new Date(version.savedAt);
              const isLatest = index === 0;
              return (
                <div
                  key={version.versionId}
                  style={{
                    padding: "14px 0",
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
                          {version.label ?? `Version ${versions.length - index}`}
                        </span>
                        {isLatest && (
                          <span
                            style={{
                              padding: "1px 7px",
                              borderRadius: 10,
                              fontSize: 10,
                              fontWeight: 700,
                              backgroundColor: "#E8F6FE",
                              color: BLUE,
                            }}
                          >
                            Latest
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: MID_GRAY }}>
                        {savedDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {savedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {!isLatest && (
                      <button
                        onClick={() => onRestoreVersion(version)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "transparent",
                          color: NAVY,
                          border: `1.5px solid ${BORDER}`,
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "'Lato', sans-serif",
                          flexShrink: 0,
                        }}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            padding: "14px 24px",
            borderTop: `1px solid ${BORDER}`,
            fontSize: 12,
            color: MID_GRAY,
            lineHeight: 1.5,
          }}
        >
          Restoring a version replaces current editable content. Diagnostic truth is never modified.
        </div>
      </div>
    </>
  );
}
