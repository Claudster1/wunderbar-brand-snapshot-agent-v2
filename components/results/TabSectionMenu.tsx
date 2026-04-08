"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import {
  SUITE_BLUE,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_SECTION_ACTIVE,
  SUITE_SECTION_ACTIVE_BG,
  SUITE_SECTION_ACTIVE_BORDER,
} from "@/components/results/suiteBrandTokens";

export interface TabSectionMenuItem {
  id: string;
  label: string;
  icon?: string;
  /** When set, follow this link instead of scrolling to an element with `id`. */
  href?: string;
}

export interface TabSectionMenuProps {
  title: string;
  items: TabSectionMenuItem[];
  /** Horizontal chips (default) or sticky left column navigation */
  variant?: "chips" | "sidebar";
  /** One line under the title (chips row only—avoids repeating next to the sidebar). */
  description?: string;
  /** Section id currently in view (scroll spy from TabPageWithSidebar). */
  activeSectionId?: string | null;
  /**
   * Leading SVG glyphs per item. Default true — quick visual anchors for similar labels.
   * Set false for a text-only nav.
   */
  showIcons?: boolean;
}

const BORDER = SUITE_BORDER;
const NAVY = SUITE_NAVY;
const MID = SUITE_MUTED;
const SKY = SUITE_BLUE;

const CHIP_ICON_PX = 18;

function iconStrokeIcon(children: ReactNode) {
  return (
    <svg viewBox="0 0 16 16" width={CHIP_ICON_PX} height={CHIP_ICON_PX} fill="none" aria-hidden>
      {children}
    </svg>
  );
}

function resolveIconGlyph(icon: string | undefined, label: string): ReactNode {
  const token = (icon || "").toUpperCase();
  const map: Record<string, ReactNode> = {
    OV: iconStrokeIcon(
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 8 L12 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    SO: iconStrokeIcon(
      <>
        <path d="M3 13V9M8 13V6M13 13V3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    BP: iconStrokeIcon(
      <>
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    PA: iconStrokeIcon(
      <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
    CC: iconStrokeIcon(
      <>
        <rect x="2.5" y="2.5" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8.5" y="2.5" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="2.5" y="8.5" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8.5" y="8.5" width="5" height="5" stroke="currentColor" strokeWidth="1.2" />
      </>
    ),
    IM: iconStrokeIcon(
      <>
        <path d="M3 11l2 2 8-8-2-2-8 8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M2.5 13.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    NS: iconStrokeIcon(
      <path d="M3 8h10M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    ),
    PO: iconStrokeIcon(
      <>
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      </>
    ),
    IC: iconStrokeIcon(
      <>
        <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="11" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2.5 13c.7-2 2-3 3.5-3s2.8 1 3.5 3M8.5 13c.5-1.6 1.6-2.5 2.8-2.5S13.5 11.4 14 13" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </>
    ),
    MS: iconStrokeIcon(
      <>
        <path d="M2.5 3.5h11v7h-7L3.5 13V10.5h-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </>
    ),
    AV: iconStrokeIcon(
      <>
        <rect x="6" y="3" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4 8a4 4 0 0 0 8 0M8 12v2M6.5 14h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
    BS: iconStrokeIcon(
      <>
        <path d="M3.5 3.5h4a2 2 0 0 1 2 2v7a2 2 0 0 0-2-2h-4zM12.5 3.5h-4a2 2 0 0 0-2 2v7a2 2 0 0 1 2-2h4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </>
    ),
    VD: iconStrokeIcon(
      <>
        <path d="M8 2.8a5.2 5.2 0 1 0 5.2 5.2c0 .9-.7 1.6-1.6 1.6H10a1.6 1.6 0 0 0-1.6 1.6c0 .9-.7 1.6-1.6 1.6A5.2 5.2 0 0 1 8 2.8z" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="5.2" cy="7" r=".8" fill="currentColor" />
        <circle cx="7.2" cy="5.6" r=".8" fill="currentColor" />
      </>
    ),
    "90": iconStrokeIcon(
      <>
        <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 2.5v2M11 2.5v2M2.5 6.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
    VS: iconStrokeIcon(
      <>
        <path d="M6 3.5h4v4c0 2-1.6 3.6-3.6 3.6H6z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 7.5a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
    CD: iconStrokeIcon(
      <>
        <rect x="3.5" y="2.5" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
    MB: iconStrokeIcon(
      <>
        <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="6" cy="6.5" r="1" fill="currentColor" />
        <path d="M3.8 11l2.7-2.8 2 1.9 2.4-2.4 1.7 1.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    PP: iconStrokeIcon(
      <>
        <path d="M8 2.8l1.2 2.4L12 6.4l-2 1.9.5 2.8L8 9.8l-2.5 1.3.5-2.8-2-1.9 2.8-1.2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      </>
    ),
    SC: iconStrokeIcon(
      <>
        <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 2.5v2M11 2.5v2M2.5 6.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
    CO: iconStrokeIcon(
      <>
        <path d="M3 5.5l5-2.4 5 2.4v5L8 13 3 10.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M3 5.5l5 2.4 5-2.4" stroke="currentColor" strokeWidth="1.2" />
      </>
    ),
    ST: iconStrokeIcon(
      <>
        <path d="M2.8 8a5.2 5.2 0 1 1 10.4 0" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 6.2v2.2l1.6 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
    AC: iconStrokeIcon(
      <>
        <path d="M8 2.8l2.4 4.8H8.9v3.8H7.1V7.6H5.6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M5.2 12.2h5.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
    RP: iconStrokeIcon(
      <>
        <path d="M3.5 4.5h4v7h-4zM8.5 4.5h4v7h-4z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M3.5 6.8h9" stroke="currentColor" strokeWidth="1.2" />
      </>
    ),
    DT: iconStrokeIcon(
      <>
        <path d="M8 2.8l4 1.6v3.1c0 2.7-1.7 4.6-4 5.7-2.3-1.1-4-3-4-5.7V4.4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </>
    ),
    VH: iconStrokeIcon(
      <>
        <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 5.4v3.1l2 1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
    TY: iconStrokeIcon(
      <>
        <path d="M3 4h10M8 4v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M6 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
    VI: iconStrokeIcon(
      <>
        <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="5.8" cy="6.5" r="1" fill="currentColor" />
        <path d="M3.8 11l2.6-2.5 2 1.7 2.6-2.6 1.2 1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    LD: iconStrokeIcon(
      <>
        <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5.8 8h4.4M8 5.8v4.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
  };
  if (map[token]) return map[token];

  const keyword = label.toLowerCase();
  if (keyword.includes("score")) return map.SO;
  if (keyword.includes("strategy")) return map.ST;
  if (keyword.includes("activation")) return map.AC;
  if (keyword.includes("download")) return iconStrokeIcon(<path d="M8 3v7M5.5 8.5L8 11l2.5-2.5M3 12.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />);
  if (keyword.includes("workbook")) return map.RP;
  if (keyword.includes("voice")) return map.VS;
  if (keyword.includes("visual")) return map.VD;
  if (keyword.includes("schedule")) return map.SC;
  return iconStrokeIcon(<circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />);
}

export default function TabSectionMenu({
  title,
  items,
  variant = "chips",
  description,
  activeSectionId = null,
  showIcons = true,
}: TabSectionMenuProps) {
  if (!items.length) return null;

  function scrollToId(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const isSidebar = variant === "sidebar";

  function navItemStyleFor(item: TabSectionMenuItem): CSSProperties {
    const active = activeSectionId !== null && item.id === activeSectionId;
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: showIcons ? 10 : 0,
      border: active ? `1px solid ${SUITE_SECTION_ACTIVE_BORDER}` : `1px solid ${BORDER}`,
      borderRadius: 5,
      background: active ? SUITE_SECTION_ACTIVE_BG : "#FFFFFF",
      color: NAVY,
      padding: isSidebar ? "8px 10px" : "7px 11px",
      fontSize: 12,
      fontWeight: active ? 800 : 700,
      cursor: "pointer",
      fontFamily: "'Lato', sans-serif",
      boxShadow: isSidebar
        ? active
          ? "0 1px 0 rgba(5, 95, 70, 0.08)"
          : "none"
        : active
          ? "0 2px 10px rgba(5, 95, 70, 0.14)"
          : "0 2px 8px rgba(2,24,89,0.1)",
      width: isSidebar ? "100%" : undefined,
      justifyContent: isSidebar ? "flex-start" : undefined,
      textAlign: "left",
      textDecoration: "none",
      boxSizing: "border-box",
    };
  }

  const buttonBase = (item: TabSectionMenuItem) => {
    const style = navItemStyleFor(item);
    const isActive = activeSectionId !== null && item.id === activeSectionId;
    const inner = (
      <>
        {showIcons ? (
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: isActive ? SUITE_SECTION_ACTIVE : SKY,
              opacity: isActive ? 1 : 0.92,
            }}
          >
            {resolveIconGlyph(item.icon, item.label)}
          </span>
        ) : null}
        <span style={{ lineHeight: 1.35 }}>{item.label}</span>
      </>
    );

    if (item.href) {
      return (
        <Link
          key={item.id}
          href={item.href}
          prefetch={false}
          style={style}
          aria-current={isActive ? "location" : undefined}
        >
          {inner}
        </Link>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => scrollToId(item.id)}
        style={style}
        aria-current={isActive ? "location" : undefined}
      >
        {inner}
      </button>
    );
  };

  return (
    <div
      style={{
        marginBottom: isSidebar ? 0 : 18,
        padding: isSidebar ? "12px 12px 14px" : "14px 16px",
        border: isSidebar ? `1px solid ${BORDER}` : `1px solid ${BORDER}`,
        borderRadius: isSidebar ? 8 : 5,
        borderLeft: isSidebar ? `3px solid ${SKY}` : `3px solid ${SKY}`,
        background: isSidebar ? "#FFFFFF" : `${SKY}08`,
        boxShadow: isSidebar ? "0 2px 10px rgba(2,24,89,0.06)" : "0 6px 18px rgba(2,24,89,0.08)",
      }}
    >
      <p
        style={{
          margin: description && !isSidebar ? "0 0 4px" : "0 0 9px",
          fontSize: isSidebar ? 11 : 14,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: MID,
        }}
      >
        {title}
      </p>
      {description && !isSidebar ? (
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 12,
            fontWeight: 600,
            color: MID,
            lineHeight: 1.45,
            maxWidth: 720,
          }}
        >
          {description}
        </p>
      ) : null}
      <div
        style={{
          display: "flex",
          gap: isSidebar ? 6 : 8,
          flexWrap: isSidebar ? "nowrap" : "wrap",
          flexDirection: isSidebar ? "column" : "row",
        }}
      >
        {items.map((item) => buttonBase(item))}
      </div>
    </div>
  );
}
