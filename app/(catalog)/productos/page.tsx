import type { Metadata } from 'next'
import ProductosClient from '@/components/catalog/ProductosClient'
import { buildMetadata } from '@/lib/seo'
import { getSiteConfig, getSiteName } from '@/lib/site-config'
import { getCategoriasActivas } from '@/lib/catalog-data'
import {
  getCatalogProductosPage,
  type CatalogOrden,
} from '@/lib/catalog-productos'
import { rethrowIfNextControlFlowError } from '@/lib/next-errors'

/** Cache de listado público — reduce re-fetch a Supabase. */
export const revalidate = 60

const ORDENES: CatalogOrden[] = ['relevancia', 'precio-asc', 'precio-desc', 'nombre']

function parseOrden(raw?: string): CatalogOrden {
  if (raw && ORDENES.includes(raw as CatalogOrden)) return raw as CatalogOrden
  return 'relevancia'
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; marca?: string }>
}): Promise<Metadata> {
  const { q, categoria } = await searchParams
  const config = await getSiteConfig()
  const siteName = getSiteName(config)
  const query = q?.trim()
  const categorySlug = categoria?.trim()
  const hasFilters = Boolean(query || categorySlug)

  let title = 'Catálogo detal'
  let description = `Explora el catálogo detal de belleza y cuidado capilar de ${siteName}. Envíos a toda Colombia.`
  let path = '/productos'

  if (query) {
    title = `Detal: "${query}"`
    description = `Productos detal que coinciden con "${query}" en ${siteName}.`
    path = `/productos?q=${encodeURIComponent(query)}`
  } else if (categorySlug) {
    title = 'Detal por categoría'
    description = `Productos detal filtrados por categoría en ${siteName}.`
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
  searchParams: Promise<{
    q?: string
    categoria?: string
    marca?: string
    page?: string
    orden?: string
  }>
}) {
  const { q, categoria, marca, page: pageRaw, orden: ordenRaw } = await searchParams
  const page = Math.max(1, parseInt(pageRaw || '1', 10) || 1)
  const orden = parseOrden(ordenRaw)

  let categorias = await getCategoriasActivas().catch(() => [] as Awaited<ReturnType<typeof getCategoriasActivas>>)
  let productos: Awaited<ReturnType<typeof getCatalogProductosPage>>['productos'] = []
  let totalCount = 0
  let marcasDisponibles: string[] = []
  let resolvedPage = page

  try {
    const result = await getCatalogProductosPage({
      categorias,
      q,
      categoriaSlug: categoria,
      marcas: marca ? marca.split(',') : [],
      page,
      orden,
      catalogType: 'detal',
    })
    productos = result.productos
    totalCount = result.total
    marcasDisponibles = result.marcasDisponibles
    resolvedPage = result.page
  } catch (error) {
    rethrowIfNextControlFlowError(error)
    console.error('[ProductosPage] Error cargando datos:', error)
  }

  return (
    <ProductosClient
      productos={productos}
      totalCount={totalCount}
      marcasDisponibles={marcasDisponibles}
      categorias={categorias}
      initialQ={q || ''}
      initialCategoria={categoria || ''}
      initialMarca={marca || ''}
      initialPage={resolvedPage}
      initialOrden={orden}
    />
  )
}
