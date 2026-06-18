import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import ProductosClient from '@/components/catalog/ProductosClient'
import { buildMetadata } from '@/lib/seo'
import { getSiteConfig, getSiteName } from '@/lib/site-config'
import { withProductoCategorias } from '@/lib/producto-categorias'

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

  let title = 'Catálogo de productos'
  let description = `Explora el catálogo de belleza y cuidado capilar de ${siteName}. Envíos a toda Colombia.`
  let path = '/productos'

  if (query) {
    title = `Resultados para "${query}"`
    description = `Productos que coinciden con "${query}" en ${siteName}.`
    path = `/productos?q=${encodeURIComponent(query)}`
  } else if (categorySlug) {
    title = 'Productos por categoría'
    description = `Productos filtrados por categoría en ${siteName}.`
    path = `/productos?categoria=${encodeURIComponent(categorySlug)}`
  }

  return buildMetadata({
    config,
    title,
    description,
    path,
    noIndex: hasFilters,
  })
}

export default async function ProductosPage({
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
      .select(
        '*, categoria:categorias(id,nombre,slug,padre_id), producto_categorias(categoria_id, categoria:categorias(id,nombre,slug,padre_id))',
      )
      .eq('disponible_detal', true)
      .order('orden', { ascending: true }),
  ])

  return (
    <ProductosClient
      productos={withProductoCategorias(productos)}
      categorias={categorias || []}
      initialQ={q || ''}
      initialCategoria={categoria || ''}
    />
  )
}