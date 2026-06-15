import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import ProductosClient from '@/components/catalog/ProductosClient'
import { buildMetadata } from '@/lib/seo'
import { catalogPath } from '@/lib/catalog'
import { getSiteConfig, getSiteName } from '@/lib/site-config'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>
}): Promise<Metadata> {
  const { q, categoria } = await searchParams
  const config = await getSiteConfig()
  const siteName = getSiteName(config)
  const query = q?.trim()
  const categorySlug = categoria?.trim()
  const hasFilters = Boolean(query || categorySlug)
  const basePath = catalogPath('mayoreo', '/productos')

  let title = 'Catálogo al por mayor'
  let description = `Productos de belleza al por mayor en ${siteName}.`
  let path = basePath

  if (query) {
    title = `Mayoreo: "${query}"`
    description = `Resultados al por mayor para "${query}" en ${siteName}.`
    path = `${basePath}?q=${encodeURIComponent(query)}`
  } else if (categorySlug) {
    title = 'Mayoreo por categoría'
    description = `Productos al por mayor filtrados por categoría en ${siteName}.`
    path = `${basePath}?categoria=${encodeURIComponent(categorySlug)}`
  }

  return buildMetadata({
    config,
    title,
    description,
    path,
    noIndex: hasFilters,
  })
}

export default async function MayoreoProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>
}) {
  const { q, categoria } = await searchParams
  const supabase = await createSupabaseServer()

  const [{ data: categorias }, { data: productos }] = await Promise.all([
    supabase
      .from('categorias')
      .select('*, subcategorias:categorias!padre_id(*)')
      .is('padre_id', null)
      .eq('activa', true)
      .order('orden'),
    supabase
      .from('productos')
      .select('*, categoria:categorias(id,nombre,slug,padre_id)')
      .order('orden', { ascending: true }),
  ])

  return (
    <ProductosClient
      productos={productos || []}
      categorias={categorias || []}
      initialQ={q || ''}
      initialCategoria={categoria || ''}
      catalogType="mayoreo"
    />
  )
}
