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
  title: 'Brand Snapshot Suite™ | Wunderbar Digital',
  description: 'Get your Brand Alignment Score™ — a free, AI-powered brand diagnostic across positioning, messaging, visibility, credibility, and conversion. Takes 15 minutes.',
  icons: {
    icon: 'https://d268zs2sdbzvo0.cloudfront.net/686d29d32ebdbfce1f9108ac_01d9e17c-ffc3-4ce2-82e7-6949834d7f2a_favicon.png',
    shortcut: 'https://d268zs2sdbzvo0.cloudfront.net/686d29d32ebdbfce1f9108ac_01d9e17c-ffc3-4ce2-82e7-6949834d7f2a_favicon.png',
    apple: 'https://d268zs2sdbzvo0.cloudfront.net/686d29d32ebdbfce1f9108ac_01d9e17c-ffc3-4ce2-82e7-6949834d7f2a_favicon.png',
  },
  openGraph: {
    title: 'Brand Snapshot Suite™ | Wunderbar Digital',
    description: 'Get your Brand Alignment Score™ — a free, AI-powered brand diagnostic across positioning, messaging, visibility, credibility, and conversion.',
    url: 'https://app.brandsnapshot.ai',
    siteName: 'Brand Snapshot Suite™',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp',
        width: 1200,
        height: 630,
        alt: 'Brand Snapshot Suite™ by Wunderbar Digital',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand Snapshot Suite™ | Wunderbar Digital',
    description: 'Get your Brand Alignment Score™ — a free, AI-powered brand diagnostic across five core brand pillars.',
    images: ['https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp'],
  },
  metadataBase: new URL('https://app.brandsnapshot.ai'),
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
              
              // Force ALL external links to open in a new window
              document.addEventListener("click", function(e) {
                var anchor = e.target.closest ? e.target.closest("a[href]") : null;
                if (!anchor) return;
                var href = anchor.getAttribute("href") || "";
                // Check if it's an external link (starts with http and not our own domain)
                if (href.match(/^https?:\\/\\//i) && !href.includes(window.location.hostname)) {
                  e.preventDefault();
                  window.open(href, "_blank", "noopener,noreferrer");
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
        <WunderbarHeader />
        {children}
        <WunderbarFooter />
      </body>
    </html>
  )
}

