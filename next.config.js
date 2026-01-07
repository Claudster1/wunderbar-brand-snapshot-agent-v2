/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker builds
  // Note: Vercel will ignore this and use its own optimized build system, so this works for both!
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors https://www.wunderbardigital.com https://wunderbardigital.com *;',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

