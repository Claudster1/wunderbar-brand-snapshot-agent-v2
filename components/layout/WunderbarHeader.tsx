"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

// Routes where the header should be hidden (reports/previews)
const HIDDEN_HEADER_ROUTES = [
  "/preview",
  "/results",
  "/snapshot-plus",
  "/blueprint",
  "/report",
  "/brand-snapshot/results",
];

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

  return (
    <>
      <header className="wunder-header">
        <a href="https://wunderbardigital.com/" className="wunder-logo" target="_blank" rel="noopener noreferrer">
          <img
            src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp"
            alt="Wunderbar Digital"
            width={220}
            height={40}
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="wunder-nav-group">
          <div className="wunder-nav-item">
            <a href="https://wunderbardigital.com/brand-snapshot-suite" className="wunder-nav-link" target="_blank" rel="noopener noreferrer">
              WunderBrand Suite™
            </a>
            <div className="wunder-dropdown">
              <a href="https://wunderbardigital.com/brand-snapshot" target="_blank" rel="noopener noreferrer">WunderBrand Snapshot™ (Free)</a>
              <a href="https://wunderbardigital.com/brand-snapshot-plus" target="_blank" rel="noopener noreferrer">WunderBrand Snapshot+™</a>
              <a href="https://wunderbardigital.com/brand-blueprint" target="_blank" rel="noopener noreferrer">WunderBrand Blueprint™</a>
              <a href="https://wunderbardigital.com/brand-blueprint-plus" target="_blank" rel="noopener noreferrer">WunderBrand Blueprint+™</a>
              <a href="https://wunderbardigital.com/brand-snapshot-suite" className="wunder-dropdown-divider" target="_blank" rel="noopener noreferrer">
                Compare All Products
              </a>
            </div>
          </div>

          <div className="wunder-nav-item">
            <a href="https://wunderbardigital.com/services" className="wunder-nav-link" target="_blank" rel="noopener noreferrer">
              Services
            </a>
            <div className="wunder-dropdown">
              <a href="https://wunderbardigital.com/managed-marketing" target="_blank" rel="noopener noreferrer">Managed Marketing</a>
              <a href="https://wunderbardigital.com/ai-consulting" target="_blank" rel="noopener noreferrer">AI Consulting</a>
            </div>
          </div>

          <a href="https://wunderbardigital.com/how-we-work" className="wunder-nav-link-simple" target="_blank" rel="noopener noreferrer">
            How We Work
          </a>
          <a href="https://wunderbardigital.com/insights" className="wunder-nav-link-simple" target="_blank" rel="noopener noreferrer">
            Insights
          </a>
        </nav>

        {/* Desktop CTAs */}
        <div className="wunder-btn-container">
          <a href="https://wunderbardigital.com/brand-snapshot" className="wunder-btn wunder-btn-solid" target="_blank" rel="noopener noreferrer">
            Start Your Free WunderBrand Snapshot™
          </a>
          <a href="https://wunderbardigital.com/talk-to-an-expert" className="wunder-btn wunder-btn-outline" target="_blank" rel="noopener noreferrer">
            Talk to an Expert
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
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
            src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp"
            alt="Wunderbar Digital"
            width={180}
            height={32}
          />
          <button className="wunder-mobile-close" onClick={closeMenu} aria-label="Close mobile menu">
            ×
          </button>
        </div>

        <div className="wunder-mobile-nav">
          {/* WunderBrand Suite™ Section */}
          <div className="wunder-mobile-section">
            <button
              className={`wunder-mobile-dropdown-btn ${activeDropdown === "suite" ? "active" : ""}`}
              onClick={() => toggleDropdown("suite")}
            >
              WunderBrand Suite™
              <span className="wunder-mobile-arrow">▾</span>
            </button>
            <div className={`wunder-mobile-dropdown-content ${activeDropdown === "suite" ? "active" : ""}`}>
              <a href="https://wunderbardigital.com/brand-snapshot" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>WunderBrand Snapshot™ (Free)</a>
              <a href="https://wunderbardigital.com/brand-snapshot-plus" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>WunderBrand Snapshot+™</a>
              <a href="https://wunderbardigital.com/brand-blueprint" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>WunderBrand Blueprint™</a>
              <a href="https://wunderbardigital.com/brand-blueprint-plus" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>WunderBrand Blueprint+™</a>
              <a href="https://wunderbardigital.com/brand-snapshot-suite" className="wunder-mobile-divider" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                Compare All Products
              </a>
            </div>
          </div>

          {/* Services Section */}
          <div className="wunder-mobile-section">
            <button
              className={`wunder-mobile-dropdown-btn ${activeDropdown === "services" ? "active" : ""}`}
              onClick={() => toggleDropdown("services")}
            >
              Services
              <span className="wunder-mobile-arrow">▾</span>
            </button>
            <div className={`wunder-mobile-dropdown-content ${activeDropdown === "services" ? "active" : ""}`}>
              <a href="https://wunderbardigital.com/managed-marketing" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Managed Marketing</a>
              <a href="https://wunderbardigital.com/ai-consulting" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>AI Consulting</a>
            </div>
          </div>

          {/* Regular Links */}
          <a href="https://wunderbardigital.com/how-we-work" className="wunder-mobile-link" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
            How We Work
          </a>
          <a href="https://wunderbardigital.com/insights" className="wunder-mobile-link" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
            Insights
          </a>

          {/* Mobile CTAs */}
          <div className="wunder-mobile-ctas">
            <a href="https://wunderbardigital.com/brand-snapshot" className="wunder-btn wunder-btn-solid" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
              Start Your Free WunderBrand Snapshot™
            </a>
            <a href="https://wunderbardigital.com/talk-to-an-expert" className="wunder-btn wunder-btn-outline" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
              Talk to an Expert
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
