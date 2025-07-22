import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
      userAgent: '*',
      allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
      },
      {
        userAgent: 'Googlebot-Mobile',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
    },
    ],
    sitemap: 'https://nowandthen.app/sitemap.xml',
    host: 'https://nowandthen.app',
  }
}