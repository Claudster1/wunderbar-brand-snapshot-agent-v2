const { withSentryConfig } = require('@sentry/nextjs');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker builds
  // Note: Vercel will ignore this and use its own optimized build system, so this works for both!
  output: 'standalone',

  // ─── Performance Optimizations ───
  // Enable gzip/brotli compression for responses
  compress: true,
  // Remove X-Powered-By header (hides Next.js from attackers)
  poweredByHeader: false,
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60,
  },

  // ─── Security Headers ───
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy — controls what resources the page can load
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self + Stripe + GTM + Cloudflare Turnstile + ActiveCampaign tracking
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://challenges.cloudflare.com https://diffuser-cdn.app-us1.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: http:",
              // Connect: self + Supabase + OpenAI + Stripe + ActiveCampaign + Cloudflare + Slack + Sentry
              "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.stripe.com https://*.api-us1.com https://hooks.slack.com https://*.wunderbardigital.com https://*.wunderbrand.ai https://challenges.cloudflare.com wss://*.supabase.co https://*.ingest.us.sentry.io",
              // Frames: Stripe + Calendly + Turnstile widget
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://calendly.com https://challenges.cloudflare.com",
              "frame-ancestors https://www.wunderbardigital.com https://wunderbardigital.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.stripe.com",
              // Prevent loading as a worker from other origins
              "worker-src 'self' blob:",
            ].join('; '),
          },
          // Prevent MIME-type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information sent with requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Disable unnecessary browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Force HTTPS (Vercel handles this, but good defense-in-depth)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Prevent clickjacking (fallback for older browsers without CSP support)
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent XSS in older browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

// Wrap with Sentry (only active when DSN is configured)
const sentryWebpackPluginOptions = {
  // Suppress source map upload logs in CI
  silent: true,
  // Upload source maps to Sentry for readable stack traces
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only upload source maps in production builds
  disableServerWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  disableClientWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
};

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(withBundleAnalyzer(nextConfig), sentryWebpackPluginOptions)
  : withBundleAnalyzer(nextConfig)

