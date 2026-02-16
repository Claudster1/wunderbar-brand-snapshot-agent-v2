"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ─── */
export interface ReportSection {
  id: string;
  label: string;
  icon?: string;
  group?: string;
  summary?: string; // brief summary for focus mode tooltip
}

interface ReportNavProps {
  sections: ReportSection[];
  accentColor?: string;
  navyColor?: string;
  reportTitle?: string;
}

/* ─── Brand tokens ─── */
const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const BORDER = "#D6DFE8";
const SUB = "#5A6B7E";
const READ_GREEN = "#22C55E";

/* ─── CSS helpers ─── */
function escapeCssId(id: string): string {
  if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(id);
  return id.replace(/([^\w-])/g, "\\$1");
}

/* ─── Storage helpers (keyed by page path) ─── */
function storageKey(suffix: string) {
  if (typeof window === "undefined") return `reportNav_${suffix}`;
  return `reportNav_${suffix}_${window.location.pathname}`;
}

function loadSet(key: string): Set<string> {
  try {
    const data = localStorage.getItem(key);
    if (data) return new Set(JSON.parse(data));
  } catch { /* noop */ }
  return new Set();
}

function saveSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch { /* noop */ }
}

/* ─── Print styles injected once ─── */
const PRINT_STYLE_ID = "report-nav-print-styles";

function injectPrintStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(PRINT_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @media print {
      #report-nav-toggle,
      #report-nav-panel,
      #report-nav-pill,
      #report-nav-progress-bar,
      #report-nav-breadcrumb,
      .report-nav-no-print {
        display: none !important;
      }

      [data-print-always] {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        height: auto !important;
        overflow: visible !important;
      }

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

      [data-print-hide] {
        display: none !important;
      }

      [data-page-break] {
        page-break-before: always;
      }

      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .wunder-header-final,
      .site-footer {
        display: none !important;
      }

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

/* ─── Focus mode style injection ─── */
const FOCUS_STYLE_ID = "report-nav-focus-styles";

function injectFocusStyles(
  sections: ReportSection[],
  expandedInFocus: Set<string>,
  active: boolean,
  accentColor: string,
) {
  if (typeof document === "undefined") return;

  let style = document.getElementById(FOCUS_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = FOCUS_STYLE_ID;
    document.head.appendChild(style);
  }

  if (!active) {
    style.textContent = "";
    return;
  }

  const collapsedIds = sections
    .filter((s) => !expandedInFocus.has(s.id))
    .map((s) => s.id);

  if (collapsedIds.length === 0) {
    style.textContent = "";
    return;
  }

  const selector = collapsedIds.map((id) => `#${escapeCssId(id)}`).join(",\n");
  const afterSelector = collapsedIds.map((id) => `#${escapeCssId(id)}::after`).join(",\n");

  style.textContent = `
    ${selector} {
      max-height: 180px !important;
      overflow: hidden !important;
      position: relative !important;
      cursor: pointer !important;
      transition: max-height 0.4s ease !important;
      border-radius: 8px !important;
    }
    ${afterSelector} {
      content: 'Click to expand' !important;
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 80px !important;
      background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1) 65%) !important;
      display: flex !important;
      align-items: flex-end !important;
      justify-content: center !important;
      padding-bottom: 14px !important;
      font-size: 12px !important;
      color: ${accentColor} !important;
      font-weight: 700 !important;
      font-family: Lato, sans-serif !important;
      letter-spacing: 0.02em !important;
      z-index: 5 !important;
    }
  `;
}

/* ═══════════════════════════════════════════════════════════════
   ReportNav Component
   ═══════════════════════════════════════════════════════════════ */
export default function ReportNav({
  sections,
  accentColor = BLUE,
  navyColor = NAVY,
  reportTitle = "Brand Report",
}: ReportNavProps) {
  /* ── Core state ── */
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ text: string; elementId: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [showBreadcrumb, setShowBreadcrumb] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Enhanced features state ── */
  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(new Set());
  const [focusMode, setFocusMode] = useState(false);
  const [expandedInFocus, setExpandedInFocus] = useState<Set<string>>(new Set());
  const [navFilter, setNavFilter] = useState<"all" | "starred" | "unread">("all");
  const [toast, setToast] = useState<string | null>(null);

  /* ── Build grouped section structure ── */
  const hasGroups = sections.some((s) => s.group);
  const groupOrder: string[] = [];
  const groupedSections: Record<string, ReportSection[]> = {};
  if (hasGroups) {
    sections.forEach((s) => {
      const g = s.group || "Other";
      if (!groupedSections[g]) {
        groupedSections[g] = [];
        groupOrder.push(g);
      }
      groupedSections[g].push(s);
    });
  }

  /* ── Toggle group collapse ── */
  function toggleGroup(group: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  /* ── Auto-expand group containing active section ── */
  useEffect(() => {
    if (!hasGroups || !activeSection) return;
    const activeGroup = sections.find((s) => s.id === activeSection)?.group;
    if (activeGroup && collapsedGroups.has(activeGroup)) {
      setCollapsedGroups((prev) => {
        const next = new Set(prev);
        next.delete(activeGroup);
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  /* ── Prev / Next section navigation ── */
  function goToSection(direction: "prev" | "next") {
    const idx = sections.findIndex((s) => s.id === activeSection);
    const targetIdx = direction === "prev" ? idx - 1 : idx + 1;
    if (targetIdx >= 0 && targetIdx < sections.length) {
      scrollTo(sections[targetIdx].id);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     EFFECTS
     ══════════════════════════════════════════════════════════════ */

  /* ── Inject print styles on mount ── */
  useEffect(() => {
    injectPrintStyles();
  }, []);

  /* ── Load read + bookmarked state from localStorage ── */
  useEffect(() => {
    setReadSections(loadSet(storageKey("read")));
    setBookmarkedSections(loadSet(storageKey("bookmarks")));
  }, []);

  /* ── Persist read sections ── */
  useEffect(() => {
    if (readSections.size > 0) saveSet(storageKey("read"), readSections);
  }, [readSections]);

  /* ── Persist bookmarks ── */
  useEffect(() => {
    saveSet(storageKey("bookmarks"), bookmarkedSections);
  }, [bookmarkedSections]);

  /* ── Deep link: scroll to hash on mount ── */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = decodeURIComponent(hash);
      setTimeout(() => {
        const el = document.getElementById(decoded);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 600);
    }
  }, []);

  /* ── Dwell-time reading tracker (3 s threshold) ── */
  useEffect(() => {
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
              if (!timers.has(section.id)) {
                timers.set(
                  section.id,
                  setTimeout(() => {
                    setReadSections((prev) => {
                      if (prev.has(section.id)) return prev;
                      const next = new Set(prev);
                      next.add(section.id);
                      return next;
                    });
                    timers.delete(section.id);
                  }, 3000),
                );
              }
            } else {
              const timer = timers.get(section.id);
              if (timer) {
                clearTimeout(timer);
                timers.delete(section.id);
              }
            }
          });
        },
        { threshold: [0.25] },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
      timers.forEach((t) => clearTimeout(t));
    };
  }, [sections]);

  /* ── Focus mode: inject/remove CSS ── */
  useEffect(() => {
    injectFocusStyles(sections, expandedInFocus, focusMode, accentColor);
    if (!focusMode) setExpandedInFocus(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMode]);

  useEffect(() => {
    if (focusMode) injectFocusStyles(sections, expandedInFocus, focusMode, accentColor);
  }, [expandedInFocus, sections, focusMode, accentColor]);

  /* ── Focus mode: click to expand collapsed sections ── */
  useEffect(() => {
    if (!focusMode) return;

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      for (const s of sections) {
        if (expandedInFocus.has(s.id)) continue;
        const el = document.getElementById(s.id);
        if (el && el.contains(target)) {
          setExpandedInFocus((prev) => new Set([...prev, s.id]));
          break;
        }
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [focusMode, sections, expandedInFocus]);

  /* ── Onboarding tooltip ── */
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
        { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-80px 0px -40% 0px" },
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

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setIsSearching(true);
        setTimeout(() => searchRef.current?.focus(), 100);
        return;
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsSearching(false);
        setSearchQuery("");
        setSearchResults([]);
        return;
      }

      if (isInput) return;

      if (e.key === "j" || (isOpen && e.key === "ArrowDown")) {
        e.preventDefault();
        goToSection("next");
      } else if (e.key === "k" || (isOpen && e.key === "ArrowUp")) {
        e.preventDefault();
        goToSection("prev");
      } else if (e.key === "f" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setFocusMode((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeSection, sections]);

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

  /* ── Auto-dismiss toast ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  /* ══════════════════════════════════════════════════════════════
     HANDLERS
     ══════════════════════════════════════════════════════════════ */

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
    [sections],
  );

  /* ── Scroll to section (+ deep link hash + focus mode expand) ── */
  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });

    // Update URL hash for deep linking
    if (typeof history !== "undefined") {
      history.replaceState(null, "", `#${id}`);
    }

    // Expand section if in focus mode
    if (focusMode && !expandedInFocus.has(id)) {
      setExpandedInFocus((prev) => new Set([...prev, id]));
    }

    setIsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }

  /* ── Copy deep link ── */
  function copyDeepLink(sectionId: string) {
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
    navigator.clipboard.writeText(url).then(
      () => setToast("Link copied to clipboard"),
      () => setToast("Failed to copy link"),
    );
  }

  /* ── Toggle bookmark ── */
  function toggleBookmark(sectionId: string) {
    setBookmarkedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
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

  /* ── Computed values ── */
  const activeIdx = sections.findIndex((s) => s.id === activeSection);
  const activeSectionLabel = sections.find((s) => s.id === activeSection)?.label || "";
  const readCount = readSections.size;
  const totalCount = sections.length;
  const readPct = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;
  const bookmarkCount = bookmarkedSections.size;

  /* ── Filtered sections for TOC ── */
  let displaySections = sections;
  if (navFilter === "starred") {
    displaySections = sections.filter((s) => bookmarkedSections.has(s.id));
  } else if (navFilter === "unread") {
    displaySections = sections.filter((s) => !readSections.has(s.id));
  }
  if (searchQuery.trim()) {
    displaySections = displaySections.filter((s) =>
      s.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  /* ── Filtered groups (for grouped layout) ── */
  const displayGrouped: Record<string, ReportSection[]> = {};
  const displayGroupOrder: string[] = [];
  if (hasGroups) {
    displaySections.forEach((s) => {
      const g = s.group || "Other";
      if (!displayGrouped[g]) {
        displayGrouped[g] = [];
        displayGroupOrder.push(g);
      }
      displayGrouped[g].push(s);
    });
  }

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ═══ Keyframe animations ═══ */}
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
        @keyframes reportNavToastIn {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes reportNavCheckPop {
          0% { transform: scale(0); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}} />

      {/* ═══ TOAST NOTIFICATION ═══ */}
      {toast && (
        <div
          className="report-nav-no-print"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            background: navyColor,
            color: WHITE,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "Lato, sans-serif",
            zIndex: 10002,
            animation: "reportNavToastIn 0.3s ease-out",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            whiteSpace: "nowrap",
          }}
        >
          {toast}
        </div>
      )}

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

      {/* ═══ STICKY BREADCRUMB BAR ═══ */}
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
          onClick={() => { isOpen ? setIsOpen(false) : openNav(); }}
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
          <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <path d="M3 5h14M3 10h14M3 15h10" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          </svg>

          {activeSection && (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, lineHeight: 1 }}>
                {activeIdx + 1} of {sections.length}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 600, color: navyColor, lineHeight: 1,
                maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {activeSectionLabel}
              </span>
            </>
          )}
        </button>

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Focus mode toggle */}
          <button
            onClick={() => setFocusMode((prev) => !prev)}
            title={focusMode ? "Exit focus mode (F)" : "Focus mode — collapse sections (F)"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 6,
              border: `1px solid ${focusMode ? accentColor : BORDER}`,
              background: focusMode ? `${accentColor}12` : WHITE,
              color: focusMode ? accentColor : SUB,
              fontSize: 12,
              fontWeight: focusMode ? 700 : 500,
              cursor: "pointer",
              fontFamily: "Lato, sans-serif",
              transition: "all 0.2s ease",
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 12, height: 12 }}>
              {focusMode ? (
                <path d="M2 2h12v12H2zM5 6h6M5 8h4M5 10h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              ) : (
                <path d="M2 2h12v12H2zM5 5h6M5 7.5h6M5 10h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              )}
            </svg>
            <span>{focusMode ? "Full" : "Focus"}</span>
          </button>

          {/* Reading progress badge */}
          <div
            title={`${readCount} of ${totalCount} sections read`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 6,
              background: readPct === 100 ? `${READ_GREEN}12` : `${navyColor}06`,
              fontSize: 11,
              fontWeight: 700,
              color: readPct === 100 ? READ_GREEN : SUB,
              fontFamily: "Lato, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {readPct === 100 ? (
              <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                <circle cx="7" cy="7" r="6" fill={READ_GREEN} />
                <path d="M4.5 7l2 2 3.5-3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                <circle cx="7" cy="7" r="5.5" stroke={SUB} strokeWidth="1" strokeDasharray="3 2" />
                <text x="7" y="10" textAnchor="middle" fontSize="7" fontWeight="700" fill={SUB}>
                  {readCount}
                </text>
              </svg>
            )}
            <span>{readPct}%</span>
          </div>

          {/* Prev / Next section arrows */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <button
              onClick={() => goToSection("prev")}
              disabled={activeIdx <= 0}
              title="Previous section (K)"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 6,
                border: `1px solid ${BORDER}`, background: WHITE,
                cursor: activeIdx <= 0 ? "default" : "pointer",
                padding: 0, opacity: activeIdx <= 0 ? 0.35 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
                <path d="M10 3L5 8l5 5" stroke={SUB} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => goToSection("next")}
              disabled={activeIdx >= sections.length - 1}
              title="Next section (J)"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 6,
                border: `1px solid ${BORDER}`, background: WHITE,
                cursor: activeIdx >= sections.length - 1 ? "default" : "pointer",
                padding: 0, opacity: activeIdx >= sections.length - 1 ? 0.35 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
                <path d="M6 3l5 5-5 5" stroke={SUB} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Search shortcut */}
          <button
            onClick={() => {
              setIsOpen(true);
              setIsSearching(true);
              setTimeout(() => searchRef.current?.focus(), 100);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 6,
              border: `1px solid ${BORDER}`, background: WHITE,
              color: SUB, fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "Lato, sans-serif",
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 12, height: 12 }}>
              <circle cx="7" cy="7" r="5" stroke={SUB} strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke={SUB} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Search</span>
            <span style={{ fontSize: 10, color: `${SUB}80`, marginLeft: 2 }}>&#8984;K</span>
          </button>

          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: 6,
              border: `1px solid ${BORDER}`, background: WHITE,
              cursor: "pointer", padding: 0,
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
        {showTip && !tipDismissed && !isOpen && (
          <>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: "50%", border: `3px solid ${accentColor}`,
              animation: "reportNavPulse 1.5s ease-out infinite", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: "50%", border: `3px solid ${accentColor}`,
              animation: "reportNavPulse 1.5s ease-out infinite 0.5s", pointerEvents: "none",
            }} />
          </>
        )}

        <button
          id="report-nav-toggle"
          onClick={() => {
            const opening = !isOpen;
            setIsOpen(opening);
            if (opening) { setIsSearching(false); setSearchQuery(""); setSearchResults([]); }
            if (showTip) dismissTip();
          }}
          style={{
            position: "relative", width: 52, height: 52, borderRadius: "50%",
            background: isOpen ? navyColor : accentColor, color: WHITE,
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 20px ${isOpen ? navyColor : accentColor}40`,
            transition: "all 0.25s ease", fontFamily: "Lato, sans-serif",
          }}
          aria-label={isOpen ? "Close report navigation" : "Open report navigation"}
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

          {/* Unread count badge */}
          {!isOpen && readCount < totalCount && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              width: 20, height: 20, borderRadius: "50%",
              background: navyColor, color: WHITE,
              fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${WHITE}`,
              fontFamily: "Lato, sans-serif",
            }}>
              {totalCount - readCount}
            </span>
          )}
        </button>
      </div>

      {/* ═══ ONBOARDING TOOLTIP ═══ */}
      {showTip && !tipDismissed && !isOpen && (
        <div
          className="report-nav-no-print"
          onClick={dismissTip}
          style={{
            position: "fixed", bottom: 140, left: 24, zIndex: 10001,
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            gap: 6, cursor: "pointer", animation: "reportNavTipSlideIn 0.4s ease-out",
          }}
        >
          <div style={{
            background: WHITE, color: navyColor,
            padding: "14px 18px", borderRadius: 10,
            boxShadow: "0 8px 30px rgba(7, 176, 242, 0.18), 0 2px 10px rgba(0,0,0,0.08)",
            border: `1.5px solid ${accentColor}`, maxWidth: 240,
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
              Jump to any section, search content, bookmark, or use focus mode. Keyboard: J/K to navigate, F for focus mode.
            </p>
            <div style={{ fontSize: 11, marginTop: 8, opacity: 0.45, fontWeight: 600, color: navyColor }}>
              Click to dismiss &middot; &#8984;K to search
            </div>
          </div>
          <div style={{
            width: 0, height: 0,
            borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
            borderTop: `8px solid ${WHITE}`, marginLeft: 18,
            filter: `drop-shadow(0 1px 0 ${accentColor})`,
          }} />
        </div>
      )}

      {/* ═══ DOWNLOAD BUTTON (above toggle) ═══ */}
      <button
        className="report-nav-no-print"
        onClick={handleDownload}
        style={{
          position: "fixed", bottom: 84, left: 24,
          width: 44, height: 44, borderRadius: "50%",
          background: WHITE, color: navyColor,
          border: `1.5px solid ${BORDER}`, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          zIndex: 10000, transition: "all 0.25s ease",
          fontFamily: "Lato, sans-serif",
        }}
        aria-label="Download or print this report"
        title="Download or print this report"
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
          <path d="M12 3v12M12 15l-4-4M12 15l4-4" stroke={navyColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={navyColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ═══ Section indicator pill ═══ */}
      {!isOpen && activeSection && (
        <div
          id="report-nav-pill"
          onClick={openNav}
          style={{
            position: "fixed", bottom: 136, left: 24,
            padding: "6px 14px", borderRadius: 20,
            background: WHITE, border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            fontSize: 12, fontWeight: 700, color: navyColor,
            fontFamily: "Lato, sans-serif", zIndex: 9999,
            maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
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

      {/* ═══ NAVIGATION PANEL ═══ */}
      <div
        id="report-nav-panel"
        ref={panelRef}
        style={{
          position: "fixed", bottom: 84, left: 24,
          width: 360, maxHeight: "calc(100vh - 140px)",
          background: WHITE, borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06)",
          zIndex: 9999, display: "flex", flexDirection: "column",
          overflow: "hidden", fontFamily: "Lato, sans-serif",
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom left",
        }}
      >
        {/* ── Panel header ── */}
        <div style={{ padding: "16px 18px 12px", borderBottom: `1px solid ${BORDER}`, background: LIGHT_BG }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}>
                <path d="M3 4h14M3 8h14M3 12h10M3 16h7" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 900, color: navyColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Report Navigation
              </span>
            </div>
            <span style={{ fontSize: 11, color: SUB, fontWeight: 600 }}>
              {readCount}/{totalCount} read
            </span>
          </div>

          {/* Filter tabs: All / Starred / Unread */}
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {([
              { key: "all" as const, label: "All", count: totalCount },
              { key: "starred" as const, label: "\u2605 Starred", count: bookmarkCount },
              { key: "unread" as const, label: "Unread", count: totalCount - readCount },
            ]).map(({ key, label, count }) => {
              const isActive = navFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setNavFilter(key)}
                  style={{
                    flex: 1,
                    padding: "5px 8px",
                    borderRadius: 6,
                    border: `1px solid ${isActive ? accentColor + "40" : BORDER}`,
                    background: isActive ? `${accentColor}10` : WHITE,
                    color: isActive ? accentColor : SUB,
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    fontFamily: "Lato, sans-serif",
                    transition: "all 0.15s ease",
                  }}
                >
                  {label} <span style={{ opacity: 0.6 }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search input */}
          <div style={{ position: "relative" }}>
            <svg
              viewBox="0 0 20 20" fill="none"
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
                width: "100%", padding: "9px 12px 9px 32px",
                borderRadius: 8,
                border: `1.5px solid ${isSearching && searchQuery ? accentColor + "50" : BORDER}`,
                background: WHITE, fontSize: 13, color: navyColor,
                outline: "none", fontFamily: "Lato, sans-serif",
                boxSizing: "border-box", transition: "border-color 0.2s ease",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSearchResults([]); searchRef.current?.focus(); }}
                style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  width: 18, height: 18, borderRadius: "50%",
                  background: `${SUB}20`, border: "none",
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", padding: 0,
                }}
              >
                <svg viewBox="0 0 12 12" fill="none" style={{ width: 8, height: 8 }}>
                  <path d="M2 2l8 8M10 2l-8 8" stroke={SUB} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable TOC content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
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
                    display: "block", width: "100%", textAlign: "left",
                    padding: "8px 12px", borderRadius: 6, border: "none",
                    background: "transparent", cursor: "pointer",
                    fontSize: 13, color: "#1a1a2e", lineHeight: 1.4,
                    fontFamily: "Lato, sans-serif", marginBottom: 2,
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

          {/* Empty bookmarks state */}
          {navFilter === "starred" && displaySections.length === 0 && !searchQuery && (
            <div style={{ padding: "28px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{"\u2606"}</div>
              <div style={{ fontSize: 13, color: SUB, fontWeight: 600 }}>No starred sections yet</div>
              <div style={{ fontSize: 12, color: `${SUB}80`, marginTop: 4 }}>
                Click the star icon next to any section to bookmark it
              </div>
            </div>
          )}

          {/* All read state */}
          {navFilter === "unread" && displaySections.length === 0 && !searchQuery && (
            <div style={{ padding: "28px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{"\u2714"}</div>
              <div style={{ fontSize: 13, color: READ_GREEN, fontWeight: 700 }}>All sections reviewed!</div>
              <div style={{ fontSize: 12, color: `${SUB}80`, marginTop: 4 }}>
                You&apos;ve read through the entire report
              </div>
            </div>
          )}

          {/* Table of contents */}
          {displaySections.length > 0 && (
            <div>
              {!searchQuery && searchResults.length === 0 && (
                <div style={{ padding: "4px 14px 6px", fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Jump to section
                </div>
              )}

              {/* Grouped layout */}
              {hasGroups && !searchQuery ? (
                displayGroupOrder.map((group) => {
                  const groupSecs = displayGrouped[group];
                  if (!groupSecs || groupSecs.length === 0) return null;
                  const isCollapsed = collapsedGroups.has(group);
                  const groupHasActive = groupSecs.some((s) => s.id === activeSection);
                  return (
                    <div key={group} style={{ marginBottom: 2 }}>
                      <button
                        onClick={() => toggleGroup(group)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          width: "100%", textAlign: "left",
                          padding: "7px 14px", border: "none",
                          background: groupHasActive ? `${accentColor}06` : "transparent",
                          cursor: "pointer", fontSize: 11, fontWeight: 800,
                          color: groupHasActive ? accentColor : SUB,
                          fontFamily: "Lato, sans-serif",
                          textTransform: "uppercase", letterSpacing: "0.06em",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <svg
                          viewBox="0 0 10 10" fill="none"
                          style={{
                            width: 8, height: 8, flexShrink: 0,
                            transition: "transform 0.2s ease",
                            transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                          }}
                        >
                          <path d="M2 3l3 3.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ flex: 1 }}>{group}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: `${SUB}80` }}>{groupSecs.length}</span>
                      </button>
                      {!isCollapsed && groupSecs.map((section) => {
                        const isActive = section.id === activeSection;
                        const sectionIdx = sections.findIndex((s) => s.id === section.id);
                        return (
                          <SectionButton
                            key={section.id}
                            section={section}
                            sectionIdx={sectionIdx}
                            isActive={isActive}
                            isRead={readSections.has(section.id)}
                            isBookmarked={bookmarkedSections.has(section.id)}
                            accentColor={accentColor}
                            navyColor={navyColor}
                            onScrollTo={scrollTo}
                            onToggleBookmark={() => toggleBookmark(section.id)}
                            onCopyLink={() => copyDeepLink(section.id)}
                            searchQuery=""
                            indented
                          />
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                /* Flat layout */
                displaySections.map((section) => {
                  const isActive = section.id === activeSection;
                  const sectionIdx = sections.findIndex((s) => s.id === section.id);
                  return (
                    <SectionButton
                      key={section.id}
                      section={section}
                      sectionIdx={sectionIdx}
                      isActive={isActive}
                      isRead={readSections.has(section.id)}
                      isBookmarked={bookmarkedSections.has(section.id)}
                      accentColor={accentColor}
                      navyColor={navyColor}
                      onScrollTo={scrollTo}
                      onToggleBookmark={() => toggleBookmark(section.id)}
                      onCopyLink={() => copyDeepLink(section.id)}
                      searchQuery={searchQuery}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── Panel footer ── */}
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
          {/* Reading progress meter */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 60, height: 4, borderRadius: 2,
                    background: `${navyColor}12`, overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${readPct}%`, height: "100%", borderRadius: 2,
                      background: readPct === 100 ? READ_GREEN : accentColor,
                      transition: "width 0.4s ease, background 0.4s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: readPct === 100 ? READ_GREEN : SUB, fontWeight: 600 }}>
                  {readPct}% read
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 60, height: 4, borderRadius: 2,
                    background: `${navyColor}12`, overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${scrollProgress}%`, height: "100%", borderRadius: 2,
                      background: `${SUB}60`,
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: SUB, fontWeight: 600 }}>
                  {Math.round(scrollProgress)}% scrolled
                </span>
              </div>
            </div>
          </div>

          {/* Download + Back to top */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={handleDownload}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 5,
                border: `1px solid ${navyColor}25`, background: `${navyColor}08`,
                color: navyColor, fontSize: 11, fontWeight: 700,
                cursor: "pointer", fontFamily: "Lato, sans-serif",
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
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 5,
                border: `1px solid ${BORDER}`, background: WHITE,
                color: SUB, fontSize: 11, fontWeight: 600,
                cursor: "pointer", fontFamily: "Lato, sans-serif",
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 10, height: 10 }}>
                <path d="M8 12V4M4 7l4-4 4 4" stroke={SUB} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Top
            </button>
          </div>
        </div>

        {/* ── Keyboard shortcut hint ── */}
        <div style={{
          padding: "6px 14px",
          borderTop: `1px solid ${BORDER}`,
          background: `${LIGHT_BG}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}>
          {[
            { keys: "J / K", label: "navigate" },
            { keys: "F", label: "focus" },
            { keys: "\u2318K", label: "search" },
            { keys: "Esc", label: "close" },
          ].map(({ keys, label }) => (
            <span key={keys} style={{ fontSize: 10, color: `${SUB}90`, fontFamily: "Lato, sans-serif" }}>
              <span style={{
                padding: "1px 4px", borderRadius: 3,
                background: `${navyColor}08`, border: `1px solid ${BORDER}`,
                fontSize: 9, fontWeight: 700, color: SUB,
                fontFamily: "'SF Mono', Monaco, monospace",
              }}>
                {keys}
              </span>
              {" "}{label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SectionButton — used in both flat and grouped layouts
   ═══════════════════════════════════════════════════════════════ */
function SectionButton({
  section,
  sectionIdx,
  isActive,
  isRead,
  isBookmarked,
  accentColor,
  navyColor,
  onScrollTo,
  onToggleBookmark,
  onCopyLink,
  searchQuery,
  indented,
}: {
  section: ReportSection;
  sectionIdx: number;
  isActive: boolean;
  isRead: boolean;
  isBookmarked: boolean;
  accentColor: string;
  navyColor: string;
  onScrollTo: (id: string) => void;
  onToggleBookmark: () => void;
  onCopyLink: () => void;
  searchQuery: string;
  indented?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Main section button */}
      <button
        onClick={() => onScrollTo(section.id)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flex: 1,
          textAlign: "left" as const,
          padding: indented ? "6px 14px 6px 28px" : "8px 14px",
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
        {/* Number / read check badge */}
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: isRead ? READ_GREEN : isActive ? accentColor : `${navyColor}08`,
            color: isRead || isActive ? "#fff" : "#5A6B7E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isRead ? 11 : 10,
            fontWeight: 700,
            flexShrink: 0,
            transition: "all 0.3s ease",
          }}
        >
          {isRead ? (
            <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10 }}>
              <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            sectionIdx + 1
          )}
        </span>

        {/* Label */}
        <span style={{ flex: 1, lineHeight: 1.3 }}>
          {searchQuery ? (
            <HighlightText text={section.label} query={searchQuery} color={accentColor} />
          ) : (
            section.label
          )}
        </span>

        {/* Active dot */}
        {isActive && !hovered && (
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: accentColor, flexShrink: 0,
          }} />
        )}
      </button>

      {/* Action icons (visible on hover) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          paddingRight: 10,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s ease",
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        {/* Bookmark star */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this section"}
          style={{
            width: 24, height: 24, borderRadius: 4,
            border: "none", background: "transparent",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            padding: 0, transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = `${accentColor}12`; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {isBookmarked ? (
            <svg viewBox="0 0 16 16" style={{ width: 13, height: 13 }}>
              <path d="M8 1.5l2 4 4.5.7-3.2 3.1.8 4.5L8 11.5l-4.1 2.3.8-4.5L1.5 6.2 6 5.5z" fill="#EAB308" stroke="#EAB308" strokeWidth="0.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 13, height: 13 }}>
              <path d="M8 1.5l2 4 4.5.7-3.2 3.1.8 4.5L8 11.5l-4.1 2.3.8-4.5L1.5 6.2 6 5.5z" stroke={SUB} strokeWidth="1" />
            </svg>
          )}
        </button>

        {/* Copy link */}
        <button
          onClick={(e) => { e.stopPropagation(); onCopyLink(); }}
          title="Copy link to this section"
          style={{
            width: 24, height: 24, borderRadius: 4,
            border: "none", background: "transparent",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            padding: 0, transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = `${accentColor}12`; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 13, height: 13 }}>
            <path d="M6.5 9.5l3-3M5.5 7L4 8.5a2.12 2.12 0 003 3L8.5 10M10.5 9l1.5-1.5a2.12 2.12 0 00-3-3L7.5 6" stroke={SUB} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Persistent bookmark indicator (when not hovered) */}
      {isBookmarked && !hovered && (
        <div style={{ paddingRight: 12 }}>
          <svg viewBox="0 0 16 16" style={{ width: 11, height: 11 }}>
            <path d="M8 1.5l2 4 4.5.7-3.2 3.1.8 4.5L8 11.5l-4.1 2.3.8-4.5L1.5 6.2 6 5.5z" fill="#EAB308" stroke="#EAB308" strokeWidth="0.5" />
          </svg>
        </div>
      )}
    </div>
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
        ),
      )}
    </>
  );
}
