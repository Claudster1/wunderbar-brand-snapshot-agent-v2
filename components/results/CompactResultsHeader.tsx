"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const BORDER = "#E0E8F0";
const MUTED = "#5A6B7E";

interface CompactResultsHeaderProps {
  productName: string;
  companyName: string;
  reportDateIso?: string;
  onGoToDownloads: () => void;
  onHelpClick?: () => void;
}

function formatDate(iso?: string): string {
  if (!iso) return new Date().toLocaleDateString();
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString();
  return date.toLocaleDateString();
}

export default function CompactResultsHeader({
  productName,
  companyName,
  reportDateIso,
  onGoToDownloads,
  onHelpClick,
}: CompactResultsHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const resultsDate = useMemo(() => formatDate(reportDateIso), [reportDateIso]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClick(event: MouseEvent) {
      if (!menuRef.current) return;
      const target = event.target as Node | null;
      if (target && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <header
      className="results-header"
      style={{
        height: 64,
        backgroundColor: "#FFFFFF",
        borderBottom: `1px solid ${BORDER}`,
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 0,
        position: "sticky",
        top: 0,
        zIndex: 300,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingRight: 20,
          borderRight: `1px solid ${BORDER}`,
          marginRight: 20,
          flexShrink: 0,
        }}
      >
        <img
          src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp"
          alt="Wunderbar Digital"
          style={{ height: 28, width: "auto", display: "block" }}
        />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: NAVY, whiteSpace: "nowrap", marginRight: 10 }}>
          {companyName}
        </span>
        <span style={{ fontSize: 12, color: "#CBD5E0", marginRight: 10, flexShrink: 0 }}>·</span>
        <span style={{ fontSize: 12, color: MUTED, whiteSpace: "nowrap", marginRight: 10, flexShrink: 0 }}>
          {resultsDate}
        </span>
        <span style={{ fontSize: 12, color: "#CBD5E0", marginRight: 10, flexShrink: 0 }}>·</span>
        <span style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic", whiteSpace: "nowrap", flexShrink: 0 }}>
          Confidential
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 16 }}>
        <span style={{ width: 1, height: 28, backgroundColor: BORDER, flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: 2 }}>
          <span style={{ fontSize: 13, color: BLUE, fontWeight: 800, whiteSpace: "nowrap", lineHeight: 1.1 }}>
            {productName}
          </span>
          <span style={{ fontSize: 11, color: MUTED, whiteSpace: "nowrap", lineHeight: 1.1, opacity: 0.9 }}>
            Powered by Wunderbar Digital
          </span>
        </div>
        <button
          type="button"
          onClick={
            onHelpClick ??
            (() => window.open("https://wunderbardigital.com/talk-to-an-expert", "_blank", "noopener,noreferrer"))
          }
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            border: `1.5px solid ${BORDER}`,
            borderRadius: 6,
            color: MUTED,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Lato', sans-serif",
          }}
          aria-label="Help"
        >
          ?
        </button>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: menuOpen ? NAVY : "transparent",
              border: `1.5px solid ${menuOpen ? NAVY : BORDER}`,
              borderRadius: 6,
              color: menuOpen ? "#ffffff" : NAVY,
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "all 0.12s",
            }}
            aria-label="More options"
          >
            ···
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                width: 210,
                backgroundColor: "#ffffff",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(2,24,89,0.1)",
                zIndex: 400,
                overflow: "hidden",
              }}
            >
              {[
                { label: "Go to Downloads", icon: "↓", action: onGoToDownloads },
              ].map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.action();
                    setMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: "none",
                    textAlign: "left",
                    fontSize: 14,
                    color: NAVY,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = "#F7F9FC";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span style={{ width: 16, color: MUTED, fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
