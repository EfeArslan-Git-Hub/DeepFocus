import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Strict mode aktif — React çift render ile hataları erkenden yakalar
  reactStrictMode: true,

  // Güvenlik için X-DNS-Prefetch-Control header'ı
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },

  // Dış domain resimlerine izin ver (tema görselleri için)
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
