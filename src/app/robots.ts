import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/edit/'],
      },
    ],
    sitemap: 'https://www.agentid.top/sitemap.xml',
  }
}
