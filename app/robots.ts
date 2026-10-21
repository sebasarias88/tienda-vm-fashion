import type { MetadataRoute } from 'next'
import { toAbsoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/carrito', '/mayorista/carrito'],
      },
    ],
    sitemap: toAbsoluteUrl('/sitemap.xml'),
  }
}
