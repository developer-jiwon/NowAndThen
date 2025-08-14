import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Now & Then - Countdown Timer',
    short_name: 'Now&Then',
    description: 'Professional countdown timer and deadline tracking tool.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#E5C8CD',
    icons: [
      { src: '/icons/nowandthen-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/nowandthen-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      // Provide a set of PNGs. Even if the file is the same, declare common sizes explicitly.
      { src: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png?v=2', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png?v=2', sizes: '256x256', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png?v=2', sizes: '384x384', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'any' }
    ],
  }
}


