import type { Metadata } from 'next'
import { Lato } from 'next/font/google'
import './globals.css'
import { WunderbarHeader } from '@/components/layout/WunderbarHeader'
import { WunderbarFooter } from '@/components/layout/WunderbarFooter'

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
})

export const metadata: Metadata = {
  title: 'WunderBrand Suite™ | Wunderbar Digital',
  description: 'Get your WunderBrand Score™ — a free, AI-powered brand diagnostic across positioning, messaging, visibility, credibility, and conversion. Takes 15 minutes.',
  icons: {
    icon: 'https://d268zs2sdbzvo0.cloudfront.net/686d29d32ebdbfce1f9108ac_01d9e17c-ffc3-4ce2-82e7-6949834d7f2a_favicon.png',
    shortcut: 'https://d268zs2sdbzvo0.cloudfront.net/686d29d32ebdbfce1f9108ac_01d9e17c-ffc3-4ce2-82e7-6949834d7f2a_favicon.png',
    apple: 'https://d268zs2sdbzvo0.cloudfront.net/686d29d32ebdbfce1f9108ac_01d9e17c-ffc3-4ce2-82e7-6949834d7f2a_favicon.png',
  },
  openGraph: {
    title: 'WunderBrand Suite™ | Wunderbar Digital',
    description: 'Get your WunderBrand Score™ — a free, AI-powered brand diagnostic across positioning, messaging, visibility, credibility, and conversion.',
    url: 'https://app.wunderbrand.ai',
    siteName: 'WunderBrand Suite™',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp',
        width: 1200,
        height: 630,
        alt: 'WunderBrand Suite™ by Wunderbar Digital',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WunderBrand Suite™ | Wunderbar Digital',
    description: 'Get your WunderBrand Score™ — a free, AI-powered brand diagnostic across five core brand pillars.',
    images: ['https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp'],
  },
  metadataBase: new URL('https://app.wunderbrand.ai'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={lato.variable}>
      <body className="font-brand antialiased">
        <a href="#main-content" className="sr-only" style={{ position: "absolute", top: 0, left: 0, padding: "8px 16px", background: "#07B0F2", color: "#fff", zIndex: 100000, fontWeight: 700 }}>Skip to main content</a>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(e,t,o,n,p,r,i){
                e.visitorGlobalObjectAlias=n;
                e[e.visitorGlobalObjectAlias]=e[e.visitorGlobalObjectAlias]||function(){
                  (e[e.visitorGlobalObjectAlias].q=e[e.visitorGlobalObjectAlias].q||[]).push(arguments)
                };
                e[e.visitorGlobalObjectAlias].l=(new Date).getTime();
                r=t.createElement("script");
                r.src=o;
                r.async=true;
                i=t.getElementsByTagName("script")[0];
                i.parentNode.insertBefore(r,i)
              })(window,document,"https://diffuser-cdn.app-us1.com/diffuser/diffuser.js","vgo");
              
              // Ensure ALL external links open in a new tab (set attributes, don't block default)
              document.addEventListener("click", function(e) {
                var anchor = e.target.closest ? e.target.closest("a[href]") : null;
                if (!anchor) return;
                var href = anchor.getAttribute("href") || "";
                // If it's an external link, ensure target="_blank" is set
                if (href.match(/^https?:\\/\\//i) && !href.includes(window.location.hostname)) {
                  if (!anchor.getAttribute("target")) {
                    anchor.setAttribute("target", "_blank");
                  }
                  if (!anchor.getAttribute("rel")) {
                    anchor.setAttribute("rel", "noopener noreferrer");
                  }
                  // Let the browser handle navigation naturally — no preventDefault
                }
              });

              // Listen for analytics events and forward to ActiveCampaign
              window.addEventListener("analytics", function(event) {
                if (event.detail && event.detail.event && window.vgo) {
                  try {
                    window.vgo("setTrackByDefault", true);
                    window.vgo("event", event.detail.event, event.detail.payload || {});
                  } catch (err) {
                    console.warn("AC tracking failed:", err);
                  }
                }
              });
            `,
          }}
        />
        <noscript>
          <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'Lato, sans-serif', maxWidth: 600, margin: '0 auto' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#021859', marginBottom: 12 }}>JavaScript Required</h1>
            <p style={{ fontSize: 15, color: '#5A6B7E', lineHeight: 1.6 }}>
              The WunderBrand Suite™ diagnostic requires JavaScript to run. Please enable JavaScript in your browser settings and reload this page.
            </p>
          </div>
        </noscript>
        <WunderbarHeader />
        {children}
        <WunderbarFooter />
      </body>
    </html>
  )
}

