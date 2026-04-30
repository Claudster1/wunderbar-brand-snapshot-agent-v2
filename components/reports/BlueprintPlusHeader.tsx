"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type HeaderNavItem = {
  id: string;
  label: string;
  href?: string;
};

interface BlueprintPlusHeaderProps {
  productName: string;
  reportId: string;
  userEmail?: string;
  utmMedium: string;
  navItems?: HeaderNavItem[];
  activeSectionId?: string;
}

const BRAND_LOGO_SRC =
  "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";
const BRAND_LOGO_FALLBACK = "/assets/og/logo-wunderbar.svg";

export function BlueprintPlusHeader({
  productName,
  reportId,
  utmMedium,
  navItems = [],
  activeSectionId: activeSectionIdProp,
}: BlueprintPlusHeaderProps) {
  const hasSectionNav = navItems.length > 0;
  const routeNavMode = hasSectionNav && navItems.some((item) => Boolean(item.href));
  const [activeSectionId, setActiveSectionId] = useState(
    activeSectionIdProp || navItems[0]?.id || "",
  );
  const [logoSrc, setLogoSrc] = useState(BRAND_LOGO_SRC);

  useEffect(() => {
    if (routeNavMode) {
      setActiveSectionId(activeSectionIdProp || navItems[0]?.id || "");
      return;
    }
    if (!hasSectionNav) return;
    const firstSection = navItems[0]?.id || "";
    const hashSection = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    const validHash = navItems.some((item) => item.id === hashSection);
    setActiveSectionId(validHash ? hashSection : firstSection);
  }, [hasSectionNav, navItems, routeNavMode, activeSectionIdProp]);

  useEffect(() => {
    if (routeNavMode) return;
    if (!hasSectionNav) return;

    const sectionIds = navItems.map((item) => item.id);

    const updateActiveSection = () => {
      let current = sectionIds[0] || "";
      const offset = 160;

      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (!section) continue;
        const top = section.getBoundingClientRect().top;
        if (top - offset <= 0) {
          current = id;
        }
      }

      if (current) {
        setActiveSectionId((prev) => (prev === current ? prev : current));
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [hasSectionNav, navItems, routeNavMode]);

  function handleNavClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) {
    if (routeNavMode) return;
    const section = document.getElementById(sectionId);
    if (!section) return;

    event.preventDefault();
    setActiveSectionId(sectionId);
    const y = section.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });

    if (typeof history !== "undefined") {
      history.replaceState(null, "", `#${sectionId}`);
    }
  }

  const activeIndex = navItems.findIndex((item) => item.id === activeSectionId);
  const prevItem = activeIndex > 0 ? navItems[activeIndex - 1] : null;
  const nextItem =
    activeIndex >= 0 && activeIndex < navItems.length - 1 ? navItems[activeIndex + 1] : null;

  return (
    <section className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-brand-border">
        <a
          href={`https://wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=${utmMedium}&utm_campaign=brand_navigation&utm_content=report_header_logo`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center no-underline"
        >
          <img
            src={logoSrc}
            alt="Wunderbar Digital"
            width={160}
            height={26}
            style={{ width: 160, height: "auto", display: "block" }}
            onError={() => {
              if (logoSrc !== BRAND_LOGO_FALLBACK) setLogoSrc(BRAND_LOGO_FALLBACK);
            }}
          />
        </a>
        {!hasSectionNav && (
          <div className="flex flex-col items-end text-right">
            <span className="text-base sm:text-lg font-bold text-brand-navy leading-tight">
              {productName}
            </span>
            <span className="text-[11px] sm:text-xs text-brand-muted">
              Powered by <strong className="text-brand-blue">Wunderbar Digital</strong>
            </span>
          </div>
        )}
      </div>

      {hasSectionNav && (
        <div className="px-4 sm:px-5 border-b border-brand-border">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:w-auto">
            <nav className="-mx-1 flex items-center overflow-x-auto pr-1 sm:mx-0 sm:w-auto">
              {navItems.map((item, index) => (
                item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`inline-flex shrink-0 items-center whitespace-nowrap px-3 py-3 text-[11px] sm:text-xs font-bold uppercase tracking-[0.08em] no-underline border-b-2 transition-colors ${
                      item.id === activeSectionId || (!activeSectionId && index === 0)
                        ? "text-brand-navy border-brand-navy"
                        : "text-brand-muted border-transparent hover:text-brand-navy hover:border-brand-blue/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(event) => handleNavClick(event, item.id)}
                    className={`inline-flex shrink-0 items-center whitespace-nowrap px-3 py-3 text-[11px] sm:text-xs font-bold uppercase tracking-[0.08em] no-underline border-b-2 transition-colors ${
                      item.id === activeSectionId || (!activeSectionId && index === 0)
                        ? "text-brand-navy border-brand-navy"
                        : "text-brand-muted border-transparent hover:text-brand-navy hover:border-brand-blue/60"
                    }`}
                  >
                    {item.label}
                  </a>
                )
              ))}
            </nav>
              {routeNavMode && (
                <div className="hidden sm:flex items-center gap-1">
                  {prevItem?.href ? (
                    <Link
                      href={prevItem.href}
                      className="inline-flex items-center px-2 py-1 rounded border border-brand-border text-[11px] font-bold text-brand-muted no-underline hover:text-brand-navy hover:border-brand-blue/40"
                      aria-label={`Previous section: ${prevItem.label}`}
                    >
                      ← Prev
                    </Link>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded border border-brand-border text-[11px] font-bold text-brand-muted/50">
                      ← Prev
                    </span>
                  )}
                  {nextItem?.href ? (
                    <Link
                      href={nextItem.href}
                      className="inline-flex items-center px-2 py-1 rounded border border-brand-border text-[11px] font-bold text-brand-muted no-underline hover:text-brand-navy hover:border-brand-blue/40"
                      aria-label={`Next section: ${nextItem.label}`}
                    >
                      Next →
                    </Link>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded border border-brand-border text-[11px] font-bold text-brand-muted/50">
                      Next →
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-start text-left pb-2 sm:items-end sm:text-right">
              <span className="text-sm sm:text-base font-bold text-brand-navy leading-tight">
                {productName}
              </span>
              <span className="text-[11px] sm:text-xs text-brand-muted">
                Powered by <strong className="text-brand-blue">Wunderbar Digital</strong>
              </span>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
