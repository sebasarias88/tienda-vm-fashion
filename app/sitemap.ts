import type { MetadataRoute } from 'next'
import { createSupabasePublic } from '@/lib/supabase-public'
import { catalogPath } from '@/lib/catalog'
import { toAbsoluteUrl } from '@/lib/seo'

/** Regenerated at most once per hour (was rendered on every request). */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabasePublic()

  const { data: productos } = await supabase
    .from('productos')
    .select('slug, updated_at, visible_detal, visible_mayoreo')
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
    const routes: MetadataRoute.Sitemap = []
    if (producto.visible_detal !== false) {
      routes.push({
        url: toAbsoluteUrl(`/productos/${producto.slug}`),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
    if (producto.visible_mayoreo !== false) {
      routes.push({
        url: toAbsoluteUrl(catalogPath('mayoreo', `/productos/${producto.slug}`)),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
    return routes
  })

  return [...staticRoutes, ...productRoutes]
}
