"use client";

import { useState } from "react";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const BORDER = "#D6DFE8";
const SUB = "#5A6B7E";

const PDF_TYPES = [
  { id: "snapshot", label: "WunderBrand Snapshot™", tier: "Free" },
  { id: "snapshot-plus", label: "WunderBrand Snapshot+™", tier: "$497" },
  { id: "blueprint", label: "WunderBrand Blueprint™", tier: "$997" },
  { id: "blueprint-plus", label: "WunderBrand Blueprint+™", tier: "$2,497" },
  { id: "brand-standards", label: "Brand Standards Guide", tier: "Blueprint+" },
] as const;

export default function PdfPreviewPage() {
  const [activeType, setActiveType] = useState<string>("snapshot");
  const [loading, setLoading] = useState(false);

  const pdfUrl = `/api/preview/pdf?type=${activeType}&t=${Date.now()}`;

  return (
    <div style={{ fontFamily: "'Lato', system-ui, sans-serif", background: "#F4F7FB", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: NAVY,
        color: "#fff",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>PDF Export Preview</h1>
          <p style={{ fontSize: 13, color: "#8BA3CF", margin: 0 }}>
            Preview mode — All documents rendered with Acme Co sample data
          </p>
        </div>
        <a
          href="/preview"
          style={{ fontSize: 13, color: BLUE, textDecoration: "none", fontWeight: 600 }}
        >
          ← All Previews
        </a>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex",
        gap: 0,
        background: "#fff",
        borderBottom: `1px solid ${BORDER}`,
        padding: "0 24px",
        overflowX: "auto",
      }}>
        {PDF_TYPES.map((t) => {
          const isActive = activeType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveType(t.id);
                setLoading(true);
              }}
              style={{
                padding: "14px 20px",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? `3px solid ${BLUE}` : "3px solid transparent",
                color: isActive ? NAVY : SUB,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                fontFamily: "'Lato', system-ui, sans-serif",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {t.label}
              <span style={{
                marginLeft: 6,
                fontSize: 10,
                padding: "2px 6px",
                borderRadius: 4,
                background: isActive ? `${BLUE}15` : "#F0F2F5",
                color: isActive ? BLUE : "#8A97A8",
                fontWeight: 600,
              }}>
                {t.tier}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        background: "#fff",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <span style={{ fontSize: 13, color: SUB }}>
          Viewing: <strong style={{ color: NAVY }}>{PDF_TYPES.find((t) => t.id === activeType)?.label}</strong>
        </span>
        <a
          href={`/api/preview/pdf?type=${activeType}&download=1`}
          style={{
            padding: "8px 16px",
            background: BLUE,
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Download PDF
        </a>
      </div>

      {/* PDF Viewer */}
      <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <div style={{
          width: "100%",
          maxWidth: 900,
          background: "#fff",
          borderRadius: 8,
          border: `1px solid ${BORDER}`,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          {loading && (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: SUB,
              fontSize: 14,
            }}>
              Generating PDF...
            </div>
          )}
          <iframe
            key={activeType}
            src={pdfUrl}
            style={{
              width: "100%",
              height: "calc(100vh - 220px)",
              border: "none",
              display: loading ? "none" : "block",
            }}
            onLoad={() => setLoading(false)}
            title={`PDF Preview: ${activeType}`}
          />
        </div>
      </div>
    </div>
  );
}
