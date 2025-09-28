import withPWAInit from 'next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'henka-audio-samples',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [200],
        },
      },
    },
    {
      urlPattern: ({ request }) => request.destination === 'audio',
      handler: 'CacheFirst',
      options: {
        cacheName: 'henka-audio-streams',
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 60 * 60 * 24 * 14, // 14 days
        },
        cacheableResponse: {
          statuses: [200],
        },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withPWA(nextConfig)
