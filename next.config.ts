import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
      ],
    },
  ],
}

export default nextConfig
