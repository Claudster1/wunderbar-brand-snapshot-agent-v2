"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Routes where the footer should be hidden (reports/previews)
const HIDDEN_FOOTER_ROUTES = [
  "/preview",
  "/results",
  "/snapshot-plus",
  "/blueprint",
  "/report",
  "/brand-snapshot/results",
];

export function WunderbarFooter() {
  const pathname = usePathname();
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Check if footer should be hidden on current route
  const shouldHideFooter = HIDDEN_FOOTER_ROUTES.some(route => pathname?.startsWith(route));

  // Don't render footer on report pages
  if (shouldHideFooter) {
    return null;
  }

  return (
    <footer className="wunder-footer">
      <div className="wunder-footer-container">
        <div className="wunder-footer-top">
          <div className="wunder-footer-brand-row">
            <a href="https://wunderbardigital.com/" className="wunder-footer-brand" aria-label="Wunderbar Digital home" target="_blank" rel="noopener noreferrer">
              Wunderbar Digital
            </a>
          </div>
          <nav className="wunder-footer-nav" aria-label="Footer">
            {/* Company */}
            <div className="wunder-footer-col">
              <h3>Company</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/about" target="_blank" rel="noopener noreferrer">About</a></li>
                <li><a href="https://wunderbardigital.com/connect" target="_blank" rel="noopener noreferrer">Connect</a></li>
              </ul>
            </div>

            {/* Products */}
            <div className="wunder-footer-col">
              <h3>Products</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/brand-snapshot" target="_blank" rel="noopener noreferrer">The Brand Snapshot™ (Free)</a></li>
                <li><a href="https://wunderbardigital.com/brand-snapshot-suite" target="_blank" rel="noopener noreferrer">The Brand Snapshot Suite</a></li>
              </ul>
            </div>

            {/* Services */}
            <div className="wunder-footer-col">
              <h3>Services</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/managed-marketing" target="_blank" rel="noopener noreferrer">Managed Marketing</a></li>
                <li><a href="https://wunderbardigital.com/ai-consulting" target="_blank" rel="noopener noreferrer">AI Consulting</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="wunder-footer-col">
              <h3>Resources</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/insights" target="_blank" rel="noopener noreferrer">Insights</a></li>
                <li><a href="https://wunderbardigital.com/faq" target="_blank" rel="noopener noreferrer">FAQs</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="wunder-footer-col">
              <h3>Legal</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
                <li><a href="https://wunderbardigital.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><a href="https://wunderbardigital.com/dmca-policy" target="_blank" rel="noopener noreferrer">DMCA</a></li>
                <li><a href="https://wunderbardigital.com/accessibility-statement" target="_blank" rel="noopener noreferrer">Accessibility</a></li>
                <li><a href="https://wunderbardigital.com/do-not-sell-or-share-my-personal-information" target="_blank" rel="noopener noreferrer">Do Not Sell/Share</a></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="wunder-footer-bottom">
          <p className="wunder-footer-copyright">
            © {year} Wunderbar Digital. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
