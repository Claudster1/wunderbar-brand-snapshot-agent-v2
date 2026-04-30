"use client";

export function WunderbarFooter() {
  const year = new Date().getFullYear();

  return (
    <>
      <section id="connect" aria-label="Social links">
        <div className="social-container">
          <a href="https://www.youtube.com/@WunderbarDigitalAI" target="_blank" aria-label="YouTube" rel="noopener noreferrer">
            <span className="si si-youtube" aria-hidden="true"></span>
          </a>
          <a href="https://x.com/wunderbarai" target="_blank" aria-label="X (Twitter)" rel="noopener noreferrer">
            <span className="si si-x" aria-hidden="true"></span>
          </a>
          <a href="https://www.tiktok.com/@wunderbardigital" target="_blank" aria-label="TikTok" rel="noopener noreferrer">
            <span className="si si-tiktok" aria-hidden="true"></span>
          </a>
          <a href="https://www.linkedin.com/company/wunderbar-digital/" target="_blank" aria-label="LinkedIn" rel="noopener noreferrer">
            <svg className="si-svg si-linkedin" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.036-1.852-3.036-1.853 0-2.136 1.445-2.136 2.939v5.666H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.369-1.852 3.599 0 4.266 2.368 4.266 5.455v6.288zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zM6.813 20.452H3.862V9h2.951v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61565609848830&mibextid=LQQJ4d" target="_blank" aria-label="Facebook" rel="noopener noreferrer">
            <span className="si si-facebook" aria-hidden="true"></span>
          </a>
          <a href="https://www.instagram.com/wunderbardigital?igsh=dDF6N21peTRzcmU3&utm_source=qr" target="_blank" aria-label="Instagram" rel="noopener noreferrer">
            <span className="si si-instagram" aria-hidden="true"></span>
          </a>
        </div>
      </section>
      <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">
          <div className="brand-row">
            <a href="https://wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_logo&utm_content=footer_logo" className="brand-footer" aria-label="Wunderbar Digital home" target="_blank" rel="noopener noreferrer">
              Wunderbar Digital
            </a>
            <p className="brand-descriptor">Brand Clarity for Growing Businesses</p>
          </div>
          <nav className="footer-nav" aria-label="Footer">
            {/* Company */}
            <div className="nav-col">
              <h3>Company</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/about?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_about" target="_blank" rel="noopener noreferrer">About</a></li>
                <li><a href="https://wunderbardigital.com/connect?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_contact" target="_blank" rel="noopener noreferrer">Contact Us</a></li>
                <li><a href="https://calendly.com/claudine-wunderbardigital/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_cta_secondary&utm_content=footer_talk_expert" target="_blank" rel="noopener noreferrer">Talk to an Expert</a></li>
              </ul>
            </div>

            {/* Products */}
            <div className="nav-col">
              <h3>Products</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/wunderbrand-snapshot?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_snapshot_free" target="_blank" rel="noopener noreferrer">WunderBrand Snapshot™ (Free)</a></li>
                <li><a href="https://wunderbardigital.com/wunderbrand-suite?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_suite_overview" target="_blank" rel="noopener noreferrer">WunderBrand Suite™</a></li>
              </ul>
            </div>

            {/* Services */}
            <div className="nav-col">
              <h3>Services</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/managed-marketing?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_managed_marketing" target="_blank" rel="noopener noreferrer">Managed Marketing</a></li>
                <li><a href="https://wunderbardigital.com/ai-consulting?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_ai_consulting" target="_blank" rel="noopener noreferrer">AI Consulting</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="nav-col">
              <h3>Resources</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/insights?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_insights" target="_blank" rel="noopener noreferrer">Insights</a></li>
                <li><a href="https://wunderbardigital.com/faq?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_faq" target="_blank" rel="noopener noreferrer">FAQs</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="nav-col">
              <h3>Legal</h3>
              <ul>
                <li><a href="https://wunderbardigital.com/terms-of-service?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_terms" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
                <li><a href="https://wunderbardigital.com/privacy-policy?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><a href="https://wunderbardigital.com/dmca-policy?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_dmca" target="_blank" rel="noopener noreferrer">DMCA</a></li>
                <li><a href="https://wunderbardigital.com/accessibility-statement?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_accessibility" target="_blank" rel="noopener noreferrer">Accessibility</a></li>
                <li><a href="https://wunderbardigital.com/do-not-sell-or-share-my-personal-information?utm_source=wunderbrand_app&utm_medium=footer_nav&utm_campaign=nav_link&utm_content=footer_do_not_sell" target="_blank" rel="noopener noreferrer">Do Not Sell/Share</a></li>
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
