import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wunderbar Brand Snapshot Agent',
  description: 'Get your Brand Alignment Score™ with Wundy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
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
        {children}
      </body>
    </html>
  )
}

