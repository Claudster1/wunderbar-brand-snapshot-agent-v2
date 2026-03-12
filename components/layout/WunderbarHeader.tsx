"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const BRAND_LOGO_SRC =
  "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";
const BRAND_LOGO_FALLBACK = "/assets/og/logo-wunderbar.svg";

// Routes where the header should be hidden (reports/previews)
const HIDDEN_HEADER_ROUTES = [
  "/preview",
  "/results",
  "/snapshot-plus/",
  "/report/",
  "/brand-snapshot/results",
];

export function WunderbarHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState(BRAND_LOGO_SRC);

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

  return (
    <>
      <header className="wunder-header-final">
        <a
          href="https://wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_logo&utm_content=app_logo"
          className="wunder-logo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={logoSrc}
            alt="Wunderbar Digital"
            width={220}
            height={29}
            priority
            unoptimized
            style={{ width: 220, height: "auto", display: "block" }}
            onError={() => {
              if (logoSrc !== BRAND_LOGO_FALLBACK) setLogoSrc(BRAND_LOGO_FALLBACK);
            }}
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="wunder-nav-group">
          <div className="wunder-nav-item">
            <a
              href="https://wunderbardigital.com/wunderbrand-suite?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_dropdown_parent&utm_content=app_suite_overview"
              className="wunder-nav-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              WunderBrand Suite™
            </a>
            <div className="wunder-dropdown">
              <a href="https://wunderbardigital.com/wunderbrand-snapshot?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_dropdown_item&utm_content=app_snapshot_free" target="_blank" rel="noopener noreferrer">WunderBrand Snapshot™ (Free)</a>
              <a href="https://wunderbardigital.com/wunderbrand-snapshot-plus?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_dropdown_item&utm_content=app_snapshot_plus" target="_blank" rel="noopener noreferrer">WunderBrand Snapshot+™</a>
              <a href="https://wunderbardigital.com/wunderbrand-blueprint?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_dropdown_item&utm_content=app_blueprint" target="_blank" rel="noopener noreferrer">WunderBrand Blueprint™</a>
              <a href="https://wunderbardigital.com/wunderbrand-blueprint-plus?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_dropdown_item&utm_content=app_blueprint_plus" target="_blank" rel="noopener noreferrer">WunderBrand Blueprint+™</a>
              <a href="https://wunderbardigital.com/wunderbrand-suite?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_dropdown_item&utm_content=app_compare_products" className="wunder-dropdown-divider" target="_blank" rel="noopener noreferrer">
                Compare All Products
              </a>
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

        {/* Desktop CTAs */}
        <div className="wunder-btn-container">
          <a
            href="https://calendly.com/claudine-wunderbardigital/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=header_nav&utm_campaign=nav_cta_secondary&utm_content=app_cta_talk_expert"
            className="btn-base btn-solid"
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
          <Image
            src={logoSrc}
            alt="Wunderbar Digital"
            width={180}
            height={24}
            unoptimized
            style={{ width: 180, height: "auto", display: "block" }}
            onError={() => {
              if (logoSrc !== BRAND_LOGO_FALLBACK) setLogoSrc(BRAND_LOGO_FALLBACK);
            }}
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
              <a href="https://wunderbardigital.com/wunderbrand-snapshot?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=nav_dropdown_item&utm_content=app_snapshot_free" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>WunderBrand Snapshot™ (Free)</a>
              <a href="https://wunderbardigital.com/wunderbrand-snapshot-plus?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=nav_dropdown_item&utm_content=app_snapshot_plus" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>WunderBrand Snapshot+™</a>
              <a href="https://wunderbardigital.com/wunderbrand-blueprint?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=nav_dropdown_item&utm_content=app_blueprint" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>WunderBrand Blueprint™</a>
              <a href="https://wunderbardigital.com/wunderbrand-blueprint-plus?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=nav_dropdown_item&utm_content=app_blueprint_plus" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>WunderBrand Blueprint+™</a>
              <a href="https://wunderbardigital.com/wunderbrand-suite?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=nav_dropdown_item&utm_content=app_compare_products" className="wunder-mobile-divider" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                Compare All Products
              </a>
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

          {/* Mobile CTAs */}
          <div className="wunder-mobile-ctas">
            <a
              href="https://calendly.com/claudine-wunderbardigital/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=header_nav_mobile&utm_campaign=nav_cta_secondary&utm_content=app_cta_talk_expert"
              className="btn-base btn-solid"
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
