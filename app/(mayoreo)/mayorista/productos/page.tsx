import type { Metadata } from 'next'
import ProductosClient from '@/components/catalog/ProductosClient'
import { buildMetadata } from '@/lib/seo'
import { catalogPath } from '@/lib/catalog'
import { getSiteConfig, getSiteName } from '@/lib/site-config'
import { getCategoriasActivas } from '@/lib/catalog-data'
import {
  getCatalogProductosPage,
  type CatalogOrden,
} from '@/lib/catalog-productos'
import { rethrowIfNextControlFlowError } from '@/lib/next-errors'

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
  const basePath = catalogPath('mayoreo', '/productos')

  let title = 'Catálogo mayorista'
  let description = `Productos de belleza mayoristas en ${siteName}.`
  let path = basePath

  if (query) {
    title = `Mayorista: "${query}"`
    description = `Resultados mayoristas para "${query}" en ${siteName}.`
    path = `${basePath}?q=${encodeURIComponent(query)}`
  } else if (categorySlug) {
    title = 'Mayorista por categoría'
    description = `Productos mayoristas filtrados por categoría en ${siteName}.`
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
      catalogType: 'mayoreo',
    })
    productos = result.productos
    totalCount = result.total
    marcasDisponibles = result.marcasDisponibles
    resolvedPage = result.page
  } catch (error) {
    rethrowIfNextControlFlowError(error)
    console.error('[MayoreoProductosPage] Error cargando datos:', error)
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
      catalogType="mayoreo"
    />
  )
}
