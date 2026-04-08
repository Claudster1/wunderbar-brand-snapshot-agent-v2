"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BACKDROP_BLUR,
  SUITE_BG_CHROME,
  SUITE_BORDER,
  SUITE_CHROME_MUTED,
  SUITE_FONT_UI,
  SUITE_NAVY,
  SUITE_SHADOW_FLOAT,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

const HEADER_HEIGHT = 56;

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
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

  const hairline = "rgba(0, 0, 0, 0.08)";

  return (
    <header
      className="results-header"
      style={{
        height: HEADER_HEIGHT,
        ...SUITE_BACKDROP_BLUR,
        backgroundColor: SUITE_BG_CHROME,
        borderBottom: `1px solid ${hairline}`,
        padding: "0 22px 0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 300,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingRight: 16,
          borderRight: `1px solid ${hairline}`,
          marginRight: 4,
          flexShrink: 0,
        }}
      >
        <img
          src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp"
          alt="Wunderbar Digital"
          style={{ height: 26, width: "auto", display: "block" }}
        />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", overflow: "hidden", minWidth: 0 }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: SUITE_TEXT_PRIMARY,
            whiteSpace: "nowrap",
            marginRight: 10,
            letterSpacing: "-0.02em",
          }}
        >
          {companyName}
        </span>
        <span style={{ fontSize: 12, color: "#D1D1D6", marginRight: 10, flexShrink: 0 }} aria-hidden>
          ·
        </span>
        <span
          style={{
            fontSize: 12,
            color: SUITE_CHROME_MUTED,
            whiteSpace: "nowrap",
            marginRight: 10,
            flexShrink: 0,
            fontWeight: 500,
          }}
        >
          {resultsDate}
        </span>
        <span style={{ fontSize: 12, color: "#D1D1D6", marginRight: 10, flexShrink: 0 }} aria-hidden>
          ·
        </span>
        <span
          style={{
            fontSize: 12,
            color: SUITE_CHROME_MUTED,
            fontWeight: 500,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Confidential
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
        <span style={{ width: 1, height: 24, backgroundColor: hairline, flexShrink: 0 }} aria-hidden />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: 2 }}>
          <span
            style={{
              fontSize: 12,
              color: SUITE_ACCENT_BRIGHT,
              fontWeight: 600,
              whiteSpace: "nowrap",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {productName}
          </span>
          <span
            style={{
              fontSize: 10,
              color: SUITE_CHROME_MUTED,
              whiteSpace: "nowrap",
              lineHeight: 1.2,
              fontWeight: 500,
            }}
          >
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
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            border: "none",
            borderRadius: "50%",
            color: SUITE_CHROME_MUTED,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: SUITE_FONT_UI,
            transition: "background 0.2s ease, color 0.2s ease",
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
              backgroundColor: menuOpen ? SUITE_NAVY : "rgba(0, 0, 0, 0.04)",
              border: "none",
              borderRadius: "50%",
              color: menuOpen ? "#FFFFFF" : SUITE_NAVY,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.12em",
              transition: "background 0.2s ease, color 0.2s ease",
            }}
            aria-label="More options"
            aria-expanded={menuOpen}
          >
            ···
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 220,
                backgroundColor: "#FFFFFF",
                border: `1px solid ${SUITE_BORDER}`,
                borderRadius: 12,
                boxShadow: SUITE_SHADOW_FLOAT,
                zIndex: 400,
                overflow: "hidden",
              }}
            >
              {[{ label: "Go to Downloads", icon: "↓", action: onGoToDownloads }].map((item) => (
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
                    textAlign: "left",
                    fontSize: 14,
                    fontWeight: 500,
                    color: SUITE_TEXT_PRIMARY,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: SUITE_FONT_UI,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.04)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span style={{ width: 16, color: SUITE_CHROME_MUTED, fontSize: 14 }}>{item.icon}</span>
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
