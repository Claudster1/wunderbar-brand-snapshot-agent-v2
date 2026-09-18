"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BRAND_LOGO_SRC =
  "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

// Routes where the header should be hidden (reports/previews)
const HIDDEN_HEADER_ROUTES = [
  "/preview",
  "/results",
  "/snapshot-plus/",
  "/report/",
  "/brand-snapshot/results",
];

/** In-app product landings (not checkout — buy CTAs live on each product page). */
const SUITE_NAV = {
  suite: "/brand-suite",
  snapshot: "/brand-snapshot",
  snapshotPlus: "/brand-snapshot/plus",
  blueprint: "/brand-blueprint",
  blueprintPlus: "/brand-blueprint-plus",
  compare: "/brand-suite#compare",
} as const;

export function WunderbarHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Check if header should be hidden on current route
  const shouldHideHeader = HIDDEN_HEADER_ROUTES.some(route => pathname?.startsWith(route));

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Don't render header on report pages
  if (shouldHideHeader) {
    return null;
  }

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  // On Snapshot landing: go straight to diagnostic (matches marketing on-page rewrite).
  const onSnapshotLanding =
    pathname === "/brand-snapshot" || pathname === "/brand-snapshot/";
  const startFreeDesktopHref = onSnapshotLanding
    ? "/?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=free_snapshot&utm_content=header_cta_snapshot_onpage"
    : "/brand-snapshot?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=free_snapshot&utm_content=header_cta_start_free";
  const startFreeMobileHref = onSnapshotLanding
    ? "/?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=free_snapshot&utm_content=mobile_cta_snapshot_onpage"
    : "/brand-snapshot?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=free_snapshot&utm_content=mobile_cta_start_free";

  return (
    <>
      <header className="wunder-header-final">
        <a
          href="https://wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_logo&utm_content=app_logo"
          className="wunder-logo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={BRAND_LOGO_SRC}
            alt="Wunderbar Digital"
            width={220}
            height={29}
            style={{ width: 220, height: "auto", display: "block" }}
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="wunder-nav-group">
          <div className="wunder-nav-item">
            <Link href={SUITE_NAV.suite} className="wunder-nav-link">
              WunderBrand Suite™
            </Link>
            <div className="wunder-dropdown">
              <Link href={SUITE_NAV.snapshot}>WunderBrand Snapshot™ (Free)</Link>
              <Link href={SUITE_NAV.snapshotPlus}>WunderBrand Snapshot+™</Link>
              <Link href={SUITE_NAV.blueprint}>WunderBrand Blueprint™</Link>
              <Link href={SUITE_NAV.blueprintPlus}>WunderBrand Blueprint+™</Link>
              <Link href={SUITE_NAV.compare} className="wunder-dropdown-divider">
                Compare All Products
              </Link>
            </div>
          </div>

          <div className="wunder-nav-item">
            <a href="https://wunderbardigital.com/services?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_dropdown_parent&utm_content=app_services_overview" className="wunder-nav-link" target="_blank" rel="noopener noreferrer">
              Services
            </a>
            <div className="wunder-dropdown">
              <a href="https://wunderbardigital.com/managed-marketing?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_dropdown_item&utm_content=app_managed_marketing" target="_blank" rel="noopener noreferrer">Managed Marketing</a>
              <a href="https://wunderbardigital.com/ai-consulting?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_dropdown_item&utm_content=app_ai_consulting" target="_blank" rel="noopener noreferrer">AI Consulting</a>
            </div>
          </div>

          <a href="https://wunderbardigital.com/how-we-work?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_link&utm_content=app_how_we_work" className="wunder-nav-link" target="_blank" rel="noopener noreferrer">
            How We Work
          </a>
          <a href="https://wunderbardigital.com/insights?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_link&utm_content=app_insights" className="wunder-nav-link" target="_blank" rel="noopener noreferrer">
            Insights
          </a>
        </nav>

        {/* Desktop CTAs — match marketing: Start Free (primary) + Talk (outline) */}
        <div className="wunder-btn-container">
          <Link
            href={startFreeDesktopHref}
            className="btn-base btn-solid"
          >
            Start Your Free WunderBrand Snapshot™
          </Link>
          <a
            href="https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=talk_to_expert&utm_content=app_cta_talk_expert"
            className="btn-base btn-outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Talk to an Expert
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className={`wunder-mobile-toggle ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Mobile Overlay */}
      <div
        className={`wunder-mobile-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={closeMenu}
      />

      {/* Mobile Menu */}
      <nav className={`wunder-mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
        <div className="wunder-mobile-header">
          <img
            src={BRAND_LOGO_SRC}
            alt="Wunderbar Digital"
            width={180}
            height={24}
            style={{ width: 180, height: "auto", display: "block" }}
          />
          <button type="button" className="wunder-mobile-close" onClick={closeMenu} aria-label="Close mobile menu">
            ×
          </button>
        </div>

        <div className="wunder-mobile-nav">
          {/* WunderBrand Suite™ Section */}
          <div className="wunder-mobile-section">
            <button
              type="button"
              className={`wunder-mobile-dropdown-btn ${activeDropdown === "suite" ? "active" : ""}`}
              onClick={() => toggleDropdown("suite")}
            >
              WunderBrand Suite™
              <span className="wunder-mobile-arrow">▾</span>
            </button>
            <div className={`wunder-mobile-dropdown-content ${activeDropdown === "suite" ? "active" : ""}`}>
              <Link href={SUITE_NAV.snapshot} onClick={closeMenu}>WunderBrand Snapshot™ (Free)</Link>
              <Link href={SUITE_NAV.snapshotPlus} onClick={closeMenu}>WunderBrand Snapshot+™</Link>
              <Link href={SUITE_NAV.blueprint} onClick={closeMenu}>WunderBrand Blueprint™</Link>
              <Link href={SUITE_NAV.blueprintPlus} onClick={closeMenu}>WunderBrand Blueprint+™</Link>
              <Link href={SUITE_NAV.compare} className="wunder-mobile-divider" onClick={closeMenu}>
                Compare All Products
              </Link>
            </div>
          </div>

          {/* Services Section */}
          <div className="wunder-mobile-section">
            <button
              type="button"
              className={`wunder-mobile-dropdown-btn ${activeDropdown === "services" ? "active" : ""}`}
              onClick={() => toggleDropdown("services")}
            >
              Services
              <span className="wunder-mobile-arrow">▾</span>
            </button>
            <div className={`wunder-mobile-dropdown-content ${activeDropdown === "services" ? "active" : ""}`}>
              <a href="https://wunderbardigital.com/managed-marketing?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=nav_dropdown_item&utm_content=app_managed_marketing" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Managed Marketing</a>
              <a href="https://wunderbardigital.com/ai-consulting?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=nav_dropdown_item&utm_content=app_ai_consulting" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>AI Consulting</a>
            </div>
          </div>

          {/* Regular Links */}
          <a href="https://wunderbardigital.com/how-we-work?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=nav_link&utm_content=app_how_we_work" className="wunder-mobile-link" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
            How We Work
          </a>
          <a href="https://wunderbardigital.com/insights?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=nav_link&utm_content=app_insights" className="wunder-mobile-link" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
            Insights
          </a>

          {/* Mobile CTAs — match marketing */}
          <div className="wunder-mobile-ctas">
            <Link
              href={startFreeMobileHref}
              className="btn-base btn-solid"
              onClick={closeMenu}
            >
              Start Your Free WunderBrand Snapshot™
            </Link>
            <a
              href="https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=talk_to_expert&utm_content=app_cta_talk_expert"
              className="btn-base btn-outline"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              Talk to an Expert
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
