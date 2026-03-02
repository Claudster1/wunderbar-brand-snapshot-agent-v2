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
    <>
      <section id="connect" className="social-connect" aria-label="Social media">
        <div className="social-container">
          <a href="https://www.youtube.com/@WunderbarDigitalAI" target="_blank" aria-label="YouTube" rel="noopener noreferrer">
            <i className="fab fa-youtube" />
          </a>
          <a href="https://x.com/wunderbarai" target="_blank" aria-label="X (Twitter)" rel="noopener noreferrer">
            <i className="fab fa-x-twitter" />
          </a>
          <a href="https://www.tiktok.com/@wunderbardigital" target="_blank" aria-label="TikTok" rel="noopener noreferrer">
            <i className="fab fa-tiktok" />
          </a>
          <a href="https://www.linkedin.com/company/wunderbar-digital/" target="_blank" aria-label="LinkedIn" rel="noopener noreferrer">
            <i className="fab fa-linkedin" />
          </a>
          <a href="https://www.facebook.com/profile.php?id=61565609848830&mibextid=LQQJ4d" target="_blank" aria-label="Facebook" rel="noopener noreferrer">
            <i className="fab fa-facebook" />
          </a>
          <a href="https://www.instagram.com/wunderbardigital?igsh=dDF6N21peTRzcmU3&utm_source=qr" target="_blank" aria-label="Instagram" rel="noopener noreferrer">
            <i className="fab fa-instagram" />
          </a>
        </div>
      </section>
      <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">
          <div className="brand-row">
            <a href="https://wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" className="brand-footer" aria-label="Wunderbar Digital home" target="_blank" rel="noopener noreferrer">
              Wunderbar Digital
            </a>
            <p className="brand-descriptor">Brand Clarity for Growing Businesses</p>
          </div>
          <nav className="footer-nav" aria-label="Footer">
            {/* Company */}
            <div className="nav-col">
              <h3>Company</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/about?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">About</a></li>
                <li><a href="https://wunderbardigital.com/connect?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">Contact Us</a></li>
                <li><a href="https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">Talk to an Expert</a></li>
              </ul>
            </div>

            {/* Products */}
            <div className="nav-col">
              <h3>Products</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/wunderbrand-snapshot?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">WunderBrand Snapshot™ (Free)</a></li>
                <li><a href="https://wunderbardigital.com/wunderbrand-suite?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">WunderBrand Suite™</a></li>
              </ul>
            </div>

            {/* Services */}
            <div className="nav-col">
              <h3>Services</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/managed-marketing?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">Managed Marketing</a></li>
                <li><a href="https://wunderbardigital.com/ai-consulting?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">AI Consulting</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="nav-col">
              <h3>Resources</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/insights?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">Insights</a></li>
                <li><a href="https://wunderbardigital.com/faq?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">FAQs</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="nav-col">
              <h3>Legal</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/terms-of-service?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
                <li><a href="https://wunderbardigital.com/privacy-policy?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><a href="https://wunderbardigital.com/dmca-policy?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">DMCA</a></li>
                <li><a href="https://wunderbardigital.com/accessibility-statement?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">Accessibility</a></li>
                <li><a href="https://wunderbardigital.com/do-not-sell-or-share-my-personal-information?utm_source=wunderbrand_app&utm_medium=footer&utm_campaign=site_navigation" target="_blank" rel="noopener noreferrer">Do Not Sell/Share</a></li>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <li><button onClick={() => { if (typeof window !== "undefined" && (window as any).__openCookieSettings) { (window as any).__openCookieSettings(); } }} className="site-footer-cookie-btn" type="button">Cookie Settings</button></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <div className="footer-contact">
            <a href="tel:+16575003620" className="footer-contact-link" aria-label="Call Wunderbar Digital at 657-500-3620">
              <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/>
              </svg>
              657-500-3620
            </a>
            <a href="mailto:hello@wunderbardigital.com" className="footer-contact-link">
              <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              hello@wunderbardigital.com
            </a>
          </div>
          <p className="copyright">
            © {year} Wunderbar Digital. All rights reserved.
          </p>
        </div>
      </div>
      </footer>
    </>
  );
}
