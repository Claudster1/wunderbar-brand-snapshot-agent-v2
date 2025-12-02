/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

