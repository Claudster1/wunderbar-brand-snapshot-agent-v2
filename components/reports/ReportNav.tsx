"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ─── */
export interface ReportSection {
  id: string;
  label: string;
  icon?: string; // emoji or short text
}

interface ReportNavProps {
  sections: ReportSection[];
  accentColor?: string;
  navyColor?: string;
  reportTitle?: string; // for the download filename
}

/* ─── Brand tokens ─── */
const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const BORDER = "#D6DFE8";
const SUB = "#5A6B7E";

/* ─── Print styles injected once ─── */
const PRINT_STYLE_ID = "report-nav-print-styles";

function injectPrintStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(PRINT_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @media print {
      /* ── Hide navigation UI ── */
      #report-nav-toggle,
      #report-nav-panel,
      #report-nav-pill,
      #report-nav-progress-bar,
      #report-nav-breadcrumb,
      .report-nav-no-print {
        display: none !important;
      }

      /* ── Show ALL toggled content (focus areas, archetypes, etc.) ── */
      [data-print-always] {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        height: auto !important;
        overflow: visible !important;
      }

      /* ── Add a label before secondary print-always sections ── */
      [data-print-always][data-print-label]::before {
        content: attr(data-print-label);
        display: block;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #5A6B7E;
        margin-bottom: 8px;
        padding-top: 16px;
        border-top: 1px solid #D6DFE8;
      }

      /* ── Hide interactive toggle buttons in print ── */
      [data-print-hide] {
        display: none !important;
      }

      /* ── Page break helpers ── */
      [data-page-break] {
        page-break-before: always;
      }

      /* ── General print optimizations ── */
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* ── Hide the website header/footer in print ── */
      .wunder-header-final,
      .site-footer {
        display: none !important;
      }

      /* ── Ensure backgrounds print ── */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      @page {
        margin: 0.5in;
        size: letter;
      }
    }
  `;
  document.head.appendChild(style);
}

/* ─── ReportNav Component ─── */
export default function ReportNav({
  sections,
  accentColor = BLUE,
  navyColor = NAVY,
  reportTitle = "Brand Report",
}: ReportNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ text: string; elementId: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [showBreadcrumb, setShowBreadcrumb] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Inject print styles on mount ── */
  useEffect(() => {
    injectPrintStyles();
  }, []);

  /* ── Onboarding tooltip: show after 1.5s, auto-dismiss after 10s ── */
  useEffect(() => {
    const seen = typeof localStorage !== "undefined" && localStorage.getItem("reportNavTipSeen");
    if (seen) {
      setTipDismissed(true);
      return;
    }

    const showTimer = setTimeout(() => setShowTip(true), 1500);
    const hideTimer = setTimeout(() => {
      setShowTip(false);
      setTipDismissed(true);
      try { localStorage.setItem("reportNavTipSeen", "1"); } catch { /* noop */ }
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  /* ── Dismiss tip when nav is opened ── */
  function dismissTip() {
    setShowTip(false);
    setTipDismissed(true);
    try { localStorage.setItem("reportNavTipSeen", "1"); } catch { /* noop */ }
  }

  /* ── Track active section via IntersectionObserver ── */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibleSections = new Map<string, number>();

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleSections.set(section.id, entry.intersectionRatio);
            } else {
              visibleSections.delete(section.id);
            }

            let maxRatio = 0;
            let maxId = "";
            visibleSections.forEach((ratio, id) => {
              if (ratio > maxRatio) {
                maxRatio = ratio;
                maxId = id;
              }
            });
            if (maxId) setActiveSection(maxId);
          });
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-80px 0px -40% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  /* ── Track scroll progress + breadcrumb visibility ── */
  useEffect(() => {
    function onScroll() {
      const winH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const scrollY = window.scrollY;
      const pct = Math.min(scrollY / (docH - winH), 1) * 100;
      setScrollProgress(pct);
      setShowBreadcrumb(scrollY > 200);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Keyboard shortcut: Cmd/Ctrl + K to open search ── */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setIsSearching(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsSearching(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ── Close panel when clicking outside ── */
  useEffect(() => {
    if (!isOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const toggleBtn = document.getElementById("report-nav-toggle");
        if (toggleBtn && toggleBtn.contains(e.target as Node)) return;
        const breadcrumb = document.getElementById("report-nav-breadcrumb");
        if (breadcrumb && breadcrumb.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  /* ── Search within report content ── */
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const results: { text: string; elementId: string }[] = [];
      const lowerQuery = query.toLowerCase();

      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (!el) return;

        if (section.label.toLowerCase().includes(lowerQuery)) {
          results.push({ text: section.label, elementId: section.id });
        }

        const textContent = el.textContent || "";
        const lowerText = textContent.toLowerCase();
        let startIdx = 0;
        let found = 0;

        while (found < 3 && startIdx < lowerText.length) {
          const matchIdx = lowerText.indexOf(lowerQuery, startIdx);
          if (matchIdx === -1) break;

          const contextStart = Math.max(0, matchIdx - 40);
          const contextEnd = Math.min(textContent.length, matchIdx + query.length + 40);
          let snippet = textContent.slice(contextStart, contextEnd).trim();
          if (contextStart > 0) snippet = "..." + snippet;
          if (contextEnd < textContent.length) snippet = snippet + "...";

          if (!section.label.toLowerCase().includes(lowerQuery) || found > 0) {
            results.push({ text: snippet, elementId: section.id });
          }
          found++;
          startIdx = matchIdx + query.length;
        }
      });

      setSearchResults(results.slice(0, 12));
    },
    [sections]
  );

  /* ── Scroll to section ── */
  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
    setIsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }

  /* ── Download / Print ── */
  function handleDownload() {
    window.print();
  }

  /* ── Open nav panel helper ── */
  function openNav() {
    setIsOpen(true);
    setIsSearching(false);
    setSearchQuery("");
    setSearchResults([]);
    if (showTip) dismissTip();
  }

  /* ── Filtered sections for TOC ── */
  const filteredSections = searchQuery.trim()
    ? sections.filter((s) => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : sections;

  /* ── Current section index for progress ── */
  const activeIdx = sections.findIndex((s) => s.id === activeSection);
  const activeSectionLabel = sections.find((s) => s.id === activeSection)?.label || "";

  return (
    <>
      {/* ═══ Shared keyframe animations ═══ */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes reportNavPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes reportNavTipSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes reportNavBreadcrumbIn {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* ═══ PROGRESS BAR (top of viewport) ═══ */}
      <div
        id="report-nav-progress-bar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `${BORDER}60`,
          zIndex: 9998,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${scrollProgress}%`,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}CC)`,
            transition: "width 0.15s ease",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      {/* ═══ STICKY BREADCRUMB BAR (below progress bar, visible after scrolling) ═══ */}
      <div
        id="report-nav-breadcrumb"
        className="report-nav-no-print"
        style={{
          position: "fixed",
          top: 3,
          left: 0,
          right: 0,
          height: 40,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${BORDER}80`,
          zIndex: 9997,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          fontFamily: "Lato, sans-serif",
          opacity: showBreadcrumb ? 1 : 0,
          transform: showBreadcrumb ? "translateY(0)" : "translateY(-100%)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          pointerEvents: showBreadcrumb ? "auto" : "none",
        }}
      >
        {/* Left: nav trigger + section indicator */}
        <button
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              openNav();
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            fontFamily: "Lato, sans-serif",
          }}
        >
          {/* Hamburger icon */}
          <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <path d="M3 5h14M3 10h14M3 15h10" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          </svg>

          {/* Section counter */}
          {activeSection && (
            <>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: accentColor,
                lineHeight: 1,
              }}>
                {activeIdx + 1} of {sections.length}
              </span>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: navyColor,
                lineHeight: 1,
                maxWidth: 280,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {activeSectionLabel}
              </span>
            </>
          )}
        </button>

        {/* Right: search hint + back to top */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => {
              setIsOpen(true);
              setIsSearching(true);
              setTimeout(() => searchRef.current?.focus(), 100);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 6,
              border: `1px solid ${BORDER}`,
              background: WHITE,
              color: SUB,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "Lato, sans-serif",
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 12, height: 12 }}>
              <circle cx="7" cy="7" r="5" stroke={SUB} strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke={SUB} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Search</span>
            <span style={{ fontSize: 10, color: `${SUB}80`, marginLeft: 2 }}>&#8984;K</span>
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1px solid ${BORDER}`,
              background: WHITE,
              cursor: "pointer",
              padding: 0,
            }}
            title="Back to top"
          >
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
              <path d="M8 12V4M4 7l4-4 4 4" stroke={SUB} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ═══ FLOATING TOGGLE BUTTON (bottom-LEFT) ═══ */}
      <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 10000 }}>
        {/* Pulse ring animation (visible when tip is showing) */}
        {showTip && !tipDismissed && !isOpen && (
          <>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: "50%",
              border: `3px solid ${accentColor}`,
              animation: "reportNavPulse 1.5s ease-out infinite",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: "50%",
              border: `3px solid ${accentColor}`,
              animation: "reportNavPulse 1.5s ease-out infinite 0.5s",
              pointerEvents: "none",
            }} />
          </>
        )}

        <button
          id="report-nav-toggle"
          onClick={() => {
            const opening = !isOpen;
            setIsOpen(opening);
            if (opening) {
              setIsSearching(false);
              setSearchQuery("");
              setSearchResults([]);
            }
            if (showTip) dismissTip();
          }}
          style={{
            position: "relative",
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: isOpen ? navyColor : accentColor,
            color: WHITE,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 20px ${isOpen ? navyColor : accentColor}40`,
            transition: "all 0.25s ease",
            fontFamily: "Lato, sans-serif",
          }}
          title={isOpen ? "Close navigation" : "Navigate report (\u2318K to search)"}
        >
          {isOpen ? (
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
              <path d="M18 6L6 18M6 6l12 12" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
              <path d="M4 6h16M4 12h16M4 18h10" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* ═══ ONBOARDING TOOLTIP (bottom-LEFT, above toggle) ═══ */}
      {showTip && !tipDismissed && !isOpen && (
        <div
          className="report-nav-no-print"
          onClick={dismissTip}
          style={{
            position: "fixed",
            bottom: 84,
            left: 24,
            zIndex: 10001,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 6,
            cursor: "pointer",
            animation: "reportNavTipSlideIn 0.4s ease-out",
          }}
        >
          {/* Tooltip card — white bg, navy/blue text */}
          <div style={{
            background: WHITE,
            color: navyColor,
            padding: "14px 18px",
            borderRadius: 10,
            boxShadow: "0 8px 30px rgba(7, 176, 242, 0.18), 0 2px 10px rgba(0,0,0,0.08)",
            border: `1.5px solid ${accentColor}`,
            maxWidth: 240,
            fontFamily: "Lato, sans-serif",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <path d="M3 4h14M3 8h14M3 12h10M3 16h7" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.02em", color: accentColor }}>
                Navigate This Report
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, color: navyColor, opacity: 0.85 }}>
              Jump to any section, search content, or download your report. Click the menu button below.
            </p>
            <div style={{ fontSize: 11, marginTop: 8, opacity: 0.45, fontWeight: 600, color: navyColor }}>
              Click to dismiss &middot; Tip: &#8984;K to search
            </div>
          </div>
          {/* Arrow pointing down to the button */}
          <div style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: `8px solid ${WHITE}`,
            marginLeft: 18,
            filter: `drop-shadow(0 1px 0 ${accentColor})`,
          }} />
        </div>
      )}

      {/* ═══ DOWNLOAD BUTTON (above toggle, bottom-LEFT) ═══ */}
      <button
        className="report-nav-no-print"
        onClick={handleDownload}
        style={{
          position: "fixed",
          bottom: 84,
          left: 24,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: WHITE,
          color: navyColor,
          border: `1.5px solid ${BORDER}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 2px 12px rgba(0,0,0,0.08)`,
          zIndex: 10000,
          transition: "all 0.25s ease",
          fontFamily: "Lato, sans-serif",
        }}
        title="Download or print this report"
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
          <path d="M12 3v12M12 15l-4-4M12 15l4-4" stroke={navyColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={navyColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ═══ Section indicator pill (bottom-LEFT, CLICKABLE to open nav) ═══ */}
      {!isOpen && activeSection && (
        <div
          id="report-nav-pill"
          onClick={openNav}
          style={{
            position: "fixed",
            bottom: 136,
            left: 24,
            padding: "6px 14px",
            borderRadius: 20,
            background: WHITE,
            border: `1px solid ${BORDER}`,
            boxShadow: `0 2px 12px rgba(0,0,0,0.08)`,
            fontSize: 12,
            fontWeight: 700,
            color: navyColor,
            fontFamily: "Lato, sans-serif",
            zIndex: 9999,
            maxWidth: 220,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            opacity: scrollProgress > 5 ? 1 : 0,
            transition: "opacity 0.3s ease, background 0.15s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = LIGHT_BG; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = WHITE; }}
        >
          <span style={{ color: accentColor, marginRight: 6 }}>
            {activeIdx + 1}/{sections.length}
          </span>
          {activeSectionLabel}
        </div>
      )}

      {/* ═══ NAVIGATION PANEL (bottom-LEFT) ═══ */}
      <div
        id="report-nav-panel"
        ref={panelRef}
        style={{
          position: "fixed",
          bottom: 84,
          left: 24,
          width: 340,
          maxHeight: "calc(100vh - 140px)",
          background: WHITE,
          borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "Lato, sans-serif",
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom left",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "16px 18px 12px",
            borderBottom: `1px solid ${BORDER}`,
            background: LIGHT_BG,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                <path d="M3 4h14M3 8h14M3 12h10M3 16h7" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 900, color: navyColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Report Navigation
              </span>
            </div>
            <span style={{ fontSize: 11, color: SUB, fontWeight: 600 }}>
              {sections.length} sections
            </span>
          </div>

          {/* Search input */}
          <div style={{ position: "relative" }}>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14 }}
            >
              <circle cx="8.5" cy="8.5" r="6" stroke={SUB} strokeWidth="1.5" />
              <path d="M13 13l4 4" stroke={SUB} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search report content... (\u2318K)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearching(true)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 32px",
                borderRadius: 8,
                border: `1.5px solid ${isSearching && searchQuery ? accentColor + "50" : BORDER}`,
                background: WHITE,
                fontSize: 13,
                color: navyColor,
                outline: "none",
                fontFamily: "Lato, sans-serif",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  searchRef.current?.focus();
                }}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: `${SUB}20`,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                <svg viewBox="0 0 12 12" fill="none" style={{ width: 8, height: 8 }}>
                  <path d="M2 2l8 8M10 2l-8 8" stroke={SUB} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 0",
          }}
        >
          {/* Search results */}
          {searchQuery && searchResults.length > 0 && (
            <div style={{ padding: "4px 14px 8px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </div>
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(result.elementId)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#1a1a2e",
                    lineHeight: 1.4,
                    fontFamily: "Lato, sans-serif",
                    marginBottom: 2,
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${accentColor}08`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <HighlightText text={result.text} query={searchQuery} color={accentColor} />
                  <div style={{ fontSize: 11, color: SUB, marginTop: 2 }}>
                    in {sections.find((s) => s.id === result.elementId)?.label}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div style={{ padding: "20px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: SUB }}>No results for &ldquo;{searchQuery}&rdquo;</div>
              <div style={{ fontSize: 12, color: `${SUB}80`, marginTop: 4 }}>Try a different search term</div>
            </div>
          )}

          {/* Table of contents */}
          {(!searchQuery || filteredSections.length > 0) && (
            <div>
              {!searchQuery && searchResults.length === 0 && (
                <div style={{ padding: "4px 14px 6px", fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Jump to section
                </div>
              )}
              {filteredSections.map((section) => {
                const isActive = section.id === activeSection;
                const sectionIdx = sections.findIndex((s) => s.id === section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 14px",
                      border: "none",
                      background: isActive ? `${accentColor}10` : "transparent",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? navyColor : "#1a1a2e",
                      fontFamily: "Lato, sans-serif",
                      transition: "all 0.15s ease",
                      borderLeft: isActive ? `3px solid ${accentColor}` : "3px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = `${accentColor}06`;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: isActive ? accentColor : `${navyColor}08`,
                        color: isActive ? WHITE : SUB,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {sectionIdx + 1}
                    </span>
                    <span style={{ flex: 1, lineHeight: 1.3 }}>
                      {searchQuery ? (
                        <HighlightText text={section.label} query={searchQuery} color={accentColor} />
                      ) : (
                        section.label
                      )}
                    </span>
                    {isActive && (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: accentColor,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel footer */}
        <div
          style={{
            padding: "10px 14px",
            borderTop: `1px solid ${BORDER}`,
            background: LIGHT_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 60,
                height: 4,
                borderRadius: 2,
                background: `${navyColor}12`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${scrollProgress}%`,
                  height: "100%",
                  borderRadius: 2,
                  background: accentColor,
                  transition: "width 0.2s ease",
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: SUB, fontWeight: 600 }}>{Math.round(scrollProgress)}%</span>
          </div>

          {/* Download + Back to top */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={handleDownload}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 5,
                border: `1px solid ${navyColor}25`,
                background: `${navyColor}08`,
                color: navyColor,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Lato, sans-serif",
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 10, height: 10 }}>
                <path d="M8 2v8M8 10l-3-3M8 10l3-3" stroke={navyColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 12v1.5a1 1 0 001 1h8a1 1 0 001-1V12" stroke={navyColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 5,
                border: `1px solid ${BORDER}`,
                background: WHITE,
                color: SUB,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Lato, sans-serif",
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 10, height: 10 }}>
                <path d="M8 12V4M4 7l4-4 4 4" stroke={SUB} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Top
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Text highlighter for search ─── */
function HighlightText({ text, query, color }: { text: string; query: string; color: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} style={{ background: `${color}25`, color: color, fontWeight: 700, borderRadius: 2, padding: "0 1px" }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
