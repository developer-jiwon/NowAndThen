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
      { src: '/icons/nowandthen-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
    ],
  }
}


