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
    theme_color: '#FFFFFF',
    orientation: 'portrait',
    categories: ['productivity', 'utilities'],
    lang: 'ko',
    dir: 'ltr',
    prefer_related_applications: false,
    // 모바일 PWA 최적화
    edge_side_panel: {
      preferred_width: 400
    },
    shortcuts: [
      {
        name: 'Add Timer',
        short_name: 'Add',
        description: 'Add a new countdown timer',
        url: '/?action=add',
        icons: [{ src: '/icons/nowandthen-icon.svg', sizes: '96x96' }]
      }
    ],
    icons: [
      { src: '/icons/nowandthen-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/nowandthen-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      { src: '/apple-touch-icon-180.png', sizes: '180x180', type: 'image/png' },
      { src: '/apple-touch-icon-167.png', sizes: '167x167', type: 'image/png' },
      { src: '/apple-touch-icon-152.png', sizes: '152x152', type: 'image/png' },
      { src: '/apple-touch-icon-120.png', sizes: '120x120', type: 'image/png' },
    ],
  }
}


