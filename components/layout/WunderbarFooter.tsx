"use client";

import { useEffect, useState } from "react";

export function WunderbarFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <>
      <section id="connect" className="social-connect" aria-label="Social media">
        <div className="social-container">
          <a href="https://www.youtube.com/@WunderbarDigitalAI" target="_blank" aria-label="YouTube" rel="noopener noreferrer">
            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.6V8.4L16 12l-6.4 3.6Z" />
            </svg>
          </a>
          <a href="https://x.com/wunderbarai" target="_blank" aria-label="X (Twitter)" rel="noopener noreferrer">
            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M18.9 2h3.4l-7.4 8.5L23.6 22h-6.8l-5.3-7-6.1 7H2l7.9-9.1L.6 2h7l4.8 6.4L18.9 2Zm-1.2 18h1.9L6.6 3.9H4.6L17.7 20Z" />
            </svg>
          </a>
          <a href="https://www.tiktok.com/@wunderbardigital" target="_blank" aria-label="TikTok" rel="noopener noreferrer">
            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M16.5 3c.4 2 1.6 3.7 3.5 4.7v3.1a9.4 9.4 0 0 1-3.5-1v6.1a6 6 0 1 1-5.2-6v3.2a2.8 2.8 0 1 0 2 2.7V3h3.2Z" />
            </svg>
          </a>
          <a href="https://www.linkedin.com/company/wunderbar-digital/" target="_blank" aria-label="LinkedIn" rel="noopener noreferrer">
            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.7 9h4.6v12H2.7V9Zm7.3 0h4.4v1.7h.1c.6-1.1 2.1-2.2 4.2-2.2 4.5 0 5.3 2.8 5.3 6.5V21h-4.6v-5.3c0-1.3 0-2.9-1.9-2.9s-2.2 1.3-2.2 2.8V21H10V9Z" />
            </svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61565609848830&mibextid=LQQJ4d" target="_blank" aria-label="Facebook" rel="noopener noreferrer">
            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M13.5 22v-8h2.7l.4-3h-3.1V9.2c0-.9.3-1.6 1.7-1.6h1.8V4.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.5-4.3 4.3V11H7.4v3h2.7v8h3.4Z" />
            </svg>
          </a>
          <a href="https://www.instagram.com/wunderbardigital?igsh=dDF6N21peTRzcmU3&utm_source=qr" target="_blank" aria-label="Instagram" rel="noopener noreferrer">
            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7Zm11.2 1.7a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z" />
            </svg>
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
