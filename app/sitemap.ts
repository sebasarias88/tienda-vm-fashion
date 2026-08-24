import type { MetadataRoute } from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import { catalogPath } from '@/lib/catalog'
import { toAbsoluteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServer()

  const { data: productos } = await supabase
    .from('productos')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: toAbsoluteUrl('/productos'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: toAbsoluteUrl('/mayorista'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: toAbsoluteUrl('/mayorista/productos'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]

  const productRoutes: MetadataRoute.Sitemap = (productos ?? []).flatMap(producto => {
    const lastModified = producto.updated_at ? new Date(producto.updated_at) : new Date()
    return [
      {
        url: toAbsoluteUrl(`/productos/${producto.slug}`),
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: toAbsoluteUrl(catalogPath('mayoreo', `/productos/${producto.slug}`)),
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
    ]
  })

  return [...staticRoutes, ...productRoutes]
}
